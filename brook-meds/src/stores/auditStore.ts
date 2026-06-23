import { create } from 'zustand';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  details: Record<string, unknown>;
}

interface AuditStore {
  entries: AuditEntry[];
  addEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
}

export const useAuditStore = create<AuditStore>((set) => ({
  entries: [],
  addEntry: (entry) => set(s => ({
    entries: [{
      ...entry,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }, ...s.entries],
  })),
}));
