import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import { FaHeadphones, FaVolumeUp, FaCheck, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

// --- AUDIO ENGINE ---
const playSpatialSound = (type, pan) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const panner = ctx.createStereoPanner();

  // Configure Sound
  if (type === "high") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // High A5
  } else {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, ctx.currentTime); // Low A3
  }

  // Configure Pan (-1 = Left, 0 = Center, 1 = Right)
  panner.pan.value = pan;

  // Connect
  osc.connect(gain);
  gain.connect(panner);
  panner.connect(ctx.destination);

  // Envelope
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};

const SHORT_SUCCESS_PHRASES = [
  "Correct!", "Nice!", "Good!", "Right!", "Got it!", "Yes!"
];

const SoundScapeGame = ({ onComplete, onClose, speak, t }) => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("intro"); // intro, playing, feedback, finished
  const [target, setTarget] = useState(null); 
  const [feedback, setFeedback] = useState(null); // 'correct', 'wrong'
  const lastSpokenPhrase = useRef("");

  // VOICE: Intro (Only runs once when game opens)
  useEffect(() => {
    if (status === "intro" && speak && t) {
        speak(t.instr_sound_start); // Long introductory text
    }
  }, [status, speak, t]);

  const generateRound = () => {
    const types = ["high", "low"];
    const pans = [-1, 1]; 
    
    const newTarget = {
      type: types[Math.floor(Math.random() * types.length)],
      pan: pans[Math.floor(Math.random() * pans.length)]
    };
    
    setTarget(newTarget);
    setStatus("playing");
    setFeedback(null);
    
    // Play sound after short delay so user is ready
    setTimeout(() => {
        playSpatialSound(newTarget.type, newTarget.pan);
    }, 800);
  };

  const handleGuess = (type, pan) => {
    if (status !== "playing") return;

    let isCorrect = false;

    // Check Match
    if (type === target.type && pan === target.pan) {
      setScore(s => s + 100);
      setFeedback("correct");
      isCorrect = true;

      // VOICE: Random SHORT phrase
      if (speak) {
          const availablePhrases = SHORT_SUCCESS_PHRASES.filter(p => p !== lastSpokenPhrase.current);
          const randomPhrase = availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
          lastSpokenPhrase.current = randomPhrase;
          speak(randomPhrase);
      }
    } else {
      setFeedback("wrong");
      if (speak) speak("Wrong. Listen again.");
    }

    setStatus("feedback");
    
    // DELAY NEXT ROUND to allow voice to finish
    setTimeout(() => {
      if (round < 10) { 
        setRound(r => r + 1);
        generateRound();
      } else {
        setStatus("finished");
        if(speak) speak("Session complete!");
      }
    }, 2000); // 2 second pause
  };

  const repeatSound = () => {
    if (target && (status === "playing" || status === "feedback")) {
      playSpatialSound(target.type, target.pan);
    }
  };

  // Finish Handler
  const finishGame = () => {
    if (onComplete) {
        onComplete({
            points: score,
            rounds: 10,
            accuracyPct: Math.round((score / 1000) * 100)
        });
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center bg-dark text-white h-100 w-100 position-absolute top-0 start-0">
      
      {/* Header */}
      <div className="position-absolute top-0 w-100 p-3 d-flex justify-content-between align-items-center">
        <h4><FaHeadphones className="me-2 text-info" /> Sound Scape</h4>
        <div className="d-flex gap-4">
           <h4>Score: <span className="text-warning">{score}</span></h4>
           <h4>Round: <span className="text-info">{round}/10</span></h4>
        </div>
        <Button variant="danger" onClick={onClose}>Exit</Button>
      </div>

      {/* Intro Screen */}
      {status === "intro" && (
        <div className="text-center p-5">
            <h1>🎧 Headphones Required</h1>
            <p className="lead my-4">Listen carefully. Click the button that matches the sound location and pitch.</p>
            <ul className="text-start d-inline-block mb-5 text-muted small">
                <li>High Pitch = Top Buttons</li>
                <li>Low Pitch = Bottom Buttons</li>
                <li>Left Ear = Left Buttons</li>
                <li>Right Ear = Right Buttons</li>
            </ul>
            <br/>
            <Button size="lg" variant="primary" onClick={() => { setRound(1); generateRound(); }}>Start Listening</Button>
        </div>
      )}

      {/* Feedback Overlay */}
      {status === "feedback" && (
         <motion.div 
           initial={{ scale: 0 }} animate={{ scale: 1 }}
           className="position-absolute z-3 display-1"
         >
            {feedback === "correct" ? <FaCheck className="text-success" /> : <FaTimes className="text-danger" />}
         </motion.div>
      )}

      {/* Game Grid */}
      {(status === "playing" || status === "feedback") && (
        <div className="d-flex gap-5 align-items-center">
           {/* LEFT SIDE */}
           <div className="d-flex flex-column gap-3">
              <Button 
                variant="outline-info" 
                style={{width: '200px', height: '150px', fontSize: '1.5rem'}}
                onClick={() => handleGuess('high', -1)}
              >
                High Pitch<br/>(Left)
              </Button>
              <Button 
                variant="outline-warning" 
                style={{width: '200px', height: '150px', fontSize: '1.5rem'}}
                onClick={() => handleGuess('low', -1)}
              >
                Low Pitch<br/>(Left)
              </Button>
           </div>

           {/* CENTER CONTROLS */}
           <div className="d-flex flex-column justify-content-center align-items-center mx-5">
               <motion.button 
                 whileTap={{ scale: 0.9 }}
                 className="btn btn-light rounded-circle p-4 shadow"
                 onClick={repeatSound}
                 title="Replay Sound"
               >
                  <FaVolumeUp size={40} color="#333" />
               </motion.button>
               <p className="mt-2 text-muted">Replay</p>
           </div>

           {/* RIGHT SIDE */}
           <div className="d-flex flex-column gap-3">
              <Button 
                variant="outline-info" 
                style={{width: '200px', height: '150px', fontSize: '1.5rem'}}
                onClick={() => handleGuess('high', 1)}
              >
                High Pitch<br/>(Right)
              </Button>
              <Button 
                variant="outline-warning" 
                style={{width: '200px', height: '150px', fontSize: '1.5rem'}}
                onClick={() => handleGuess('low', 1)}
              >
                Low Pitch<br/>(Right)
              </Button>
           </div>
        </div>
      )}

      {/* Finish Screen */}
      {status === "finished" && (
         <div className="text-center">
            <h1 className="mb-3">Session Complete!</h1>
            <h3>Final Score: <span className="text-success">{score}</span></h3>
            <Button size="lg" variant="success" className="mt-4 px-5" onClick={finishGame}>Save Progress</Button>
         </div>
      )}

    </div>
  );
};

export default SoundScapeGame;