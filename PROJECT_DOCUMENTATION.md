# NeuroPlay - Comprehensive Project Documentation

**Therapeutic Gaming Platform for Autism Spectrum Disorder (ASD)**  
**Last Updated:** March 9, 2026

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
11. [Security Considerations](#security-considerations)
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
│   │   ├── HomeTab
│   │   ├── ArcadeTab
│   │   │   ├── EmotionMatchGame
│   │   │   ├── ReactionTestGame
│   │   │   ├── AutisticCameraGame (Face Mimic)
│   │   │   ├── ImitationGame (Pose Detection)
│   │   │   ├── SoundScapeGame
│   │   │   └── MagicHandsGame
│   │   ├── ProgressTab (Analytics)
│   │   ├── EyeGazeTracker
│   │   └── SessionReviewModal
│   ├── ParentDashboard
│   ├── TherapistDashboard
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

**State Management:**
```javascript
const [level, setLevel] = useState(1);
const [cards, setCards] = useState([]); // Shuffled cards
const [flipped, setFlipped] = useState([]); // Index of flipped cards
const [solved, setSolved] = useState([]); // Solved pairs
const [moves, setMoves] = useState(0); // Card flip count
const [wrongAttempts, setWrongAttempts] = useState(0);
const [timeLeft, setTimeLeft] = useState(600); // 10 min timer
```

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

**Implementation Details:**
- Sequential pattern display with 0.5s intervals
- User input validation with timeout
- Sound feedback for correct/incorrect responses
- Progressive difficulty increase

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
// Model Loading
const options = new faceapi.TinyFaceDetectorOptions({
  inputSize: 224, // Input resolution
  scoreThreshold: 0.5 // Minimum detection confidence
});

// Face Detection Loop (Every 100ms)
const detections = await faceapi
  .detectAllFaces(video, options)
  .withFaceExpressions();

if (detections.length > 0) {
  const expressions = detections[0].expressions;
  // expressions = {
  //   neutral: 0.85,
  //   happy: 0.05,
  //   sad: 0.02,
  //   angry: 0.08,
  //   fearful: 0.0,
  //   disgusted: 0.0,
  //   surprised: 0.0
  // }
  
  const maxEmotion = Object.keys(expressions).reduce((a, b) =>
    expressions[a] > expressions[b] ? a : b
  );
  const confidence = expressions[maxEmotion];
  
  // Match Logic
  if (maxEmotion === targetEmotion) {
    const boost = confidence > 0.7 ? 4 : 2; // High confidence = 4 pts, else 2
    matchStreak = Math.min(100, matchStreak + boost);
  } else {
    matchStreak = Math.max(0, matchStreak - 1);
  }
  
  // Success when matchStreak >= 100
  if (matchStreak >= 100) handleSuccess();
}
```

**Scoring Metrics:**
```javascript
// Per Emotion Score
const emotionScore = {
  emotion: "happy",
  timeTaken: 3500, // milliseconds
  finalProgress: 100,
  startTime: timestamp,
  endTime: timestamp
};

// Session Metrics
const totalTime = emotionScores.sum(e => e.timeTaken);
const averageTime = totalTime / emotionCount;
const consistency = 100 - ((maxTime - minTime) / maxTime) * 100;

// Final Score Calculation
const baseScore = 400; // 100 per emotion
const timeBonus = Math.max(0, 100 - (averageTime / 10000) * 50);
const consistencyBonus = consistency * 0.3;
const finalScore = Math.min(500, baseScore + timeBonus + consistencyBonus);
```

**Data Stored per Session:**
```javascript
{
  emotions: [
    {
      name: "happy",
      timeTaken: ms,
      consistency: %,
      confidenceScore: 0-1
    },
    // ... more emotions
  ],
  totalScore: 450,
  averageTime: 2800,
  struggleOrder: "angry → surprised → happy → neutral",
  consistency: 92.5
}
```

**Face Detection Parameters:**
- **Model:** TinyFaceDetector (lightweight, ~40MB)
- **Input Size:** 224x224 pixels
- **Detection Threshold:** 0.5 (50% confidence minimum)
- **Detection Interval:** 100ms
- **Backend:** WebGL (GPU acceleration)

**Output Expressions:**
The face-api.js returns confidence scores (0-1) for:
1. Neutral (Relaxed face)
2. Happy (Smile)
3. Sad (Frown)
4. Angry (Tension)
5. Fearful (Scared)
6. Disgusted (Upset face)
7. Surprised (Open mouth, raised brows)

---

### Game 4: Imitation Game (AI Pose Detection)

**Purpose:** Develop gross motor coordination, balance, and body awareness

**AI Model Used:** @tensorflow-models/pose-detection

**Supported Poses:**

| Pose ID | Name | Body Position | Clinical Value |
|---------|------|---------------|-----------------|
| left_up | Left Hand Up | Left arm raised | Unilateral motor control |
| right_up | Right Hand Up | Right arm raised | Unilateral motor control |
| both_up | Victory | Both arms raised | Bilateral coordination |
| t_pose | T-Pose | Arms extended side | Balance & stability |
| hands_head | Hands on Head | Hands touching head | Fine-gross coordination |
| namaste | Namaste | Hands together at chest | Center alignment |
| low_a | Low 'A' Pose | Arms down at angles | Lower body awareness |
| salute | Right Salute | Right hand at head | Precision movement |

**Pose Detection Logic:**

```javascript
// Load Detector
let detector = await poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet,
  {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
  }
);

// Detect Pose (Every 100ms)
const poses = await detector.estimatePoses(video);

if (poses.length > 0) {
  const pose = poses[0];
  const keypoints = pose.keypoints; // 17 body joints
  
  // Keypoint Mapping (0-16):
  // 0: nose, 1: L_eye, 2: R_eye, 3: L_ear, 4: R_ear
  // 5: L_shoulder, 6: R_shoulder, 7: L_elbow, 8: R_elbow
  // 9: L_wrist, 10: R_wrist, 11: L_hip, 12: R_hip
  // 13: L_knee, 14: R_knee, 15: L_ankle, 16: R_ankle
  
  // Pose Matching Algorithm
  const matchedPose = matchPosePattern(keypoints, targetPose);
  if (matchedPose.confidence > 0.65) {
    score += 100;
    moveToNextPose();
  }
}
```

**Pose Matching Algorithm:**

```javascript
const matchPosePattern = (detectedKeypoints, targetPose) => {
  let matchScore = 0;
  let validKeypoints = 0;
  
  for (let keypoint of detectedKeypoints) {
    if (keypoint.score > 0.5 && keypoint.score < 1.0) {
      let distance = calculateDistance(
        keypoint,
        targetPose.keypoints[keypoint.name]
      );
      
      // Distance-based scoring (closer = higher score)
      const similarity = Math.max(0, 1 - (distance / threshold));
      matchScore += similarity;
      validKeypoints++;
    }
  }
  
  return {
    confidence: validKeypoints > 10 ? matchScore / validKeypoints : 0,
    matchedKeypoints: validKeypoints
  };
};
```

**Pose Estimation Backend:**
- **Model:** MoveNet (SINGLEPOSE_THUNDER)
- **Architecture:** Lightweight CNNs for efficient inference
- **Output:** 17 body keypoints with x, y, confidence
- **Inference Speed:** ~30-50ms per frame
- **Accuracy:** ±15cm at 1.5m distance

**Scoring Mechanics:**
- 100 points per correct pose
- Time bonus for quick detection
- Streak multiplier for consecutive correct poses
- Penalty for incorrect poses

**Metrics Tracked:**
- Poses completed
- Accuracy per pose
- Balance stability index
- Motor control consistency

---

### Game 5: Sound Scape (Audio Localization)

**Purpose:** Develop auditory processing and spatial awareness

**Game Mechanics:**
- Sound source appears from different directions
- Player must identify sound location (Left, Center, Right, Up, Down)
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

**Difficulty Levels:**
1. **Easy:** Single sound, 3 locations (L, C, R)
2. **Medium:** Single sound, 5 locations (L, R, C, U, D)
3. **Hard:** Overlapping sounds, 5 locations with distraction

**Scoring:**
- +50 points per correct identification
- Time bonus: 30 - (responseTime / 1000) points
- Combo multiplier: 1.5x for 3+ consecutive correct

**Audio Files Required:**
- Clear speech sounds (numbers, words)
- Different tones for variety
- Ambient background options

---

### Game 6: Magic Hands (Hand Tracking & Bubble Popping)

**Purpose:** Develop fine motor control and hand-eye coordination

**Game Mechanics:**
- Bubbles appear randomly on screen
- Player pops bubbles by moving hands
- Progressive game speed increases difficulty

**Hand Detection Logic:**
```javascript
// Uses pose-detection from Game 4
// Focuses on hand keypoints (9, 10 = left/right wrists)

const handPosition = {
  left: keypoints[9], // L_wrist
  right: keypoints[10] // R_wrist
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

**Game Progression:**
| Level | Initial Bubbles | Speed | Duration |
|-------|-----------------|-------|----------|
| 1 | 3 | 1x | 30s |
| 2 | 5 | 1.5x | 45s |
| 3 | 7 | 2x | 60s |

**Scoring System:**
- +10 points per bubble popped
- +5 bonus per combo (uninterrupted popping)
- +50 time completion bonus
- -2 points per missed bubble

**Metrics:**
- Bubbles popped
- Accuracy (correct hits / attempts)
- Combo streak (max consecutive pops)
- Hand stability index

---

## Machine Learning Models

### 1. Face Detection & Expression Recognition

**Model:** face-api.js (Built on TinyFaceDetector + FaceExpressionNet)

**Architecture:**
```
Input Image (Video Frame)
    ↓
TinyFaceDetector
├─ Lightweight CNN (~2.2MB)
├─ Detects face bounding boxes
└─ Fast inference (<50ms)
    ↓
Face Landmark Detection (68 points)
├─ Eye corners, nose, mouth, jawline
└─ Used for precise feature extraction
    ↓
FaceExpressionNet
├─ Classifies 7 emotions
└─ Returns confidence scores for each
    ↓
Output: Emotion Label + Confidence Score
```

**Input Requirements:**
- Video frame: 224x224 minimum
- Format: WebGL-compatible canvas/video
- Lighting: Well-lit environment (>100 lux recommended)

**Detected Emotions:**
```javascript
{
  neutral: 0.85,    // No expression
  happy: 0.05,      // Smile (cheek raise, eye crinkle)
  sad: 0.02,        // Frown (mouth down, brow down)
  angry: 0.08,      // Tension (brow frown, mouth tense)
  fearful: 0.0,     // Scared (wide eyes, brow raise)
  disgusted: 0.0,   // Upset (nose wrinkle, lip raise)
  surprised: 0.0    // Shock (mouth open, brow raise)
}
```

**Performance:**
- Inference Time: 30-100ms per frame
- Accuracy: ~85-90% on standard faces
- GPU Required: Yes (WebGL backend)
- Memory: ~45MB total

**Limitations:**
1. **Occlusion:** Glasses, masks, hands block detection
2. **Lighting:** Poor lighting reduces accuracy
3. **Angles:** Profile views (<45°) reduce reliability
4. **Ethnicity:** Trained on diverse datasets, but slight bias possible
5. **Expressions:** Slight expressions may be misclassified

**Optimization Techniques Used:**
```javascript
// 1. Backend Optimization
await faceapi.tf.setBackend("webgl"); // GPU acceleration

// 2. Input Resizing
const resized = tf.image.resizeBilinear(input, [224, 224]);

// 3. Batch Processing (disabled for single-user)
// const detections = await faceapi.detectAllFaces(video);

// 4. Skip Frames Strategy
if (frameCount % 3 === 0) { // Process every 3rd frame
  detectFaceExpression();
}
```

---

### 2. Pose Detection & Joint Localization

**Model:** MoveNet (Google's body pose estimation)

**Architecture:**
```
Input Video Stream
    ↓
MoveNet SINGLEPOSE_THUNDER
├─ Lightweight CNN (~4MB)
├─ Processes 192x256 input resolution
└─ ~30-50ms per frame
    ↓
17 Body Keypoint Detection
├─ Each keypoint: (x, y, confidence)
├─ Confidence: 0-1 (detection probability)
└─ Keypoints: Head, arms, torso, legs
    ↓
Pose Matching Algorithm
└─ Compares detected vs target pose
    ↓
Output: Pose Match Confidence + Matched Keypoints
```

**17 Keypoints Detected:**

```
     0(nose)
   3/    \4
  L_eye  R_eye
  5      6
  L_shoulder   R_shoulder
  7      8
  L_elbow    R_elbow
  9     10
  L_wrist   R_wrist
  11    12
  L_hip    R_hip
  13    14
  L_knee    R_knee
  15    16
  L_ankle   R_ankle
```

**Model Performance:**
- **Inference Time:** 30-50ms per frame @ 1080p
- **Accuracy:** ±5-10cm at 1.5m distance
- **GPU Required:** Yes (WebGL)
- **Memory:** ~8MB

**Distance Calculation for Pose Matching:**

```javascript
const calculateKeyPointDistance = (detected, expected) => {
  const dx = detected.x - expected.x;
  const dy = detected.y - expected.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Pose Match Success Criteria
const isValidPose = (keypoints, targetPose) => {
  const requiredKeypoints = targetPose.criticalKeypoints;
  let validCount = 0;
  
  requiredKeypoints.forEach(kpIndex => {
    if (keypoints[kpIndex].score > 0.5) { // >50% confidence
      const distance = calculateKeyPointDistance(
        keypoints[kpIndex],
        targetPose.expectedPositions[kpIndex]
      );
      if (distance < threshold) validCount++;
    }
  });
  
  return (validCount / requiredKeypoints.length) > 0.65; // 65% match required
};
```

---

### 3. Web Audio API (Sound Spatialization)

**Technology:** Web Audio API Panner Node

**3D Audio Positioning:**
```javascript
// Create audio context
const context = new AudioContext();
const panner = context.createPanner();

// Set panner position in 3D space
panner.setPosition(x, y, z);

// Set listener (player/user) position
context.listener.setPosition(0, 0, 0);
context.listener.setOrientation(0, 0, 1, 0, 1, 0);

// Connect source → panner → destination
source.connect(panner);
panner.connect(context.destination);

// Position presets for SoundScape game
const soundLocations = {
  left: { x: -5, y: 0, z: 0 },    // Hard left
  right: { x: 5, y: 0, z: 0 },    // Hard right
  center: { x: 0, y: 0, z: 0 },   // Center
  up: { x: 0, y: 3, z: 0 },       // Above
  down: { x: 0, y: -3, z: 0 }     // Below
};
```

---

## Eye Gaze Tracking System

### Technology Stack
- **Face Landmarks Detection:** face-api.js (68 landmark points)
- **Eye Region Analysis:** Pixel-level analysis of iris position
- **Real-time Processing:** 100ms detection interval

### Gaze Direction Algorithm

```javascript
// Face landmark structure (68 points):
// Points 36-47: Left eye (0-11)
// Points 42-47: Right eye (0-5)

const detectGazeDirection = (landmarks) => {
  // Extract eye region landmarks
  const leftEye = landmarks.slice(36, 42);    // 6 points: L_eye
  const rightEye = landmarks.slice(42, 48);   // 6 points: R_eye
  
  // Calculate eye centers
  const leftEyeCenter = {
    x: (leftEye[0].x + leftEye[3].x) / 2,
    y: (leftEye[0].y + leftEye[3].y) / 2
  };
  
  const rightEyeCenter = {
    x: (rightEye[0].x + rightEye[3].x) / 2,
    y: (rightEye[0].y + rightEye[3].y) / 2
  };
  
  // Calculate average eye center
  const eyeCenter = {
    x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
    y: (leftEyeCenter.y + rightEyeCenter.y) / 2
  };
  
  // Calculate face center
  const faceCenter = {
    x: (landmarks[0].x + landmarks[16].x) / 2, // Nose to right jaw
    y: (landmarks[0].y + landmarks[16].y) / 2
  };
  
  // Determine gaze direction
  const xDiff = eyeCenter.x - faceCenter.x;
  const yDiff = eyeCenter.y - faceCenter.y;
  
  let direction = "Center";
  let verticalDirection = "Center";
  
  // Horizontal gaze
  const horizontalThreshold = 15; // pixels
  if (xDiff < -horizontalThreshold) direction = "Left";
  else if (xDiff > horizontalThreshold) direction = "Right";
  
  // Vertical gaze
  const verticalThreshold = 10; // pixels
  if (yDiff < -verticalThreshold) verticalDirection = "Up";
  else if (yDiff > verticalThreshold) verticalDirection = "Down";
  
  return {
    horizontal: direction,        // Left, Center, Right
    vertical: verticalDirection,  // Up, Center, Down
    combined: `${verticalDirection}-${direction}`,
    confidence: calculateConfidence(landmarks)
  };
};
```

### Gaze Data Collection

**Sample Interval:** Every 3-5 seconds during gameplay

**Data Recorded:**
```javascript
{
  sessionId: "session_12345",
  userId: "user_67890",
  videoId: "video_11111",
  gazePoint: { x: 640, y: 360 },  // Screen coordinates
  gazeDirection: "Center-Center",
  isLookingAtScreen: true,
  attentionScore: 85,              // 0-100, higher = more attentive
  timestamp: 1678345600000,
  durationMs: 100,
  confidenceScore: 0.92
}
```

### Attention Score Calculation

```javascript
const calculateAttentionScore = (gazeData) => {
  let score = 100;
  
  // Deduct for not looking at screen
  if (!gazeData.isLookingAtScreen) {
    score -= 30;
  }
  
  // Deduct for peripheral vision (edges)
  const distanceFromCenter = Math.sqrt(
    Math.pow(gazeData.gazePoint.x - screenCenter.x, 2) +
    Math.pow(gazeData.gazePoint.y - screenCenter.y, 2)
  );
  
  if (distanceFromCenter > screenDiagonal * 0.3) {
    score -= 20;
  }
  
  // Confidence-based penalty
  score *= gazeData.confidenceScore;
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
};
```

### Gaze Metrics Stored

```javascript
{
  avgAttentionScore: 82.5,         // Average during session
  gazeStability: {
    x_variance: 15.2,              // Pixel variance in X
    y_variance: 12.8,              // Pixel variance in Y
    stability_index: 78             // 0-100, higher = steadier gaze
  },
  screenFocusPercentage: 92,       // % time looking at screen
  mostFocusedArea: "game_center",  // Where user looked most
  gaze_recording: [{
    timestamp: 1678345605000,
    direction: "Center",
    attentionScore: 85
  }, ...]
}
```

---

## Analytics & Data Storage

### Game Session Data Model

```javascript
// MongoDB Schema
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  gameId: Number,             // 1-6 (game identifier)
  gameName: String,           // e.g., "Emotion Match"
  score: Number,              // Final score
  accuracy: Number,           // 0-100%
  duration: Number,           // Seconds played
  levelReached: Number,       // Max level achieved
  metadata: {                 // Game-specific data
    // Emotion Match
    moves: 25,
    wrongAttempts: 5,
    timePerLevel: [60, 45, 120],
    emotionAccuracy: {
      happy: 95,
      sad: 85,
      angry: 75,
      surprised: 90,
      neutral: 88,
      tired: 80
    },
    
    // Face Mimic
    emotionTimes: [
      { emotion: "happy", time: 3500 },
      { emotion: "surprised", time: 4200 }
    ],
    emotionScores: [...],
    consistency: 92.5,
    
    // Imitation Game
    posesCompleted: 8,
    balanceStability: 87,
    motorControlIndex: 91,
    
    // Sound Scape
    correctIdentifications: 18,
    soundLocalizationAccuracy: 90,
    averageReactionTime: 450    // milliseconds
  },
  playedAt: Date,
  startedAt: Date,
  endedAt: Date,
  therapistNotes: String,     // Optional notes from therapist
  performanceLevel: String    // "Independent", "Emerging", "Needs Support"
}
```

### Progress Tracking Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  weekStartDate: Date,
  games: {
    emotion_match: {
      sessionCount: 5,
      avgScore: 450,
      bestScore: 500,
      improvementTrend: "+8%"   // vs last week
    },
    // ... 5 more games
  },
  totalSessionsWeek: 23,
  weeklyStreak: 5,             // Consecutive days played
  skillDevelopment: {
    emotion_recognition: 85,
    motor_coordination: 88,
    impulse_control: 79,
    /// spatial_awareness: 82
  },
  recommendedGames: [
    "Emotion Match",            // Needs improvement
    "Magic Hands"               // Good progress
  ]
}
```

### Gaze Tracking Data Model

```javascript
{
  _id: ObjectId,
  sessionId: String,
  userId: String,
  videoId: String,
  therapistId: String,
  
  // Tracking metrics
  attentionScore: Number,          // 0-100
  gazePoint: { x: Number, y: Number },
  isLookingAtScreen: Boolean,
  gazeStability: {
    x_variance: Number,
    y_variance: Number,
    stability_index: Number
  },
  screeFocusPercentage: Number,    // 0-100
  
  // Timestamps
  videoTimestamp: Number,          // Seconds into video
  recordedAt: Date,
  
  // Session-level aggregates
  sessionStats: {
    totalDuration: Number,         // Total session time
    avgAttentionScore: Number,
    focusAreas: [
      { area: "game_center", percentage: 65 },
      { area: "game_left", percentage: 20 },
      { area: "game_right", percentage: 15 }
    ]
  }
}
```

### Clinical Assessment Module

```javascript
// Therapist Analysis Data
{
  _id: ObjectId,
  userId: ObjectId,
  periodStart: Date,
  periodEnd: Date,
  
  // Support Level Classification
  supportLevel: "Independent" | "Emerging" | "Needs Support",
  
  // Recommendations
  recommendations: [
    "Continue with Emotion Match to reinforce recognition",
    "Increase difficulty in Imitation Game - motor skills developing well",
    "Practice SoundScape for auditory processing"
  ],
  
  // Detailed Metrics
  skillAreas: {
    emotionRecognition: {
      score: 85,
      trend: "improving",
      comment: "Shows strong accuracy with happy/sad emotions"
    },
    motorCoordination: {
      score: 78,
      trend: "stable",
      comment: "Right-handed dominance observed"
    },
    socialEngagement: {
      score: 82,
      trend: "improving",
      comment: "Increased session frequency indicates interest"
    },
    impulseControl: {
      score: 75,
      trend: "needs_support",
      comment: "Patience in pattern games could improve"
    }
  },
  
  // Parental Summary
  parentalSummary: "Good progress this week! Focus on...",
  nextReviewDate: Date
}
```

---

## Theme System

### Architecture

**State Management:** React Context API with localStorage persistence

**Theme Structure:**
```javascript
const THEMES = {
  light: {
    bgMain: "#FFFFFF",
    bgSidebar: "#F5F5F5",
    bgCard: "#FAFAFA",
    textPrimary: "#2C3E50",
    textSecondary: "#7F8C8D",
    accentColor: "#3498DB",
    borderColor: "#ECF0F1",
    hoverBg: "#E8F4F8"
  },
  dark: {
    bgMain: "#1A1A2E",
    bgSidebar: "#16213E",
    bgCard: "#0F3460",
    textPrimary: "#FFFFFF",
    textSecondary: "#BDC3C7",
    accentColor: "#E94560",
    borderColor: "#435A7A",
    hoverBg: "#16405B"
  },
  // ... 5 more themes
};
```

**Theme Colors Used:**
- **Light:** Minimalist, professional
- **Dark:** Reduced eye strain for extended use
- **Ocean Blue:** Calming, professional
- **Forest Green:** Natural, soothing
- **Sunset Orange:** Energetic, warm
- **Lavender Purple:** Creative, calm
- **High Contrast:** Accessibility-focused

**Context Implementation:**
```javascript
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('neuroplay-theme');
    return saved || 'light';
  });
  
  const colors = THEMES[theme];
  
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('neuroplay-theme', newTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ colors, theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

**CSS Transitions:**
```css
* {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease;
}
```

---

## API Documentation

### Authentication Endpoints

**POST /api/auth/signup**
```
Request:
{
  username: String,
  email: String,
  password: String,       // Min 8 chars, 1 uppercase, 1 number
  userType: "student" | "parent" | "therapist" | "admin",
  childName?: String,     // If parent
  childAge?: Number       // If parent
}

Response (201):
{
  token: JWT,
  user: {
    _id: ObjectId,
    username: String,
    email: String,
    userType: String
  }
}
```

**POST /api/auth/login**
```
Request:
{
  email: String,
  password: String
}

Response (200):
{
  token: JWT,
  user: { ... }
}
```

### Game Analytics Endpoints

**POST /api/analytics/save**
```
Request:
{
  userId: String,
  gameName: String,
  score: Number,
  accuracy: Number,
  duration: Number,
  levelReached: Number,
  metadata: Object
}

Response (201):
{
  sessionId: String,
  message: "Game session saved",
  data: { ... }
}
```

**GET /api/analytics/stats/:userId**
```
Response (200):
{
  totalSessions: Number,
  gameStats: {
    "Emotion Match": {
      sessions: Number,
      avgScore: Number,
      bestScore: Number,
      improvement: String
    },
    // ... other games
  },
  weeklyTrend: [...],
  skillSummary: {...}
}
```

### Gaze Tracking Endpoints

**POST /api/gaze-tracking/save**
```
Request:
{
  sessionId: String,
  userId: String,
  videoId: String,
  gazeData: {
    point: { x, y },
    direction: String,
    attentionScore: Number,
    timestamp: Number
  }
}
```

**GET /api/gaze-tracking/session/:sessionId**
```
Response (200):
{
  sessionId: String,
  userId: String,
  gazeRecordings: [...],
  avgAttentionScore: Number,
  focusAreas: {...}
}
```

### Video Routes

**POST /api/videos/upload**
- Upload game video with metadata
- Supported: WebM, MP4
- Max size: 500MB

**GET /api/videos/:userId**
- Retrieve user's video library
- Pagination support

---

## Database Schema

### Collections

1. **Users**
   - username, email (unique)
   - passwordHash (bcrypt)
   - userType, theme preference
   - createdAt, updatedAt

2. **GameSessions**
   - userId, gameName, score, accuracy
   - duration, levelReached
   - metadata (game-specific)
   - playedAt, therapistNotes

3. **Progress**
   - userId, weekStartDate
   - weeklyStats per game
   - skillMetrics, recommendations

4. **GazeTracking**
   - sessionId, userId, videoId
   - gazePoint, direction, attentionScore
   - recordedAt, sessionStats

5. **Videos**
   - userId, therapistId
   - filePath, metadata
   - uploadedAt, duration

6. **FaceCapture**
   - userId, captureDate
   - emotionData, landmarks
   - imageUrl, metadata

---

## Performance Optimization

### Front-end Optimizations

1. **Model Loading:**
   - Lazy load models on game start
   - Cache in browser IndexedDB
   - Parallel loading of multiple models

2. **Detection Loop Optimization:**
   - Skip frames (process every 3rd frame for less critical games)
   - Reduce canvas resolution for detection
   - Use WebGL backend instead of CPU

3. **Component Optimization:**
   - React.memo for game cards
   - Debounce state updates
   - Virtualization for long lists

4. **Bundle Optimization:**
   - Code splitting per game
   - Tree shaking unused dependencies
   - Minification & compression

### Backend Optimizations

1. **Database:**
   - Indexing on frequently queried fields
   - Aggregation pipelines for statistics
   - Connection pooling

2. **API:**
   - Caching responses (Redis)
   - Compression (gzip)
   - Pagination for large datasets

3. **File Handling:**
   - Asynchronous uploads
   - Thumbnail generation on-the-fly
   - CDN for video delivery

---

## Security Considerations

1. **Authentication:**
   - JWT tokens with 24h expiry
   - Refresh token rotation
   - httpOnly cookies for tokens

2. **Data Protection:**
   - Encryption at rest (MongoDB)
   - HTTPS for all communications
   - Input validation & sanitization

3. **Access Control:**
   - Role-based permissions
   - User can only view own data
   - Therapist can only view assigned students

4. **Sensitive Data:**
   - PII stored separately from gameplay data
   - GDPR compliance
   - Data retention policies

---

## Troubleshooting & Debugging

### Common Issues

**Face Detection Not Working:**
- Check light conditions (>100 lux)
- Ensure face is visible and frontal
- Verify model files in public/models
- Check browser console for errors

**Pose Detection Poor Accuracy:**
- Ensure good lighting on body
- Maintain 1-2m distance from webcam
- Reduce background clutter
- Check camera resolution (720p+ recommended)

**Low Attention Scores in Eye Tracking:**
- Verify face is clearly visible
- Check gaze calibration
- Ensure good lighting
- Test with different webcam

**Slow Game Performance:**
- Reduce detection frequency
- Lower video resolution
- Close other browser tabs
- Check CPU/GPU usage

**Database Connection Errors:**
- Verify MongoDB is running
- Check connection string in .env
- Verify firewall allows port 27017
- Review MongoDB error logs

---

## Future Enhancements

1. **Virtual Reality (VR) Modes**
   - Immersive 3D game environments
   - Full-body tracking

2. **Mobile App**
   - React Native implementation
   - Offline game modes

3. **Advanced Gesture Recognition**
   - Hand shape detection
   - Finger gesture identification

4. **Multiplayer Games**
   - Collaborative challenges
   - Competitive leaderboards

5. **Enhanced Speech Recognition**
   - Real-time speech analysis
   - Pronunciation feedback

6. **Offline Mode**
   - Game caching
   - Sync when online

---

## Conclusion

NeuroPlay represents a comprehensive therapeutic gaming platform combining cutting-edge AI, clinical assessment tools, and engaging game mechanics to support children with autism in their developmental journey. The architecture ensures scalability, accessibility, and clinical-grade data analysis while maintaining an engaging and adaptive user experience.

---

**Document Version:** 1.0  
**Last Updated:** March 9, 2026  
**Author:** NeuroPlay Development Team
