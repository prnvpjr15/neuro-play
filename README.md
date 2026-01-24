# NeuroPlay 🧠🤖

**Empowering Autistic Students through Adaptive, Game-Based Learning.**

NeuroPlay is a React-based web application designed to provide personalized, engaging, and therapeutic learning experiences for individuals on the autism spectrum. By combining gamified skill-building activities with real-time AI tracking and a supportive voice assistant, NeuroPlay focuses on developing essential cognitive, motor, and social-emotional skills in a low-pressure environment.

-----

## 🌟 Key Features

  * **5 Targeted Skill-Building Games:** A diverse "Arcade" covering different developmental areas.
      * **Emotion Match:** Memory card game for recognizing feelings and building empathy.
      * **Reaction Test:** Pattern recognition game to train focus and impulse control.
      * **Face Mimic (AI):** Uses webcam facial recognition to teach emotion expression and facial muscle control.
      * **Imitation Game (AI):** Uses webcam body-pose detection for gross motor coordination and body awareness.
      * **Sound Scape (Audio):** Spatial audio game for auditory localization and pitch discrimination.
  * **AI-Powered Real-Time Feedback:** Integrates TensorFlow.js models (Face API and Pose Detection) to provide instant, encouraging feedback during webcam-based games.
  * **Bi-Lingual Voice Assistant:** An integrated voice guide providesinstructions and positive reinforcement in both **English** and **Hindi**, making the platform accessible to a wider audience.
  * **Comprehensive Analytics Dashboard:** Tracks progress, visualizes data through charts (Recharts), and provides session-specific clinical feedback and "support level" indicators for therapists and parents.
  * **Adaptive & Engaging Design:** Features a modern, accessible UI with animations, clear visual cues, and a reward system (points, levels, stars) to maintain motivation.

-----

## 🛠️ Tech Stack

  * **Frontend Framework:** [React.js](https://reactjs.org/)
  * **UI/Styling:** [React-Bootstrap](https://react-bootstrap.github.io/) & Custom CSS
  * **Animations:** [Framer Motion](https://www.framer.com/motion/)
  * **Data Visualization:** [Recharts](https://recharts.org/)
  * **AI & Machine Learning:**
      * [@vladmandic/face-api](https://github.com/vladmandic/face-api) (Face Detection & Emotion Recognition)
      * [@tensorflow-models/pose-detection](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection) (Body Pose Estimation)
      * TensorFlow.js Backend WebGL
  * **Audio/Voice:** Web Speech API (Speech Synthesis) & Web Audio API (Spatial Sound)
  * **Hardware Integration:** [react-webcam](https://www.npmjs.com/package/react-webcam)

-----

## ⚙️ Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

  * Node.js (v14.0.0 or later recommended)
  * npm or yarn

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/neuroplay.git
    cd neuroplay
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

### ⚠️ Crucial Step: AI Models Setup

The AI games (Face Mimic and Imitation Game) require pre-trained models to function. These models **must** be placed in the `public/models` directory.

1.  Create a folder named `models` inside the `public` folder of your project structure: `neuroplay/public/models/`.
2.  Download the required weights and manifest files for `face-api` (tinyFaceDetector and faceExpressionNet).
3.  *Note: The Pose Detection model typically downloads automatically on first run, but ensure your network allows fetching from TFHub.*

### Running the Application

Once the dependencies are installed and models are placed:

```bash
npm start
# or
yarn start
```

Runs the app in the development mode. Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to view it in your browser.

-----

## 📖 Usage Guide

1.  **Dashboard Home:** Upon loading, you are greeted by the dashboard showing your current Level and total points.
2.  **Voice Assistant:** Toggle the voice assistant On/Off using the button in the sidebar. Switch between English and Hindi using the language toggle button.
3.  **The Arcade:** Navigate to the "Arcade" tab to browse available games.
4.  **Playing a Game:** Click "Play Now" on a game card. Listen to the introductory voice instructions and complete the game stages.
5.  **Session Review:** After finishing a game, a modal appears with your score, star rating, and clinical feedback.
6.  **Analytics:** Navigate to the "Progress" tab or click the chart icon on a game card to view detailed historical data and specific skill breakdowns (e.g., reaction time graphs, emotion accuracy radar charts).

-----

## 📂 Project Structure (Simplified)

```
neuroplay/
├── public/
│   ├── index.html
│   ├── models/          # MUST contain AI model files
│   └── emotions/        # Images for Face Mimic game
├── src/
│   ├── App.js           # Main application entry
│   ├── UserDashboard.js # Core component: Sidebar, Navigation, Analytics, Internal Games
│   ├── AutisticCameraGame.js # AI Face Mimic Game Component
│   ├── ImitationGame.js      # AI Body Pose Game Component
│   ├── SoundScapeGame.js     # Spatial Audio Game Component
│   └── index.css        # Global styles
├── package.json
└── README.md
```

-----

## 🤝 Acknowledgments

  * Thanks to [Vladimir Mandic](https://github.com/vladmandic) for the maintained fork of `face-api.js`.
  * Thanks to the TensorFlow.js team for the robust `pose-detection` models.
  * Icons provided by [React Icons](https://react-icons.github.io/react-icons/).