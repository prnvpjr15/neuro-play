import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import { AuthProvider, AuthContext } from './AuthContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import ProtectedRoute from './ProtectedRoute';
import Signup from './Signup';
import Login from './Login';
import ParentDashboard from './ParentDashboard';
import TherapistDashboard from './TherapistDashboard';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import { Navbar, Nav, Button } from 'react-bootstrap';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import FaceCaptureComponent from './components/FaceCaptureComponent';


function AppRoutes() {
  const { user, logout } = useContext(AuthContext);

  return (
    <>
      <Navbar bg="light" className="px-3">
        <Navbar.Brand as={Link} to="/">
          Autism Project
        </Navbar.Brand>
        <Nav className="ms-auto align-items-center">
          {user ? (
            <>
              <Nav.Item className="me-3 text-muted">
                Signed in as{' '}
                <strong>{user.username || user.email}</strong>
              </Nav.Item>
              <Nav.Item className="me-2">Role: {user.role}</Nav.Item>
              <Button size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
              <Nav.Link as={Link} to="/signup">
                Sign Up
              </Nav.Link>
            </>
          )}
        </Nav>
      </Navbar>

      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/" element={user ? <Navigate to={`/${user.role}`} /> : <Navigate to="/login" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/parent"
          element={
            <ProtectedRoute role="parent">
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/therapist"
          element={
            <ProtectedRoute role="therapist">
              <TherapistDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<h2 className="mt-5 text-center">404 Not Found</h2>} />

{/* 
        <FaceCaptureComponent
          userId={currentUser._id}        // Make sure this is passed
          therapistId={currentUser.therapistId} // And this too
          onVideoCaptured={handleVideoCaptured}
        /> */}

        // In App.jsx or your routing file
        <Route path="/therapist/videos" element={
          <ProtectedRoute role="therapist">
            <TherapistDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

