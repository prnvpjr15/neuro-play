import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Modal, ProgressBar, Badge } from 'react-bootstrap';
import { FaStopwatch, FaSmile, FaSadTear, FaAngry, FaSurprise, FaMeh, FaTired } from 'react-icons/fa';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Webcam from 'react-webcam';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

// --- DATA ---
const EMOTIONS = [
  { id: 1, name: 'Happy', icon: <FaSmile size={40} color="#FFC107" /> },
  { id: 2, name: 'Sad', icon: <FaSadTear size={40} color="#2196F3" /> },
  { id: 3, name: 'Angry', icon: <FaAngry size={40} color="#F44336" /> },
  { id: 4, name: 'Surprised', icon: <FaSurprise size={40} color="#9C27B0" /> },
  { id: 5, name: 'Neutral', icon: <FaMeh size={40} color="#607D8B" /> },
  { id: 6, name: 'Tired', icon: <FaTired size={40} color="#795548" /> },
];

const EmotionMatchGame = ({ onComplete, t, speak, closeModal }) => {
  // Game Config
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  
  // Session State
  const [timeLeft, setTimeLeft] = useState(600); // 10 Minutes
  const [isGameActive, setIsGameActive] = useState(true);
  const [moves, setMoves] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [gestureMode, setGestureMode] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [handDetected, setHandDetected] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [pointerUi, setPointerUi] = useState({ visible: false, xPct: 0, yPct: 0 });

  const webcamRef = useRef(null);
  const fingerPosRef = useRef(null);
  const cardRefs = useRef({});
  const gridRef = useRef(null);
  const cameraRunnerRef = useRef(null);
  const handsModelRef = useRef(null);
  const hoverStartRef = useRef(0);
  const hoverCardRef = useRef(null);
  const selectionCooldownRef = useRef(0);
  const hasSpokenGestureIntroRef = useRef(false);

  // Helper: Get Card Count
  const getLevelCardCount = (lvl) => {
    switch(lvl) {
      case 1: return 4;
      case 2: return 8;
      case 3: return 12;
      default: return 4;
    }
  };

  // 1. Initialize Level
  const initializeLevel = (currentLevel) => {
    const totalCards = getLevelCardCount(currentLevel);
    const pairCount = totalCards / 2;
    
    // Select emotions for this level
    const selectedEmotions = EMOTIONS.slice(0, pairCount);
    
    // Duplicate and Shuffle
    const shuffled = [...selectedEmotions, ...selectedEmotions]
       .sort(() => Math.random() - 0.5)
       .map((c) => ({ ...c, uniqueId: Math.random() }));
    
    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setDisabled(false);
    
    // Speak Instructions (using props if available, else fallback)
    const instruction = currentLevel === 1 
        ? (t?.instr_emotion_start || "Welcome to Emotion Match") 
        : `${t?.level || "Level"} ${currentLevel}`;
    
    if (speak) speak(instruction);
  };

  // Start Level 1 on Mount
  useEffect(() => {
    initializeLevel(1);
  }, []);

  // Brief bilingual voice intro for hand-gesture mode
  useEffect(() => {
    if (!gestureMode || !speak || hasSpokenGestureIntroRef.current) return;
    const intro =
      "Hand gesture mode is on. Raise one hand and point with your index finger. Move slowly to the card and hold for one second to select. " +
      "हैंड जेस्चर मोड चालू है। एक हाथ ऊपर करें और तर्जनी उंगली से कार्ड की ओर इशारा करें। धीरे-धीरे कार्ड पर ले जाकर एक सेकंड रोकें, कार्ड चुन जाएगा।";
    speak(intro);
    hasSpokenGestureIntroRef.current = true;
  }, [gestureMode, speak]);

  // 2. Timer Logic
  useEffect(() => {
    let timer;
    if (isGameActive && timeLeft > 0 && !showAnalysis) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      finishSession();
    }
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft, showAnalysis]);

  // 2b. Hand Tracking Init/Cleanup
  useEffect(() => {
    let mounted = true;

    const shouldRun = gestureMode && isGameActive && !showAnalysis;
    if (!shouldRun) {
      if (cameraRunnerRef.current) {
        cameraRunnerRef.current.stop();
        cameraRunnerRef.current = null;
      }
      handsModelRef.current = null;
      fingerPosRef.current = null;
      hoverCardRef.current = null;
      hoverStartRef.current = 0;
      setHoveredCardId(null);
      setDwellProgress(0);
      setHandDetected(false);
      setPointerUi({ visible: false, xPct: 0, yPct: 0 });
      return undefined;
    }

    const initHands = async () => {
      try {
        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results) => {
          if (!mounted) return;
          const landmarks = results?.multiHandLandmarks?.[0];
          if (landmarks?.[8]) {
            const indexTip = landmarks[8];
            // Mirror x to match the front-facing webcam experience.
            fingerPosRef.current = { x: 1 - indexTip.x, y: indexTip.y };
            setHandDetected(true);
          } else {
            fingerPosRef.current = null;
            setHandDetected(false);
          }
        });
        handsModelRef.current = hands;

        const waitForVideo = () =>
          new Promise((resolve, reject) => {
            let attempts = 0;
            const timer = setInterval(() => {
              attempts += 1;
              const video = webcamRef.current?.video;
              if (video && video.readyState === 4) {
                clearInterval(timer);
                resolve();
              } else if (attempts > 80) {
                clearInterval(timer);
                reject(new Error('Camera not ready.'));
              }
            }, 100);
          });

        await waitForVideo();
        if (!mounted) return;

        const runner = new Camera(webcamRef.current.video, {
          onFrame: async () => {
            if (handsModelRef.current && webcamRef.current?.video) {
              await handsModelRef.current.send({ image: webcamRef.current.video });
            }
          },
          width: 640,
          height: 480,
        });

        cameraRunnerRef.current = runner;
        await runner.start();
      } catch (err) {
        if (mounted) {
          setCameraError(err?.message || 'Unable to start hand tracking.');
        }
      }
    };

    initHands();

    return () => {
      mounted = false;
      if (cameraRunnerRef.current) {
        cameraRunnerRef.current.stop();
        cameraRunnerRef.current = null;
      }
    };
  }, [gestureMode, isGameActive, showAnalysis]);

  // 2c. Dwell selection using index finger
  useEffect(() => {
    if (!gestureMode || showAnalysis || !isGameActive) return undefined;

    const DWELL_MS = 700;
    const POLL_MS = 80;
    const cooldownMs = 600;

    const timer = setInterval(() => {
      const pointer = fingerPosRef.current;
      const now = Date.now();

      if (!pointer || now < selectionCooldownRef.current) {
        hoverCardRef.current = null;
        hoverStartRef.current = 0;
        setHoveredCardId(null);
        setDwellProgress(0);
        setPointerUi((prev) => ({ ...prev, visible: false }));
        return;
      }

      const gridRect = gridRef.current?.getBoundingClientRect();
      if (!gridRect || gridRect.width <= 0 || gridRect.height <= 0) {
        return;
      }

      // Map normalized finger coordinates to the card grid area.
      const px = gridRect.left + pointer.x * gridRect.width;
      const py = gridRect.top + pointer.y * gridRect.height;
      setPointerUi({
        visible: true,
        xPct: Math.max(0, Math.min(100, pointer.x * 100)),
        yPct: Math.max(0, Math.min(100, pointer.y * 100)),
      });

      let targetCardId = null;
      let closestDist = Number.POSITIVE_INFINITY;
      const SNAP_RADIUS = 95;
      cards.forEach((card) => {
        const btn = cardRefs.current[card.uniqueId];
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(px - cx, py - cy);
        if (dist < closestDist && dist <= SNAP_RADIUS) {
          closestDist = dist;
          targetCardId = card.uniqueId;
        }
      });

      if (!targetCardId) {
        hoverCardRef.current = null;
        hoverStartRef.current = 0;
        setHoveredCardId(null);
        setDwellProgress(0);
        return;
      }

      if (hoverCardRef.current !== targetCardId) {
        hoverCardRef.current = targetCardId;
        hoverStartRef.current = now;
        setHoveredCardId(targetCardId);
        setDwellProgress(0);
        return;
      }

      const elapsed = now - hoverStartRef.current;
      const progress = Math.min(100, Math.round((elapsed / DWELL_MS) * 100));
      setDwellProgress(progress);
      setHoveredCardId(targetCardId);

      if (elapsed >= DWELL_MS) {
        handleCardClick(targetCardId);
        selectionCooldownRef.current = now + cooldownMs;
        hoverCardRef.current = null;
        hoverStartRef.current = 0;
        setHoveredCardId(null);
        setDwellProgress(0);
      }
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [gestureMode, showAnalysis, isGameActive, cards, flipped, solved, disabled]);

  // 3. Handle Card Click
  const handleCardClick = (id) => {
    if (disabled || showAnalysis) return;
    if (flipped.includes(id) || solved.includes(id)) return;

    if (flipped.length === 0) {
      setFlipped([id]);
    } else {
      setDisabled(true);
      setFlipped([...flipped, id]);
      setMoves(m => m + 1);

      const first = cards.find(c => c.uniqueId === flipped[0]);
      const second = cards.find(c => c.uniqueId === id);

      if (first.id === second.id) {
        setSolved(prev => [...prev, flipped[0], id]);
        setFlipped([]);
        setDisabled(false);
        if (speak) speak(t?.instr_emotion_match || "Match found!");
      } else {
        setWrongAttempts(w => w + 1);
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  // 4. Check Level Completion
  useEffect(() => {
    if (cards.length > 0 && solved.length === cards.length) {
      if (level < 3) {
        setTimeout(() => {
          setLevel(prev => prev + 1);
          initializeLevel(level + 1);
        }, 1000);
      } else {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        finishSession();
      }
    }
  }, [solved, cards, level]);

  const finishSession = () => {
    setIsGameActive(false);
    setShowAnalysis(true);
  };

  const handleFinish = () => {
    const accuracy = moves > 0 ? Math.round(((moves - wrongAttempts) / moves) * 100) : 0;
    // Call parent handler to save stats to dashboard
    if (onComplete) {
        onComplete({
            level,
            moves,
            accuracy,
            timeSpent: 600 - timeLeft,
            completed: level === 3 && solved.length === 12
        });
    }
    // Close the modal
    if (closeModal) closeModal();
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const accuracy = moves > 0 ? Math.round(((moves - wrongAttempts) / moves) * 100) : 0;

  // --- RENDER ANALYSIS (Internal View) ---
  if (showAnalysis) {
    return (
      <div className="p-4 text-center">
        <h2 className="mb-4 fw-bold text-primary">Session Analysis</h2>
        <Row className="g-4 mb-4">
           <Col xs={4}><div className="p-3 bg-light rounded-3"><small className="text-muted d-block">{t?.level || "Level"}</small><h3 className="fw-bold">{level} / 3</h3></div></Col>
           <Col xs={4}><div className="p-3 bg-light rounded-3"><small className="text-muted d-block">Accuracy</small><h3 className="fw-bold">{accuracy}%</h3></div></Col>
           <Col xs={4}><div className="p-3 bg-light rounded-3"><small className="text-muted d-block">Time</small><h3 className="fw-bold">{formatTime(600 - timeLeft)}</h3></div></Col>
        </Row>
        <p className="text-muted mb-4">
            {accuracy > 80 ? "Excellent focus! You recognized emotions very quickly." : "Good effort! Try to remember the card positions to improve accuracy."}
        </p>
        <Button variant="primary" size="lg" className="rounded-pill px-5" onClick={handleFinish}>
           {t?.finish || "Finish"} & Save
        </Button>
      </div>
    );
  }

  // --- RENDER GAME GRID ---
  return (
    <div className="text-center p-3">
       <div className="d-flex justify-content-between align-items-center mb-4 px-3">
          <Badge bg="primary" className="px-3 py-2">{t?.level || "Level"} {level} / 3</Badge>
          <div className={`fw-bold h4 mb-0 ${timeLeft < 60 ? 'text-danger' : 'text-dark'}`}>
             <FaStopwatch className="me-2" />
             {formatTime(timeLeft)}
          </div>
          <Button variant="outline-danger" size="sm" onClick={finishSession}>{t?.finish || "End"}</Button>
       </div>

       <div className="d-flex justify-content-center align-items-center gap-2 mb-3 flex-wrap">
         <Button
           size="sm"
           variant={gestureMode ? 'success' : 'outline-success'}
           onClick={() => {
             setGestureMode((prev) => !prev);
             setCameraError(null);
             if (gestureMode) {
               hasSpokenGestureIntroRef.current = false;
             }
           }}
         >
           {gestureMode ? 'Hand Gesture: ON' : 'Hand Gesture: OFF'}
         </Button>
         {gestureMode && (
           <small className="text-muted">Raise one hand and point with index finger.</small>
         )}
       </div>

       {gestureMode && (
         <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
           <Webcam
             ref={webcamRef}
             mirrored
             audio={false}
             style={{ width: 160, height: 120, borderRadius: 10, border: '2px solid #ddd', objectFit: 'cover' }}
             onUserMedia={() => {
               setCameraReady(true);
               setCameraError(null);
             }}
             onUserMediaError={(err) => {
               setCameraReady(false);
               setCameraError(err?.message || 'Camera permission denied');
             }}
             videoConstraints={{ facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }}
           />
           <div className="text-start">
             <div><strong>Camera:</strong> {cameraReady ? 'Ready' : 'Waiting'}</div>
             <div><strong>Hand:</strong> {handDetected ? 'Detected' : 'Not detected'}</div>
             <div><strong>Select hold:</strong> {hoveredCardId ? `${dwellProgress}%` : '0%'}</div>
             <div className="small text-muted mt-1">Keep your hand 1-2 feet from camera and move slowly.</div>
             {cameraError && <div className="text-danger small">{cameraError}</div>}
           </div>
         </div>
       )}
       
      <div
        ref={gridRef}
        style={{
          position: 'relative',
          display: "grid", 
          gridTemplateColumns: `repeat(${level === 1 ? 2 : level === 2 ? 4 : 4}, 80px)`, 
          gap: 15, 
          justifyContent: "center" 
      }}>
          {gestureMode && pointerUi.visible && (
            <div
              style={{
                position: 'absolute',
                left: `${pointerUi.xPct}%`,
                top: `${pointerUi.yPct}%`,
                transform: 'translate(-50%, -50%)',
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '3px solid #00e5ff',
                background: 'rgba(0, 229, 255, 0.2)',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
          )}
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.uniqueId) || solved.includes(card.uniqueId);
            const isTargeted = gestureMode && hoveredCardId === card.uniqueId;
            return (
              <motion.button 
                key={card.uniqueId} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                style={{ 
                  width: 80, height: 80, fontSize: "2.5rem", 
                  cursor: isFlipped ? "default" : "pointer", 
                  backgroundColor: isFlipped ? "#fff" : "#2d3748", 
                  borderRadius: 16, border: "none", 
                  boxShadow: isTargeted
                    ? `0 0 0 4px #00e5ff, 0 0 16px rgba(0,229,255,0.7)`
                    : (isFlipped ? "0 4px 10px rgba(0,0,0,0.1)" : "0 4px 6px rgba(0,0,0,0.3)"), 
                  transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)", 
                  transition: "all 0.3s" 
                }} 
                disabled={isFlipped || disabled} 
                onClick={() => handleCardClick(card.uniqueId)}
                ref={(el) => {
                  if (el) cardRefs.current[card.uniqueId] = el;
                  else delete cardRefs.current[card.uniqueId];
                }}
              >
                {isFlipped ? card.icon : <span style={{opacity: 0.2}}>?</span>}
              </motion.button>
            );
          })}
       </div>
    </div>
  );
};

export default EmotionMatchGame;