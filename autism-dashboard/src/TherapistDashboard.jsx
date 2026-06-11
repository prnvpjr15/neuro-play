import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import axios from "axios";
import {
  Card,
  Row,
  Col,
  Badge,
  Button,
  Form,
  Nav,
  Tab,
  Tabs,
  ProgressBar,
} from "react-bootstrap";
import {
  FaBrain,
  FaUserMd,
  FaSync,
  FaFolder,
  FaChartBar,
  FaVideo,
  FaGamepad,
  FaHistory,
  FaChevronLeft,
  FaCog,
  FaTimes,
  FaPlay,
  FaChartPie,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  .tvd-wrapper { 
    display: flex;
    min-height: 100vh;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    transition: all 0.3s ease;
    background-attachment: fixed;
  }

  /* --- Sidebar --- */
  .tvd-sidebar {
    width: 280px;
    height: 100vh;
    position: sticky;
    top: 0;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(128,128,128,0.1);
    z-index: 100;
    backdrop-filter: blur(10px);
  }

  .tvd-logo-area {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 2.5rem;
    color: inherit;
  }

  .tvd-logo-icon {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, #4f8ed9, #6a11cb);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white !important;
    box-shadow: 0 4px 15px rgba(79, 142, 217, 0.3);
  }

  .tvd-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0.85rem 1.25rem;
    border-radius: 12px;
    color: inherit;
    text-decoration: none;
    margin-bottom: 0.5rem;
    transition: all 0.2s ease;
    opacity: 0.7;
    font-weight: 600;
    cursor: pointer;
  }

  .tvd-nav-item.active {
    opacity: 1;
    background: rgba(79, 142, 217, 0.15);
    color: #4f8ed9 !important;
    box-shadow: inset 0 0 0 1px rgba(79, 142, 217, 0.2);
  }

  .tvd-nav-item:hover:not(.active) {
    opacity: 1;
    background: rgba(128,128,128,0.08);
  }

  /* --- Main Content --- */
  .tvd-main {
    flex: 1;
    padding: 2.5rem;
    max-width: 1600px;
    margin: 0 auto;
    width: 100%;
    color: inherit;
  }

  h1, h2, h3, h4, h5 {
    font-weight: 800;
    letter-spacing: -0.02em;
    color: inherit;
    /* Extra contrast for high-brightness themes */
    text-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  .tvd-stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }

  .tvd-stat-card {
    padding: 1.5rem;
    border-radius: 16px;
    background: rgba(128,128,128,0.05);
    border: 1px solid rgba(128,128,128,0.1);
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease, background 0.3s;
    color: inherit;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  }

  .tvd-stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: var(--accent);
  }

  .tvd-stat-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 1px;
    color: inherit;
    opacity: 0.6;
    margin-bottom: 0.5rem;
  }

  .tvd-stat-value {
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1;
    color: inherit;
  }

  /* --- Table Styles --- */
  .tvd-table-card {
    background: rgba(128,128,128,0.03);
    border-radius: 20px;
    border: 1px solid rgba(128,128,128,0.1);
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
  }

  .tvd-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 8px;
  }

  .tvd-table th {
    padding: 1.25rem 1rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: inherit;
    opacity: 0.5;
    font-weight: 700;
    border-bottom: 1px solid rgba(128,128,128,0.1);
  }

  .tvd-table td {
    padding: 1.25rem 1rem;
    background: rgba(128,128,128,0.04);
    border-top: 1px solid rgba(128,128,128,0.03);
    border-bottom: 1px solid rgba(128,128,128,0.03);
    color: inherit;
  }

  .tvd-table tr td:first-child { border-radius: 12px 0 0 12px; }
  .tvd-table tr td:last-child { border-radius: 0 12px 12px 0; }

  .tvd-table tr:hover td {
    background: rgba(128,128,128,0.08);
  }

  .tvd-btn-review {
    background: #4f8ed9;
    border: none;
    color: white !important;
    padding: 0.6rem 1.4rem;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(79, 142, 217, 0.2);
  }

  .tvd-btn-review:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 142, 217, 0.4);
    filter: brightness(1.1);
  }

  .tvd-badge {
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .tvd-badge.pending { background: rgba(255, 193, 7, 0.15); color: #b48a00; border: 1px solid rgba(255, 193, 7, 0.3); }
  .tvd-badge.reviewed { background: rgba(40, 167, 69, 0.15); color: #1e7e34; border: 1px solid rgba(40, 167, 69, 0.3); }
  .tvd-badge.engagement { background: rgba(128,128,128,0.1); color: inherit; border: 1px solid rgba(128,128,128,0.2); }

  /* Folder Cards */
  .tvd-folder {
    background: rgba(128,128,128,0.05);
    border: 1px solid rgba(128,128,128,0.1);
    border-radius: 18px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: inherit;
  }

  .tvd-folder:hover {
    transform: translateY(-6px);
    background: rgba(128,128,128,0.08);
    border-color: #4f8ed9;
    box-shadow: 0 12px 30px rgba(0,0,0,0.05);
  }

  .tvd-video-wrap { 
    background: #000; border-radius: 15px; overflow: hidden; border: 1px solid rgba(128,128,128,0.2);
    position: relative; width: 100%; aspect-ratio: 16 / 9;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  }
  .tvd-video-wrap video { width: 100%; height: 100%; object-fit: contain; }

  .tvd-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
    z-index: 1000; display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .tvd-modal-content {
    background: #0b0e14; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 28px; width: 100%; max-width: 1150px;
    max-height: 92vh; overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: 0 30px 60px rgba(0,0,0,0.6);
    color: white !important;
  }

  /* Custom tabs */
  .custom-tabs .nav-link {
    color: inherit; opacity: 0.5; border: none;
    padding: 1.25rem 2rem; font-weight: 700; font-size: 0.9rem;
    transition: all 0.3s;
  }
  .custom-tabs .nav-link.active {
    background: transparent !important; color: inherit !important;
    opacity: 1;
    border-bottom: 4px solid #4f8ed9;
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const safeParse = (data, fallback) => {
  if (!data || data === "null" || data === "undefined") return fallback;
  if (typeof data === "object") return data;
  try {
    let p = JSON.parse(data);
    if (typeof p === "string") p = JSON.parse(p);
    return p;
  } catch {
    return fallback;
  }
};

// ─── Clinical Logic Helpers ──────────────────────────────────────────────────
// recalc removed as attention is no longer tracked in dashboard


/**
 * Game Logic Explanation:
 * - Accuracy: Percentage of correct actions vs total moves. Indicates cognitive precision.
 * - Processing Speed: Inverse of time taken per match/action. Indicates neural processing efficiency.
 * - Persistence: Based on level reached vs time spent. Indicates frustration tolerance.
 */
const getGameAnalysis = (game) => {
  const meta = game.metadata || {};
  const accuracy = game.accuracy || meta.accuracy || (game.score > 0 ? 75 : 0);
  
  return [
    { label: "Accuracy Score", value: accuracy, color: scoreHex(accuracy), desc: "Percentage of correct moves vs total attempts." },
  ];
};

const getRadarData = (game, previousGame = null) => {
  const meta = game.metadata || {};
  const prevMeta = previousGame?.metadata || {};
  
  const score = game.score || meta.score || 0;
  const duration = game.duration || meta.timeSpent || meta.duration || 60;
  const acc = game.accuracy || meta.accuracy || 0;
  const level = game.levelReached || meta.level || 1;
  const moves = meta.moves || 0;

  const prevScore = previousGame?.score || prevMeta.score || 0;
  const prevAcc = previousGame?.accuracy || prevMeta.accuracy || 0;

  // --- DYNAMIC SCALING ---
  // standardizes different game point systems to a 0-100 normalized scale for the radar.
  let maxScore = 100; // Default to 100 for games that send percentages (Sound Scape, Magic Hands, Pattern)
  if (game.gameName === "Imitation Game") maxScore = 800;
  if (game.gameName === "Emotion Match") maxScore = 12; // Sending raw matches (max 12)
  if (game.gameName === "Face Mimic") maxScore = 400; // 4 emotions * 100 points

  // Moves Efficiency Logic (Optimal Moves / Actual Moves)
  let minMoves = 0;
  if (game.gameName === "Emotion Match") {
    minMoves = level === 1 ? 4 : level === 2 ? 8 : 12;
  } else {
    minMoves = moves > 0 ? Math.max(1, Math.floor(moves * 0.7)) : 10;
  }
  const movesEfficiency = moves > 0 ? Math.min(100, Math.round((minMoves / moves) * 100)) : 0;
  
  const scoreNorm = Math.min(100, (score / maxScore) * 100);
  const accNorm = acc;
  const levelNorm = Math.min(100, (level / (game.gameName === "Pattern Adventure" ? 10 : 5)) * 100);
  const durationNorm = Math.min(100, (duration / 300) * 100);

  return [
    { 
      subject: 'Score', 
      A: scoreNorm, 
      B: previousGame ? Math.min(100, (prevScore / maxScore) * 100) : 0,
      fullMark: 100, 
      trueValue: Math.round(score), 
      trend: score > prevScore ? 'up' : score < prevScore ? 'down' : 'stable',
      diff: Math.round(score - prevScore),
      helpText: "Total achievement points earned."
    },
    { 
      subject: 'Accuracy', 
      A: accNorm, 
      B: previousGame ? prevAcc : 0,
      fullMark: 100, 
      trueValue: `${acc}%`,
      trend: acc > prevAcc ? 'up' : acc < prevAcc ? 'down' : 'stable',
      diff: Math.round(acc - prevAcc),
      helpText: "Precision and success rate."
    },
    { 
      subject: 'Level', 
      A: levelNorm, 
      B: previousGame ? Math.min(100, (previousGame.levelReached / 5) * 100) : 0,
      fullMark: 100, 
      trueValue: level,
      trend: level > (previousGame?.levelReached || 0) ? 'up' : level < (previousGame?.levelReached || 0) ? 'down' : 'stable'
    },
    { 
      subject: 'Duration', 
      A: durationNorm, 
      B: previousGame ? Math.min(100, ((previousGame.duration || prevMeta.duration || 60) / 300) * 100) : 0,
      fullMark: 100, 
      trueValue: `${Math.round(duration)}s`,
      trend: duration < (previousGame?.duration || 1000) ? 'up' : 'down'
    },
    { 
      subject: 'Moves', 
      A: movesEfficiency, 
      B: previousGame ? Math.min(100, ((prevMeta.moves || 0) / 50) * 100) : 0, // Fallback for old data
      fullMark: 100, 
      trueValue: `${movesEfficiency}%`,
      helpText: "Efficiency (Optimal / Actual moves)."
    },
  ];
};

const scoreColor = (s) => (Number(s) > 70 ? "success" : Number(s) > 40 ? "warning" : "danger");
const scoreHex = (s) => (Number(s) > 70 ? "#34d399" : Number(s) > 40 ? "#fbbf24" : "#f87171");
const fmt = (n) => Math.round(Number(n) || 0);
const fmtDur = (s) => {
  const sec = Number(s) || 0;
  return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;
};
const getGameDescription = (gameName) => {
  const desc = {
    "Emotion Match": {
      purpose: "Emotional Recognition & Memory",
      detail: "Trains the patient to identify and match facial expressions with their corresponding emotions, improving social empathy and short-term memory."
    },
    "Pattern Adventure": {
      purpose: "Cognitive Logic & Sequencing",
      detail: "Focuses on visual pattern recognition and logical sequencing, helping the patient follow multi-step cognitive instructions."
    },
    "Face Mimic": {
      purpose: "Facial Motor Control & Empathy",
      detail: "Encourages mirroring of facial expressions to improve muscle control and the physiological understanding of emotional states."
    },
    "Imitation Game": {
      purpose: "Gross Motor Coordination",
      detail: "Develops body awareness and the ability to follow physical movements, targeting proprioception and coordination."
    },
    "Sound Scape": {
      purpose: "Auditory Processing & Focus",
      detail: "Trains auditory localization and sound distinction, helping patients process complex sensory environments."
    },
    "Magic Hands": {
      purpose: "Fine Motor & Hand-Eye Coordination",
      detail: "Uses gesture-based interaction to improve precise hand movements and visual-motor integration."
    }
  };
  return desc[gameName] || { purpose: "General Skill Development", detail: "Focuses on cognitive engagement and response consistency." };
};

const absMediaUrl = (u) => {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `http://localhost:4000${u}`;
};

// ─── Component ────────────────────────────────────────────────────────────────
const TherapistDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, colors, changeTheme, availableThemes } = useTheme();
  const therapistId = user?._id || "Therapist_Main";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("patients");
  const [searchTerm, setSearchTerm] = useState("");

  // Review state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [notes, setNotes] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameNotes, setGameNotes] = useState("");
  const [savingGame, setSavingGame] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    if (therapistId) fetchVideos();
  }, [therapistId]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data: videoData } = await axios.get(`http://localhost:4000/api/facecapture/videos/therapist/${therapistId}`);
      const rawVideos = Array.isArray(videoData) ? videoData : [];
      const processedVideos = rawVideos.map((v) => {
        const gazeData = safeParse(v.gazeData, []);
        const gazeSummary = safeParse(v.gazeSummary, { avgAttentionScore: 0, faceDetectionRate: 0, engagementLevel: "N/A" });
        return { ...v, type: "video", gazeData, gazeSummary };
      });

      let gameSessions = [];
      try {
        const { data: gameData } = await axios.get(`http://localhost:4000/api/analytics/therapist/${therapistId}`);
        if (Array.isArray(gameData)) gameSessions = gameData.map(g => ({ ...g, type: 'game', timestamp: g.playedAt || g.timestamp }));
      } catch (e) { console.error("Game fetch error", e); }

      const allSessions = [...processedVideos, ...gameSessions];
      const cleanSessions = allSessions.filter(v => {
        const uname = (v.username || v.userId || "").toLowerCase();
        return uname !== "explorer" && uname !== "unknown" && uname !== "";
      });
      setVideos(cleanSessions);
    } catch (e) {
      console.error("Fetch failed:", e);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const patientFolders = React.useMemo(() => {
    const map = {};
    videos.forEach((v) => {
      const uname = v.username || v.userId || "unknown";
      if (!map[uname]) map[uname] = { sessions: [], username: uname };
      map[uname].sessions.push(v);
    });

    return Object.values(map).map((data) => {
      const videoSessions = data.sessions.filter((s) => s.type === "video");
      const gameSessions = data.sessions.filter((s) => s.type === "game");
      return {
        username: data.username,
        sessions: data.sessions,
        latest: data.sessions[0]?.timestamp,
        pending: videoSessions.filter((v) => !v.reviewed).length + gameSessions.filter(g => !g.reviewed).length,
        videoCount: videoSessions.length,
        gameCount: gameSessions.length,
      };
    }).sort((a, b) => new Date(b.latest) - new Date(a.latest));
  }, [videos]);

  const patientSessions = selectedPatient ? videos.filter((v) => (v.username || v.userId) === selectedPatient) : [];
  const patientVideos = patientSessions.filter(s => s.type === 'video');
  const patientGames = patientSessions.filter(s => s.type === 'game');
  const currentFolder = patientFolders.find(f => f.username === selectedPatient);

  const [viewRaw, setViewRaw] = useState(false);

  const openVideo = (v) => { setSelectedVideo(v); setNotes(v.therapistNotes || ""); setBookmarks(v.highlights || []); };
  const openGame = (g) => { 
    const patientSessions = videos.filter((v) => (v.username || v.userId) === (g.username || g.userId));
    const gameHistory = patientSessions.filter(s => s.type === 'game' && s.gameName === g.gameName).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const currentIndex = gameHistory.findIndex(s => s._id === g._id);
    const previousGame = currentIndex < gameHistory.length - 1 ? gameHistory[currentIndex + 1] : null;
    
    setSelectedGame({ ...g, previousGame }); 
    setGameNotes(g.therapistNotes || ""); 
  };

  const saveAnalysis = async () => {
    if (!selectedVideo) return;
    setSaving(true);
    try {
      await axios.post(`http://localhost:4000/api/facecapture/videos/${selectedVideo._id}/analyze`, {
        therapistNotes: notes, bookmarks, reviewed: true, reviewedBy: therapistId, reviewedAt: new Date(),
      });
      await fetchVideos();
      setSelectedVideo(null);
    } catch { alert("Failed to save analysis"); } finally { setSaving(false); }
  };

  const saveGameReview = async () => {
    if (!selectedGame) return;
    setSavingGame(true);
    try {
      await axios.post(`http://localhost:4000/api/analytics/review/${selectedGame._id}`, {
        therapistNotes: gameNotes, reviewed: true, reviewedBy: therapistId, reviewedAt: new Date(),
      });
      await fetchVideos();
      setSelectedGame(null);
    } catch { alert("Failed to save review"); } finally { setSavingGame(false); }
  };

  const totalVideoSessions = videos.filter((v) => v.type === "video").length;
  const totalGameSessions = videos.filter((v) => v.type === "game").length;

  return (
    <div className="tvd-wrapper" style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <style>{styles}</style>

      {/* --- SIDEBAR --- */}
      <div className="tvd-sidebar" style={{ backgroundColor: colors.bgSidebar }}>
        <div className="tvd-logo-area">
          <div className="tvd-logo-icon"><FaBrain size={22} /></div>
          <div className="h4 fw-bold mb-0">NeuroPlay</div>
        </div>

        <div className="mb-4">
          <div className="small fw-bold opacity-40 mb-3 px-2">Theme</div>
          <div className="d-flex flex-wrap gap-2 px-1">
            {availableThemes.map((t) => (
              <button key={t.id} onClick={() => changeTheme(t.id)} className="rounded-circle border-0 shadow-sm" style={{ width: "32px", height: "32px", backgroundColor: t.id === theme ? colors.accentColor : 'rgba(255,255,255,0.05)', color: t.id === theme ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 800 }}>{t.id.charAt(0).toUpperCase()}</button>
            ))}
          </div>
        </div>

        <Nav className="flex-column gap-1">
          <button className={`tvd-nav-item border-0 bg-transparent text-start w-100 ${activeTab === 'patients' && !selectedPatient ? 'active' : ''}`} onClick={() => { setActiveTab('patients'); setSelectedPatient(null); }}>
            <FaHistory /> Home
          </button>

          <button className={`tvd-nav-item border-0 bg-transparent text-start w-100 ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <FaCog /> Settings
          </button>
        </Nav>

        <div className="mt-auto"><Button variant="outline-danger" className="w-100 rounded-pill py-2 fw-bold" onClick={logout}>Logout</Button></div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="tvd-main">
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 opacity-50">
             <div className="spinner-border text-primary mb-3" />
             <div className="fw-bold" style={{ color: colors.textPrimary }}>Securing Vault Data...</div>
          </div>

        ) : activeTab === 'settings' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <h1 className="fw-800 mb-4" style={{ color: colors.textPrimary }}>Therapist Settings</h1>
             <Card className="border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }}>
                <h5 className="fw-bold mb-4">Account Configuration</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Clinical Name</Form.Label>
                  <Form.Control type="text" readOnly value={user?.username || "Therapist"} className="bg-dark text-white border-secondary" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Assigned Therapist ID</Form.Label>
                  <Form.Control type="text" readOnly value={therapistId} className="bg-dark text-white border-secondary" />
                </Form.Group>
                <hr className="my-4 opacity-10" />
                <Button variant="primary" disabled>Update Profile</Button>
             </Card>
          </motion.div>
        ) : !selectedPatient ? (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <h1 className="fw-800 mb-1" style={{ color: colors.textPrimary }}>Patient Session Vault</h1>
                <div className="small fw-500" style={{ color: colors.textPrimary, opacity: 0.6 }}>
                  {patientFolders.length} patients • {totalVideoSessions} video sessions • {totalGameSessions} game sessions
                </div>
              </div>
              <Button variant="dark" size="sm" className="rounded-pill px-4 border border-secondary" style={{ backgroundColor: colors.bgCard, color: colors.textPrimary }} onClick={fetchVideos}>
                 <FaSync className="me-2" /> Refresh
              </Button>
            </div>

            <div className="tvd-stat-grid">
              <div className="tvd-stat-card" style={{ "--accent": "#6a11cb", color: colors.textPrimary }}>
                <div className="tvd-stat-label">Patients</div>
                <div className="tvd-stat-value">{patientFolders.length}</div>
              </div>
              <div className="tvd-stat-card" style={{ "--accent": "#00d2ff", color: colors.textPrimary }}>
                <div className="tvd-stat-label">Video Sessions</div>
                <div className="tvd-stat-value">{totalVideoSessions}</div>
              </div>
              <div className="tvd-stat-card" style={{ "--accent": "#ff00ff", color: colors.textPrimary }}>
                <div className="tvd-stat-label">Game Sessions</div>
                <div className="tvd-stat-value">{totalGameSessions}</div>
              </div>
              <div className="tvd-stat-card" style={{ "--accent": "#ffbf00", color: colors.textPrimary }}>
                <div className="tvd-stat-label">Reviewed Sessions</div>
                <div className="tvd-stat-value">{videos.filter(v => v.reviewed).length}</div>
              </div>
            </div>

            <h4 className="fw-bold mb-4" style={{ color: colors.textPrimary, opacity: 0.75 }}>Patient Records</h4>
            <Row className="g-4">
              {patientFolders.map((p) => (
                <Col key={p.username} xl={3} lg={4} md={6}>
                  <div className="tvd-folder" onClick={() => setSelectedPatient(p.username)} style={{ color: colors.textPrimary }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                       <FaFolder size={32} style={{ color: colors.accentColor }} className="opacity-40" />
                       {p.pending > 0 && <Badge bg="danger" className="rounded-pill">{p.pending}</Badge>}
                    </div>
                    <h5 className="fw-bold mb-1">{p.username}</h5>
                    <div className="small mb-3" style={{ opacity: 0.5 }}>{p.videoCount + p.gameCount} Total Sessions</div>
                    <div className="d-flex align-items-center gap-2 pt-3 border-top border-secondary" style={{ opacity: 0.75 }}>
                        <FaHistory size={12} />
                        <span className="small fw-bold">Active Records</span>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="d-flex align-items-center mb-4 gap-3">
              <Button variant="link" onClick={() => setSelectedPatient(null)} className="p-0 text-decoration-none d-flex align-items-center gap-2" style={{ color: colors.accentColor }}>
                <FaChevronLeft /> All Patients
              </Button>
              <div className="h4 fw-bold mb-0" style={{ color: colors.textPrimary }}>/ {selectedPatient}</div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div className="d-flex align-items-center gap-3">
                  <Badge bg="dark" className="p-2 px-3 border border-secondary fw-bold shadow-sm"><FaVideo className="me-2" style={{ color: '#00d2ff' }}/> {patientVideos.length} videos</Badge>
                  <Badge bg="dark" className="p-2 px-3 border border-secondary fw-bold shadow-sm"><FaGamepad className="me-2" style={{ color: '#ff00ff' }}/> {patientGames.length} games</Badge>
               </div>
                <div className="d-flex align-items-center gap-3">
                   <Badge bg="danger" className="p-2 px-3 fw-bold shadow-sm">{currentFolder?.pending} pending</Badge>
                </div>
            </div>

            <Tabs defaultActiveKey="videos" className="mb-4 custom-tabs">
              <Tab eventKey="videos" title="Video Sessions">
                <div className="tvd-table-card" style={{ color: colors.textPrimary }}>
                  <table className="tvd-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date & Time</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientVideos.map((v, idx) => (
                        <tr key={v._id || idx}>
                          <td style={{ opacity: 0.3 }}>#{patientVideos.length - idx}</td>
                          <td className="fw-bold">{new Date(v.timestamp).toLocaleString()}</td>
                          <td style={{ opacity: 0.7 }}>{fmtDur(v.duration)}</td>
                          <td><span className={`tvd-badge ${v.reviewed ? 'reviewed' : 'pending'}`}>{v.reviewed ? 'Reviewed' : 'Pending'}</span></td>
                          <td>
                            <button className="tvd-btn-review" onClick={() => openVideo(v)}>
                               <FaPlay size={10}/> Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Tab>
              <Tab eventKey="games" title="Game Sessions">
                <div className="tvd-table-card" style={{ color: colors.textPrimary }}>
                  <table className="tvd-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Game Name</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientGames.map((g, idx) => (
                        <tr key={g._id || idx}>
                          <td className="fw-bold">{new Date(g.timestamp).toLocaleString()}</td>
                          <td><Badge bg="primary" className="rounded-pill px-3 shadow-sm">{g.gameName}</Badge></td>
                          <td className="fw-bold">{g.score}</td>
                          <td><span className={`tvd-badge ${g.reviewed ? 'reviewed' : 'pending'}`}>{g.reviewed ? 'Reviewed' : 'Pending'}</span></td>
                          <td>
                            <button className="tvd-btn-review" onClick={() => openGame(g)}>
                               <FaPlay size={10}/> Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Tab>
            </Tabs>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <div className="tvd-modal-overlay" onClick={() => setSelectedVideo(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="tvd-modal-content shadow-lg" onClick={e => e.stopPropagation()}>
               <div className="p-4 border-bottom border-secondary d-flex justify-content-between align-items-center"><div><h5 className="fw-bold mb-0">Clinical Session Review</h5><div className="small opacity-50">{selectedVideo.username} · {new Date(selectedVideo.timestamp).toLocaleString()}</div></div><Button variant="link" className="text-white opacity-50 p-0" onClick={() => setSelectedVideo(null)}><FaTimes size={24}/></Button></div>
               <div className="d-flex flex-grow-1 overflow-hidden">
                  <div className="flex-grow-1 p-4 overflow-auto border-end border-secondary"><div className="tvd-video-wrap mb-4 bg-black"><video ref={videoRef} controls src={`http://localhost:4000/api/facecapture/video/stream/${selectedVideo._id}`} className="w-100 h-100" /></div></div>
                  <div className="p-4 overflow-auto" style={{ width: 350 }}><h6 className="fw-bold small text-uppercase opacity-50 mb-3">Therapist Notes</h6><Form.Control as="textarea" rows={8} className="bg-dark text-white border-secondary mb-4" placeholder="Enter clinical observations..." value={notes} onChange={e => setNotes(e.target.value)} /><Button variant="primary" className="w-100 py-2 fw-bold" onClick={saveAnalysis} disabled={saving}>{saving ? 'Saving...' : 'Mark as Reviewed'}</Button></div>
               </div>
            </motion.div>
          </div>
        )}
        {selectedGame && (
          <div className="tvd-modal-overlay" onClick={() => setSelectedGame(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="tvd-modal-content" onClick={e => e.stopPropagation()}>
               <div className="p-4 border-bottom border-secondary d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold mb-0">Clinical Game Analysis</h5>
                    <div className="small opacity-50">{selectedGame.username} · {selectedGame.gameName} · {new Date(selectedGame.timestamp).toLocaleString()}</div>
                  </div>
                  <Button variant="link" className="text-white opacity-50 p-0" onClick={() => setSelectedGame(null)}><FaTimes size={24}/></Button>
               </div>
               <div className="p-4 bg-primary bg-opacity-10 border-bottom border-secondary border-opacity-25">
                  <div className="d-flex align-items-center gap-3">
                     <div className="tvd-logo-icon" style={{ width: 40, height: 40, background: '#4f8ed9' }}><FaBrain size={20}/></div>
                     <div>
                        <div className="fw-800 small text-uppercase" style={{ color: '#4f8ed9', letterSpacing: '1px' }}>
                           Objective: {getGameDescription(selectedGame.gameName).purpose}
                        </div>
                        <div className="small opacity-75 fw-500">
                           {getGameDescription(selectedGame.gameName).detail}
                        </div>
                     </div>
                  </div>
               </div>
               <div className="d-flex flex-grow-1 overflow-hidden">
                  <div className="flex-grow-1 p-4 overflow-auto border-end border-secondary">
                    {selectedGame.gameVideoUrl ? (
                      <div className="tvd-video-wrap bg-black mb-4">
                        <video controls src={absMediaUrl(selectedGame.gameVideoUrl)} className="w-100 h-100" />
                      </div>
                    ) : (
                      <div className="p-5 text-center bg-dark rounded-4 mb-4 border border-secondary opacity-50">
                        <FaGamepad size={48} className="mb-3" />
                        <div>Behavioral video not recorded for this session</div>
                      </div>
                    )}
                    <Card className="bg-dark border-secondary overflow-hidden">
                      <Card.Header className="bg-transparent border-secondary py-3 d-flex justify-content-between align-items-center">
                        <span className="small fw-bold text-uppercase opacity-50">Session Metrics Summary</span>
                        <Badge bg="primary" className="opacity-75">Session Comparison</Badge>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <div className="p-4 w-100">
                           <div className="d-flex justify-content-between align-items-center mb-4">
                              <h6 className="small fw-bold text-uppercase opacity-40 mb-0">Metric Deep Dive</h6>
                              {selectedGame.previousGame && (
                                <Badge bg="dark" className="border border-secondary opacity-50" style={{ fontSize: '10px' }}>
                                  Compared to {new Date(selectedGame.previousGame.timestamp).toLocaleDateString()}
                                </Badge>
                              )}
                           </div>
                           <div className="row g-3">
                             {getRadarData(selectedGame, selectedGame.previousGame).map(pt => (
                               <div key={pt.subject} className="col-12">
                                 <div className="p-3 rounded-4 border border-secondary" style={{ background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s ease' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                       <div className="d-flex align-items-center gap-2">
                                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f8ed9' }} />
                                          <div className="d-flex flex-column">
                                              <span className="fw-bold opacity-75">{pt.subject}</span>
                                              {pt.helpText && <small className="opacity-40" style={{ fontSize: '9px' }}>{pt.helpText}</small>}
                                           </div>
                                       </div>
                                       <div className="text-end">
                                          <div className="h5 mb-0 fw-800" style={{ color: '#4f8ed9' }}>
                                              {pt.subject === 'Level' ? pt.trueValue : pt.trueValue}
                                          </div>
                                       </div>
                                    </div>
                                    
                                    <ProgressBar now={pt.A} style={{ height: 4, background: 'rgba(255,255,255,0.05)', marginBottom: '10px' }} />

                                    <div className="d-flex justify-content-between align-items-center">
                                       <div className="d-flex align-items-center gap-2">
                                          {pt.trend === 'up' && <Badge bg="success" className="p-1 px-2" style={{ fontSize: '9px', borderRadius: '4px' }}>↑ BETTER</Badge>}
                                          {pt.trend === 'down' && <Badge bg="danger" className="p-1 px-2" style={{ fontSize: '9px', borderRadius: '4px' }}>↓ LOWER</Badge>}
                                          {pt.trend === 'stable' && <Badge bg="secondary" className="p-1 px-2" style={{ fontSize: '9px', borderRadius: '4px' }}>↔ STABLE</Badge>}
                                          {pt.diff !== undefined && pt.diff !== 0 && (
                                            <span className={`small fw-bold ${pt.diff > 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                                              {pt.diff > 0 ? `+${pt.diff}` : pt.diff} vs previous
                                            </span>
                                          )}
                                       </div>
                                       <div className="small opacity-30 fw-bold" style={{ fontSize: '10px' }}>RAW METRIC</div>
                                    </div>
                                 </div>
                               </div>
                             ))}
                           </div>
                           
                           {/* --- CLINICAL INSIGHTS (As shown to User) --- */}
                           {selectedGame.metadata && selectedGame.metadata.feedback && (
                             <div className="mt-4 p-4 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-20 shadow-sm">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                   <div>
                                      <h6 className="small fw-bold text-uppercase opacity-50 mb-1">Clinical Interpretation</h6>
                                      <div className="h5 fw-bold mb-0">{selectedGame.metadata.supportLevel || 'Independent'}</div>
                                   </div>
                                   <div className="d-flex gap-1">
                                      {selectedGame.metadata.traits && selectedGame.metadata.traits.map((t, i) => (
                                        <Badge key={i} bg="primary" className="opacity-75">{t}</Badge>
                                      ))}
                                   </div>
                                </div>
                                <p className="mb-0 text-white opacity-75 italic" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                   "{selectedGame.metadata.feedback}"
                                </p>
                             </div>
                           )}

                           {/* --- GAME SPECIFIC METADATA BREAKDOWN --- */}
                           {selectedGame.metadata && (selectedGame.metadata.emotionPerformance || selectedGame.metadata.poseBreakdown || selectedGame.metadata.posesMatched !== undefined) && (
                             <div className="mt-4 pt-4 border-top border-secondary border-opacity-25">
                                <h6 className="small fw-bold text-uppercase opacity-40 mb-3">Session Breakdown</h6>
                                {selectedGame.metadata.emotionPerformance && (
                                  <div className="d-flex flex-wrap gap-2">
                                    {selectedGame.metadata.emotionPerformance.map((ep, i) => (
                                      <Badge key={i} bg="dark" className="border border-secondary p-2 d-flex flex-column align-items-start" style={{ minWidth: '80px' }}>
                                        <small className="opacity-50" style={{ fontSize: '9px' }}>{ep.emotion}</small>
                                        <span className="fw-bold">{Math.round(ep.timeTaken / 1000)}s</span>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                {selectedGame.metadata.poseBreakdown && (
                                  <div className="d-flex flex-wrap gap-2 mt-2">
                                    {selectedGame.metadata.poseBreakdown.map((pb, i) => (
                                      <Badge key={i} bg="dark" className="border border-secondary p-2 d-flex flex-column align-items-start" style={{ minWidth: '80px' }}>
                                        <small className="opacity-50" style={{ fontSize: '9px' }}>{pb.poseId.replace('_', ' ')}</small>
                                        <span className="fw-bold">{Math.round(pb.timeTaken / 1000)}s</span>
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* --- RAW DATA VERIFICATION (For Transparency) --- */}
                                <div className="mt-4 pt-4 border-top border-secondary border-opacity-25">
                                   <Button 
                                     variant="outline-secondary" 
                                     size="sm" 
                                     className="w-100 d-flex justify-content-between align-items-center opacity-50 border-secondary"
                                     onClick={() => setViewRaw(!viewRaw)}
                                   >
                                     <span className="small fw-bold text-uppercase">Raw Data Verification</span>
                                     <small>{viewRaw ? 'Hide' : 'Show JSON'}</small>
                                   </Button>
                                   
                                   {viewRaw && (
                                     <div className="mt-3 p-3 rounded-3 bg-black border border-secondary" style={{ maxHeight: '200px', overflow: 'auto' }}>
                                       <pre className="small text-info mb-0" style={{ fontSize: '10px' }}>
                                         {JSON.stringify({
                                           score: selectedGame.score,
                                           accuracy: selectedGame.accuracy,
                                           duration: selectedGame.duration,
                                           level: selectedGame.levelReached,
                                           metadata: selectedGame.metadata
                                         }, null, 2)}
                                       </pre>
                                     </div>
                                   )}
                                </div>
                                {selectedGame.metadata.posesMatched !== undefined && (
                                  <div className="p-3 mt-3 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-20">
                                     <div className="small fw-bold mb-1">Imitation Precision</div>
                                     <div className="h4 fw-800 mb-0">{selectedGame.metadata.posesMatched} / {selectedGame.metadata.totalPoses || 8} Poses</div>
                                     <small className="opacity-75">Calculated Accuracy: {Math.round(selectedGame.accuracy || selectedGame.metadata.accuracy || 0)}%</small>
                                  </div>
                                )}
                             </div>
                           )}
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="p-4 overflow-auto" style={{ width: 350 }}>
                    <div className="mb-4 p-3 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25">
                       <h6 className="fw-bold small text-uppercase mb-2"><FaChartBar className="me-2"/> Session Summary</h6>
                       <div className="small opacity-75">
                          This report provides the raw performance data captured during the game session. All metrics represent direct patient interaction without clinical derivation.
                       </div>
                    </div>
                    <h6 className="fw-bold small text-uppercase opacity-50 mb-3">Therapist Observations</h6>
                    <Form.Control as="textarea" rows={12} className="bg-dark text-white border-secondary mb-4" placeholder="Enter clinical observations..." value={gameNotes} onChange={e => setGameNotes(e.target.value)} />
                    
                    <Button variant="primary" className="w-100 py-2 fw-bold shadow-lg mt-4" onClick={saveGameReview} disabled={savingGame}>{savingGame ? 'Saving...' : 'Mark as Reviewed'}</Button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TherapistDashboard;
