import React from 'react';
import { FarmProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewSurvey: () => void;
  currentFarm: FarmProfile;
  farms: Record<string, any>;
  onSelectFarm: (farmId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onNewSurvey,
  currentFarm,
  farms,
  onSelectFarm,
}) => {
  const navItems = [
    { id: 'today', label: "Today's Actions", icon: 'assignment_turned_in' },
    { id: 'crop-health', label: 'Crop Health', icon: 'potted_plant' },
    { id: 'water', label: 'Water Management', icon: 'water_drop' },
    { id: 'weather', label: 'Weather Forecast', icon: 'cloud_sync' },
    { id: 'setup', label: 'Farm Setup', icon: 'settings' },
  ];

  return (
    <nav className="hidden lg:flex flex-col h-screen p-6 gap-2 border-r border-[#c1c8c2] bg-[#f3f4f3] w-64 shrink-0 fixed left-0 top-0 z-40 overflow-y-auto custom-scrollbar">
      {/* Brand Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#012d1d] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined icon-fill text-2xl">eco</span>
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-[#012d1d] leading-tight tracking-tight">AgriPulse</h1>
            <p className="text-[12px] text-[#414844] tracking-wider uppercase font-medium">Precision Agriculture</p>
          </div>
        </div>

        {/* Quick Farm Selector */}
        <div className="mt-4 pt-3 border-t border-[#c1c8c2]/50">
          <label className="text-[11px] font-medium text-[#414844] uppercase tracking-wider block mb-1.5 flex items-center justify-between">
            <span>Active Field</span>
            <span className="text-[10px] bg-[#e1e3e2] px-1.5 py-0.5 rounded text-[#012d1d] font-semibold">Live</span>
          </label>
          <div className="relative">
            <select
              value={currentFarm.id}
              onChange={(e) => onSelectFarm(e.target.value)}
              className="w-full text-[13px] font-medium bg-white text-[#191c1c] border border-[#c1c8c2] rounded-lg py-2 pl-2.5 pr-7 focus:outline-none focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] appearance-none cursor-pointer shadow-xs transition-colors"
            >
              {Object.values(farms).map((item: any) => (
                <option key={item.farm.id} value={item.farm.id}>
                  {item.farm.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#414844] text-[18px]">
              unfold_more
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onNewSurvey}
        className="w-full bg-[#012d1d] hover:bg-[#1b4332] text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 text-[14px] font-semibold shadow-sm hover:shadow-md transition-all mb-4 cursor-pointer active:scale-[0.99]"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        <span>New Field Survey</span>
      </button>

      {/* Main Navigation Items */}
      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#1b4332] text-white font-bold shadow-xs translate-x-0.5'
                  : 'text-[#414844] hover:bg-[#e7e8e7] hover:text-[#191c1c] font-medium'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  isActive ? 'icon-fill text-[#c1ecd4]' : 'text-[#414844]'
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[14px]">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="mt-auto pt-4 border-t border-[#c1c8c2] flex flex-col gap-1">
        <button
          onClick={() => onTabChange('support')}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#414844] hover:bg-[#e7e8e7] text-[14px] font-medium transition-colors text-left"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span>Support & FAQ</span>
        </button>
        <button
          onClick={() => onTabChange('setup')}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#414844] hover:bg-[#e7e8e7] text-[14px] font-medium transition-colors text-left"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>Settings</span>
        </button>

        {/* User Profile */}
        <div className="mt-3 pt-3 border-t border-[#c1c8c2]/40 flex items-center gap-3 px-2 py-1">
          <img
            alt="Farm Manager Profile"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDd2H1b3jUS3XxT9bJ0yL6stcHciyK0rhZmP6iW1wt9oAeVK4Ci3y9942WkqrKDLxtNaieO5whvMx53KfgzW58w-vt2srT8YZ828-TL1QmF8qkubswpuvkEXgSqU55J1ZIEtkpkXA4INCz2Zu_ea48KnF4Rk1VpkLKn61BLSjvskcvE8xJElxUg3yEi2KoSZiWybYn0c8rEbnSnLWaGLz7dmnxOKXbTzZdA0E4HI7Gj_xCbbsRiBlH0"
            className="w-10 h-10 rounded-full object-cover border-2 border-[#1b4332]"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-semibold text-[#191c1c] truncate">J. Doe</span>
            <span className="text-[12px] text-[#414844] truncate">Farm Manager</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
