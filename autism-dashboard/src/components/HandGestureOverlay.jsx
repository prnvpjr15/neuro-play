import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const HandGestureOverlay = ({ enabled, onInteraction }) => {
  const webcamRef = useRef(null);
  const handsModelRef = useRef(null);
  const cameraRef = useRef(null);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const dwellStartTimeRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [dwellProgress, setDwellProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const DWELL_TIME = 1200; // 1.2 seconds to click
  const DWELL_THRESHOLD = 30; // pixels of movement allowed during dwell

  const handleInteraction = useCallback((x, y) => {
    const element = document.elementFromPoint(x, y);
    if (element) {
      // Trigger a real click event
      const clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      });
      element.dispatchEvent(clickEvent);
      
      // Also trigger hover effects if needed
      const moveEvent = new MouseEvent("mousemove", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      });
      element.dispatchEvent(moveEvent);

      if (onInteraction) onInteraction(element);
    }
  }, [onInteraction]);

  const onResults = useCallback((results) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setIsActive(false);
      setDwellProgress(0);
      dwellStartTimeRef.current = null;
      return;
    }

    setIsActive(true);
    const landmarks = results.multiHandLandmarks[0];
    const indexTip = landmarks[8]; // Index finger tip
    
    // Convert to screen coordinates
    // We mirror X because the camera is mirrored
    const screenX = (1 - indexTip.x) * window.innerWidth;
    const screenY = indexTip.y * window.innerHeight;

    setCursorPos({ x: screenX, y: screenY });

    // Handle Dwell Click
    const dist = Math.sqrt(
      Math.pow(screenX - lastPosRef.current.x, 2) + 
      Math.pow(screenY - lastPosRef.current.y, 2)
    );

    if (dist < DWELL_THRESHOLD) {
      if (!dwellStartTimeRef.current) {
        dwellStartTimeRef.current = Date.now();
      } else {
        const elapsed = Date.now() - dwellStartTimeRef.current;
        const progress = Math.min(100, (elapsed / DWELL_TIME) * 100);
        setDwellProgress(progress);

        if (elapsed >= DWELL_TIME) {
          handleInteraction(screenX, screenY);
          dwellStartTimeRef.current = Date.now(); // Reset dwell after click to prevent spam
          setDwellProgress(0);
        }
      }
    } else {
      dwellStartTimeRef.current = Date.now();
      setDwellProgress(0);
      lastPosRef.current = { x: screenX, y: screenY };
    }
  }, [handleInteraction]);

  useEffect(() => {
    if (!enabled) {
      if (cameraRef.current) cameraRef.current.stop();
      return;
    }

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);
    handsModelRef.current = hands;

    const startCamera = async () => {
      if (webcamRef.current && webcamRef.current.video) {
        const camera = new Camera(webcamRef.current.video, {
          onFrame: async () => {
            if (handsModelRef.current) {
              await handsModelRef.current.send({ image: webcamRef.current.video });
            }
          },
          width: 640,
          height: 480,
        });
        cameraRef.current = camera;
        await camera.start();
      }
    };

    startCamera();

    return () => {
      if (cameraRef.current) cameraRef.current.stop();
      if (handsModelRef.current) handsModelRef.current.close();
    };
  }, [enabled, onResults]);

  if (!enabled) return null;

  return (
    <>
      <div style={{ position: "fixed", top: -9999, left: -9999, opacity: 0, pointerEvents: "none" }}>
        <Webcam ref={webcamRef} mirrored screenshotFormat="image/jpeg" />
      </div>
      
      {/* Virtual Cursor */}
      <div
        style={{
          position: "fixed",
          left: cursorPos.x,
          top: cursorPos.y,
          width: "40px",
          height: "40px",
          marginLeft: "-20px",
          marginTop: "-20px",
          borderRadius: "50%",
          backgroundColor: isActive ? "rgba(0, 255, 255, 0.4)" : "transparent",
          border: isActive ? "3px solid #00ffff" : "none",
          boxShadow: isActive ? "0 0 20px rgba(0, 255, 255, 0.8)" : "none",
          pointerEvents: "none",
          zIndex: 999999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.2s, border 0.2s",
        }}
      >
        {isActive && (
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="4"
            />
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeDasharray="113.1"
              strokeDashoffset={113.1 - (dwellProgress / 100) * 113.1}
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
          </svg>
        )}
      </div>

      {/* Notification when hand tracking is active */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "#00ffff",
          borderRadius: "20px",
          fontSize: "14px",
          fontWeight: "bold",
          zIndex: 999998,
          pointerEvents: "none",
          opacity: isActive ? 1 : 0.5,
          transition: "opacity 0.3s",
        }}
      >
        {isActive ? "✨ Hand Control Active" : "✋ Show your hand to start"}
      </div>
    </>
  );
};

export default HandGestureOverlay;
