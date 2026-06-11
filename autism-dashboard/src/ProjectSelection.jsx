import React, { useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { useTheme } from './ThemeContext';
import { motion } from 'framer-motion';
import api from './config/api';
import { 
  FaBrain, 
  FaGamepad, 
  FaLock, 
  FaChevronRight, 
  FaEye, 
  FaUsers, 
  FaSpa, 
  FaLightbulb,
  FaArrowRight
} from 'react-icons/fa';

export default function ProjectSelection() {
  const { user, logout } = useContext(AuthContext);
  const { colors, theme } = useTheme();
  const navigate = useNavigate();

  // Custom Projects List
  const projects = [
    {
      id: 'neuroplay',
      title: 'NeuroPlay',
      subtitle: 'Cognitive & Motor Games',
      description: 'An interactive gaming suite designed to train cognitive skills, emotion matching, fine motor, and communication through immersive mini-games.',
      icon: <FaBrain size={38} />,
      badge: 'Active & Ready',
      badgeBg: 'success',
      isActive: true,
      features: [
        'Emotion Match Memory Training',
        'Face Mimic Control & Camera Scanning',
        'Pose Imitation Gross Motor Challenges',
        'Magic Hands Finger Tracking Game',
        'Detailed Progress Analytics for Parents'
      ],
      btnText: 'Launch NeuroPlay',
      gradient: 'linear-gradient(135deg, #4f8ed9 0%, #1a5ea8 100%)',
      shadowColor: 'rgba(79, 142, 217, 0.4)'
    },
    {
      id: 'sensory_oasis',
      title: 'Sensory Oasis',
      subtitle: 'Relaxation & Calming Space',
      description: 'A calming interactive environment designed to regulate sensory overload, de-stress, and delight the senses in a safe virtual landscape.',
      icon: <FaSpa size={38} />,
      badge: 'Active & Ready',
      badgeBg: 'success',
      isActive: true,
      features: [
        'Immersive 3D Soundscapes & White Noise',
        'Kinetic Sand & Particle Simulation',
        'Dynamic interactive Lava Lamps',
        'Customizable gentle visual patterns',
        'Calming guided deep breathing guide'
      ],
      btnText: 'Launch Sensory Oasis',
      gradient: 'linear-gradient(135deg, #2d9a3b 0%, #175e21 100%)',
      shadowColor: 'rgba(45, 154, 59, 0.25)'
    },
    {
      id: 'social_connect',
      title: 'Social Connect',
      subtitle: 'Social Scenario Training',
      description: 'Practice social scenarios, conversations, and emotional cues in a safe simulated space with intelligent AI-driven peer guidance.',
      icon: <FaUsers size={38} />,
      badge: 'Coming Soon',
      badgeBg: 'secondary',
      isActive: false,
      features: [
        'Interactive conversation branching',
        'AI-driven peer feedback loops',
        'Animated Social Story Builder',
        'Community group sharing room',
        'Parent guided social scenario packs'
      ],
      btnText: 'Join Soon',
      gradient: 'linear-gradient(135deg, #9966ff 0%, #582882 100%)',
      shadowColor: 'rgba(153, 102, 255, 0.25)'
    }
  ];

  // Modern hover animations config
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 15,
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    },
    hoverActive: {
      y: -12,
      scale: 1.03,
      boxShadow: '0 20px 30px rgba(0, 0, 0, 0.15)',
      transition: { type: 'spring', stiffness: 300, damping: 15 }
    },
    hoverInactive: {
      y: -4,
      scale: 1.01,
      transition: { type: 'spring', stiffness: 200, damping: 15 }
    }
  };

  const handleLaunch = async (project) => {
    if (!project.isActive) return;
    
    if (project.id === 'neuroplay') {
      navigate('/user/neuroplay');
    } else if (project.id === 'sensory_oasis') {
      try {
        console.log('Sending launch request to backend...');
        const response = await api.post('/sensory/launch');
        if (response.data && response.data.success) {
          console.log('Sensory coach launched successfully!');
        } else {
          alert('Could not launch the Sensory game.');
        }
      } catch (err) {
        console.error('Failed to launch sensory game:', err);
        alert('Failed to connect to the backend server. Make sure the backend server is running.');
      }
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div 
      className="project-selection-wrapper py-5"
      style={{
        backgroundColor: colors.bgMain,
        color: colors.textPrimary,
        minHeight: 'calc(100vh - 56px)',
        transition: 'background-color 0.4s ease, color 0.4s ease',
        overflow: 'hidden'
      }}
    >
      <Container>
        {/* Welcome Header */}
        <motion.div 
          className="text-center mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="d-inline-block px-3 py-1 rounded-pill mb-3 shadow-sm border"
            style={{ 
              backgroundColor: colors.bgCard, 
              borderColor: colors.borderColor,
              fontSize: '14px',
              fontWeight: 600,
              color: colors.accentColor
            }}
          >
            🧑‍🎓 {user?.username || user?.email ? `Welcome back, ${user.username || user.email.split('@')[0]}` : 'Welcome!'}
          </div>
          
          <h1 className="display-4 fw-bold mb-2 tracking-tight" 
            style={{ 
              color: colors.textPrimary,
              background: theme === 'light' || theme === 'highContrast' ? 'none' : 'linear-gradient(to right, ' + colors.textPrimary + ', ' + colors.accentColor + ')',
              WebkitBackgroundClip: theme === 'light' || theme === 'highContrast' ? 'none' : 'text',
              WebkitTextFillColor: theme === 'light' || theme === 'highContrast' ? colors.textPrimary : 'transparent'
            }}
          >
            {getGreeting()}!
          </h1>
          <p className="lead mx-auto" style={{ color: colors.textSecondary, maxWidth: '600px', fontSize: '18px' }}>
            Choose an interactive platform below to play educational games, relax in the sensory room, or practice conversation skills.
          </p>
        </motion.div>

        {/* Projects Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row className="g-4 justify-content-center">
            {projects.map((project) => (
              <Col lg={4} md={6} xs={12} key={project.id}>
                <motion.div
                  variants={cardVariants}
                  whileHover={project.isActive ? 'hoverActive' : 'hoverInactive'}
                  className="h-100"
                >
                  <Card 
                    className="h-100 border-2 position-relative shadow-sm transition-all"
                    style={{
                      backgroundColor: colors.bgCard,
                      borderColor: colors.borderColor,
                      borderRadius: '24px',
                      overflow: 'hidden',
                      opacity: project.isActive ? 1 : 0.85,
                      border: project.isActive ? `2px solid ${colors.borderColor}` : `1px dashed ${colors.borderColor}`
                    }}
                  >
                    {/* Active/Lock Visual Overlay Indicator */}
                    {!project.isActive && (
                      <div className="position-absolute top-0 end-0 m-3 z-3">
                        <Badge bg="dark" className="d-flex align-items-center gap-1 px-2 py-1.5 shadow" style={{ borderRadius: '10px', fontSize: '11px', opacity: 0.9 }}>
                          <FaLock size={10} /> Locked
                        </Badge>
                      </div>
                    )}

                    {/* Gradient Header Ring */}
                    <div 
                      style={{ 
                        height: '8px', 
                        background: project.gradient 
                      }} 
                    />

                    <Card.Body className="p-4 d-flex flex-column h-100">
                      {/* Project Header */}
                      <div className="d-flex align-items-start justify-content-between mb-4">
                        <div 
                          className="rounded-4 p-3 d-flex align-items-center justify-content-center text-white"
                          style={{
                            background: project.gradient,
                            boxShadow: `0 8px 16px ${project.shadowColor}`,
                            borderRadius: '18px'
                          }}
                        >
                          {project.icon}
                        </div>
                        <Badge 
                          bg={project.badgeBg} 
                          className="px-3 py-2 shadow-sm rounded-pill"
                          style={{ 
                            fontSize: '11px',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase'
                          }}
                        >
                          {project.badge}
                        </Badge>
                      </div>

                      {/* Title & Subtitle */}
                      <h3 className="fw-bold mb-1" style={{ color: colors.textPrimary, fontSize: '22px' }}>
                        {project.title}
                      </h3>
                      <div className="text-uppercase fw-semibold mb-3" style={{ color: colors.accentColor, fontSize: '12px', letterSpacing: '0.8px' }}>
                        {project.subtitle}
                      </div>

                      {/* Description */}
                      <p className="mb-4 flex-grow-0" style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>
                        {project.description}
                      </p>

                      <hr style={{ borderColor: colors.borderColor, margin: '1.5rem 0' }} />

                      {/* Feature Bullet Points */}
                      <div className="flex-grow-1 mb-4">
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: colors.textPrimary, fontSize: '13px' }}>
                          <FaLightbulb size={14} className="text-warning" /> Included Features:
                        </h6>
                        <ul className="list-unstyled mb-0" style={{ paddingLeft: 0 }}>
                          {project.features.map((feature, idx) => (
                            <li 
                              key={idx} 
                              className="d-flex align-items-start gap-2 mb-2" 
                              style={{ 
                                fontSize: '13px', 
                                color: colors.textSecondary,
                                lineHeight: 1.4
                              }}
                            >
                              <span style={{ color: colors.accentColor, marginTop: '2px' }}>•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <Button
                        size="lg"
                        className="w-100 mt-2 d-flex align-items-center justify-content-center gap-2 font-weight-bold"
                        style={{
                          borderRadius: '16px',
                          background: project.isActive ? project.gradient : 'transparent',
                          borderColor: project.isActive ? 'transparent' : colors.borderColor,
                          color: project.isActive ? '#fff' : colors.textSecondary,
                          cursor: project.isActive ? 'pointer' : 'not-allowed',
                          boxShadow: project.isActive ? `0 6px 15px ${project.shadowColor}` : 'none',
                          fontSize: '16px',
                          fontWeight: 600,
                          padding: '12px',
                          transition: 'all 0.3s'
                        }}
                        disabled={!project.isActive}
                        onClick={() => handleLaunch(project)}
                      >
                        {project.isActive ? (
                          <>
                            {project.btnText}
                            <FaArrowRight size={14} className="launch-icon-anim" />
                          </>
                        ) : (
                          <>
                            <FaLock size={13} />
                            {project.btnText}
                          </>
                        )}
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      </Container>

      {/* Styled animation custom keyframes */}
      <style>{`
        .launch-icon-anim {
          transition: transform 0.2s;
        }
        button:hover .launch-icon-anim {
          transform: translateX(4px);
        }
        .project-selection-wrapper {
          position: relative;
        }
        .project-selection-wrapper::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: ${colors.accentColor}12;
          filter: blur(120px);
          top: -10%;
          left: -10%;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .project-selection-wrapper::after {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: ${colors.accentColor}08;
          filter: blur(150px);
          bottom: -10%;
          right: -10%;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .tracking-tight {
          letter-spacing: -0.8px;
        }
      `}</style>
    </div>
  );
}
