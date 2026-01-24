import React, { useState, useContext } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [err, setErr] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handle(e) {
    e.preventDefault();
    setErr('');
    
    if (!email || !pw) {
      setErr('Please fill in all fields');
      return;
    }
    
    try {
      await login(email, pw, rememberMe);
      const storedUserRaw =
        localStorage.getItem('user') || sessionStorage.getItem('user');
      const role = storedUserRaw ? JSON.parse(storedUserRaw).role : null;
      console.log('Navigating to role:', role);
      navigate(role ? `/${role}` : '/');
    } catch (error) {
      console.error('Login error in component:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      setErr(errorMessage);
    }
  }

  return (
    <div className="autism-login-bg">
      <Card className="autism-auth-card mx-auto mt-5" style={{ maxWidth: 420 }}>
        <Card.Body>
          <div className="mb-4 text-center">
            <img src="https://img.icons8.com/color/96/000000/happy.png" alt="Autism logo" style={{width:64, height:64, marginBottom:8}} />
            <h2 style={{ color: '#4f8ed9', fontWeight: 700, marginBottom: 0 }}>
              Welcome to Autism Support
            </h2>
            <div style={{ fontSize: 18, color: '#555', marginBottom: 10 }}>
              Please login to continue
            </div>
          </div>
          {err && <Alert variant="danger">{err}</Alert>}
          <Form onSubmit={handle} className="mb-3">
            <Form.Group>
              <Form.Label style={{ fontWeight: 600 }}>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                style={{ borderRadius: 10 }}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label style={{ fontWeight: 600 }}>Password</Form.Label>
              <Form.Control
                type="password"
                value={pw}
                style={{ borderRadius: 10 }}
                onChange={e => setPw(e.target.value)}
                placeholder="Password"
                required
              />
            </Form.Group>
            <Form.Check
              className="mt-3"
              type="checkbox"
              label="Remember me"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
            />
            <Button className="w-100 mt-4 autism-btn" type="submit" style={{ borderRadius: 10 }}>
              Log In
            </Button>
          </Form>
          <div className="text-center my-2">
            <Link to="/forgot-password" className="small text-muted">Forgot password?</Link>
            <br />
            <span className="small text-muted">
              No account? <Link to="/signup">Sign Up</Link>
            </span>
          </div>
        </Card.Body>
      </Card>
      <style>{`
        .autism-login-bg {
          min-height: 100vh;
          background: linear-gradient(105deg,#e0f7fa,#e3ebfa,#f6fff8 85%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .autism-auth-card {
          background: #fff;
          box-shadow: 0 4px 20px 0 rgba(79,142,217,0.14);
          border-radius: 18px;
          border: none;
        }
        .autism-btn {
          background-color: #4f8ed9;
          font-weight: 600;
          border: none;
        }
        .autism-btn:hover, .autism-btn:active {
          background-color: #467ac0;
        }
      `}</style>
    </div>
  );
}
