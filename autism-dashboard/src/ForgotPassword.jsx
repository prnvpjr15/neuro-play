import React, { useState } from 'react';
import axios from 'axios';
import { Card, Form, Button, Alert } from 'react-bootstrap';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function handle(e) {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await axios.post('http://localhost:4000/api/auth/forgot-password', { email });
      setMsg('Reset link sent—check your email!');
    } catch {
      setErr('No such user found');
    }
  }

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: 400 }}>
      <Card.Body>
        <h3>Forgot Password</h3>
        {msg && <Alert variant="info">{msg}</Alert>}
        {err && <Alert variant="danger">{err}</Alert>}
        <Form onSubmit={handle}>
          <Form.Group className="mt-2">
            <Form.Label>Email</Form.Label>
            <Form.Control value={email} onChange={e => setEmail(e.target.value)} required />
          </Form.Group>
          <Button className="w-100 mt-3" type="submit">Request Reset</Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
