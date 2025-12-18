import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('demo@clinician.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Clinical Deprescribing System
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            AI-Powered Medication Safety for Older Adults
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              size="large"
              sx={{ mt: 3 }}
            >
              Login
            </Button>
          </form>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" display="block">
              <strong>Demo Credentials:</strong><br />
              Email: demo@clinician.com<br />
              Password: demo123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;