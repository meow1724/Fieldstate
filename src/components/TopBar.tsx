import React from 'react';
import { FarmProfile } from '../types';

interface TopBarProps {
  currentFarm: FarmProfile;
  activeTab: string;
  onOpenNotifications: () => void;
  onOpenMobileMenu: () => void;
  onOpenAiChat: () => void;
  onOpenProvenanceGuide: () => void;
  isSyncingApi: boolean;
  onRefreshApi: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentFarm,
  activeTab,
  onOpenNotifications,
  onOpenMobileMenu,
  onOpenAiChat,
  onOpenProvenanceGuide,
  isSyncingApi,
  onRefreshApi,
}) => {
  const getBreadcrumbLabel = () => {
    switch (activeTab) {
      case 'today':
        return "Today's One Decision";
      case 'economics':
        return 'Pumping Energy, Dollars & Carbon ROI';
      case 'crop-health':
        return `${currentFarm.name} — Sentinel-2 NDVI`;
      case 'water':
        return 'FAO-56 Evapotranspiration & Water Balance';
      case 'weather':
        return 'Climate & Radar Forecast';
      case 'setup':
        return 'Farm & Pump Configuration';
      default:
        return currentFarm.name;
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-[#101b13] text-white border-b border-[#2d4436] shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenMobileMenu}
            className="p-1.5 text-[#a5b8ac] hover:bg-[#192a1e] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined icon-fill text-[#e6a833] text-2xl">eco</span>
            <span className="text-[18px] font-bold tracking-tight text-white">Fieldstate</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#234e35] text-[#c1ecd4] rounded-full text-[11px] font-bold border border-[#3b7352]"
          >
            <span className="material-symbols-outlined text-[15px]">psychology</span>
            <span>Ask AI</span>
          </button>
          <button
            onClick={onOpenNotifications}
            className="p-1.5 text-[#a5b8ac] hover:bg-[#192a1e] rounded-full transition-colors relative"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#e6a833] rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Desktop Top Header */}
      <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-[#e2e8f0] sticky top-0 z-30 ml-64 shadow-xs">
        {/* Breadcrumb Navigation & Parcel Info */}
        <div className="flex items-center gap-2.5 text-[13px] text-[#64748b]">
          <span className="hover:text-[#1e3a29] font-medium">Fields</span>
          <span className="material-symbols-outlined text-[16px] text-[#94a3b8]">chevron_right</span>
          <span className="font-bold text-[#1e3a29] bg-[#f1f5f2] px-3 py-1 rounded-md border border-[#d1e0d7]">
            {getBreadcrumbLabel()}
          </span>
          <span className="text-[11px] text-[#64748b] ml-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#3b82f6]">location_on</span>
            <span>{currentFarm.locationName}</span>
          </span>
        </div>

        {/* Action Controls & AI Agronomist Launcher */}
        <div className="flex items-center gap-3">
          {/* Provenance Explainer Button */}
          <button
            onClick={onOpenProvenanceGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafc] text-[#334155] border border-[#cbd5e1] rounded-lg text-[12px] font-semibold hover:bg-[#f1f5f9] transition-colors cursor-pointer"
            title="View Data Provenance Standard"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0284c7]">verified_user</span>
            <span>Data Provenance</span>
          </button>

          {/* Quick AI Explainer Button */}
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1e3a29] text-white rounded-lg text-[12px] font-bold hover:bg-[#14281c] shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-[#e6a833]">psychology</span>
            <span>Ask Fieldstate AI</span>
          </button>

          {/* Live Refresh Button */}
          <button
            onClick={onRefreshApi}
            disabled={isSyncingApi}
            className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg transition-colors border border-[#e2e8f0]"
            title="Refresh Live Weather & Models"
          >
            <span className={`material-symbols-outlined text-[19px] ${isSyncingApi ? 'animate-spin text-[#1e3a29]' : ''}`}>
              sync
            </span>
          </button>

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-full transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[21px]">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#e6a833] rounded-full"></span>
          </button>
        </div>
      </header>
    </>
  );
};
