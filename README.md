# NeuroPlay 🧠🎮

**Empowering Autistic Students through Adaptive, Game-Based Learning & Clinical Analytics.**

NeuroPlay is a comprehensive therapeutic gaming platform designed for children with autism spectrum disorder (ASD). It combines engaging gamification with clinical assessment tools, real-time AI tracking, and customizable themes to support speech, motor coordination, emotion recognition, and social development in a supportive, low-pressure environment.

![Status](https://img.shields.io/badge/status-active%20development-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18%2B-blue)
![MongoDB](https://img.shields.io/badge/mongodb-4.0%2B-green)

---

## 🌟 Key Features

### 🎮 Interactive Games (6 Total)

| # | Game | Type | AI Technology | Skills Developed |
|---|------|------|---------------|------------------|
| 1 | **Emotion Match** | Memory Card Game | None | Emotion recognition, memory, empathy |
| 2 | **Reaction Test** | Pattern Recognition | None | Reflexes, focus, impulse control |
| 3 | **Face Mimic** | Facial Expression | face-api.js | Emotional expression, facial muscle control |
| 4 | **Imitation Game** | Body Pose Detection | TensorFlow.js PoseNet | Gross motor coordination, balance |
| 5 | **Sound Scape** | Audio Localization | Web Audio API | Auditory processing, spatial hearing |
| 6 | **Magic Hands** | Hand Tracking | MediaPipe Hands | Fine motor control, hand-eye coordination |

### 🎨 Customizable Theme System
- **7 Professional Color Themes**: Light, Dark, Ocean Blue, Forest Green, Sunset Orange, Lavender Purple, High Contrast
- Persistent theme storage (localStorage)
- Smooth theme transitions with optimized text contrast
- Accessibility-first design

### 📊 Advanced Analytics & Clinical Tools
- Real-time performance tracking
- Session-based detailed scoring
- Game-specific metrics and breakdowns
- Interactive charts (Recharts)
- Clinical feedback generation
- Support level classification

### 👥 Multi-User Support with Role-Based Access

| Role | Access Level | Dashboard |
|------|-------------|-----------|
| **Student** | Streamlined Arcade access, personal progress | UserDashboard |
| **Parent** | Monitor child's progress & achievements | ParentDashboard |
| **Therapist** | Patient Session Vault, detailed clinical review | TherapistDashboard |
| **Admin** | System management & user administration | AdminDashboard |

### 🤖 AI-Powered Features & Privacy
- Real-time face detection & emotion recognition
- Body pose estimation & form analysis
- Eye gaze tracking for engagement metrics
- **Privacy-Preserving Face Blur**: On-device real-time face blurring during clinical video recording, ensuring patient anonymity while preserving body movement and behavioral data.
- Facial expression analysis

### 🌍 Accessibility & Internationalization
- Multi-language support (English & Hindi)
- Voice-guided instructions (AI speech synthesis)
- High contrast theme for visual impairments
- Keyboard navigation support
- Screen reader compatible

### 💾 Full-Stack Architecture
- **Express.js Backend** with MongoDB persistence
- **RESTful API** with JWT authentication
- File upload system for videos & face data
- Comprehensive error handling & validation
- Secure user authentication

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React.js (v18+) | UI framework |
| React Router | Client-side routing |
| React Bootstrap | Component library |
| Framer Motion | Animations |
| Recharts | Data visualization |
| Chart.js | Advanced charts |
| React Icons | Icon library |
| face-api.js | Face detection & recognition |
| @tensorflow-models/pose-detection | Body pose estimation |
| @mediapipe/hands | Hand tracking |
| webgazer.js | Eye gaze tracking |
| Axios | HTTP client |
| Vite | Build tool |
| canvas-confetti | Celebration effects |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB | NoSQL database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt | Password encryption |
| multer | File uploads |
| cors | Cross-origin handling |
| nodemailer | Email notifications |
| dotenv | Environment variables |

### ML/AI Libraries

| Library | Purpose |
|---------|---------|
| face-api.js | Face detection, landmarks, expressions |
| TensorFlow.js | Machine learning in browser |
| @tensorflow-models/pose-detection | Body pose estimation |
| MediaPipe Hands | Hand tracking |
| WebGazer.js | Eye gaze tracking |
| Web Speech API | Speech synthesis |

---

## 📋 Prerequisites

- **Node.js** v14.0.0+ 
- **npm** v6.0.0+ or **yarn**
- **MongoDB** v4.0+ (Local or Atlas)
- **Git** for version control
- Modern web browser with webcam support
- 4GB+ RAM, 2GB+ disk space

---

## 📦 Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/neuroplay.git
cd NeuroPlay
```

### 2️⃣ Install Backend Dependencies
```bash
cd autism-backend
npm install
```

### 3️⃣ Install Frontend Dependencies
```bash
cd ../autism-dashboard
npm install
```

### 4️⃣ Configure Environment Variables

**Backend** - Create `autism-backend/.env`:
```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/neuroplay
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

**Frontend** - Create `autism-dashboard/.env`:
```env
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=NeuroPlay
```

### 5️⃣ Setup MongoDB

**Local Installation:**
```bash
# Windows
net start MongoDB

# Linux
sudo systemctl start mongod

# macOS
brew services start mongodb-community
```

**Or use MongoDB Atlas:**
- Create cluster at https://www.mongodb.com/cloud/atlas
- Update MONGO_URI in `.env`

---

## 🚀 Running the Project

### **Option 1: Single Command (Recommended)**

From the project root:
```bash
npm install
npm run install:all
npm start
# Backend: http://localhost:4000
# Frontend: http://localhost:3000
```

### **Option 2: Separate Terminals**

Terminal 1 - Backend:
```bash
cd autism-backend
npm start
# Runs on http://localhost:4000
```

Terminal 2 - Frontend:
```bash
cd autism-dashboard
npm start
# Runs on http://localhost:3000
```

---

## 📂 Project Structure

```
NeuroPlay/
├── autism-backend/
│   ├── models/
│   │   ├── Child.js           # Child user schema
│   │   ├── FaceCapture.js     # Face data storage
│   │   ├── GameSession.js     # Game session records
│   │   ├── GazeTracking.js    # Eye gaze data
│   │   ├── Progress.js        # User progress
│   │   ├── User.js            # User authentication
│   │   └── Video.js           # Video storage
│   ├── routes/
│   │   ├── analytics.js       # Analytics endpoints
│   │   ├── auth.js            # Authentication
│   │   ├── dashboard.js       # Dashboard data
│   │   ├── faceCaptureRoutes.js
│   │   ├── faceData.js
│   │   ├── therapist.js       # Therapist endpoints
│   │   ├── videoEyeTracking.js
│   │   └── videoRoutes.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── validation.js      # Input validation
│   ├── utils/
│   │   └── videoAnalyzer.js
│   ├── uploads/               # Runtime media (gitignored)
│   ├── scripts/
│   │   └── cleanupFaceData.js
│   ├── server.js              # Main server entry
│   ├── .env.example
│   └── package.json
│
├── autism-dashboard/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FaceCaptureComponent.jsx
│   │   │   ├── FaceDataViewer.jsx
│   │   │   ├── ImitationRobot.jsx
│   │   │   └── ...
│   │   ├── config/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx            # Main app component
│   │   ├── App.css
│   │   ├── index.jsx          # React entry point
│   │   ├── index.css
│   │   ├── AuthContext.jsx    # Authentication context
│   │   ├── ThemeContext.jsx   # Theme management
│   │   ├── UserDashboard.jsx  # Student interface
│   │   ├── ParentDashboard.jsx
│   │   ├── TherapistDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── EmotionMatchGame.jsx
│   │   ├── ReactionTestGame.jsx
│   │   ├── AutisticCameraGame.jsx  # Face Mimic
│   │   ├── ImitationGame.jsx
│   │   ├── SoundScapeGame.jsx
│   │   ├── MagicHandsGame.jsx
│   │   ├── EyeGazeTracker.jsx
│   │   ├── ExpressionQuest.jsx
│   │   ├── SonicSimonGame.jsx
│   │   └── ThemeStyles.css
│   ├── public/
│   │   ├── manifest.json
│   │   ├── robots.txt
│   │   ├── emotions/          # Game emotion assets
│   │   └── models/            # ML model files
│   │       ├── face_expression_model-*
│   │       ├── face_landmark_68_model-*
│   │       └── tiny_face_detector_model-*
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── README.md
├── LICENSE
├── PROJECT_DOCUMENTATION.md   # Detailed documentation
├── THEME_IMPLEMENTATION_GUIDE.md
├── package.json               # Root scripts (npm start runs both apps)
└── .gitignore
```

---

## 📖 Usage Guide

### 🎓 For Students
1. **Sign Up** - Create account or login
2. **Arcade Dashboard** - Immediate access to the therapeutic games library
3. **Select Game** - Choose a game from the Arcade
4. **Play** - Follow voice instructions through the game
5. **Review Results** - See score, feedback, and skill analysis
6. **Track Progress** - Monitor improvements in Progress tab

### 👨‍👩‍👧 For Parents
- **Dashboard** - Monitor child's progress and achievements
- **Game History** - View past game sessions
- **Analytics** - See detailed skill development
- **Reports** - Generate progress reports
- **Child Management** - Link and manage children accounts

### 👨‍⚕️ For Therapists
- **Patient Session Vault** - Direct access to all patient records and video sessions
- **Clinical Assessment** - Access detailed game analytics
- **Skill Tracking** - Monitor specific developmental areas
- **Support Levels** - Classification (Independent/Emerging/Needs Support)
- **Feedback Generation** - Automated clinical insights

### 🔧 For Admins
- **User Management** - Create/manage accounts
- **System Settings** - Configure platform
- **Analytics** - View system-wide statistics
- **User Support** - Manage accounts and issues

---

## 🎨 Theme System

Users can select from 7 themes via sidebar buttons. The system ensures high contrast for all sidebars and text elements.

| Theme | Best For | Colors |
|-------|----------|--------|
| Light | Default, daytime | Gray/Blue |
| Dark | Reduced eye strain | Dark gray/Light blue |
| Ocean Blue | Calming, professional | Blue tones |
| Forest Green | Natural, soothing | Green tones |
| Sunset Orange | Energetic, warm | Orange/Brown |
| Lavender Purple | Creative, calm | Purple tones |
| High Contrast | Visual impairments | Black/White/Yellow |

See [THEME_IMPLEMENTATION_GUIDE.md](./THEME_IMPLEMENTATION_GUIDE.md) for technical details.

---

## 🎮 Game Details

### 1. Emotion Match
- **Type**: Memory card game
- **Skills**: Emotion recognition, memory, empathy
- **Duration**: 5-10 minutes
- **Levels**: 3 difficulty levels (Easy/Medium/Hard)
- **Metrics**: Accuracy, speed, mastered emotions
- **Features**: Framer Motion animations, confetti celebration, voice instructions

### 2. Reaction Test (Sonic Simon)
- **Type**: Pattern recognition (Simon Says style)
- **Skills**: Reflexes, focus, impulse control
- **Duration**: 2-3 minutes
- **Rounds**: Progressive pattern length
- **Metrics**: Reaction time, errors, reflex tier
- **Features**: Sound feedback, combo multiplier, visual patterns

### 3. Face Mimic (AutisticCameraGame)
- **Type**: Real-time facial recognition (AI)
- **Skills**: Emotional expression, facial muscle control
- **Duration**: 5-10 minutes
- **Input**: Webcam
- **Metrics**: Expression range, muscle control, scan count
- **AI**: face-api.js with TensorFlow.js backend
- **Emotions**: Happy, Surprised, Angry, Neutral

### 4. Imitation Game
- **Type**: Body pose detection (AI)
- **Skills**: Gross motor coordination, balance
- **Duration**: 5-15 minutes
- **Input**: Webcam
- **Metrics**: Balance, stability, pose count
- **AI**: TensorFlow.js PoseNet
- **Features**: Real-time pose visualization, form analysis

### 5. Sound Scape
- **Type**: Audio localization
- **Skills**: Auditory processing, pitch recognition
- **Duration**: 5-8 minutes
- **Input**: Speakers/Headphones
- **Metrics**: Audio focus, L/R balance, pitch sense
- **Features**: Spatial audio, directional sounds

### 6. Magic Hands
- **Type**: Hand tracking & bubble popping
- **Skills**: Fine motor control, hand-eye coordination
- **Duration**: 5-10 minutes
- **Input**: Webcam
- **Metrics**: Bubbles popped, accuracy, combo streak
- **AI**: MediaPipe Hands

---

## 🔐 Security Features

- ✅ **Privacy-First Blur**: Real-time face anonymization option
- ✅ JWT token-based authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS protection (whitelisted origins)
- ✅ Input validation & sanitization
- ✅ Secure file upload handling
- ✅ Error handling & logging
- ✅ Protected routes with role-based access

---

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/:userId` | Get user dashboard data |
| GET | `/api/dashboard/children/:parentId` | Get children for parent |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analytics/save` | Save game session |
| GET | `/api/analytics/stats/:userId` | Get user statistics |
| GET | `/api/analytics/progress/:userId` | Get progress over time |

### Face Capture
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/facecapture/upload` | Upload face data |
| GET | `/api/facecapture/:userId` | Get user face data |
| GET | `/api/facecapture/session/:sessionId` | Get specific session |

### Video
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/videos/upload` | Upload video |
| GET | `/api/videos/:userId` | Get user videos |
| DELETE | `/api/videos/:id` | Delete video |

### Eye Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/video-eye-tracking/save` | Save gaze data |
| GET | `/api/video-eye-tracking/:sessionId` | Get gaze data |

### Therapist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/therapist/students` | Get therapist's students |
| GET | `/api/therapist/student/:id` | Get student details |
| POST | `/api/therapist/feedback` | Save feedback |

---

## ️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String (student/parent/therapist/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### GameSession Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  gameType: String,
  score: Number,
  duration: Number,
  metrics: Object,
  createdAt: Date
}
```

### Progress Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  gameType: String,
  level: Number,
  totalScore: Number,
  sessionsCompleted: Number,
  lastPlayed: Date
}
```

### FaceCapture Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: ObjectId,
  expressions: Object,
  timestamp: Date
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB
mongod  # Linux/Mac
net start MongoDB  # Windows
```

### Port Already in Use
```bash
# Find and kill process on port 4000
lsof -i :4000
kill -9 <PID>
```

### Face Detection Not Working
- Check webcam permissions in browser
- Refresh browser page
- Ensure good lighting conditions
- Clear browser cache
- Use Chrome/Edge for best compatibility

### Eye Tracking Not Working
- Allow camera access
- Calibrate eye tracker following on-screen instructions
- Avoid wearing glasses if possible
- Ensure face is visible in camera frame

### Theme Not Saving
- Check localStorage is enabled
- Clear browser data
- Try incognito/private window

### Model Loading Errors
- Ensure ML model files exist in `public/models/`
- Check browser console for specific errors
- Verify internet connection for initial model download

---

## 📈 Performance Considerations

- **Model Loading**: ML models load asynchronously; show loading states
- **Camera Access**: Request permissions early in game flow
- **Database Queries**: Use indexes on userId and createdAt fields
- **File Uploads**: Limit video size to 50MB
- **Theme Switching**: Use CSS transitions for smooth experience

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 Development

### Build for Production
```bash
cd autism-dashboard
npm run build
```

### Run Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

---

## 📚 Documentation

- [Theme Implementation Guide](./THEME_IMPLEMENTATION_GUIDE.md)
- [AI Agent Workflow](./docs/ai-agent-workflow/README.md)
- [Backend API Documentation](./autism-backend/API_DOCS.md)
- [Game Development Guide](./GAME_DEVELOPMENT.md)

---

## 🎯 Roadmap

- [ ] Virtual reality (VR) game modes
- [ ] Mobile app (React Native)
- [ ] Advanced gesture recognition
- [ ] Multiplayer games
- [ ] Enhanced speech recognition
- [ ] Offline mode
- [ ] Advanced therapist reporting

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js/) for face detection
- [TensorFlow.js](https://www.tensorflow.org/js) for ML in browser
- [MediaPipe](https://mediapipe.dev/) for hand and pose tracking
- [WebGazer.js](https://webgazer.cs.brown.edu/) for eye tracking
- [React](https://reactjs.org/) and the React community
- Autism research community for insights
- All contributors and testers

---

## 📞 Support & Contact

- 📧 Email: support@neuroplay.com
- 🐙 GitHub Issues: [Report bugs](https://github.com/yourusername/neuroplay/issues)
- 💬 Discussions: [Ask questions](https://github.com/yourusername/neuroplay/discussions)

---

**Built with ❤️ for children with autism** 🧩🎯

---

*Last Updated: May 7, 2026*
