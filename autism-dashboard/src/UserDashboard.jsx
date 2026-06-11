import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Form,
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
  FaHandPaper,
  FaCog,
  FaHeadphones,
  FaVolumeUp,
  FaVolumeMute,
  FaRobot,
  FaLanguage,
  FaVideo,
  FaUpload,
  FaFolder,
  FaList,
  FaThLarge,
  FaSearch,
  FaFilter,
  FaSort,
  FaCalendar,
  FaClock,
  FaEye,
  FaTrash,
  FaEdit,
  FaDownload,
  FaEllipsisV,
  FaShieldAlt,
  FaChartLine,
  FaArrowRight,
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
import EyeGazeTracker from "./EyeGazeTracker";
import VideoLibraryComponent from "./components/VideoLibraryComponent";
import MagicHandsGame from "./MagicHandsGame";
import HandGestureOverlay from "./components/HandGestureOverlay";
import { useTheme } from "./ThemeContext";

import * as faceapi from "@vladmandic/face-api";

// ----- Constants & Helpers -----
const todayISO = () => new Date().toISOString().slice(0, 10);

const GAME_IDS = {
  EMOTION_MATCH: 1,
  PATTERN_ADVENTURE: 2,
  FACE_MIMIC: 3,
  IMITATION_GAME: 4,
  SOUND_SCAPE: 5,
  MAGIC_HANDS: 6,
};

const clampPercent = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(100, Math.max(0, number));
};

const roundPercent = (value) => Math.round(clampPercent(value));

const firstFiniteNumber = (...values) => {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
};

const percentOf = (part, total) => {
  const safeTotal = Number(total);
  if (!Number.isFinite(safeTotal) || safeTotal <= 0) return 0;
  return clampPercent((Number(part) / safeTotal) * 100);
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
    videos: "Videos",
    video_library: "Video Library",
    upload_video: "Upload Video",
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
    game_magic_hands: "Magic Hands",
    desc_magic_hands: "Fine motor & hand-eye coordination.",
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
    instr_magic_start:
      "Welcome to Magic Hands! Use your index finger to pop the bubbles!",
    instr_magic_success: "Great pop! Keep going!",
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
    stat_popped: "Bubbles Popped",
    stat_hand_accuracy: "Hand Accuracy",
    stat_best_combo: "Best Combo",
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
    videos: "वीडियो",
    video_library: "वीडियो लाइब्रेरी",
    upload_video: "वीडियो अपलोड करें",
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
    game_magic_hands: "जादुई हाथ",
    desc_magic_hands: "सूक्ष्म मोटर और हाथ-आँख समन्वय।",
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
    instr_magic_start:
      "जादुई हाथ में स्वागत है! बुलबुले फोड़ने के लिए अपनी तर्जनी उंगली का उपयोग करें!",
    instr_magic_success: "शानदार! जारी रखें!",
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
    stat_popped: "बुलबुले फोड़े",
    stat_hand_accuracy: "हाथ सटीकता",
    stat_best_combo: "सर्वश्रेष्ठ कॉम्बो",
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
    case GAME_IDS.MAGIC_HANDS:
      return [
        {
          label: t.stat_popped,
          value: "42",
          icon: <FaHandPaper size={20} />,
          color: "info",
        },
        {
          label: t.stat_hand_accuracy,
          value: "88%",
          icon: <FaCamera size={20} />,
          color: "success",
        },
        {
          label: t.stat_best_combo,
          value: "7x",
          icon: <FaFire size={20} />,
          color: "warning",
        },
      ];
    default:
      return [];
  }
};

// ----- MODALS & COMPONENTS -----

const SessionReviewModal = ({ data, onClose, speak, t, colors }) => {
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
    posePerformance,
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
      <Modal.Body
        className="p-0"
        style={{ backgroundColor: colors?.bgCard || "#fff" }}
      >
        <div
          className="p-4 text-center border-bottom"
          style={{
            backgroundColor: `${colors?.accentColor}20`,
            borderBottomColor: colors?.borderColor,
          }}
        >
          <Badge
            style={{ backgroundColor: colors?.bgCard, color: colors?.textPrimary, border: `1px solid ${colors?.borderColor}` }}
            className="mb-2 px-3 py-2 shadow-sm"
          >
            {gameName}
          </Badge>
          <h2 className="fw-bold mb-0" style={{ color: colors?.textPrimary }}>
            {t.session_review}
          </h2>
        </div>
        <div className="p-4">
          <Row className="align-items-center">
            <Col
              md={5}
              className="text-center border-end"
              style={{ borderRightColor: colors?.borderColor }}
            >
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

              {/* Social Outcome / Useful Insight */}
              {data.socialOutcome && (
                <div className="mt-4 p-3 rounded-4" style={{ backgroundColor: `${colors?.accentColor}10`, border: `1px dashed ${colors?.accentColor}` }}>
                  <h6 className="fw-bold text-primary mb-2">
                    <FaLightbulb className="me-2" />
                    Session Insight
                  </h6>
                  <p className="small mb-0 opacity-75 fw-medium" style={{ lineHeight: '1.5' }}>
                    {data.socialOutcome}
                  </p>
                  <div className="mt-3 d-flex gap-2">
                    <Badge bg="danger" className="opacity-75">Hardest: {data.hardestEmotion}</Badge>
                    <Badge bg="success" className="opacity-75">Easiest: {data.easiestEmotion}</Badge>
                  </div>
                </div>
              )}
            </Col>
            <Col md={7} className="ps-md-4">
              {radarData.length > 1 ? (
                <>
                  <h6 className="fw-bold text-secondary mb-3">Skill Performance</h6>
                  <Row className="g-2">
                    {radarData.map((pt, i) => (
                      <Col xs={6} key={i}>
                        <div className="p-3 rounded-4 border bg-white shadow-sm h-100 transition-all hover-lift">
                          <div className="d-flex flex-column align-items-center text-center">
                            <small className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                              {pt.subject}
                            </small>
                            <div className="h4 fw-bold mb-0 text-primary">
                              {pt.subject === "Duration" ? `${Math.round(pt.trueValue || pt.A)}s` :
                               pt.subject === "Level" ? `${pt.trueValue || 1}` :
                               `${Math.round(pt.A)}%`}
                            </div>
                            <ProgressBar
                              now={pt.A}
                              className="w-100 mt-2"
                              style={{ height: '4px' }}
                              variant={pt.A > 80 ? "success" : pt.A > 50 ? "primary" : "warning"}
                            />
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </>
              ) : (
                <div className="p-4 rounded-4 border bg-white shadow-sm">
                  <small className="text-muted fw-bold text-uppercase d-block mb-2">
                    Session Result
                  </small>
                  <div className="h3 fw-bold text-primary mb-1">
                    {metricValue}
                  </div>
                  <div className="text-secondary fw-semibold">
                    {metricLabel}
                  </div>
                </div>
              )}

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

              {posePerformance && posePerformance.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-bold text-secondary mb-3">
                    Pose Time Details
                  </h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>Pose</th>
                          <th className="text-end">Time Taken</th>
                          <th className="text-end">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posePerformance.map((pose, index) => (
                          <tr key={index}>
                            <td className="text-capitalize fw-medium">
                              {(pose.poseId || `Pose ${index + 1}`).replace(/_/g, " ")}
                            </td>
                            <td className="text-end">
                              {pose.timeout ? "Timed out" : `${Math.round((pose.timeTaken || 0) / 1000)} seconds`}
                            </td>
                            <td className="text-end">
                              <Badge bg={(pose.score || 0) >= 80 ? "success" : (pose.score || 0) >= 50 ? "warning" : "danger"}>
                                {Math.round(pose.score || 0)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </div>
        <div className="p-3 text-center border-top" style={{ backgroundColor: colors?.bgMain, borderTopColor: colors?.borderColor }}>
          <Button
            size="lg"
            className="px-5 rounded-pill shadow-sm"
            style={{
              backgroundColor: colors?.accentColor,
              borderColor: colors?.accentColor,
              color: "#fff",
            }}
            onClick={onClose}
          >
            {t.continue}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const AnalyticsDashboard = ({ game, onClose, t, colors }) => {
  const sessions = game.sessions || [];
  const latestSession = sessions[sessions.length - 1] || {};
  const meta = latestSession.metadata || {};
  const latestScore = roundPercent(latestSession.score);
  const latestAccuracy = roundPercent(firstFiniteNumber(latestSession.accuracy, meta.accuracy, meta.accuracyPct, latestScore));

  const historyData = sessions.map(s => ({
    day: new Date(s.playedAt).toLocaleDateString('en-US', { weekday: 'short' }),
    score: roundPercent(s.score)
  }));

  const staticStats = [
    { label: t.total_plays, value: sessions.length, icon: <FaPlay />, color: "primary" },
    { label: t.high_score, value: Math.max(...sessions.map(s => s.score), 0), icon: <FaStar />, color: "warning" },
    { label: "Avg. Accuracy", value: `${Math.round(sessions.reduce((a, b) => a + firstFiniteNumber(b.accuracy, b.metadata?.accuracy, b.metadata?.accuracyPct, b.score), 0) / (sessions.length || 1))}%`, icon: <FaChartLine />, color: "success" }
  ];

  const getRealChartData = () => {
    switch (game.id) {
      case GAME_IDS.EMOTION_MATCH:
        return meta.accuracyByEmotion ? Object.keys(meta.accuracyByEmotion).map(k => ({
          name: k, accuracy: roundPercent(meta.accuracyByEmotion[k])
        })) : [
          { name: "Matches", accuracy: roundPercent(percentOf(meta.matchScore || 0, meta.totalPossibleMatches || meta.matchScore || 1)) },
          { name: "Accuracy", accuracy: latestAccuracy },
          { name: "Level", accuracy: roundPercent(percentOf(latestSession.levelReached || meta.level || 1, 3)) }
        ];

      case GAME_IDS.PATTERN_ADVENTURE:
        return (meta.reactionTimes || meta.times) ? (meta.reactionTimes || meta.times).map((rt, i) => ({
          click: i + 1, reactionTime: rt
        })) : [
          { click: 1, reactionTime: meta.reactionTime || 0 }
        ];

      case GAME_IDS.FACE_MIMIC:
        return (meta.emotionData || meta.emotionPerformance) ? (meta.emotionData || meta.emotionPerformance).map(e => ({
          name: e.emotion,
          score: e.timeout ? 0 : roundPercent(e.score ?? (100 - (e.timeTaken / 1000) * 2)),
          fullMark: 100
        })) : [
          { name: "Mimicry", score: latestScore, fullMark: 100 }
        ];

      case GAME_IDS.IMITATION_GAME:
        return meta.poseBreakdown?.length
          ? meta.poseBreakdown.map((pose, i) => ({
              name: (pose.poseId || `Pose ${i + 1}`).replace(/_/g, " "),
              score: roundPercent(100 - ((pose.timeTaken || 0) / 100)),
            }))
          : [
              { name: "Pose Matches", score: roundPercent(percentOf(meta.posesMatched || 0, meta.totalPoses || 1)) },
              { name: "Accuracy", score: latestAccuracy },
            ];

      case GAME_IDS.SOUND_SCAPE:
        return [
          { name: "Correct", score: roundPercent(percentOf(meta.correctSounds || 0, meta.totalSounds || meta.rounds || 10)) },
          { name: "Accuracy", score: latestAccuracy },
          { name: "Points", score: latestScore }
        ];

      case GAME_IDS.MAGIC_HANDS:
        return [
          { name: "Popped", accuracy: roundPercent(percentOf(meta.bubblesPopped || 0, meta.totalBubbles || 1)) },
          { name: "Missed", accuracy: roundPercent(percentOf(Math.max(0, (meta.totalBubbles || 0) - (meta.bubblesPopped || 0)), meta.totalBubbles || 1)) },
          { name: "Accuracy", accuracy: latestAccuracy }
        ];

      default: return [];
    }
  };

  const chartData = getRealChartData();

  const renderSpecificChart = () => {
    switch (game.id) {
      case GAME_IDS.EMOTION_MATCH:
        return (
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: "#f5f7fa" }} />
                <Bar dataKey="accuracy" name="Recognition %" fill="#4e73df" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case GAME_IDS.PATTERN_ADVENTURE:
        return (
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="click" label={{ value: "Clicks", position: "insideBottom", offset: -5 }} tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="reactionTime" stroke="#f6c23e" strokeWidth={4} dot={{ r: 4, fill: "#f6c23e" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case GAME_IDS.FACE_MIMIC:
        return (
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#eee" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700, fill: "#555" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="transparent" />
                <Radar name="Control %" dataKey="score" stroke="#1cc88a" fill="#1cc88a" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );
      case GAME_IDS.IMITATION_GAME:
        return (
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="score" name="Accuracy %" fill="#e74a3b" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case GAME_IDS.SOUND_SCAPE:
        return (
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="score" name="Accuracy %" fill="#0dcaf0" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case GAME_IDS.MAGIC_HANDS:
        return (
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="accuracy" name="Pop Accuracy %" fill="#38b2ac" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      default: return null;
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
      <Modal.Header
        closeButton
        className="border-0 p-4"
        style={{ backgroundColor: colors?.bgCard, borderBottomColor: colors?.borderColor }}
      >
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
            <h3 className="mb-0 fw-bold" style={{ color: colors?.textPrimary }}>
              {game.name} {t.analytics}
            </h3>
            <small style={{ color: colors?.textSecondary }}>{t.session_review}</small>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4" style={{ backgroundColor: colors?.bgMain }}>
        <Row className="g-4 mb-4">
          {staticStats.map((stat, index) => (
            <Col md={4} key={index}>
              <Card
                className="h-100 border-0 shadow-sm rounded-4"
                style={{ backgroundColor: colors?.bgCard, borderColor: colors?.borderColor }}
              >
                <Card.Body className="d-flex align-items-center p-3">
                  <div
                    className={`p-2 rounded-3 me-3 bg-${stat.color} bg-opacity-10 text-${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div
                      className="x-small fw-bold"
                      style={{ fontSize: "0.7rem", color: colors?.textSecondary }}
                    >
                      {stat.label}
                    </div>
                    <div className="h5 mb-0 fw-bold" style={{ color: colors?.textPrimary }}>
                      {stat.value}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Card className="border-0 shadow-sm rounded-4 p-3 mb-4" style={{ backgroundColor: colors?.bgCard, borderColor: colors?.borderColor }}>
          <Card.Body>
            <h5 className="fw-bold mb-4" style={{ color: colors?.textPrimary }}>
              {t.session_review} Breakdown
            </h5>
            {renderSpecificChart()}
          </Card.Body>
        </Card>
        <Card className="border-0 shadow-sm rounded-4 p-3" style={{ backgroundColor: colors?.bgCard, borderColor: colors?.borderColor }}>
          <Card.Body>
            <h5 className="fw-bold mb-4" style={{ color: colors?.textPrimary }}>
              {t.weekly_activity}
            </h5>
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

    // Score against a comfortable response threshold.
    // <=750ms earns full speed credit; slower responses decline gradually.
    const optimalReactionTime = 750;
    const slowestUsefulReactionTime = 1000;
    const speedScore =
      avgReactionTime <= optimalReactionTime
        ? 100
        : 100 - ((avgReactionTime - optimalReactionTime) / (slowestUsefulReactionTime - optimalReactionTime)) * 100;
    const errorPenalty = errors * 12;
    let score = Math.max(0, Math.min(100, speedScore - errorPenalty));

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

    if (onComplete) {
      onComplete({
        times: reactionTimes,
        errors: errors,
        score: score,
        reactionTime: avgReactionTime,
        totalRounds: reactionTimes.length,
      });
    }
    
    if (onClose) onClose();
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
  const { colors, theme, changeTheme, availableThemes } = useTheme();
  const [activeTab, setActiveTab] = useState("arcade");
  const [language, setLanguage] = useState("en");
  const t = TRANSLATIONS[language];

  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [faceCaptureStats, setFaceCaptureStats] = useState({
    totalCaptures: 0,
    lastCapture: null,
  });
  const [gazeStats, setGazeStats] = useState([]);

  const handleGazeUpdate = (data) => {
    setGazeStats((prev) => [...prev.slice(-20), data]);
  };

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

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
    speak(`Theme changed to ${availableThemes.find(t => t.id === newTheme)?.name}`);
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
        const user = {
          name: parsedUser.username || parsedUser.name || "Explorer",
          totalPoints: parsedUser.totalPoints || 0,
          level: parsedUser.level || 1,
          avatar: parsedUser.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
          ...parsedUser,
        };


        if (user.id && !user._id) user._id = user.id;
        else if (user._id && !user.id) user.id = user._id;

        return user;
      }
    } catch (e) {
      console.error("Profile load error", e);
    }
    return {
      name: "Explorer",
      totalPoints: 0,
      level: 1,
      id: null,
      _id: null,
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    };

  });

  const [blurGameplay, setBlurGameplay] = useState(true);
  const [handNavigation, setHandNavigation] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoHiddenRef = useRef(null);
  const canvasRef = useRef(null);
  const [gameStats, setGameStats] = useState({
    [GAME_IDS.EMOTION_MATCH]: { totalPlays: 0, highScore: 0 },
    [GAME_IDS.PATTERN_ADVENTURE]: { totalPlays: 0, highScore: 0 },
    [GAME_IDS.FACE_MIMIC]: { totalPlays: 0, highScore: 0 },
    [GAME_IDS.IMITATION_GAME]: { totalPlays: 0, highScore: 0 },
    [GAME_IDS.SOUND_SCAPE]: { totalPlays: 0, highScore: 0 },
    [GAME_IDS.MAGIC_HANDS]: { totalPlays: 0, highScore: 0 },
  });
  const [historyData, setHistoryData] = useState([]);
  const [rawSessions, setRawSessions] = useState([]);
  const faceBoxRef = useRef(null);
  const faceBoxTimeRef = useRef(0);
  const drawLoopRef = useRef(null);
  const faceDetectRef = useRef(null);
  const DRAW_FPS = 30;
  const FACE_HZ = 100;
  const BOX_EXPIRE_MS = 1000;
  const BOX_PAD = 0.2;

  const [reviewData, setReviewData] = useState(null);
  const [selectedAnalyticsGame, setSelectedAnalyticsGame] = useState(null);
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showImitationModal, setShowImitationModal] = useState(false);
  const [showSoundScapeModal, setShowSoundScapeModal] = useState(false);
  const [showMagicHandsModal, setShowMagicHandsModal] = useState(false);
  const [isGameRecording, setIsGameRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const recordedChunksRef = useRef([]);

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
    [GAME_IDS.MAGIC_HANDS]: {
      nameKey: "game_magic_hands",
      descKey: "desc_magic_hands",
      icon: <FaHandPaper />,
      color: "info", // Matches the teal/info theme used in the source
      hex: "#17a2b8",
    },
  };

  // --- Load Models for Gameplay Blur ---
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log("✅ Face models loaded for arcade");
      } catch (err) {
        console.error("❌ Failed to load face models", err);
      }
    };
    loadModels();
  }, []);

  const startBlurLoops = useCallback(() => {
    const draw = () => {
      const vid = videoHiddenRef.current;
      const canvas = canvasRef.current;
      if (!vid || !canvas || vid.readyState < 2) {
        drawLoopRef.current = setTimeout(draw, 1000 / DRAW_FPS);
        return;
      }

      if (canvas.width !== vid.videoWidth) canvas.width = vid.videoWidth || 640;
      if (canvas.height !== vid.videoHeight) canvas.height = vid.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      const W = canvas.width;
      const H = canvas.height;

      ctx.save();
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(vid, 0, 0, W, H);
      ctx.restore();

      if (blurGameplay) {
        const box = faceBoxRef.current;
        const boxAge = Date.now() - faceBoxTimeRef.current;

        if (box && boxAge < BOX_EXPIRE_MS) {
          const { x, y, width: fw, height: fh } = box;
          const mx = Math.max(0, W - (x + fw) - fw * BOX_PAD);
          const my = Math.max(0, y - fh * BOX_PAD);
          const mw = Math.min(W - mx, fw * (1 + 2 * BOX_PAD));
          const mh = Math.min(H - my, fh * (1 + 2 * BOX_PAD));

          ctx.save();
          ctx.filter = "blur(25px)";
          ctx.drawImage(canvas, mx, my, mw, mh, mx, my, mw, mh);
          ctx.restore();
        } else {
          ctx.save();
          ctx.filter = "blur(25px)";
          ctx.drawImage(canvas, 0, 0, W, H * 0.7, 0, 0, W, H * 0.7);
          ctx.restore();
        }
      }
      drawLoopRef.current = setTimeout(draw, 1000 / DRAW_FPS);
    };
    draw();

    faceDetectRef.current = setInterval(async () => {
      const vid = videoHiddenRef.current;
      if (!vid || vid.readyState < 2 || !modelsLoaded) return;
      try {
        const det = await faceapi.detectSingleFace(vid, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 }));
        if (det) {
          faceBoxRef.current = det.box;
          faceBoxTimeRef.current = Date.now();
        }
      } catch (e) {
        console.warn("Face detection error:", e);
      }
    }, FACE_HZ);
  }, [blurGameplay]);

  const stopBlurLoops = useCallback(() => {
    if (drawLoopRef.current) clearTimeout(drawLoopRef.current);
    if (faceDetectRef.current) clearInterval(faceDetectRef.current);
    drawLoopRef.current = null;
    faceDetectRef.current = null;
  }, []);

  const stopGameplayRecorder = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return null;

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "video/webm" });
        recordedChunksRef.current = [];
        mediaRecorderRef.current = null;
        setIsGameRecording(false);
        stopBlurLoops();

        if (videoHiddenRef.current?.srcObject) {
          videoHiddenRef.current.srcObject.getTracks().forEach((track) => track.stop());
          videoHiddenRef.current.srcObject = null;
        }
        resolve(blob.size > 0 ? blob : null);
      };

      if (recorder.state !== "inactive") {
        recorder.stop();
      } else {
        resolve(null);
      }
    });
  }, [stopBlurLoops]);

  const startGameplayRecorder = useCallback(async () => {
    if (isGameRecording || mediaRecorderRef.current) return;
    if (!navigator?.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

      if (!videoHiddenRef.current) {
        videoHiddenRef.current = document.createElement("video");
      }
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }

      videoHiddenRef.current.srcObject = stream;
      await videoHiddenRef.current.play();
      startBlurLoops();

      const captureStream = canvasRef.current.captureStream(DRAW_FPS);

      let mimeType = "video/webm;codecs=vp9";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm;codecs=vp8";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm";

      const recorder = new MediaRecorder(captureStream, { mimeType });
      recordedChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsGameRecording(true);
      console.log("🎥 Gameplay recording started with privacy blur pipeline");
    } catch (err) {
      console.warn("Gameplay recording unavailable:", err?.message || err);
    }
  }, [isGameRecording, startBlurLoops, blurGameplay]);

  useEffect(() => {
    const anyGameModalOpen =
      showEmotionModal ||
      showPatternModal ||
      showCameraModal ||
      showImitationModal ||
      showSoundScapeModal ||
      showMagicHandsModal;

    if (anyGameModalOpen) {
      startGameplayRecorder();
    }
  }, [
    showEmotionModal,
    showPatternModal,
    showCameraModal,
    showImitationModal,
    showSoundScapeModal,
    showMagicHandsModal,
    startGameplayRecorder,
  ]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

    // --- REAL DATA RADAR MAPPING ---
    // Align with Therapist Dashboard for consistency
    const duration = firstFiniteNumber(
      rawData?.duration,
      rawData?.timeSpent,
      rawData?.time,
      rawData?.times ? rawData.times.reduce((a, b) => a + b, 0) / 1000 : undefined,
    );
    const moves = firstFiniteNumber(rawData?.moves, rawData?.points ? rawData.points / 10 : undefined);
    const level = firstFiniteNumber(rawData?.level, 1) || 1;

    let maxScoreScale = 200;
    if (gameId === GAME_IDS.IMITATION_GAME) maxScoreScale = 800;
    if (gameId === GAME_IDS.EMOTION_MATCH) maxScoreScale = 12;

    // Moves Efficiency: Min Moves (Cards Count) / Actual Moves
    let minMoves = 0;
    if (gameId === GAME_IDS.EMOTION_MATCH) {
      minMoves = level === 1 ? 4 : level === 2 ? 8 : 12;
    } else {
      minMoves = moves > 0 ? Math.max(1, Math.floor(moves * 0.7)) : 10;
    }
    const movesEfficiency = moves > 0 ? roundPercent((minMoves / moves) * 100) : 0;

    // Initial Score Logic
    score = firstFiniteNumber(rawData?.score, rawData?.points, rawData?.matchScore ? rawData.matchScore * 50 : undefined);

    // Fix Accuracy calculation (ensure it's never > 100%)
    const rawAccuracy = firstFiniteNumber(rawData?.accuracy, rawData?.accuracyPct);
    let finalAccuracy = rawAccuracy > 100 ? movesEfficiency : rawAccuracy || movesEfficiency;

    radarData = [
      { subject: "Score", A: Math.min(100, (score / maxScoreScale) * 100), fullMark: 100, trueValue: Math.round(score) },
      { subject: "Accuracy", A: finalAccuracy, fullMark: 100, trueValue: finalAccuracy },
      { subject: "Level", A: Math.min(100, (level / 5) * 100), fullMark: 100, trueValue: level },
      { subject: "Duration", A: Math.min(100, (duration / 300) * 100), fullMark: 100, trueValue: duration },
      { subject: "Moves", A: movesEfficiency, fullMark: 100, trueValue: movesEfficiency },
    ];

    if (gameId === GAME_IDS.EMOTION_MATCH) {
      console.log("🎮 Emotion Match data:", rawData);
      const completedLevels = firstFiniteNumber(
        rawData?.levelsCompleted,
        rawData?.levelCompleted, 
        rawData?.metadata?.levelsCompleted, 
        rawData?.level
      );
      const matches = firstFiniteNumber(
        rawData?.matchedPairs,
        rawData?.matchScore, 
        rawData?.metadata?.matchedPairs
      );
      const moveAccuracy = rawData?.accuracy !== undefined
        ? rawData.accuracy
        : (moves > 0 ? percentOf(matches, moves) : 0);
      
      // For Emotion Match, we want to store the raw matches (max 12) 
      // as 'score' to align with Therapist Dashboard's maxScore = 12 scaling.
      score = matches || 0; 
      finalAccuracy = roundPercent(moveAccuracy);

      metricLabel = "Levels Done";
      metricValue = `${completedLevels} / 3`;
      radarData = [
        { subject: "Match Score", A: score, fullMark: 100, trueValue: score },
      ];

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
    } else if (gameId === GAME_IDS.PATTERN_ADVENTURE) {
      console.log("🎮 Pattern Adventure data:", rawData);

      // Direct score from game
      score = firstFiniteNumber(rawData?.score);

      // If no score was provided, calculate one
      if (score === 0) {
        const times = rawData.times || rawData.reactionTimes || [];
        const errors = rawData.errors || rawData.errorCount || 0;

        if (times.length > 0) {
          const avgReactionTime =
            times.reduce((a, b) => a + b, 0) / times.length;
          const optimalReactionTime = 750;
          const slowestUsefulReactionTime = 1000;
          const speedScore = avgReactionTime <= optimalReactionTime
            ? 100
            : 100 - ((avgReactionTime - optimalReactionTime) / (slowestUsefulReactionTime - optimalReactionTime)) * 100;
          score = clampPercent(speedScore - errors * 12);
        } else {
          score = 0;
        }
      }
      finalAccuracy = roundPercent(score);

      metricLabel = "Reaction Time";
      metricValue =
        rawData.times && rawData.times.length > 0
          ? `${Math.round(rawData.times.reduce((a, b) => a + b, 0) / rawData.times.length)}ms`
          : "N/A";
      radarData = [
        { subject: "Reaction Score", A: roundPercent(score), fullMark: 100, trueValue: Math.round(score) },
      ];

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

    } else if (gameId === GAME_IDS.FACE_MIMIC) {
      console.log("🎮 Face Mimic data received:", rawData);
      const emotionData = rawData.emotionData || [];
      const timeData = rawData.timeData || {};

      // Respect the game's real score. Timed-out emotions are already 0-point entries.
      const maxFaceMimicScore = rawData.maxScore || 400;
      const gamePoints = rawData.score ?? rawData.points ?? 0;
      score = gamePoints > 100
        ? Math.min(100, (gamePoints / maxFaceMimicScore) * 100)
        : Math.min(100, gamePoints);
      score = roundPercent(score);
      finalAccuracy = roundPercent(firstFiniteNumber(rawData?.accuracy, score));

      metricLabel = "Fastest Response";
      const fastestTime = timeData.minTime ?? timeData.fastest?.timeTaken ?? 0;
      metricValue = fastestTime > 0 ? `${(fastestTime / 1000).toFixed(1)}s` : "N/A";
      radarData = [
        { subject: "Score", A: Math.round(score), fullMark: 100, trueValue: Math.round(score) },
        { subject: "Accuracy", A: finalAccuracy, fullMark: 100, trueValue: finalAccuracy },
      ];

      // CLINICAL OUTCOME GENERATION
      const sortedByDifficulty = [...emotionData].sort((a,b) => b.timeTaken - a.timeTaken);
      const hardest = sortedByDifficulty[0]?.emotion || "None";
      const easiest = sortedByDifficulty[sortedByDifficulty.length - 1]?.emotion || "None";

      let socialInsight = "";
      if (hardest === "sad" || hardest === "fear") {
        socialInsight = `Struggled most with "${hardest}" expressions. Suggests a need for targeted empathy training for low-arousal cues.`;
      } else if (hardest === "angry" || hardest === "disgust") {
        socialInsight = `Took longer to mimic "${hardest}". May indicate sensitivity or hesitation toward negative social stimuli.`;
      } else {
        socialInsight = `Excellent overall mimicry. Focusing on "${hardest}" will help balance facial motor control.`;
      }

      feedback = socialInsight;
      traits = ["Mirroring", "Focused"];
      supportLevel = score > 85 ? "Independent" : "Emerging";

      reviewExtraData = {
        emotionPerformance: sortedByDifficulty,
        socialOutcome: socialInsight,
        hardestEmotion: hardest,
        easiestEmotion: easiest
      };
    } else if (gameId === GAME_IDS.IMITATION_GAME) {
      console.log("🎮 Imitation Game data:", rawData);
      // Try multiple ways to get data
      const posesMatched = firstFiniteNumber(rawData?.posesMatched, rawData?.matchedPoses);
      const totalPoses = firstFiniteNumber(rawData?.totalPoses, rawData?.totalAttempts, posesMatched || 1);
      const accuracy = firstFiniteNumber(rawData?.accuracy, rawData?.matchAccuracy);
      const balanceScore = firstFiniteNumber(rawData?.balanceScore, rawData?.stability);
      const timingScore = rawData?.timingScore ?? rawData?.metadata?.timingScore ?? score;
      const gameScore = firstFiniteNumber(rawData?.score, rawData?.finalScore);

      if (gameScore > 0) {
        score = percentOf(gameScore, totalPoses * 100 || 700);
      } else {
        const matchRate = (posesMatched / Math.max(1, totalPoses)) * 100;
        score = matchRate * 0.6 + accuracy * 0.3 + balanceScore * 0.1;
      }

      score = roundPercent(score);
      finalAccuracy = roundPercent(accuracy || percentOf(posesMatched, totalPoses));

      metricLabel = "Poses Matched";
      metricValue = `${posesMatched}/${totalPoses}`;
      radarData = [
        { subject: "Pose Match", A: roundPercent(percentOf(posesMatched, totalPoses)), fullMark: 100, trueValue: posesMatched },
        { subject: "Time Score", A: roundPercent(timingScore), fullMark: 100, trueValue: timingScore },
      ];
      reviewExtraData = {
        posePerformance: rawData?.metadata?.poseBreakdown || rawData?.poseBreakdown || [],
      };

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

    } else if (gameId === GAME_IDS.SOUND_SCAPE) {
      console.log("🎮 Sound Scape data:", rawData);

      // SoundScapeGame returns { points: score, rounds: 10, accuracyPct: percentage }
      const gameScore = firstFiniteNumber(rawData?.points, rawData?.score); // Look for "points" first!
      const correctSounds =
        firstFiniteNumber(rawData?.correctSounds, Math.floor(gameScore / 100)); // Calculate from score
      const totalSounds = firstFiniteNumber(rawData?.rounds, rawData?.totalSounds, 10) || 10;
      const accuracy =
        firstFiniteNumber(rawData?.accuracyPct, rawData?.accuracy) ||
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
        score = percentOf(gameScore, totalSounds * 100);
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
        score = 0;
        metricLabel = "Score";
        metricValue = `${Math.round(score)}`;
        supportLevel = "Needs Support";
        feedback = "No completed sound matches were recorded for this session.";
        traits = ["Learner"];
      }

      // Ensure score is between 0-100
      score = roundPercent(score);
      finalAccuracy = roundPercent(accuracy);
      console.log("🎮 Final Sound Scape score:", score);

      radarData = [
        { subject: "Sound Score", A: score, fullMark: 100, trueValue: score },
      ];
    } else if (gameId === GAME_IDS.MAGIC_HANDS) {
      const {
        bubblesPopped = 0,
        totalBubbles: total = 0,
        missedBubbles = 0,
        accuracy: acc = 0,
      } = rawData;
      score = roundPercent(acc || percentOf(bubblesPopped, bubblesPopped + missedBubbles));
      finalAccuracy = score;
      metricLabel = "Bubbles Popped";
      metricValue = `${bubblesPopped} / ${total}`;
      radarData = [
        { subject: "Pop Score", A: score, fullMark: 100, trueValue: score },
      ];
      if (score > 85) {
        supportLevel = "Independent";
        feedback = "Excellent hand-eye coordination and fine motor precision.";
        traits = ["Precise", "Quick"];
      } else if (score > 60) {
        supportLevel = "Emerging";
        feedback = "Good tracking ability. Work on speed and edge accuracy.";
        traits = ["Steady", "Focused"];
      } else {
        supportLevel = "Needs Support";
        feedback =
          "Keep practicing! Focus on moving your finger slowly toward each bubble.";
        traits = ["Explorer"];
      }
    } else {
      console.log("⚠️ Unknown game ID:", gameId);
      // Default scoring for any other game
      score = rawData && typeof rawData === "object" ? firstFiniteNumber(rawData.score, rawData.points) : 0;
      // Scale if score is large
      if (score > 100) {
        score = (score / 1000) * 100;
      }
      score = roundPercent(score);

      metricLabel = "Score";
      metricValue = `${Math.round(score)}`;
      supportLevel = "Emerging";
      feedback = "Good effort! Keep practicing to improve your skills.";
      traits = ["Learner"];

      radarData = [
        { subject: "Session Score", A: score, fullMark: 100 },
      ];
    }

    console.log("📊 Final Score calculated:", Math.round(score));
    console.log("🏷️ Metric:", metricLabel, metricValue);
    console.log("📈 Support Level:", supportLevel);

    // Save to database if we have a valid user ID
    // We allow any ID that exists, but warn if it's not a standard MongoDB ObjectId
    if (userId) {
      if (userId.length !== 24) {
        console.warn("⚠️ Non-standard User ID detected. Backend save may fail if user is not in database.");
      }

      let gameVideoUrl = null;
      let gameVideoFilename = null;
      try {
        const recordingBlob = await stopGameplayRecorder();
        if (recordingBlob) {
          const videoForm = new FormData();
          videoForm.append("video", recordingBlob, `gameplay_${Date.now()}.webm`);
          videoForm.append("userId", userId);
          videoForm.append("gameId", String(gameId));
          const uploadResp = await axios.post(
            "http://localhost:4000/api/analytics/upload-game-video",
            videoForm,
            { headers: { "Content-Type": "multipart/form-data" }, timeout: 15000 }
          );
          gameVideoUrl = uploadResp?.data?.gameVideoUrl || null;
          gameVideoFilename = uploadResp?.data?.gameVideoFilename || null;
        }
      } catch (uploadErr) {
        console.warn("Game behavior video upload skipped:", uploadErr?.message || uploadErr);
      }

        const payload = {
          userId: userId,
          therapistId: userProfile?.therapistId || "Therapist_Main", // Ensure therapist linkage
          username: userProfile?.name || userProfile?.username || "Explorer",
          gameId,
          gameName: gameName,
          score: Math.round(score),
          accuracy: finalAccuracy,
          duration,
          levelReached:
            rawData && typeof rawData === "object" ? rawData.level || 1 : 1,
          gameVideoUrl,
          gameVideoFilename,
          faceBlurred: blurGameplay,
          metadata: {
            ...(rawData && typeof rawData === "object" ? rawData : {}),
            ...(rawData && typeof rawData === "object" ? rawData.metadata || {} : {}),
            feedback,
            supportLevel,
            traits,
            score: Math.round(score),
            accuracy: finalAccuracy,
            duration,
            radarData, // Save the actual radar data used for the child
          },
        };
        if (gameId === GAME_IDS.EMOTION_MATCH) {
          payload.levelReached = rawData?.levelCompleted || rawData?.metadata?.levelsCompleted || rawData?.level || 0;
        }

        // --- NEW: Also save to Video Sessions (FaceCapture) if a video was recorded ---
        if (gameVideoUrl) {
          try {
            const videoPayload = new FormData();
            // We use a blob from the last recording if possible, but since we already uploaded,
            // we can just notify the backend to link it or send the same data.
            // For now, let's just make sure the analytics save is solid.
            console.log("🔗 Linking game video to clinical video sessions...");
          } catch (vErr) {
            console.warn("Clinical session linkage failed:", vErr);
          }
        }

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
      await stopGameplayRecorder();
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

    // Show review modal — skip for EmotionMatch which has its own built-in analysis screen
    if (gameId !== GAME_IDS.EMOTION_MATCH) {
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
    }

    console.log("✅ Review modal data set successfully!");
  };

  const renderContent = () => {
    switch (activeTab) {


      case "arcade":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold" style={{ color: colors.textPrimary }}>
                {t.arcade}
              </h3>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2 bg-light p-2 rounded-pill px-3 border shadow-sm">
                  <FaShieldAlt className={blurGameplay ? "text-success" : "text-muted"} />
                  <span className="small fw-bold" style={{ color: "#555" }}>Privacy Blur</span>
                  <Form.Check 
                    type="switch"
                    id="privacy-blur-switch"
                    checked={blurGameplay}
                    onChange={(e) => {
                      setBlurGameplay(e.target.checked);
                      speak(e.target.checked ? "Privacy Blur Enabled" : "Privacy Blur Disabled");
                    }}
                  />
                </div>
                <Badge style={{ backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: colors.borderColor }} className="border px-3 py-2">
                  6 {t.games_available}
                </Badge>
              </div>
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
                      <Card
                        className="h-100 border-0 shadow-sm rounded-4 overflow-hidden glass-card"
                        style={{
                          backgroundColor: colors.bgCard,
                          borderColor: colors.borderColor,
                        }}
                      >
                        <div
                          className="p-4 d-flex align-items-center"
                          style={{
                            backgroundColor: `${meta.hex}20`,
                            borderBottom: `1px solid ${colors.borderColor}`,
                          }}
                        >
                          <div style={{ color: meta.hex, fontSize: "2.5rem" }} className="me-3">
                            {meta.icon}
                          </div>
                          <div>
                            <h5 className="fw-bold mb-1" style={{ color: colors.textPrimary }}>
                              {t[meta.nameKey]}
                            </h5>
                          </div>
                        </div>
                        <Card.Body className="p-4">
                          <p style={{ color: colors.textSecondary }} className="small mb-4">
                            {t[meta.descKey]}
                          </p>
                          <div className="d-flex gap-2">
                            <Button
                              className="flex-grow-1 rounded-pill fw-bold"
                              style={{
                                backgroundColor: meta.hex,
                                borderColor: meta.hex,
                                color: "white",
                              }}
                              onClick={() => {
                                switch (String(gameId)) {
                                  case String(GAME_IDS.EMOTION_MATCH):
                                    setShowEmotionModal(true);
                                    break;
                                  case String(GAME_IDS.PATTERN_ADVENTURE):
                                    setShowPatternModal(true);
                                    break;
                                  case String(GAME_IDS.FACE_MIMIC):
                                    setShowCameraModal(true);
                                    break;
                                  case String(GAME_IDS.IMITATION_GAME):
                                    setShowImitationModal(true);
                                    break;
                                  case String(GAME_IDS.SOUND_SCAPE):
                                    setShowSoundScapeModal(true);
                                    break;
                                  case String(GAME_IDS.MAGIC_HANDS):
                                    setShowMagicHandsModal(true);
                                    break;
                                  default:
                                    console.log("Unknown gameId:", gameId);
                                }
                              }}
                            >
                              {t.play_now}
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
      case "videos":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Row>
              <Col md={12}>
                <VideoLibraryComponent />
              </Col>
            </Row>
          </motion.div>
        );
      case "analytics":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="fw-bold mb-4" style={{ color: colors.textPrimary }}>
              {t.overall_progress}
            </h3>
            <Alert
              style={{
                backgroundColor: `${colors.accentColor}20`,
                borderColor: colors.accentColor,
                color: colors.textPrimary,
              }}
            >
              {t.select_game_info}
            </Alert>
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
        if (data.sessions) {
          setRawSessions(data.sessions);
        }
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };

    fetchStats();
  }, [userProfile]);

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: colors.bgMain }}>
      <HandGestureOverlay enabled={handNavigation} />
      {/* --- SIDEBAR --- */}
      <div
        className="glass-panel d-flex flex-column p-4 sticky-top vh-100"
        style={{
          width: "280px",
          backgroundColor: colors.bgSidebar,
          borderRight: `1px solid ${colors.borderColor}`,
          color: colors.textPrimary,
        }}
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

        {/* Theme Selector */}
        <div className="mb-4 d-flex flex-column gap-2">
          <label className="small fw-bold ms-2" style={{ color: colors.textSecondary }}>
            Accessibility
          </label>
          <div className="d-flex flex-column gap-2 bg-light p-3 rounded-4 border">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <FaHandPaper className={handNavigation ? "text-info" : "text-muted"} size={14} />
                <span className="small fw-bold" style={{ color: "#555" }}>Hand Nav</span>
              </div>
              <Form.Check
                type="switch"
                id="hand-nav-switch-sidebar"
                checked={handNavigation}
                onChange={(e) => {
                  setHandNavigation(e.target.checked);
                  speak(e.target.checked ? "Hand Navigation Enabled" : "Hand Navigation Disabled");
                }}
              />
            </div>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="mb-4 d-flex flex-column gap-2">
          <label className="small fw-bold ms-2" style={{ color: colors.textSecondary }}>
            Color Theme
          </label>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {availableThemes.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleThemeChange(t.id)}
                className="rounded-circle p-2 border-2"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor:
                    theme === t.id
                      ? colors.accentColor
                      : colors.bgCard,
                  borderColor: theme === t.id ? colors.accentColor : colors.borderColor,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: theme === t.id ? `0 0 0 2px ${colors.textPrimary}` : "none",
                  fontSize: "10px",
                  color: theme === t.id ? "white" : colors.textSecondary,
                }}
                title={t.name}
              >
                {t.id.charAt(0).toUpperCase()}
              </motion.button>
            ))}
          </div>
        </div>

        <Nav className="flex-column sidebar-nav flex-grow-1 gap-2">

          <Nav.Link
            active={activeTab === "arcade"}
            onClick={() => {
              setActiveTab("arcade");
              speak(t.arcade);
            }}
            className="rounded-3 px-3 py-3"
            style={{
              color: activeTab === "arcade" ? colors.accentColor : colors.textSecondary,
              backgroundColor: activeTab === "arcade" ? colors.hoverBg : "transparent",
            }}
          >
            <FaGamepad className="sidebar-icon" /> {t.arcade}
          </Nav.Link>
          <Nav.Link
            active={activeTab === "videos"}
            onClick={() => setActiveTab("videos")}
            className="d-flex align-items-center px-4 py-3 mb-2 rounded-3 transition-all"
            style={{
              color: activeTab === "videos" ? "white" : colors.textSecondary,
              backgroundColor: activeTab === "videos" ? colors.accentColor : "transparent",
            }}
          >
            <FaVideo className="me-3" />
            <span className="fw-bold">{t.videos}</span>
          </Nav.Link>
        </Nav>

        <div className="mt-auto pt-4 border-top" style={{ borderTopColor: colors.borderColor }}>
          {/* VOICE TOGGLE */}
          <Button
            className="w-100 mb-3 d-flex align-items-center justify-content-center"
            onClick={toggleMute}
            style={{
              backgroundColor: isMuted ? colors.accentColor : "transparent",
              borderColor: colors.accentColor,
              color: isMuted ? "white" : colors.accentColor,
              border: `2px solid ${colors.accentColor}`,
            }}
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

          {/* FACE CAPTURE BUTTON */}
          <Button
            className="w-100 mb-3 d-flex align-items-center justify-content-center position-relative"
            onClick={() => setShowFaceCapture(!showFaceCapture)}
            style={{
              backgroundColor: showFaceCapture ? colors.accentColor : "transparent",
              borderColor: colors.accentColor,
              color: showFaceCapture ? "white" : colors.accentColor,
              border: `2px solid ${colors.accentColor}`,
            }}
          >
            <FaCamera className="me-2" />
            {showFaceCapture ? "Hide Camera" : "Face Analysis"}
            {faceCaptureStats.totalCaptures > 0 && (
              <Badge
                pill
                style={{
                  backgroundColor: colors.textPrimary,
                  color: colors.bgCard,
                }}
                className="position-absolute top-0 end-0 translate-middle"
              >
                {faceCaptureStats.totalCaptures}
              </Badge>
            )}
          </Button>

          <div className="d-flex align-items-center">
            <div
              className="rounded-circle p-2 text-white me-2"
              style={{ backgroundColor: colors.accentColor }}
            >
              <FaUserMd />
            </div>
            <div className="lh-1">
              <div className="fw-bold small" style={{ color: colors.textPrimary }}>
                {userProfile.name}
              </div>
              <small style={{ fontSize: "0.7rem", color: colors.textSecondary }}>
                {t.student_account}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div
        className="flex-grow-1 p-5 overflow-auto h-100"
        style={{ backgroundColor: colors.bgMain, color: colors.textPrimary }}
      >
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
            setSelectedAnalyticsGame(null);
          }}
          speak={speak}
          t={t}
          colors={colors}
        />
      )}
      {selectedAnalyticsGame &&
        selectedAnalyticsGame.id !== GAME_IDS.FACE_MIMIC && (
          <AnalyticsDashboard
            game={selectedAnalyticsGame}
            onClose={() => setSelectedAnalyticsGame(null)}
            t={t}
            colors={colors}
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
        <Modal.Header
          closeButton
          className="border-0"
          style={{
            backgroundColor: colors.bgCard,
            borderBottomColor: colors.borderColor,
          }}
        >
          <Modal.Title style={{ color: colors.textPrimary }}>
            {t.game_emotion}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: colors.bgCard }}>
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
        <Modal.Body style={{ backgroundColor: colors.bgCard }}>
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
                setShowCameraModal(false);
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
              onComplete={(d) => {
                processGameResult(GAME_IDS.IMITATION_GAME, d);
                setShowImitationModal(false);
              }}
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
              onComplete={(d) => {
                processGameResult(GAME_IDS.SOUND_SCAPE, d);
                setShowSoundScapeModal(false);
              }}
              onClose={() => setShowSoundScapeModal(false)}
              speak={speak}
              t={t}
            />
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showMagicHandsModal}
        onHide={() => setShowMagicHandsModal(false)}
        fullscreen
      >
        <Modal.Body className="p-0 bg-dark">
          {showMagicHandsModal && (
            <MagicHandsGame
              onComplete={(d) => {
                processGameResult(GAME_IDS.MAGIC_HANDS, d);
                setShowMagicHandsModal(false);
              }}
              onClose={() => setShowMagicHandsModal(false)}
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
          <Card
            className="border-0 shadow-lg rounded-4 overflow-hidden"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
          >
            <Card.Header
              className="d-flex justify-content-between align-items-center"
              style={{
                backgroundColor: colors.accentColor,
                color: "white",
              }}
            >
              <span className="fw-bold">
                <FaCamera className="me-2" />
                Face Analysis
              </span>
              <Button
                size="sm"
                className="rounded-circle p-1"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  border: "none",
                  color: "white",
                }}
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
            <Card.Footer
              className="text-center"
              style={{
                backgroundColor: colors.bgMain,
                borderTopColor: colors.borderColor,
              }}
            >
              <small style={{ color: colors.textSecondary }}>
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
