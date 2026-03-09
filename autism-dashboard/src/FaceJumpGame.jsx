import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "@vladmandic/face-api";
import { Button, Alert } from "react-bootstrap";
import { dashboardAPI } from './config/api';

const WIDTH = 600, HEIGHT = 400, THRESHOLD = 0.5;
const GAME_DURATION = 60; // 60 seconds

export default function FaceJumpGame({ onClose, onComplete }) {
  const webcamRef = useRef();
  const canvasRef = useRef();
  const playerRef = useRef({ x: 30, y: HEIGHT - 70, vy: 0 });
  const expRef = useRef({ happy: 0 });
  const gameStartTimeRef = useRef(null);
  const scoreRef = useRef(0);
  const jumpCountRef = useRef(0);
  
  // Enhanced Analytics
  const maxScoreRef = useRef(0);
  const avgJumpsPerSecondRef = useRef(0);
  const detectedExpressionsRef = useRef([]);
  const maxHeightRef = useRef(0);
  const smileDetectionCountRef = useRef(0);

  const [modelsReady, setModelsReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    let isActive = true;
    (async () => {
      const CDN = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
      await faceapi.nets.tinyFaceDetector.loadFromUri(CDN);
      await faceapi.nets.faceExpressionNet.loadFromUri(CDN);
      setModelsReady(true);
    })();

    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    if (gameActive && timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameActive, timeLeft, gameOver]);

  useEffect(() => {
    if (!gameActive || gameOver || !modelsReady || !cameraReady) return;

    let isActive = true;
    let frame = 0;
    let lastJumpY = playerRef.current.y;

    async function loop() {
      if (!isActive || !gameActive || gameOver) return;
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === 4) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        
        // Background and ground
        ctx.fillStyle = "#cffaff";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(0, HEIGHT - 50, WIDTH, 50);

        // Detect face every 6th frame
        if (frame % 6 === 0) {
          try {
            const det = await faceapi
              .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceExpressions();
            if (det?.expressions) {
              expRef.current = det.expressions;
              detectedExpressionsRef.current.push(det.expressions.happy);
              
              // Track smile detection
              if (det.expressions.happy > THRESHOLD) {
                smileDetectionCountRef.current += 1;
              }
            }
          } catch (_) {}
        }
        frame++;

        // Movement
        let { x, y, vy } = playerRef.current;
        vy = vy + 1; // gravity
        if (expRef.current.happy > THRESHOLD) {
          vy = -15; // smile to jump
          // Track jumps for scoring
          if (y === HEIGHT - 70 && lastJumpY === HEIGHT - 70) {
            jumpCountRef.current += 1;
            scoreRef.current += 10;
          }
        }
        lastJumpY = y;
        x = (x + 3) % WIDTH;
        y = y + vy;
        if (y > HEIGHT - 70) { y = HEIGHT - 70; vy = 0; }
        playerRef.current = { x, y, vy };
        
        // Track max height reached
        const heightFromGround = HEIGHT - 70 - y;
        if (heightFromGround > maxHeightRef.current) {
          maxHeightRef.current = heightFromGround;
        }

        // Draw player
        ctx.fillStyle = "#007AFF";
        ctx.fillRect(x, y, 32, 32);

        // Webcam inset, top-right
        ctx.drawImage(video, WIDTH - 150, 10, 140, 100);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(WIDTH - 150, 10, 140, 100);

        // Instructions and stats
        ctx.font = "18px Verdana";
        ctx.fillStyle = "#044";
        ctx.fillText("😊 Smile = Jump   |   Neutral = Walk", 45, HEIGHT - 60);
        ctx.fillText(`Time: ${timeLeft}s | Score: ${scoreRef.current} | Max Height: ${Math.round(maxHeightRef.current)}`, 45, HEIGHT - 35);

        // Detected expression feedback
        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "#007AFF";
        ctx.fillText(
          `Happy (smile): ${(expRef.current.happy * 100 | 0)}%`,
          45, 35
        );
      }
      requestAnimationFrame(loop);
    }
    loop();

    return () => { isActive = false; };
  }, [gameActive, gameOver, modelsReady, timeLeft]);

  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setTimeLeft(GAME_DURATION);
    gameStartTimeRef.current = Date.now();
    scoreRef.current = 0;
    jumpCountRef.current = 0;
    playerRef.current = { x: 30, y: HEIGHT - 70, vy: 0 };
  };

  const endGame = async () => {
    if (gameOver) return; // Prevent multiple calls
    
    setGameActive(false);
    setGameOver(true);
    
    const duration = gameStartTimeRef.current 
      ? Math.round((Date.now() - gameStartTimeRef.current) / 1000 / 60) 
      : 1;
    const finalScore = scoreRef.current;
    const totalJumps = jumpCountRef.current;
    const accuracy = Math.min(100, Math.round((totalJumps / 30) * 100));
    const avgJumpsPerSecond = GAME_DURATION > 0 ? (totalJumps / GAME_DURATION).toFixed(2) : 0;
    const avgSmileIntensity = detectedExpressionsRef.current.length > 0 
      ? Math.round((detectedExpressionsRef.current.reduce((a, b) => a + b, 0) / detectedExpressionsRef.current.length) * 100) 
      : 0;
    const maxHeightScore = Math.round(maxHeightRef.current);

    // Save to backend
    try {
      const response = await dashboardAPI.saveGameSession({
        gameType: 'face-jump',
        score: finalScore,
        duration: duration || 1,
        moves: totalJumps,
        accuracy: accuracy,
        difficulty: 'medium',
        sessionData: {
          jumps: totalJumps,
          timePlayed: GAME_DURATION - timeLeft,
          maxTime: GAME_DURATION,
          avgJumpsPerSecond: parseFloat(avgJumpsPerSecond),
          maxHeight: maxHeightScore,
          avgSmileIntensity: avgSmileIntensity,
          smileDetectionCount: smileDetectionCountRef.current
        }
      });
      console.log('Game session saved:', response.data);
    } catch (error) {
      console.error('Error saving game session:', error);
    }

    if (onComplete) {
      onComplete({
        gameId: 5,
        name: 'Face Jump',
        points: finalScore,
        accuracyPct: accuracy,
        // Enhanced analytics
        jumps: totalJumps,
        avgJumpsPerSecond: parseFloat(avgJumpsPerSecond),
        maxHeight: maxHeightScore,
        avgSmileIntensity: avgSmileIntensity,
        smileDetectionCount: smileDetectionCountRef.current
      });
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3 style={{ marginBottom: 6 }}>Face Jump Game</h3>
      {!modelsReady && <Alert variant="info" className="mb-3">Loading models...</Alert>}
      
      {cameraError && (
        <Alert variant="danger" className="mb-3">
          <strong>⚠️ Camera Error:</strong> {cameraError}
          <br />
          <small>
            Please allow camera access in your browser settings and refresh the page.
            <br />
            Make sure no other application is using your camera.
          </small>
        </Alert>
      )}
      
      {!cameraReady && !cameraError && (
        <Alert variant="warning" className="mb-3">
          🔄 Requesting camera access... Please allow camera permissions when prompted.
        </Alert>
      )}
      
      {!gameActive && !gameOver && (
        <div className="mb-3">
          <p>Smile to make your character jump! Play for {GAME_DURATION} seconds.</p>
          <Button 
            variant="success" 
            size="lg" 
            onClick={startGame}
            disabled={!modelsReady || !cameraReady || !!cameraError}
          >
            {!cameraReady ? '⏳ Waiting for camera...' : 
             cameraError ? '❌ Camera Error' :
             !modelsReady ? '⏳ Loading models...' :
             'Start Game'}
          </Button>
        </div>
      )}

      {gameOver && (
        <div className="mb-3">
          <Alert variant="success">
            <h4>Game Over!</h4>
            <p>Final Score: {scoreRef.current}</p>
            <p>Jumps: {jumpCountRef.current}</p>
            <p>Max Height: {Math.round(maxHeightRef.current)}</p>
            <p>Avg Jumps/Second: {GAME_DURATION > 0 ? (jumpCountRef.current / GAME_DURATION).toFixed(2) : 0}</p>
            <p>Smile Detection Count: {smileDetectionCountRef.current}</p>
          </Alert>
          <Button variant="primary" onClick={startGame} className="me-2">
            Play Again
          </Button>
        </div>
      )}

      <Webcam
        ref={webcamRef}
        mirrored
        style={{ display: "none" }}
        audio={false}
        onUserMedia={(stream) => {
          setCameraReady(true);
          setCameraError(null);
          console.log('Camera access granted');
        }}
        onUserMediaError={(error) => {
          console.error('Camera error:', error);
          setCameraError(error.message || 'Camera access denied');
          setCameraReady(false);
        }}
        videoConstraints={{ 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }}
      />
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          border: "2px solid #333",
          marginTop: 8,
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",
          background: "#cffaff"
        }}
      />
      <div style={{
        marginTop: 14,
        background: "#e3f8fd",
        borderRadius: 8,
        maxWidth: 430,
        marginLeft: "auto",
        marginRight: "auto",
        padding: 8,
        boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
        color: "#222"
      }}>
        <b>How to play:</b> <br />
        <span>😊 <b>Smile</b> to jump! <br />Neutral face to walk. <br /> Avatar moves left-to-right. <br />
        See your camera top-right.</span>
      </div>
      <Button onClick={onClose} style={{ marginTop: 14 }}>Close</Button>
    </div>
  );
}

