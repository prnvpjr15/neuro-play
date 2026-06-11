import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { Alert, Button, ProgressBar, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

const POSES = [
  { id: "right_up", name: "Right Hand Up" },
  { id: "left_up", name: "Left Hand Up" },
  { id: "both_up", name: "Both Hands Up" },
  { id: "t_pose", name: "Arms Out" },
  { id: "namaste", name: "Hands Together" },
  { id: "low_a", name: "Low A Pose" },
  { id: "salute", name: "Salute" },
];

const SHORT_SUCCESS_PHRASES = [
  "Correct!",
  "Nice!",
  "Good job!",
  "Right!",
  "Got it!",
  "Perfect!",
];

const DETECTION_INTERVAL_MS = 120;
const MIN_CONFIDENCE = 0.28;
const REQUIRED_MATCH_FRAMES = 4;
const LEVEL_TIME_LIMIT_SECONDS = 120;
const LEVEL_TIME_LIMIT_MS = LEVEL_TIME_LIMIT_SECONDS * 1000;

const PENALTY_PER_SECOND = {
  right_up: 2.0,
  left_up:  2.0,
  both_up:  1.5,
  t_pose:   1.5,
  low_a:    1.5,
  salute:   1.0,
  namaste:  1.0,
};

function calculateFinalPoseScore({
  timeTaken_ms,
  poseId,
  matched,
  holdBreaks,
  totalAttempts,
  neverVisible,
  timedOut,
  quickHold,
  isFirstPose,
}) {
  // Rule 1 — camera never saw them properly
  if (neverVisible) return null;

  const seconds = timeTaken_ms / 1000;
  const penalty = PENALTY_PER_SECOND[poseId] ?? 1.5;

  // Rule 6 — first pose grace period (model warmup)
  const effectiveSeconds = isFirstPose
    ? Math.max(0, seconds - 10)
    : seconds;

  // Rule 4 — was in frame, got close, but couldn’t hold
  if (!matched && quickHold) return 25;

  // Rule 3 — timed out but kept trying
  if (!matched && timedOut && totalAttempts >= 3) return 20;

  // Rule 2 — timed out, gave up or never got close
  if (!matched && timedOut) return 10;

  // Rule 5 — successfully matched and held
  if (matched) {
    const base = 100 - (effectiveSeconds * penalty);
    const afterStability = base - (holdBreaks * 8);
    const persistenceBonus = totalAttempts > 3 ? 5 : 0;
    const raw = afterStability + persistenceBonus;
    return Math.round(Math.min(100, Math.max(50, raw)));
  }

  // Fallback
  return 10;
}

const getPoint = (keypoints, name) => keypoints.find((point) => point.name === name);
const isReliable = (point) => point && (point.score ?? 0) >= MIN_CONFIDENCE;

const getPoseGuidePoints = (poseId) => {
  const points = {
    head: [160, 58],
    neck: [160, 96],
    hip: [160, 205],
    leftShoulder: [118, 106],
    rightShoulder: [202, 106],
    leftElbow: [96, 158],
    rightElbow: [224, 158],
    leftHand: [82, 212],
    rightHand: [238, 212],
  };

  switch (poseId) {
    case "right_up":
      points.rightElbow = [220, 64];
      points.rightHand = [222, 18];
      break;
    case "left_up":
      points.leftElbow = [100, 64];
      points.leftHand = [98, 18];
      break;
    case "both_up":
      points.leftElbow = [104, 66];
      points.leftHand = [94, 22];
      points.rightElbow = [216, 66];
      points.rightHand = [226, 22];
      break;
    case "t_pose":
      points.leftElbow = [68, 108];
      points.leftHand = [26, 108];
      points.rightElbow = [252, 108];
      points.rightHand = [294, 108];
      break;
    case "namaste":
      points.leftElbow = [128, 148];
      points.leftHand = [154, 139];
      points.rightElbow = [192, 148];
      points.rightHand = [166, 139];
      break;
    case "low_a":
      points.leftElbow = [98, 178];
      points.leftHand = [58, 246];
      points.rightElbow = [222, 178];
      points.rightHand = [262, 246];
      break;
    case "salute":
      points.rightElbow = [220, 112];
      points.rightHand = [192, 62];
      points.leftElbow = [96, 165];
      points.leftHand = [74, 225];
      break;
    default:
      break;
  }

  return points;
};

const PoseGuide = ({ poseId }) => {
  const p = getPoseGuidePoints(poseId);
  const limbStyle = {
    stroke: "#f8fafc",
    strokeWidth: 18,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const highlightStyle = {
    stroke: "#facc15",
    strokeWidth: 22,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  return (
    <svg viewBox="0 0 320 300" role="img" aria-label="Pose guide" style={{ width: "100%", height: "100%" }}>
      <rect width="320" height="300" rx="24" fill="#0f172a" />
      <line x1={p.neck[0]} y1={p.neck[1]} x2={p.hip[0]} y2={p.hip[1]} {...limbStyle} />
      <line x1={p.leftShoulder[0]} y1={p.leftShoulder[1]} x2={p.rightShoulder[0]} y2={p.rightShoulder[1]} {...limbStyle} />
      <line x1={p.leftShoulder[0]} y1={p.leftShoulder[1]} x2={p.leftElbow[0]} y2={p.leftElbow[1]} {...highlightStyle} />
      <line x1={p.leftElbow[0]} y1={p.leftElbow[1]} x2={p.leftHand[0]} y2={p.leftHand[1]} {...highlightStyle} />
      <line x1={p.rightShoulder[0]} y1={p.rightShoulder[1]} x2={p.rightElbow[0]} y2={p.rightElbow[1]} {...highlightStyle} />
      <line x1={p.rightElbow[0]} y1={p.rightElbow[1]} x2={p.rightHand[0]} y2={p.rightHand[1]} {...highlightStyle} />
      <line x1={p.hip[0]} y1={p.hip[1]} x2="118" y2="276" {...limbStyle} />
      <line x1={p.hip[0]} y1={p.hip[1]} x2="202" y2="276" {...limbStyle} />
      <circle cx={p.head[0]} cy={p.head[1]} r="30" fill="#f8fafc" />
      <circle cx={p.leftHand[0]} cy={p.leftHand[1]} r="16" fill="#22d3ee" stroke="#082f49" strokeWidth="4" />
      <circle cx={p.rightHand[0]} cy={p.rightHand[1]} r="16" fill="#22d3ee" stroke="#082f49" strokeWidth="4" />
      <text x="96" y="292" textAnchor="middle" fill="#cbd5e1" fontSize="18" fontWeight="700">Left</text>
      <text x="224" y="292" textAnchor="middle" fill="#cbd5e1" fontSize="18" fontWeight="700">Right</text>
    </svg>
  );
};

const ImitationGame = ({ onComplete, onClose, speak, t }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const requestRef = useRef(null);
  const processingRef = useRef(false);
  const mountedRef = useRef(true);
  const statusRef = useRef("loading");
  const poseIndexRef = useRef(0);
  const scoreRef = useRef(0);
  const metricsRef = useRef([]);
  const poseStartTimeRef = useRef(Date.now());
  const matchFramesRef = useRef(0);
  const poseMatchedFramesRef = useRef(0);
  const poseTotalFramesRef = useRef(0);
  const poseBreakCountRef = useRef(0);
  const poseAttemptsRef = useRef(0);      // consecutive match attempts this pose
  const poseEverVisibleRef = useRef(false); // was the body reliably in frame at all?
  const poseQuickHoldRef = useRef(false);  // did they get close (matchFrames > 0) but fail?
  const lastDetectionAtRef = useRef(0);
  const successLockedRef = useRef(false);
  const completedRef = useRef(false);
  const lastSpokenPhrase = useRef("");
  const hasSpokenIntro = useRef(false);

  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState("loading");
  const [timeLeft, setTimeLeft] = useState(LEVEL_TIME_LIMIT_SECONDS);
  const [poseMetrics, setPoseMetrics] = useState([]);
  const [message, setMessage] = useState("Starting body tracker...");
  const [trackerReady, setTrackerReady] = useState(false);

  const currentPose = POSES[currentPoseIndex] || POSES[0];
  const progress = Math.round((currentPoseIndex / POSES.length) * 100);

  const setStatus = useCallback((status) => {
    statusRef.current = status;
    setGameStatus(status);
  }, []);

  const finishGame = useCallback((finalScore = scoreRef.current, finalMetrics = metricsRef.current) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setStatus("finished");
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    const totalTime = finalMetrics.reduce((sum, metric) => sum + metric.timeTaken, 0);
    const avgTime = finalMetrics.length > 0 ? totalTime / finalMetrics.length : 0;
    const matchedMetrics = finalMetrics.filter((metric) => metric.matched);
    const completionAccuracy = Math.round((matchedMetrics.length / POSES.length) * 100);
    const totalScore = finalMetrics.reduce((sum, metric) => sum + (metric.score || 0), 0);
    const timingScore = Math.round(totalScore / POSES.length);

    onComplete?.({
      score: totalScore || finalScore,
      posesMatched: matchedMetrics.length,
      totalPoses: POSES.length,
      accuracy: completionAccuracy,
      duration: Math.round(totalTime / 1000),
      timingScore: Math.round(timingScore),
      metadata: {
        poseBreakdown: finalMetrics,
        averageTimePerPose: avgTime,
        totalTime,
        timingScore: Math.round(timingScore),
      },
    });
  }, [onComplete, setStatus]);

  const handleSuccess = useCallback(() => {
    if (successLockedRef.current || statusRef.current !== "playing") return;
    successLockedRef.current = true;

    const pose = POSES[poseIndexRef.current] || POSES[0];
    const timeTaken = Date.now() - poseStartTimeRef.current;
    const earnedScore = calculateFinalPoseScore({
      timeTaken_ms: timeTaken,
      poseId: pose.id,
      matched: true,
      holdBreaks: poseBreakCountRef.current,
      totalAttempts: poseAttemptsRef.current,
      neverVisible: !poseEverVisibleRef.current,
      timedOut: false,
      quickHold: false,
      isFirstPose: poseIndexRef.current === 0,
    });
    const nextMetrics = [...metricsRef.current, {
      poseId: pose.id,
      timeTaken,
      score: earnedScore,
      matched: true,
    }];
    const nextScore = nextMetrics.reduce((sum, metric) => sum + (metric.score || 0), 0);

    metricsRef.current = nextMetrics;
    scoreRef.current = nextScore;
    setPoseMetrics(nextMetrics);
    setScore(nextScore);
    setStatus("success");
    setMessage("Hold complete");

    if (speak) {
      const options = SHORT_SUCCESS_PHRASES.filter((phrase) => phrase !== lastSpokenPhrase.current);
      const phrase = options[Math.floor(Math.random() * options.length)] || "Correct!";
      lastSpokenPhrase.current = phrase;
      speak(phrase);
    }

    window.setTimeout(() => {
      if (!mountedRef.current || completedRef.current) return;
      const nextIndex = poseIndexRef.current + 1;
      matchFramesRef.current = 0;
      poseMatchedFramesRef.current = 0;
      poseTotalFramesRef.current = 0;
      poseBreakCountRef.current = 0;
      poseAttemptsRef.current = 0;
      poseEverVisibleRef.current = false;
      poseQuickHoldRef.current = false;
      successLockedRef.current = false;

      if (nextIndex >= POSES.length) {
        finishGame(nextScore, nextMetrics);
        return;
      }

      poseIndexRef.current = nextIndex;
      poseStartTimeRef.current = Date.now();
      setCurrentPoseIndex(nextIndex);
      setTimeLeft(LEVEL_TIME_LIMIT_SECONDS);
      setMessage("Copy the pose and hold still");
      setStatus("playing");
    }, 900);
  }, [finishGame, setStatus, speak]);

  const handlePoseTimeout = useCallback(() => {
    if (successLockedRef.current || statusRef.current !== "playing") return;
    successLockedRef.current = true;

    const pose = POSES[poseIndexRef.current] || POSES[0];
    const earnedScore = calculateFinalPoseScore({
      timeTaken_ms: LEVEL_TIME_LIMIT_MS,
      poseId: pose.id,
      matched: false,
      holdBreaks: poseBreakCountRef.current,
      totalAttempts: poseAttemptsRef.current,
      neverVisible: !poseEverVisibleRef.current,
      timedOut: true,
      quickHold: poseQuickHoldRef.current,
      isFirstPose: poseIndexRef.current === 0,
    });
    const nextMetrics = [...metricsRef.current, {
      poseId: pose.id,
      timeTaken: LEVEL_TIME_LIMIT_MS,
      score: earnedScore ?? 0,
      matched: false,
      timeout: true,
    }];
    const nextScore = nextMetrics.reduce((sum, metric) => sum + (metric.score || 0), 0);

    metricsRef.current = nextMetrics;
    scoreRef.current = nextScore;
    setPoseMetrics(nextMetrics);
    setScore(nextScore);
    setStatus("timeout");
    setMessage("Time is up. Moving to the next pose.");
    speak?.("Time is up. Let's try the next pose.");

    window.setTimeout(() => {
      if (!mountedRef.current || completedRef.current) return;
      const nextIndex = poseIndexRef.current + 1;
      matchFramesRef.current = 0;
      poseMatchedFramesRef.current = 0;
      poseTotalFramesRef.current = 0;
      poseBreakCountRef.current = 0;
      poseAttemptsRef.current = 0;
      poseEverVisibleRef.current = false;
      poseQuickHoldRef.current = false;
      successLockedRef.current = false;

      if (nextIndex >= POSES.length) {
        finishGame(nextScore, nextMetrics);
        return;
      }

      poseIndexRef.current = nextIndex;
      poseStartTimeRef.current = Date.now();
      setCurrentPoseIndex(nextIndex);
      setTimeLeft(LEVEL_TIME_LIMIT_SECONDS);
      setMessage("Copy the pose and hold still");
      setStatus("playing");
    }, 0);
  }, [finishGame, setStatus, speak]);

  const checkPoseMatch = useCallback((keypoints) => {
    const target = POSES[poseIndexRef.current];
    const leftWrist = getPoint(keypoints, "left_wrist");
    const rightWrist = getPoint(keypoints, "right_wrist");
    const leftElbow = getPoint(keypoints, "left_elbow");
    const rightElbow = getPoint(keypoints, "right_elbow");
    const leftShoulder = getPoint(keypoints, "left_shoulder");
    const rightShoulder = getPoint(keypoints, "right_shoulder");
    const nose = getPoint(keypoints, "nose");

    if (![leftWrist, rightWrist, leftShoulder, rightShoulder].every(isReliable)) {
      setMessage("Step back so both hands and shoulders are visible");
      return false;
    }

    const shoulderWidth = Math.max(1, Math.abs(leftShoulder.x - rightShoulder.x));
    const handRaise = shoulderWidth * 0.35;
    const leftHandUp = leftWrist.y < leftShoulder.y - handRaise;
    const rightHandUp = rightWrist.y < rightShoulder.y - handRaise;
    const leftHandDown = leftWrist.y > leftShoulder.y + shoulderWidth * 0.2;
    const rightHandDown = rightWrist.y > rightShoulder.y + shoulderWidth * 0.2;
    const handsClose = Math.abs(leftWrist.x - rightWrist.x) < shoulderWidth * 0.55;
    const handsWide = Math.abs(leftWrist.x - rightWrist.x) > shoulderWidth * 1.35;

    switch (target.id) {
      case "left_up":
        return leftHandUp && !rightHandUp;
      case "right_up":
        return rightHandUp && !leftHandUp;
      case "both_up":
        return isReliable(nose) && leftWrist.y < nose.y && rightWrist.y < nose.y;
      case "t_pose": {
        const leftLevel = Math.abs(leftWrist.y - leftShoulder.y) < shoulderWidth * 0.45;
        const rightLevel = Math.abs(rightWrist.y - rightShoulder.y) < shoulderWidth * 0.45;
        return leftLevel && rightLevel && handsWide;
      }
      case "namaste":
        return isReliable(leftElbow) && isReliable(rightElbow) && handsClose && leftWrist.y > leftShoulder.y && rightWrist.y > rightShoulder.y;
      case "low_a":
        return leftHandDown && rightHandDown && handsWide;
      case "salute": {
        if (!isReliable(nose)) return false;
        const rightSalute = Math.abs(rightWrist.y - nose.y) < shoulderWidth * 0.55 &&
          Math.abs(rightWrist.x - nose.x) < shoulderWidth * 0.65 &&
          leftHandDown;
        const leftSalute = Math.abs(leftWrist.y - nose.y) < shoulderWidth * 0.55 &&
          Math.abs(leftWrist.x - nose.x) < shoulderWidth * 0.65 &&
          rightHandDown;
        return rightSalute || leftSalute;
      }
      default:
        return false;
    }
  }, []);

  const drawPose = useCallback((pose, width, height) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const keypointMap = {};
    pose.keypoints.forEach((keypoint) => {
      keypointMap[keypoint.name] = keypoint;
    });

    const pairs = [
      ["left_shoulder", "right_shoulder"],
      ["left_shoulder", "left_elbow"],
      ["left_elbow", "left_wrist"],
      ["right_shoulder", "right_elbow"],
      ["right_elbow", "right_wrist"],
      ["nose", "left_eye"],
      ["nose", "right_eye"],
    ];

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#38bdf8";
    pairs.forEach(([start, end]) => {
      const p1 = keypointMap[start];
      const p2 = keypointMap[end];
      if (!isReliable(p1) || !isReliable(p2)) return;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    pose.keypoints.forEach((point) => {
      if (!isReliable(point)) return;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 7, 0, 2 * Math.PI);
      ctx.fillStyle = "#facc15";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#111827";
      ctx.stroke();
    });
  }, []);

  const detectLoop = useCallback(async (time = 0) => {
    if (!mountedRef.current || statusRef.current === "finished") return;

    requestRef.current = requestAnimationFrame(detectLoop);
    if (statusRef.current !== "playing" || processingRef.current) return;
    if (time - lastDetectionAtRef.current < DETECTION_INTERVAL_MS) return;
    lastDetectionAtRef.current = time;

    const video = webcamRef.current?.video;
    const detector = detectorRef.current;
    if (!video || !detector || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      setMessage("Waiting for camera...");
      return;
    }

    processingRef.current = true;
    try {
      const poses = await detector.estimatePoses(video);
      const pose = poses?.[0];
      if (!pose) {
        matchFramesRef.current = 0;
        setMessage("Stand in view of the camera");
        return;
      }

      drawPose(pose, video.videoWidth, video.videoHeight);
      poseEverVisibleRef.current = true;  // body is in frame
      const isMatch = checkPoseMatch(pose.keypoints);
      poseTotalFramesRef.current += 1;

      if (isMatch) {
        poseMatchedFramesRef.current += 1;
        matchFramesRef.current += 1;
        poseAttemptsRef.current += 1;
        setMessage(`Hold steady ${Math.min(matchFramesRef.current, REQUIRED_MATCH_FRAMES)} / ${REQUIRED_MATCH_FRAMES}`);
        if (matchFramesRef.current >= REQUIRED_MATCH_FRAMES) handleSuccess();
      } else {
        if (matchFramesRef.current > 0) {
          poseBreakCountRef.current += 1;
          poseQuickHoldRef.current = true; // they got at least 1 matching frame
        }
        matchFramesRef.current = Math.max(0, matchFramesRef.current - 1);
        setMessage("Copy the pose and hold still");
      }
    } catch (error) {
      console.warn("Pose detection error:", error);
      setMessage("Tracker is catching up...");
    } finally {
      processingRef.current = false;
    }
  }, [checkPoseMatch, drawPose, handleSuccess]);

  useEffect(() => {
    mountedRef.current = true;
    const loadModel = async () => {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
          },
        );
        if (!mountedRef.current) {
          detector.dispose?.();
          return;
        }
        detectorRef.current = detector;
        poseStartTimeRef.current = Date.now();
        poseMatchedFramesRef.current = 0;
        poseTotalFramesRef.current = 0;
        poseBreakCountRef.current = 0;
        setTrackerReady(true);
        setMessage("Copy the pose and hold still");
        setStatus("playing");
      } catch (error) {
        console.error("Failed to load body tracker:", error);
        setMessage("Body tracker could not start. Please refresh and try again.");
        setStatus("error");
      }
    };

    loadModel();

    return () => {
      mountedRef.current = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      detectorRef.current?.dispose?.();
    };
  }, [setStatus]);

  useEffect(() => {
    statusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    poseIndexRef.current = currentPoseIndex;
  }, [currentPoseIndex]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    metricsRef.current = poseMetrics;
  }, [poseMetrics]);

  useEffect(() => {
    if (gameStatus === "playing" && !requestRef.current) {
      requestRef.current = requestAnimationFrame(detectLoop);
    }
  }, [detectLoop, gameStatus]);

  useEffect(() => {
    if (gameStatus === "playing" && speak && t && !hasSpokenIntro.current) {
      speak(t.instr_imitation_start || "Stand back and copy the poses on screen.");
      hasSpokenIntro.current = true;
    }
  }, [gameStatus, speak, t]);

  useEffect(() => {
    if (gameStatus !== "playing") return undefined;
    setTimeLeft(LEVEL_TIME_LIMIT_SECONDS);
    const timer = window.setInterval(() => {
      setTimeLeft((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer);
          handlePoseTimeout();
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [currentPoseIndex, gameStatus, handlePoseTimeout]);

  return (
    <div className="d-flex flex-column bg-dark text-white" style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <div className="px-3 py-2 d-flex justify-content-between align-items-center" style={{ background: "#172033", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div>
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <FaCheckCircle className="text-warning" />
            Imitation Game
          </h4>
          <small className="text-white-50">Pose {Math.min(currentPoseIndex + 1, POSES.length)} of {POSES.length}</small>
        </div>
        <div className="d-flex align-items-center gap-4">
          <div className="text-end">
            <div className="text-white-50 small">Score</div>
            <div className="h4 mb-0 text-warning">{score}</div>
          </div>
          <div className="text-end">
            <div className="text-white-50 small">Time</div>
            <div className={`h4 mb-0 ${timeLeft < 10 ? "text-danger" : "text-info"}`}>{timeLeft}s</div>
          </div>
          <Button variant="outline-light" size="sm" onClick={onClose} aria-label="Exit imitation game">
            <FaTimes />
          </Button>
        </div>
      </div>

      <ProgressBar now={progress} style={{ height: 6, borderRadius: 0 }} variant="warning" />

      <div className="flex-grow-1 d-flex flex-column flex-lg-row">
        <section className="d-flex flex-column align-items-center justify-content-center p-3 p-lg-4" style={{ flex: 1, minHeight: 0, backgroundColor: gameStatus === "success" ? "#15803d" : "#203047", transition: "background 0.25s" }}>
          <div className="text-center mb-3">
            <div className="text-uppercase text-white-50 fw-bold small">Do This</div>
            <h1 className="fw-bold mb-0">{currentPose.name}</h1>
            <div className="mt-2 d-flex flex-wrap justify-content-center gap-2">
              <span className="badge bg-info text-dark px-3 py-2">100% within 1 minute</span>
              <span className="badge bg-warning text-dark px-3 py-2">Next pose at 2 minutes</span>
            </div>
          </div>

          <div style={{ width: "min(560px, 92vw)", height: "min(600px, 64vh)", minHeight: 380, background: "rgba(0,0,0,0.22)", borderRadius: 16, overflow: "hidden", position: "relative", border: "3px solid rgba(250,204,21,0.75)" }}>
            <PoseGuide poseId={currentPose.id} />
            <div className="position-absolute start-0 end-0 bottom-0 p-3 text-center fw-bold" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.72))" }}>
              Match this pose and hold steady
            </div>
          </div>

          {gameStatus === "success" && (
            <Alert variant="success" className="mt-3 mb-0 py-2 px-4 fw-bold border-0">
              Good job!
            </Alert>
          )}
        </section>

        <section className="position-relative bg-black d-flex align-items-center justify-content-center p-3 p-lg-4" style={{ flex: 1, minHeight: 0 }}>
          <div style={{ width: "min(720px, 100%)", aspectRatio: "4 / 3", position: "relative", overflow: "hidden", borderRadius: 16, background: "#020617", border: "1px solid rgba(255,255,255,0.12)" }}>
            {(gameStatus === "loading" || !trackerReady) && (
              <div className="position-absolute top-50 start-50 translate-middle text-center z-3">
                <Spinner animation="border" variant="info" style={{ width: "3rem", height: "3rem" }} />
                <p className="mt-3 mb-0">{message}</p>
              </div>
            )}

            {gameStatus === "error" && (
              <div className="position-absolute top-50 start-50 translate-middle text-center z-3 px-4">
                <Alert variant="danger" className="mb-3">{message}</Alert>
                <Button onClick={onClose}>Close</Button>
              </div>
            )}

            <Webcam
              ref={webcamRef}
              mirrored
              audio={false}
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user",
              }}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                opacity: gameStatus === "finished" ? 0.25 : 1,
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                pointerEvents: "none",
                transform: "scaleX(-1)",
              }}
            />
            <div className="position-absolute start-0 end-0 bottom-0 p-3" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.75))" }}>
              <div className="fw-bold">{message}</div>
              <small className="text-white-50">Keep your upper body in frame for smoother tracking.</small>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ImitationGame;
