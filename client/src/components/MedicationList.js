import React, { useState } from 'react';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Box,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function MedicationList({ medications, setMedications, patient }) {
  const [open, setOpen] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dose: '',
    frequency: '',
    indication: ''
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewMed({ name: '', dose: '', frequency: '', indication: '' });
  };

  const handleAdd = () => {
    if (newMed.name && newMed.dose) {
      setMedications([...medications, { ...newMed, id: Date.now() }]);
      handleClose();
    }
  };

  const handleDelete = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" gutterBottom>
            Current Medications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {patient?.name ? `Patient: ${patient.name}, Age: ${patient.age}` : 'No patient selected'}
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Medication
        </Button>
      </Box>

      {medications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No medications added yet. Click "Add Medication" to begin.
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Medication</strong></TableCell>
                  <TableCell><strong>Dose</strong></TableCell>
                  <TableCell><strong>Frequency</strong></TableCell>
                  <TableCell><strong>Indication</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medications.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell>{med.name}</TableCell>
                    <TableCell>{med.dose}</TableCell>
                    <TableCell>{med.frequency}</TableCell>
                    <TableCell>{med.indication}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(med.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`Total: ${medications.length} medications`} 
              color={medications.length >= 5 ? 'warning' : 'default'}
            />
            {medications.length >= 5 && (
              <Chip 
                label="Polypharmacy detected" 
                color="warning" 
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Medication</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medication Name"
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dose"
                value={newMed.dose}
                onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                placeholder="e.g., 10 mg"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Frequency"
                value={newMed.frequency}
                onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                placeholder="e.g., Once daily"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Indication"
                value={newMed.indication}
                onChange={(e) => setNewMed({ ...newMed, indication: e.target.value })}
                placeholder="e.g., Hypertension"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MedicationList;