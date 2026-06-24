import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import TodayScreen from './features/today/TodayScreen';
import PatientScreen from './features/patient/PatientScreen';
import ScanScreen from './features/scan/ScanScreen';
import CDsScreen from './features/cds/CDsScreen';
import InventoryScreen from './features/inventory/InventoryScreen';
import AnalyticsScreen from './features/analytics/AnalyticsScreen';
import SettingsScreen from './features/settings/SettingsScreen';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<TodayScreen />} />
          <Route path="/patient/:id" element={<PatientScreen />} />
          <Route path="/scan" element={<ScanScreen />} />
          <Route path="/cds" element={<CDsScreen />} />
          <Route path="/inventory" element={<InventoryScreen />} />
          <Route path="/analytics" element={<AnalyticsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
