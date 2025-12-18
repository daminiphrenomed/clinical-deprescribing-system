const { beersCriteria, anticholinergicBurden, fallRiskMedications } = require('../data/beersCriteria');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class AnalysisService {
  
  // Main analysis function
  async analyzeMedications(patient, medications) {
    const results = {
      patientInfo: this.getPatientRiskProfile(patient),
      medicationCount: medications.length,
      inappropriateMedications: [],
      riskScores: {},
      recommendations: [],
      aiInsights: null
    };

    // Check each medication against Beers Criteria
    for (const med of medications) {
      const beersMatch = this.checkBeersCriteria(med);
      if (beersMatch) {
        results.inappropriateMedications.push({
          medication: med,
          beersInfo: beersMatch,
          priority: this.calculatePriority(beersMatch, patient)
        });
      }
    }

    // Calculate risk scores
    results.riskScores = {
      polypharmacy: this.calculatePolypharmacyRisk(medications.length),
      anticholinergic: this.calculateAnticholinergicBurden(medications),
      fallRisk: this.calculateFallRisk(medications, patient),
      overall: 0
    };

    results.riskScores.overall = this.calculateOverallRisk(results.riskScores);

    // Generate recommendations
    results.recommendations = this.generateRecommendations(
      results.inappropriateMedications,
      patient
    );

    // Get AI-enhanced insights
    if (process.env.OPENAI_API_KEY) {
      results.aiInsights = await this.getAIInsights(patient, medications, results);
    }

    return results;
  }

  // Check medication against Beers Criteria
  checkBeersCriteria(medication) {
    const medName = medication.name.toLowerCase();
    
    for (const criteria of beersCriteria) {
      if (criteria.medications.some(m => medName.includes(m))) {
        return criteria;
      }
    }
    return null;
  }

  // Calculate patient risk profile
  getPatientRiskProfile(patient) {
    const age = patient.age;
    const riskFactors = [];

    if (age >= 85) riskFactors.push('Very advanced age');
    else if (age >= 75) riskFactors.push('Advanced age');
    
    if (patient.renalFunction && patient.renalFunction < 60) {
      riskFactors.push('Reduced renal function');
    }
    
    if (patient.conditions && patient.conditions.includes('dementia')) {
      riskFactors.push('Cognitive impairment');
    }
    
    if (patient.fallHistory) {
      riskFactors.push('History of falls');
    }

    return {
      age,
      riskFactors,
      riskLevel: riskFactors.length >= 3 ? 'high' : riskFactors.length >= 1 ? 'medium' : 'low'
    };
  }

  // Calculate polypharmacy risk
  calculatePolypharmacyRisk(medicationCount) {
    if (medicationCount >= 10) return { score: 10, level: 'severe', message: 'Severe polypharmacy (10+ medications)' };
    if (medicationCount >= 5) return { score: 7, level: 'moderate', message: 'Polypharmacy (5-9 medications)' };
    return { score: 3, level: 'low', message: 'Acceptable medication count' };
  }

  // Calculate anticholinergic burden
  calculateAnticholinergicBurden(medications) {
    let totalScore = 0;
    const contributingMeds = [];

    for (const med of medications) {
      const medName = med.name.toLowerCase();
      for (const [drug, score] of Object.entries(anticholinergicBurden)) {
        if (medName.includes(drug)) {
          totalScore += score;
          contributingMeds.push({ name: med.name, score });
        }
      }
    }

    return {
      score: totalScore,
      level: totalScore >= 3 ? 'high' : totalScore >= 1 ? 'medium' : 'low',
      message: totalScore >= 3 ? 'High anticholinergic burden - increased cognitive risk' : 
               totalScore >= 1 ? 'Moderate anticholinergic burden' : 'Low anticholinergic burden',
      contributingMeds
    };
  }

  // Calculate fall risk
  calculateFallRisk(medications, patient) {
    let riskFactors = 0;
    const contributingMeds = [];

    for (const med of medications) {
      const medName = med.name.toLowerCase();
      if (medName.includes('benzodiazepine') || medName.includes('alprazolam') || 
          medName.includes('lorazepam') || medName.includes('diazepam')) {
        riskFactors += 2;
        contributingMeds.push(med.name);
      }
    }

    if (patient.fallHistory) riskFactors += 2;
    if (patient.age >= 75) riskFactors += 1;

    return {
      score: Math.min(riskFactors, 10),
      level: riskFactors >= 4 ? 'high' : riskFactors >= 2 ? 'medium' : 'low',
      message: riskFactors >= 4 ? 'High fall risk - immediate intervention needed' :
               riskFactors >= 2 ? 'Moderate fall risk' : 'Low fall risk',
      contributingMeds
    };
  }

  // Calculate overall risk
  calculateOverallRisk(riskScores) {
    const weights = {
      polypharmacy: 0.3,
      anticholinergic: 0.35,
      fallRisk: 0.35
    };

    const weighted = 
      (riskScores.polypharmacy.score * weights.polypharmacy) +
      (riskScores.anticholinergic.score * weights.anticholinergic) +
      (riskScores.fallRisk.score * weights.fallRisk);

    return {
      score: Math.round(weighted),
      level: weighted >= 7 ? 'high' : weighted >= 4 ? 'medium' : 'low'
    };
  }

  // Calculate deprescribing priority
  calculatePriority(beersInfo, patient) {
    let priority = 0;
    
    if (beersInfo.riskLevel === 'high') priority += 3;
    else if (beersInfo.riskLevel === 'medium') priority += 2;
    
    if (patient.age >= 85) priority += 2;
    else if (patient.age >= 75) priority += 1;
    
    if (beersInfo.taperingRequired) priority += 1;

    return priority >= 5 ? 'urgent' : priority >= 3 ? 'high' : 'medium';
  }

  // Generate deprescribing recommendations
  generateRecommendations(inappropriateMeds, patient) {
    const recommendations = [];

    for (const item of inappropriateMeds) {
      const rec = {
        medication: item.medication.name,
        action: 'Consider deprescribing',
        priority: item.priority,
        rationale: item.beersInfo.rationale,
        alternatives: item.beersInfo.alternatives,
        taperingRequired: item.beersInfo.taperingRequired,
        taperingProtocol: item.beersInfo.taperingRequired ? 
          this.getTaperingProtocol(item.medication.name) : null,
        monitoring: this.getMonitoringPlan(item.medication.name),
        evidence: {
          guideline: 'AGS Beers Criteria 2023',
          strength: item.beersInfo.strength,
          quality: item.beersInfo.quality
        }
      };

      recommendations.push(rec);
    }

    // Sort by priority
    recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return recommendations;
  }

  // Get tapering protocol
  getTaperingProtocol(medicationName) {
    const medName = medicationName.toLowerCase();
    
    if (medName.includes('benzodiazepine') || medName.includes('alprazolam') || 
        medName.includes('lorazepam')) {
      return 'Reduce dose by 25% every 1-2 weeks. Monitor for withdrawal symptoms (anxiety, insomnia, tremor). Consider switching to longer-acting agent if needed.';
    }
    
    if (medName.includes('omeprazole') || medName.includes('ppi')) {
      return 'Reduce to lowest effective dose or switch to on-demand therapy. Consider H2 blocker for 2 weeks to prevent rebound. Monitor for GERD symptoms.';
    }
    
    if (medName.includes('antipsychotic')) {
      return 'Reduce dose by 25-50% every 1-2 weeks. Monitor for behavioral changes. Ensure non-pharmacological interventions in place.';
    }

    return 'Gradual dose reduction recommended. Consult clinical guidelines for specific protocol.';
  }

  // Get monitoring plan
  getMonitoringPlan(medicationName) {
    return {
      frequency: 'Weekly for first month, then monthly',
      parameters: ['Symptoms', 'Vital signs', 'Adverse effects'],
      duration: '3 months post-deprescribing'
    };
  }

  // Get AI-enhanced insights
  async getAIInsights(patient, medications, analysisResults) {
    try {
      const prompt = `You are a clinical pharmacist specializing in geriatric medication management. 

Patient Profile:
- Age: ${patient.age}
- Conditions: ${patient.conditions?.join(', ') || 'Not specified'}
- Renal function: ${patient.renalFunction || 'Not specified'} mL/min
- Current medications: ${medications.map(m => m.name).join(', ')}

Analysis Results:
- ${analysisResults.inappropriateMedications.length} potentially inappropriate medications identified
- Overall risk score: ${analysisResults.riskScores.overall.score}/10 (${analysisResults.riskScores.overall.level})
- Anticholinergic burden: ${analysisResults.riskScores.anticholinergic.score}
- Fall risk: ${analysisResults.riskScores.fallRisk.level}

Provide a brief clinical summary (3-4 sentences) highlighting:
1. Most critical medication concerns
2. Patient-specific considerations
3. Recommended next steps for the clinician

Keep response concise and actionable.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('AI insights error:', error);
      return null;
    }
  }
}

module.exports = new AnalysisService();