import React from 'react';
import { FarmProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewSurvey: () => void;
  currentFarm: FarmProfile;
  farms: Record<string, any>;
  onSelectFarm: (farmId: string) => void;
  onSelectJudgeScenario: (scenarioKey: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onNewSurvey,
  currentFarm,
  farms,
  onSelectFarm,
  onSelectJudgeScenario,
}) => {
  const navItems = [
    { id: 'today', label: "Today's Decision", icon: 'task_alt', badge: '1 Action' },
    { id: 'economics', label: 'ROI & Carbon Savings', icon: 'savings', badge: 'Active' },
    { id: 'crop-health', label: 'Crop Health (NDVI)', icon: 'satellite_alt' },
    { id: 'water', label: 'Water Management', icon: 'water_drop' },
    { id: 'weather', label: 'Weather Forecast', icon: 'cloud_sync' },
    { id: 'setup', label: 'Farm Configuration', icon: 'settings' },
  ];

  return (
    <nav className="hidden lg:flex flex-col h-screen p-5 gap-2 border-r border-[#2d4436] bg-[#101b13] text-[#e2ece5] w-64 shrink-0 fixed left-0 top-0 z-40 overflow-y-auto custom-scrollbar shadow-2xl">
      {/* Brand Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#234e35] border border-[#3b7352] flex items-center justify-center text-[#e6a833] shadow-md">
            <span className="material-symbols-outlined icon-fill text-2xl">eco</span>
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-white leading-tight tracking-tight flex items-center gap-1.5">
              <span>Fieldstate</span>
            </h1>
            <p className="text-[11px] text-[#86a894] tracking-wider uppercase font-semibold">Precision Water Intelligence</p>
          </div>
        </div>

        {/* Quick Farm Selector */}
        <div className="mt-4 pt-3 border-t border-[#233b2c]">
          <label className="text-[11px] font-bold text-[#86a894] uppercase tracking-wider block mb-1.5 flex items-center justify-between">
            <span>Active Parcel</span>
            <span className="text-[10px] bg-[#234e35] text-[#c1ecd4] px-1.5 py-0.5 rounded font-mono font-semibold">Live GPS</span>
          </label>
          <div className="relative">
            <select
              value={currentFarm.id}
              onChange={(e) => onSelectFarm(e.target.value)}
              className="w-full text-[13px] font-medium bg-[#192a1e] text-white border border-[#2e4d3a] rounded-lg py-2 pl-2.5 pr-7 focus:outline-none focus:border-[#4ade80] appearance-none cursor-pointer shadow-xs transition-colors"
            >
              {Object.values(farms).map((item: any) => (
                <option key={item.farm.id} value={item.farm.id}>
                  {item.farm.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#86a894] text-[18px]">
              unfold_more
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onNewSurvey}
        className="w-full bg-[#e6a833] hover:bg-[#d49624] text-[#101b13] rounded-xl py-2.5 px-3.5 flex items-center justify-center gap-2 text-[13px] font-bold shadow-md hover:shadow-lg transition-all mb-3 cursor-pointer active:scale-[0.98]"
      >
        <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
        <span>Log Field Scout Survey</span>
      </button>

      {/* Main Navigation Items */}
      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#234e35] text-white font-bold shadow-inner border border-[#3f7a57]'
                  : 'text-[#a5b8ac] hover:bg-[#192b1f] hover:text-white font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? 'icon-fill text-[#e6a833]' : 'text-[#86a894]'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-[13px]">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-[#e6a833] text-[#141e17]' : 'bg-[#192b1f] text-[#a5d0b9] border border-[#2d523b]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Field Parcel Condition Testing Drawer */}
      <div className="pt-3 pb-2 border-t border-[#233b2c] flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-[#86a894] uppercase tracking-wider px-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-[#e6a833]">explore</span>
          <span>Sample Field Parcels</span>
        </span>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => onSelectJudgeScenario('north-plot-rice')}
            title="Rice Paddy (Sub-tropical) - 31mm Rain Forecast -> WAIT"
            className="text-[10px] bg-[#192a1e] hover:bg-[#234e35] text-[#93c5fd] hover:text-white border border-[#284936] py-1.5 px-1 rounded-lg text-center font-semibold transition-colors cursor-pointer"
          >
            Rice (Rain)
          </button>
          <button
            onClick={() => onSelectJudgeScenario('sector-7-wheat')}
            title="Wheat (Semi-arid) - Depleted Profile -> IRRIGATE"
            className="text-[10px] bg-[#192a1e] hover:bg-[#234e35] text-[#fca5a5] hover:text-white border border-[#284936] py-1.5 px-1 rounded-lg text-center font-semibold transition-colors cursor-pointer"
          >
            Wheat (Dry)
          </button>
          <button
            onClick={() => onSelectJudgeScenario('east-basin-corn')}
            title="Corn Field (Temperate) - Canopy Vigor Drop -> INSPECT"
            className="text-[10px] bg-[#192a1e] hover:bg-[#234e35] text-[#fde047] hover:text-white border border-[#284936] py-1.5 px-1 rounded-lg text-center font-semibold transition-colors cursor-pointer"
          >
            Corn (Scout)
          </button>
        </div>
      </div>

      {/* Footer Profile */}
      <div className="mt-auto pt-3 border-t border-[#233b2c] flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#234e35] border border-[#4ade80] flex items-center justify-center text-white font-bold text-xs">
            FS
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-semibold text-white truncate">Field Manager</span>
            <span className="text-[10px] text-[#86a894] truncate">Enterprise Edition</span>
          </div>
        </div>
        <button
          onClick={() => onTabChange('setup')}
          className="text-[#86a894] hover:text-white p-1 rounded hover:bg-[#192b1f]"
          title="Settings"
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
        </button>
      </div>
    </nav>
  );
};
