# NeuroPlay 🧠🎮

**Empowering Autistic Students through Adaptive, Game-Based Learning & Clinical Analytics.**

NeuroPlay is a comprehensive therapeutic gaming platform designed for children with autism spectrum disorder (ASD). It combines engaging gamification with clinical assessment tools, real-time AI tracking, and customizable themes to support speech, motor coordination, emotion recognition, and social development in a supportive, low-pressure environment.

![Status](https://img.shields.io/badge/status-active%20development-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18%2B-blue)

---

## 🌟 Key Features

### 🎮 Interactive Games (6 Total)
- **Emotion Match** - Memory game for emotion recognition and empathy
- **Reaction Test** - Pattern recognition for focus & impulse control  
- **Face Mimic** - AI-powered facial expression recognition via webcam
- **Imitation Game** - Body pose detection for gross motor coordination
- **Sound Scape** - Spatial audio game for auditory localization
- **Magic Hands** - Bubble popping for fine motor control & hand-eye coordination

### 🎨 Customizable Theme System
- **7 Professional Color Themes**: Light, Dark, Ocean Blue, Forest Green, Sunset Orange, Lavender Purple, High Contrast
- Persistent theme storage (localStorage)
- Smooth theme transitions
- Accessibility-first design

### 📊 Advanced Analytics & Clinical Tools
- Real-time performance tracking
- Session-based detailed scoring
- Game-specific metrics and breakdowns
- Interactive charts (Recharts)
- Clinical feedback generation
- Support level classification
- Detailed emotion performance analysis
- Weekly activity dashboards

### 👥 Multi-User Support with Role-Based Access
- **Student Accounts** - Game access & progress tracking
- **Parent Dashboard** - Monitor child's progress & achievements
- **Therapist Dashboard** - Clinical assessment & detailed analytics
- **Admin Dashboard** - System management & user administration

### 🤖 AI-Powered Features
- Real-time face detection & emotion recognition
- Body pose estimation & form analysis
- Eye gaze tracking for engagement metrics
- Facial expression analysis
- Video recording & analysis capabilities

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
- **React.js** (v18+) - UI framework
- **React Router** - Client-side routing
- **React Bootstrap** - Component library
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **React Icons** - Icon library
- **face-api.js** - Face detection & recognition
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password encryption
- **multer** - File uploads
- **cors** - Cross-origin handling

### ML/AI Libraries
- **face-api.js** - Face detection, landmarks, expressions
- **TensorFlow.js** - Machine learning in browser
- **@tensorflow-models/pose-detection** - Body pose estimation
- **Web Speech API** - Speech synthesis
- **MediaRecorder API** - Video recording

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

### **Option 1: Separate Terminals**

Terminal 1 - Backend:
```bash
cd autism-backend
npm start
# Runs on http://localhost:4000
```

Terminal 2 - Frontend:
```bash
cd autism-dashboard
npm run dev
# Runs on http://localhost:5173
```

### **Option 2: Windows Batch Script**
```bash
./start-project.bat
```

### **Option 3: PowerShell Script**
```bash
.\start-project.ps1
```

---

## 📂 Project Structure

```
NeuroPlay/
├── autism-backend/
│   ├── models/              # MongoDB schemas (User, GameSession, Progress, etc.)
│   ├── routes/              # API endpoints (auth, analytics, games, videos)
│   ├── middleware/          # Authentication, validation
│   ├── utils/               # Helper functions
│   ├── uploads/             # User-generated files
│   ├── server.js           # Main server
│   └── package.json
│
├── autism-dashboard/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── UserDashboard.jsx      # Student interface
│   │   ├── ParentDashboard.jsx    # Parent monitoring
│   │   ├── TherapistDashboard.jsx # Clinical tools
│   │   ├── AdminDashboard.jsx     # System management
│   │   ├── [Game Components]      # 6 Game implementations
│   │   ├── ThemeContext.jsx       # Theme management
│   │   ├── AuthContext.jsx        # Auth state
│   │   ├── App.jsx               # Main app
│   │   └── index.jsx             # React entry
│   ├── public/
│   │   ├── models/         # ML model files
│   │   └── emotions/       # Game assets
│   ├── vite.config.js
│   └── package.json
│
├── THEME_IMPLEMENTATION_GUIDE.md
├── README.md
└── .gitignore
```

---

## 📖 Usage Guide

### 🎓 For Students
1. **Sign Up** - Create account or login
2. **Home Dashboard** - View level, points, and recommendations
3. **Select Game** - Go to Arcade and choose a game
4. **Play** - Follow voice instructions through the game
5. **Review Results** - See score, feedback, and skill analysis
6. **Track Progress** - Monitor improvements in Progress tab

### 👨‍👩‍👧 For Parents
- **Dashboard** - Monitor child's progress and achievements
- **Game History** - View past game sessions
- **Analytics** - See detailed skill development
- **Reports** - Generate progress reports

### 👨‍⚕️ For Therapists
- **Clinical Assessment** - Access detailed game analytics
- **Skill Tracking** - Monitor specific developmental areas
- **Support Levels** - Classification (Independent/Emerging/Needs Support)
- **Feedback Generation** - Automated clinical insights
- **Student Management** - Manage multiple students

### 🔧 For Admins
- **User Management** - Create/manage accounts
- **System Settings** - Configure platform
- **Analytics** - View system-wide statistics
- **User Support** - Manage accounts and issues

---

## 🎨 Theme System

Users can select from 7 themes via sidebar buttons:

| Theme | Best For |
|-------|----------|
| Light | Default, daytime |
| Dark | Reduced eye strain |
| Ocean Blue | Calming, professional |
| Forest Green | Natural, soothing |
| Sunset Orange | Energetic, warm |
| Lavender Purple | Creative, calm |
| High Contrast | Visual impairments |

See [THEME_IMPLEMENTATION_GUIDE.md](./THEME_IMPLEMENTATION_GUIDE.md) for technical details.

---

## 🎮 Game Details

### Emotion Match
- **Type**: Memory card game
- **Skills**: Emotion recognition, memory, empathy
- **Duration**: 5-10 minutes
- **Levels**: 3 difficulty levels
- **Metrics**: Accuracy, speed, mastered emotions

### Reaction Test
- **Type**: Pattern recognition
- **Skills**: Reflexes, focus, impulse control
- **Duration**: 2-3 minutes
- **Rounds**: 5 different patterns
- **Metrics**: Reaction time, errors, reflex tier

### Face Mimic
- **Type**: Real-time facial recognition (AI)
- **Skills**: Emotional expression, facial control
- **Duration**: 5-10 minutes
- **Input**: Webcam
- **Metrics**: Expression range, muscle control, scans

### Imitation Game
- **Type**: Body pose detection (AI)
- **Skills**: Gross motor coordination, balance
- **Duration**: 5-15 minutes
- **Input**: Webcam
- **Metrics**: Balance, stability, pose count

### Sound Scape
- **Type**: Audio localization
- **Skills**: Auditory processing, pitch recognition
- **Duration**: 5-8 minutes
- **Input**: Speakers/Headphones
- **Metrics**: Audio focus, L/R balance, pitch sense

### Magic Hands
- **Type**: Hand tracking & bubble popping
- **Skills**: Fine motor control, hand-eye coordination
- **Duration**: 5-10 minutes
- **Input**: Webcam
- **Metrics**: Bubbles popped, accuracy, combo streak

---

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing (bcryptjs)
- ✅ CORS protection
- ✅ Input validation & sanitization
- ✅ Secure file upload handling
- ✅ Error handling & logging
- ✅ Rate limiting (recommended)

---

## 📊 API Endpoints

### Auth
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout

### Analytics
- `POST /api/analytics/save` - Save game session
- `GET /api/analytics/stats/:userId` - Get user stats

### Games
- `POST /api/games/save-session` - Record game play
- `GET /api/games/:userId` - Get game history

### Videos
- `POST /api/videos/upload` - Upload video
- `GET /api/videos/:userId` - Get videos

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
- Check webcam permissions
- Refresh browser
- Ensure good lighting
- Clear browser cache

### Theme Not Saving
- Check localStorage is enabled
- Clear browser data
- Try incognito/private window

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

- **face-api.js** team for face detection
- **TensorFlow.js** for ML capabilities
- **React & Node.js** communities
- Autism research community for insights
- All contributors and testers

---

## 📞 Support & Contact

- 📧 Email: support@neuroplay.com
- 🐙 GitHub Issues: [Report bugs](https://github.com/yourusername/neuroplay/issues)
- 💬 Discussions: [Ask questions](https://github.com/yourusername/neuroplay/discussions)

---

**Made with ❤️ for children with autism and their families.**

*Last Updated: March 8, 2026*
