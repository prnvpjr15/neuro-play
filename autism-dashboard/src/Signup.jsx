import React, { useState, useContext, useMemo } from 'react';
import { Card, Form, Button, Alert, InputGroup, Row, Col } from 'react-bootstrap';
import { AuthContext } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import { useRef, useEffect } from 'react';


const passwordRules = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /\d/.test(pw) },
  { label: 'One special character', test: (pw) => /[\W_]/.test(pw) }
];

const generateCaptcha = () => ({
  num1: Math.floor(Math.random() * 9) + 1,
  num2: Math.floor(Math.random() * 9) + 1
});

export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [role, setRole] = useState('parent');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaChallenge, setCaptchaChallenge] = useState(generateCaptcha());
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const passwordChecklist = useMemo(
    () => passwordRules.map(rule => ({
      ...rule,
      isValid: rule.test(pw)
    })),
    [pw]
  );

  const isPasswordStrong = passwordChecklist.every(rule => rule.isValid);
  const captchaExpected = captchaChallenge.num1 + captchaChallenge.num2;

  const formIsValid =
    email.trim() &&
    username.trim().length >= 3 &&
    pw &&
    confirmPw &&
    pw === confirmPw &&
    isPasswordStrong &&
    termsAgreed &&
    captchaAnswer.trim();

  async function handle(e) {
    e.preventDefault();
    setMsg('');
    setErr('');

    if (pw !== confirmPw) {
      setErr('Passwords do not match.');
      return;
    }

    if (!isPasswordStrong) {
      setErr('Password does not meet the required complexity.');
      return;
    }

    if (!termsAgreed) {
      setErr('You must agree to the terms and conditions.');
      return;
    }

    if (Number(captchaAnswer) !== captchaExpected) {
      setErr('Captcha answer is incorrect.');
      setCaptchaChallenge(generateCaptcha());
      setCaptchaAnswer('');
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        email: email.trim(),
        username: username.trim(),
        password: pw,
        role,
        termsAgreed,
        captchaAnswer: Number(captchaAnswer),
        captchaChallenge
      });
      setMsg('Signup success! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      setErr(error.response?.data?.error || 'Signup failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="autism-signup-bg">
      <Card className="autism-auth-card mx-auto mt-5" style={{ maxWidth: 440 }}>
        <Card.Body>
          <div className="mb-4 text-center">
            <img src="https://img.icons8.com/color/96/000000/collaboration.png" alt="Signup icon" style={{width:64, height:64, marginBottom:8}} />
            <h2 style={{ color: '#8ac926', fontWeight: 700, marginBottom: 0 }}>
              Create your Autism Account
            </h2>
            <div style={{ fontSize: 18, color: '#555', marginBottom: 10 }}>
              You’re welcome here!
            </div>
          </div>
          {msg && <Alert variant="info">{msg}</Alert>}
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
              <Form.Label style={{ fontWeight: 600 }}>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                style={{ borderRadius: 10 }}
                onChange={e => setUsername(e.target.value)}
                placeholder="Choose a username"
                minLength={3}
                maxLength={30}
                required
              />
              <Form.Text muted>3-30 characters. Letters, numbers, and underscores recommended.</Form.Text>
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
              <div className="mt-2">
                {passwordChecklist.map(rule => (
                  <div
                    key={rule.label}
                    className="d-flex align-items-center small"
                    style={{ color: rule.isValid ? '#198754' : '#888' }}
                  >
                    <span style={{ marginRight: 6 }}>
                      {rule.isValid ? '✅' : '⭕'}
                    </span>
                    {rule.label}
                  </div>
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label style={{ fontWeight: 600 }}>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPw}
                style={{ borderRadius: 10 }}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Confirm password"
                required
                isInvalid={confirmPw.length > 0 && confirmPw !== pw}
              />
              <Form.Control.Feedback type="invalid">
                Passwords must match.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label style={{ fontWeight: 600 }}>Role</Form.Label>
              <Form.Select value={role} style={{ borderRadius: 10 }} onChange={e => setRole(e.target.value)}>
                <option value="parent">Parent</option>
                <option value="therapist">Therapist</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Row className="mt-3">
              <Col md={7} xs={12}>
                <Form.Label style={{ fontWeight: 600 }}>
                  Captcha: {captchaChallenge.num1} + {captchaChallenge.num2} =
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    value={captchaAnswer}
                    onChange={e => setCaptchaAnswer(e.target.value)}
                    style={{ borderRadius: 10 }}
                    placeholder="Your answer"
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setCaptchaChallenge(generateCaptcha());
                      setCaptchaAnswer('');
                    }}
                  >
                    ↻
                  </Button>
                </InputGroup>
              </Col>
              <Col md={5} xs={12} className="mt-3 mt-md-0 d-flex align-items-end">
                <Form.Check
                  className="w-100"
                  type="checkbox"
                  label="I agree to the terms"
                  checked={termsAgreed}
                  onChange={e => setTermsAgreed(e.target.checked)}
                  required
                />
              </Col>
            </Row>
            <Button
              className="w-100 mt-4 autism-btn"
              type="submit"
              style={{ borderRadius: 10 }}
              disabled={!formIsValid || submitting}
            >
              {submitting ? 'Signing up...' : 'Sign Up'}
            </Button>
          </Form>
          <div className="text-center my-2">
            <span className="small text-muted">
              Already registered? <Link to="/login">Login</Link>
            </span>
          </div>
        </Card.Body>
      </Card>
      <style>{`
        .autism-signup-bg {
          min-height: 100vh;
          background: linear-gradient(105deg,#fffbe6,#e0ffe5 90%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .autism-auth-card {
          background: #fff;
          box-shadow: 0 4px 20px 0 rgba(138,201,38,0.10);
          border-radius: 18px;
          border: none;
        }
        .autism-btn {
          background-color: #8ac926;
          font-weight: 600;
          border: none;
        }
        .autism-btn:hover, .autism-btn:active {
          background-color: #7bb322;
        }
      `}</style>
    </div>
  );
}

