const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const FaceCapture = require("../models/FaceCapture");

// Configure storage for videos
// Configure storage for videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ Read userId from the request
    const userId = req.body.userId || "unknown";
    const uploadDir = `uploads/videos/${userId}`;

    console.log("📁 Creating upload directory:", uploadDir);
    console.log("👤 UserId from request:", req.body.userId);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("✅ Created directory:", uploadDir);
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sessionId = req.body.sessionId || "unknown_session";
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);

    console.log("📝 Creating filename for:", file.fieldname);
    console.log("🎬 SessionId from request:", req.body.sessionId);

    if (file.fieldname === "video") {
      const filename = `${sessionId}_${timestamp}${extension}`;
      console.log("🎥 Video filename:", filename);
      cb(null, filename);
    } else if (file.fieldname === "thumbnail") {
      const filename = `${sessionId}_${timestamp}_thumb.jpg`;
      console.log("🖼️ Thumbnail filename:", filename);
      cb(null, filename);
    } else {
      cb(null, `${sessionId}_${timestamp}${extension}`);
    }
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
});

// POST /api/facecapture/video - Upload video
router.post(
  "/video",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("✅ Route /api/facecapture/video hit!");
      console.log("📹 Video upload request received");
      console.log("Method:", req.method);
      console.log("URL:", req.url);
      console.log("Body:", req.body);
      console.log("Files:", req.files);

      const { userId, sessionId, duration, timestamp, gazeData, gazeSummary } =
        req.body;

      const parsedGazeData = gazeData ? JSON.parse(gazeData) : [];
      const parsedGazeSummary = gazeSummary ? JSON.parse(gazeSummary) : null;

      if (!req.files || !req.files.video) {
        return res.status(400).json({ error: "No video file uploaded" });
      }

      const videoFile = req.files.video[0];
      const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

      // Create video record in database
      const videoCapture = new FaceCapture({
        userId,
        type: "video",
        videoPath: videoFile.path,
        videoFilename: videoFile.filename,
        thumbnailPath: thumbnailFile ? thumbnailFile.path : null,
        duration: parseInt(duration),
        sessionId,
        startTime: new Date(timestamp),
        endTime: new Date(),
        framesPerSecond: 30,
        resolution: "1280x720",
        emotion: "neutral", // Default - you can analyze this later
        confidence: 0,
        sessionId,
        timestamp: new Date(timestamp),
        reviewed: false,
        gazeData: parsedGazeData,
        gazeSummary: parsedGazeSummary,
      });

      await videoCapture.save();

      res.json({
        success: true,
        message: "Video session saved successfully",
        sessionId,
        videoUrl: `/api/facecapture/video/stream/${videoCapture._id}`,
        thumbnailUrl: thumbnailFile
          ? `/api/facecapture/video/thumbnail/${videoCapture._id}`
          : null,
        duration,
        videoId: videoCapture._id,
        gazeAnalysis: parsedGazeSummary,
      });
    } catch (error) {
      console.error("❌ Video upload error:", error);
      res.status(500).json({
        error: "Failed to save video session",
        details: error.message,
      });
    }
  },
);

// GET /api/facecapture/video/stream/:id - Stream video
router.get("/video/stream/:id", async (req, res) => {
  try {
    const capture = await FaceCapture.findById(req.params.id);

    if (!capture || !capture.videoPath) {
      return res.status(404).json({ error: "Video not found" });
    }

    const videoPath = path.resolve(capture.videoPath);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: "Video file not found" });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/webm",
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/webm",
      };

      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error("Stream error:", error);
    res.status(500).json({ error: "Failed to stream video" });
  }
});

// GET /api/facecapture/video/list/:userId - List user videos
router.get("/video/list/:userId", async (req, res) => {
  try {
    const videos = await FaceCapture.find({
      userId: req.params.userId,
      type: "video",
    }).sort({ timestamp: -1 });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// GET /api/facecapture/videos/therapist/:therapistId - List all videos for therapist's patients
router.get("/videos/therapist/:therapistId", async (req, res) => {
  try {
    console.log("👨‍⚕️ Fetching videos for therapist:", req.params.therapistId);

    // In a real app, you would:
    // 1. First get all patients assigned to this therapist
    // 2. Then get videos for those patients

    // For now, let's return ALL videos (you'll need to filter by therapist's patients)
    const videos = await FaceCapture.find({
      type: "video",
    })
      .sort({ timestamp: -1 })
      .limit(50); // Limit for performance

    console.log(`📹 Found ${videos.length} videos`);
    res.json(videos);
  } catch (error) {
    console.error("❌ Failed to fetch therapist videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

module.exports = router;
