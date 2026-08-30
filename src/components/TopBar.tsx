import React from 'react';
import { FarmProfile } from '../types';

interface TopBarProps {
  currentFarm: FarmProfile;
  activeTab: string;
  onOpenNotifications: () => void;
  onOpenMobileMenu: () => void;
  onOpenAiChat: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentFarm,
  activeTab,
  onOpenNotifications,
  onOpenMobileMenu,
  onOpenAiChat,
}) => {
  const getBreadcrumbLabel = () => {
    switch (activeTab) {
      case 'today':
        return "Today's Operations";
      case 'crop-health':
        return `${currentFarm.name} • NDVI Analysis`;
      case 'water':
        return `${currentFarm.name} • Evapotranspiration`;
      case 'weather':
        return 'Climate & 7-Day Forecast';
      case 'setup':
        return 'Configuration';
      default:
        return currentFarm.name;
    }
  };

  return (
    <>
      {/* Mobile & Tablet Header */}
      <header className="lg:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-white border-b border-[#c1c8c2] shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-[#414844] hover:bg-[#edeeed] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined icon-fill text-[#012d1d] text-2xl">eco</span>
            <span className="text-[20px] font-bold text-[#012d1d] tracking-tight">AgriPulse</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#c1ecd4] text-[#002114] rounded-full text-xs font-semibold hover:bg-[#a5d0b9] transition-colors"
            title="Ask AI Agronomist"
          >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            <span>Ask AI</span>
          </button>
          <button
            onClick={onOpenNotifications}
            className="p-2 text-[#414844] hover:bg-[#edeeed] rounded-full transition-colors relative"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
          </button>
        </div>
      </header>

      {/* Desktop Top Sub-Header */}
      <header className="hidden lg:flex items-center justify-between px-8 py-3 bg-white/70 backdrop-blur-md border-b border-[#c1c8c2]/50 sticky top-0 z-30 ml-64">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-[13px] text-[#414844]">
          <span className="hover:text-[#012d1d] cursor-pointer font-medium">Fields</span>
          <span className="material-symbols-outlined text-[16px] text-[#717973]">chevron_right</span>
          <span className="font-semibold text-[#012d1d] bg-[#f3f4f3] px-2.5 py-1 rounded-md border border-[#c1c8c2]/40">
            {getBreadcrumbLabel()}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick AI Explainer Button */}
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b4332] text-white rounded-lg text-[13px] font-semibold hover:bg-[#012d1d] shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            <span>Ask AgriPulse AI</span>
          </button>

          {/* Search */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#717973] text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search fields, logs, metrics..."
              className="bg-[#f3f4f3] border border-[#c1c8c2] rounded-full py-1.5 pl-9 pr-3 text-[13px] text-[#191c1c] focus:outline-none focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] w-60 transition-all placeholder:text-[#717973]"
            />
          </div>

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="p-2 text-[#414844] hover:bg-[#edeeed] rounded-full transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
          </button>
        </div>
      </header>
    </>
  );
};
