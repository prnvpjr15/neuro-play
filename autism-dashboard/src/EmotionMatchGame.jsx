import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, ProgressBar, Badge } from 'react-bootstrap';
import { FaStopwatch, FaSmile, FaSadTear, FaAngry, FaSurprise, FaMeh, FaTired } from 'react-icons/fa';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

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
       
       <div style={{ 
          display: "grid", 
          gridTemplateColumns: `repeat(${level === 1 ? 2 : level === 2 ? 4 : 4}, 80px)`, 
          gap: 15, 
          justifyContent: "center" 
       }}>
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.uniqueId) || solved.includes(card.uniqueId);
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
                  boxShadow: isFlipped ? "0 4px 10px rgba(0,0,0,0.1)" : "0 4px 6px rgba(0,0,0,0.3)", 
                  transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)", 
                  transition: "all 0.3s" 
                }} 
                disabled={isFlipped || disabled} 
                onClick={() => handleCardClick(card.uniqueId)}
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