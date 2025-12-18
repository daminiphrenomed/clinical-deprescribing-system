const express = require('express');
const router = express.Router();

// Common medications database for autocomplete
const commonMedications = [
  { name: 'Alprazolam', class: 'Benzodiazepine' },
  { name: 'Lorazepam', class: 'Benzodiazepine' },
  { name: 'Diazepam', class: 'Benzodiazepine' },
  { name: 'Diphenhydramine', class: 'Antihistamine' },
  { name: 'Hydroxyzine', class: 'Antihistamine' },
  { name: 'Omeprazole', class: 'Proton Pump Inhibitor' },
  { name: 'Pantoprazole', class: 'Proton Pump Inhibitor' },
  { name: 'Ibuprofen', class: 'NSAID' },
  { name: 'Naproxen', class: 'NSAID' },
  { name: 'Oxybutynin', class: 'Anticholinergic' },
  { name: 'Tolterodine', class: 'Anticholinergic' },
  { name: 'Amitriptyline', class: 'Tricyclic Antidepressant' },
  { name: 'Nortriptyline', class: 'Tricyclic Antidepressant' },
  { name: 'Haloperidol', class: 'Antipsychotic' },
  { name: 'Risperidone', class: 'Antipsychotic' },
  { name: 'Quetiapine', class: 'Antipsychotic' },
  { name: 'Glyburide', class: 'Sulfonylurea' },
  { name: 'Cyclobenzaprine', class: 'Muscle Relaxant' },
  { name: 'Digoxin', class: 'Cardiac Glycoside' },
  { name: 'Metformin', class: 'Biguanide' },
  { name: 'Lisinopril', class: 'ACE Inhibitor' },
  { name: 'Atorvastatin', class: 'Statin' },
  { name: 'Metoprolol', class: 'Beta Blocker' },
  { name: 'Amlodipine', class: 'Calcium Channel Blocker' },
  { name: 'Levothyroxine', class: 'Thyroid Hormone' }
];

// GET /api/medications/search - Search medications
router.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.json({
      success: true,
      data: commonMedications
    });
  }
  
  const results = commonMedications.filter(med => 
    med.name.toLowerCase().includes(q.toLowerCase()) ||
    med.class.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({
    success: true,
    data: results
  });
});

// GET /api/medications/classes - Get medication classes
router.get('/classes', (req, res) => {
  const classes = [...new Set(commonMedications.map(m => m.class))];
  
  res.json({
    success: true,
    data: classes
  });
});

module.exports = router;