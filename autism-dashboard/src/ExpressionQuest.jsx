import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Button, Alert, Card, Row, Col, ProgressBar } from "react-bootstrap";
import * as faceapi from 'face-api.js';
import { dashboardAPI } from './config/api';

const emotionStages = [
  { id: 1, name: "happy", emoji: "😊", description: "Show a big smile!", points: 20 },
  { id: 2, name: "sad", emoji: "😞", description: "Make a sad face", points: 20 },
  { id: 3, name: "angry", emoji: "😠", description: "Show an angry expression", points: 20 },
  { id: 4, name: "surprised", emoji: "😱", description: "Look surprised!", points: 20 },
  { id: 5, name: "fearful", emoji: "😨", description: "Show fear", points: 20 },
  { id: 6, name: "disgusted", emoji: "🤢", description: "Show disgust", points: 20 },
];

const ExpressionQuest = ({ onClose, onComplete }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const webcamRef = useRef(null);
  
  // Enhanced Analytics
  const [emotionSuccessRate, setEmotionSuccessRate] = useState({});
  const [fastestEmotionDetection, setFastestEmotionDetection] = useState(null);
  const [slowestEmotionDetection, setSlowestEmotionDetection] = useState(null);
  const [emotionDetectionTimes, setEmotionDetectionTimes] = useState({});
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [maxConsecutive, setMaxConsecutive] = useState(0);
  const [bestEmotion, setBestEmotion] = useState(null);

  useEffect(() => {
    setGameStartTime(Date.now());
    const loadModels = async () => {
      try {
        const CDN = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
        await faceapi.nets.tinyFaceDetector.loadFromUri(CDN);
        await faceapi.nets.faceExpressionNet.loadFromUri(CDN);
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading models:', error);
        setFeedback("⚠️ Unable to load emotion detection models.");
      }
    };
    loadModels();
  }, []);

  const detectEmotion = async () => {
    if (!modelsLoaded || !webcamRef.current || gameCompleted) {
      if (!modelsLoaded) {
        setFeedback("⚠️ Models not loaded yet. Please wait.");
      }
      return;
    }
    
    if (!cameraReady || cameraError) {
      setFeedback("⚠️ Camera is not ready. Please check camera permissions and try again.");
      return;
    }

    const detectionStartTime = Date.now();
    setIsDetecting(true);
    setAttempts(prev => prev + 1);

    try {
      const video = webcamRef.current.video;
      if (!video || video.readyState !== 4) {
        setFeedback("⚠️ Camera not ready. Please wait a moment.");
        setIsDetecting(false);
        return;
      }

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length === 0) {
        setFeedback("❌ No face detected! Make sure you're clearly visible.");
        setIsDetecting(false);
        setConsecutiveCorrect(0);
        return;
      }

      const expressions = detections[0].expressions;
      const targetEmotion = emotionStages[currentStage].name;
      const matchThreshold = 0.35;
      const isCorrect = expressions[targetEmotion] > matchThreshold;
      
      // Calculate detection time
      const detectionTime = Date.now() - detectionStartTime;

      if (isCorrect) {
        const points = emotionStages[currentStage].points;
        setScore(prev => prev + points);
        setCorrectMatches(prev => prev + 1);
        
        // Update consecutive correct
        const newConsecutive = consecutiveCorrect + 1;
        setConsecutiveCorrect(newConsecutive);
        setMaxConsecutive(Math.max(maxConsecutive, newConsecutive));
        
        // Track emotion success rate
        setEmotionSuccessRate(prev => {
          const current = prev[targetEmotion] || { correct: 0, total: 0 };
          return {
            ...prev,
            [targetEmotion]: { correct: current.correct + 1, total: current.total + 1 }
          };
        });
        
        // Track detection time
        setEmotionDetectionTimes(prev => {
          const times = prev[targetEmotion] || [];
          const newTimes = [...times, detectionTime];
          
          // Update fastest/slowest
          const fastestTime = Math.min(...newTimes);
          const slowestTime = Math.max(...newTimes);
          
          if (!fastestEmotionDetection || fastestTime < fastestEmotionDetection.time) {
            setFastestEmotionDetection({ emotion: targetEmotion, time: fastestTime });
          }
          if (!slowestEmotionDetection || slowestTime > slowestEmotionDetection.time) {
            setSlowestEmotionDetection({ emotion: targetEmotion, time: slowestTime });
          }
          
          return { ...prev, [targetEmotion]: newTimes };
        });
        
        // Update best emotion
        setBestEmotion(targetEmotion);
        
        setFeedback(`🎉 Perfect! You showed ${targetEmotion} correctly! (+${points} points)`);
        
        setTimeout(() => {
          if (currentStage < emotionStages.length - 1) {
            setCurrentStage(prev => prev + 1);
            setConsecutiveCorrect(0); // Reset for next emotion
            setFeedback("");
          } else {
            completeGame();
          }
        }, 2000);
      } else {
        const dominantEmotion = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );
        const confidence = Math.round(expressions[dominantEmotion] * 100);
        
        // Update emotion success rate (wrong attempt)
        setEmotionSuccessRate(prev => {
          const current = prev[targetEmotion] || { correct: 0, total: 0 };
          return {
            ...prev,
            [targetEmotion]: { correct: current.correct, total: current.total + 1 }
          };
        });
        
        setConsecutiveCorrect(0);
        setFeedback(`🔄 I detected "${dominantEmotion}" (${confidence}%). Try showing "${targetEmotion}" more clearly!`);
      }
    } catch (error) {
      console.error('Detection error:', error);
      setFeedback("❌ Detection error. Please try again!");
    } finally {
      setIsDetecting(false);
    }
  };

  const completeGame = async () => {
    if (gameCompleted) return; // Prevent multiple completions
    
    setGameCompleted(true);
    const duration = gameStartTime ? Math.round((Date.now() - gameStartTime) / 1000 / 60) : 1;
    const accuracyPct = Math.round((correctMatches / emotionStages.length) * 100);
    const finalScore = score;

    setFeedback(`🎊 Quest Complete! Final Score: ${finalScore} | Accuracy: ${accuracyPct}%`);

    // Save to backend
    try {
      const response = await dashboardAPI.saveGameSession({
        gameType: 'expression-quest',
        score: finalScore,
        duration: duration || 1,
        moves: attempts,
        accuracy: accuracyPct,
        difficulty: 'advanced',
        sessionData: {
          stagesCleared: correctMatches,
          totalStages: emotionStages.length,
          emotions: emotionStages.map(s => s.name),
          emotionSuccessRate: emotionSuccessRate,
          maxConsecutive: maxConsecutive,
          fastestDetection: fastestEmotionDetection?.time,
          slowestDetection: slowestEmotionDetection?.time,
          bestEmotion: bestEmotion
        }
      });
      console.log('Game session saved:', response.data);
    } catch (error) {
      console.error('Error saving game session:', error);
      setFeedback(prev => prev + ' (Note: Progress may not have been saved)');
    }

    if (onComplete) {
      onComplete({
        gameId: 11,
        name: 'Expression Quest',
        points: finalScore,
        stagesCleared: correctMatches,
        accuracyPct: accuracyPct,
        // Enhanced analytics
        maxConsecutive: maxConsecutive,
        fastestDetection: fastestEmotionDetection?.time,
        slowestDetection: slowestEmotionDetection?.time,
        bestEmotion: bestEmotion,
        emotionSuccessRate: emotionSuccessRate
      });
    }
  };

  const restartGame = () => {
    setCurrentStage(0);
    setScore(0);
    setAttempts(0);
    setCorrectMatches(0);
    setGameCompleted(false);
    setFeedback("");
    setGameStartTime(Date.now());
  };

  const progress = ((currentStage + 1) / emotionStages.length) * 100;
  const currentEmotion = emotionStages[currentStage];

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h3>🏆 Expression Quest</h3>
      <p>Complete all emotion challenges to finish the quest!</p>

      {!modelsLoaded && (
        <Alert variant="info">🔄 Loading emotion detection models... Please wait.</Alert>
      )}
      
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

      <Row className="mb-4">
        <Col md={12}>
          <ProgressBar 
            now={progress} 
            label={`Stage ${currentStage + 1} of ${emotionStages.length}`}
            variant="success"
            style={{ height: '30px', fontSize: '14px' }}
          />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="p-2 bg-primary text-white text-center">
            <strong>Score</strong>
            <div style={{ fontSize: '20px' }}>{score}</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-2 bg-success text-white text-center">
            <strong>Streak</strong>
            <div style={{ fontSize: '20px' }}>{consecutiveCorrect}/{maxConsecutive}</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-2 bg-info text-white text-center">
            <strong>Attempts</strong>
            <div style={{ fontSize: '20px' }}>{attempts}</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-2 bg-warning text-white text-center">
            <strong>Best Emotion</strong>
            <div style={{ fontSize: '16px' }}>{bestEmotion ? bestEmotion.toUpperCase() : '-'}</div>
          </Card>
        </Col>
      </Row>

      <Row className="align-items-center mb-4">
        <Col md={6}>
          <Card className="p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
            <div style={{ fontSize: "5rem", marginBottom: 15 }}>
              {currentEmotion.emoji}
            </div>
            <h4 style={{ textTransform: 'uppercase', color: '#007bff' }}>
              {currentEmotion.name}
            </h4>
            <p className="text-muted">{currentEmotion.description}</p>
            <div className="mt-3">
              <strong>Points: {currentEmotion.points}</strong>
            </div>
          </Card>
        </Col>

        <Col md={6}>
          <div style={{
            border: '3px solid #28a745',
            borderRadius: '15px',
            overflow: 'hidden',
            display: 'inline-block'
          }}>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              width={320}
              height={240}
              style={{ display: 'block' }}
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
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
              }}
            />
          </div>
        </Col>
      </Row>

      <div className="mb-3">
        <Row>
          <Col md={4}>
            <Card className="p-2 bg-primary text-white">
              <strong>Score: {score}</strong>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-2 bg-info text-white">
              <strong>Stages: {currentStage + 1}/{emotionStages.length}</strong>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-2 bg-warning text-white">
              <strong>Attempts: {attempts}</strong>
            </Card>
          </Col>
        </Row>
      </div>

      {!gameCompleted ? (
        <Button
          variant="success"
          size="lg"
          onClick={detectEmotion}
          disabled={!modelsLoaded || !cameraReady || isDetecting || !!cameraError}
          style={{ marginRight: '10px', padding: '12px 40px' }}
        >
          {isDetecting ? '🔄 Analyzing...' : 
           !cameraReady ? '⏳ Waiting for camera...' : 
           cameraError ? '❌ Camera Error' :
           '📸 Check Expression!'}
        </Button>
      ) : (
        <Button
          variant="primary"
          size="lg"
          onClick={restartGame}
          style={{ marginRight: '10px', padding: '12px 40px' }}
        >
          🔄 Play Again
        </Button>
      )}

      <Button
        variant="secondary"
        size="lg"
        onClick={onClose}
        style={{ padding: '12px 40px' }}
      >
        ❌ Close
      </Button>

      {feedback && (
        <Alert
          variant={
            feedback.includes("Perfect") || feedback.includes("Quest Complete") ? "success" :
            feedback.includes("detected") ? "warning" : "info"
          }
          className="mt-3"
          style={{ fontSize: '16px', fontWeight: 'bold' }}
        >
          {feedback}
        </Alert>
      )}
    </div>
  );
};

export default ExpressionQuest;
