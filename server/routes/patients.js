const express = require('express');
const router = express.Router();

// In-memory storage for prototype (replace with database in production)
let patients = [];

// GET /api/patients - List all patients
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: patients
  });
});

// GET /api/patients/:id - Get patient by ID
router.get('/:id', (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  res.json({
    success: true,
    data: patient
  });
});

// POST /api/patients - Create new patient
router.post('/', (req, res) => {
  const patient = {
    id: 'patient-' + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  patients.push(patient);
  
  res.json({
    success: true,
    data: patient
  });
});

// PUT /api/patients/:id - Update patient
router.put('/:id', (req, res) => {
  const index = patients.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  patients[index] = {
    ...patients[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: patients[index]
  });
});

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', (req, res) => {
  const index = patients.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  patients.splice(index, 1);
  
  res.json({
    success: true,
    message: 'Patient deleted'
  });
});

module.exports = router;