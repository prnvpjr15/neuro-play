import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { Button, Spinner, Badge } from "react-bootstrap";
import { FaHandPaper } from "react-icons/fa";

// ─── Bubble Config ───
const BUBBLE_RADIUS_MIN = 28;
const BUBBLE_RADIUS_MAX = 50;
const BUBBLE_SPAWN_INTERVAL = 900; // ms
const GAME_DURATION = 60; // seconds
const BUBBLE_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F1948A", "#82E0AA"
];

const EMOJI_SET = ["🫧", "⭐", "🎈", "💎", "🍬", "🌸", "🦋", "🎯"];

const SHORT_SUCCESS_PHRASES = [
  "Pop!", "Nice!", "Got it!", "Great!", "Boom!", "Yes!", "Awesome!"
];

// ─── Component ───
const MagicHandsGame = ({ onComplete, onClose, speak, t }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const bubblesRef = useRef([]);
  const particlesRef = useRef([]);
  const fingerPosRef = useRef(null);
  const handLandmarksRef = useRef(null);
  const statsRef = useRef({ popped: 0, total: 0, missed: 0 });
  const animFrameRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const cameraRef = useRef(null);
  const handsModelRef = useRef(null);
  const lastSpokenRef = useRef("");
  const hasSpokenIntro = useRef(false);
  const gameStartTimeRef = useRef(null);

  const [gameStatus, setGameStatus] = useState("loading"); // loading | playing | finished
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [totalBubbles, setTotalBubbles] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  // ─── Voice intro ───
  useEffect(() => {
    if (gameStatus === "playing" && speak && t && !hasSpokenIntro.current) {
      const introText = t.instr_magic_start || "Welcome to Magic Hands! Use your index finger to pop the bubbles!";
      speak(introText);
      hasSpokenIntro.current = true;
    }
  }, [gameStatus, speak, t]);

  // ─── Create a bubble ───
  const createBubble = useCallback((canvasW, canvasH) => {
    const radius = BUBBLE_RADIUS_MIN + Math.random() * (BUBBLE_RADIUS_MAX - BUBBLE_RADIUS_MIN);
    const speed = 1.2 + Math.random() * 1.8;
    return {
      id: Date.now() + Math.random(),
      x: radius + Math.random() * (canvasW - radius * 2),
      y: -radius,
      radius,
      speed,
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      emoji: EMOJI_SET[Math.floor(Math.random() * EMOJI_SET.length)],
      wobbleOffset: Math.random() * Math.PI * 2,
      opacity: 1,
      popping: false,
      popFrame: 0,
    };
  }, []);

  // ─── Create pop particles ───
  const createParticles = (x, y, color) => {
    const particles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color,
        life: 1,
        decay: 0.03 + Math.random() * 0.02,
      });
    }
    return particles;
  };

  // ─── Draw hand skeleton ───
  const drawHand = (ctx, landmarks, w, h) => {
    if (!landmarks || landmarks.length === 0) return;

    const connections = [
      [0,1],[1,2],[2,3],[3,4],       // thumb
      [0,5],[5,6],[6,7],[7,8],       // index
      [0,9],[9,10],[10,11],[11,12],  // middle
      [0,13],[13,14],[14,15],[15,16],// ring
      [0,17],[17,18],[18,19],[19,20],// pinky
      [5,9],[9,13],[13,17]           // palm
    ];

    // Draw connections
    ctx.strokeStyle = "rgba(0, 255, 200, 0.6)";
    ctx.lineWidth = 2;
    connections.forEach(([a, b]) => {
      const pA = landmarks[a];
      const pB = landmarks[b];
      if (pA && pB) {
        ctx.beginPath();
        ctx.moveTo(pA.x * w, pA.y * h);
        ctx.lineTo(pB.x * w, pB.y * h);
        ctx.stroke();
      }
    });

    // Draw joints
    landmarks.forEach((lm, i) => {
      const px = lm.x * w;
      const py = lm.y * h;
      const isFingerTip = [4, 8, 12, 16, 20].includes(i);
      ctx.beginPath();
      ctx.arc(px, py, isFingerTip ? 6 : 3, 0, Math.PI * 2);
      ctx.fillStyle = i === 8 ? "#FF0" : (isFingerTip ? "#0FF" : "#0F0");
      ctx.fill();
    });

    // Index finger tip glow
    const indexTip = landmarks[8];
    if (indexTip) {
      const ix = indexTip.x * w;
      const iy = indexTip.y * h;
      const glow = ctx.createRadialGradient(ix, iy, 0, ix, iy, 30);
      glow.addColorStop(0, "rgba(255, 255, 0, 0.5)");
      glow.addColorStop(1, "rgba(255, 255, 0, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ix, iy, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // ─── MediaPipe hands callback ───
  const onHandResults = useCallback((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      handLandmarksRef.current = landmarks;
      // Index finger tip = landmark 8
      const indexTip = landmarks[8];
      fingerPosRef.current = { x: indexTip.x, y: indexTip.y };
    } else {
      fingerPosRef.current = null;
      handLandmarksRef.current = null;
    }
  }, []);

  // ─── Load MediaPipe model ───
  useEffect(() => {
    let mounted = true;

    const initHands = async () => {
      try {
        const hands = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onHandResults);
        handsModelRef.current = hands;

        // Wait for webcam to be ready
        const waitForVideo = () => {
          return new Promise((resolve) => {
            const check = setInterval(() => {
              if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
                clearInterval(check);
                resolve();
              }
            }, 100);
          });
        };

        await waitForVideo();

        if (!mounted) return;

        const camera = new Camera(webcamRef.current.video, {
          onFrame: async () => {
            if (handsModelRef.current && webcamRef.current && webcamRef.current.video) {
              await handsModelRef.current.send({ image: webcamRef.current.video });
            }
          },
          width: 640,
          height: 480,
        });
        cameraRef.current = camera;
        await camera.start();

        if (mounted) {
          setGameStatus("playing");
          gameStartTimeRef.current = Date.now();
        }
      } catch (err) {
        console.error("Failed to initialize MediaPipe Hands:", err);
        alert("Error loading hand tracker. Please refresh and allow camera access.");
      }
    };

    initHands();

    return () => {
      mounted = false;
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [onHandResults]);

  // ─── Timer ───
  useEffect(() => {
    let timer;
    if (gameStatus === "playing" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (gameStatus === "playing" && timeLeft <= 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameStatus, timeLeft]);

  // ─── Spawn bubbles ───
  useEffect(() => {
    if (gameStatus !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    spawnTimerRef.current = setInterval(() => {
      const newBubble = createBubble(canvas.width, canvas.height);
      bubblesRef.current.push(newBubble);
      statsRef.current.total += 1;
      setTotalBubbles((prev) => prev + 1);
    }, BUBBLE_SPAWN_INTERVAL);

    return () => clearInterval(spawnTimerRef.current);
  }, [gameStatus, createBubble]);

  // ─── Game loop ───
  useEffect(() => {
    if (gameStatus !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 480;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw hand skeleton
      drawHand(ctx, handLandmarksRef.current, canvas.width, canvas.height);

      // Update & draw bubbles
      const fingerPos = fingerPosRef.current;
      const aliveBubbles = [];

      bubblesRef.current.forEach((bubble) => {
        if (bubble.popping) {
          bubble.popFrame++;
          if (bubble.popFrame > 10) return; // remove
          // Draw pop effect
          ctx.globalAlpha = 1 - bubble.popFrame / 10;
          ctx.beginPath();
          ctx.arc(bubble.x, bubble.y, bubble.radius + bubble.popFrame * 3, 0, Math.PI * 2);
          ctx.strokeStyle = bubble.color;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
          aliveBubbles.push(bubble);
          return;
        }

        // Move bubble down with wobble
        bubble.y += bubble.speed;
        bubble.x += Math.sin(bubble.wobbleOffset + bubble.y * 0.02) * 0.8;

        // Check if missed
        if (bubble.y > canvas.height + bubble.radius) {
          statsRef.current.missed += 1;
          setCombo(0);
          return; // remove
        }

        // Collision detection with finger
        if (fingerPos) {
          const fx = fingerPos.x * canvas.width;
          const fy = fingerPos.y * canvas.height;
          const dx = fx - bubble.x;
          const dy = fy - bubble.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < bubble.radius + 15) {
            // POP!
            bubble.popping = true;
            bubble.popFrame = 0;
            statsRef.current.popped += 1;

            // Particles
            particlesRef.current.push(...createParticles(bubble.x, bubble.y, bubble.color));

            setScore((prev) => prev + 1);
            setCombo((prev) => {
              const newCombo = prev + 1;
              setBestCombo((best) => Math.max(best, newCombo));
              return newCombo;
            });

            // Speak success
            if (speak) {
              const available = SHORT_SUCCESS_PHRASES.filter((p) => p !== lastSpokenRef.current);
              const phrase = available[Math.floor(Math.random() * available.length)];
              lastSpokenRef.current = phrase;
              // Only speak occasionally to not spam
              if (statsRef.current.popped % 3 === 1) {
                speak(phrase);
              }
            }

            aliveBubbles.push(bubble);
            return;
          }
        }

        // Draw bubble
        // Glow
        const glow = ctx.createRadialGradient(
          bubble.x, bubble.y, bubble.radius * 0.3,
          bubble.x, bubble.y, bubble.radius
        );
        glow.addColorStop(0, bubble.color + "CC");
        glow.addColorStop(1, bubble.color + "33");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.beginPath();
        ctx.arc(
          bubble.x - bubble.radius * 0.25,
          bubble.y - bubble.radius * 0.25,
          bubble.radius * 0.35,
          0, Math.PI * 2
        );
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fill();

        // Emoji
        ctx.font = `${bubble.radius * 0.7}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(bubble.emoji, bubble.x, bubble.y + 2);

        // Border
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        aliveBubbles.push(bubble);
      });

      bubblesRef.current = aliveBubbles;

      // Update & draw particles
      const aliveParticles = [];
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= p.decay;

        if (p.life <= 0) return;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        aliveParticles.push(p);
      });
      particlesRef.current = aliveParticles;

      // Draw finger cursor if present
      if (fingerPos) {
        const fx = fingerPos.x * canvas.width;
        const fy = fingerPos.y * canvas.height;

        // Outer ring
        ctx.beginPath();
        ctx.arc(fx, fy, 18, 0, Math.PI * 2);
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(fx, fy, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#FFD700";
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameStatus, speak]);

  // ─── End game ───
  const endGame = useCallback(() => {
    setGameStatus("finished");
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (cameraRef.current) cameraRef.current.stop();

    const s = statsRef.current;
    const accuracy = s.total > 0 ? Math.round((s.popped / s.total) * 100) : 0;
    const timeSpent = gameStartTimeRef.current
      ? Math.round((Date.now() - gameStartTimeRef.current) / 1000)
      : GAME_DURATION;

    if (onComplete) {
      onComplete({
        bubblesPopped: s.popped,
        totalBubbles: s.total,
        accuracy,
        timeSpent,
      });
    }
  }, [onComplete]);

  const accuracyPct = totalBubbles > 0 ? Math.round((score / totalBubbles) * 100) : 0;

  return (
    <div
      className="d-flex flex-column bg-dark text-white"
      style={{ height: "100vh", width: "100vw", overflow: "hidden" }}
    >
      {/* ─── header ─── */}
      <div className="p-3 d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(90deg, #0d9488 0%, #2dd4bf 100%)" }}>
        <h4 className="mb-0 d-flex align-items-center">
          <FaHandPaper className="me-2 text-warning" />
          Magic Hands
        </h4>
        <div className="d-flex gap-4 align-items-center">
          <h5 className="mb-0">
            🫧 <span className="text-warning fw-bold">{score}</span>
            <small className="text-white-50 ms-1">/ {totalBubbles}</small>
          </h5>
          {combo > 1 && (
            <Badge bg="warning" text="dark" className="fs-6 px-3 py-2" style={{ animation: "pulse 0.5s" }}>
              🔥 x{combo}
            </Badge>
          )}
          <h5 className={`mb-0 ${timeLeft < 10 ? "text-danger" : "text-white"}`}>
            ⏳ {timeLeft}s
          </h5>
        </div>
        <Button variant="danger" onClick={onClose}>
          Exit
        </Button>
      </div>

      {/* ─── Main area ─── */}
      <div className="flex-grow-1 d-flex">
        {/* Left panel – instructions */}
        <div
          className="d-flex flex-column align-items-center justify-content-center p-4 text-center"
          style={{ width: "280px", backgroundColor: "#134e4a" }}
        >
          {gameStatus === "loading" && (
            <div>
              <Spinner animation="border" variant="info" style={{ width: "3rem", height: "3rem" }} />
              <p className="mt-3 text-info">Loading hand tracker...</p>
              <small className="text-white-50">Please allow camera access</small>
            </div>
          )}

          {gameStatus === "playing" && (
            <>
              <div
                className="p-4 rounded-4 mb-4"
                style={{ background: "rgba(255,255,255,0.08)", width: "100%" }}
              >
                <div style={{ fontSize: "3rem" }}>☝️</div>
                <h5 className="mt-2 text-info">Use your finger</h5>
                <p className="text-white-50 small mb-0">
                  Point at the bubbles to pop them!
                </p>
              </div>

              <div className="w-100 text-start p-3 rounded-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-white-50 small">Accuracy</span>
                  <span className="fw-bold text-info">{accuracyPct}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
                  <div
                    style={{
                      width: `${accuracyPct}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #2dd4bf, #06b6d4)",
                      borderRadius: 3,
                      transition: "width 0.3s",
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between mt-3 mb-1">
                  <span className="text-white-50 small">Best Combo</span>
                  <span className="fw-bold text-warning">🔥 {bestCombo}</span>
                </div>

                <div className="d-flex justify-content-between mt-2 mb-1">
                  <span className="text-white-50 small">Missed</span>
                  <span className="fw-bold text-danger">{totalBubbles - score}</span>
                </div>
              </div>
            </>
          )}

          {gameStatus === "finished" && (
            <div>
              <div style={{ fontSize: "4rem" }}>🎉</div>
              <h2 className="text-warning mt-2">Game Over!</h2>
              <h3 className="text-info">{accuracyPct}% Accuracy</h3>
              <p className="text-white-50">
                {score} / {totalBubbles} bubbles popped
              </p>
              <Button size="lg" variant="info" className="mt-3 rounded-pill px-4" onClick={onClose}>
                Finish
              </Button>
            </div>
          )}
        </div>

        {/* Right panel – webcam + canvas */}
        <div className="flex-grow-1 position-relative bg-black d-flex align-items-center justify-content-center">
          <Webcam
            ref={webcamRef}
            mirrored={true}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: gameStatus === "finished" ? 0.2 : 0.7,
            }}
            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)", // mirror to match webcam
            }}
          />

          {/* Overlay for finished state */}
          {gameStatus === "finished" && (
            <div className="position-absolute text-center z-3">
              <h1 className="display-1">🫧</h1>
              <h2>Great Job!</h2>
              <h3>
                Score: <span className="text-info">{score}</span> / {totalBubbles}
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagicHandsGame;
