import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { Button, Spinner, Alert } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import { Canvas } from "@react-three/fiber";
import ImitationRobot from "./components/ImitationRobot";

const POSES = [
  { id: "left_up", name: "Left Hand Up" },
  { id: "right_up", name: "Right Hand Up" },
  { id: "both_up", name: "Victory" },
  { id: "t_pose", name: "T-Pose" },
  { id: "hands_head", name: "Hands on Head" },
  { id: "namaste", name: "Namaste" },
  { id: "low_a", name: "Low 'A' Pose" },
  { id: "salute", name: "Right Salute" },
];

// Short phrases for between stages
const SHORT_SUCCESS_PHRASES = [
  "Correct!", "Nice!", "Good job!", "Right!", "Got it!", "Yes!", "Perfect!"
];

const ImitationGame = ({ onComplete, onClose, speak, t }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState("loading"); 
  const [timeLeft, setTimeLeft] = useState(60); 
  const requestRef = useRef(null);
  const lastSpokenPhrase = useRef("");
  const hasSpokenIntro = useRef(false);

  // VOICE: Intro (Only runs once)
  useEffect(() => {
    if (gameStatus === "playing" && speak && t && !hasSpokenIntro.current) {
        speak(t.instr_imitation_start);
        hasSpokenIntro.current = true;
    }
  }, [gameStatus, speak, t]);

  // Load Model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
        const newDetector = await poseDetection.createDetector(model, detectorConfig);
        setDetector(newDetector);
        setGameStatus("playing");
      } catch (err) {
        console.error("Failed to load model:", err);
        alert("Error loading body tracker. Please refresh.");
      }
    };
    loadModel();
  }, []);

  // Timer
  useEffect(() => {
    let timer;
    if (gameStatus === "playing" && timeLeft > 0) {
      timer = setInterval(() => { setTimeLeft((prev) => prev - 1); }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameStatus, timeLeft]);

  // Detection Loop
  const detect = async () => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4 && detector) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      
      // Ensure video dimensions are valid
      if (videoWidth > 0 && videoHeight > 0) {
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;
        if (canvasRef.current) { canvasRef.current.width = videoWidth; canvasRef.current.height = videoHeight; }

        try {
          const poses = await detector.estimatePoses(video);
          if (poses.length > 0 && canvasRef.current) {
            drawUpperBodyCanvas(poses[0], videoWidth, videoHeight, canvasRef);
            checkPoseMatch(poses[0].keypoints);
          }
        } catch (e) {}
      }
    }
    requestRef.current = requestAnimationFrame(detect);
  };

  useEffect(() => {
    if (gameStatus === "playing") requestRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameStatus, detector, currentPoseIndex]);

  // Pose Logic
  const checkPoseMatch = (keypoints) => {
    const target = POSES[currentPoseIndex];
    const leftWrist = keypoints.find(k => k.name === "left_wrist");
    const rightWrist = keypoints.find(k => k.name === "right_wrist");
    const leftShoulder = keypoints.find(k => k.name === "left_shoulder");
    const rightShoulder = keypoints.find(k => k.name === "right_shoulder");
    const nose = keypoints.find(k => k.name === "nose");

    if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder || leftWrist.score < 0.3 || rightWrist.score < 0.3) return;
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    if (shoulderWidth === 0) return; 

    const leftHandUp = leftWrist.y < leftShoulder.y - (shoulderWidth * 0.5);
    const rightHandUp = rightWrist.y < rightShoulder.y - (shoulderWidth * 0.5);
    const leftHandDown = leftWrist.y > leftShoulder.y;
    const rightHandDown = rightWrist.y > rightShoulder.y;

    let isMatch = false;
    switch (target.id) {
      // Mirror-safe: accept either side for single-hand-up prompts.
      case "left_up":
      case "right_up":
        if (leftHandUp || rightHandUp) isMatch = true;
        break;
      case "both_up": if (nose && leftWrist.y < nose.y && rightWrist.y < nose.y) isMatch = true; break;
      case "t_pose": 
        const vL = Math.abs(leftWrist.y - leftShoulder.y) < (shoulderWidth * 0.4);
        const vR = Math.abs(rightWrist.y - rightShoulder.y) < (shoulderWidth * 0.4);
        if (vL && vR && Math.abs(leftWrist.x - rightWrist.x) > (shoulderWidth * 1.5)) isMatch = true;
        break;
      case "hands_head": if (nose && leftWrist.y < nose.y + 20 && rightWrist.y < nose.y + 20 && Math.abs(leftWrist.x - rightWrist.x) < shoulderWidth) isMatch = true; break;
      case "namaste": if (nose && leftWrist.y > nose.y && rightWrist.y > nose.y && Math.abs(leftWrist.x - rightWrist.x) < (shoulderWidth * 0.3)) isMatch = true; break;
      case "low_a": if (leftWrist.y > leftShoulder.y + (shoulderWidth * 0.5) && rightWrist.y > rightShoulder.y + (shoulderWidth * 0.5) && Math.abs(leftWrist.x - rightWrist.x) > (shoulderWidth * 1.2)) isMatch = true; break;
      case "salute":
        if (nose) {
          const rightSalute = Math.abs(rightWrist.y - nose.y) < (shoulderWidth * 0.4) &&
            Math.abs(rightWrist.x - nose.x) < (shoulderWidth * 0.5) &&
            leftHandDown;
          const leftSalute = Math.abs(leftWrist.y - nose.y) < (shoulderWidth * 0.4) &&
            Math.abs(leftWrist.x - nose.x) < (shoulderWidth * 0.5) &&
            rightHandDown;
          if (rightSalute || leftSalute) isMatch = true;
        }
        break;
      default: break;
    }
    if (isMatch) handleSuccess();
  };

  const handleSuccess = () => {
    // 1. Speak random SHORT phrase
    if (speak) {
      const availablePhrases = SHORT_SUCCESS_PHRASES.filter(p => p !== lastSpokenPhrase.current);
      const randomPhrase = availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
      lastSpokenPhrase.current = randomPhrase;
      speak(randomPhrase);
    }

    const newScore = score + 100;
    setGameStatus("success");
    setScore(newScore);

    // 2. Wait for speech to finish (2 seconds) before showing next pose
    setTimeout(() => {
      const nextIndex = currentPoseIndex + 1;
      if (nextIndex >= POSES.length) endGame(newScore);
      else { setCurrentPoseIndex(nextIndex); setGameStatus("playing"); }
    }, 2000);
  };

  const endGame = (finalScore = score) => {
    setGameStatus("finished");
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (onComplete) {
      onComplete({ points: finalScore, posesCompleted: Math.floor(finalScore / 100), accuracyPct: 100 });
    }
  };

  const drawUpperBodyCanvas = (pose, videoWidth, videoHeight, canvas) => {
    if (!canvas.current) return;
    const ctx = canvas.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, videoWidth, videoHeight);
    
    const keypoints = pose.keypoints;
    const keypointMap = {};
    keypoints.forEach(k => keypointMap[k.name] = k);
    ctx.lineWidth = 4; ctx.strokeStyle = "#00FF00";

    const pairs = [["nose","left_eye"],["left_eye","left_ear"],["nose","right_eye"],["right_eye","right_ear"],["left_shoulder","right_shoulder"],["left_shoulder","left_elbow"],["left_elbow","left_wrist"],["right_shoulder","right_elbow"],["right_elbow","right_wrist"]];
    pairs.forEach(([start, end]) => {
      const p1 = keypointMap[start]; const p2 = keypointMap[end];
      if (p1 && p2 && p1.score > 0.3 && p2.score > 0.3) { ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); }
    });

    ["nose","left_eye","right_eye","left_ear","right_ear","left_shoulder","right_shoulder","left_elbow","right_elbow","left_wrist","right_wrist"].forEach(part => {
      const p = keypointMap[part];
      if (p && p.score > 0.3) { ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI); ctx.fillStyle = "#FF0000"; ctx.fill(); }
    });
  };

  return (
    <div className="d-flex flex-column bg-dark text-white" style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <div className="p-3 d-flex justify-content-between align-items-center bg-secondary">
        <h4><FaCheckCircle className="me-2 text-warning" />Imitation Game</h4>
        <div className="d-flex gap-4"><h3>Score: <span className="text-warning">{score}</span></h3><h3 className={timeLeft < 10 ? "text-danger blink" : "text-info"}>⏳ {timeLeft}s</h3></div>
        <Button variant="danger" onClick={onClose}>Exit</Button>
      </div>
      <div className="flex-grow-1 d-flex">
        <div className="w-50 d-flex flex-column align-items-center justify-content-center p-4" style={{ backgroundColor: gameStatus === "success" ? "#1cc88a" : "#2c3e50", transition: "background 0.3s" }}>
          <h2 className="mb-4 text-uppercase" style={{ letterSpacing: "2px" }}>Do This:</h2>
          <div style={{ width: "400px", height: "500px", background: "rgba(0,0,0,0.2)", borderRadius: "20px", overflow: "hidden", position: "relative" }}>
             <Canvas camera={{ position: [0, 2, 14], fov: 45 }} shadows>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                <ImitationRobot poseId={POSES[currentPoseIndex].id} />
             </Canvas>
          </div>
          <h1 className="mt-4 display-4 fw-bold text-center">{POSES[currentPoseIndex].name}</h1>
          {gameStatus === "success" && <h2 className="text-white mt-2">Good Job!</h2>}
        </div>
        <div className="w-50 position-relative bg-black d-flex align-items-center justify-content-center">
            {gameStatus === "loading" && (<div className="text-center"><Spinner animation="border" variant="primary" style={{width: "3rem", height: "3rem"}}/><p className="mt-3">Starting Camera...</p></div>)}
            {gameStatus === "finished" && (<div className="text-center z-3"><h1 className="display-1">🎉</h1><h2>Game Over!</h2><h3>Final Score: {score}</h3><Button size="lg" className="mt-3" onClick={() => onClose()}>Finish</Button></div>)}
            <Webcam ref={webcamRef} mirrored={true} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: gameStatus === "finished" ? 0.2 : 1 }} />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)",
              }}
            />
        </div>
      </div>
    </div>
  );
};

export default ImitationGame;