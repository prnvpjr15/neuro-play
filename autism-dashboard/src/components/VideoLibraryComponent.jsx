import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card, Row, Col, Button, Form,
  Badge, InputGroup, Pagination,
  Dropdown, Spinner, Alert, Modal
} from 'react-bootstrap';
// no inline player for external YouTube links; open in new tab instead
import {
  FaVideo, FaSearch, FaFilter, FaSort,
  FaCalendar, FaClock, FaFolder, FaEye,
  FaPlay, FaTrash, FaEdit, FaDownload,
  FaList, FaThLarge, FaUpload
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
// ✅ FIXED: Import from the actual Player file, not this Library file
import VideoPlayerComponent from './VideoPlayerComponent';
import VideoUploadComponent from './VideoUploadComponent';

const VideoLibraryComponent = ({ userId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
   // { value: 'therapy_session', label: 'Therapy Sessions' },
    //{ value: 'progress_tracking', label: 'Progress Tracking' },
    { value: 'educational', label: 'Educational' },
    { value: 'exercise', label: 'Exercises' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'size_large', label: 'Size (Large First)' },
    { value: 'size_small', label: 'Size (Small First)' }
  ];

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = {
        page: currentPage,
        limit: 12,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchQuery || undefined,
        sort: sortBy
      };

      const response = await axios.get('http://localhost:4000/api/videos', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setVideos(response.data.videos);
        setTotalPages(response.data.pagination.totalPages);
        // If there are no user videos, show helpful sample videos
        if (!response.data.videos || response.data.videos.length === 0) {
          setVideos(sampleVideos);
          setTotalPages(1);
        }
      }
    } catch (err) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [currentPage, categoryFilter, sortBy]);

  // Sample videos to show for new users
  const sampleVideos = [
    {
      _id: 'sample-1',
      title: 'Brushing Teeth — Animated Guide (Sample)',
      description: 'A short, friendly animated guide showing proper tooth brushing steps for kids.',
      category: 'educational',
      isPrivate: false,
      // YouTube ID and thumbnail preview
      youtubeId: 'w6k0J2lW5_0',
      externalUrl: 'https://www.youtube.com/watch?v=BapR9J86ZZw',
      //thumbnail: 'https://img.youtube.com/vi/w6k0J2lW5_0/hqdefault.jpg',
      uploadedAt: new Date().toISOString(),
      fileSize: 1024 * 1024 * 2,
      duration: 45
    },
    {
      _id: 'sample-2',
      title: 'Hand Washing Song — Animated (Sample)',
      description: 'Animated clip encouraging children to wash hands and practice hygiene.',
      category: 'educational',
      isPrivate: false,
      youtubeId: 'eG2cZsI8K3Q',
      externalUrl: 'https://www.youtube.com/watch?v=S9VjeIWLnEg',
      //thumbnail: 'https://img.youtube.com/vi/eG2cZsI8K3Q/hqdefault.jpg',
      uploadedAt: new Date().toISOString(),
      fileSize: 1024 * 1024 * 1,
      duration: 30
    },
    {
      _id: 'sample-3',
      title: 'Bedtime Routine — Animated (Sample)',
      description: 'A gentle animated clip to help kids learn a calming bedtime routine.',
      category: 'educational',
      isPrivate: false,
      youtubeId: 'dQw4w9WgXcQ',
      externalUrl: 'https://www.youtube.com/watch?v=Km3tqza7C8E',
      //thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      uploadedAt: new Date().toISOString(),
      fileSize: 1024 * 1024 * 3,
      duration: 60
    }
  ];

  const playExternal = (video) => {
    if (!video || !video.externalUrl) return;
    window.open(video.externalUrl, '_blank', 'noopener');
  };

  useEffect(() => {
    // Debounced search
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchVideos();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle deletion initiated from the Library Grid/List (Dropdown menu)
  const handleDelete = async (videoId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from state
      setVideos(prev => prev.filter(v => v._id !== videoId));
      setShowDeleteConfirm(null);
      
      // Refresh if needed (if last item on page deleted)
      if (videos.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Helper to remove video from local state (used when Player handles the API call)
  const handleLocalRemove = (videoId) => {
    setVideos(prev => prev.filter(v => v._id !== videoId));
    if (videos.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' Bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getCategoryColor = (category) => {
    const colors = {
      therapy_session: 'primary',
      progress_tracking: 'success',
      educational: 'info',
      exercise: 'warning',
      other: 'secondary'
    };
    return colors[category] || 'secondary';
  };

  const renderVideoCard = (video) => (
    <motion.div
      key={video._id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
        {/* Thumbnail */}
        <div 
          className="position-relative" 
          style={{ paddingTop: '56.25%', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
          onClick={() => video.externalUrl ? playExternal(video) : setSelectedVideo(video._id)}
        >
            {video.thumbnail ? (
            <img
              src={video.thumbnail && (video.thumbnail.startsWith('http') ? video.thumbnail : `http://localhost:4000/${video.thumbnail}`)}
              alt={video.title}
              className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            />
          ) : (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark text-white">
              <FaVideo size={48} />
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="position-absolute top-50 start-50 translate-middle">
            <Button
              variant="light"
              size="lg"
              className="rounded-circle p-3 opacity-75"
              onClick={(e) => {
                e.stopPropagation();
                video.externalUrl ? playExternal(video) : setSelectedVideo(video._id);
              }}
            >
              <FaPlay />
            </Button>
          </div>
          
          {/* Duration Badge */}
          {video.duration > 0 && (
            <Badge 
              bg="dark" 
              className="position-absolute bottom-0 end-0 m-2 opacity-75"
            >
              <FaClock className="me-1" />
              {Math.round(video.duration)}s
            </Badge>
          )}
        </div>
        
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Badge bg={getCategoryColor(video.category)} className="mb-2">
              <FaFolder className="me-1" />
              {video.category?.replace('_', ' ')}
            </Badge>
            {video.isPrivate && (
              <Badge bg="secondary" className="mb-2">
                <FaEye className="me-1" />
                Private
              </Badge>
            )}
          </div>
          
          <h6 className="fw-bold text-truncate" title={video.title}>
            {video.title}
          </h6>
          
          <p className="small text-muted mb-2 text-truncate-2" style={{ height: '2.5rem' }}>
            {video.description || 'No description'}
          </p>
          
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <small className="text-muted">
              <FaCalendar className="me-1" />
              {formatDate(video.uploadedAt)}
            </small>
            <small className="text-muted">
              {formatFileSize(video.fileSize)}
            </small>
          </div>
        </Card.Body>
        
        <Card.Footer className="bg-white border-0 pt-0">
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              className="flex-grow-1"
              onClick={() => video.externalUrl ? playExternal(video) : setSelectedVideo(video._id)}
            >
              <FaPlay className="me-1" />
              Play
            </Button>
            
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                size="sm"
                className="px-2"
              />
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => video.externalUrl ? playExternal(video) : setSelectedVideo(video._id)}>
                  <FaPlay className="me-2" />
                  Play
                </Dropdown.Item>
                <Dropdown.Item onClick={() => {/* Edit handled in Player */ setSelectedVideo(video._id); }}>
                  <FaEdit className="me-2" />
                  Edit
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item 
                  onClick={() => setShowDeleteConfirm(video._id)}
                  className="text-danger"
                >
                  <FaTrash className="me-2" />
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card.Footer>
      </Card>
    </motion.div>
  );

  const renderListView = () => (
    <div className="list-view">
      {videos.map((video) => (
        <motion.div
          key={video._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-3"
        >
          <Card className="border-0 shadow-sm rounded-4">
            <Row className="g-0">
              <Col md={3}>
                <div 
                  className="position-relative h-100 cursor-pointer"
                  onClick={() => setSelectedVideo(video._id)}
                  style={{ minHeight: '150px' }}
                >
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail && (video.thumbnail.startsWith('http') ? video.thumbnail : `http://localhost:4000/${video.thumbnail}`)}
                      alt={video.title}
                      className="w-100 h-100 object-fit-cover rounded-start"
                    />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-dark text-white rounded-start">
                      <FaVideo size={32} />
                    </div>
                  )}
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <Button
                      variant="light"
                      size="sm"
                      className="rounded-circle opacity-75"
                    >
                      <FaPlay />
                    </Button>
                  </div>
                </div>
              </Col>
              
              <Col md={9}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Badge bg={getCategoryColor(video.category)}>
                          {video.category?.replace('_', ' ')}
                        </Badge>
                        {video.isPrivate && (
                          <Badge bg="secondary">
                            <FaEye className="me-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      
                      <h6 className="fw-bold mb-2">{video.title}</h6>
                      <p className="text-muted small mb-3">
                        {video.description || 'No description provided'}
                      </p>
                      
                      <div className="d-flex gap-4">
                        <small className="text-muted">
                          <FaCalendar className="me-1" />
                          {formatDate(video.uploadedAt)}
                        </small>
                        <small className="text-muted">
                          <FaClock className="me-1" />
                          {Math.round(video.duration)} seconds
                        </small>
                        <small className="text-muted">
                          {formatFileSize(video.fileSize)}
                        </small>
                      </div>
                    </div>
                    
                    <div className="d-flex flex-column gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedVideo(video._id)}
                      >
                        <FaPlay className="me-1" />
                        Play
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(video._id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="video-library">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Video Library</h4>
          <p className="text-muted small mb-0">
            {videos.length} video{videos.length !== 1 ? 's' : ''} • Manage your uploaded videos
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => setShowUploadModal(true)}
          className="rounded-pill px-4"
        >
          <FaUpload className="me-2" />
          Upload Video
        </Button>
      </div>

      {/* Filters and Controls */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="search"
                  placeholder="Search videos by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col md={3}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            
            <Col md={3}>
              <div className="d-flex gap-2">
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('grid')}
                >
                  <FaThLarge />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('list')}
                >
                  <FaList />
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading videos...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && videos.length === 0 && (
        <Card className="border-0 shadow-sm rounded-4 text-center py-5">
          <Card.Body>
            <FaVideo size={64} className="text-muted mb-3" />
            <h5>No videos found</h5>
            <p className="text-muted mb-4">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try changing your search or filters'
                : 'Upload your first video to get started'}
            </p>
            <Button
              variant="primary"
              onClick={() => setShowUploadModal(true)}
              className="rounded-pill px-4"
            >
              <FaUpload className="me-2" />
              Upload Video
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Videos Grid/List */}
      {!loading && !error && videos.length > 0 && (
        <>
          <AnimatePresence>
            {viewMode === 'grid' ? (
              <Row className="g-4">
                {videos.map((video) => (
                  <Col key={video._id} xl={3} lg={4} md={6}>
                    {renderVideoCard(video)}
                  </Col>
                ))}
              </Row>
            ) : (
              renderListView()
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <Pagination>
                <Pagination.Prev 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <Pagination.Ellipsis />
                    <Pagination.Item
                      active={totalPages === currentPage}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Pagination.Item>
                  </>
                )}
                
                <Pagination.Next 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {selectedVideo && (
        <VideoPlayerComponent
          videoId={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onDelete={(deletedId) => {
            // ✅ FIXED: Just remove from local state, don't call API again
            handleLocalRemove(deletedId);
            setSelectedVideo(null);
          }}
          onUpdate={() => fetchVideos()}
        />
      )}

      {showUploadModal && (
        <VideoUploadComponent
          show={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={() => {
            fetchVideos();
            setShowUploadModal(false);
          }}
          userId={userId}
        />
      )}

      {/* Delete Confirmation Modal for Library View deletions */}
      <Modal
        show={showDeleteConfirm !== null}
        onHide={() => setShowDeleteConfirm(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this video? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDelete(showDeleteConfirm)}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* external videos open in a new tab (YouTube) */}
    </div>
  );
};

export default VideoLibraryComponent;