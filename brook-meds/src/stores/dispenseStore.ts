import { create } from 'zustand';
import type { DispenseEvent } from '../lib/types';

interface DispenseStore {
  recentDispenses: DispenseEvent[];
  addDispense: (event: DispenseEvent) => void;
}

export const useDispenseStore = create<DispenseStore>((set) => ({
  recentDispenses: [],
  addDispense: (event) => set(s => ({ recentDispenses: [event, ...s.recentDispenses] })),
}));
