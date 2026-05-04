import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import {
  Card,
  Table,
  Button,
  Modal,
  Badge,
  ProgressBar,
  Form,
  Spinner,
} from "react-bootstrap";
import {
  FaVideo,
  FaPlay,
  FaBookmark,
  FaEdit,
  FaSave,
  FaChartBar,
} from "react-icons/fa";

const TherapistVideoDashboard = () => {
  const { user } = useContext(AuthContext);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [bookmarks, setBookmarks] = useState([]);

  const therapistId = user?.id;

  useEffect(() => {
    console.log("👨‍⚕️ TherapistDashboard useEffect - therapistId:", therapistId);
    if (therapistId) {
      console.log("Calling fetchVideos");
      fetchVideos();
    } else {
      console.log("No therapistId, setting loading false");
      setLoading(false);
    }
  }, [therapistId]);

  /**
   * Robust JSON Parser
   * Handles objects, single-stringified JSON, and double-stringified JSON
   */
  const safeParse = (data, fallback) => {
    if (!data || data === "null" || data === "undefined") return fallback;
    if (typeof data === "object") return data;

    try {
      let parsed = JSON.parse(data);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      return parsed;
    } catch (e) {
      console.error("❌ Parse Error on:", data);
      return fallback;
    }
  };

  /**
   * Inline gaze summary calculator — no external dependency
   */
  const recalculateGazeSummary = (gazeData) => {
    if (!gazeData || gazeData.length === 0) {
      return {
        avgAttentionScore: 0,
        faceDetectionRate: 0,
        engagementLevel: "Low",
      };
    }

    const detectedFrames = gazeData.filter((f) => f.faceDetected);
    const avgAttentionScore =
      detectedFrames.length > 0
        ? detectedFrames.reduce((sum, f) => sum + (f.attentionScore || 0), 0) /
          detectedFrames.length
        : 0;
    const faceDetectionRate = (detectedFrames.length / gazeData.length) * 100;
    const engagementLevel =
      avgAttentionScore > 70
        ? "High"
        : avgAttentionScore > 40
          ? "Medium"
          : "Low";

    return { avgAttentionScore, faceDetectionRate, engagementLevel };
  };

  const fetchVideos = async () => {
    console.log("🔄 fetchVideos called");
    setLoading(true);
    try {
      console.log(
        "🌐 Making API call to:",
        `http://localhost:4000/api/facecapture/videos/therapist/${therapistId}`,
      );
      const response = await axios.get(
        `http://localhost:4000/api/facecapture/videos/therapist/${therapistId}`,
      );
      console.log("📡 API response status:", response.status);
      console.log("📦 Raw response data:", response.data);

      const rawData = Array.isArray(response.data) ? response.data : [];
      console.log("📊 rawData length:", rawData.length);

      const processedVideos = rawData.map((video) => {
        // 1. Parse gazeData and gazeSummary

        console.log(`📹 Video ${video._id}`);
        console.log(`   gazeData type:`, typeof video.gazeData);
        console.log(
          `   gazeData raw (first 100 chars):`,
          String(video.gazeData).substring(0, 100),
        );
        console.log(`   gazeSummary raw:`, video.gazeSummary);

        const gazeData = safeParse(video.gazeData, []);
        let gazeSummary = safeParse(video.gazeSummary, null);

        console.log(
          `🔎 Video ${video._id} | gazeSummary after parse:`,
          gazeSummary,
        );

        // 2. Recalculate if missing, zeroed out, or invalid
        const isInvalid =
          !gazeSummary ||
          typeof gazeSummary.avgAttentionScore === "undefined" ||
          (gazeSummary.avgAttentionScore === 0 && gazeData.length > 0);

        if (isInvalid) {
          console.log(`⚠️ Recalculating gazeSummary for video ${video._id}...`);
          gazeSummary = recalculateGazeSummary(gazeData);
          console.log(`✅ Recalculated:`, gazeSummary);
        }

        // 3. Return final structure
        return {
          ...video,
          type: 'video',
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

      const combined = [...processedVideos, ...gameSessions].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      setVideos(combined);
    } catch (error) {
      console.error("❌ API Fetch Failed:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = async () => {
    if (!selectedVideo) return;
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
      alert("Analysis saved successfully");
      fetchVideos();
      setShowPlayer(false);
    } catch (error) {
      alert("Failed to save analysis");
    }
  };

  const getScoreColor = (score) => {
    const numScore = Number(score);
    if (numScore > 70) return "success";
    if (numScore > 40) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Synchronizing Session Data...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaVideo className="me-2 text-primary" /> Patient Session Videos (
          {videos.length})
        </h2>
        <Button variant="outline-secondary" size="sm" onClick={fetchVideos}>
          Refresh Data
        </Button>
      </div>

      <Table striped hover responsive className="shadow-sm border">
        <thead className="table-dark">
          <tr>
            <th>Patient ID</th>
            <th>Date & Time</th>
            <th>Type/Duration</th>
            <th>Attn/Score</th>
            <th>Face/Acc</th>
            <th>Engmt/Lvl</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video) => (
            <tr key={video._id} className="align-middle">
              <td>
                <small className="text-muted">
                  {video.userId?.substring(0, 8)}...
                </small>
              </td>
              <td>{new Date(video.timestamp).toLocaleString()}</td>
              {video.type === "video" ? (
                <>
                  <td>
                    {Math.floor(video.duration / 60)}:
                    {(video.duration % 60).toString().padStart(2, "0")}
                  </td>
                  <td>
                    <Badge bg={getScoreColor(video.gazeSummary.avgAttentionScore)}>
                      {Math.round(video.gazeSummary.avgAttentionScore)}%
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      bg={getScoreColor(video.gazeSummary.faceDetectionRate)}
                      pill
                    >
                      {Math.round(video.gazeSummary.faceDetectionRate)}%
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      bg={
                        video.gazeSummary.engagementLevel === "High"
                          ? "success"
                          : "warning"
                      }
                    >
                      {video.gazeSummary.engagementLevel}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={video.reviewed ? "success" : "secondary"}>
                      {video.reviewed ? "Reviewed" : "Pending"}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedVideo(video);
                        setShowPlayer(true);
                        setNotes(video.therapistNotes || "");
                        setBookmarks(video.highlights || []);
                      }}
                    >
                      <FaPlay className="me-1" /> Review
                    </Button>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    <Badge bg="info">🎮 {video.gameName}</Badge>
                  </td>
                  <td>
                    <Badge bg={getScoreColor(video.score)}>
                      Score: {video.score}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getScoreColor(video.accuracy)} pill>
                      Acc: {video.accuracy || 0}%
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="primary">
                      Level: {video.levelReached || 1}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="success">Played</Badge>
                  </td>
                  <td>
                    <span className="text-muted small">No Video</span>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showPlayer} onHide={() => setShowPlayer(false)} size="xl">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Session Analysis: {selectedVideo?.userId}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVideo && (
            <div className="row">
              <div className="col-lg-8">
                <div className="bg-black rounded shadow-sm overflow-hidden mb-3">
                  <video
                    controls
                    className="w-100"
                    style={{ maxHeight: "60vh" }}
                    src={`http://localhost:4000/api/facecapture/video/stream/${selectedVideo._id}`}
                    onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                  />
                </div>

                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white fw-bold">
                    <FaChartBar className="me-2 text-info" /> Attention Timeline
                  </Card.Header>
                  <Card.Body>
                    <div
                      className="d-flex align-items-end"
                      style={{
                        height: "80px",
                        gap: "2px",
                        background: "#f8f9fa",
                        padding: "10px",
                        borderRadius: "8px",
                      }}
                    >
                      {selectedVideo.gazeData.length > 0 ? (
                        selectedVideo.gazeData.map((point, idx) => (
                          <div
                            key={idx}
                            style={{
                              flex: 1,
                              height: `${point.attentionScore}%`,
                              backgroundColor:
                                getScoreColor(point.attentionScore) ===
                                "success"
                                  ? "#198754"
                                  : "#ffc107",
                              minWidth: "2px",
                            }}
                            title={`Frame: ${idx + 1} | Score: ${point.attentionScore}%`}
                          />
                        ))
                      ) : (
                        <div className="w-100 text-center text-muted small">
                          No frame-by-frame gaze data available
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </div>

              <div className="col-lg-4">
                <Card className="mb-3 border-0 shadow-sm bg-light">
                  <Card.Body>
                    <h6 className="fw-bold mb-3 text-uppercase small">
                      Key Performance Indicators
                    </h6>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small">Average Attention</span>
                        <span className="fw-bold">
                          {Math.round(
                            selectedVideo.gazeSummary.avgAttentionScore,
                          )}
                          %
                        </span>
                      </div>
                      <ProgressBar
                        style={{ height: "10px" }}
                        now={selectedVideo.gazeSummary.avgAttentionScore}
                        variant={getScoreColor(
                          selectedVideo.gazeSummary.avgAttentionScore,
                        )}
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center small">
                      <span className="text-muted">Gaze Trackability:</span>
                      <span className="fw-bold">
                        {Math.round(
                          selectedVideo.gazeSummary.faceDetectionRate,
                        )}
                        %
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center small mt-2">
                      <span className="text-muted">Engagement Level:</span>
                      <Badge
                        bg={
                          selectedVideo.gazeSummary.engagementLevel === "High"
                            ? "success"
                            : "warning"
                        }
                      >
                        {selectedVideo.gazeSummary.engagementLevel}
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small">
                    Clinical Observations
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={7}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Document patient engagement, repetitive behaviors, or eye-contact patterns..."
                  />
                </Form.Group>

                <Button
                  variant="success"
                  className="w-100 py-2 shadow-sm"
                  onClick={saveAnalysis}
                >
                  <FaSave className="me-2" /> Save & Mark Reviewed
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TherapistVideoDashboard;
