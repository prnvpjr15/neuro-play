import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg:        #080b10;
    --surf:      #0e1219;
    --surf2:     #141922;
    --surf3:     #1a2030;
    --border:    rgba(255,255,255,0.06);
    --border-h:  rgba(255,255,255,0.12);
    --text:      #dde1ec;
    --muted:     #5a6175;
    --dim:       #8891a8;
    --accent:    #38bdf8;
    --accent-g:  rgba(56,189,248,0.15);
    --green:     #34d399;
    --green-g:   rgba(52,211,153,0.15);
    --amber:     #fbbf24;
    --amber-g:   rgba(251,191,36,0.15);
    --red:       #f87171;
    --red-g:     rgba(248,113,113,0.12);
    --folder:    #c084fc;
    --folder-g:  rgba(192,132,252,0.15);
    --r:         12px;
    --r-lg:      18px;
  }

  .tvd * { box-sizing: border-box; margin: 0; padding: 0; }
  .tvd {
    font-family: 'Sora', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding: 28px 32px;
  }

  /* ── Header ── */
  .tvd-hdr {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
  }
  .tvd-hdr-l { display: flex; align-items: center; gap: 14px; }
  .tvd-icon-box {
    width: 46px; height: 46px;
    background: var(--accent-g);
    border: 1px solid rgba(56,189,248,0.25);
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    color: var(--accent);
  }
  .tvd-title { font-size: 19px; font-weight: 600; letter-spacing: -0.4px; }
  .tvd-sub   { font-size: 12px; color: var(--muted); margin-top: 2px; }

  .tvd-btn {
    background: var(--surf2);
    border: 1px solid var(--border);
    color: var(--dim);
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 12.5px;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    display: flex; align-items: center; gap: 7px;
    transition: all 0.18s;
  }
  .tvd-btn:hover { background: var(--surf3); border-color: var(--border-h); color: var(--text); }

  /* ── Stats row ── */
  .tvd-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 26px;
  }
  .tvd-stat {
    background: var(--surf);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 16px 18px;
    transition: border-color 0.2s;
  }
  .tvd-stat:hover { border-color: var(--border-h); }
  .tvd-stat-lbl { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 7px; }
  .tvd-stat-val { font-size: 26px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .tvd-stat-val.cyan   { color: var(--accent); }
  .tvd-stat-val.green  { color: var(--green); }
  .tvd-stat-val.amber  { color: var(--amber); }
  .tvd-stat-val.purple { color: var(--folder); }

  /* ── Breadcrumb ── */
  .tvd-crumb {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 18px;
    font-size: 13px;
    color: var(--muted);
  }
  .tvd-crumb-link {
    color: var(--accent);
    cursor: pointer;
    background: none; border: none;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    padding: 0;
    transition: opacity 0.15s;
  }
  .tvd-crumb-link:hover { opacity: 0.75; }

  /* ── Folder grid ── */
  .tvd-folder-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }
  .tvd-folder-card {
    background: var(--surf);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  .tvd-folder-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--folder), transparent);
    opacity: 0; transition: opacity 0.2s;
  }
  .tvd-folder-card:hover { border-color: rgba(192,132,252,0.3); background: var(--surf2); transform: translateY(-2px); }
  .tvd-folder-card:hover::before { opacity: 1; }

  .tvd-folder-icon {
    width: 48px; height: 48px;
    background: var(--folder-g);
    border: 1px solid rgba(192,132,252,0.2);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px; font-size: 22px;
  }
  .tvd-folder-id {
    font-size: 11px; font-weight: 500; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 2px;
  }
  .tvd-folder-username {
    font-size: 13px; font-weight: 600; color: var(--text);
    font-family: 'JetBrains Mono', monospace; margin-bottom: 6px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .tvd-folder-count { font-size: 12px; color: var(--muted); margin-bottom: 14px; }
  .tvd-folder-pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .tvd-folder-date  { margin-top: 12px; font-size: 11px; color: var(--muted); }

  /* ── Badge ── */
  .tvd-badge {
    display: inline-flex; align-items: center;
    padding: 3px 9px; border-radius: 20px;
    font-size: 11px; font-weight: 500;
    font-family: 'JetBrains Mono', monospace;
  }
  .tvd-badge.green  { background: var(--green-g);  color: var(--green);  border: 1px solid rgba(52,211,153,0.22); }
  .tvd-badge.amber  { background: var(--amber-g);  color: var(--amber);  border: 1px solid rgba(251,191,36,0.22); }
  .tvd-badge.red    { background: var(--red-g);    color: var(--red);    border: 1px solid rgba(248,113,113,0.18); }
  .tvd-badge.cyan   { background: var(--accent-g); color: var(--accent); border: 1px solid rgba(56,189,248,0.22); }
  .tvd-badge.purple { background: var(--folder-g); color: var(--folder); border: 1px solid rgba(192,132,252,0.22); }
  .tvd-badge.gray   { background: rgba(255,255,255,0.04); color: var(--muted); border: 1px solid var(--border); }

  /* ── Session table ── */
  .tvd-table-wrap {
    background: var(--surf);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    overflow: hidden;
  }
  .tvd-table-top {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
  }
  .tvd-table-title { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
  .tvd-patient-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--folder); background: var(--folder-g);
    border: 1px solid rgba(192,132,252,0.2);
    padding: 2px 9px; border-radius: 6px;
    max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .tvd-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .tvd-table thead th {
    background: var(--surf2); padding: 11px 16px; text-align: left;
    font-size: 10px; font-weight: 500; text-transform: uppercase;
    letter-spacing: 0.8px; color: var(--muted); border-bottom: 1px solid var(--border);
  }
  .tvd-table tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
  .tvd-table tbody tr:last-child { border-bottom: none; }
  .tvd-table tbody tr:hover { background: var(--surf2); }
  .tvd-table tbody td { padding: 12px 16px; vertical-align: middle; }
  .tvd-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--dim); }

  /* ── Mini bar ── */
  .tvd-bar-wrap { width: 72px; height: 4px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; display: inline-block; vertical-align: middle; margin-left: 7px; }
  .tvd-bar-fill { height: 100%; border-radius: 99px; }
  .tvd-bar-fill.green { background: var(--green); }
  .tvd-bar-fill.amber { background: var(--amber); }
  .tvd-bar-fill.red   { background: var(--red); }

  /* ── Review btn ── */
  .tvd-review-btn {
    background: var(--accent-g); border: 1px solid rgba(56,189,248,0.25);
    color: var(--accent); padding: 5px 13px; border-radius: 7px;
    font-size: 12px; font-family: 'Sora', sans-serif; font-weight: 500;
    cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
    transition: all 0.18s;
  }
  .tvd-review-btn:hover { background: var(--accent); color: #000; }

  /* ── Modal ── */
  .tvd-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.82); backdrop-filter: blur(8px);
    z-index: 1000; display: flex; align-items: center; justify-content: center;
    padding: 20px; animation: tvd-fade 0.2s ease;
  }
  @keyframes tvd-fade { from { opacity:0 } to { opacity:1 } }
  .tvd-modal {
    background: var(--surf); border: 1px solid var(--border);
    border-radius: 22px; width: 100%; max-width: 1080px;
    max-height: 90vh; overflow: hidden;
    display: flex; flex-direction: column;
    animation: tvd-up 0.22s ease;
  }
  @keyframes tvd-up { from { transform:translateY(16px); opacity:0 } to { transform:translateY(0); opacity:1 } }

  .tvd-modal-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .tvd-modal-title { font-size: 15px; font-weight: 600; }
  .tvd-modal-meta  { font-size: 11.5px; color: var(--muted); margin-top: 3px; font-family: 'JetBrains Mono', monospace; }
  .tvd-close-btn {
    width: 32px; height: 32px; border: 1px solid var(--border);
    background: var(--surf2); color: var(--muted); border-radius: 8px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 16px; transition: all 0.18s; flex-shrink: 0;
  }
  .tvd-close-btn:hover { background: var(--red-g); border-color: rgba(248,113,113,0.3); color: var(--red); }

  .tvd-modal-body { display: grid; grid-template-columns: 1fr 320px; overflow: hidden; flex: 1; }
  .tvd-panel-l {
    padding: 20px; display: flex; flex-direction: column; gap: 16px;
    overflow-y: auto; border-right: 1px solid var(--border);
  }
  .tvd-panel-r { padding: 20px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }

  .tvd-video-wrap { background: #000; border-radius: var(--r); overflow: hidden; border: 1px solid var(--border); }
  .tvd-video-wrap video { width: 100%; display: block; max-height: 340px; }

  .tvd-timeline { background: var(--surf2); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; }
  .tvd-tl-hdr {
    padding: 11px 16px; border-bottom: 1px solid var(--border);
    font-size: 10.5px; font-weight: 500; color: var(--dim);
    text-transform: uppercase; letter-spacing: 0.7px;
    display: flex; align-items: center; gap: 7px;
  }
  .tvd-tl-body { padding: 14px 16px; display: flex; align-items: flex-end; height: 88px; gap: 2px; }
  .tvd-tbar { flex: 1; min-width: 3px; border-radius: 2px 2px 0 0; cursor: pointer; transition: opacity 0.15s; }
  .tvd-tbar:hover { opacity: 0.7; }
  .tvd-tl-empty { width: 100%; text-align: center; color: var(--muted); font-size: 12.5px; }

  .tvd-kpi { background: var(--surf2); border: 1px solid var(--border); border-radius: var(--r); padding: 16px; }
  .tvd-kpi-title { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.9px; color: var(--muted); margin-bottom: 14px; }
  .tvd-kpi-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .tvd-kpi-row:last-child { margin-bottom: 0; }
  .tvd-kpi-lbl { font-size: 12.5px; color: var(--dim); }
  .tvd-kpi-val { font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
  .tvd-progress { height: 4px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; margin-top: 4px; margin-bottom: 12px; }
  .tvd-progress-fill { height: 100%; border-radius: 99px; transition: width 0.5s; }

  .tvd-notes-lbl { font-size: 11px; font-weight: 500; color: var(--dim); margin-bottom: 7px; text-transform: uppercase; letter-spacing: 0.7px; }
  .tvd-textarea {
    width: 100%; background: var(--surf2); border: 1px solid var(--border);
    border-radius: var(--r); color: var(--text); font-family: 'Sora', sans-serif;
    font-size: 13px; line-height: 1.65; padding: 12px; resize: none; outline: none;
    transition: border-color 0.2s; min-height: 120px;
  }
  .tvd-textarea:focus { border-color: rgba(56,189,248,0.35); }
  .tvd-textarea::placeholder { color: var(--muted); }

  .tvd-save-btn {
    width: 100%; background: var(--green); border: none; color: #000;
    padding: 11px; border-radius: var(--r); font-size: 13.5px; font-weight: 600;
    font-family: 'Sora', sans-serif; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s;
  }
  .tvd-save-btn:hover { background: #2ecc8f; transform: translateY(-1px); }
  .tvd-save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .tvd-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 55vh; gap: 14px; color: var(--muted); font-size: 13px;
  }
  .tvd-spinner {
    width: 34px; height: 34px; border: 3px solid var(--border);
    border-top-color: var(--accent); border-radius: 50%;
    animation: tvd-spin 0.8s linear infinite;
  }
  @keyframes tvd-spin { to { transform: rotate(360deg); } }
  .tvd-empty { text-align: center; padding: 50px 20px; color: var(--muted); font-size: 13px; }

  .tvd-panel-l::-webkit-scrollbar,
  .tvd-panel-r::-webkit-scrollbar { width: 4px; }
  .tvd-panel-l::-webkit-scrollbar-thumb,
  .tvd-panel-r::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
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

const recalc = (gazeData) => {
  if (!gazeData || gazeData.length === 0)
    return {
      avgAttentionScore: 0,
      faceDetectionRate: 0,
      engagementLevel: "Low",
    };
  const det = gazeData.filter((f) => f.faceDetected);
  const avg =
    det.length > 0
      ? det.reduce((s, f) => s + (f.attentionScore || 0), 0) / det.length
      : 0;
  const rate = (det.length / gazeData.length) * 100;
  return {
    avgAttentionScore: avg,
    faceDetectionRate: rate,
    engagementLevel: avg > 70 ? "High" : avg > 40 ? "Medium" : "Low",
  };
};

const scoreColor = (s) => {
  const n = Number(s);
  return n > 70 ? "green" : n > 40 ? "amber" : "red";
};
const scoreHex = (s) =>
  scoreColor(s) === "green"
    ? "#34d399"
    : scoreColor(s) === "amber"
      ? "#fbbf24"
      : "#f87171";
const fmt = (n) => Math.round(Number(n) || 0);
const fmtDur = (s) => {
  const sec = Number(s) || 0;
  return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;
};
const absMediaUrl = (u) => {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `http://localhost:4000${u}`;
};

// ─── Component ────────────────────────────────────────────────────────────────
const TherapistVideoDashboard = () => {
  const { user } = useContext(AuthContext);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  // Video review modal
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [notes, setNotes] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [saving, setSaving] = useState(false);
  // Game review modal
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameNotes, setGameNotes] = useState("");
  const [savingGame, setSavingGame] = useState(false);

  const therapistId = user?.id;

  useEffect(() => {
    if (therapistId) {
      fetchVideos();
    } else setLoading(false);
  }, [therapistId]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      // 1. Fetch Videos
      const { data: videoData } = await axios.get(
        `http://localhost:4000/api/facecapture/videos/therapist/${therapistId}`,
      );
      const rawVideos = Array.isArray(videoData) ? videoData : [];
      const processedVideos = rawVideos.map((v) => {
        const gazeData = safeParse(v.gazeData, []);
        let gazeSummary = safeParse(v.gazeSummary, null);
        const invalid =
          !gazeSummary ||
          typeof gazeSummary.avgAttentionScore === "undefined" ||
          (gazeSummary.avgAttentionScore === 0 && gazeData.length > 0);
        if (invalid) gazeSummary = recalc(gazeData);
        return {
          ...v,
          type: "video",
          gazeData,
          gazeSummary: gazeSummary || {
            avgAttentionScore: 0,
            faceDetectionRate: 0,
            engagementLevel: "Low",
          },
        };
      });

      // 2. Fetch Game Sessions
      let gameSessions = [];
      try {
        const { data: gameData } = await axios.get(
          `http://localhost:4000/api/analytics/therapist/${therapistId}`
        );
        if (Array.isArray(gameData)) {
           gameSessions = gameData.map(g => ({
             ...g,
             type: 'game',
             timestamp: g.playedAt, // Normalize date key to timestamp for unified sorting
           }));
        }
      } catch (gameErr) {
        console.error("Failed to fetch game sessions", gameErr);
      }

      const combined = [...processedVideos, ...gameSessions];
      setVideos(combined);
    } catch (e) {
      console.error("Fetch failed:", e);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Group into per-patient folders by username
  const patientFolders = React.useMemo(() => {
    const map = {};
    videos.forEach((v) => {
      const uname = v.username || v.userId || "unknown"; // Use username as primary key
      const uid = v.userId; // Keep userId for reference
      if (!map[uname])
        map[uname] = { sessions: [], username: uname, userId: uid };
      map[uname].sessions.push(v);
    });
    return Object.entries(map)
      .map(([username, data]) => {
        const videoSessions = data.sessions.filter(s => s.type === 'video');
        const gameSessions = data.sessions.filter(s => s.type === 'game');
        return {
          username,
          userId: data.userId,
          sessions: data.sessions,
          latest: data.sessions[0]?.timestamp,
          avgAttn:
            videoSessions.length > 0
              ? videoSessions.reduce(
                  (s, v) => s + (v.gazeSummary?.avgAttentionScore || 0),
                  0,
                ) / videoSessions.length
              : 0,
          reviewed: videoSessions.filter((v) => v.reviewed).length,
          pending: videoSessions.filter((v) => !v.reviewed).length,
          highEng: videoSessions.filter(
            (v) => v.gazeSummary?.engagementLevel === "High",
          ).length,
          videoCount: videoSessions.length,
          gameCount: gameSessions.length,
        };
      })
      .sort((a, b) => new Date(b.latest) - new Date(a.latest));
  }, [videos]);

  const patientSessions = selectedPatient
    ? videos.filter((v) => (v.username || v.userId) === selectedPatient)
    : [];
  const patientVideos = patientSessions.filter(s => s.type === 'video');
  const patientGames  = patientSessions.filter(s => s.type === 'game');

  const currentFolder = patientFolders.find(
    (f) => f.username === selectedPatient,
  );

  const openVideo = (v) => {
    setSelectedVideo(v);
    setNotes(v.therapistNotes || "");
    setBookmarks(v.highlights || []);
  };

  const saveAnalysis = async () => {
    if (!selectedVideo) return;
    setSaving(true);
    try {
      await axios.post(
        `http://localhost:4000/api/facecapture/videos/${selectedVideo._id}/analyze`,
        {
          therapistNotes: notes,
          bookmarks,
          reviewed: true,
          reviewedBy: therapistId,
          reviewedAt: new Date(),
        },
      );
      await fetchVideos();
      setSelectedVideo(null);
    } catch {
      alert("Failed to save analysis");
    } finally {
      setSaving(false);
    }
  };

  const openGame = (g) => {
    setSelectedGame(g);
    setGameNotes(g.therapistNotes || "");
  };

  const saveGameReview = async () => {
    if (!selectedGame) return;
    setSavingGame(true);
    try {
      await axios.post(
        `http://localhost:4000/api/analytics/review/${selectedGame._id}`,
        {
          therapistNotes: gameNotes,
          reviewed: true,
          reviewedBy: therapistId,
          reviewedAt: new Date(),
        },
      );
      await fetchVideos();
      setSelectedGame(null);
    } catch {
      alert("Failed to save game review");
    } finally {
      setSavingGame(false);
    }
  };

  // ── Global stats
  const totalSessions = videos.length;
  const totalVideoSessions = videos.filter((v) => v.type === "video").length;
  const totalGameSessions = videos.filter((v) => v.type === "game").length;
  const totalReviewed = videos.filter((v) => v.reviewed).length;
  const globalAvgAttn =
    totalVideoSessions > 0
      ? videos
          .filter((v) => v.type === "video")
          .reduce(
          (s, v) => s + (v.gazeSummary?.avgAttentionScore || 0),
          0,
        ) / totalVideoSessions
      : 0;

  if (loading)
    return (
      <>
        <style>{styles}</style>
        <div className="tvd">
          <div className="tvd-loading">
            <div className="tvd-spinner" />
            <span>Loading patient data…</span>
          </div>
        </div>
      </>
    );

  return (
    <>
      <style>{styles}</style>
      <div className="tvd">
        {/* Header */}
        <div className="tvd-hdr">
          <div className="tvd-hdr-l">
            <div className="tvd-icon-box">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div>
              <div className="tvd-title">Patient Session Vault</div>
              <div className="tvd-sub">
                {patientFolders.length} patients · {totalVideoSessions} video sessions · {totalGameSessions} game sessions
              </div>
            </div>
          </div>
          <button className="tvd-btn" onClick={() => { fetchVideos(); }}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="tvd-stats">
          <div className="tvd-stat">
            <div className="tvd-stat-lbl">Patients</div>
            <div className="tvd-stat-val purple">{patientFolders.length}</div>
          </div>
          <div className="tvd-stat">
            <div className="tvd-stat-lbl">Video Sessions</div>
            <div className="tvd-stat-val cyan">{totalVideoSessions}</div>
          </div>
          <div className="tvd-stat">
            <div className="tvd-stat-lbl">Game Sessions</div>
            <div className="tvd-stat-val purple">{totalGameSessions}</div>
          </div>
          <div className="tvd-stat">
            <div className="tvd-stat-lbl">Avg Attention</div>
            <div className="tvd-stat-val amber">{fmt(globalAvgAttn)}%</div>
          </div>
        </div>

        {/* Breadcrumb (only inside a folder) */}
        {selectedPatient && (
          <div className="tvd-crumb">
            <button
              className="tvd-crumb-link"
              onClick={() => setSelectedPatient(null)}
            >
              ← All Patients
            </button>
            <span style={{ color: "var(--muted)" }}>›</span>
            <span
              style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13 }}
            >
              {selectedPatient}
            </span>
            <span
              style={{
                marginLeft: "auto",
                color: "var(--muted)",
                fontSize: 12,
              }}
            >
              {patientSessions.length} session
              {patientSessions.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* ── FOLDER VIEW ── */}
        {!selectedPatient &&
          (videos.length === 0 ? (
            <div className="tvd-empty">
              <div style={{ fontSize: 36, marginBottom: 10 }}>🗂️</div>
              No patient sessions found.
            </div>
          ) : (
            <div className="tvd-folder-grid">
              {patientFolders.map((folder) => (
                <div
                  key={folder.username}
                  className="tvd-folder-card"
                  onClick={() => {
                    setSelectedPatient(folder.username);
                  }}
                >
                  <div className="tvd-folder-icon">👤</div>
                  <div className="tvd-folder-id">Patient</div>
                  <div className="tvd-folder-username" title={folder.username}>
                    {folder.username}
                  </div>
                  <div className="tvd-folder-count">
                    {folder.videoCount > 0 && <>📹 {folder.videoCount} video{folder.videoCount !== 1 ? "s" : ""}</>}
                    {folder.videoCount > 0 && folder.gameCount > 0 && <>&nbsp;·&nbsp;</>}
                    {folder.gameCount > 0 && <>🎮 {folder.gameCount} game{folder.gameCount !== 1 ? "s" : ""}</>}
                    &nbsp;·&nbsp;{folder.reviewed} reviewed
                  </div>
                  <div className="tvd-folder-pills">
                    <span className={`tvd-badge ${scoreColor(folder.avgAttn)}`}>
                      {fmt(folder.avgAttn)}% avg
                    </span>
                    {folder.pending > 0 && (
                      <span className="tvd-badge amber">
                        {folder.pending} pending
                      </span>
                    )}
                    {folder.highEng > 0 && (
                      <span className="tvd-badge green">
                        {folder.highEng} high
                      </span>
                    )}
                  </div>
                  <div className="tvd-folder-date">
                    Last: {new Date(folder.latest).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* ── PATIENT DETAIL (two sections) ── */}
        {selectedPatient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ─── Section header ─────────────── */}
            <div className="tvd-table-top" style={{ marginBottom: 0 }}>
              <div className="tvd-table-title">
                <span style={{ marginRight: 12 }}>📋</span>Sessions for
                <span className="tvd-patient-tag" title={selectedPatient}>
                  <strong>{selectedPatient}</strong>
                </span>
              </div>
              {currentFolder && (
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="tvd-badge cyan">
                    📹 {currentFolder.videoCount} video{currentFolder.videoCount !== 1 ? 's' : ''}
                  </span>
                  <span className="tvd-badge purple">
                    🎮 {currentFolder.gameCount} game{currentFolder.gameCount !== 1 ? 's' : ''}
                  </span>
                  {currentFolder.avgAttn > 0 && (
                    <span className={`tvd-badge ${scoreColor(currentFolder.avgAttn)}`}>
                      Avg Attn {fmt(currentFolder.avgAttn)}%
                    </span>
                  )}
                  {currentFolder.pending > 0 && (
                    <span className="tvd-badge amber">
                      {currentFolder.pending} pending
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ─── VIDEO SESSIONS ─────────────── */}
            <div className="tvd-table-wrap">
              <div className="tvd-table-top">
                <div className="tvd-table-title" style={{ fontSize: 14 }}>
                  📹 Video Sessions
                  <span className="tvd-badge gray" style={{ marginLeft: 10, fontSize: 11 }}>
                    {patientVideos.length}
                  </span>
                </div>
              </div>
              {patientVideos.length === 0 ? (
                <div className="tvd-empty">No video sessions recorded yet.</div>
              ) : (
                <table className="tvd-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date & Time</th>
                      <th>Duration</th>
                      <th>Avg Attention</th>
                      <th>Face Detection</th>
                      <th>Engagement</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientVideos.map((v, idx) => {
                      const attn = v.gazeSummary?.avgAttentionScore || 0;
                      const face = v.gazeSummary?.faceDetectionRate || 0;
                      const eng  = v.gazeSummary?.engagementLevel || "Low";
                      return (
                        <tr key={v._id || idx}>
                          <td><span className="tvd-mono">#{patientVideos.length - idx}</span></td>
                          <td style={{ color: "var(--dim)", fontSize: 12.5 }}>
                            {new Date(v.timestamp).toLocaleString()}
                          </td>
                          <td><span className="tvd-mono">{fmtDur(v.duration)}</span></td>
                          <td>
                            <span className={`tvd-badge ${scoreColor(attn)}`}>{fmt(attn)}%</span>
                            <span className="tvd-bar-wrap">
                              <span className={`tvd-bar-fill ${scoreColor(attn)}`} style={{ width: `${Math.min(attn, 100)}%` }} />
                            </span>
                          </td>
                          <td><span className={`tvd-badge ${scoreColor(face)}`}>{fmt(face)}%</span></td>
                          <td>
                            <span className={`tvd-badge ${eng === "High" ? "green" : eng === "Medium" ? "amber" : "red"}`}>
                              {eng}
                            </span>
                          </td>
                          <td>
                            <span className={`tvd-badge ${v.reviewed ? "green" : "amber"}`}>
                              {v.reviewed ? "Reviewed" : "Pending"}
                            </span>
                          </td>
                          <td>
                            <button className="tvd-review-btn" onClick={() => openVideo(v)}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* ─── GAME SESSIONS ──────────────── */}
            <div className="tvd-table-wrap">
              <div className="tvd-table-top">
                <div className="tvd-table-title" style={{ fontSize: 14 }}>
                  🎮 Game Sessions
                  <span className="tvd-badge gray" style={{ marginLeft: 10, fontSize: 11 }}>
                    {patientGames.length}
                  </span>
                </div>
              </div>
              {patientGames.length === 0 ? (
                <div className="tvd-empty">No game sessions recorded yet.</div>
              ) : (
                <table className="tvd-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date & Time</th>
                      <th>Game</th>
                      <th>Score</th>
                      <th>Level</th>
                      <th>Behavior Video</th>
                      <th>Privacy</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientGames.map((g, idx) => (
                      <tr key={g._id || idx}>
                        <td><span className="tvd-mono">#{patientGames.length - idx}</span></td>
                        <td style={{ color: "var(--dim)", fontSize: 12.5 }}>
                          {new Date(g.timestamp || g.playedAt).toLocaleString()}
                        </td>
                        <td><span className="tvd-badge purple">{g.gameName}</span></td>
                        <td>
                          <span className={`tvd-badge ${scoreColor(g.score)}`}>{g.score}</span>
                          <span className="tvd-bar-wrap">
                            <span className={`tvd-bar-fill ${scoreColor(g.score)}`} style={{ width: `${Math.min(g.score, 100)}%` }} />
                          </span>
                        </td>
                        <td><span className="tvd-badge cyan">Lvl {g.levelReached || 1}</span></td>
                        <td>
                          {g.gameVideoUrl ? (
                            <span className="tvd-badge green">Available</span>
                          ) : (
                            <span className="tvd-badge gray">Not Recorded</span>
                          )}
                        </td>
                        <td>
                          <span className={`tvd-badge ${g.faceBlurred ? "cyan" : "gray"}`}>
                            {g.faceBlurred ? "Blurred" : "Raw"}
                          </span>
                        </td>
                        <td>
                          <span className={`tvd-badge ${g.reviewed ? "green" : "amber"}`}>
                            {g.reviewed ? "Reviewed" : "Pending"}
                          </span>
                        </td>
                        <td>
                          <button className="tvd-review-btn" onClick={() => openGame(g)}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}

        {/* ── VIDEO REVIEW MODAL ── */}
        {selectedVideo && (
          <div className="tvd-overlay" onClick={() => setSelectedVideo(null)}>
            <div className="tvd-modal" onClick={(e) => e.stopPropagation()}>
              <div className="tvd-modal-hdr">
                <div>
                  <div className="tvd-modal-title">📹 Video Session Review</div>
                  <div className="tvd-modal-meta">
                    <strong>Patient:</strong>{" "}
                    {selectedVideo.username || selectedVideo.userId} ·{" "}
                    {new Date(selectedVideo.timestamp).toLocaleString()} ·{" "}
                    {fmtDur(selectedVideo.duration)}
                  </div>
                </div>
                <button className="tvd-close-btn" onClick={() => setSelectedVideo(null)}>✕</button>
              </div>

              <div className="tvd-modal-body">
                <div className="tvd-panel-l">
                  <div className="tvd-video-wrap">
                    <video controls src={`http://localhost:4000/api/facecapture/video/stream/${selectedVideo._id}`} />
                  </div>
                  <div className="tvd-timeline">
                    <div className="tvd-tl-hdr">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      Attention Timeline
                      <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 10 }}>
                        {selectedVideo.gazeData.length} frames
                      </span>
                    </div>
                    <div className="tvd-tl-body">
                      {selectedVideo.gazeData.length > 0 ? (
                        selectedVideo.gazeData.map((pt, i) => (
                          <div key={i} className="tvd-tbar"
                            style={{ height: `${Math.max(pt.attentionScore || 0, 4)}%`, background: scoreHex(pt.attentionScore), opacity: pt.faceDetected ? 1 : 0.2 }}
                            title={`Frame ${i + 1} | Attn: ${fmt(pt.attentionScore)}% | Face: ${pt.faceDetected ? "Yes" : "No"}`}
                          />
                        ))
                      ) : (
                        <div className="tvd-tl-empty">No gaze frame data available</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="tvd-panel-r">
                  <div className="tvd-kpi">
                    <div className="tvd-kpi-title">Key Indicators</div>
                    <div className="tvd-kpi-row">
                      <span className="tvd-kpi-lbl">Avg Attention</span>
                      <span className="tvd-kpi-val" style={{ color: scoreHex(selectedVideo.gazeSummary.avgAttentionScore) }}>
                        {fmt(selectedVideo.gazeSummary.avgAttentionScore)}%
                      </span>
                    </div>
                    <div className="tvd-progress">
                      <div className="tvd-progress-fill" style={{ width: `${Math.min(selectedVideo.gazeSummary.avgAttentionScore, 100)}%`, background: scoreHex(selectedVideo.gazeSummary.avgAttentionScore) }} />
                    </div>
                    <div className="tvd-kpi-row">
                      <span className="tvd-kpi-lbl">Face Detection</span>
                      <span className="tvd-kpi-val" style={{ color: scoreHex(selectedVideo.gazeSummary.faceDetectionRate) }}>
                        {fmt(selectedVideo.gazeSummary.faceDetectionRate)}%
                      </span>
                    </div>
                    <div className="tvd-progress">
                      <div className="tvd-progress-fill" style={{ width: `${Math.min(selectedVideo.gazeSummary.faceDetectionRate, 100)}%`, background: scoreHex(selectedVideo.gazeSummary.faceDetectionRate) }} />
                    </div>
                    <div className="tvd-kpi-row">
                      <span className="tvd-kpi-lbl">Engagement</span>
                      <span className={`tvd-badge ${selectedVideo.gazeSummary.engagementLevel === "High" ? "green" : selectedVideo.gazeSummary.engagementLevel === "Medium" ? "amber" : "red"}`}>
                        {selectedVideo.gazeSummary.engagementLevel}
                      </span>
                    </div>
                    <div className="tvd-kpi-row" style={{ marginTop: 8 }}>
                      <span className="tvd-kpi-lbl">Status</span>
                      <span className={`tvd-badge ${selectedVideo.reviewed ? "green" : "gray"}`}>
                        {selectedVideo.reviewed ? "Reviewed" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="tvd-notes-lbl">Clinical Observations</div>
                    <textarea className="tvd-textarea" value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Document eye-contact patterns, engagement quality, repetitive behaviours…" rows={6} />
                  </div>
                  <button className="tvd-save-btn" onClick={saveAnalysis} disabled={saving}>
                    {saving ? (<><div className="tvd-spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />Saving…</>) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                      </svg>Save & Mark Reviewed</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── GAME REVIEW MODAL ── */}
        {selectedGame && (
          <div className="tvd-overlay" onClick={() => setSelectedGame(null)}>
            <div className="tvd-modal" onClick={(e) => e.stopPropagation()}>
              <div className="tvd-modal-hdr">
                <div>
                  <div className="tvd-modal-title">🎮 Game Session Review</div>
                  <div className="tvd-modal-meta">
                    <strong>Patient:</strong> {selectedGame.username || selectedGame.userId} ·{" "}
                    {new Date(selectedGame.timestamp || selectedGame.playedAt).toLocaleString()}
                  </div>
                </div>
                <button className="tvd-close-btn" onClick={() => setSelectedGame(null)}>✕</button>
              </div>

              <div className="tvd-modal-body">
                {/* Left panel — game stats */}
                <div className="tvd-panel-l">
                  <div className="tvd-video-wrap">
                    {selectedGame.gameVideoUrl ? (
                      <video
                        controls
                        src={absMediaUrl(selectedGame.gameVideoUrl)}
                        style={{ maxHeight: 320, width: "100%", background: "#000" }}
                      />
                    ) : (
                      <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>
                        No behavior video was recorded for this game session.
                      </div>
                    )}
                  </div>
                  <div style={{ background: 'var(--surf2)', borderRadius: 12, border: '1px solid var(--border)', padding: 24, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <div style={{ fontSize: 40 }}>🎮</div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--folder)' }}>{selectedGame.gameName}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Game Performance Summary</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {[
                        { label: 'Score', value: selectedGame.score, suffix: '', color: scoreHex(selectedGame.score) },
                        { label: 'Level Reached', value: selectedGame.levelReached || 1, suffix: '', color: 'var(--accent)' },
                        { label: 'Reviewed', value: selectedGame.reviewed ? 'Yes' : 'No', suffix: '', color: selectedGame.reviewed ? 'var(--green)' : 'var(--amber)' },
                      ].map(({ label, value, suffix, color }) => (
                        <div key={label} style={{ background: 'var(--surf3)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>{label}</div>
                          <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}{suffix}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Score bar */}
                  <div style={{ background: 'var(--surf2)', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Performance</div>
                    {[{ label: 'Score', val: selectedGame.score }].map(({ label, val }) => (
                      <div key={label} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--dim)' }}>{label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: scoreHex(val) }}>{val}%</span>
                        </div>
                        <div className="tvd-progress">
                          <div className="tvd-progress-fill" style={{ width: `${Math.min(val, 100)}%`, background: scoreHex(val) }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right panel — notes + save */}
                <div className="tvd-panel-r">
                  <div className="tvd-kpi">
                    <div className="tvd-kpi-title">Session Details</div>
                    <div className="tvd-kpi-row">
                      <span className="tvd-kpi-lbl">Game</span>
                      <span className="tvd-badge purple">{selectedGame.gameName}</span>
                    </div>
                    <div className="tvd-kpi-row">
                      <span className="tvd-kpi-lbl">Score</span>
                      <span className="tvd-kpi-val" style={{ color: scoreHex(selectedGame.score) }}>{selectedGame.score}</span>
                    </div>
                    <div className="tvd-kpi-row">
                      <span className="tvd-kpi-lbl">Level</span>
                      <span className="tvd-badge cyan">Level {selectedGame.levelReached || 1}</span>
                    </div>
                    <div className="tvd-kpi-row">
                      <span className="tvd-kpi-lbl">Status</span>
                      <span className={`tvd-badge ${selectedGame.reviewed ? "green" : "gray"}`}>
                        {selectedGame.reviewed ? "Reviewed" : "Pending"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="tvd-notes-lbl">Clinical Observations</div>
                    <textarea className="tvd-textarea" value={gameNotes} onChange={(e) => setGameNotes(e.target.value)}
                      placeholder="Document the patient's game performance, focus, engagement, strategy, or behavioural observations…" rows={7} />
                  </div>

                  <button className="tvd-save-btn" onClick={saveGameReview} disabled={savingGame}>
                    {savingGame ? (<><div className="tvd-spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />Saving…</>) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                      </svg>Save & Mark Reviewed</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};


export default TherapistVideoDashboard;
