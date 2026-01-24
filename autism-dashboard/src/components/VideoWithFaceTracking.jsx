import React, { useRef, useState, useEffect } from 'react';
import { detectFaceAndCalculateAttention } from '../utils/faceDetection';

const VideoWithFaceTracking = ({ videoId, userId, therapistId }) => {
  const videoRef = useRef(null);
  const faceVideoRef = useRef(null);
  const [isTracking, setIsTracking] = useState(false);
  const [attentionScore, setAttentionScore] = useState(50);
  const [sessionId, setSessionId] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  
  // Start tracking
  const startTracking = async () => {
    try {
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      
      // Set up face video element
      faceVideoRef.current.srcObject = stream;
      await faceVideoRef.current.play();
      
      // Start backend session
      const response = await fetch('/api/video-eye-tracking/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          videoId,
          therapistId,
          videoTitle: 'Autism Therapy Video'
        })
      });
      
      const data = await response.json();
      setSessionId(data.sessionId);
      setIsTracking(true);
      
      // Start face detection loop
      detectFaceLoop(data.sessionId);
      
    } catch (error) {
      console.error('Failed to start tracking:', error);
      alert('Camera access required for eye tracking');
    }
  };
  
  // Face detection loop
  const detectFaceLoop = async (currentSessionId) => {
    if (!isTracking || !faceVideoRef.current) return;
    
    try {
      // Detect face and calculate attention
      const result = await detectFaceAndCalculateAttention(faceVideoRef.current);
      
      setAttentionScore(result.attentionScore);
      setFaceDetected(result.faceDetected);
      
      // Send to backend if face detected
      if (result.faceDetected && sessionId) {
        await fetch('/api/video-eye-tracking/save-gaze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            videoId,
            userId,
            videoTimestamp: videoRef.current?.currentTime || 0,
            attentionScore: result.attentionScore,
            gazeData: {
              isLookingAtScreen: result.isLookingAtScreen,
              blinkDetected: result.blinkDetected,
              emotion: 'neutral' // Could add emotion detection
            }
          })
        });
      }
      
      // Continue loop
      setTimeout(() => detectFaceLoop(currentSessionId), 1000); // Every second
      
    } catch (error) {
      console.error('Face detection loop error:', error);
    }
  };
  
  // Stop tracking
  const stopTracking = async () => {
    if (sessionId && videoRef.current) {
      await fetch('/api/video-eye-tracking/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          videoId,
          duration: videoRef.current.duration || 0,
          completionPercentage: videoRef.current.duration 
            ? (videoRef.current.currentTime / videoRef.current.duration) * 100 
            : 0
        })
      });
    }
    
    setIsTracking(false);
    
    // Stop camera stream
    if (faceVideoRef.current && faceVideoRef.current.srcObject) {
      faceVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);
  
  return (
    <div className="video-face-tracking">
      {/* Main Video */}
      <video
        ref={videoRef}
        controls
        className="therapy-video"
        onPlay={startTracking}
        onPause={stopTracking}
        onEnded={stopTracking}
      >
        <source src={`/api/videos/stream/${videoId}`} type="video/mp4" />
      </video>
      
      {/* Hidden face video */}
      <video
        ref={faceVideoRef}
        style={{ display: 'none' }}
        width="320"
        height="240"
      />
      
      {/* Tracking Status */}
      <div className="tracking-status">
        <div className="status-row">
          <span className={`status-indicator ${isTracking ? 'active' : 'inactive'}`}>
            {isTracking ? '●' : '○'}
          </span>
          <span>{isTracking ? 'Tracking Active' : 'Tracking Inactive'}</span>
        </div>
        
        {isTracking && (
          <>
            <div className="status-row">
              <span>Face:</span>
              <span className={faceDetected ? 'detected' : 'not-detected'}>
                {faceDetected ? 'Detected' : 'Not Detected'}
              </span>
            </div>
            
            <div className="status-row">
              <span>Attention:</span>
              <span className={`attention-value ${attentionScore > 70 ? 'high' : attentionScore > 40 ? 'medium' : 'low'}`}>
                {attentionScore}%
              </span>
            </div>
            
            <div className="attention-bar">
              <div 
                className="attention-fill"
                style={{ width: `${attentionScore}%` }}
              />
            </div>
          </>
        )}
      </div>
      
      {/* Instructions */}
      {!isTracking && (
        <div className="instructions">
          <p>Click play to start video and eye tracking</p>
          <p>Camera access will be requested for attention tracking</p>
        </div>
      )}
    </div>
  );
};

export default VideoWithFaceTracking;