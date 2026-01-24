import React, { useState } from 'react';
import axios from 'axios';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { token } = useParams();
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function handle(e) {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await axios.post(`http://localhost:4000/api/auth/reset-password/${token}`, { password: pw });
      setMsg('Password reset! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      setErr('Reset failed. Link expired or invalid.');
    }
  }

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: 400 }}>
      <Card.Body>
        <h3>Choose New Password</h3>
        {msg && <Alert variant="info">{msg}</Alert>}
        {err && <Alert variant="danger">{err}</Alert>}
        <Form onSubmit={handle}>
          <Form.Group className="mt-2">
            <Form.Label>New Password</Form.Label>
            <Form.Control value={pw} type="password" onChange={e => setPw(e.target.value)} required />
          </Form.Group>
          <Button className="w-100 mt-3" type="submit">Reset Password</Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
