import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { Badge } from "react-bootstrap";

const EyeGazeTracker = ({ onGazeUpdate }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("Initializing...");
  const [gaze, setGaze] = useState("Center");

  useEffect(() => {
    const start = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      ]);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStatus("Tracking");
      detect();
    };

    start();
  }, []);

  const detect = async () => {
    setInterval(async () => {
      if (!videoRef.current) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!detection) {
        setGaze("Away");
        return;
      }

      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();

      const eyeCenter =
        (leftEye[0].x + rightEye[3].x) / 2;
      const faceCenter = detection.detection.box.x +
        detection.detection.box.width / 2;

      let direction = "Center";
      if (eyeCenter < faceCenter - 15) direction = "Left";
      if (eyeCenter > faceCenter + 15) direction = "Right";

      setGaze(direction);

      onGazeUpdate?.({
        gaze: direction,
        attention: direction === "Away" ? 30 : 85,
        timestamp: Date.now(),
      });
    }, 3000);
  };

  return (
    <div className="text-center p-2">
      <video
        ref={videoRef}
        autoPlay
        muted
        width="100%"
        style={{ borderRadius: "12px" }}
      />
      <Badge bg="primary" className="mt-2">
        👀 Gaze: {gaze}
      </Badge>
      <div className="small text-muted">{status}</div>
    </div>
  );
};

export default EyeGazeTracker;
