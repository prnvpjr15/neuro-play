// import * as faceapi from '@vladmandic/face-api';
// import * as tf from '@tensorflow/tfjs';

// let modelsLoaded = false;
// let backendReady = false;

// async function initTensorFlowBackend() {
//   if (backendReady) return;

//   try {
//     // Use WebGL backend for best compatibility
//     await tf.setBackend('webgl');
//     await tf.ready();

//     console.log("✅ TensorFlow backend ready:", tf.getBackend());
//     backendReady = true;

//   } catch (err) {
//     console.error("❌ TensorFlow backend error:", err);
//   }
// }

// export async function loadFaceModels() {
//   if (modelsLoaded) return true;

//   try {
//     await initTensorFlowBackend();

//     const MODEL_URL = '/models';  // MUST be public/models folder

//     console.log("📦 Loading face models...");

//     await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
//     await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

//     console.log("✅ Face models loaded");
//     modelsLoaded = true;
//     return true;

//   } catch (error) {
//     console.error("❌ Failed to load face models:", error);
//     console.error("➡️ This usually means the model files are missing in /public/models");
//     return false;
//   }
// }

// export async function detectFaceAndCalculateAttention(videoElement) {
//   try {
//     if (!modelsLoaded) {
//       const ok = await loadFaceModels();
//       if (!ok) return getDefaultResult();
//     }

//     if (!videoElement || videoElement.readyState !== 4) {
//       return getDefaultResult();
//     }

//     const detections = await faceapi
//       .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
//       .withFaceLandmarks();

//     if (!detections || detections.length === 0) {
//       return getDefaultResult();
//     }

//     const landmarks = detections[0].landmarks;

//     const leftEAR = calculateEAR(landmarks.getLeftEye());
//     const rightEAR = calculateEAR(landmarks.getRightEye());
//     const avgEAR = (leftEAR + rightEAR) / 2;

//     let attentionScore = 0;

//     const eyeOpenness = Math.min(1, avgEAR / 0.28);
//     attentionScore += eyeOpenness * 60;

//     const blinkDetected = avgEAR < 0.16;
//     const isLookingAtScreen = avgEAR > 0.12 && !blinkDetected;

//     if (isLookingAtScreen) attentionScore += 40;

//     attentionScore = Math.round(Math.max(0, Math.min(100, attentionScore)));

//     return {
//       faceDetected: true,
//       attentionScore,
//       isLookingAtScreen,
//       blinkDetected,
//       eyeOpenness: avgEAR
//     };

//   } catch (error) {
//     console.error("❌ Face detection error:", error);
//     return getDefaultResult();
//   }
// }

// function calculateEAR(eyePoints) {
//   if (!eyePoints || eyePoints.length < 6) return 0.2;

//   const A = distance(eyePoints[1], eyePoints[5]);
//   const B = distance(eyePoints[2], eyePoints[4]);
//   const C = distance(eyePoints[0], eyePoints[3]);

//   if (C === 0) return 0.2;
//   return (A + B) / (2 * C);
// }

// function distance(p1, p2) {
//   return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
// }

// function getDefaultResult() {
//   return {
//     faceDetected: false,
//     attentionScore: 0,
//     isLookingAtScreen: false,
//     blinkDetected: false,
//     eyeOpenness: 0
//   };
// }

// export async function detectFaceAndCalculateGaze(videoElement) {
//   try {
//     if (!modelsLoaded) {
//       const ok = await loadFaceModels();
//       if (!ok) return getDefaultResult();
//     }

//     const detections = await faceapi
//       .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
//       .withFaceLandmarks();

//     if (!detections || detections.length === 0) {
//       return getDefaultResult();
//     }

//     const landmarks = detections[0].landmarks;
    
//     // Calculate gaze direction using eye and nose landmarks
//     const leftEye = landmarks.getLeftEye();
//     const rightEye = landmarks.getRightEye();
//     const nose = landmarks.getNose();
    
//     // Calculate eye centers
//     const leftEyeCenter = getCenter(leftEye);
//     const rightEyeCenter = getCenter(rightEye);
    
//     // Calculate gaze direction relative to nose
//     const leftGazeX = (leftEyeCenter.x - nose[0].x) / (nose[0].x - leftEyeCenter.x);
//     const rightGazeX = (rightEyeCenter.x - nose[0].x) / (rightEyeCenter.x - nose[0].x);
    
//     const avgGazeX = (leftGazeX + rightGazeX) / 2;
    
//     // Determine gaze direction
//     let gazeDirection = 'center';
//     if (avgGazeX < -0.2) gazeDirection = 'left';
//     else if (avgGazeX > 0.2) gazeDirection = 'right';
    
//     // Calculate attention score based on gaze
//     let attentionScore = calculateGazeAttentionScore(avgGazeX);
    
//     return {
//       faceDetected: true,
//       gazeDirection,
//       gazeIntensity: Math.abs(avgGazeX),
//       attentionScore,
//       timestamp: Date.now(),
//       landmarks: {
//         leftEye: leftEyeCenter,
//         rightEye: rightEyeCenter,
//         nose: nose[0]
//       }
//     };
    
//   } catch (error) {
//     console.error("❌ Gaze detection error:", error);
//     return getDefaultResult();
//   }
// }

// function getCenter(points) {
//   const sum = points.reduce((acc, p) => ({x: acc.x + p.x, y: acc.y + p.y}), {x: 0, y: 0});
//   return {x: sum.x / points.length, y: sum.y / points.length};
// }

// function analyzeGazeData(gazeData) {
//   if (!gazeData || gazeData.length === 0) return null;
  
//   const directions = gazeData.map(d => d.gazeDirection);
//   const attentionScores = gazeData.map(d => d.attentionScore);
  
//   return {
//     totalSamples: gazeData.length,
//     avgAttentionScore: attentionScores.reduce((a, b) => a + b, 0) / attentionScores.length,
//     gazeDistribution: {
//       left: directions.filter(d => d === 'left').length,
//       center: directions.filter(d => d === 'center').length,
//       right: directions.filter(d => d === 'right').length
//     },
//     focusDuration: gazeData.filter(d => d.attentionScore > 70).length,
//     distractionDuration: gazeData.filter(d => d.attentionScore < 40).length
//   };
// }
/*------------------------------------------------------------------------*/
// import * as faceapi from "@vladmandic/face-api";
// import * as tf from "@tensorflow/tfjs";

// let modelsLoaded = false;
// let backendReady = false;

// async function initTensorFlowBackend() {
//   if (backendReady) return;

//   try {
//     await tf.setBackend("webgl");
//     await tf.ready();
//     console.log("✅ TensorFlow backend ready:", tf.getBackend());
//     backendReady = true;
//   } catch (err) {
//     console.error("❌ TensorFlow backend error:", err);
//   }
// }

// export async function loadFaceModels() {
//   if (modelsLoaded) return true;

//   try {
//     await initTensorFlowBackend();
//     const MODEL_URL = "/models";

//     console.log("📦 Loading face models...");
//     await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
//     await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

//     console.log("✅ Face models loaded");
//     modelsLoaded = true;
//     return true;
//   } catch (error) {
//     console.error("❌ Failed to load face models:", error);
//     return false;
//   }
// }

// Enhanced gaze detection function
// export async function detectFaceAndCalculateGaze(videoElement) {
//   try {
//     if (!modelsLoaded) {
//       const ok = await loadFaceModels();
//       if (!ok) return getDefaultGazeResult();
//     }

//     if (!videoElement || videoElement.readyState !== 4) {
//       return getDefaultGazeResult();
//     }

//     const detections = await faceapi
//       .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
//       .withFaceLandmarks();

//     if (!detections || detections.length === 0) {
//       return getDefaultGazeResult();
//     }

//     const landmarks = detections[0].landmarks;
    
//     // Get eye landmarks for blink detection
//     const leftEye = landmarks.getLeftEye();
//     const rightEye = landmarks.getRightEye();
//     const nose = landmarks.getNose();
//     const faceBox = detections[0].detection.box;
    
//     // Calculate EAR (Eye Aspect Ratio) for blink detection
//     const leftEAR = calculateEAR(leftEye);
//     const rightEAR = calculateEAR(rightEye);
//     const avgEAR = (leftEAR + rightEAR) / 2;
//     const blinkDetected = avgEAR < 0.18;
    
//     // Calculate eye centers
//     const leftEyeCenter = getCenter(leftEye);
//     const rightEyeCenter = getCenter(rightEye);
//     const eyeCenter = {
//       x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
//       y: (leftEyeCenter.y + rightEyeCenter.y) / 2
//     };
    
//     // Calculate relative gaze position
//     const faceCenterX = faceBox.x + faceBox.width / 2;
//     const faceCenterY = faceBox.y + faceBox.height / 2;
    
//     // Normalized gaze vector (0,0 = center of face)
//     const gazeVector = {
//       x: (eyeCenter.x - faceCenterX) / (faceBox.width / 2),
//       y: (eyeCenter.y - faceCenterY) / (faceBox.height / 3)
//     };
    
//     // Determine gaze direction
//     let gazeDirection = "center";
//     if (Math.abs(gazeVector.x) > Math.abs(gazeVector.y)) {
//       if (gazeVector.x < -0.3) gazeDirection = "left";
//       else if (gazeVector.x > 0.3) gazeDirection = "right";
//     } else {
//       if (gazeVector.y < -0.2) gazeDirection = "up";
//       else if (gazeVector.y > 0.2) gazeDirection = "down";
//     }
    
//     // Calculate attention score (0-100)
//     let attentionScore = 0;
    
//     // Eye openness contributes 40%
//     const eyeOpennessScore = Math.min(100, (avgEAR / 0.28) * 40);
//     attentionScore += eyeOpennessScore;
    
//     // Center gaze contributes 40%
//     const gazeCenterScore = gazeDirection === "center" ? 40 : 
//                           (gazeDirection === "left" || gazeDirection === "right" ? 20 : 10);
//     attentionScore += gazeCenterScore;
    
//     // No blink contributes 20%
//     const noBlinkScore = !blinkDetected ? 20 : 0;
//     attentionScore += noBlinkScore;
    
//     attentionScore = Math.round(Math.max(0, Math.min(100, attentionScore)));
    
//     return {
//       faceDetected: true,
//       gazeDirection,
//       gazeVector,
//       attentionScore,
//       eyeOpenness: avgEAR,
//       blinkDetected,
//       isLookingAtScreen: gazeDirection === "center" && !blinkDetected && avgEAR > 0.2,
//       timestamp: Date.now(),
//       landmarks: {
//         leftEye: leftEyeCenter,
//         rightEye: rightEyeCenter,
//         nose: nose[0],
//         eyeCenter
//       }
//     };
    
//   } catch (error) {
//     console.error("❌ Gaze detection error:", error);
//     return getDefaultGazeResult();
//   }
// }

// faceDetection.js - Optimized for the "Fresh Start"

// import * as faceapi from '@vladmandic/face-api';

// const tf = faceapi.tf;

// let modelsLoaded = false;
// let previousScore = 100; // for smoothing

// // =========================
// // LOAD MODELS
// // =========================
// export async function loadFaceModels() {
//   if (modelsLoaded) return true;

//   try {
//     await tf.setBackend('webgl');
//     await tf.ready();

//     const MODEL_URL = '/models';

//     await Promise.all([
//       faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
//       faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
//     ]);

//     console.log("✅ Models & Backend Ready:", tf.getBackend());
//     modelsLoaded = true;
//     return true;
//   } catch (error) {
//     console.error("❌ Model Load Failed:", error);
//     return false;
//   }
// }

// // =========================
// // EYE ASPECT RATIO (Blink Detection)
// // =========================
// function eyeAspectRatio(eye) {
//   const vertical1 = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
//   const vertical2 = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
//   const horizontal = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
//   return (vertical1 + vertical2) / (2.0 * horizontal);
// }

// // =========================
// // MAIN DETECTION FUNCTION
// // =========================
// export async function detectFaceAndCalculateGaze(videoElement) {
//   // if (!modelsLoaded) {
//   //   return {
//   //     faceDetected: false,
//   //     attentionScore: 0,
//   //     gazeDirection: "none"
//   //   };
//   // }

//   try {
//     const detection = await faceapi
//       .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
//       .withFaceLandmarks();

//     if (!detection) {
//       previousScore = previousScore * 0.8; // decay smoothly
//       return {
//         faceDetected: false,
//         attentionScore: Math.round(previousScore),
//         gazeDirection: "none"
//       };
//     }

//     const landmarks = detection.landmarks;
//     const leftEye = landmarks.getLeftEye();
//     const rightEye = landmarks.getRightEye();
//     const nose = landmarks.getNose();

//     // =========================
//     // HEAD ROTATION (Yaw Proxy)
//     // =========================
//     const leftEyeOuter = leftEye[0];
//     const rightEyeOuter = rightEye[3];

//     const angle =
//       Math.atan2(
//         rightEyeOuter.y - leftEyeOuter.y,
//         rightEyeOuter.x - leftEyeOuter.x
//       ) * (180 / Math.PI);

//     // =========================
//     // HORIZONTAL + VERTICAL OFFSET
//     // =========================
//     const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
//     const eyeCenterY = (leftEye[1].y + rightEye[1].y) / 2;

//     const noseX = nose[3].x;
//     const noseY = nose[3].y;

//     const horizontalDiff = Math.abs(eyeCenterX - noseX);
//     const verticalDiff = Math.abs(eyeCenterY - noseY);

//     // =========================
//     // EYE OPENNESS
//     // =========================
//     const leftEAR = eyeAspectRatio(leftEye);
//     const rightEAR = eyeAspectRatio(rightEye);
//     const avgEAR = (leftEAR + rightEAR) / 2;

//     const eyesOpen = avgEAR > 0.2;

//     // =========================
//     // PRODUCTION-LEVEL SCORING
//     // =========================
//     let score = 100;

//     score -= horizontalDiff * 1.5;
//     score -= verticalDiff * 1.2;
//     score -= Math.abs(angle) * 1.5;

//     if (!eyesOpen) score -= 30;

//     score = Math.max(0, Math.min(100, score));

//     // =========================
//     // TEMPORAL SMOOTHING
//     // =========================
//     const smoothedScore = previousScore * 0.7 + score * 0.3;
//     previousScore = smoothedScore;

//     // =========================
//     // GAZE DIRECTION
//     // =========================
//     let gazeDirection = "center";

//     if (horizontalDiff > 25) {
//       gazeDirection = noseX > eyeCenterX ? "right" : "left";
//     }

//     if (verticalDiff > 25) {
//       gazeDirection = noseY > eyeCenterY ? "down" : "up";
//     }

//     return {
//       faceDetected: true,
//       attentionScore: Math.round(smoothedScore),
//       gazeDirection,
//       confidence: detection.detection.score,
//       eyesOpen
//     };
//   } catch (err) {
//     console.error("Detection Error:", err);
//     return {
//       faceDetected: false,
//       attentionScore: 0,
//       gazeDirection: "none"
//     };
//   }
// }

// // =========================
// // SESSION ANALYTICS
// // =========================
// export function analyzeGazeData(gazeData) {
//   if (!gazeData || gazeData.length === 0) {
//     return {
//       avgAttentionScore: 0,
//       faceDetectionRate: 0,
//       engagementLevel: "Low"
//     };
//   }

//   const valid = gazeData.filter(d => d.faceDetected);

//   const avg =
//     valid.reduce((acc, curr) => acc + curr.attentionScore, 0) /
//     (valid.length || 1);

//   const detectionRate = (valid.length / gazeData.length) * 100;

//   let engagementLevel = "Low";
//   if (avg > 75) engagementLevel = "High";
//   else if (avg > 45) engagementLevel = "Medium";

//   return {
//     avgAttentionScore: Math.round(avg),
//     faceDetectionRate: Math.round(detectionRate),
//     engagementLevel
//   };
// }
import * as faceapi from '@vladmandic/face-api';

let previousScore = 100; // for smoothing

// =========================
// EYE ASPECT RATIO (Blink Detection)
// =========================
function eyeAspectRatio(eye) {
  const vertical1 = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
  const vertical2 = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
  const horizontal = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

// =========================
// MAIN DETECTION FUNCTION
// =========================
export async function detectFaceAndCalculateGaze(videoElement) {
  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (!detection) {
      // Smooth decay instead of instant zero
      previousScore = previousScore * 0.9;
      return {
        faceDetected: false,
        attentionScore: Math.round(previousScore),
        gazeDirection: "none"
      };
    }

    const landmarks = detection.landmarks;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNose();

    const leftEyeOuter = leftEye[0];
    const rightEyeOuter = rightEye[3];

    // =========================
    // FACE WIDTH (Normalization Base)
    // =========================
    const faceWidth = Math.hypot(
      rightEyeOuter.x - leftEyeOuter.x,
      rightEyeOuter.y - leftEyeOuter.y
    );

    // =========================
    // HEAD ROTATION (Yaw Proxy)
    // =========================
    const angle =
      Math.atan2(
        rightEyeOuter.y - leftEyeOuter.y,
        rightEyeOuter.x - leftEyeOuter.x
      ) * (180 / Math.PI);

    // =========================
    // HORIZONTAL + VERTICAL OFFSET
    // =========================
    const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
    const eyeCenterY = (leftEye[1].y + rightEye[1].y) / 2;

    const noseX = nose[3].x;
    const noseY = nose[3].y;

    const horizontalDiff = Math.abs(eyeCenterX - noseX);
    const verticalDiff = Math.abs(eyeCenterY - noseY);

    // =========================
    // NORMALIZE VALUES
    // =========================
    const horizontalRatio = horizontalDiff / faceWidth;
    const verticalRatio = verticalDiff / faceWidth;
    const angleRatio = Math.abs(angle) / 30; // 30° ~ max natural head turn

    // =========================
    // EYE OPENNESS
    // =========================
    const leftEAR = eyeAspectRatio(leftEye);
    const rightEAR = eyeAspectRatio(rightEye);
    const avgEAR = (leftEAR + rightEAR) / 2;

    const eyesOpen = avgEAR > 0.2;

    // =========================
    // PRODUCTION SCORING
    // =========================
    let score = 100;

    score -= horizontalRatio * 60;
    score -= verticalRatio * 40;
    score -= angleRatio * 40;

    if (!eyesOpen) score -= 25;

    score = Math.max(0, Math.min(100, score));

    // =========================
    // TEMPORAL SMOOTHING
    // =========================
    const smoothedScore = previousScore * 0.85 + score * 0.15;
    previousScore = smoothedScore;

    // =========================
    // GAZE DIRECTION
    // =========================
    let gazeDirection = "center";

    if (horizontalRatio > 0.15) {
      gazeDirection = noseX > eyeCenterX ? "right" : "left";
    }

    if (verticalRatio > 0.15) {
      gazeDirection = noseY > eyeCenterY ? "down" : "up";
    }

    return {
      faceDetected: true,
      attentionScore: Math.round(smoothedScore),
      gazeDirection,
      confidence: detection.detection.score,
      eyesOpen
    };

  } catch (err) {
    console.error("Detection Error:", err);
    return {
      faceDetected: false,
      attentionScore: 0,
      gazeDirection: "none"
    };
  }
}

// =========================
// SESSION ANALYTICS
// =========================
export function analyzeGazeData(gazeData) {
  if (!gazeData || gazeData.length === 0) {
    return {
      avgAttentionScore: 0,
      faceDetectionRate: 0,
      engagementLevel: "Low"
    };
  }

  const valid = gazeData.filter(d => d.faceDetected);

  const avg =
    valid.reduce((acc, curr) => acc + (parseFloat(curr.attentionScore) || 0), 0) /
    (valid.length || 1);

  const detectionRate = (valid.length / gazeData.length) * 100;

  let engagementLevel = "Low";
  if (avg > 75) engagementLevel = "High";
  else if (avg > 45) engagementLevel = "Medium";

  return {
    avgAttentionScore: Math.round(avg),
    faceDetectionRate: Math.round(detectionRate),
    engagementLevel
  };
}
