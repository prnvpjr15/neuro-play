import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Modal } from 'react-bootstrap';
import { faceCaptureService } from '../services/faceCaptureService';

const FaceDataViewer = ({ userId }) => {
  const [faceData, setFaceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (userId) {
      loadFaceData();
    }
  }, [userId]);

  const loadFaceData = async () => {
    setLoading(true);
    try {
      const data = await faceCaptureService.getUserFaceData({
        limit: 50
      });
      setFaceData(data);
    } catch (error) {
      console.error('Error loading face data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'success',
      sad: 'info',
      angry: 'danger',
      surprised: 'warning',
      neutral: 'secondary',
      fearful: 'dark',
      disgusted: 'secondary',
      unknown: 'light'
    };
    return colors[emotion] || 'light';
  };

  return (
    <>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Captured Face Data</h5>
          <Button variant="outline-primary" size="sm" onClick={loadFaceData}>
            Refresh
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : faceData.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No face data captured yet
            </div>
          ) : (
            <Row className="g-3">
              {faceData.map((item) => (
                <Col md={4} lg={3} key={item._id}>
                  <Card className="border-0 shadow-sm hover-shadow">
                    <div 
                      className="position-relative cursor-pointer"
                      onClick={() => setSelectedImage(item)}
                    >
                      <Card.Img 
                        variant="top" 
                        src={`http://localhost:4000/${item.imagePath}`}
                        style={{ height: '150px', objectFit: 'cover' }}
                      />
                      <Badge 
                        bg={getEmotionColor(item.emotion)}
                        className="position-absolute top-0 end-0 m-2"
                      >
                        {item.emotion}
                      </Badge>
                    </div>
                    <Card.Body className="p-2">
                      <small className="text-muted d-block">
                        {formatDate(item.timestamp)}
                      </small>
                      <small className="d-block">
                        Confidence: {item.confidence}%
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Image Preview Modal */}
      <Modal 
        show={!!selectedImage} 
        onHide={() => setSelectedImage(null)}
        size="lg"
        centered
      >
        {selectedImage && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                Face Capture - {formatDate(selectedImage.timestamp)}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
              <img
                src={`http://localhost:4000/${selectedImage.imagePath}`}
                alt="Face capture"
                className="img-fluid rounded-3"
              />
              <div className="mt-3">
                <Badge bg={getEmotionColor(selectedImage.emotion)} className="me-2">
                  Emotion: {selectedImage.emotion}
                </Badge>
                <Badge bg="info" className="me-2">
                  Confidence: {selectedImage.confidence}%
                </Badge>
                <Badge bg="secondary">
                  Session: {selectedImage.sessionId}
                </Badge>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>
    </>
  );
};

export default FaceDataViewer;