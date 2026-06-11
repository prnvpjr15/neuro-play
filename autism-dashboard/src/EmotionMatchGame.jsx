import React, { useReducer, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const EMOTIONS = [
  { id: 1, name: "Happy",     emoji: "😊", color: "#F59E0B" },
  { id: 2, name: "Sad",       emoji: "😢", color: "#3B82F6" },
  { id: 3, name: "Angry",     emoji: "😠", color: "#EF4444" },
  { id: 4, name: "Surprised", emoji: "😲", color: "#8B5CF6" },
  { id: 5, name: "Calm",      emoji: "😌", color: "#10B981" },
  { id: 6, name: "Tired",     emoji: "😴", color: "#6B7280" },
];

const CFG = {
  TOTAL_LEVELS:    3,
  PAIRS:           { 1: 2, 2: 4, 3: 6 },
  COLS:            { 1: 2, 2: 4, 3: 4 },
  ORIENT_SECS:     2,
  PREVIEW_SECS:    3,
  BASE_FLIP_MS:    1500,
  MISS_PENALTY_MS: 300,
  MAX_FLIP_MS:     3500,
  HINT_AFTER:      5,
  MATCH_PHRASE:    "Match found!",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const noMotion = () =>
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random()}`;

const buildCards = (level) => {
  const n = CFG.PAIRS[level];
  return [...EMOTIONS.slice(0, n), ...EMOTIONS.slice(0, n)]
    .sort(() => Math.random() - 0.5)
    .map((e) => ({ ...e, uid: uid() }));
};

const fmt = (s) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ─── SCORING ──────────────────────────────────────────────────────────────────
/**
 * SCORING ALGORITHM — simple, correct, clinically meaningful
 *
 * Score = 100 points, 3 dimensions:
 *
 * 1. ACCURACY  (50 pts max)
 *    = firstTryMatches / totalPossiblePairs × 50
 *    Denominator is TOTAL POSSIBLE (12), not just matched.
 *    So missing levels AND missing first-tries both reduce this.
 *    Perfect: 12/12 first-try = 50 pts.
 *
 * 2. EFFICIENCY  (30 pts max)
 *    = min(1, optimalAttempts / actualAttempts) × 30
 *    optimalAttempts = totalPossiblePairs (ideal: 1 attempt per pair)
 *    actualAttempts  = totalAttempts (each FLIP_SECOND = 1 attempt)
 *    More wrong picks = more attempts = lower efficiency.
 *    Perfect: 12 attempts for 12 pairs = 30 pts.
 *    Wrong moves hurt directly here.
 *
 * 3. COMPLETION  (20 pts max)
 *    = matchedPairs / totalPossiblePairs × 20
 *    Early exit = partial. Finishing all 3 levels = 20 pts.
 *
 * Total = accuracyPts + efficiencyPts + completionPts  (0–100)
 *
 * Hints: tracked and shown, but NOT directly subtracted —
 * the wrong moves they caused already reduced accuracy + efficiency.
 *
 * Grade bands:
 *   85–100 → Excellent    🌟
 *   65–84  → Great Job    🎉
 *   45–64  → Good Try     👍
 *   25–44  → Keep Going   💪
 *   0–24   → Just Started 🌱
 */
const computeScore = ({ firstTryMatches, totalPossiblePairs, matchedPairs, attempts, hintsUsed }) => {
  const possible = totalPossiblePairs;

  // 1. ACCURACY
  const accuracyPts = possible > 0
    ? Math.round((firstTryMatches / possible) * 50)
    : 0;

  // 2. EFFICIENCY
  // Guard: actualAttempts can't logically be less than matchedPairs
  const actualAttempts = Math.max(attempts, matchedPairs);
  const efficiencyPts  = actualAttempts > 0
    ? Math.round(Math.min(1, possible / actualAttempts) * 30)
    : 0;

  // 3. COMPLETION
  const completionPts = possible > 0
    ? Math.round((matchedPairs / possible) * 20)
    : 0;

  const total = accuracyPts + efficiencyPts + completionPts;

  const grade =
    total >= 85 ? { label: "Excellent",    emoji: "🌟", color: "#10b981" } :
    total >= 65 ? { label: "Great Job",    emoji: "🎉", color: "#3b82f6" } :
    total >= 45 ? { label: "Good Try",     emoji: "👍", color: "#f59e0b" } :
    total >= 25 ? { label: "Keep Going",   emoji: "💪", color: "#ef4444" } :
                  { label: "Just Started", emoji: "🌱", color: "#8b5cf6" };

  return {
    total, grade,
    accuracyPts, efficiencyPts, completionPts,
    firstTryMatches, matchedPairs, attempts, hintsUsed,
    totalPossiblePairs: possible,
  };
};

// ─── REDUCER ──────────────────────────────────────────────────────────────────
const initLevel = (level) => ({
  cards:          buildCards(level),
  flipped:        [],
  solved:         [],
  disabled:       false,
  consecMisses:   0,
  consecCorrect:  0,
  hintEmotionId:  null,
  // Tracks which emotionIds have had at least one miss this level.
  // Used to decide isFirstTry correctly at match time.
  attemptedPairs: {},   // { [emotionId]: true } set on any MISS
});

const INIT = {
  phase:      "orient",
  level:      1,
  ...initLevel(1),
  // ── Session-wide stats (never reset between levels) ──
  elapsed:       0,
  totalMatched:  0,    // pairs successfully matched
  totalFirstTry: 0,    // pairs matched on the very first attempt
  totalAttempts: 0,    // pair-attempts (each FLIP_SECOND = +1)
  totalPossible: CFG.PAIRS[1] + CFG.PAIRS[2] + CFG.PAIRS[3],  // 12
  hintsUsed:     0,
  bestStreak:    0,
  orientSecs:   CFG.ORIENT_SECS,
  previewSecs:  CFG.PREVIEW_SECS,
  showTimer:    false,
  showLabels:   true,
  soundEnabled: false,
};

function reducer(state, action) {
  switch (action.type) {

    case "START_PLAY":
      return { ...state, phase: "play", disabled: false, orientSecs: 0 };

    case "TICK_ORIENT":
      return { ...state, orientSecs: Math.max(0, state.orientSecs - 1) };

    case "TICK_PREVIEW":
      return { ...state, previewSecs: Math.max(0, state.previewSecs - 1) };

    case "ADVANCE_LEVEL": {
      const next = state.level + 1;
      return {
        // Spread session-wide stats first
        ...state,
        // Overwrite with next-level per-level state
        phase:      "orient",
        level:      next,
        orientSecs: CFG.ORIENT_SECS,
        ...initLevel(next),
        // Re-assert session-wide stats so initLevel doesn't clobber them
        elapsed:       state.elapsed,
        totalMatched:  state.totalMatched,
        totalFirstTry: state.totalFirstTry,
        totalAttempts: state.totalAttempts,
        totalPossible: state.totalPossible,
        hintsUsed:     state.hintsUsed,
        bestStreak:    state.bestStreak,
        showTimer:     state.showTimer,
        showLabels:    state.showLabels,
        soundEnabled:  state.soundEnabled,
      };
    }

    case "GO_ANALYSIS":
      return { ...state, phase: "analysis" };

    case "TICK_ELAPSED":
      return { ...state, elapsed: state.elapsed + 1 };

    // First card tapped — just show it, no attempt counted yet
    case "FLIP_FIRST":
      return { ...state, flipped: [action.uid] };

    // Deselect first card
    case "DESELECT_FIRST":
      return { ...state, flipped: [] };

    // Second card tapped → this constitutes one pair-attempt
    case "FLIP_SECOND":
      return {
        ...state,
        flipped:       [state.flipped[0], action.uid],
        disabled:      true,
        totalAttempts: state.totalAttempts + 1,  // ← counted once per pair-attempt, here
      };

    case "MATCH": {
      // action.isFirstTry: computed in handleCardClick, not hardcoded
      const newSolved   = [...state.solved, ...state.flipped];
      const newMatched  = state.totalMatched + 1;
      const newFirstTry = state.totalFirstTry + (action.isFirstTry ? 1 : 0);
      const newStreak   = state.consecCorrect + 1;
      const newBest     = Math.max(state.bestStreak, newStreak);
      const levelDone   = newSolved.length === state.cards.length;

      return {
        ...state,
        flipped:       [],
        solved:        newSolved,
        disabled:      false,
        consecMisses:  0,
        consecCorrect: newStreak,
        bestStreak:    newBest,
        hintEmotionId: null,
        totalMatched:  newMatched,
        totalFirstTry: newFirstTry,
        previewSecs:   CFG.PREVIEW_SECS,
        phase: levelDone
          ? (state.level >= CFG.TOTAL_LEVELS ? "analysis" : "preview")
          : state.phase,
      };
    }

    case "MISS": {
      // action.emotionId = emotionId of the first card in the failed attempt
      const newMisses   = state.consecMisses + 1;
      // Mark this emotion pair as "already attempted" for first-try tracking
      const newAttempted = { ...state.attemptedPairs, [action.emotionId]: true };

      let hintEmotionId = state.hintEmotionId;
      let hintsUsed     = state.hintsUsed;

      if (newMisses >= CFG.HINT_AFTER && !hintEmotionId) {
        const unsolvedIds = state.cards
          .filter((c) => !state.solved.includes(c.uid))
          .map((c) => c.id);
        const counts = {};
        unsolvedIds.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
        const found = Object.entries(counts).find(([, v]) => v >= 2);
        if (found) {
          hintEmotionId = Number(found[0]);
          hintsUsed += 1;
        }
      }

      return {
        ...state,
        consecMisses:   newMisses,
        consecCorrect:  0,
        hintEmotionId,
        hintsUsed,
        attemptedPairs: newAttempted,
      };
    }

    case "CLEAR_FLIPPED":
      return { ...state, flipped: [], disabled: false };

    case "SET_SHOW_TIMER":  return { ...state, showTimer:    action.val };
    case "SET_SHOW_LABELS": return { ...state, showLabels:   action.val };
    case "SET_SOUND":       return { ...state, soundEnabled: action.val };

    default: return state;
  }
}

// ─── CARD TILE ────────────────────────────────────────────────────────────────
const CardTile = React.memo(({ card, revealed, hinted, showLabels, reduced, onClick }) => (
  <motion.button
    whileHover={reduced ? {} : { scale: 1.06 }}
    whileTap={reduced   ? {} : { scale: 0.95 }}
    onClick={onClick}
    aria-label={revealed ? card.name : "Hidden card"}
    style={{
      width: "100%", aspectRatio: "1",
      cursor:         revealed ? "default" : "pointer",
      borderRadius:   16,
      border:         hinted && !revealed ? `3px solid ${card.color}` : "2px solid transparent",
      background:     revealed ? "#ffffff" : "#1e293b",
      boxShadow:      revealed ? "0 2px 10px rgba(0,0,0,0.07)" : "0 4px 12px rgba(0,0,0,0.28)",
      display:        "flex", flexDirection: "column",
      alignItems:     "center", justifyContent: "center",
      gap: 3, padding: 6,
      transition:     "background 0.25s, box-shadow 0.25s, border 0.2s",
    }}
  >
    {revealed ? (
      <>
        <span style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", lineHeight: 1 }}>{card.emoji}</span>
        {showLabels && (
          <span style={{ fontSize: 11, fontWeight: 700, color: card.color, letterSpacing: 0.3 }}>
            {card.name}
          </span>
        )}
      </>
    ) : (
      <span style={{ fontSize: "clamp(1.2rem,3vw,1.8rem)", opacity: 0.12 }}>?</span>
    )}
  </motion.button>
));

// ─── ORIENT OVERLAY ───────────────────────────────────────────────────────────
const OrientOverlay = ({ secs }) => (
  <div style={{
    position: "absolute", inset: 0, zIndex: 10,
    background: "rgba(255,255,255,0.9)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    borderRadius: 18, gap: 8, textAlign: "center",
  }}>
    <span style={{ fontSize: 30 }}>👀</span>
    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Study the cards!</p>
    <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Hiding in {secs}s…</p>
  </div>
);

// ─── PAUSE OVERLAY ────────────────────────────────────────────────────────────
const PauseOverlay = ({ onResume }) => (
  <div style={{
    position: "absolute", inset: 0, zIndex: 20,
    background: "rgba(15,23,42,0.72)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    borderRadius: 18, gap: 18,
  }}>
    <span style={{ fontSize: 44 }}>⏸️</span>
    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Paused</p>
    <button onClick={onResume} style={{
      padding: "10px 28px", borderRadius: 50,
      border: "none", background: "#3b82f6",
      color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
    }}>▶ Resume</button>
  </div>
);

// ─── LEVEL PREVIEW ────────────────────────────────────────────────────────────
const LevelPreview = ({ nextLevel, secs }) => {
  const pairs = CFG.PAIRS[nextLevel];
  const cols  = CFG.COLS[nextLevel];
  const rows  = (pairs * 2) / cols;
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: 300, gap: 14, textAlign: "center", padding: 24,
    }}>
      <span style={{ fontSize: 48 }}>🎯</span>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
        Level {nextLevel} coming up!
      </h2>
      <p style={{ margin: 0, fontSize: 15, color: "#64748b" }}>
        {pairs * 2} cards · {cols} × {rows} grid
      </p>
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        background: "#eff6ff", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 22, fontWeight: 700, color: "#3b82f6",
      }}>{secs}</div>
      <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Starting in {secs}s…</p>
    </div>
  );
};

// ─── SCORE ROW ────────────────────────────────────────────────────────────────
const ScoreRow = ({ label, pts, maxPts, color, sublabel }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color }}>
        {pts}<span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}> / {maxPts}</span>
      </span>
    </div>
    <div style={{ height: 10, background: "#e2e8f0", borderRadius: 6, overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(pts / maxPts) * 100}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ height: "100%", background: color, borderRadius: 6 }}
      />
    </div>
    {sublabel && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>{sublabel}</p>}
  </div>
);

// ─── RING ─────────────────────────────────────────────────────────────────────
const Ring = ({ value, color }) => {
  const r = 42, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 110, height: 110 }}>
      <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <motion.circle
          cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (value / 100) * circ }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>/ 100</span>
      </div>
    </div>
  );
};

// ─── ANALYSIS SCREEN ──────────────────────────────────────────────────────────
const AnalysisScreen = ({ score, elapsed, onFinish, t }) => {
  const { total, grade, accuracyPts, efficiencyPts, completionPts,
          firstTryMatches, matchedPairs, attempts, hintsUsed, totalPossiblePairs } = score;

  const missedAttempts = attempts - matchedPairs; // wrong pair-attempts

  const msg =
    accuracyPts >= 40
      ? "Sharp memory! You remembered where the cards were."
      : efficiencyPts >= 22
      ? "Great strategy — you didn't repeat many mistakes."
      : completionPts >= 16
      ? "Well done finishing the levels! Keep working on first-try matches."
      : hintsUsed > 0
      ? "Hints helped you along — that's totally fine. Try trusting your memory next time!"
      : "Every session builds your brain. Keep playing!";

  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 52 }}>{grade.emoji}</span>
        <h2 style={{ margin: "8px 0 2px", fontSize: 24, fontWeight: 800, color: grade.color }}>
          {grade.label}!
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          Time: {fmt(elapsed)} · {attempts} pair-attempt{attempts !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Ring + pills */}
      <div style={{
        display: "flex", alignItems: "center", gap: 20,
        background: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: 16, padding: "18px 20px", marginBottom: 22,
      }}>
        <Ring value={total} color={grade.color} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.5 }}>
            FINAL SCORE
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
              ✅ {firstTryMatches} first-try
            </span>
            {missedAttempts > 0 && (
              <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                ❌ {missedAttempts} wrong
              </span>
            )}
            {hintsUsed > 0 && (
              <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                💡 {hintsUsed} hint{hintsUsed !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0", padding: "16px 18px", marginBottom: 16 }}>
        <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 1 }}>
          SCORE BREAKDOWN
        </p>
        <ScoreRow
          label="Accuracy" pts={accuracyPts} maxPts={50} color="#3b82f6"
          sublabel={`${firstTryMatches} of ${totalPossiblePairs} possible pairs matched first-try`}
        />
        <ScoreRow
          label="Efficiency" pts={efficiencyPts} maxPts={30} color="#f59e0b"
          sublabel={`${attempts} attempts for ${matchedPairs} matches (ideal: 1 attempt per pair)`}
        />
        <ScoreRow
          label="Completion" pts={completionPts} maxPts={20} color="#10b981"
          sublabel={`${matchedPairs} of ${totalPossiblePairs} pairs matched`}
        />
      </div>

      {/* Chips */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 18 }}>
        {[
          { label: "First-try",   value: firstTryMatches,  color: "#3b82f6" },
          { label: "Wrong picks", value: missedAttempts,   color: missedAttempts > 0 ? "#ef4444" : "#10b981" },
          { label: "Hints used",  value: hintsUsed,        color: hintsUsed > 0 ? "#f59e0b" : "#10b981" },
          { label: "Pairs done",  value: `${matchedPairs}/${totalPossiblePairs}`, color: "#10b981" },
          { label: "Time",        value: fmt(elapsed),     color: "#6366f1" },
          { label: "Score",       value: `${total}/100`,   color: grade.color },
        ].map((c) => (
          <div key={c.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 12px" }}>
            <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>{c.label}</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Message */}
      <div style={{ background: `${grade.color}15`, border: `1px solid ${grade.color}30`, borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{msg}</p>
      </div>

      <button onClick={onFinish} style={{
        display: "block", width: "100%", padding: "14px 0", borderRadius: 50, border: "none",
        background: "linear-gradient(135deg,#6366f1,#3b82f6)",
        color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
        boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
      }}>
        {t?.finish || "Finish"} & Save
      </button>
    </div>
  );
};

// ─── SETTINGS PANEL ───────────────────────────────────────────────────────────
const SettingsPanel = ({ state, dispatch, onClose }) => (
  <div style={{ position: "absolute", inset: 0, zIndex: 30, background: "#fff", borderRadius: 18, padding: 22, overflowY: "auto" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1e293b" }}>Settings</h3>
      <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
    </div>
    {[
      { label: "Show timer",          sub: "Hidden by default — reduces time pressure",  val: state.showTimer,    act: (v) => dispatch({ type: "SET_SHOW_TIMER",  val: v }) },
      { label: "Show emotion labels", sub: "Text name shown below each icon",            val: state.showLabels,   act: (v) => dispatch({ type: "SET_SHOW_LABELS", val: v }) },
      { label: "Enable sounds",       sub: "All audio is off by default",                val: state.soundEnabled, act: (v) => dispatch({ type: "SET_SOUND",       val: v }) },
    ].map(({ label, sub, val, act }) => (
      <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "13px 0", borderBottom: "1px solid #f1f5f9" }}>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{label}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{sub}</p>
        </div>
        <div onClick={() => act(!val)} style={{ width: 44, height: 24, borderRadius: 12, flexShrink: 0, marginLeft: 16, background: val ? "#6366f1" : "#e2e8f0", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
          <div style={{ position: "absolute", top: 2, left: val ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.18)" }} />
        </div>
      </div>
    ))}
  </div>
);

// ─── MAIN GAME ────────────────────────────────────────────────────────────────
const EmotionMatchGame = ({ onComplete, t, speak, closeModal }) => {
  const reduced = noMotion();
  const [state, dispatch]               = useReducer(reducer, INIT);
  const [paused,       setPaused]       = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  const orientTimer  = useRef(null);
  const previewTimer = useRef(null);
  const elapsedTimer = useRef(null);
  const flipTimer    = useRef(null);

  const clearTimer = (ref) => {
    if (ref.current) { clearInterval(ref.current); ref.current = null; }
  };

  const sayIt = useCallback((text) => {
    if (state.soundEnabled) speak?.(text);
  }, [state.soundEnabled, speak]);

  // ORIENT countdown
  useEffect(() => {
    if (state.phase !== "orient") return;
    clearTimer(orientTimer);
    let remaining = CFG.ORIENT_SECS;
    dispatch({ type: "TICK_ORIENT" });
    orientTimer.current = setInterval(() => {
      remaining -= 1;
      dispatch({ type: "TICK_ORIENT" });
      if (remaining <= 0) { clearTimer(orientTimer); dispatch({ type: "START_PLAY" }); }
    }, 1000);
    return () => clearTimer(orientTimer);
  }, [state.phase, state.level]);

  // PREVIEW countdown
  useEffect(() => {
    if (state.phase !== "preview") return;
    clearTimer(previewTimer);
    let remaining = CFG.PREVIEW_SECS;
    previewTimer.current = setInterval(() => {
      remaining -= 1;
      dispatch({ type: "TICK_PREVIEW" });
      if (remaining <= 0) { clearTimer(previewTimer); dispatch({ type: "ADVANCE_LEVEL" }); }
    }, 1000);
    return () => clearTimer(previewTimer);
  }, [state.phase]);

  // Elapsed clock
  useEffect(() => {
    clearTimer(elapsedTimer);
    if (state.phase === "play" && !paused) {
      elapsedTimer.current = setInterval(() => dispatch({ type: "TICK_ELAPSED" }), 1000);
    }
    return () => clearTimer(elapsedTimer);
  }, [state.phase, paused]);

  // Analysis → confetti
  useEffect(() => {
    if (state.phase !== "analysis") return;
    [orientTimer, previewTimer, elapsedTimer, flipTimer].forEach(clearTimer);
    if (!reduced) confetti({ particleCount: 160, spread: 70, origin: { y: 0.6 } });
  }, [state.phase, reduced]);

  // ── Card click ──────────────────────────────────────────────────────────────
  const handleCardClick = useCallback((cardUid) => {
    const { phase, disabled, flipped, solved, cards, consecMisses, attemptedPairs } = state;

    if (paused || phase !== "play" || disabled) return;
    if (solved.includes(cardUid)) return;

    // Deselect first card if tapped again
    if (flipped.length === 1 && flipped[0] === cardUid) {
      dispatch({ type: "DESELECT_FIRST" });
      return;
    }

    const card = cards.find((c) => c.uid === cardUid);
    if (!card) return;
    sayIt(card.name);

    if (flipped.length === 0) {
      dispatch({ type: "FLIP_FIRST", uid: cardUid });
      return;
    }

    // Second card picked — evaluate
    const firstCard = cards.find((c) => c.uid === flipped[0]);
    dispatch({ type: "FLIP_SECOND", uid: cardUid });  // totalAttempts += 1

    if (firstCard?.id === card.id) {
      // ✅ MATCH
      // isFirstTry = true only if no previous MISS was recorded for this emotionId
      const isFirstTry = !attemptedPairs[card.id];
      dispatch({ type: "MATCH", isFirstTry });
      sayIt(CFG.MATCH_PHRASE);
    } else {
      // ❌ MISS — record firstCard's emotionId as "already attempted"
      dispatch({ type: "MISS", emotionId: firstCard?.id });
      const delay = Math.min(
        CFG.BASE_FLIP_MS + (consecMisses + 1) * CFG.MISS_PENALTY_MS,
        CFG.MAX_FLIP_MS,
      );
      clearTimer(flipTimer);
      flipTimer.current = setTimeout(() => dispatch({ type: "CLEAR_FLIPPED" }), delay);
    }
  }, [state, paused, sayIt]);

  // Score builder
  const buildScore = useCallback(() => computeScore({
    firstTryMatches:    state.totalFirstTry,
    totalPossiblePairs: state.totalPossible,
    matchedPairs:       state.totalMatched,
    attempts:           state.totalAttempts,
    hintsUsed:          state.hintsUsed,
  }), [state]);

  // Finish
  const handleFinish = useCallback(() => {
    const score = buildScore();
    onComplete?.({
      score:           score.total,
      grade:           score.grade.label,
      firstTryMatches: score.firstTryMatches,
      attempts:        score.attempts,
      matchedPairs:    score.matchedPairs,
      hintsUsed:       score.hintsUsed,
      levelsCompleted: state.level,
      totalTime:       state.elapsed,
      completed:       state.level === CFG.TOTAL_LEVELS,
    });
    closeModal?.();
  }, [state, buildScore, onComplete, closeModal]);

  // ── Render ──────────────────────────────────────────────────────────────────
  if (state.phase === "analysis") {
    return <AnalysisScreen score={buildScore()} elapsed={state.elapsed} onFinish={handleFinish} t={t} />;
  }

  if (state.phase === "preview") {
    return <LevelPreview nextLevel={state.level + 1} secs={state.previewSecs} />;
  }

  const isOrienting = state.phase === "orient";
  const cols        = CFG.COLS[state.level];

  return (
    <div style={{ padding: "14px 12px", position: "relative", userSelect: "none" }}>

      <AnimatePresence>
        {showSettings && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0, zIndex: 30, borderRadius: 18 }}>
            <SettingsPanel state={state} dispatch={dispatch} onClose={() => setShowSettings(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {paused && !showSettings && <PauseOverlay onResume={() => setPaused(false)} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", background: "#eef2ff", padding: "4px 12px", borderRadius: 20 }}>
          Level {state.level} / {CFG.TOTAL_LEVELS}
        </span>
        {state.showTimer && (
          <span style={{ fontSize: 15, fontWeight: 700, color: "#475569", fontVariantNumeric: "tabular-nums" }}>
            {fmt(state.elapsed)}
          </span>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setPaused((p) => !p)} aria-label={paused ? "Resume" : "Pause"}
            style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "6px 10px", cursor: "pointer", fontSize: 16 }}>
            {paused ? "▶" : "⏸"}
          </button>
          <button onClick={() => setShowSettings(true)} aria-label="Settings"
            style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "6px 10px", cursor: "pointer", fontSize: 16 }}>
            ⚙️
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 14, height: 6, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
        <motion.div
          animate={{ width: state.cards.length > 0 ? `${(state.solved.length / state.cards.length) * 100}%` : "0%" }}
          transition={{ type: "spring", stiffness: 80 }}
          style={{ height: "100%", background: "linear-gradient(90deg,#6366f1,#3b82f6)", borderRadius: 4 }}
        />
      </div>

      {/* Hint banner */}
      <AnimatePresence>
        {state.consecMisses >= CFG.HINT_AFTER && (
          <motion.p key="hint" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ margin: "0 0 10px", textAlign: "center", fontSize: 13, color: "#8b5cf6", fontWeight: 600 }}>
            💡 A matching pair is highlighted — look carefully!
          </motion.p>
        )}
      </AnimatePresence>

      {/* Card grid */}
      <div style={{ position: "relative" }}>
        {isOrienting && <OrientOverlay secs={state.orientSecs} />}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}
          role="grid" aria-label={`Emotion match board level ${state.level}`}>
          {state.cards.map((card) => {
            const isFlipped = state.flipped.includes(card.uid);
            const isSolved  = state.solved.includes(card.uid);
            const hinted    = state.hintEmotionId === card.id && !isSolved;
            const revealed  = isFlipped || isSolved || isOrienting;
            return (
              <CardTile key={card.uid} card={card} revealed={revealed} hinted={hinted}
                showLabels={state.showLabels} reduced={reduced}
                onClick={() => handleCardClick(card.uid)} />
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 14, fontSize: 13, color: "#94a3b8" }}>
        <span>🎯 {state.totalMatched} pair{state.totalMatched !== 1 ? "s" : ""} found</span>
        {state.consecCorrect >= 3 && (
          <span style={{ color: "#10b981", fontWeight: 700 }}>🔥 {state.consecCorrect} in a row!</span>
        )}
        {state.hintsUsed > 0 && (
          <span style={{ color: "#f59e0b", fontWeight: 600 }}>💡 {state.hintsUsed} hint{state.hintsUsed !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* End session */}
      <div style={{ textAlign: "center", marginTop: 14 }}>
        <button onClick={() => dispatch({ type: "GO_ANALYSIS" })} style={{
          background: "none", border: "1px solid #e2e8f0",
          borderRadius: 20, padding: "6px 18px",
          fontSize: 13, color: "#94a3b8", cursor: "pointer",
        }}>
          End session & see score
        </button>
      </div>
    </div>
  );
};

export default EmotionMatchGame;