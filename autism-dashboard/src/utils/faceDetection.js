import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs';

let modelsLoaded = false;
let backendReady = false;

async function initTensorFlowBackend() {
  if (backendReady) return;

  try {
    // Use WebGL backend for best compatibility
    await tf.setBackend('webgl');
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

    const MODEL_URL = '/models';  // MUST be public/models folder

    console.log("📦 Loading face models...");

    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

    console.log("✅ Face models loaded");
    modelsLoaded = true;
    return true;

  } catch (error) {
    console.error("❌ Failed to load face models:", error);
    console.error("➡️ This usually means the model files are missing in /public/models");
    return false;
  }
}

export async function detectFaceAndCalculateAttention(videoElement) {
  try {
    if (!modelsLoaded) {
      const ok = await loadFaceModels();
      if (!ok) return getDefaultResult();
    }

    if (!videoElement || videoElement.readyState !== 4) {
      return getDefaultResult();
    }

    const detections = await faceapi
      .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (!detections || detections.length === 0) {
      return getDefaultResult();
    }

    const landmarks = detections[0].landmarks;

    const leftEAR = calculateEAR(landmarks.getLeftEye());
    const rightEAR = calculateEAR(landmarks.getRightEye());
    const avgEAR = (leftEAR + rightEAR) / 2;

    let attentionScore = 0;

    const eyeOpenness = Math.min(1, avgEAR / 0.28);
    attentionScore += eyeOpenness * 60;

    const blinkDetected = avgEAR < 0.16;
    const isLookingAtScreen = avgEAR > 0.12 && !blinkDetected;

    if (isLookingAtScreen) attentionScore += 40;

    attentionScore = Math.round(Math.max(0, Math.min(100, attentionScore)));

    return {
      faceDetected: true,
      attentionScore,
      isLookingAtScreen,
      blinkDetected,
      eyeOpenness: avgEAR
    };

  } catch (error) {
    console.error("❌ Face detection error:", error);
    return getDefaultResult();
  }
}

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

function getDefaultResult() {
  return {
    faceDetected: false,
    attentionScore: 0,
    isLookingAtScreen: false,
    blinkDetected: false,
    eyeOpenness: 0
  };
}
