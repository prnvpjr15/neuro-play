// ParentDashboard.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Badge, Alert, Tabs, Tab, Container } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchChildren();
    fetchRecentActivities();
  }, []);

  const fetchChildren = async () => {
    // Mock data - replace with actual API call
    const mockChildren = [
      {
        id: 1,
        name: 'Emma',
        age: 8,
        totalSessions: 45,
        lastSession: '2025-08-17',
        progressScore: 78,
        skillsImproving: ['Social Skills', 'Pattern Recognition'],
        areasNeedingSupport: ['Motor Skills']
      },
      {
        id: 2,
        name: 'Alex',
        age: 6,
        totalSessions: 32,
        lastSession: '2025-08-16',
        progressScore: 65,
        skillsImproving: ['Communication'],
        areasNeedingSupport: ['Emotion Recognition', 'Focus']
      }
    ];
    setChildren(mockChildren);
    setSelectedChild(mockChildren[0]);
    fetchProgressData(mockChildren[0].id);
  };

  const fetchProgressData = async (childId) => {
    // Mock progress data
    const mockProgressData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [
        {
          label: 'Social Skills',
          data: [45, 52, 58, 65, 72, 78],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
        {
          label: 'Cognitive Skills',
          data: [38, 45, 48, 55, 62, 68],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        }
      ]
    };
    setProgressData(mockProgressData);
  };

  const fetchRecentActivities = async () => {
    const mockActivities = [
      { date: '2025-08-17', child: 'Emma', game: 'Emotion Match', score: 85, duration: '12 min' },
      { date: '2025-08-17', child: 'Alex', game: 'Pattern Finder', score: 72, duration: '8 min' },
      { date: '2025-08-16', child: 'Emma', game: 'Social Stories', score: 90, duration: '15 min' },
      { date: '2025-08-16', child: 'Alex', game: 'Memory Game', score: 68, duration: '10 min' }
    ];
    setRecentActivities(mockActivities);
  };

  const generateReport = (childId) => {
    alert(`Generating report for child ID: ${childId}`);
  };

  const gameStats = {
    labels: ['Emotion Match', 'Pattern Finder', 'Social Stories', 'Memory Game', 'Motor Skills'],
    datasets: [
      {
        label: 'Games Played',
        data: [12, 8, 15, 10, 6],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      }
    ]
  };

  return (
    <div className="parent-dashboard p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 style={{ margin: 0 }}>Parent Dashboard</h2>
          <small className="text-muted">Overview of child's progress and sessions</small>
        </div>
        <div>
          <Button variant="outline-primary" onClick={() => generateReport(selectedChild?.id)}>
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultActiveKey="overview" id="parent-dashboard-tabs" className="mb-3" fill>
        <Tab eventKey="overview" title="Overview">
          <Container fluid>
            {/* Children Overview Cards */}
            <Row className="mb-4">
              {children.map(child => (
                <Col md={6} key={child.id}>
                  <Card 
                    className={`mb-3 ${selectedChild?.id === child.id ? 'border-primary' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedChild(child);
                      fetchProgressData(child.id);
                    }}
                  >
                    <Card.Body>
                      <Card.Title>{child.name} <small className="text-muted">(Age {child.age})</small></Card.Title>
                      <Row>
                        <Col sm={6}>
                          <p style={{ marginBottom: 6 }}><strong>Total Sessions:</strong> {child.totalSessions}</p>
                          <p style={{ marginBottom: 6 }}><strong>Last Session:</strong> {child.lastSession}</p>
                        </Col>
                        <Col sm={6} className="text-end">
                          <p style={{ marginBottom: 6 }}><strong>Progress Score:</strong></p>
                          <h3 style={{ margin: 0 }}>
                            <Badge bg={child.progressScore > 70 ? 'success' : 'warning'} className="px-3 py-2">
                              {child.progressScore}%
                            </Badge>
                          </h3>
                        </Col>
                      </Row>

                      <div className="mt-3 d-flex justify-content-between">
                        <div>
                          <small className="text-success"><strong>Improving:</strong></small>
                          <div>
                            {child.skillsImproving.map(skill => (
                              <Badge bg="success" className="me-1" key={skill}>{skill}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <small className="text-warning"><strong>Needs Support:</strong></small>
                          <div>
                            {child.areasNeedingSupport.map(area => (
                              <Badge bg="warning" text="dark" className="me-1" key={area}>{area}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Progress Charts */}
            {selectedChild && (
              <Row className="mb-4">
                <Col md={8}>
                  <Card>
                    <Card.Header>
                      <h5 style={{ margin: 0 }}>Progress Tracking - {selectedChild.name}</h5>
                    </Card.Header>
                    <Card.Body>
                      {progressData && (
                        <Line 
                          data={progressData} 
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { position: 'top' },
                              title: { display: true, text: 'Skill Development Over Time' }
                            }
                          }}
                        />
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card>
                    <Card.Header>
                      <h5 style={{ margin: 0 }}>Game Distribution</h5>
                    </Card.Header>
                    <Card.Body>
                      <Bar 
                        data={gameStats} 
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false }
                          }
                        }}
                      />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Recent Activities */}
            <Card>
              <Card.Header>
                <h5 style={{ margin: 0 }}>Recent Activities</h5>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Child</th>
                      <th>Game</th>
                      <th>Score</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity, index) => (
                      <tr key={index}>
                        <td>{activity.date}</td>
                        <td>{activity.child}</td>
                        <td>{activity.game}</td>
                        <td>
                          <Badge bg={activity.score > 80 ? 'success' : activity.score > 60 ? 'warning' : 'danger'}>
                            {activity.score}%
                          </Badge>
                        </td>
                        <td>{activity.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Container>
        </Tab>

        <Tab eventKey="games" title="Games">
          <Container fluid>
            <Row className="mb-3">
              <Col md={4}>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title>Face Jump</Card.Title>
                    <Card.Text>Encourages smiling to control a character — great for motor and emotion skills.</Card.Text>
                    <Button variant="primary" onClick={() => alert('Open Face Jump in the Games area')}>Play</Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title>Expression Quest</Card.Title>
                    <Card.Text>Work through emotional expressions step-by-step.</Card.Text>
                    <Button variant="primary" onClick={() => alert('Open Expression Quest in the Games area')}>Play</Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title>Imitation Game</Card.Title>
                    <Card.Text>Follow the teacher poses to practice imitation skills.</Card.Text>
                    <Button variant="primary" onClick={() => alert('Open Imitation Game in the Games area')}>Play</Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title>Face Mimic</Card.Title>
                    <Card.Text>AI-powered facial expression matching.</Card.Text>
                    <Button variant="primary" onClick={() => alert('Open Face Mimic in the Games area')}>Play</Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Tab>

        <Tab eventKey="reports" title="Reports">
          <Container fluid>
            <Card className="mb-3">
              <Card.Body>
                <h5>Generate Reports</h5>
                <p>Download or email progress summaries, weekly trends, and intervention suggestions.</p>
                <Button onClick={() => generateReport(selectedChild?.id)} disabled={!selectedChild}>Generate for {selectedChild ? selectedChild.name : 'a child'}</Button>
              </Card.Body>
            </Card>
          </Container>
        </Tab>

        <Tab eventKey="settings" title="Settings">
          <Container fluid>
            <Card>
              <Card.Body>
                <h5>Settings</h5>
                <p>Manage notifications, privacy, and account preferences here.</p>
                <Button variant="secondary" onClick={() => alert('Open Settings')}>Open Settings</Button>
              </Card.Body>
            </Card>
          </Container>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ParentDashboard;

