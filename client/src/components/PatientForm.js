import React, { useState, useEffect } from 'react';
import {
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput
} from '@mui/material';

const commonConditions = [
  'Hypertension',
  'Diabetes',
  'Heart Failure',
  'Atrial Fibrillation',
  'COPD',
  'Asthma',
  'Dementia',
  'Depression',
  'Anxiety',
  'Osteoarthritis',
  'Chronic Kidney Disease',
  'Osteoporosis'
];

function PatientForm({ onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    renalFunction: '',
    conditions: [],
    fallHistory: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    // Auto-save on change
    if (formData.name && formData.age) {
      onSave(formData);
    }
  }, [formData, onSave]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConditionsChange = (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      conditions: typeof value === 'string' ? value.split(',') : value
    }));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Patient Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter patient demographics and clinical information
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Patient Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            required
            inputProps={{ min: 65, max: 120 }}
            helperText="Age 65 or older"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Weight (kg)"
            name="weight"
            type="number"
            value={formData.weight}
            onChange={handleChange}
            inputProps={{ min: 30, max: 200 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="eGFR (mL/min/1.73m²)"
            name="renalFunction"
            type="number"
            value={formData.renalFunction}
            onChange={handleChange}
            helperText="Estimated glomerular filtration rate"
            inputProps={{ min: 0, max: 150 }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Medical Conditions</InputLabel>
            <Select
              multiple
              value={formData.conditions}
              onChange={handleConditionsChange}
              input={<OutlinedInput label="Medical Conditions" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {commonConditions.map((condition) => (
                <MenuItem key={condition} value={condition}>
                  {condition}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Fall History</InputLabel>
            <Select
              name="fallHistory"
              value={formData.fallHistory}
              onChange={handleChange}
              label="Fall History"
            >
              <MenuItem value={false}>No falls in past year</MenuItem>
              <MenuItem value={true}>Falls in past year</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PatientForm;