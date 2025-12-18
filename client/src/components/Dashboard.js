import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PatientForm from './PatientForm';
import MedicationList from './MedicationList';
import AnalysisResults from './AnalysisResults';
import axios from 'axios';

const steps = ['Patient Information', 'Medication List', 'Analysis & Recommendations'];

function Dashboard({ 
  user, 
  onLogout, 
  currentPatient, 
  setCurrentPatient,
  medications,
  setMedications,
  analysisResults,
  setAnalysisResults
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (activeStep === 1) {
      // Run analysis before moving to results
      await runAnalysis();
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setCurrentPatient(null);
    setMedications([]);
    setAnalysisResults(null);
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/analysis', {
        patient: currentPatient,
        medications: medications
      });
      setAnalysisResults(response.data.data);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <PatientForm 
            onSave={setCurrentPatient}
            initialData={currentPatient}
          />
        );
      case 1:
        return (
          <MedicationList 
            medications={medications}
            setMedications={setMedications}
            patient={currentPatient}
          />
        );
      case 2:
        return (
          <AnalysisResults 
            results={analysisResults}
            patient={currentPatient}
            medications={medications}
            loading={loading}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  const canProceed = () => {
    if (activeStep === 0) return currentPatient !== null;
    if (activeStep === 1) return medications.length > 0;
    return true;
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Clinical Deprescribing System
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user.name}
          </Typography>
          <Button color="inherit" onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ minHeight: 400 }}>
            {getStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button onClick={handleReset} variant="contained">
                  New Analysis
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed() || loading}
                >
                  {activeStep === 1 ? 'Run Analysis' : 'Next'}
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Dashboard;