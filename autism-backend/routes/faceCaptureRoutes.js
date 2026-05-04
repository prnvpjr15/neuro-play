const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const FaceCapture = require("../models/FaceCapture");

// ─── Multer storage ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId   = req.body.userId || "unknown";
    const uploadDir = `uploads/videos/${userId}`;          // ✅ per-user folder on disk
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sessionId = req.body.sessionId || "unknown_session";
    const ts        = Date.now();
    const ext       = path.extname(file.originalname);
    if (file.fieldname === "video")     cb(null, `${sessionId}_${ts}${ext}`);
    else if (file.fieldname === "thumbnail") cb(null, `${sessionId}_${ts}_thumb.jpg`);
    else cb(null, `${sessionId}_${ts}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// ─── POST /api/facecapture/video — Upload session ────────────────────────────
router.post(
  "/video",
  upload.fields([{ name: "video", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { userId, sessionId, duration, timestamp, gazeData, gazeSummary, faceBlurred } = req.body;

      // Safely parse incoming FormData strings
      let parsedGazeData    = [];
      let parsedGazeSummary = { avgAttentionScore: 0, faceDetectionRate: 0, engagementLevel: "Low" };

      try { if (gazeData)    parsedGazeData    = typeof gazeData    === "string" ? JSON.parse(gazeData)    : gazeData;    } catch (e) { console.error("gazeData parse error:", e.message); }
      try { if (gazeSummary) parsedGazeSummary = typeof gazeSummary === "string" ? JSON.parse(gazeSummary) : gazeSummary; } catch (e) { console.error("gazeSummary parse error:", e.message); }

      if (!req.files || !req.files.video)
        return res.status(400).json({ error: "No video file uploaded" });

      const videoFile     = req.files.video[0];
      const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

      const videoCapture = new FaceCapture({
        userId,
        type:          "video",
        videoPath:     videoFile.path,
        videoFilename: videoFile.filename,
        thumbnailPath: thumbnailFile ? thumbnailFile.path : null,
        duration:      parseInt(duration),
        sessionId,
        startTime:     new Date(timestamp),
        endTime:       new Date(),
        framesPerSecond: 30,
        resolution:    "1280x720",
        emotion:       "neutral",
        confidence:    0,
        timestamp:     new Date(timestamp),
        reviewed:      false,
        faceBlurred:   faceBlurred === "true" || faceBlurred === true,
        gazeData:      parsedGazeData,
        gazeSummary:   parsedGazeSummary,
      });

      await videoCapture.save();
      console.log(`✅ Saved session for user ${userId} | gazeData frames: ${parsedGazeData.length}`);

      res.json({
        success:      true,
        message:      "Video session saved successfully",
        sessionId,
        videoUrl:     `/api/facecapture/video/stream/${videoCapture._id}`,
        thumbnailUrl: thumbnailFile ? `/api/facecapture/video/thumbnail/${videoCapture._id}` : null,
        duration,
        videoId:      videoCapture._id,
        gazeAnalysis: parsedGazeSummary,
      });
    } catch (error) {
      console.error("❌ Video upload error:", error);
      res.status(500).json({ error: "Failed to save video session", details: error.message });
    }
  }
);

// ─── GET /api/facecapture/video/stream/:id ────────────────────────────────────
router.get("/video/stream/:id", async (req, res) => {
  try {
    const capture = await FaceCapture.findById(req.params.id);
    if (!capture || !capture.videoPath) return res.status(404).json({ error: "Video not found" });

    const videoPath = path.resolve(capture.videoPath);
    if (!fs.existsSync(videoPath)) return res.status(404).json({ error: "Video file not found on disk" });

    const stat     = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range    = req.headers.range;

    if (range) {
      const parts     = range.replace(/bytes=/, "").split("-");
      const start     = parseInt(parts[0], 10);
      const end       = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      res.writeHead(206, {
        "Content-Range":  `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges":  "bytes",
        "Content-Length": chunksize,
        "Content-Type":   "video/webm",
      });
      fs.createReadStream(videoPath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { "Content-Length": fileSize, "Content-Type": "video/webm" });
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error("Stream error:", error);
    res.status(500).json({ error: "Failed to stream video" });
  }
});

// ─── GET /api/facecapture/video/list/:userId — Patient's own sessions ─────────
router.get("/video/list/:userId", async (req, res) => {
  try {
    const videos = await FaceCapture.find({ userId: req.params.userId, type: "video" })
      .sort({ timestamp: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// ─── GET /api/facecapture/videos/therapist/:therapistId — All sessions (grouped by userId on frontend) ──
router.get("/videos/therapist/:therapistId", async (req, res) => {
  try {
    console.log("👨‍⚕️ Fetching all videos for therapist:", req.params.therapistId);

    const mongoose = require("mongoose");
    const videos = await FaceCapture.aggregate([
      { $match: { type: "video" } },
      {
        $addFields: {
          userIdObj: {
            $cond: [
              { $regexMatch: { input: "$userId", regex: "^[0-9a-f]{24}$", options: "i" } },
              { $toObjectId: "$userId" },
              null
            ]
          }
        }
      },
      {
        $lookup: {
          from: "users", // collection name for User model
          localField: "userIdObj",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $addFields: {
          username: { $arrayElemAt: ["$user.username", 0] }
        }
      },
      {
        $project: {
          user: 0, // remove the user array from output
          userIdObj: 0 // remove temp field
        }
      },
      { $sort: { timestamp: -1 } },
      { $limit: 200 }
    ]);

    console.log(`📹 Found ${videos.length} videos across all patients`);

    // Sanitize: ensure gazeData & gazeSummary are always valid objects before sending
    const sanitized = videos.map(v => {
      v.gazeData = Array.isArray(v.gazeData) ? v.gazeData : [];

      v.gazeSummary = (v.gazeSummary && typeof v.gazeSummary === "object")
        ? v.gazeSummary
        : { avgAttentionScore: 0, faceDetectionRate: 0, engagementLevel: "Low" };

      // Ensure username is a string, fallback to userId if not found
      v.username = typeof v.username === "string" ? v.username : v.userId;

      return v;
    });

    res.json(sanitized);
  } catch (error) {
    console.error("❌ Failed to fetch therapist videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// ─── POST /api/facecapture/videos/:id/analyze — Save therapist review ─────────
router.post("/videos/:id/analyze", async (req, res) => {
  try {
    const { therapistNotes, bookmarks, reviewed, reviewedBy, reviewedAt } = req.body;

    const updated = await FaceCapture.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          therapistNotes,
          highlights: bookmarks || [],
          reviewed:   reviewed  || false,
          reviewedBy,
          reviewedAt: reviewedAt ? new Date(reviewedAt) : new Date(),
          updatedAt:  new Date(),
        },
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Video not found" });

    console.log(`✅ Video ${req.params.id} marked as reviewed by ${reviewedBy}`);
    res.json({ success: true, message: "Analysis saved", video: updated });
  } catch (error) {
    console.error("❌ Analyze save error:", error);
    res.status(500).json({ error: "Failed to save analysis", details: error.message });
  }
});

module.exports = router;