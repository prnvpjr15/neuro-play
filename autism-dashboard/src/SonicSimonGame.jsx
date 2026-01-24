import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, ProgressBar, Alert, Badge } from "react-bootstrap";
import { FaMusic, FaPlay, FaRedo, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

// --- AUDIO ENGINE ---
// Generates soft synthesizer sounds using Web Audio API
const playTone = (freq, type = "sine", duration = 0.5) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
  // Envelope to avoid clicking sounds (Fade in/out)
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
};

// --- GAME CONFIG ---
const PADS = [
  { id: 0, color: "#FF5252", name: "Red", freq: 261.63 }, // C4
  { id: 1, color: "#448AFF", name: "Blue", freq: 329.63 }, // E4
  { id: 2, color: "#69F0AE", name: "Green", freq: 392.00 }, // G4
  { id: 3, color: "#FFD740", name: "Yellow", freq: 523.25 } // C5
];

const SonicSimonGame = ({ onComplete, onClose }) => {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false); // Computer is playing?
  const [gameStatus, setGameStatus] = useState("idle"); // idle, playing, success, gameover
  const [activePad, setActivePad] = useState(null); // Which pad is lighting up?
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Press Start to Begin");

  // Start New Game
  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setScore(0);
    setRound(1);
    setGameStatus("playing");
    setMessage("Listen...");
    addToSequence([]); // Start with empty to add first
  };

  // Add Step to Sequence
  const addToSequence = (currentSeq) => {
    const nextPad = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextPad];
    setSequence(newSeq);
    setPlayerSequence([]);
    
    // Play the sequence after a small delay
    setTimeout(() => playSequence(newSeq), 1000);
  };

  // Play Full Sequence
  const playSequence = async (seq) => {
    setIsPlaying(true);
    setMessage(`Round ${seq.length}: Listen...`);
    
    for (let i = 0; i < seq.length; i++) {
      const padId = seq[i];
      await highlightPad(padId);
    }
    
    setIsPlaying(false);
    setMessage("Your Turn!");
  };

  // Flash Pad & Play Sound
  const highlightPad = (padId) => {
    return new Promise((resolve) => {
      setActivePad(padId);
      const pad = PADS.find(p => p.id === padId);
      playTone(pad.freq);
      
      setTimeout(() => {
        setActivePad(null);
        setTimeout(resolve, 300); // Gap between notes
      }, 500); // Note duration
    });
  };

  // Handle Player Tap
  const handlePadClick = (padId) => {
    if (isPlaying || gameStatus !== "playing") return;

    // Visual feedback immediately
    const pad = PADS.find(p => p.id === padId);
    playTone(pad.freq, "triangle", 0.3); 
    
    const newPlayerSeq = [...playerSequence, padId];
    setPlayerSequence(newPlayerSeq);

    // Check Logic
    const currentIndex = newPlayerSeq.length - 1;
    if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      // WRONG!
      setGameStatus("gameover");
      setMessage("Oops! Wrong Note.");
      playTone(150, "sawtooth", 0.8); // Error buzz
    } else {
      // CORRECT SO FAR
      if (newPlayerSeq.length === sequence.length) {
        // ROUND COMPLETE
        const newScore = score + (sequence.length * 10);
        setScore(newScore);
        setMessage("Good Job! Next pattern...");
        setTimeout(() => {
            setRound(r => r + 1);
            addToSequence(sequence);
        }, 1000);
      }
    }
  };

  const handleFinish = () => {
    onComplete({
      points: score,
      maxSequence: sequence.length - 1, // Minus 1 because current seq failed or ended
      accuracyPct: 100 // Simplified
    });
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center bg-dark text-white h-100 w-100 position-absolute top-0 start-0">
      
      {/* Header */}
      <div className="position-absolute top-0 w-100 p-3 d-flex justify-content-between align-items-center bg-secondary bg-opacity-50">
        <h4><FaMusic className="me-2 text-info" />Echo Explorers</h4>
        <div className="d-flex gap-4">
          <h4>Score: <span className="text-warning">{score}</span></h4>
          <h4>Round: <span className="text-info">{round}</span></h4>
        </div>
        <Button variant="danger" onClick={onClose}>Exit</Button>
      </div>

      {/* Game Board */}
      <div className="text-center">
        <h2 className="mb-5" style={{minHeight: '40px'}}>{message}</h2>

        {gameStatus === "gameover" ? (
          <motion.div initial={{scale: 0.5}} animate={{scale: 1}} className="bg-white text-dark p-5 rounded-4 shadow-lg">
            <h1 className="text-danger display-4 mb-3">Game Over!</h1>
            <h3>You remembered {sequence.length - 1} notes!</h3>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button size="lg" variant="outline-dark" onClick={startGame}><FaRedo /> Try Again</Button>
              <Button size="lg" variant="primary" onClick={handleFinish}><FaCheckCircle /> Save Score</Button>
            </div>
          </motion.div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "150px 150px", 
            gap: "20px",
            transform: "rotate(45deg)" // Diamond layout
          }}>
            {PADS.map((pad) => (
              <motion.div
                key={pad.id}
                whileTap={{ scale: 0.9 }}
                animate={{ 
                  scale: activePad === pad.id ? 1.1 : 1,
                  filter: activePad === pad.id ? "brightness(1.5)" : "brightness(1)"
                }}
                onClick={() => handlePadClick(pad.id)}
                style={{
                  width: "150px",
                  height: "150px",
                  backgroundColor: pad.color,
                  borderRadius: "25px",
                  cursor: isPlaying ? "not-allowed" : "pointer",
                  boxShadow: `0 0 20px ${pad.color}40`,
                  opacity: isPlaying && activePad !== pad.id ? 0.5 : 1
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Start Overlay */}
      {gameStatus === "idle" && (
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            className="btn btn-success btn-lg rounded-pill px-5 py-3 fs-3 shadow-lg"
            onClick={startGame}
          >
            <FaPlay className="me-3" /> Start Listening
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default SonicSimonGame;