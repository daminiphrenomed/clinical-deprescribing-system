import { NavLink } from 'react-router-dom';
import { ClipboardList, User, Scan, Pill, Package, BarChart2, Settings, LogOut } from 'lucide-react';

const nav = [
  { to: '/today', label: 'Today', icon: ClipboardList },
  { to: '/patient', label: 'Patients', icon: User },
  { to: '/scan', label: 'Dispense', icon: Scan },
  { to: '/cds', label: 'CDs', icon: Pill },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-60 flex flex-col h-full" style={{ background: 'var(--navy)' }}>
      <div className="flex-1 py-4 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-white bg-white/15'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </div>
      <div className="p-3 border-t border-white/10">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
