import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Card,
  Row,
  Col,
  Badge,
  Button,
  Modal,
  Alert,
  Navbar,
  Nav,
  Container,
  Tab,
  Tabs,
  ProgressBar,
} from "react-bootstrap";
import {
  FaBrain,
  FaChartBar,
  FaTrophy,
  FaLightbulb,
  FaCamera,
  FaStopwatch,
  FaPuzzlePiece,
  FaChild,
  FaUserMd,
  FaStar,
  FaMedal,
  FaRunning,
  FaSmileBeam,
  FaBolt,
  FaFire,
  FaArrowDown,
  FaTheaterMasks,
  FaDumbbell,
  FaBalanceScale,
  FaPlay,
  FaChartPie,
  FaHome,
  FaGamepad,
  FaUserCircle,
  FaCog,
  FaHeadphones,
  FaVolumeUp,
  FaVolumeMute,
  FaRobot,
  FaLanguage,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";

// --- IMPORT SEPARATE GAME FILES ---
import EmotionMatchGame from "./EmotionMatchGame"; // <--- NOW IMPORTED
import AutisticCameraGame from "./AutisticCameraGame";
import ImitationGame from "./ImitationGame";
import SoundScapeGame from "./SoundScapeGame";
import FaceCaptureComponent from "./components/FaceCaptureComponent";
// ----- Constants & Helpers -----
const todayISO = () => new Date().toISOString().slice(0, 10);

const GAME_IDS = {
  EMOTION_MATCH: 1,
  PATTERN_ADVENTURE: 2,
  FACE_MIMIC: 3,
  IMITATION_GAME: 4,
  SOUND_SCAPE: 5,
};

// ----- TRANSLATIONS -----
const TRANSLATIONS = {
  en: {
    app_name: "NeuroPlay",
    student_account: "Student Account",
    voice_on: "Voice Guide On",
    voice_off: "Voice Off",
    home: "Home",
    arcade: "Arcade",
    progress: "Progress",
    profile: "Profile",
    hello: "Hello",
    ready_text: "Ready to learn something new today?",
    level: "Level",
    points: "Points",
    recommended: "Recommended for You",
    continue_playing: "Continue playing",
    play_now: "Play Now",
    analytics: "Analytics",
    games_available: "Games Available",
    overall_progress: "Overall Progress",
    weekly_activity: "Weekly Activity",
    session_review: "Session Review",
    overall_score: "Overall Score",
    clinical_feedback: "Clinical Feedback",
    continue: "Continue",
    restart: "Restart",
    finish: "Finish",
    close: "Close",
    loading: "Detailed graphs loading...",
    select_game_info:
      "Select specific games in Arcade to view detailed breakdown.",

    // Game Names
    game_emotion: "Emotion Match",
    desc_emotion: "Train memory & empathy.",
    game_reaction: "Reaction Test",
    desc_reaction: "Focus & Impulse Control.",
    game_face: "Face Mimic",
    desc_face: "Facial muscle control.",
    game_imitation: "Imitation Game",
    desc_imitation: "Gross motor coordination.",
    game_sound: "Sound Scape",
    desc_sound: "Auditory localization & pitch.",

    // IN-GAME INSTRUCTIONS
    instr_emotion_start:
      "Welcome to Emotion Match. Flip the cards to find matching pairs of emotions.",
    instr_emotion_match: "You found a match! Keep going.",
    instr_reaction_start:
      "Welcome to Reaction Test. Wait for the signal, then click as fast as you can!",
    instr_reaction_round: "Round complete. Get ready for the next one.",
    instr_face_start:
      "Welcome to Face Mimic. Look at the picture and make the same face.",
    instr_face_success: "Good job mimicking that emotion!",
    instr_imitation_start:
      "Welcome to Imitation Game. Stand back and copy the poses on screen.",
    instr_imitation_success: "Pose matched! Get ready for the next one.",
    instr_sound_start:
      "Welcome to Sound Scape. Listen carefully and tell me what you hear.",
    instr_sound_success: "Correct! Listen to the next sound.",

    // Stats Labels
    stat_mastered: "Mastered Emotions",
    stat_focus: "Learning Focus",
    stat_speed: "Avg. Speed",
    stat_tier: "Reflex Tier",
    stat_streak: "Streak",
    stat_false: "False Starts",
    stat_range: "Range",
    stat_muscle: "Best Muscle",
    stat_scans: "Scans",
    stat_balance: "Balance",
    stat_stability: "Stability",
    stat_poses: "Poses",
    stat_audio: "Audio Focus",
    stat_lr: "L/R Balance",
    stat_pitch: "Pitch Sense",
  },
  hi: {
    app_name: "न्यूरोप्ले",
    student_account: "छात्र खाता",
    voice_on: "आवाज़ गाइड चालू",
    voice_off: "आवाज़ बंद",
    home: "होम",
    arcade: "खेल",
    progress: "प्रगति",
    profile: "प्रोफ़ाइल",
    hello: "नमस्ते",
    ready_text: "क्या आप आज कुछ नया सीखने के लिए तैयार हैं?",
    level: "स्तर",
    points: "अंक",
    recommended: "आपके लिए सुझाया गया",
    continue_playing: "खेलना जारी रखें",
    play_now: "अभी खेलें",
    analytics: "विश्लेषण",
    games_available: "खेल उपलब्ध हैं",
    overall_progress: "कुल प्रगति",
    weekly_activity: "साप्ताहिक गतिविधि",
    session_review: "सत्र समीक्षा",
    overall_score: "कुल स्कोर",
    clinical_feedback: "फीडबैक",
    continue: "जारी रखें",
    restart: "पुनः आरंभ",
    finish: "समाप्त",
    close: "बंद करें",
    loading: "ग्राफ़ लोड हो रहे हैं...",
    select_game_info: "विस्तृत जानकारी के लिए आर्केड में गेम चुनें।",

    // Game Names
    game_emotion: "भावना मिलान",
    desc_emotion: "याददाश्त और सहानुभूति का प्रशिक्षण।",
    game_reaction: "प्रतिक्रिया परीक्षण",
    desc_reaction: "ध्यान और आवेग नियंत्रण।",
    game_face: "चेहरा नकल",
    desc_face: "चेहरे की मांसपेशियों का नियंत्रण।",
    game_imitation: "नकल खेल",
    desc_imitation: "शारीरिक समन्वय।",
    game_sound: "ध्वनि दुनिया",
    desc_sound: "श्रवण और पिच की पहचान।",

    // IN-GAME INSTRUCTIONS (Hindi)
    instr_emotion_start:
      "भावना मिलान में आपका स्वागत है। भावनाओं के जोड़े खोजने के लिए कार्ड पलटें।",
    instr_emotion_match: "आपने एक जोड़ा पाया! खेलते रहें।",
    instr_reaction_start:
      "प्रतिक्रिया परीक्षण में स्वागत है। संकेत की प्रतीक्षा करें, फिर जितनी जल्दी हो सके क्लिक करें!",
    instr_reaction_round: "दौर पूरा हुआ। अगले के लिए तैयार हो जाओ।",
    instr_face_start:
      "चेहरा नकल में स्वागत है। तस्वीर देखें और वैसा ही चेहरा बनाएं।",
    instr_face_success: "उस भावना की नकल करने का अच्छा काम!",
    instr_imitation_start:
      "नकल खेल में स्वागत है। पीछे खड़े हो जाएं और स्क्रीन पर मुद्राओं की नकल करें।",
    instr_imitation_success: "मुद्रा मिल गई! अगले के लिए तैयार हो जाओ।",
    instr_sound_start:
      "ध्वनि दुनिया में स्वागत है। ध्यान से सुनें और बताएं कि आप क्या सुनते हैं।",
    instr_sound_success: "सही! अगली आवाज सुनें।",

    // Stats Labels
    stat_mastered: "महारत हासिल",
    stat_focus: "सीखने का ध्यान",
    stat_speed: "औसत गति",
    stat_tier: "रिफ्लेक्स स्तर",
    stat_streak: "लगातार जीत",
    stat_false: "गलत शुरुआत",
    stat_range: "सीमा",
    stat_muscle: "सर्वश्रेष्ठ मांसपेशी",
    stat_scans: "स्कैन",
    stat_balance: "संतुलन",
    stat_stability: "स्थिरता",
    stat_poses: "मुद्राएं",
    stat_audio: "श्रवण ध्यान",
    stat_lr: "बायां/दायां संतुलन",
    stat_pitch: "पिच की समझ",
  },
};

// ----- VOICE ASSISTANT ENGINE -----
const useVoiceAssistant = (language) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(
    (text) => {
      if (isMuted || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices();
      let voice = null;

      if (language === "hi") {
        voice = voices.find(
          (v) => v.lang.includes("hi") || v.name.includes("Hindi"),
        );
      }

      if (!voice) {
        voice = voices.find(
          (v) =>
            v.name.includes("Google US English") ||
            v.name.includes("Zira") ||
            v.lang.includes("en-US"),
        );
      }

      if (voice) utterance.voice = voice;

      utterance.pitch = 1.1;
      utterance.rate = 0.9;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isMuted, language],
  );

  const cancelSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleMute = () => {
    if (!isMuted) cancelSpeech();
    setIsMuted(!isMuted);
  };

  return { speak, cancelSpeech, isMuted, toggleMute, isSpeaking };
};

// ----- DATA GENERATORS -----
const getStaticStats = (gameId, t) => {
  switch (gameId) {
    case GAME_IDS.EMOTION_MATCH:
      return [
        {
          label: t.stat_mastered,
          value: "Happy, Cool",
          icon: <FaSmileBeam size={20} />,
          color: "warning",
        },
        {
          label: t.stat_focus,
          value: "Fear",
          icon: <FaBrain size={20} />,
          color: "info",
        },
        {
          label: t.stat_speed,
          value: "3.2s",
          icon: <FaStopwatch size={20} />,
          color: "success",
        },
      ];
    case GAME_IDS.PATTERN_ADVENTURE:
      return [
        {
          label: t.stat_tier,
          value: "Ninja",
          icon: <FaBolt size={20} />,
          color: "warning",
        },
        {
          label: t.stat_streak,
          value: "12 Rounds",
          icon: <FaFire size={20} />,
          color: "danger",
        },
        {
          label: t.stat_false,
          value: "-15%",
          icon: <FaArrowDown size={20} />,
          color: "success",
        },
      ];
    case GAME_IDS.FACE_MIMIC:
      return [
        {
          label: t.stat_range,
          value: "Wide",
          icon: <FaTheaterMasks size={20} />,
          color: "primary",
        },
        {
          label: t.stat_muscle,
          value: "Cheek",
          icon: <FaDumbbell size={20} />,
          color: "secondary",
        },
        {
          label: t.stat_scans,
          value: "45",
          icon: <FaCamera size={20} />,
          color: "info",
        },
      ];
    case GAME_IDS.IMITATION_GAME:
      return [
        {
          label: t.stat_balance,
          value: "Left Dom.",
          icon: <FaBalanceScale size={20} />,
          color: "success",
        },
        {
          label: t.stat_stability,
          value: "88%",
          icon: <FaRunning size={20} />,
          color: "warning",
        },
        {
          label: t.stat_poses,
          value: "120",
          icon: <FaMedal size={20} />,
          color: "primary",
        },
      ];
    case GAME_IDS.SOUND_SCAPE:
      return [
        {
          label: t.stat_audio,
          value: "High",
          icon: <FaHeadphones size={20} />,
          color: "primary",
        },
        {
          label: t.stat_lr,
          value: "Perfect",
          icon: <FaBalanceScale size={20} />,
          color: "success",
        },
        {
          label: t.stat_pitch,
          value: "Good",
          icon: <FaVolumeUp size={20} />,
          color: "warning",
        },
      ];
    default:
      return [];
  }
};

const generateHistoricalData = (baseScore, variance) => {
  const data = [];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  days.forEach((day) => {
    data.push({
      day,
      score: Math.max(
        0,
        Math.round(baseScore + (Math.random() * variance - variance / 2)),
      ),
    });
  });
  return data;
};

// ----- ANALYTICS DATA FOR CHARTS -----
const generateEmotionSpecifics = () => [
  { name: "Happy", accuracy: 95 },
  { name: "Sad", accuracy: 60 },
  { name: "Angry", accuracy: 45 },
  { name: "Surprised", accuracy: 85 },
  { name: "Fear", accuracy: 50 },
];
const generateFatigueData = () => [
  { click: 1, reactionTime: 400 },
  { click: 5, reactionTime: 380 },
  { click: 10, reactionTime: 420 },
  { click: 15, reactionTime: 600 },
  { click: 20, reactionTime: 850 },
];
const generateExpressionData = () => [
  { name: "Mouth", score: 90, fullMark: 100 },
  { name: "Eyes", score: 65, fullMark: 100 },
  { name: "Brows", score: 50, fullMark: 100 },
  { name: "Jaw", score: 95, fullMark: 100 },
];
const generateBodySideData = () => [
  { name: "Left Side", score: 85, fill: "#4e73df" },
  { name: "Right Side", score: 60, fill: "#e74a3b" },
  { name: "Midline", score: 90, fill: "#36b9cc" },
];
const generateAudioData = () => [
  { name: "Left Ear", score: 95 },
  { name: "Right Ear", score: 80 },
  { name: "Pitch", score: 70 },
];

// ----- MODALS & COMPONENTS -----

const SessionReviewModal = ({ data, onClose, speak, t }) => {
  useEffect(() => {
    if (data && speak) {
      const intro =
        t.hello === "नमस्ते"
          ? `${data.gameName} पूरा करने के लिए बधाई!`
          : `Great job finishing ${data.gameName}!`;
      const scoreRead =
        t.hello === "नमस्ते"
          ? `आपका स्कोर ${Math.round(data.score)} है।`
          : `You scored ${Math.round(data.score)} points.`;
      speak(`${intro} ${scoreRead}`);
    }
  }, [data, speak, t]);

  if (!data) return null;
  const {
    gameName,
    score,
    feedback,
    metricLabel,
    metricValue,
    supportLevel,
    radarData,
    traits,
    emotionPerformance,
    struggleOrder,
    averageTime,
  } = data;

  const stars = [];
  for (let i = 0; i < 3; i++) {
    stars.push(
      <FaStar
        key={i}
        size={32}
        color={i < score / 33 ? "#ffc107" : "#e4e5e9"}
        className="mx-1 drop-shadow"
      />,
    );
  }
  const supportColor =
    supportLevel === "Independent"
      ? "success"
      : supportLevel === "Emerging"
        ? "warning"
        : "danger";

  return (
    <Modal
      show={true}
      onHide={onClose}
      centered
      backdrop="static"
      size="lg"
      contentClassName="rounded-4 border-0 overflow-hidden"
    >
      <Modal.Body className="p-0 bg-white">
        <div
          className={`bg-${supportColor} bg-opacity-10 p-4 text-center border-bottom`}
        >
          <Badge
            bg="white"
            text="dark"
            className="mb-2 px-3 py-2 shadow-sm border"
          >
            {gameName}
          </Badge>
          <h2 className="fw-bold mb-0 text-dark">{t.session_review}</h2>
        </div>
        <div className="p-4">
          <Row className="align-items-center">
            <Col md={5} className="text-center border-end">
              <div className="mb-3">{stars}</div>
              <div className="display-3 fw-bold text-primary lh-1 mb-2">
                {Math.round(score)}
              </div>
              <p className="text-muted text-uppercase small fw-bold mb-4">
                {t.overall_score}
              </p>
              <div className="bg-light p-3 rounded-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-bold text-muted">
                    Support Level
                  </span>
                  <Badge bg={supportColor}>{supportLevel}</Badge>
                </div>
                <ProgressBar
                  now={score}
                  variant={supportColor}
                  style={{ height: "6px" }}
                />
              </div>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {traits &&
                  traits.map((trait, i) => (
                    <Badge
                      key={i}
                      bg="secondary"
                      className="fw-normal px-2 py-1"
                    >
                      {trait}
                    </Badge>
                  ))}
              </div>

              {/* Struggle Analysis Section */}
              {struggleOrder && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <h6 className="fw-bold text-secondary mb-2">
                    Emotion Difficulty Order
                  </h6>
                  <div className="d-flex flex-wrap justify-content-center align-items-center mb-2">
                    {struggleOrder.split(" → ").map((emotion, index, arr) => (
                      <React.Fragment key={index}>
                        <Badge
                          bg={
                            index === 0
                              ? "danger"
                              : index === arr.length - 1
                                ? "success"
                                : "warning"
                          }
                          className="px-3 py-2 m-1 text-capitalize"
                        >
                          {emotion}
                        </Badge>
                        {index < arr.length - 1 && (
                          <span className="mx-1 text-muted">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <small className="text-muted d-block">
                    Most challenging → Easiest
                  </small>
                </div>
              )}
            </Col>
            <Col md={7} className="ps-md-4">
              <h6 className="fw-bold text-secondary mb-3">Skill Dimensions</h6>
              <div style={{ height: 200, width: "100%" }}>
                <ResponsiveContainer>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    data={radarData}
                  >
                    <PolarGrid />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 10, fontWeight: "bold" }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Session"
                      dataKey="A"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.5}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Emotion Performance */}
              {emotionPerformance && emotionPerformance.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-bold text-secondary mb-3">
                    Emotion Performance Details
                  </h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>Emotion</th>
                          <th className="text-end">Time Taken</th>
                          <th className="text-end">Difficulty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emotionPerformance.map((emotion, index) => (
                          <tr key={index}>
                            <td className="text-capitalize fw-medium">
                              {emotion.emotion}
                            </td>
                            <td className="text-end">
                              {Math.round(emotion.timeTaken / 1000)} seconds
                            </td>
                            <td className="text-end">
                              {index === 0 ? (
                                <Badge bg="danger">Most Challenging</Badge>
                              ) : index === emotionPerformance.length - 1 ? (
                                <Badge bg="success">Easiest</Badge>
                              ) : (
                                <Badge bg="warning">Medium</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {averageTime && (
                    <div className="mt-2 text-center">
                      <small className="text-muted">
                        Average time per emotion:{" "}
                        <strong>{averageTime}s</strong>
                      </small>
                    </div>
                  )}
                </div>
              )}

              <Alert
                variant="light"
                className="mt-3 border bg-light-blue rounded-3"
              >
                <div className="d-flex">
                  <FaUserMd className="text-primary mt-1 me-3 fs-4" />
                  <div>
                    <h6 className="fw-bold text-dark mb-1">
                      {t.clinical_feedback}
                    </h6>
                    <p className="mb-0 small text-secondary lh-sm">
                      {feedback}
                    </p>
                  </div>
                </div>
              </Alert>
            </Col>
          </Row>
        </div>
        <div className="p-3 bg-light text-center border-top">
          <Button
            size="lg"
            variant="dark"
            className="px-5 rounded-pill shadow-sm"
            onClick={onClose}
          >
            {t.continue}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const AnalyticsDashboard = ({ game, onClose, t }) => {
  const historyData = generateHistoricalData(game.averageScore || 100, 50);
  const staticStats = getStaticStats(game.id, t);
  const emotionData = generateEmotionSpecifics();
  const fatigueData = generateFatigueData();
  const muscleData = generateExpressionData();
  const bodySideData = generateBodySideData();
  const audioData = generateAudioData();

  const renderSpecificChart = () => {
    switch (game.id) {
      case GAME_IDS.EMOTION_MATCH:
        return (
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={emotionData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#eee"
                />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "#f5f7fa" }}
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="accuracy"
                  name="Recognition %"
                  fill="#4e73df"
                  radius={[0, 10, 10, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case GAME_IDS.PATTERN_ADVENTURE:
        return (
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <LineChart data={fatigueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eee"
                />
                <XAxis
                  dataKey="click"
                  label={{
                    value: "Clicks",
                    position: "insideBottom",
                    offset: -5,
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none" }}
                />
                <Line
                  type="monotone"
                  dataKey="reactionTime"
                  stroke="#f6c23e"
                  strokeWidth={4}
                  dot={{
                    r: 4,
                    fill: "#f6c23e",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case GAME_IDS.FACE_MIMIC:
        return (
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={muscleData}>
                <PolarGrid stroke="#eee" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fontWeight: 700, fill: "#555" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke="transparent"
                />
                <Radar
                  name="Control %"
                  dataKey="score"
                  stroke="#1cc88a"
                  fill="#1cc88a"
                  fillOpacity={0.4}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );
      case GAME_IDS.IMITATION_GAME:
        return (
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={bodySideData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eee"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none" }}
                />
                <Bar
                  dataKey="score"
                  name="Accuracy %"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case GAME_IDS.SOUND_SCAPE:
        return (
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={audioData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eee"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none" }}
                />
                <Bar
                  dataKey="score"
                  name="Accuracy %"
                  fill="#0dcaf0"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      size="xl"
      centered
      contentClassName="border-0 rounded-4 overflow-hidden"
    >
      <Modal.Header closeButton className="bg-white border-0 p-4">
        <Modal.Title className="d-flex align-items-center">
          <div
            className="p-3 rounded-circle me-3 shadow-sm"
            style={{ backgroundColor: `${game.color}20` }}
          >
            <span style={{ fontSize: "1.5rem", color: game.color }}>
              {game.icon}
            </span>
          </div>
          <div>
            <h3 className="mb-0 fw-bold text-dark">
              {game.name} {t.analytics}
            </h3>
            <small className="text-muted">{t.session_review}</small>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 bg-light">
        <Row className="g-4 mb-4">
          {staticStats.map((stat, index) => (
            <Col md={4} key={index}>
              <Card className="h-100 border-0 shadow-sm rounded-4">
                <Card.Body className="d-flex align-items-center p-3">
                  <div
                    className={`p-2 rounded-3 me-3 bg-${stat.color} bg-opacity-10 text-${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div
                      className="text-muted x-small fw-bold"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {stat.label}
                    </div>
                    <div className="h5 mb-0 fw-bold">{stat.value}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Card className="border-0 shadow-sm rounded-4 p-3 mb-4">
          <Card.Body>
            <h5 className="fw-bold text-dark mb-4">
              {t.session_review} Breakdown
            </h5>
            {renderSpecificChart()}
          </Card.Body>
        </Card>
        <Card className="border-0 shadow-sm rounded-4 p-3">
          <Card.Body>
            <h5 className="fw-bold text-dark mb-4">{t.weekly_activity}</h5>
            <div style={{ height: 250, width: "100%" }}>
              <ResponsiveContainer>
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={game.color}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={game.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eee"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={game.color}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

// ----- INTERNAL GAMES -----
// Emotion Match is now imported.
// Pattern Clicker is kept internal for simplicity as it wasn't requested to change.
const PatternClickerGame = ({ onComplete, onClose, t, speak }) => {
  const [status, setStatus] = useState("idle");
  const [round, setRound] = useState(1);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [message, setMessage] = useState("Press Start");
  const [errors, setErrors] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    speak(t.instr_reaction_start);
  }, []);

  const ROUNDS = [
    {
      id: 1,
      type: "color",
      ready: "Wait for GREEN",
      go: "CLICK!",
      readyColor: "#dc3545",
      goColor: "#28a745",
      readyContent: "",
      goContent: "",
    },
    {
      id: 2,
      type: "shape",
      ready: "Wait for STAR",
      go: "CLICK!",
      readyColor: "#6c757d",
      goColor: "#ffc107",
      readyContent: "●",
      goContent: "★",
    },
    {
      id: 3,
      type: "math",
      ready: "Wait for 7",
      go: "CLICK!",
      readyColor: "#007bff",
      goColor: "#17a2b8",
      readyContent: "3",
      goContent: "7",
    },
    {
      id: 4,
      type: "word",
      ready: "Reading...",
      go: "GO!",
      readyColor: "#343a40",
      goColor: "#fd7e14",
      readyContent: "STOP",
      goContent: "GO!",
    },
    {
      id: 5,
      type: "icon",
      ready: "Wait for ROCKET",
      go: "CLICK!",
      readyColor: "#6610f2",
      goColor: "#e83e8c",
      readyContent: "🛑",
      goContent: "🚀",
    },
  ];

  const currentRoundConfig = ROUNDS[round - 1] || ROUNDS[0];

  const startRound = () => {
    setStatus("waiting");
    setMessage(currentRoundConfig.ready);
    const delay = Math.floor(Math.random() * 2000) + 2000;
    setTimeout(() => {
      setStatus("ready");
      setMessage(currentRoundConfig.go);
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (status === "waiting") {
      setMessage("Too early! +1 Error");
      setErrors((e) => e + 1);
      speak("Too early!");
    } else if (status === "ready") {
      const time = Date.now() - startTime;
      const newTimes = [...reactionTimes, time];
      setReactionTimes(newTimes);
      setStatus("clicked");
      setMessage(`Reaction: ${time}ms`);

      const phrases = ["Fast!", "Quick!", "Nice speed!"];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      speak(randomPhrase);

      setTimeout(() => {
        if (round < 5) {
          setRound((r) => r + 1);
          setStatus("idle");
          setMessage("Next Round Ready?");
        } else {
          setStatus("finished");
          setGameCompleted(true);
        }
      }, 1500);
    }
  };

  const calculateFinalScore = () => {
    console.log("🔢 Calculating final score...");
    console.log("⏱️ Reaction times:", reactionTimes);
    console.log("❌ Errors:", errors);

    if (reactionTimes.length === 0) {
      console.log("⚠️ No reaction times recorded!");
      return {
        score: 50,
        avgReactionTime: 0,
      };
    }

    const avgReactionTime =
      reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
    console.log("⏱️ Average reaction time:", avgReactionTime);

    // Calculate score: faster = higher score
    // Base: 1000ms = 0 points, 100ms = 100 points
    let score = Math.max(0, Math.min(100, (1000 - avgReactionTime) / 9));

    // Penalty for errors
    const errorPenalty = errors * 15;
    score = Math.max(0, score - errorPenalty);

    // Bonus for completing all rounds
    if (reactionTimes.length >= 5) {
      score += 20;
    }

    // Ensure score is between 0-100
    score = Math.min(100, Math.max(30, score));

    console.log("🏆 Final calculated score:", Math.round(score));

    return {
      score: Math.round(score),
      avgReactionTime: Math.round(avgReactionTime),
    };
  };

  const handleGameComplete = () => {
    const { score, avgReactionTime } = calculateFinalScore();

    console.log("🎮 Sending game completion data:");
    console.log("📊 Score:", score);
    console.log("⏱️ Times:", reactionTimes);
    console.log("❌ Errors:", errors);

    onComplete({
      times: reactionTimes,
      errors: errors,
      score: score,
      reactionTime: avgReactionTime,
      totalRounds: reactionTimes.length,
    });
  };

  const getBoxStyle = () => {
    const base = {
      width: "250px",
      height: "250px",
      margin: "0 auto",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "2rem",
      fontWeight: "bold",
      color: "white",
      boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
      cursor: "pointer",
      transition: "all 0.2s",
    };
    if (status === "waiting")
      return { ...base, backgroundColor: currentRoundConfig.readyColor };
    if (status === "ready")
      return {
        ...base,
        backgroundColor: currentRoundConfig.goColor,
        transform: "scale(1.1)",
      };
    return {
      ...base,
      backgroundColor: "#e2e8f0",
      color: "#aaa",
      cursor: "default",
    };
  };

  return (
    <div className="text-center p-5">
      <h3 className="mb-4 fw-bold text-dark">{t.game_reaction}</h3>
      <div className="d-flex justify-content-between mb-4 px-5">
        <Badge bg="secondary">Round {round}/5</Badge>
        <Badge bg="danger">Errors: {errors}</Badge>
      </div>

      {status === "finished" ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="display-1 mb-3">🏁</div>
          <h4 className="mb-4">Challenge Complete!</h4>
          <div className="mb-4">
            <p className="text-muted">
              Average Reaction Time:{" "}
              {reactionTimes.length > 0
                ? `${Math.round(
                    reactionTimes.reduce((a, b) => a + b, 0) /
                      reactionTimes.length,
                  )}ms`
                : "N/A"}
            </p>
            <p className="text-muted">Total Errors: {errors}</p>
          </div>
          <Button
            size="lg"
            variant="primary"
            className="rounded-pill px-5"
            onClick={handleGameComplete}
          >
            See Results
          </Button>
        </motion.div>
      ) : (
        <div className="py-4">
          <div
            onClick={
              status !== "idle" && status !== "clicked" ? handleClick : null
            }
            style={getBoxStyle()}
          >
            {status === "idle" || status === "clicked" ? (
              <Button
                variant="dark"
                size="lg"
                className="rounded-pill px-4"
                onClick={startRound}
                disabled={status === "clicked"}
              >
                {status === "clicked" ? "Next..." : "Start"}
              </Button>
            ) : (
              <span>
                {status === "ready"
                  ? currentRoundConfig.goContent || "CLICK!"
                  : currentRoundConfig.readyContent || "WAIT"}
              </span>
            )}
          </div>
          <h4 className="mt-4 text-secondary">{message}</h4>
        </div>
      )}
    </div>
  );
};

// ----- MAIN DASHBOARD -----

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState("en");
  const t = TRANSLATIONS[language];

  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [faceCaptureStats, setFaceCaptureStats] = useState({
    totalCaptures: 0,
    lastCapture: null,
  });

  const handleFaceCapture = (captureData) => {
    console.log("Face captured:", captureData);
    setFaceCaptureStats((prev) => ({
      totalCaptures: prev.totalCaptures + 1,
      lastCapture: new Date(),
    }));

    // Optionally show notification
    speak(
      `Face captured. Emotion detected: ${captureData.emotion || "unknown"}`,
    );
  };

  const { speak, isMuted, toggleMute, isSpeaking } =
    useVoiceAssistant(language);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    speak(
      newLang === "hi"
        ? "Hindi Bhasha Chuni Gayi"
        : "English Language Selected",
    );
  };

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const storedUserInfo = localStorage.getItem("userInfo");
      const storedUser = localStorage.getItem("user");

      let parsedUser = storedUserInfo
        ? JSON.parse(storedUserInfo)
        : storedUser
          ? JSON.parse(storedUser)
          : null;

      if (parsedUser) {
        // Ensure we have both id and _id fields
        const user = {
          name: "Explorer",
          totalPoints: 1250,
          level: 5,
          ...parsedUser,
        };

        // Ensure both id fields are present
        if (user.id && !user._id) {
          user._id = user.id;
        } else if (user._id && !user.id) {
          user.id = user._id;
        }

        // Ensure name field exists (use username if available)
        if (!user.name && user.username) {
          user.name = user.username;
        }

        return user;
      }

      return {
        name: "Explorer",
        totalPoints: 1250,
        level: 5,
        id: null,
        _id: null,
      };
    } catch (e) {
      return {
        name: "Explorer",
        totalPoints: 1250,
        level: 5,
        id: null,
        _id: null,
      };
    }
  });

  const [reviewData, setReviewData] = useState(null);
  const [selectedAnalyticsGame, setSelectedAnalyticsGame] = useState(null);
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showImitationModal, setShowImitationModal] = useState(false);
  const [showSoundScapeModal, setShowSoundScapeModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  const GAME_META = {
    [GAME_IDS.EMOTION_MATCH]: {
      nameKey: "game_emotion",
      descKey: "desc_emotion",
      icon: <FaPuzzlePiece />,
      color: "purple",
      hex: "#805ad5",
    },
    [GAME_IDS.PATTERN_ADVENTURE]: {
      nameKey: "game_reaction",
      descKey: "desc_reaction",
      icon: <FaStopwatch />,
      color: "warning",
      hex: "#d69e2e",
    },
    [GAME_IDS.FACE_MIMIC]: {
      nameKey: "game_face",
      descKey: "desc_face",
      icon: <FaCamera />,
      color: "success",
      hex: "#38a169",
    },
    [GAME_IDS.IMITATION_GAME]: {
      nameKey: "game_imitation",
      descKey: "desc_imitation",
      icon: <FaChild />,
      color: "danger",
      hex: "#e53e3e",
    },
    [GAME_IDS.SOUND_SCAPE]: {
      nameKey: "game_sound",
      descKey: "desc_sound",
      icon: <FaHeadphones />,
      color: "info",
      hex: "#0dcaf0",
    },
  };

  const [gameStats, setGameStats] = useState({
    [GAME_IDS.EMOTION_MATCH]: { totalPlays: 0, highScore: 0 },
    [GAME_IDS.PATTERN_ADVENTURE]: { totalPlays: 0, highScore: 0 },
    [GAME_IDS.FACE_MIMIC]: { totalPlays: 0, highScore: 0 },
    [GAME_IDS.IMITATION_GAME]: { totalPlays: 0, highScore: 0 },
    [GAME_IDS.SOUND_SCAPE]: { totalPlays: 0, highScore: 0 },
  });

  // First, let's add more debugging to see EXACTLY what the SoundScape game returns
  const processGameResult = async (gameId, rawData) => {
    console.log("🎮 Game completed - Starting processGameResult");
    console.log("👤 User Profile at start:", userProfile);
    console.log("📋 Game ID:", gameId);
    console.log("📦 Raw Data received:", rawData);
    console.log("📦 Raw Data type:", typeof rawData);

    // Get user ID from either 'id' or '_id' field
    const userId = userProfile?._id || userProfile?.id;
    console.log("👤 User ID found:", userId);

    let score = 0;
    let feedback = "";
    let metricLabel = "";
    let metricValue = "";
    let supportLevel = "Emerging";
    let traits = [];
    let radarData = [];
    let gameName = t[GAME_META[gameId]?.nameKey] || "Game";
    let reviewExtraData = null;

    // --- SCORING LOGIC ---
    console.log(`🎯 Processing game ${gameId}: ${gameName}`);

    if (gameId === GAME_IDS.EMOTION_MATCH) {
      console.log("🎮 Emotion Match data:", rawData);
      const { level = 1, accuracy = 0 } = rawData;
      score = level * 25 + accuracy * 0.25;
      if (score > 100) score = 100;

      metricLabel = "Level";
      metricValue = `${level} / 3`;

      if (score > 85) {
        supportLevel = "Independent";
        feedback = "Excellent memory and focus sustained through levels.";
        traits = ["Methodical", "Focused"];
      } else if (score > 60) {
        supportLevel = "Emerging";
        feedback = "Good effort. Accuracy improved in later stages.";
        traits = ["Steady"];
      } else {
        supportLevel = "Needs Support";
        feedback = "Keep practicing level 1 to build confidence.";
        traits = ["Explorer"];
      }

      radarData = [
        { subject: "Memory", A: score, fullMark: 100 },
        { subject: "Focus", A: Math.min(100, score + 10), fullMark: 100 },
        { subject: "Speed", A: 60, fullMark: 100 },
        { subject: "Visual", A: 90, fullMark: 100 },
        { subject: "Inhibition", A: score, fullMark: 100 },
      ];
    } else if (gameId === GAME_IDS.PATTERN_ADVENTURE) {
      console.log("🎮 Pattern Adventure data:", rawData);

      // Direct score from game
      score = rawData.score || 0;

      // If no score was provided, calculate one
      if (score === 0) {
        const times = rawData.times || rawData.reactionTimes || [];
        const errors = rawData.errors || rawData.errorCount || 0;

        if (times.length > 0) {
          const avgReactionTime =
            times.reduce((a, b) => a + b, 0) / times.length;
          score = Math.max(0, Math.min(100, (1000 - avgReactionTime) / 9));
          score = Math.max(0, score - errors * 15);
          if (times.length >= 5) score += 20;
          score = Math.min(100, Math.max(30, score));
        } else {
          score = 50; // Default score
        }
      }

      metricLabel = "Reaction Time";
      metricValue =
        rawData.times && rawData.times.length > 0
          ? `${Math.round(rawData.times.reduce((a, b) => a + b, 0) / rawData.times.length)}ms`
          : "Good";

      if (score > 85) {
        supportLevel = "Independent";
        feedback = "Excellent impulse control and quick reflexes!";
        traits = ["Alert", "Responsive"];
      } else if (score > 60) {
        supportLevel = "Emerging";
        feedback = "Good response time. Practice waiting for cues.";
        traits = ["Developing"];
      } else {
        supportLevel = "Needs Support";
        feedback = "Work on waiting for the signal before clicking.";
        traits = ["Learning"];
      }

      radarData = [
        { subject: "Reflex", A: score, fullMark: 100 },
        {
          subject: "Control",
          A: Math.max(0, 100 - (rawData.errors || 0) * 15),
          fullMark: 100,
        },
        { subject: "Focus", A: Math.min(100, score + 20), fullMark: 100 },
        { subject: "Timing", A: score, fullMark: 100 },
        {
          subject: "Impulse",
          A: Math.max(0, 100 - (rawData.errors || 0) * 20),
          fullMark: 100,
        },
      ];
    } else if (gameId === GAME_IDS.FACE_MIMIC) {
      console.log("🎮 Face Mimic data:", rawData);

      // Get the emotion data
      const emotionData = rawData.emotionData || [];
      const struggleOrder = rawData.struggleOrder || "";
      const timeData = rawData.timeData || {};

      // Calculate score based on time (faster = better)
      score = 0;
      if (emotionData.length > 0) {
        // Base score: 100% for completing all emotions
        let baseScore = 100;

        // Bonus for faster completion (max 20 points)
        const totalTime = timeData.totalTime || 0;
        const maxExpectedTime = 60000; // 1 minute total is expected
        const timeBonus = Math.max(0, 20 * (1 - totalTime / maxExpectedTime));

        // Bonus for consistency (max 15 points)
        const times = emotionData.map((e) => e.timeTaken);
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const stdDev = Math.sqrt(
          times.reduce((sq, n) => sq + Math.pow(n - avgTime, 2), 0) /
            times.length,
        );
        const consistencyBonus = Math.max(0, 15 * (1 - stdDev / avgTime));

        // Penalty for very slow emotions (max -30 points)
        let timePenalty = 0;
        const slowThreshold = 30000; // 30 seconds per emotion is too slow
        emotionData.forEach((emotion) => {
          if (emotion.timeTaken > slowThreshold) {
            timePenalty +=
              (10 * (emotion.timeTaken - slowThreshold)) / slowThreshold;
          }
        });
        timePenalty = Math.min(30, timePenalty);

        score = baseScore + timeBonus + consistencyBonus - timePenalty;
        score = Math.min(100, Math.max(30, score));
      } else {
        // Fallback calculation
        const gameScore = rawData.points || rawData.score || 0;
        const attempts = rawData.attempts || 4;
        const maxPossibleScore = attempts * 100;
        score = (gameScore / maxPossibleScore) * 100;
        score = Math.min(100, Math.max(30, score));
      }

      console.log(`🎮 Final Face Mimic score: ${score}`);

      // Prepare struggle analysis for feedback
      let struggleAnalysis = "";
      if (timeData.sortedEmotions && timeData.sortedEmotions.length > 0) {
        const fastest =
          timeData.sortedEmotions[timeData.sortedEmotions.length - 1];
        const slowest = timeData.sortedEmotions[0];

        struggleAnalysis = `You mastered ${fastest.emotion} the fastest (${Math.round(fastest.timeTaken / 1000)}s) and found ${slowest.emotion} most challenging (${Math.round(slowest.timeTaken / 1000)}s).`;
      }

      metricLabel = "Time Analysis";
      metricValue = struggleOrder || "All completed";

      if (score > 85) {
        supportLevel = "Independent";
        feedback = `Excellent facial expression mimicry! ${struggleAnalysis}`;
        traits = ["Expressive", "Quick Learner", "Observant"];
      } else if (score > 60) {
        supportLevel = "Emerging";
        feedback = `Good effort! ${struggleAnalysis} Keep practicing to improve your speed.`;
        traits = ["Developing", "Focused"];
      } else {
        supportLevel = "Needs Support";
        feedback = `You completed all emotions! ${struggleAnalysis} Try slowing down and focusing on one expression at a time.`;
        traits = ["Persistent", "Learning"];
      }

      // Create radar data based on time performance
      const emotionTimes = emotionData.map((e) => e.timeTaken);
      const avgTime =
        emotionTimes.reduce((a, b) => a + b, 0) / emotionTimes.length;
      const maxTime = Math.max(...emotionTimes);
      const minTime = Math.min(...emotionTimes);

      radarData = [
        {
          subject: "Speed",
          A: Math.max(0, 100 - (avgTime / 30000) * 100),
          fullMark: 100,
        },
        {
          subject: "Consistency",
          A: Math.max(0, 100 - ((maxTime - minTime) / 20000) * 100),
          fullMark: 100,
        },
        { subject: "Control", A: score, fullMark: 100 },
        { subject: "Recognition", A: Math.min(100, score + 10), fullMark: 100 },
        { subject: "Confidence", A: Math.min(100, score - 15), fullMark: 100 },
      ];

      // Store extra data for review modal
      reviewExtraData = {
        emotionPerformance: timeData.sortedEmotions || [],
        struggleOrder: struggleOrder,
        averageTime: timeData.averageTime
          ? Math.round(timeData.averageTime / 1000)
          : 0,
      };

      // ... rest of existing code for saving to database ...

    } else if (gameId === GAME_IDS.IMITATION_GAME) {
      console.log("🎮 Imitation Game data:", rawData);
      // Try multiple ways to get data
      const posesMatched = rawData.posesMatched || rawData.matchedPoses || 3;
      const totalPoses = rawData.totalPoses || rawData.totalAttempts || 5;
      const accuracy = rawData.accuracy || rawData.matchAccuracy || 0;
      const balanceScore = rawData.balanceScore || rawData.stability || 50;
      const gameScore = rawData.score || rawData.finalScore || 0;

      if (gameScore > 0) {
        // Scale game score to 100 if needed
        if (gameScore > 100) {
          // If game score is like 500, scale it to 100
          score = (gameScore / 500) * 100;
        } else {
          score = gameScore;
        }
        score = Math.min(100, score);
      } else {
        const matchRate = (posesMatched / Math.max(1, totalPoses)) * 100;
        score = matchRate * 0.6 + accuracy * 0.3 + balanceScore * 0.1;
      }

      // Ensure minimum score for participation
      score = Math.max(score, 40);

      metricLabel = "Poses Matched";
      metricValue = `${posesMatched}/${totalPoses}`;

      if (score > 85) {
        supportLevel = "Independent";
        feedback = "Excellent gross motor coordination and balance!";
        traits = ["Coordinated", "Balanced"];
      } else if (score > 60) {
        supportLevel = "Emerging";
        feedback = "Good imitation skills. Continue practicing complex poses.";
        traits = ["Developing"];
      } else {
        supportLevel = "Needs Support";
        feedback = "Start with simple poses and build up complexity.";
        traits = ["Learning"];
      }

      radarData = [
        { subject: "Coordination", A: score, fullMark: 100 },
        { subject: "Balance", A: balanceScore, fullMark: 100 },
        {
          subject: "Memory",
          A: (posesMatched / Math.max(1, totalPoses)) * 100,
          fullMark: 100,
        },
        { subject: "Agility", A: Math.min(100, score + 15), fullMark: 100 },
        { subject: "Focus", A: accuracy, fullMark: 100 },
      ];
    } else if (gameId === GAME_IDS.SOUND_SCAPE) {
      console.log("🎮 Sound Scape data:", rawData);

      // SoundScapeGame returns { points: score, rounds: 10, accuracyPct: percentage }
      const gameScore = rawData.points || rawData.score || 0; // Look for "points" first!
      const correctSounds =
        rawData.correctSounds || Math.floor(gameScore / 100); // Calculate from score
      const totalSounds = rawData.rounds || rawData.totalSounds || 10;
      const accuracy =
        rawData.accuracyPct ||
        (totalSounds > 0 ? (correctSounds / totalSounds) * 100 : 0);

      console.log(
        "🎮 Extracted - Score:",
        gameScore,
        "Correct:",
        correctSounds,
        "Total:",
        totalSounds,
        "Accuracy:",
        accuracy,
      );

      // Perfect score: 1000 points for 10/10
      if (gameScore === 1000) {
        score = 100;
        metricLabel = "Perfect Score";
        metricValue = "10/10";
        supportLevel = "Independent";
        feedback = "Perfect! Excellent auditory processing skills!";
        traits = ["Auditory", "Focused", "Perceptive"];
      } else if (gameScore > 0) {
        // Scale the score: 0-1000 to 0-100
        score = (gameScore / 1000) * 100;
        metricLabel = "Accuracy";
        metricValue = `${Math.round(accuracy)}%`;

        if (score >= 95) {
          supportLevel = "Independent";
          feedback = "Excellent auditory processing and sound localization!";
          traits = ["Auditory", "Focused", "Perceptive"];
        } else if (score > 85) {
          supportLevel = "Independent";
          feedback = "Excellent auditory processing and sound localization!";
          traits = ["Auditory", "Focused"];
        } else if (score > 60) {
          supportLevel = "Emerging";
          feedback = "Good auditory skills. Work on pitch differentiation.";
          traits = ["Developing"];
        } else {
          supportLevel = "Needs Support";
          feedback = "Practice with simple sounds and work up to complex ones.";
          traits = ["Exploring"];
        }
      } else {
        // Default fallback
        console.log("🎮 No valid score for Sound Scape");
        score = 65;
        metricLabel = "Score";
        metricValue = `${Math.round(score)}`;
        supportLevel = "Emerging";
        feedback = "Good effort! Keep practicing to improve your skills.";
        traits = ["Learner"];
      }

      // Ensure score is between 0-100
      score = Math.min(100, Math.max(0, score));
      console.log("🎮 Final Sound Scape score:", score);

      radarData = [
        { subject: "Recognition", A: score, fullMark: 100 },
        { subject: "Accuracy", A: score, fullMark: 100 },
        { subject: "Focus", A: Math.min(100, score + 10), fullMark: 100 },
        { subject: "Memory", A: Math.min(100, score + 20), fullMark: 100 },
        { subject: "Timing", A: 80, fullMark: 100 },
      ];
    } else {
      console.log("⚠️ Unknown game ID:", gameId);
      // Default scoring for any other game
      score = rawData && typeof rawData === "object" ? rawData.score || 65 : 65;
      // Scale if score is large
      if (score > 100) {
        score = (score / 1000) * 100;
      }
      score = Math.min(100, Math.max(0, score));

      metricLabel = "Score";
      metricValue = `${Math.round(score)}`;
      supportLevel = "Emerging";
      feedback = "Good effort! Keep practicing to improve your skills.";
      traits = ["Learner"];

      radarData = [
        { subject: "Skill", A: score, fullMark: 100 },
        { subject: "Accuracy", A: Math.min(100, score + 15), fullMark: 100 },
        { subject: "Focus", A: Math.min(100, score - 10), fullMark: 100 },
        { subject: "Speed", A: 60, fullMark: 100 },
        { subject: "Consistency", A: 70, fullMark: 100 },
      ];
    }

    console.log("📊 Final Score calculated:", Math.round(score));
    console.log("🏷️ Metric:", metricLabel, metricValue);
    console.log("📈 Support Level:", supportLevel);

    // Save to database if we have a valid user ID
    if (userId && userId.length === 24) {
      const payload = {
        userId: userId,
        therapistId: userProfile?.therapistId,
        username: userProfile?.name || userProfile?.username || "Explorer",
        gameId,
        gameName: gameName,
        score: Math.round(score),
        accuracy:
          rawData && typeof rawData === "object" ? rawData.accuracy || 0 : 0,
        duration:
          rawData && typeof rawData === "object" ? rawData.timeSpent || 0 : 0,
        levelReached:
          rawData && typeof rawData === "object" ? rawData.level || 1 : 1,
        metadata:
          rawData && typeof rawData === "object" ? rawData.metadata || {} : {},
      };

      console.log("📤 Sending to API:", payload);

      try {
        const response = await axios.post(
          "http://localhost:4000/api/analytics/save",
          payload,
          {
            timeout: 5000,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        console.log("✅ API Response:", response.data);
        console.log("✅ Game session saved successfully!");
      } catch (err) {
        console.error("❌ API Error:", err.message);
        // Don't show alert for API errors - just log them
      }
    } else {
      console.warn("⚠️ Cannot save to database - Invalid user ID");
      console.log("User ID found:", userId);
      console.log("Expected: 24-character MongoDB ObjectId");
    }

    // Update local state regardless of database save
    setGameStats((prev) => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        totalPlays: prev[gameId].totalPlays + 1,
        highScore: Math.max(prev[gameId].highScore, Math.round(score)),
      },
    }));

    setUserProfile((prev) => ({
      ...prev,
      totalPoints: (prev.totalPoints || 0) + Math.round(score),
    }));

    // Show review modal
    setReviewData({
      gameName: gameName,
      score: Math.round(score),
      feedback,
      metricLabel: metricLabel || "Score",
      metricValue: metricValue || "High",
      supportLevel,
      radarData,
      traits: traits || ["Learner"],
      chartType: "bar",
      chartData: [],
      ...(reviewExtraData || {})
    });

    console.log("✅ Review modal data set successfully!");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="p-5 rounded-4 text-white mb-4 shadow-lg"
              style={{
                background: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
              }}
            >
              <h1 className="fw-bold">
                {t.hello}, {userProfile.name}! 👋
              </h1>
              <p className="mb-0">{t.ready_text}</p>
              <div className="mt-4 d-flex gap-3">
                <div className="bg-white bg-opacity-25 p-3 rounded-3 backdrop-blur">
                  <small className="d-block fw-bold text-uppercase opacity-75">
                    {t.level}
                  </small>
                  <span className="h4 fw-bold">{userProfile.level}</span>
                </div>
                <div className="bg-white bg-opacity-25 p-3 rounded-3 backdrop-blur">
                  <small className="d-block fw-bold text-uppercase opacity-75">
                    {t.points}
                  </small>
                  <span className="h4 fw-bold">{userProfile.totalPoints}</span>
                </div>
              </div>
            </div>
            <h4 className="fw-bold text-dark mb-3">{t.recommended}</h4>
            <Row className="g-3">
              {[GAME_IDS.EMOTION_MATCH, GAME_IDS.FACE_MIMIC].map((id) => {
                const meta = GAME_META[id];
                return (
                  <Col md={6} key={id}>
                    <Card
                      className="border-0 shadow-sm rounded-4 p-2"
                      role="button"
                      onClick={() => {
                        setActiveTab("arcade");
                        speak(t[meta.nameKey]);
                      }}
                    >
                      <Card.Body className="d-flex align-items-center">
                        <div
                          className={`p-3 rounded-3 me-3 bg-${meta.color} bg-opacity-10 text-${meta.color}`}
                        >
                          {meta.icon}
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0">{t[meta.nameKey]}</h6>
                          <small className="text-muted">
                            {t.continue_playing}
                          </small>
                        </div>
                        <div className="ms-auto text-primary">
                          <FaPlay />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </motion.div>
        );

      case "arcade":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold text-dark">{t.arcade}</h3>
              <Badge bg="light" text="dark" className="border px-3 py-2">
                5 {t.games_available}
              </Badge>
            </div>
            <Row className="g-4">
              {Object.keys(GAME_META).map((gameId) => {
                const meta = GAME_META[gameId];
                const stats = gameStats[gameId];
                return (
                  <Col lg={6} key={gameId}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden glass-card">
                        <div
                          className={`bg-${meta.color} bg-opacity-10 p-4 d-flex align-items-center`}
                        >
                          <div className={`display-4 text-${meta.color} me-3`}>
                            {meta.icon}
                          </div>
                          <div>
                            <h5 className="fw-bold mb-1">{t[meta.nameKey]}</h5>
                          </div>
                        </div>
                        <Card.Body className="p-4">
                          <p className="text-muted small mb-4">
                            {t[meta.descKey]}
                          </p>
                          <div className="d-flex gap-2">
                            <Button
                              variant={meta.color}
                              className="flex-grow-1 rounded-pill fw-bold"
                              style={{
                                backgroundColor: meta.hex,
                                borderColor: meta.hex,
                              }}
                              onClick={() => {
                                if (gameId == GAME_IDS.EMOTION_MATCH)
                                  setShowEmotionModal(true);
                                else if (gameId == GAME_IDS.PATTERN_ADVENTURE)
                                  setShowPatternModal(true);
                                else if (gameId == GAME_IDS.FACE_MIMIC)
                                  setShowCameraModal(true);
                                else if (gameId == GAME_IDS.IMITATION_GAME)
                                  setShowImitationModal(true);
                                else if (gameId == GAME_IDS.SOUND_SCAPE)
                                  setShowSoundScapeModal(true);
                              }}
                            >
                              {t.play_now}
                            </Button>
                            <Button
                              variant="light"
                              className="rounded-pill border"
                              onClick={() => {
                                setSelectedAnalyticsGame({
                                  ...stats,
                                  ...meta,
                                  id: Number(gameId),
                                  name: t[meta.nameKey],
                                });
                              }}
                            >
                              <FaChartBar />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                );
              })}
            </Row>
          </motion.div>
        );

      case "analytics":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="fw-bold text-dark mb-4">{t.overall_progress}</h3>
            <Alert variant="info">{t.select_game_info}</Alert>
          </motion.div>
        );
      default:
        return null;
    }
  };
  useEffect(() => {
    const fetchStats = async () => {
      if (!userProfile?._id) return;

      try {
        const { data } = await axios.get(
          `http://localhost:4000/api/analytics/stats/${userProfile._id}`,
        );

        if (data.gameStats) {
          setGameStats((prev) => {
            const merged = { ...prev };

            Object.keys(data.gameStats).forEach((gameId) => {
              if (merged[gameId]) {
                merged[gameId].totalPlays = data.gameStats[gameId].totalPlays;
                merged[gameId].highScore = data.gameStats[gameId].highScore;
              }
            });

            return merged;
          });
        }

        if (data.historyData) {
          setHistoryData(data.historyData);
        }
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };

    fetchStats();
  }, [userProfile]);

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      {/* --- SIDEBAR --- */}
      <div
        className="glass-panel d-flex flex-column p-4 sticky-top vh-100"
        style={{ width: "280px" }}
      >
        <div className="d-flex align-items-center mb-5">
          <div className="bg-primary text-white p-2 rounded-3 me-2">
            <FaBrain size={24} />
          </div>
          <h4 className="fw-bold mb-0 text-gradient">{t.app_name}</h4>
        </div>

        {/* Language Toggle */}
        <div className="mb-4 d-flex justify-content-center">
          <Button
            variant="outline-primary"
            size="sm"
            className="rounded-pill px-3 d-flex align-items-center"
            onClick={toggleLanguage}
          >
            <FaLanguage className="me-2" />{" "}
            {language === "en" ? "हिन्दी (Hindi)" : "English"}
          </Button>
        </div>

        <Nav className="flex-column sidebar-nav flex-grow-1 gap-2">
          <Nav.Link
            active={activeTab === "home"}
            onClick={() => {
              setActiveTab("home");
              speak(t.home);
            }}
            className="rounded-3 px-3 py-3"
          >
            <FaHome className="sidebar-icon" /> {t.home}
          </Nav.Link>
          <Nav.Link
            active={activeTab === "arcade"}
            onClick={() => {
              setActiveTab("arcade");
              speak(t.arcade);
            }}
            className="rounded-3 px-3 py-3"
          >
            <FaGamepad className="sidebar-icon" /> {t.arcade}
          </Nav.Link>
          <Nav.Link
            active={activeTab === "analytics"}
            onClick={() => {
              setActiveTab("analytics");
              speak(t.progress);
            }}
            className="rounded-3 px-3 py-3"
          >
            <FaChartPie className="sidebar-icon" /> {t.progress}
          </Nav.Link>
        </Nav>

        <div className="mt-auto pt-4 border-top">
          {/* VOICE TOGGLE */}
          <Button
            variant={isMuted ? "outline-danger" : "outline-success"}
            className="w-100 mb-3 d-flex align-items-center justify-content-center"
            onClick={toggleMute}
          >
            {isMuted ? (
              <>
                <FaVolumeMute className="me-2" /> {t.voice_off}
              </>
            ) : (
              <>
                <FaRobot className="me-2" /> {t.voice_on}
              </>
            )}
          </Button>

          {/* FACE CAPTURE BUTTON - ADDED HERE */}
          <Button
            variant={showFaceCapture ? "info" : "outline-info"}
            className="w-100 mb-3 d-flex align-items-center justify-content-center position-relative"
            onClick={() => setShowFaceCapture(!showFaceCapture)}
          >
            <FaCamera className="me-2" />
            {showFaceCapture ? "Hide Camera" : "Face Analysis"}
            {faceCaptureStats.totalCaptures > 0 && (
              <Badge
                pill
                bg="light"
                text="dark"
                className="position-absolute top-0 end-0 translate-middle"
              >
                {faceCaptureStats.totalCaptures}
              </Badge>
            )}
          </Button>

          <div className="d-flex align-items-center">
            <div className="bg-secondary rounded-circle p-2 text-white me-2">
              <FaUserMd />
            </div>
            <div className="lh-1">
              <div className="fw-bold small">{userProfile.name}</div>
              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                {t.student_account}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-grow-1 p-5 overflow-auto h-100">
        {renderContent()}
      </div>

      {/* --- MODALS --- */}
      {reviewData && (
        <SessionReviewModal
          data={reviewData}
          onClose={() => {
            setReviewData(null);
            setShowEmotionModal(false);
            setShowPatternModal(false);
            setShowCameraModal(false);
            setShowImitationModal(false);
            setShowSoundScapeModal(false);
          }}
          speak={speak}
          t={t}
        />
      )}
      {selectedAnalyticsGame &&
        selectedAnalyticsGame.id !== GAME_IDS.FACE_MIMIC && (
          <AnalyticsDashboard
            game={selectedAnalyticsGame}
            onClose={() => setSelectedAnalyticsGame(null)}
            t={t}
          />
        )}

      {/* MODAL FOR EMOTION MATCH - NOW USES EXTERNAL COMPONENT */}
      <Modal
        show={showEmotionModal}
        onHide={() => setShowEmotionModal(false)}
        size="lg"
        centered
        backdrop="static"
        contentClassName="rounded-4 border-0 shadow-lg"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>{t.game_emotion}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EmotionMatchGame
            onComplete={(data) =>
              processGameResult(GAME_IDS.EMOTION_MATCH, data)
            }
            closeModal={() => setShowEmotionModal(false)}
            t={t}
            speak={speak}
          />
        </Modal.Body>
      </Modal>

      <Modal
        show={showPatternModal}
        onHide={() => setShowPatternModal(false)}
        centered
        backdrop="static"
        contentClassName="rounded-4 border-0 shadow-lg"
      >
        <Modal.Body>
          <PatternClickerGame
            onComplete={(d) => processGameResult(GAME_IDS.PATTERN_ADVENTURE, d)}
            onClose={() => setShowPatternModal(false)}
            t={t}
            speak={speak}
          />
        </Modal.Body>
      </Modal>

      <Modal
        show={showCameraModal}
        onHide={() => setShowCameraModal(false)}
        fullscreen
      >
        <Modal.Body className="p-0 bg-dark">
          {showCameraModal && (
            <AutisticCameraGame
              onComplete={(d) => {
                processGameResult(GAME_IDS.FACE_MIMIC, d);
              }}
              onClose={() => setShowCameraModal(false)}
              speak={speak}
              t={t}
            />
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showImitationModal}
        onHide={() => setShowImitationModal(false)}
        fullscreen
      >
        <Modal.Body className="p-0 bg-dark">
          {showImitationModal && (
            <ImitationGame
              onComplete={(d) => processGameResult(GAME_IDS.IMITATION_GAME, d)}
              onClose={() => setShowImitationModal(false)}
              speak={speak}
              t={t}
            />
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showSoundScapeModal}
        onHide={() => setShowSoundScapeModal(false)}
        fullscreen
      >
        <Modal.Body className="p-0 bg-dark">
          {showSoundScapeModal && (
            <SoundScapeGame
              onComplete={(d) => processGameResult(GAME_IDS.SOUND_SCAPE, d)}
              onClose={() => setShowSoundScapeModal(false)}
              speak={speak}
              t={t}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* FACE CAPTURE COMPONENT - Positioned in main content area */}
      {showFaceCapture && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="position-fixed bottom-0 end-0 m-4"
          style={{ zIndex: 1050, width: "320px" }}
        >
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
            <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
              <span className="fw-bold">
                <FaCamera className="me-2" />
                Face Analysis
              </span>
              <Button
                variant="light"
                size="sm"
                className="rounded-circle p-1"
                onClick={() => setShowFaceCapture(false)}
              >
                ×
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <FaceCaptureComponent
                userId={userProfile?.id || userProfile?._id}
                onCapture={handleFaceCapture}
                compactMode={true}
              />
            </Card.Body>
            <Card.Footer className="bg-light text-center">
              <small className="text-muted">
                Captures: {faceCaptureStats.totalCaptures}
                {faceCaptureStats.lastCapture && (
                  <span className="ms-2">
                    Last:{" "}
                    {new Date(faceCaptureStats.lastCapture).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </span>
                )}
              </small>
            </Card.Footer>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default UserDashboard;
