const express = require('express');
const router = express.Router();
const analysisService = require('../services/analysisService');

// POST /api/analysis - Analyze patient medications
router.post('/', async (req, res) => {
  try {
    const { patient, medications } = req.body;

    if (!patient || !medications || !Array.isArray(medications)) {
      return res.status(400).json({ 
        error: 'Invalid request. Required: patient object and medications array' 
      });
    }

    const results = await analysisService.analyzeMedications(patient, medications);
    
    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message 
    });
  }
});

// GET /api/analysis/beers-criteria - Get Beers Criteria reference
router.get('/beers-criteria', (req, res) => {
  const { beersCriteria } = require('../data/beersCriteria');
  res.json({
    success: true,
    data: beersCriteria,
    version: 'AGS Beers Criteria 2023'
  });
});

module.exports = router;