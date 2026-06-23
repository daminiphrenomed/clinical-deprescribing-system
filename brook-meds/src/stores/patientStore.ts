import { create } from 'zustand';
import type { Patient } from '../lib/types';

interface PatientStore {
  selectedPatientId: string | null;
  patientCache: Record<string, Patient>;
  setSelectedPatient: (id: string) => void;
  cachePatient: (patient: Patient) => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
  selectedPatientId: null,
  patientCache: {},
  setSelectedPatient: (id) => set({ selectedPatientId: id }),
  cachePatient: (patient) => set(s => ({ patientCache: { ...s.patientCache, [patient.id]: patient } })),
}));
