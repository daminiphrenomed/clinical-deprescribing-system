const express = require('express');
const router = express.Router();

// Simple auth for prototype - replace with proper authentication in production
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo credentials for prototype
  if (email === 'demo@clinician.com' && password === 'demo123') {
    res.json({
      success: true,
      user: {
        id: 1,
        email: 'demo@clinician.com',
        name: 'Dr. Demo Clinician',
        role: 'physician'
      },
      token: 'demo-token-' + Date.now()
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  
  res.json({
    success: true,
    message: 'Registration successful',
    user: {
      id: Date.now(),
      email,
      name,
      role: 'physician'
    }
  });
});

module.exports = router;