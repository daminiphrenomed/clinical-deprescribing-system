import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

function AnalysisResults({ results, patient, medications, loading }) {
  const [approvedRecs, setApprovedRecs] = useState([]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Analyzing medications...</Typography>
      </Box>
    );
  }

  if (!results) {
    return (
      <Alert severity="info">
        No analysis results available. Please complete the previous steps.
      </Alert>
    );
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  const handleApprove = (index) => {
    setApprovedRecs([...approvedRecs, index]);
  };

  const handleReject = (index) => {
    // In production, would save rejection reason
    alert('Recommendation rejected. Document rationale in patient record.');
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Analysis Results & Recommendations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {patient?.name} - {medications?.length} medications analyzed
      </Typography>

      {/* Risk Score Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Overall Risk
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ mr: 1 }}>
                  {results.riskScores.overall.score}/10
                </Typography>
                <Chip 
                  label={results.riskScores.overall.level.toUpperCase()} 
                  color={getRiskColor(results.riskScores.overall.level)}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Polypharmacy
              </Typography>
              <Typography variant="h4">
                {results.riskScores.polypharmacy.score}/10
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {results.riskScores.polypharmacy.message}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Anticholinergic Burden
              </Typography>
              <Typography variant="h4">
                {results.riskScores.anticholinergic.score}
              </Typography>
              <Chip 
                label={results.riskScores.anticholinergic.level.toUpperCase()} 
                color={getRiskColor(results.riskScores.anticholinergic.level)}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Fall Risk
              </Typography>
              <Typography variant="h4">
                {results.riskScores.fallRisk.score}/10
              </Typography>
              <Chip 
                label={results.riskScores.fallRisk.level.toUpperCase()} 
                color={getRiskColor(results.riskScores.fallRisk.level)}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Insights */}
      {results.aiInsights && (
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>AI Clinical Summary</strong>
          </Typography>
          <Typography variant="body2">
            {results.aiInsights}
          </Typography>
        </Alert>
      )}

      {/* Inappropriate Medications Alert */}
      {results.inappropriateMedications.length > 0 && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <strong>{results.inappropriateMedications.length} potentially inappropriate medication(s)</strong> identified based on AGS Beers Criteria 2023
        </Alert>
      )}

      {/* Recommendations */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Deprescribing Recommendations
      </Typography>

      {results.recommendations.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
            <div>
              <Typography variant="h6" color="success.main">
                No Inappropriate Medications Detected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current medication regimen appears appropriate based on Beers Criteria.
              </Typography>
            </div>
          </Box>
        </Paper>
      ) : (
        results.recommendations.map((rec, index) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <WarningIcon color={getPriorityColor(rec.priority)} sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">
                    <strong>{rec.medication}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {rec.action}
                  </Typography>
                </Box>
                <Chip 
                  label={rec.priority.toUpperCase()} 
                  color={getPriorityColor(rec.priority)}
                  size="small"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    <strong>Clinical Rationale</strong>
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {rec.rationale}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    <strong>Evidence Base</strong>
                  </Typography>
                  <Typography variant="body2">
                    Guideline: {rec.evidence.guideline}<br />
                    Recommendation Strength: {rec.evidence.strength}<br />
                    Quality of Evidence: {rec.evidence.quality}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    <strong>Alternative Therapies</strong>
                  </Typography>
                  <Typography variant="body2">
                    {rec.alternatives}
                  </Typography>
                </Grid>

                {rec.taperingRequired && (
                  <Grid item xs={12}>
                    <Alert severity="warning">
                      <Typography variant="subtitle2" gutterBottom>
                        <strong>⚠️ Tapering Required</strong>
                      </Typography>
                      <Typography variant="body2">
                        {rec.taperingProtocol}
                      </Typography>
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    <strong>Monitoring Plan</strong>
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Frequency"
                        secondary={rec.monitoring.frequency}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Parameters"
                        secondary={rec.monitoring.parameters.join(', ')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Duration"
                        secondary={rec.monitoring.duration}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(index)}
                      disabled={approvedRecs.includes(index)}
                    >
                      {approvedRecs.includes(index) ? 'Approved' : 'Approve Recommendation'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(index)}
                    >
                      Reject with Documentation
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {/* Export Options */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button variant="outlined">
          Export PDF Report
        </Button>
        <Button variant="outlined">
          Add to EHR
        </Button>
      </Box>
    </Box>
  );
}

export default AnalysisResults;