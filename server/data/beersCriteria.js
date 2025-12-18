// AGS Beers Criteria 2023 - Potentially Inappropriate Medications in Older Adults
// This is a simplified version for prototype. Full implementation would include complete database.

const beersCriteria = [
  {
    id: 'beers-001',
    drugClass: 'Benzodiazepines',
    medications: ['alprazolam', 'diazepam', 'lorazepam', 'clonazepam', 'temazepam'],
    rationale: 'Increased risk of cognitive impairment, delirium, falls, fractures, and motor vehicle crashes',
    recommendation: 'Avoid',
    strength: 'Strong',
    quality: 'Moderate',
    alternatives: 'CBT for insomnia, melatonin, trazodone (low dose)',
    taperingRequired: true,
    riskLevel: 'high'
  },
  {
    id: 'beers-002',
    drugClass: 'First-generation antihistamines',
    medications: ['diphenhydramine', 'hydroxyzine', 'chlorpheniramine', 'promethazine'],
    rationale: 'Highly anticholinergic; clearance reduced with advanced age; risk of confusion, dry mouth, constipation',
    recommendation: 'Avoid',
    strength: 'Strong',
    quality: 'High',
    alternatives: 'Second-generation antihistamines (cetirizine, loratadine)',
    taperingRequired: false,
    riskLevel: 'high'
  },
  {
    id: 'beers-003',
    drugClass: 'Proton pump inhibitors',
    medications: ['omeprazole', 'esomeprazole', 'lansoprazole', 'pantoprazole'],
    rationale: 'Risk of C. difficile infection, bone loss, fractures with long-term use (>8 weeks)',
    recommendation: 'Avoid chronic use unless for high-risk conditions',
    strength: 'Strong',
    quality: 'High',
    alternatives: 'H2 blockers for GERD, lifestyle modifications',
    taperingRequired: true,
    riskLevel: 'medium'
  },
  {
    id: 'beers-004',
    drugClass: 'NSAIDs',
    medications: ['ibuprofen', 'naproxen', 'indomethacin', 'ketorolac', 'piroxicam'],
    rationale: 'Increased risk of GI bleeding, peptic ulcer disease, acute kidney injury',
    recommendation: 'Avoid chronic use',
    strength: 'Strong',
    quality: 'Moderate',
    alternatives: 'Acetaminophen, topical NSAIDs, physical therapy',
    taperingRequired: false,
    riskLevel: 'high'
  },
  {
    id: 'beers-005',
    drugClass: 'Anticholinergics',
    medications: ['oxybutynin', 'tolterodine', 'solifenacin', 'trihexyphenidyl'],
    rationale: 'Highly anticholinergic; uncertain effectiveness; risk of cognitive decline',
    recommendation: 'Avoid',
    strength: 'Strong',
    quality: 'Moderate',
    alternatives: 'Behavioral interventions, mirabegron for urinary incontinence',
    taperingRequired: false,
    riskLevel: 'high'
  },
  {
    id: 'beers-006',
    drugClass: 'Antipsychotics',
    medications: ['haloperidol', 'risperidone', 'quetiapine', 'olanzapine'],
    rationale: 'Increased risk of stroke, mortality in dementia; extrapyramidal effects',
    recommendation: 'Avoid except for schizophrenia, bipolar disorder',
    strength: 'Strong',
    quality: 'Moderate',
    alternatives: 'Non-pharmacological behavioral interventions',
    taperingRequired: true,
    riskLevel: 'high'
  },
  {
    id: 'beers-007',
    drugClass: 'Sulfonylureas (long-acting)',
    medications: ['glyburide', 'glipizide'],
    rationale: 'Higher risk of prolonged hypoglycemia in older adults',
    recommendation: 'Avoid',
    strength: 'Strong',
    quality: 'High',
    alternatives: 'Shorter-acting sulfonylureas, DPP-4 inhibitors, SGLT2 inhibitors',
    taperingRequired: false,
    riskLevel: 'high'
  },
  {
    id: 'beers-008',
    drugClass: 'Muscle relaxants',
    medications: ['cyclobenzaprine', 'methocarbamol', 'carisoprodol'],
    rationale: 'Poorly tolerated; anticholinergic effects, sedation, risk of fracture',
    recommendation: 'Avoid',
    strength: 'Strong',
    quality: 'Moderate',
    alternatives: 'Physical therapy, stretching, heat/cold therapy',
    taperingRequired: false,
    riskLevel: 'medium'
  },
  {
    id: 'beers-009',
    drugClass: 'Tricyclic antidepressants',
    medications: ['amitriptyline', 'nortriptyline', 'doxepin', 'imipramine'],
    rationale: 'Highly anticholinergic, sedating, orthostatic hypotension',
    recommendation: 'Avoid',
    strength: 'Strong',
    quality: 'High',
    alternatives: 'SSRIs, SNRIs with lower anticholinergic burden',
    taperingRequired: true,
    riskLevel: 'high'
  },
  {
    id: 'beers-010',
    drugClass: 'Digoxin',
    medications: ['digoxin'],
    rationale: 'Decreased renal clearance; risk of toxicity; limited benefit in heart failure',
    recommendation: 'Avoid doses >0.125 mg/day',
    strength: 'Strong',
    quality: 'Moderate',
    alternatives: 'Beta-blockers, ACE inhibitors for heart failure',
    taperingRequired: false,
    riskLevel: 'medium'
  }
];

// Anticholinergic burden scale
const anticholinergicBurden = {
  'diphenhydramine': 3,
  'hydroxyzine': 3,
  'oxybutynin': 3,
  'tolterodine': 3,
  'amitriptyline': 3,
  'nortriptyline': 2,
  'lorazepam': 1,
  'alprazolam': 1,
  'omeprazole': 1
};

// Fall risk medications
const fallRiskMedications = [
  'benzodiazepines',
  'antipsychotics',
  'antidepressants',
  'anticonvulsants',
  'opioids',
  'antihypertensives'
];

module.exports = {
  beersCriteria,
  anticholinergicBurden,
  fallRiskMedications
};