import { create } from 'zustand';

interface StockItem {
  drug: string;
  currentLevel: number;
  reorderLevel: number;
  expiryDate?: string;
}

interface StockStore {
  items: StockItem[];
  updateStock: (drug: string, newLevel: number) => void;
}

export const useStockStore = create<StockStore>((set) => ({
  items: [],
  updateStock: (drug, newLevel) => set(s => ({
    items: s.items.map(item => item.drug === drug ? { ...item, currentLevel: newLevel } : item),
  })),
}));
