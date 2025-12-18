import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PatientForm from './components/PatientForm';
import MedicationList from './components/MedicationList';
import AnalysisResults from './components/AnalysisResults';
import Login from './components/Login';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPatient(null);
    setMedications([]);
    setAnalysisResults(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
          />
          <Route
            path="/"
            element={
              user ? (
                <Dashboard 
                  user={user} 
                  onLogout={handleLogout}
                  currentPatient={currentPatient}
                  setCurrentPatient={setCurrentPatient}
                  medications={medications}
                  setMedications={setMedications}
                  analysisResults={analysisResults}
                  setAnalysisResults={setAnalysisResults}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/patient"
            element={
              user ? (
                <PatientForm 
                  onSave={setCurrentPatient}
                  initialData={currentPatient}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/medications"
            element={
              user ? (
                <MedicationList 
                  medications={medications}
                  setMedications={setMedications}
                  patient={currentPatient}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/analysis"
            element={
              user ? (
                <AnalysisResults 
                  results={analysisResults}
                  patient={currentPatient}
                  medications={medications}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;