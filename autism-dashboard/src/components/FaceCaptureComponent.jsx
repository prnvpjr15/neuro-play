// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';
// import { Button, ProgressBar, Alert, Badge } from 'react-bootstrap';
// import { FaVideo, FaStop, FaPlay, FaSave, FaEye } from 'react-icons/fa';

// const VideoCaptureComponent = ({ userId, onVideoCaptured }) => {
//   const videoRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const sessionIdRef = useRef(null); // ADD THIS REF
//   const recordingTimeRef = useRef(0); // ADD THIS REF for recordingTime
//   const [recording, setRecording] = useState(false);
//   const [recordedChunks, setRecordedChunks] = useState([]);
//   const [recordingTime, setRecordingTime] = useState(0);
//   const [sessionId, setSessionId] = useState(null);
//   const [videoUrl, setVideoUrl] = useState(null);
//   const [preview, setPreview] = useState(false);
//   const timerRef = useRef(null);

//   // Sync refs with state
//   useEffect(() => {
//     if (sessionId) {
//       sessionIdRef.current = sessionId;
//     }
//   }, [sessionId]);

//   useEffect(() => {
//     recordingTimeRef.current = recordingTime;
//   }, [recordingTime]);

//   // Initialize camera
//   useEffect(() => {
//     startCamera();
//     return () => {
//       stopCamera();
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, []);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//           facingMode: 'user'
//         },
//         audio: true // Include audio for therapist analysis
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     } catch (error) {
//       console.error('Camera error:', error);
//     }
//   };

//   const stopCamera = () => {
//     if (videoRef.current && videoRef.current.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach(track => track.stop());
//     }
//   };

//   // START VIDEO RECORDING - FIXED VERSION
//   const startRecording = () => {
//     if (!videoRef.current || !videoRef.current.srcObject) {
//       alert('Camera not ready');
//       return;
//     }

//     // ✅ SET BOTH STATE AND REF
//     const newSessionId = `video_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     setSessionId(newSessionId);
//     sessionIdRef.current = newSessionId;

//     console.log('🎬 Created sessionId:', newSessionId);

//     const stream = videoRef.current.srcObject;
//     const options = {
//       mimeType: 'video/webm;codecs=vp9,opus',
//       videoBitsPerSecond: 2500000
//     };

//     try {
//       const mediaRecorder = new MediaRecorder(stream, options);
//       mediaRecorderRef.current = mediaRecorder;
//       const chunks = [];

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           chunks.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = async () => {
//         console.log('🛑 Recording stopped, sessionId:', sessionIdRef.current);
//         const videoBlob = new Blob(chunks, { type: 'video/webm' });
//         const url = URL.createObjectURL(videoBlob);
//         setVideoUrl(url);
//         setRecordedChunks(chunks);

//         const thumbnail = await generateThumbnail(videoBlob);
//         await uploadVideo(videoBlob, thumbnail);
//       };

//       mediaRecorder.start(1000);
//       setRecording(true);

//       // Start timer
//       setRecordingTime(0);
//       recordingTimeRef.current = 0;
//       timerRef.current = setInterval(() => {
//         setRecordingTime(prev => {
//           const newTime = prev + 1;
//           recordingTimeRef.current = newTime;
//           return newTime;
//         });
//       }, 1000);

//     } catch (error) {
//       console.error('Recording error:', error);
//     }
//   };

//   // STOP VIDEO RECORDING
//   const stopRecording = () => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
//       mediaRecorderRef.current.stop();
//       setRecording(false);
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     }
//   };

//   // GENERATE THUMBNAIL FROM VIDEO
//   const generateThumbnail = (videoBlob) => {
//     return new Promise((resolve) => {
//       const video = document.createElement('video');
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');

//       video.src = URL.createObjectURL(videoBlob);
//       video.onloadeddata = () => {
//         // Capture frame at 2 seconds
//         video.currentTime = 2;
//       };

//       video.onseeked = () => {
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//         canvas.toBlob((thumbnailBlob) => {
//           resolve(thumbnailBlob);
//         }, 'image/jpeg', 0.7);
//       };
//     });
//   };

//   // UPLOAD VIDEO TO BACKEND - FIXED VERSION
//   const uploadVideo = async (videoBlob, thumbnailBlob) => {
//     console.log('🎬 uploadVideo function called');

//     // ✅ USE THE REFS (not state)
//     const currentSessionId = sessionIdRef.current;
//     const currentDuration = recordingTimeRef.current;
//     const currentUserId = userId;

//     console.log('👤 Current userId:', currentUserId);
//     console.log('📋 Using sessionId:', currentSessionId);
//     console.log('📋 Using duration:', currentDuration);

//     const formData = new FormData();
//     formData.append('video', videoBlob, `${currentSessionId}.webm`);
//     formData.append('thumbnail', thumbnailBlob, `${currentSessionId}_thumb.jpg`);
//     formData.append('userId', currentUserId);
//     formData.append('sessionId', currentSessionId);
//     formData.append('duration', currentDuration);
//     formData.append('type', 'video');
//     formData.append('timestamp', new Date().toISOString());

//     // Log FormData contents
//     console.log('📋 FormData entries:');
//     for (let pair of formData.entries()) {
//       console.log(pair[0], pair[1]);
//     }

//     console.log('🚀 Sending POST to:', 'http://localhost:4000/api/facecapture/video');

//     try {
//       // ✅ USE ABSOLUTE URL FOR DEBUGGING
//       const response = await axios.post('http://localhost:4000/api/facecapture/video', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         onUploadProgress: (progressEvent) => {
//           const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           console.log(`📤 Upload progress: ${percent}%`);
//         }
//       });

//       console.log('✅ Video upload successful:', response.data);

//       if (onVideoCaptured) {
//         onVideoCaptured({
//           type: 'video',
//           sessionId: currentSessionId,
//           url: response.data.videoUrl,
//           duration: currentDuration,
//           emotionData: response.data.emotionData
//         });
//       }

//     } catch (error) {
//       console.error('❌ Video upload failed:', error);
//       console.error('❌ Error details:', error.response?.data || error.message);
//       alert('Failed to save video. Please try again.');
//     }
//   };

//   // FORMAT TIME
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div className="video-capture-container p-3 border rounded">
//       <h5 className="mb-3">
//         <FaVideo className="me-2" />
//         Session Video Recording
//       </h5>

//       {/* Live Camera Feed */}
//       <div className="video-wrapper mb-3">
//         <video
//           ref={videoRef}
//           autoPlay
//           muted
//           playsInline
//           className="rounded border"
//           style={{ width: '100%', maxHeight: '400px', background: '#000' }}
//         />
//       </div>

//       {/* Recording Controls */}
//       <div className="controls mb-3">
//         {!recording ? (
//           <Button
//             variant="danger"
//             onClick={startRecording}
//             className="rounded-pill px-4"
//             disabled={!userId}
//           >
//             <FaVideo className="me-2" />
//             Start Recording Session
//           </Button>
//         ) : (
//           <div>
//             <Button
//               variant="warning"
//               onClick={stopRecording}
//               className="rounded-pill px-4 me-3"
//             >
//               <FaStop className="me-2" />
//               Stop Recording
//             </Button>

//             <Badge bg="danger" className="p-2">
//               <FaPlay className="me-1" />
//               REC {formatTime(recordingTime)}
//             </Badge>

//             <div className="mt-2">
//               <small>Recording session: {sessionId}</small>
//               <ProgressBar
//                 now={(recordingTime % 60) * 1.666}
//                 variant="danger"
//                 animated
//                 className="mt-1"
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Video Preview */}
//       {videoUrl && (
//         <div className="preview-section mt-3 p-3 border rounded bg-light">
//           <h6>
//             <FaEye className="me-2" />
//             Last Recording Preview
//           </h6>
//           <div className="d-flex gap-3 align-items-center">
//             <video
//               src={videoUrl}
//               controls
//               className="rounded"
//               style={{ width: '200px', height: '150px' }}
//             />
//             <div>
//               <p className="mb-1">
//                 <strong>Duration:</strong> {formatTime(recordingTime)}
//               </p>
//               <p className="mb-1">
//                 <strong>Session:</strong> {sessionId}
//               </p>
//               <Button
//                 variant="success"
//                 size="sm"
//                 onClick={() => setPreview(!preview)}
//                 className="me-2"
//               >
//                 {preview ? 'Hide Details' : 'Show Details'}
//               </Button>
//               <Button
//                 variant="outline-primary"
//                 size="sm"
//                 onClick={() => {
//                   // Save for therapist review
//                   alert('Video saved for therapist analysis');
//                 }}
//               >
//                 <FaSave className="me-1" />
//                 Save for Review
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {!userId && (
//         <Alert variant="warning" className="mt-3">
//           Please log in to record sessions for therapist review.
//         </Alert>
//       )}
//     </div>
//   );
// };

// export default VideoCaptureComponent;

// //

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Button,
  ProgressBar,
  Alert,
  Badge,
  Card,
  Spinner,
} from "react-bootstrap";
import {
  FaVideo,
  FaStop,
  FaPlay,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
} from "react-icons/fa";
import * as faceapi from "@vladmandic/face-api"; // Ensure this is installed
import "@tensorflow/tfjs";
import {
  detectFaceAndCalculateGaze,
  analyzeGazeData,
} from "../utils/faceDetection";

const VideoCaptureComponent = ({ userId, onVideoCaptured }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const sessionIdRef = useRef(null);
  const recordingTimeRef = useRef(0);

  // State Management
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [preview, setPreview] = useState(false);
  const [currentGaze, setCurrentGaze] = useState(null);
  const [gazeStats, setGazeStats] = useState(null);
  const [gazeData, setGazeData] = useState([]);

  const timerRef = useRef(null);
  const gazeDataRef = useRef([]);
  const gazeIntervalRef = useRef(null);

  // 1. LOAD MODELS ON MOUNT
  // useEffect(() => {
  //   const loadModels = async () => {
  //     try {
  //       const MODEL_URL = "/models"; // Paths to your manifest files
  //       await Promise.all([
  //         faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  //         faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  //       ]);
  //       console.log("✅ Face-API Models Loaded");
  //       setModelsLoaded(true);
  //       startCamera();
  //     } catch (error) {
  //       console.error("❌ Model Loading Error:", error);
  //     }
  //   };
  //   loadModels();

  //   return () => {
  //     stopCamera();
  //     if (timerRef.current) clearInterval(timerRef.current);
  //     if (gazeIntervalRef.current) clearInterval(gazeIntervalRef.current);
  //   };
  // }, []);

  // Sync refs
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  useEffect(() => {
    recordingTimeRef.current = recordingTime;
  }, [recordingTime]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const startRecording = () => {
    if (!modelsLoaded) return alert("Please wait for models to load.");
    if (!videoRef.current?.srcObject) return alert("Camera not ready");

    const newSessionId = `video_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    gazeDataRef.current = [];
    setGazeData([]);

    try {
      const mediaRecorder = new MediaRecorder(videoRef.current.srcObject, {
        mimeType: "video/webm;codecs=vp9,opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) =>
        e.data.size > 0 && chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(chunks, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(videoBlob));
        const thumbnail = await generateThumbnail(videoBlob);
        uploadVideo(videoBlob, thumbnail);
      };

      mediaRecorder.start(1000);
      setRecording(true);

      // Start Gaze Detection Loop
      gazeIntervalRef.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const result = await detectFaceAndCalculateGaze(videoRef.current);
          setCurrentGaze(result);
          if (result.faceDetected) {
            gazeDataRef.current.push(result);
            setGazeData([...gazeDataRef.current]);
          }
        }
      }, 500); // 500ms for more frequent tracking

      timerRef.current = setInterval(
        () => setRecordingTime((prev) => prev + 1),
        1000,
      );
    } catch (err) {
      console.error("Start recording failed:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive")
      mediaRecorderRef.current.stop();
    setRecording(false);
    clearInterval(timerRef.current);
    clearInterval(gazeIntervalRef.current);
  };

  const generateThumbnail = (blob) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(blob);
      video.onloadeddata = () => (video.currentTime = 1);
      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        canvas.toBlob(resolve, "image/jpeg", 0.7);
      };
    });
  };

  const uploadVideo = async (videoBlob, thumbBlob) => {
    const formData = new FormData();
    formData.append("video", videoBlob, `${sessionIdRef.current}.webm`);
    formData.append(
      "thumbnail",
      thumbBlob,
      `${sessionIdRef.current}_thumb.jpg`,
    );
    formData.append("userId", userId);
    formData.append("sessionId", sessionIdRef.current);
    formData.append("duration", recordingTimeRef.current);
    formData.append("timestamp", new Date().toISOString());
    formData.append("startTime", new Date().toISOString());

    formData.append("gazeData", JSON.stringify(gazeDataRef.current));

    const summary = analyzeGazeData(gazeDataRef.current);
    formData.append("gazeSummary", JSON.stringify(summary));

    try {
      const res = await axios.post(
        "http://localhost:4000/api/facecapture/video",
        formData,
      );
      if (onVideoCaptured) onVideoCaptured(res.data);
      console.log("✅ Uploaded successfully");
    } catch (err) {
      console.error("❌ Upload failed", err);
    }
  };
  // 1. LOAD MODELS ON MOUNT
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";

        // Force the CPU or WebGL backend to avoid WebGPU initialization racing
        // 'webgl' is usually the best balance of speed and compatibility
        await faceapi.tf.setBackend("webgl");
        await faceapi.tf.ready();

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);

        console.log(
          "✅ Face-API Models Loaded with backend:",
          faceapi.tf.getBackend(),
        );
        setModelsLoaded(true);
        startCamera();
      } catch (error) {
        console.error("❌ Model Loading Error:", error);

        // Fallback to 'cpu' if WebGL fails
        try {
          await faceapi.tf.setBackend("cpu");
          console.log("⚠️ Switched to CPU backend");
        } catch (e) {
          console.error("Critical failure: No TFJS backend available");
        }
      }
    };
    loadModels();
    // ... rest of your cleanup
  }, []);

  return (
    <div className="video-capture-container p-3 border rounded">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <FaVideo className="me-2" /> Video Session
        </h5>
        {!modelsLoaded && (
          <Badge bg="info">
            <Spinner animation="border" size="sm" /> Loading Models...
          </Badge>
        )}
      </div>

      <div className="position-relative mb-3">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-100 rounded bg-dark"
          style={{ maxHeight: "400px" }}
        />
        {recording && currentGaze && (
          <div className="position-absolute top-0 start-0 m-2 p-2 bg-dark text-white rounded opacity-75">
            Gaze: {currentGaze.gazeDirection} | Attention:{" "}
            {currentGaze.attentionScore}%
          </div>
        )}
      </div>

      <div className="controls">
        {!recording ? (
          <Button
            variant="danger"
            onClick={startRecording}
            disabled={!modelsLoaded || !userId}
          >
            Start Recording
          </Button>
        ) : (
          <Button variant="warning" onClick={stopRecording}>
            <FaStop className="me-2" /> Stop ({recordingTime}s)
          </Button>
        )}
      </div>
      {/* Add this to your FaceCaptureComponent render */}
      <div className="attention-container mt-2">
        <div className="d-flex justify-content-between">
          <small>Attention Level</small>
          <small>{currentGaze?.attentionScore || 0}%</small>
        </div>
        <div className="progress" style={{ height: "10px" }}>
          <div
            className={`progress-bar ${currentGaze?.attentionScore > 70 ? "bg-success" : "bg-warning"}`}
            style={{ width: `${currentGaze?.attentionScore || 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCaptureComponent;
