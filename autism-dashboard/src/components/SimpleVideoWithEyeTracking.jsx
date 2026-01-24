import React, { useRef, useState, useEffect } from 'react';

const SimpleVideoWithEyeTracking = ({ videoId, videoTitle, userId, therapistId }) => {
  const videoRef = useRef(null);
  const [isTracking, setIsTracking] = useState(false);
  const [attentionScore, setAttentionScore] = useState(50);
  const [sessionId, setSessionId] = useState(null);
  const [trackingInterval, setTrackingInterval] = useState(null);
  
  // Start eye tracking session
  const startTracking = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 }
      });
      
      // Create hidden video for face tracking
      const faceVideo = document.createElement('video');
      faceVideo.srcObject = stream;
      faceVideo.play();
      
      // Start backend session
      const response = await fetch('/api/video-eye-tracking/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          videoId,
          videoTitle,
          therapistId
        })
      });
      
      const data = await response.json();
      setSessionId(data.sessionId);
      setIsTracking(true);
      
      // Start periodic gaze data collection
      const interval = setInterval(() => {
        collectAndSendGazeData(faceVideo, data.sessionId);
      }, 1000); // Send data every second (not every frame)
      
      setTrackingInterval(interval);
      
    } catch (error) {
      console.error('Failed to start eye tracking:', error);
      alert('Camera access is required for eye tracking');
    }
  };
  
  // Collect gaze data and send to backend
  const collectAndSendGazeData = async (faceVideo, currentSessionId) => {
    try {
      // Simple client-side attention calculation
      // In production, you'd use face-api.js or similar
      const gazeData = await calculateSimpleAttention(faceVideo);
      
      // Send to backend
      await fetch('/api/video-eye-tracking/save-gaze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          videoId,
          userId,
          videoTimestamp: videoRef.current?.currentTime || 0,
          attentionScore: gazeData.attentionScore,
          gazeData: {
            gazePoint: gazeData.gazePoint,
            isLookingAtScreen: gazeData.isLookingAtScreen,
            blinkDetected: gazeData.blinkDetected
          }
        })
      });
      
      // Update UI
      setAttentionScore(gazeData.attentionScore);
      
    } catch (error) {
      console.error('Error sending gaze data:', error);
    }
  };
  
  // Simple attention calculation (mock - replace with real face detection)
  const calculateSimpleAttention = async (faceVideo) => {
    // Mock implementation
    // In real implementation, use face-api.js or TensorFlow.js
    return {
      attentionScore: Math.floor(Math.random() * 40) + 60, // 60-100
      gazePoint: { x: 0, y: 0 },
      isLookingAtScreen: Math.random() > 0.1, // 90% chance looking at screen
      blinkDetected: Math.random() > 0.8 // 20% chance of blink
    };
  };
  
  // Stop tracking
  const stopTracking = async () => {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
    
    if (sessionId && videoRef.current) {
      // Send end session to backend
      await fetch('/api/video-eye-tracking/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          videoId,
          duration: videoRef.current.duration,
          completionPercentage: (videoRef.current.currentTime / videoRef.current.duration) * 100
        })
      });
    }
    
    setIsTracking(false);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
      stopTracking();
    };
  }, []);
  
  return (
    <div className="simple-video-player">
      {/* Video Player */}
      <div className="video-wrapper">
        <video
          ref={videoRef}
          controls
          className="main-video"
          onPlay={() => {
            if (!isTracking) {
              startTracking();
            }
          }}
          onPause={() => {
            // Optionally pause tracking when video is paused
            // stopTracking();
          }}
          onEnded={stopTracking}
        >
          <source src={`/api/videos/${videoId}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Eye Tracking Status Overlay */}
        <div className="tracking-overlay">
          {isTracking ? (
            <div className="tracking-active">
              <div className="status-indicator">
                <span className="status-dot active" />
                <span>Tracking Active</span>
              </div>
              <div className="attention-display">
                Attention: <strong>{attentionScore}%</strong>
              </div>
              <button 
                className="stop-tracking-btn"
                onClick={stopTracking}
              >
                Stop Tracking
              </button>
            </div>
          ) : (
            <div className="tracking-inactive">
              <button 
                className="start-tracking-btn"
                onClick={startTracking}
              >
                👁️ Enable Eye Tracking
              </button>
              <p className="help-text">
                Click to enable eye tracking (requires camera access)
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Attention Visualization */}
      <div className="attention-visualization">
        <h4>Attention Level</h4>
        <div className="attention-bar">
          <div 
            className="attention-fill"
            style={{ width: `${attentionScore}%` }}
          />
        </div>
        <div className="attention-labels">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleVideoWithEyeTracking;