// AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Form, Badge, Tabs, Tab, Alert } from 'react-bootstrap';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
// Add this at the very top of TherapistDashboard.js (and AdminDashboard.js)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,          // <— Add this
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,          // <— And register here
  Title,
  Tooltip,
  Legend
);

ChartJS.register(
  CategoryScale,   // for bar/line charts
  LinearScale,     // fixes “linear” not registered
  RadialLinearScale, // fixes “radialLinear” not registered
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [siteStats, setSiteStats] = useState(null);
  const [userData, setUserData] = useState([]);
  const [gameStats, setGameStats] = useState(null);
  const [cohortData, setCohortData] = useState(null);
  const [flags, setFlags] = useState([]);

  useEffect(() => {
    fetchSiteStats();
    fetchUserData();
    fetchGameStats();
    fetchCohortData();
    fetchFlags();
  }, []);

  const fetchSiteStats = async () => {
    const mockStats = {
      totalUsers: 1247,
      activeUsers: 856,
      totalSessions: 5432,
      avgSessionTime: '12.5 min',
      completionRate: 78,
      newUsersThisWeek: 23,
      gamesPlayed: 12540,
      dataPoints: 45670
    };
    setSiteStats(mockStats);
  };

  const fetchUserData = async () => {
    const mockUsers = [
      { id: 1, name: 'Sarah Johnson', role: 'parent', children: 2, lastActive: '2025-08-17', sessions: 45, consent: 'full' },
      { id: 2, name: 'Dr. Smith', role: 'therapist', clients: 12, lastActive: '2025-08-17', sessions: 120, consent: 'professional' },
      { id: 3, name: 'Mike Wilson', role: 'parent', children: 1, lastActive: '2025-08-16', sessions: 23, consent: 'limited' },
      { id: 4, name: 'Emma (Child)', role: 'user', age: 8, lastActive: '2025-08-17', sessions: 67, consent: 'parental' },
    ];
    setUserData(mockUsers);
  };

  const fetchGameStats = async () => {
    const mockGameStats = {
      popularity: {
        labels: ['Emotion Match', 'Pattern Finder', 'Social Stories', 'Memory Game', 'Motor Skills'],
        datasets: [{
          label: 'Times Played',
          data: [2340, 1890, 1560, 1230, 980],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      },
      performance: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [
          {
            label: 'Average Score',
            data: [68, 72, 75, 78, 80, 82],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          },
          {
            label: 'Completion Rate',
            data: [65, 70, 73, 76, 78, 80],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
          }
        ]
      }
    };
    setGameStats(mockGameStats);
  };

  const fetchCohortData = async () => {
    const mockCohorts = {
      ageDistribution: {
        labels: ['4-6 years', '7-9 years', '10-12 years', '13-15 years', '16+ years'],
        datasets: [{
          data: [145, 234, 189, 156, 78],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      },
      progressComparison: {
        labels: ['Social Skills', 'Communication', 'Motor Skills', 'Cognitive', 'Emotional'],
        datasets: [
          {
            label: '4-6 years',
            data: [65, 58, 72, 68, 60],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          },
          {
            label: '7-9 years',
            data: [75, 70, 78, 80, 72],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          },
          {
            label: '10-12 years',
            data: [82, 78, 85, 88, 80],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            pointBackgroundColor: 'rgba(255, 206, 86, 1)',
          }
        ]
      }
    };
    setCohortData(mockCohorts);
  };

  const fetchFlags = async () => {
    const mockFlags = [
      { id: 1, type: 'anomaly', user: 'User #234', description: 'Unusual session pattern detected', severity: 'medium', date: '2025-08-17' },
      { id: 2, type: 'privacy', user: 'Dr. Brown', description: 'Data access request pending', severity: 'low', date: '2025-08-16' },
      { id: 3, type: 'performance', user: 'System', description: 'Game loading time increased', severity: 'high', date: '2025-08-17' },
      { id: 4, type: 'consent', user: 'Parent #567', description: 'Consent withdrawal request', severity: 'high', date: '2025-08-15' }
    ];
    setFlags(mockFlags);
  };

  const exportData = (type) => {
    alert(`Exporting ${type} data...`);
    // Implement actual export functionality
  };

  const getSeverityVariant = (severity) => {
    switch(severity) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  if (!siteStats) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin & Research Dashboard</h2>
        <div>
          <Button variant="outline-primary" className="mr-2" onClick={() => exportData('all')}>
            Export All Data
          </Button>
          <Button variant="danger">System Settings</Button>
        </div>
      </div>

      {/* Site Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h3 className="text-primary">{siteStats.totalUsers.toLocaleString()}</h3>
              <p className="text-muted mb-0">Total Users</p>
              <small className="text-success">+{siteStats.newUsersThisWeek} this week</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h3 className="text-success">{siteStats.activeUsers.toLocaleString()}</h3>
              <p className="text-muted mb-0">Active Users</p>
              <small className="text-muted">{Math.round((siteStats.activeUsers/siteStats.totalUsers)*100)}% of total</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h3 className="text-warning">{siteStats.totalSessions.toLocaleString()}</h3>
              <p className="text-muted mb-0">Total Sessions</p>
              <small className="text-muted">Avg: {siteStats.avgSessionTime}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h3 className="text-info">{siteStats.completionRate}%</h3>
              <p className="text-muted mb-0">Completion Rate</p>
              <small className="text-success">+2% from last month</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Flags & Alerts */}
      {flags.length > 0 && (
        <Row className="mb-4">
          <Col md={12}>
            <Alert variant="info">
              <Alert.Heading>System Alerts & Flags</Alert.Heading>
              {flags.map(flag => (
                <div key={flag.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                  <div>
                    <Badge variant={getSeverityVariant(flag.severity)} className="mr-2">
                      {flag.type}
                    </Badge>
                    <strong>{flag.user}:</strong> {flag.description}
                  </div>
                  <div>
                    <small className="text-muted mr-3">{flag.date}</small>
                    <Button size="sm" variant="outline-primary">Review</Button>
                  </div>
                </div>
              ))}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Main Analytics */}
      <Tabs defaultActiveKey="analytics" id="admin-tabs">
        <Tab eventKey="analytics" title="Site Analytics">
          <Row className="mt-4">
            <Col md={8}>
              <Card>
                <Card.Header>
                  <h5>Game Performance Trends</h5>
                </Card.Header>
                <Card.Body>
                  {gameStats && (
                    <Line 
                      data={gameStats.performance}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
                          title: { display: true, text: 'Weekly Performance Metrics' }
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
                  <h5>Game Popularity</h5>
                </Card.Header>
                <Card.Body>
                  {gameStats && (
                    <Doughnut 
                      data={gameStats.popularity}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="cohorts" title="Cohort Analysis">
          <Row className="mt-4">
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Age Distribution</h5>
                </Card.Header>
                <Card.Body>
                  {cohortData && (
                    <Doughnut 
                      data={cohortData.ageDistribution}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Progress by Age Group</h5>
                </Card.Header>
                <Card.Body>
                  {cohortData && (
                    <Bar 
                      data={cohortData.progressComparison}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' }
                        },
                        scales: {
                          y: { beginAtZero: true, max: 100 }
                        }
                      }}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="users" title="User Management">
          <Card className="mt-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>User Management</h5>
              <div>
                <Button variant="outline-primary" size="sm" className="mr-2" onClick={() => exportData('users')}>
                  Export Users
                </Button>
                <Form.Control 
                  as="select" 
                  size="sm" 
                  style={{ width: 'auto', display: 'inline-block' }}
                >
                  <option>All Roles</option>
                  <option>Parents</option>
                  <option>Therapists</option>
                  <option>Users</option>
                </Form.Control>
              </div>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Details</th>
                    <th>Last Active</th>
                    <th>Sessions</th>
                    <th>Consent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>
                        <Badge variant={
                          user.role === 'therapist' ? 'success' :
                          user.role === 'parent' ? 'primary' : 'info'
                        }>
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        {user.children && `${user.children} children`}
                        {user.clients && `${user.clients} clients`}
                        {user.age && `Age: ${user.age}`}
                      </td>
                      <td>{user.lastActive}</td>
                      <td>{user.sessions}</td>
                      <td>
                        <Badge variant={
                          user.consent === 'full' ? 'success' :
                          user.consent === 'limited' ? 'warning' : 'info'
                        }>
                          {user.consent}
                        </Badge>
                      </td>
                      <td>
                        <Button size="sm" variant="outline-primary" className="mr-1">View</Button>
                        <Button size="sm" variant="outline-warning">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="data" title="Data Export">
          <Row className="mt-4">
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Research Data Export</h5>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Form.Group>
                      <Form.Label>Data Type</Form.Label>
                      <Form.Control as="select">
                        <option>Anonymized Game Sessions</option>
                        <option>Aggregated Progress Data</option>
                        <option>Usage Statistics</option>
                        <option>Cohort Analysis</option>
                      </Form.Control>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Date Range</Form.Label>
                      <Row>
                        <Col>
                          <Form.Control type="date" />
                        </Col>
                        <Col>
                          <Form.Control type="date" />
                        </Col>
                      </Row>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Format</Form.Label>
                      <Form.Control as="select">
                        <option>CSV</option>
                        <option>Excel</option>
                        <option>JSON</option>
                      </Form.Control>
                    </Form.Group>
                    <Button variant="primary" onClick={() => exportData('custom')}>
                      Generate Export
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Data Summary</h5>
                </Card.Header>
                <Card.Body>
                  <Table>
                    <tbody>
                      <tr>
                        <td>Total Data Points</td>
                        <td><strong>{siteStats.dataPoints.toLocaleString()}</strong></td>
                      </tr>
                      <tr>
                        <td>Games Played</td>
                        <td><strong>{siteStats.gamesPlayed.toLocaleString()}</strong></td>
                      </tr>
                      <tr>
                        <td>Anonymized Records</td>
                        <td><strong>100%</strong></td>
                      </tr>
                      <tr>
                        <td>Data Retention</td>
                        <td><strong>2 years</strong></td>
                      </tr>
                      <tr>
                        <td>Last Backup</td>
                        <td><strong>2025-08-17</strong></td>
                      </tr>
                    </tbody>
                  </Table>
                  
                  <Alert variant="info" className="mt-3">
                    <Alert.Heading>Data Privacy</Alert.Heading>
                    All exported data is anonymized and complies with GDPR, COPPA, and institutional research guidelines.
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
