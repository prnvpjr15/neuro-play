import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "@vladmandic/face-api";
import { Button, Alert, Badge, Spinner, ProgressBar } from "react-bootstrap";
import {
  FaCamera,
  FaSmile,
  FaMeh,
  FaAngry,
  FaSurprise,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";

// --- CONFIGURATION ---
const MODEL_URL = "/models";

// --- REALISTIC EMOTION IMAGES ---
const TARGET_EMOTIONS = [
  {
    name: "happy",
    imgSrc: "/emotions/happy.jpg",
    fallback: <FaSmile size={100} color="#ffc107" />,
    instruction: "Show me a BIG Smile! 😄",
  },
  {
    name: "surprised",
    imgSrc: "/emotions/surprised.jpg",
    fallback: <FaSurprise size={100} color="#17a2b8" />,
    instruction: "Open your mouth! Surprise! 😲",
  },
  {
    name: "angry",
    imgSrc: "/emotions/angry.jpg",
    fallback: <FaAngry size={100} color="#dc3545" />,
    instruction: "Frown your eyebrows! 😠",
  },
  {
    name: "neutral",
    imgSrc: "/emotions/neutral.jpg",
    fallback: <FaMeh size={100} color="#28a745" />,
    instruction: "Relax your face. 😐",
  },
];

const SUCCESS_PHRASES = [
  "Nice!",
  "Good job!",
  "Perfect!",
  "Well done!",
  "Great!",
];

// --- HELPER COMPONENT ---
const ImageWithFallback = ({ src, alt, fallbackIcon }) => {
  const [error, setError] = useState(false);
  if (error)
    return (
      <div className="d-flex justify-content-center align-items-center h-100 bg-light">
        {fallbackIcon}
      </div>
    );
  return (
    <img
      src={src}
      alt={alt}
      className="w-100 h-100 object-fit-cover"
      onError={() => setError(true)}
    />
  );
};

const AutisticCameraGame = ({ onComplete, onClose, speak, t }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Game State
  const [currentEmotionIndex, setCurrentEmotionIndex] = useState(0);
  const [detectedExpression, setDetectedExpression] =
    useState("Initializing...");
  const [score, setScore] = useState(0);
  const [matchProgress, setMatchProgress] = useState(0);
  const [gameStatus, setGameStatus] = useState("loading");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentEmotionStartTime, setCurrentEmotionStartTime] = useState(null);
  const [emotionTimes, setEmotionTimes] = useState([]); // Store time for each completed emotion
  const gameFinishedRef = useRef(false);
  // Logic Refs
  const matchStreak = useRef(0);
  const loopInterval = useRef(null);
  const hasSpokenIntro = useRef(false);
  const lastSpokenPhrase = useRef("");
  const emotionScores = useRef([]); // Store detailed data for each emotion
  const currentEmotionTimer = useRef(null); // Store start time reference

  // 1. Load AI Models & Speak Intro
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.tf.setBackend("webgl");
        await faceapi.tf.ready();

        const testFetch = await fetch(
          `${MODEL_URL}/tiny_face_detector_model-weights_manifest.json`,
        );
        if (!testFetch.ok)
          throw new Error(`Model files not found at ${MODEL_URL}`);

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);

        setModelsLoaded(true);
        setGameStatus("playing");

        // Reset emotion scores
        emotionScores.current = [];

        // Speak intro ONLY ONCE
        if (speak && t && !hasSpokenIntro.current) {
          speak(t.instr_face_start);
          hasSpokenIntro.current = true;
        }
      } catch (err) {
        console.error("Model Load Error:", err);
        setGameStatus("error");
        setErrorMsg(
          "Error loading AI models. Ensure files are in 'public/models'.",
        );
      }
    };
    loadModels();
  }, [speak, t]);

  // Start timer when emotion changes
  useEffect(() => {
    if (gameStatus === "playing" && modelsLoaded) {
      const startTime = Date.now();
      setCurrentEmotionStartTime(startTime);
      currentEmotionTimer.current = startTime;

      // Reset progress for new emotion
      matchStreak.current = 0;
      setMatchProgress(0);
    }
  }, [currentEmotionIndex, gameStatus, modelsLoaded]);

  // 2. Detection Loop
  useEffect(() => {
    if (gameStatus === "playing" && modelsLoaded) {
      loopInterval.current = setInterval(async () => {
        if (
          webcamRef.current &&
          webcamRef.current.video &&
          webcamRef.current.video.readyState === 4
        ) {
          const video = webcamRef.current.video;

          // CRITICAL FIX: Ensure video has dimensions before passing to AI
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            try {
              const options = new faceapi.TinyFaceDetectorOptions({
                inputSize: 224,
                scoreThreshold: 0.5,
              });
              const detections = await faceapi
                .detectAllFaces(video, options)
                .withFaceExpressions();

              if (detections.length > 0) {
                const expressions = detections[0].expressions;
                const maxEmotion = Object.keys(expressions).reduce((a, b) =>
                  expressions[a] > expressions[b] ? a : b,
                );
                const confidence = expressions[maxEmotion];

                setDetectedExpression(maxEmotion);

                const target = TARGET_EMOTIONS[currentEmotionIndex].name;

                if (maxEmotion === target) {
                  const boost = confidence > 0.7 ? 4 : 2;
                  matchStreak.current = Math.min(
                    100,
                    matchStreak.current + boost,
                  );
                } else {
                  matchStreak.current = Math.max(0, matchStreak.current - 1);
                }

                setMatchProgress(matchStreak.current);

                if (matchStreak.current >= 100) {
                  handleSuccess();
                }
              } else {
                setDetectedExpression("No Face Seen");
                // Small penalty when no face is detected
                matchStreak.current = Math.max(0, matchStreak.current - 0.5);
                setMatchProgress(matchStreak.current);
              }
            } catch (e) {
              // Suppress frame errors
              console.error("Detection error:", e);
            }
          }
        }
      }, 100);
    }

    return () => clearInterval(loopInterval.current);
  }, [gameStatus, modelsLoaded, currentEmotionIndex]);

  const handleSuccess = () => {
    const endTime = Date.now();
    const timeTaken = endTime - (currentEmotionTimer.current || endTime);

    // Save data for this emotion
    const emotionData = {
      emotion: TARGET_EMOTIONS[currentEmotionIndex].name,
      timeTaken: timeTaken, // in milliseconds
      startTime: currentEmotionTimer.current,
      endTime: endTime,
      finalProgress: matchStreak.current,
      emotionIndex: currentEmotionIndex,
    };

    emotionScores.current.push(emotionData);

    // Update UI
    setEmotionTimes((prev) => [
      ...prev,
      {
        emotion: TARGET_EMOTIONS[currentEmotionIndex].name,
        time: Math.round(timeTaken / 1000),
      },
    ]);

    matchStreak.current = 0;
    setMatchProgress(0);
    setScore((s) => s + 100);
    setGameStatus("success");

    if (speak) {
      const availablePhrases = SUCCESS_PHRASES.filter(
        (p) => p !== lastSpokenPhrase.current,
      );
      const randomPhrase =
        availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
      lastSpokenPhrase.current = randomPhrase;
      speak(randomPhrase);
    }

    setTimeout(() => {
      const next = currentEmotionIndex + 1;
      if (next < TARGET_EMOTIONS.length) {
        setCurrentEmotionIndex(next);
        setGameStatus("playing");
      } else {
        finishGame();
      }
    }, 2500);
  };

  const finishGame = () => {
    if (gameFinishedRef.current) return;
    gameFinishedRef.current = true;
    if (onComplete) {
      // Calculate total time and metrics
      const totalTime = emotionScores.current.reduce(
        (sum, emotion) => sum + emotion.timeTaken,
        0,
      );
      const averageTime =
        emotionScores.current.length > 0
          ? totalTime / emotionScores.current.length
          : 0;

      // Sort emotions by time taken (descending - most struggle first)
      const sortedByTime = [...emotionScores.current].sort(
        (a, b) => b.timeTaken - a.timeTaken,
      );

      // Generate struggle order string
      const struggleOrder = sortedByTime.map((e) => e.emotion).join(" → ");

      // Calculate performance metrics
      const times = emotionScores.current.map((e) => e.timeTaken);
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      const consistency = 100 - ((maxTime - minTime) / maxTime) * 100;

      // Calculate final score based on speed and consistency
      const baseScore = 400; // 100 per emotion
      const timeBonus = Math.max(0, 100 - (averageTime / 10000) * 50); // Faster = more bonus
      const consistencyBonus = consistency * 0.3;
      const finalScore = Math.min(
        400,
        baseScore + timeBonus + consistencyBonus,
      );

      onComplete({
        points: Math.round(finalScore),
        accuracyPct: 100,
        attempts: TARGET_EMOTIONS.length,
        emotionsMatched: TARGET_EMOTIONS.length,
        // Time analysis data
        emotionData: emotionScores.current,
        struggleOrder: struggleOrder,
        timeData: {
          totalTime: totalTime,
          averageTime: averageTime,
          sortedEmotions: sortedByTime,
          fastest: sortedByTime[sortedByTime.length - 1], // Last item is fastest
          slowest: sortedByTime[0], // First item is slowest
          consistency: consistency,
        },
        performanceMetrics: {
          baseScore: baseScore,
          timeBonus: timeBonus,
          consistencyBonus: consistencyBonus,
          finalScore: finalScore,
        },
      });
    }
  };

  // Format time display
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center bg-dark text-white"
      style={{ height: "100vh", width: "100vw" }}
    >
      {/* Top HUD */}
      <div
        className="position-absolute top-0 w-100 p-3 d-flex justify-content-between align-items-center bg-secondary"
        style={{ zIndex: 10 }}
      >
        <div className="d-flex align-items-center">
          <h4>
            <FaCamera className="me-2" />
            Face Mimic
          </h4>
          <Badge bg={modelsLoaded ? "success" : "warning"} className="ms-3">
            {modelsLoaded ? "AI Active" : "Loading..."}
          </Badge>
        </div>
        <div className="d-flex align-items-center gap-4">
          <div className="text-center">
            <small className="text-white-50 d-block">Current Time</small>
            <div className="d-flex align-items-center">
              <FaClock className="me-1" />
              <span className="fw-bold">
                {currentEmotionStartTime
                  ? formatTime(Date.now() - currentEmotionStartTime)
                  : "0s"}
              </span>
            </div>
          </div>
          <div>
            <span className="me-4">
              Score: <strong>{score}</strong>
            </span>
            <Button variant="danger" size="sm" onClick={onClose}>
              Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Error Screen */}
      {gameStatus === "error" && (
        <Alert
          variant="danger"
          className="position-absolute top-50 start-50 translate-middle text-center shadow"
          style={{ zIndex: 999, width: "80%", maxWidth: "500px" }}
        >
          <h4>
            <FaExclamationTriangle className="me-2" />
            AI Load Failed
          </h4>
          <p>{errorMsg}</p>
          <Button variant="outline-danger" onClick={onClose}>
            Go Back
          </Button>
        </Alert>
      )}

      <div className="d-flex w-100 h-100">
        {/* LEFT: Prompt Area */}
        <div
          className="w-50 d-flex flex-column align-items-center justify-content-center p-5"
          style={{
            background: gameStatus === "success" ? "#28a745" : "#343a40",
            transition: "0.5s",
          }}
        >
          <div
            className="mb-4 shadow-lg bg-white position-relative"
            style={{
              width: "300px",
              height: "300px",
              borderRadius: "20px",
              overflow: "hidden",
              border: "5px solid white",
            }}
          >
            <ImageWithFallback
              src={TARGET_EMOTIONS[currentEmotionIndex].imgSrc}
              alt={TARGET_EMOTIONS[currentEmotionIndex].name}
              fallbackIcon={TARGET_EMOTIONS[currentEmotionIndex].fallback}
            />
            {gameStatus === "success" && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-success bg-opacity-75">
                <FaCheckCircle size={100} color="white" />
              </div>
            )}
          </div>
          <h2 className="display-4 fw-bold text-center text-capitalize">
            {TARGET_EMOTIONS[currentEmotionIndex].name}
          </h2>
          <h3 className="mt-2 text-info text-center bg-dark bg-opacity-50 px-3 py-1 rounded">
            {TARGET_EMOTIONS[currentEmotionIndex].instruction}
          </h3>

          {/* Show time for current emotion */}
          {currentEmotionStartTime && gameStatus === "playing" && (
            <div className="mt-3 d-flex align-items-center text-warning">
              <FaClock className="me-2" />
              <span className="fw-bold">
                Time: {formatTime(Date.now() - currentEmotionStartTime)}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: Camera + AI Feedback */}
        <div className="w-50 position-relative bg-black d-flex align-items-center justify-content-center overflow-hidden">
          {!modelsLoaded && gameStatus !== "error" && (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Initializing Neural Network...</p>
            </div>
          )}

          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            width={640}
            height={480}
            videoConstraints={{ facingMode: "user" }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: gameStatus === "finished" ? 0.2 : 1,
            }}
            mirrored={true}
          />

          {/* Completed Emotions Sidebar */}
          {emotionTimes.length > 0 && (
            <div
              className="position-absolute top-0 end-0 m-3 bg-dark bg-opacity-75 p-3 rounded-3"
              style={{ zIndex: 5 }}
            >
              <h6 className="text-center mb-3">Completed Emotions</h6>
              <div className="d-flex flex-column gap-2">
                {emotionTimes.map((item, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span className="text-capitalize small">
                      {item.emotion}
                    </span>
                    <Badge
                      bg={
                        item.time < 15
                          ? "success"
                          : item.time < 30
                            ? "warning"
                            : "danger"
                      }
                    >
                      {item.time}s
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Visualization Overlay */}
          <div
            className="position-absolute bottom-0 w-100 p-4"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
            }}
          >
            <div className="container">
              <div className="row align-items-end">
                <div className="col-12 text-center mb-2">
                  <span className="text-white-50 small text-uppercase">
                    AI Sees
                  </span>
                  <h2
                    className={`fw-bold display-4 text-capitalize ${detectedExpression === TARGET_EMOTIONS[currentEmotionIndex].name ? "text-success" : "text-white"}`}
                  >
                    {detectedExpression}
                  </h2>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between text-white small mb-1">
                    <span>Match Progress</span>
                    <span>{Math.round(matchProgress)}%</span>
                  </div>
                  <ProgressBar
                    now={matchProgress}
                    variant={
                      matchProgress > 80
                        ? "success"
                        : matchProgress > 50
                          ? "warning"
                          : "danger"
                    }
                    style={{ height: "12px", borderRadius: "6px" }}
                    animated={matchProgress > 0}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutisticCameraGame;
