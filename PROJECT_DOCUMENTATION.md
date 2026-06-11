# NeuroPlay - Comprehensive Project Documentation

**Therapeutic Gaming Platform for Autism Spectrum Disorder (ASD)**  
**Last Updated:** May 7, 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Game Systems & Logic](#game-systems--logic)
4. [Machine Learning Models](#machine-learning-models)
5. [Eye Gaze Tracking System](#eye-gaze-tracking-system)
6. [Analytics & Data Storage](#analytics--data-storage)
7. [Theme System](#theme-system)
8. [API Documentation](#api-documentation)
9. [Database Schema](#database-schema)
10. [Performance Optimization](#performance-optimization)
11. [Security Considerations & Privacy](#security-considerations--privacy)
12. [Troubleshooting & Debugging](#troubleshooting--debugging)

---

## Project Overview

### Mission
NeuroPlay is an innovative therapeutic gaming platform designed to support children with autism spectrum disorder through adaptive, game-based learning. The platform combines engaging gamification with clinical assessment tools, real-time AI tracking, and customizable themes to support speech, motor coordination, emotion recognition, and social development.

### Key Statistics
- **6 Interactive Games** with varying difficulty levels
- **7 Color Themes** for personalized UX
- **Real-time AI Analysis** using face-api.js and TensorFlow.js
- **Clinical Grade Analytics** with support level classification
- **Multi-User Support** with role-based access (Student, Parent, Therapist, Admin)
- **Bi-lingual Support** (English & Hindi)

### Technology Stack
- **Frontend:** React 18+, React Bootstrap, Framer Motion, Recharts, Vite
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **AI/ML:** face-api.js, TensorFlow.js, @tensorflow-models/pose-detection
- **Authentication:** JWT, bcryptjs
- **File Handling:** Multer for video uploads

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NeuroPlay Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │   FRONTEND       │  │   BACKEND        │               │
│  │   (React)        │  │   (Express)      │               │
│  ├──────────────────┤  ├──────────────────┤               │
│  │ • 6 Games        │  │ • REST API       │               │
│  │ • Dashboard      │  │ • Auth Routes    │               │
│  │ • Analytics      │  │ • Game Logic     │               │
│  │ • Video Upload   │  │ • File Handling  │               │
│  │ • Eye Tracking   │  │ • Data Analysis  │               │
│  └─────────┬────────┘  └────────┬─────────┘               │
│            │                    │                         │
│            └────────┬───────────┘                         │
│                     │                                     │
│            ┌────────▼─────────┐                           │
│            │   MongoDB        │                           │
│            │   • Users        │                           │
│            │   • Sessions     │                           │
│            │   • Gaze Data    │                           │
│            │   • Progress     │                           │
│            └──────────────────┘                           │
│                                                             │
│  ┌──────────────────────────────────┐                     │
│  │   AI/ML Models (Browser-Based)   │                     │
│  ├──────────────────────────────────┤                     │
│  │ • face-api.js (Face Detection)   │                     │
│  │ • TensorFlow.js (Pose Detection) │                     │
│  │ • Landmarks Detection            │                     │
│  │ • Expression Recognition         │                     │
│  └──────────────────────────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── AuthContext (JWT State Management)
├── ThemeContext (7 Color Themes)
├── Router
│   ├── Login
│   ├── Signup
│   ├── UserDashboard (Main Student Interface)
│   │   ├── ArcadeTab (Default View)
│   │   │   ├── EmotionMatchGame
│   │   │   ├── ReactionTestGame
│   │   │   ├── AutisticCameraGame (Face Mimic)
│   │   │   ├── ImitationGame (Pose Detection)
│   │   │   ├── SoundScapeGame
│   │   │   └── MagicHandsGame
│   │   ├── VideosTab
│   │   ├── EyeGazeTracker
│   │   └── SessionReviewModal
│   ├── ParentDashboard
│   ├── TherapistDashboard
│   │   ├── PatientSessionVault (Default View)
│   │   └── Settings
│   └── AdminDashboard
├── Navbar
└── Footer
```

---

## Game Systems & Logic

### Game 1: Emotion Match (Memory Card Game)

**Purpose:** Develop emotion recognition, memory, and empathy

**Game Mechanics:**
- Classic memory card matching with emotional faces
- 3 difficulty levels with increasing card count

**Difficulty Progression:**
| Level | Cards | Emotions | Grid |
|-------|-------|----------|------|
| 1 | 4 pairs (8 cards) | 4 emotions | 2x4 |
| 2 | 6 pairs (12 cards) | 6 emotions | 4x3 |
| 3 | 8 pairs (16 cards) | 6 emotions | 4x4 |

**Scoring Mechanics:**
```javascript
// Card Matching Logic
const accuracy = ((totalMoves - wrongAttempts) / totalMoves) * 100;

// Points Calculation
const baseScore = levelCompletionRatio * 100;
const speedBonus = (600 - timeSpent) / 6; // Better if faster
const final_score = baseScore + speedBonus;
```

**Emotions Included:**
1. Happy 😄
2. Sad 😢
3. Angry 😠
4. Surprised 😲
5. Neutral 😐
6. Tired 😴

**Key Features:**
- Framer Motion animations for card flips
- Confetti celebration on level completion
- Real-time timer (10 minutes per session)
- Wrong attempt tracking for feedback
- Voice instruction support (English/Hindi)

---

### Game 2: Reaction Test (Pattern Recognition)

**Purpose:** Improve reflexes, focus, and impulse control

**Game Mechanics:**
- Sequential pattern recognition based on colors/sounds
- User must replicate the pattern correctly
- Pattern grows longer with each successful round

**Pattern Progression:**
```javascript
const generatePattern = (roundNumber) => {
  const colors = ['red', 'blue', 'yellow', 'green'];
  const pattern = [];
  for (let i = 0; i < roundNumber; i++) {
    pattern.push(colors[Math.floor(Math.random() * 4)]);
  }
  return pattern; // Grows with each round
};
```

**Scoring System:**
- +10 points per correct color in pattern
- Time bonus: Max score - (timeToRespond / 1000) points
- Combo multiplier: Consecutive correct patterns × 1.5x

**Metrics Tracked:**
- Reaction time (ms)
- Pattern length achieved
- Accuracy percentage
- Combo streak

---

### Game 3: Face Mimic (AI-Powered Facial Recognition)

**Purpose:** Develop facial expression control and emotional awareness

**AI Model Used:** face-api.js with TensorFlow.js backend

**Game Flow:**
```
Load Models → Display Target Emotion → Real-time Face Detection → 
Match Detection → Success Feedback → Next Emotion → Finish & Analyze
```

**Emotions Targeted:**
1. Happy (Smile detection)
2. Surprised (Mouth open, eyebrows raised)
3. Angry (Frown, eyebrows down)
4. Neutral (Relaxed face)

**Technical Implementation:**

```javascript
// Face Detection Loop (Every 100ms)
const detections = await faceapi
  .detectAllFaces(video, options)
  .withFaceExpressions();

if (detections.length > 0) {
  const expressions = detections[0].expressions;
  
  const maxEmotion = Object.keys(expressions).reduce((a, b) =>
    expressions[a] > expressions[b] ? a : b
  );
  const confidence = expressions[maxEmotion];
  
  // Match Logic
  if (maxEmotion === targetEmotion) {
    const boost = confidence > 0.7 ? 4 : 2; 
    matchStreak = Math.min(100, matchStreak + boost);
  } else {
    matchStreak = Math.max(0, matchStreak - 1);
  }
  
  if (matchStreak >= 100) handleSuccess();
}
```

**Scoring Metrics:**
```javascript
// Final Score Calculation
const baseScore = 400; // 100 per emotion
const timeBonus = Math.max(0, 100 - (averageTime / 10000) * 50);
const consistencyBonus = consistency * 0.3;
const finalScore = Math.min(500, baseScore + timeBonus + consistencyBonus);
```

**Output Expressions:**
The face-api.js returns confidence scores (0-1) for: Neutral, Happy, Sad, Angry, Fearful, Disgusted, Surprised.

---

### Game 4: Imitation Game (AI Pose Detection)

**Purpose:** Develop gross motor coordination, balance, and body awareness

**AI Model Used:** @tensorflow-models/pose-detection

**Supported Poses:**
- Left Hand Up
- Right Hand Up
- Victory (Both arms raised)
- T-Pose
- Hands on Head
- Namaste
- Low 'A' Pose
- Right Salute

**Pose Detection Logic:**

```javascript
// Load Detector
let detector = await poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet,
  { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }
);

// Detect Pose (Every 100ms)
const poses = await detector.estimatePoses(video);

if (poses.length > 0) {
  const pose = poses[0];
  const keypoints = pose.keypoints; // 17 body joints
  
  // Pose Matching Algorithm
  const matchedPose = matchPosePattern(keypoints, targetPose);
  if (matchedPose.confidence > 0.65) {
    score += 100;
    moveToNextPose();
  }
}
```

**Pose Estimation Backend:**
- **Model:** MoveNet (SINGLEPOSE_THUNDER)
- **Output:** 17 body keypoints with x, y, confidence
- **Inference Speed:** ~30-50ms per frame

**Metrics Tracked:**
- Poses completed
- Accuracy per pose
- Balance stability index
- Motor control consistency

---

### Game 5: Sound Scape (Audio Localization)

**Purpose:** Develop auditory processing and spatial awareness

**Game Mechanics:**
- Sound source appears from different directions (L/R/C/U/D)
- Player must identify sound location
- Progressive difficulty with overlapping sounds

**Audio Implementation:**
```javascript
// Web Audio API for Spatial Audio
const audioContext = new AudioContext();
const panner = audioContext.createPanner();

// Set listener position (player)
audioContext.listener.setPosition(0, 0, 0);

// Set source position based on target location
const locations = {
  left: { x: -1, y: 0, z: 0 },
  right: { x: 1, y: 0, z: 0 },
  center: { x: 0, y: 0, z: 0 },
  up: { x: 0, y: 1, z: 0 },
  down: { x: 0, y: -1, z: 0 }
};

panner.setPosition(...locations[targetLocation]);
```

---

### Game 6: Magic Hands (Hand Tracking & Bubble Popping)

**Purpose:** Develop fine motor control and hand-eye coordination

**Game Mechanics:**
- Bubbles appear randomly on screen
- Player pops bubbles by moving hands
- Progressive game speed increases difficulty

**Hand Detection Logic:**
```javascript
// Uses pose-detection focusing on hand keypoints (9, 10 = left/right wrists)

const handPosition = {
  left: keypoints[9], 
  right: keypoints[10] 
};

// Collision Detection
const bubbles = generateBubbles(difficulty);
bubbles.forEach(bubble => {
  const distance = calculateDistance(handPosition, bubble.center);
  if (distance < bubble.radius) {
    popBubble(bubble);
    score += 10;
  }
});
```

---

## Machine Learning Models

### 1. Face Detection & Expression Recognition

**Model:** face-api.js (Built on TinyFaceDetector + FaceExpressionNet)

**Architecture:**
```
Input Image (Video Frame)
    ↓
TinyFaceDetector (Detects face bounding boxes)
    ↓
Face Landmark Detection (68 points for feature extraction)
    ↓
FaceExpressionNet (Classifies 7 emotions)
    ↓
Output: Emotion Label + Confidence Score
```

### 2. Pose Detection & Joint Localization

**Model:** MoveNet (Google's body pose estimation)

**Architecture:**
```
Input Video Stream
    ↓
MoveNet SINGLEPOSE_THUNDER (~30-50ms per frame)
    ↓
17 Body Keypoint Detection (x, y, confidence)
    ↓
Pose Matching Algorithm
    ↓
Output: Pose Match Confidence + Matched Keypoints
```

---

## Eye Gaze Tracking System

### Gaze Direction Algorithm

```javascript
const detectGazeDirection = (landmarks) => {
  // Extract eye region landmarks
  const leftEye = landmarks.slice(36, 42); 
  const rightEye = landmarks.slice(42, 48);
  
  // Calculate eye centers vs face center to determine direction
  // Horizontal gaze (Left, Center, Right)
  // Vertical gaze (Up, Center, Down)
  
  return {
    horizontal: direction, 
    vertical: verticalDirection,
    combined: `${verticalDirection}-${direction}`,
    confidence: calculateConfidence(landmarks)
  };
};
```

### Attention Score Calculation
```javascript
const calculateAttentionScore = (gazeData) => {
  let score = 100;
  
  // Deduct for not looking at screen
  if (!gazeData.isLookingAtScreen) score -= 30;
  
  // Deduct for peripheral vision (edges)
  if (distanceFromCenter > screenDiagonal * 0.3) score -= 20;
  
  score *= gazeData.confidenceScore;
  return Math.max(0, Math.min(100, Math.round(score)));
};
```

---

## Analytics & Data Storage

### Game Session Data Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  gameId: Number,
  gameName: String,
  score: Number,
  duration: Number,
  metadata: { ... }, // Game-specific metrics
  playedAt: Date
}
```

### Clinical Assessment Module
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  supportLevel: "Independent" | "Emerging" | "Needs Support",
  recommendations: [...],
  skillAreas: {
    emotionRecognition: { score: 85, trend: "improving" },
    motorCoordination: { score: 78, trend: "stable" }
  }
}
```

---

## Theme System

**State Management:** React Context API with localStorage persistence

**Theme Colors Used:**
- **Light:** Minimalist, professional
- **Dark:** Reduced eye strain for extended use
- **Ocean Blue:** Calming, professional
- **Forest Green:** Natural, soothing
- **Sunset Orange:** Energetic, warm
- **Lavender Purple:** Creative, calm
- **High Contrast:** Accessibility-focused

> [!NOTE]
> All themes utilize a designated `textSidebar` property to ensure text contrast and accessibility are strictly maintained across dark, light, or colored backgrounds.

---

## Roles and Dashboards

### 🎓 Student (UserDashboard)
- Streamlined Arcade-first interface for immediate therapeutic play.
- Minimal distraction; direct access to games and video recordings.
- Gamified level and points system to encourage regular engagement.

### 👨‍👩‍👧 Parent (ParentDashboard)
- Oversees child progress, game history, and analytics.
- Review reports generated by the therapist.

### 👨‍⚕️ Therapist (TherapistDashboard)
- Unified **Patient Session Vault** acting as a central hub for all clinical data.
- Access detailed game analytics, AI-generated engagement scores, and session videos.
- Add clinical notes, generate feedback, and update support levels.

### 🔧 Admin (AdminDashboard)
- Manage user accounts, system configuration, and high-level platform statistics.

---

## Security Considerations & Privacy

1. **Privacy-Preserving Face Blur Pipeline:**
   - On-device canvas manipulation applies a real-time blur to the patient's face during clinical video recording.
   - Body movements and behavioral data remain fully visible for therapist review.
   - The AI gaze and attention tracking models seamlessly operate on the *hidden unblurred raw camera feed* simultaneously, ensuring that clinical metrics are 100% accurate without compromising the user's anonymity in the recorded video.

2. **Authentication & Authorization:**
   - JWT tokens with 24h expiry
   - bcrypt password hashing
   - Strict role-based access control (Therapist can only see assigned patients)

3. **Data Protection:**
   - HTTPS for all communications
   - Input validation & sanitization
   - Secure video chunking and WebM encoding

---

## Troubleshooting & Debugging

**Face Detection Not Working:**
- Check light conditions (>100 lux)
- Verify model files exist in public/models
- Ensure the user is not heavily backlit

**Pose Detection Poor Accuracy:**
- Maintain 1-2m distance from webcam
- Reduce background clutter
- Avoid extremely loose clothing that obscures body joints

**Low Attention Scores in Eye Tracking:**
- Verify face is clearly visible and calibration was completed.
- Ensure the user's face is positioned centrally in the camera frame.

---

**Document Version:** 1.1  
**Last Updated:** May 7, 2026  
**Author:** NeuroPlay Development Team
