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
import * as faceapi from "@vladmandic/face-api";
import * as tf from "@tensorflow/tfjs";

let modelsLoaded = false;
let backendReady = false;

async function initTensorFlowBackend() {
  if (backendReady) return;

  try {
    await tf.setBackend("webgl");
    await tf.ready();
    console.log("✅ TensorFlow backend ready:", tf.getBackend());
    backendReady = true;
  } catch (err) {
    console.error("❌ TensorFlow backend error:", err);
  }
}

export async function loadFaceModels() {
  if (modelsLoaded) return true;

  try {
    await initTensorFlowBackend();
    const MODEL_URL = "/models";

    console.log("📦 Loading face models...");
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

    console.log("✅ Face models loaded");
    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error("❌ Failed to load face models:", error);
    return false;
  }
}

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

export async function detectFaceAndCalculateGaze(videoElement) {
  // 1. Safety checks
  if (!videoElement || videoElement.readyState !== 4) return null;
  
  try {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 });
    
    // We only need landmarks for eye gazing
    const result = await faceapi.detectSingleFace(videoElement, options).withFaceLandmarks();

    if (!result) {
      return { detected: false, direction: 'none', attentionScore: 0 };
    }

    const landmarks = result.landmarks;
    const box = result.detection.box;

    // 2. Get Eye Centers
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    const getAvg = (pts) => ({
      x: pts.reduce((a, b) => a + b.x, 0) / pts.length,
      y: pts.reduce((a, b) => a + b.y, 0) / pts.length
    });

    const eyeCenter = getAvg([...leftEye, ...rightEye]);

    // 3. Normalized Gaze Calculation
    // We compare eye position relative to the center of the face box
    const faceCenterX = box.x + box.width / 2;
    const faceCenterY = box.y + box.height / 2;
    
    const dx = (eyeCenter.x - faceCenterX) / (box.width / 2);
    const dy = (eyeCenter.y - faceCenterY) / (box.height / 2);

    let direction = "center";
    if (dx < -0.2) direction = "left";
    else if (dx > 0.2) direction = "right";
    
    // 4. Attention Score (EAR - Eye Aspect Ratio)
    const ear = calculateEAR(leftEye, rightEye);

    return {
      detected: true,
      direction: direction,
      attentionScore: ear > 0.18 ? (direction === "center" ? 100 : 70) : 0,
      timestamp: Date.now()
    };
  } catch (err) {
    console.error("Gaze Detection Error:", err);
    return null;
  }
}

// Original function for backward compatibility
export async function detectFaceAndCalculateAttention(videoElement) {
  const gazeResult = await detectFaceAndCalculateGaze(videoElement);
  return {
    faceDetected: gazeResult.faceDetected,
    attentionScore: gazeResult.attentionScore,
    isLookingAtScreen: gazeResult.isLookingAtScreen,
    blinkDetected: gazeResult.blinkDetected,
    eyeOpenness: gazeResult.eyeOpenness
  };
}

// Helper functions
function calculateEAR(eyePoints) {
  if (!eyePoints || eyePoints.length < 6) return 0.2;

  const A = distance(eyePoints[1], eyePoints[5]);
  const B = distance(eyePoints[2], eyePoints[4]);
  const C = distance(eyePoints[0], eyePoints[3]);

  if (C === 0) return 0.2;
  return (A + B) / (2 * C);
}

function distance(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

function getCenter(points) {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function getDefaultResult() {
  return {
    faceDetected: false,
    attentionScore: 0,
    isLookingAtScreen: false,
    blinkDetected: false,
    eyeOpenness: 0,
  };
}

function getDefaultGazeResult() {
  return {
    faceDetected: false,
    gazeDirection: "unknown",
    gazeVector: { x: 0, y: 0 },
    attentionScore: 0,
    eyeOpenness: 0,
    blinkDetected: false,
    isLookingAtScreen: false,
    timestamp: Date.now(),
    landmarks: null
  };
}

// Gaze analysis helper (EXPORT THIS!)
export function analyzeGazeData(gazeData) {
  if (!gazeData || gazeData.length === 0) return null;

  const validGazeData = gazeData.filter(d => d.faceDetected);
  if (validGazeData.length === 0) return null;

  const directions = validGazeData.map(d => d.gazeDirection);
  const attentionScores = validGazeData.map(d => d.attentionScore);
  const totalSamples = validGazeData.length;
  
  // Calculate percentages
  const directionCounts = {
    left: directions.filter(d => d === "left").length,
    right: directions.filter(d => d === "right").length,
    center: directions.filter(d => d === "center").length,
    up: directions.filter(d => d === "up").length,
    down: directions.filter(d => d === "down").length,
    unknown: directions.filter(d => d === "unknown").length
  };

  return {
    totalSamples,
    faceDetectionRate: Math.round((validGazeData.length / gazeData.length) * 100),
    avgAttentionScore: Math.round(attentionScores.reduce((a, b) => a + b, 0) / attentionScores.length),
    gazeDistribution: {
      left: Math.round((directionCounts.left / totalSamples) * 100),
      right: Math.round((directionCounts.right / totalSamples) * 100),
      center: Math.round((directionCounts.center / totalSamples) * 100),
      up: Math.round((directionCounts.up / totalSamples) * 100),
      down: Math.round((directionCounts.down / totalSamples) * 100),
      unknown: Math.round((directionCounts.unknown / totalSamples) * 100)
    },
    focusDuration: validGazeData.filter(d => d.attentionScore > 70).length,
    distractionDuration: validGazeData.filter(d => d.attentionScore < 40).length,
    blinkCount: validGazeData.filter(d => d.blinkDetected).length,
    focusPercentage: Math.round((validGazeData.filter(d => d.isLookingAtScreen).length / totalSamples) * 100)
  };
}