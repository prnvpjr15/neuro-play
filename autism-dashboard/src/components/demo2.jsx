// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { Button, ProgressBar, Alert, Badge } from "react-bootstrap";
// import { FaVideo, FaStop, FaPlay, FaSave, FaEye } from "react-icons/fa";
// import { detectFaceAndCalculateGaze, analyzeGazeData } from './faceDetection';

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
//   const [currentGaze, setCurrentGaze] = useState(null);

//   const [gazeData, setGazeData] = useState([]);
//   const gazeDataRef = useRef([]);
//   const gazeIntervalRef = useRef(null);

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
//           facingMode: "user",
//         },
//         audio: true, // Include audio for therapist analysis
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     } catch (error) {
//       console.error("Camera error:", error);
//     }
//   };

//   const stopCamera = () => {
//     if (videoRef.current && videoRef.current.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//     }
//   };

//   // START VIDEO RECORDING - FIXED VERSION
//   const startRecording = () => {
//     if (!videoRef.current || !videoRef.current.srcObject) {
//       alert("Camera not ready");
//       return;
//     }

//     // ✅ SET BOTH STATE AND REF
//     const newSessionId = `video_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     setSessionId(newSessionId);
//     sessionIdRef.current = newSessionId;

//     console.log("🎬 Created sessionId:", newSessionId);

//     const stream = videoRef.current.srcObject;
//     const options = {
//       mimeType: "video/webm;codecs=vp9,opus",
//       videoBitsPerSecond: 2500000,
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
//         console.log("🛑 Recording stopped, sessionId:", sessionIdRef.current);
//         const videoBlob = new Blob(chunks, { type: "video/webm" });
//         const url = URL.createObjectURL(videoBlob);
//         setVideoUrl(url);
//         setRecordedChunks(chunks);

//         setGazeData([]);

//         const thumbnail = await generateThumbnail(videoBlob);
//         await uploadVideo(videoBlob, thumbnail);
//       };

//       mediaRecorder.start(1000);
//       setRecording(true);

//       // Start timer
//       setRecordingTime(0);
//       recordingTimeRef.current = 0;
//       timerRef.current = setInterval(() => {
//         setRecordingTime((prev) => {
//           const newTime = prev + 1;
//           recordingTimeRef.current = newTime;
//           return newTime;
//         });
//       }, 1000);
//     } catch (error) {
//       console.error("Recording error:", error);
//     }

//     gazeDataRef.current = [];
//     gazeIntervalRef.current = setInterval(async () => {
//       if (videoRef.current) {
//         const gazeResult = await detectFaceAndCalculateGaze(videoRef.current);
//         if (gazeResult.faceDetected) {
//           gazeDataRef.current.push(gazeResult);
//           setGazeData((prev) => [...prev, gazeResult]);
//         }
//       }
//     }, 1000);
//   };

//   // STOP VIDEO RECORDING
//   const stopRecording = () => {
//     if (
//       mediaRecorderRef.current &&
//       mediaRecorderRef.current.state !== "inactive"
//     ) {
//       mediaRecorderRef.current.stop();
//       setRecording(false);
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     }

//     if (gazeIntervalRef.current) {
//       clearInterval(gazeIntervalRef.current);
//       gazeIntervalRef.current = null;
//     }
//   };

//   // GENERATE THUMBNAIL FROM VIDEO
//   const generateThumbnail = (videoBlob) => {
//     return new Promise((resolve) => {
//       const video = document.createElement("video");
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");

//       video.src = URL.createObjectURL(videoBlob);
//       video.onloadeddata = () => {
//         // Capture frame at 2 seconds
//         video.currentTime = 2;
//       };

//       video.onseeked = () => {
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//         canvas.toBlob(
//           (thumbnailBlob) => {
//             resolve(thumbnailBlob);
//           },
//           "image/jpeg",
//           0.7,
//         );
//       };
//     });
//   };

//   // UPLOAD VIDEO TO BACKEND - FIXED VERSION
//   const uploadVideo = async (videoBlob, thumbnailBlob) => {
//     console.log("🎬 uploadVideo function called");

//     // ✅ USE THE REFS (not state)
//     const currentSessionId = sessionIdRef.current;
//     const currentDuration = recordingTimeRef.current;
//     const currentUserId = userId;

//     console.log("👤 Current userId:", currentUserId);
//     console.log("📋 Using sessionId:", currentSessionId);
//     console.log("📋 Using duration:", currentDuration);

//     const formData = new FormData();
//     formData.append("video", videoBlob, `${currentSessionId}.webm`);
//     formData.append(
//       "thumbnail",
//       thumbnailBlob,
//       `${currentSessionId}_thumb.jpg`,
//     );
//     formData.append("userId", currentUserId);
//     formData.append("sessionId", currentSessionId);
//     formData.append("duration", currentDuration);
//     formData.append("type", "video");
//     formData.append("timestamp", new Date().toISOString());
//     // Add gaze data
//     formData.append("gazeData", JSON.stringify(gazeDataRef.current));
//     formData.append(
//       "gazeSummary",
//       JSON.stringify(analyzeGazeData(gazeDataRef.current)),
//     );

//     // Log FormData contents
//     console.log("📋 FormData entries:");
//     for (let pair of formData.entries()) {
//       console.log(pair[0], pair[1]);
//     }

//     console.log(
//       "🚀 Sending POST to:",
//       "http://localhost:4000/api/facecapture/video",
//     );

//     try {
//       // ✅ USE ABSOLUTE URL FOR DEBUGGING
//       const response = await axios.post(
//         "http://localhost:4000/api/facecapture/video",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//           onUploadProgress: (progressEvent) => {
//             const percent = Math.round(
//               (progressEvent.loaded * 100) / progressEvent.total,
//             );
//             console.log(`📤 Upload progress: ${percent}%`);
//           },
//         },
//       );

//       console.log("✅ Video upload successful:", response.data);

//       if (onVideoCaptured) {
//         onVideoCaptured({
//           type: "video",
//           sessionId: currentSessionId,
//           url: response.data.videoUrl,
//           duration: currentDuration,
//           emotionData: response.data.emotionData,
//         });
//       }
//     } catch (error) {
//       console.error("❌ Video upload failed:", error);
//       console.error("❌ Error details:", error.response?.data || error.message);
//       alert("Failed to save video. Please try again.");
//     }
//   };

//   // FORMAT TIME
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
//           style={{ width: "100%", maxHeight: "400px", background: "#000" }}
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
//               style={{ width: "200px", height: "150px" }}
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
//                 {preview ? "Hide Details" : "Show Details"}
//               </Button>
//               <Button
//                 variant="outline-primary"
//                 size="sm"
//                 onClick={() => {
//                   // Save for therapist review
//                   alert("Video saved for therapist analysis");
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

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button, ProgressBar, Alert, Badge, Card } from "react-bootstrap";
import { FaVideo, FaStop, FaPlay, FaSave, FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";
import { detectFaceAndCalculateGaze, analyzeGazeData } from '../utils/faceDetection';

const VideoCaptureComponent = ({ userId, onVideoCaptured }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const sessionIdRef = useRef(null);
  const recordingTimeRef = useRef(0);
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [preview, setPreview] = useState(false);
  const timerRef = useRef(null);
  const [currentGaze, setCurrentGaze] = useState(null);
  const [gazeStats, setGazeStats] = useState(null);

  const [gazeData, setGazeData] = useState([]);
  const gazeDataRef = useRef([]);
  const gazeIntervalRef = useRef(null);

  // Sync refs with state
  useEffect(() => {
    if (sessionId) {
      sessionIdRef.current = sessionId;
    }
  }, [sessionId]);

  useEffect(() => {
    recordingTimeRef.current = recordingTime;
  }, [recordingTime]);

  // Update gaze stats when gazeData changes
  useEffect(() => {
    if (gazeData.length > 0) {
      const stats = analyzeGazeData(gazeData);
      setGazeStats(stats);
    }
  }, [gazeData]);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
      if (gazeIntervalRef.current) clearInterval(gazeIntervalRef.current);
    };
  }, []);

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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  // START VIDEO RECORDING
  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) {
      alert("Camera not ready");
      return;
    }

    // Reset all states
    const newSessionId = `video_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    sessionIdRef.current = newSessionId;
    
    // Reset gaze data
    gazeDataRef.current = [];
    setGazeData([]);
    setCurrentGaze(null);
    setGazeStats(null);

    console.log("🎬 Created sessionId:", newSessionId);

    const stream = videoRef.current.srcObject;
    const options = {
      mimeType: "video/webm;codecs=vp9,opus",
      videoBitsPerSecond: 2500000,
    };

    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("🛑 Recording stopped, sessionId:", sessionIdRef.current);
        const videoBlob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(videoBlob);
        setVideoUrl(url);
        setRecordedChunks(chunks);

        const thumbnail = await generateThumbnail(videoBlob);
        await uploadVideo(videoBlob, thumbnail);
      };

      mediaRecorder.start(1000);
      setRecording(true);

      // Start timer
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime;
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error("Recording error:", error);
      alert("Failed to start recording: " + error.message);
      return;
    }

    // Start gaze detection interval
    gazeIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const gazeResult = await detectFaceAndCalculateGaze(videoRef.current);
          setCurrentGaze(gazeResult); // Update current gaze for display
          
          if (gazeResult.faceDetected) {
            gazeDataRef.current.push(gazeResult);
            setGazeData(prev => [...prev, gazeResult]);
          }
        } catch (error) {
          console.error("Gaze detection error:", error);
        }
      }
    }, 1000); // Check gaze every second
  };

  // STOP VIDEO RECORDING
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    if (gazeIntervalRef.current) {
      clearInterval(gazeIntervalRef.current);
      gazeIntervalRef.current = null;
    }
  };

  // GENERATE THUMBNAIL FROM VIDEO
  const generateThumbnail = (videoBlob) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.src = URL.createObjectURL(videoBlob);
      video.onloadeddata = () => {
        video.currentTime = 2;
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (thumbnailBlob) => {
            resolve(thumbnailBlob);
          },
          "image/jpeg",
          0.7,
        );
      };
      
      video.onerror = () => {
        console.error("Error loading video for thumbnail");
        resolve(null);
      };
    });
  };

  // UPLOAD VIDEO TO BACKEND
  const uploadVideo = async (videoBlob, thumbnailBlob) => {
    console.log("🎬 Uploading video...");

    const currentSessionId = sessionIdRef.current;
    const currentDuration = recordingTimeRef.current;
    const currentUserId = userId;

    if (!currentUserId) {
      console.error("No user ID provided");
      alert("Please log in to save videos.");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoBlob, `${currentSessionId}.webm`);
    
    if (thumbnailBlob) {
      formData.append("thumbnail", thumbnailBlob, `${currentSessionId}_thumb.jpg`);
    }
    
    formData.append("userId", currentUserId);
    formData.append("sessionId", currentSessionId);
    formData.append("duration", currentDuration.toString());
    formData.append("type", "video");
    formData.append("timestamp", new Date().toISOString());
    
    // Add gaze data if available
    if (gazeDataRef.current.length > 0) {
      formData.append("gazeData", JSON.stringify(gazeDataRef.current));
      const gazeSummary = analyzeGazeData(gazeDataRef.current);
      if (gazeSummary) {
        formData.append("gazeSummary", JSON.stringify(gazeSummary));
      }
    }

    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/facecapture/video",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`📤 Upload progress: ${percent}%`);
          },
        }
      );

      console.log("✅ Video upload successful:", response.data);

      if (onVideoCaptured) {
        onVideoCaptured({
          type: "video",
          sessionId: currentSessionId,
          url: response.data.videoUrl,
          duration: currentDuration,
          gazeAnalysis: response.data.gazeAnalysis,
          videoId: response.data.videoId,
        });
      }

    } catch (error) {
      console.error("❌ Video upload failed:", error);
      const errorMsg = error.response?.data?.error || error.message || "Unknown error";
      alert(`Failed to save video: ${errorMsg}`);
    }
  };

  // FORMAT TIME
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get gaze direction icon
  const getGazeIcon = (direction) => {
    switch(direction) {
      case "left": return "👈";
      case "right": return "👉";
      case "up": return "👆";
      case "down": return "👇";
      case "center": return "🎯";
      default: return "❓";
    }
  };

  return (
    <div className="video-capture-container p-3 border rounded">
      <h5 className="mb-3">
        <FaVideo className="me-2" />
        Session Video Recording with Gaze Detection
      </h5>

      {/* Live Camera Feed with Gaze Overlay */}
      <div className="video-wrapper mb-3 position-relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="rounded border"
          style={{ width: "100%", maxHeight: "400px", background: "#000" }}
        />
        
        {/* Real-time Gaze Indicator */}
        {recording && currentGaze && (
          <div className="position-absolute top-0 start-0 p-2 bg-dark bg-opacity-75 text-white rounded m-2">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-5">{getGazeIcon(currentGaze.gazeDirection)}</span>
              <div>
                <small className="d-block">
                  <strong>Gaze:</strong> {currentGaze?.gazeDirection?.toUpperCase()}
                </small>
                <small className="d-block">
                  <strong>Attention:</strong> {currentGaze.attentionScore}%
                </small>
                <small className="d-block">
                  <strong>Eyes:</strong> {currentGaze.blinkDetected ? "Blinking" : "Open"}
                </small>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gaze Statistics */}
      {recording && gazeStats && (
        <Card className="mb-3">
          <Card.Body className="p-2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">Face Detection:</small>
                <div className="fw-bold">{gazeStats.faceDetectionRate}%</div>
              </div>
              <div>
                <small className="text-muted">Avg Attention:</small>
                <div className="fw-bold">{gazeStats.avgAttentionScore}%</div>
              </div>
              <div>
                <small className="text-muted">Focus Time:</small>
                <div className="fw-bold">{gazeStats.focusDuration}s</div>
              </div>
              <div>
                <small className="text-muted">Blinks:</small>
                <div className="fw-bold">{gazeStats.blinkCount}</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Recording Controls */}
      <div className="controls mb-3">
        {!recording ? (
          <Button
            variant="danger"
            onClick={startRecording}
            className="rounded-pill px-4"
            disabled={!userId}
          >
            <FaVideo className="me-2" />
            Start Recording Session
          </Button>
        ) : (
          <div>
            <Button
              variant="warning"
              onClick={stopRecording}
              className="rounded-pill px-4 me-3"
            >
              <FaStop className="me-2" />
              Stop Recording
            </Button>

            <Badge bg="danger" className="p-2">
              <FaPlay className="me-1" />
              REC {formatTime(recordingTime)}
            </Badge>

            <div className="mt-2">
              <small>Session ID: {sessionId}</small>
              <ProgressBar
                now={(recordingTime % 60) * 1.666}
                variant="danger"
                animated
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Video Preview */}
      {videoUrl && (
        <div className="preview-section mt-3 p-3 border rounded bg-light">
          <h6>
            <FaEye className="me-2" />
            Last Recording Preview
          </h6>
          <div className="d-flex gap-3 align-items-center">
            <video
              src={videoUrl}
              controls
              className="rounded"
              style={{ width: "200px", height: "150px" }}
            />
            <div>
              <p className="mb-1">
                <strong>Duration:</strong> {formatTime(recordingTime)}
              </p>
              <p className="mb-1">
                <strong>Session:</strong> {sessionId}
              </p>
              <p className="mb-1">
                <strong>Gaze Samples:</strong> {gazeDataRef.current.length}
              </p>
              
              {gazeStats && (
                <div className="mb-2">
                  <small>
                    <strong>Gaze Analysis:</strong> 
                    <br />• Focus: {gazeStats.focusPercentage}%
                    <br />• Avg Attention: {gazeStats.avgAttentionScore}%
                  </small>
                </div>
              )}
              
              <Button
                variant="success"
                size="sm"
                onClick={() => setPreview(!preview)}
                className="me-2"
              >
                {preview ? "Hide Details" : "Show Details"}
              </Button>
              
              {preview && gazeStats && (
                <div className="mt-2 p-2 bg-white rounded border">
                  <small>
                    <strong>Detailed Gaze Stats:</strong>
                    <br />• Center: {gazeStats.gazeDistribution?.center || 0}%
                    <br />• Left: {gazeStats.gazeDistribution?.left || 0}%
                    <br />• Right: {gazeStats.gazeDistribution?.right || 0}%
                    <br />• Up: {gazeStats.gazeDistribution?.up || 0}%
                    <br />• Down: {gazeStats.gazeDistribution?.down || 0}%
                    <br />• Face Detection: {gazeStats.faceDetectionRate}%
                    <br />• Blinks: {gazeStats.blinkCount}
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!userId && (
        <Alert variant="warning" className="mt-3">
          <FaExclamationTriangle className="me-2" />
          Please log in to record sessions for therapist review.
        </Alert>
      )}

      {/* Camera Status */}
      {!videoRef.current?.srcObject && (
        <Alert variant="info" className="mt-3">
          <FaEyeSlash className="me-2" />
          Camera is not available. Please allow camera access.
        </Alert>
      )}
    </div>
  );
};

export default VideoCaptureComponent;