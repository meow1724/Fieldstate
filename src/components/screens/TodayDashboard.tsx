import React, { useState } from 'react';
import { FarmProfile, AgronomicState, Recommendation, WeatherDay, NdviReading } from '../../types';

interface TodayDashboardProps {
  farm: FarmProfile;
  agronomic: AgronomicState;
  recommendation: Recommendation;
  weather3Day: WeatherDay[];
  ndviReadings: NdviReading[];
  onNavigateToTab: (tab: string) => void;
  onOpenAiExplainer: () => void;
  onNewSurvey: () => void;
}

export const TodayDashboard: React.FC<TodayDashboardProps> = ({
  farm,
  agronomic,
  recommendation,
  weather3Day,
  ndviReadings,
  onNavigateToTab,
  onOpenAiExplainer,
  onNewSurvey,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // 7-day or 30-day bars data for NDVI widget
  const ndviBars = [
    { value: 0.42, height: '30%', label: 'Day 10' },
    { value: 0.51, height: '40%', label: 'Day 18' },
    { value: 0.58, height: '45%', label: 'Day 24' },
    { value: 0.65, height: '60%', label: 'Day 30' },
    { value: 0.72, height: '75%', label: 'Day 36' },
    { value: 0.78, height: '85%', label: 'Day 42' },
    { value: agronomic.waterStatus === 'stress' ? 0.62 : 0.82, height: agronomic.waterStatus === 'stress' ? '68%' : '92%', label: 'Today', isLatest: true },
  ];

  const handleAcknowledge = () => {
    setAcknowledged(true);
    setTimeout(() => setAcknowledged(false), 4000);
  };

  const getStatusPill = () => {
    switch (recommendation.action) {
      case 'WAIT':
        return (
          <div className="flex items-center gap-2 bg-[#fff3cd] text-[#856404] px-4 py-2 rounded-full text-[14px] font-bold shadow-xs">
            <span className="material-symbols-outlined text-[18px]">pause_circle</span>
            <span>WAIT</span>
          </div>
        );
      case 'IRRIGATE':
        return (
          <div className="flex items-center gap-2 bg-[#ffdad6] text-[#93000a] px-4 py-2 rounded-full text-[14px] font-bold shadow-xs animate-pulse">
            <span className="material-symbols-outlined text-[18px]">water_drop</span>
            <span>IRRIGATE NOW</span>
          </div>
        );
      case 'INSPECT':
        return (
          <div className="flex items-center gap-2 bg-[#ffdad3] text-[#741f11] px-4 py-2 rounded-full text-[14px] font-bold shadow-xs">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>INSPECT</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 bg-[#c1ecd4] text-[#002114] px-4 py-2 rounded-full text-[14px] font-bold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>OPTIMAL</span>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-[36px] md:text-[48px] font-bold text-[#191c1c] tracking-tight leading-tight">
          Good Morning, Manager.
        </h2>
        <p className="text-[18px] text-[#414844] mt-1">
          Here is the critical data for today's operations.
        </p>
      </div>

      {/* Acknowledged Toast Alert */}
      {acknowledged && (
        <div className="mb-6 p-4 bg-[#c1ecd4] text-[#002114] rounded-xl flex items-center justify-between border border-[#a5d0b9] shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">verified</span>
            <div>
              <p className="text-[14px] font-bold">Daily Decision Acknowledged</p>
              <p className="text-[12px]">Decision logged: Skipped scheduled irrigation event in anticipation of 24h rainfall.</p>
            </div>
          </div>
          <button
            onClick={() => setAcknowledged(false)}
            className="text-[12px] font-bold uppercase underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
        {/* Hero Decision Card (Spans 8 cols on desktop) */}
        <div className="col-span-1 md:col-span-8 bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 flex flex-col justify-between relative overflow-hidden">
          {/* Accent Line */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0b4345]"></div>

          <div>
            {/* Header / Subhead */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#edeeed] rounded-full text-[13px] font-medium text-[#414844] mb-3">
                  <span className="material-symbols-outlined text-[16px]">agriculture</span>
                  <span>
                    {farm.name} • Day {agronomic.cropAgeDays}
                  </span>
                </span>
                <h3 className="text-[28px] md:text-[32px] font-semibold text-[#191c1c] tracking-tight">
                  {recommendation.title}
                </h3>
              </div>
              {getStatusPill()}
            </div>

            {/* Demand & Rain Forecast Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 my-4">
              {/* Crop Demand */}
              <div className="bg-[#f3f4f3] p-5 rounded-xl flex items-center gap-4 border border-[#c1c8c2]/20">
                <div className="p-3.5 bg-[#ffdad6] text-[#93000a] rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined icon-fill text-[24px]">trending_up</span>
                </div>
                <div>
                  <p className="text-[12px] text-[#414844] uppercase tracking-wider font-semibold">Crop Demand</p>
                  <p className="text-[28px] md:text-[32px] text-[#191c1c] font-bold leading-tight">
                    {agronomic.cropEtDemand.toFixed(1)}{' '}
                    <span className="text-[16px] font-normal text-[#414844]">mm/day</span>
                  </p>
                </div>
              </div>

              {/* Rain Forecast */}
              <div className="bg-[#f3f4f3] p-5 rounded-xl flex items-center gap-4 border border-[#c1c8c2]/20">
                <div className="p-3.5 bg-[#b9ecee] text-[#002021] rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined icon-fill text-[24px]">rainy</span>
                </div>
                <div>
                  <p className="text-[12px] text-[#414844] uppercase tracking-wider font-semibold">Rain Forecast (Next 24h)</p>
                  <p className="text-[28px] md:text-[32px] text-[#191c1c] font-bold leading-tight">
                    {agronomic.rain24h.toFixed(1)}{' '}
                    <span className="text-[16px] font-normal text-[#414844]">mm</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Brief Context Explanation */}
            <p className="text-[14px] text-[#414844] leading-relaxed mt-2 bg-[#f9f9f8] p-3.5 rounded-lg border border-[#c1c8c2]/30">
              <strong className="text-[#191c1c]">Agronomic Context:</strong> {recommendation.reason}
            </p>
          </div>

          {/* Card Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-6 border-t border-[#c1c8c2]/30 pt-6">
            <button
              onClick={handleAcknowledge}
              className="bg-[#012d1d] hover:bg-[#1b4332] text-white px-6 py-3 rounded-lg text-[14px] font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[18px]">done</span>
              <span>Acknowledge & Skip</span>
            </button>
            <button
              onClick={() => onNavigateToTab('weather')}
              className="bg-transparent border border-[#717973] text-[#191c1c] hover:bg-[#f3f4f3] px-6 py-3 rounded-lg text-[14px] font-medium transition-colors cursor-pointer"
            >
              View Detailed Forecast
            </button>
            <button
              onClick={onOpenAiExplainer}
              className="ml-auto text-[#0b4345] hover:text-[#002c2d] text-[13px] font-semibold flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              <span>Why this recommendation?</span>
            </button>
          </div>
        </div>

        {/* 3-Day Weather Summary (Spans 4 cols on desktop) */}
        <div className="col-span-1 md:col-span-4 bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-bold text-[#191c1c] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#012d1d] text-[22px]">partly_cloudy_day</span>
              <span>3-Day Weather</span>
            </h3>
            <button
              onClick={() => onNavigateToTab('weather')}
              className="text-[#012d1d] text-[13px] font-semibold hover:underline cursor-pointer"
            >
              Full Report
            </button>
          </div>

          <div className="flex flex-col divide-y divide-[#c1c8c2]/30">
            {weather3Day.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between py-3.5">
                <span
                  className={`text-[15px] w-14 ${
                    idx === 0 ? 'font-bold text-[#191c1c]' : 'font-normal text-[#414844]'
                  }`}
                >
                  {day.dayLabel}
                </span>
                <div
                  className={`flex items-center gap-1.5 text-[14px] ${
                    day.pop >= 50 ? 'text-[#0b4345] font-semibold' : 'text-[#414844]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] icon-fill">
                    {day.icon}
                  </span>
                  <span>{day.pop}%</span>
                </div>
                <div className="text-[14px] text-[#414844]">
                  <span className="text-[#191c1c] font-semibold">{day.tempMax}°</span> / {day.tempMin}°
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#c1c8c2]/30 bg-[#f9f9f8] p-3 rounded-lg flex items-center justify-between text-[12px] text-[#414844]">
            <span>Reference ET (ET₀):</span>
            <span className="font-bold text-[#012d1d]">{agronomic.referenceEt0} mm/day</span>
          </div>
        </div>

        {/* Crop Health Widget (NDVI) (Spans 6 cols on desktop) */}
        <div className="col-span-1 md:col-span-6 bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[18px] font-bold text-[#191c1c] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#012d1d] text-[22px]">spa</span>
              <span>Crop Health (NDVI)</span>
            </h3>
            <span className="bg-[#edeeed] px-3 py-1 rounded-full text-[12px] font-medium text-[#414844]">
              Last 30 Days
            </span>
          </div>

          {/* Visual CSS Bar Chart */}
          <div className="flex-grow flex items-end justify-between gap-2.5 h-44 mt-4 mb-2 relative px-2">
            {/* Horizontal Grid Line Markers */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-15">
              <div className="border-t border-[#717973] w-full"></div>
              <div className="border-t border-[#717973] w-full"></div>
              <div className="border-t border-[#717973] w-full"></div>
            </div>

            {/* Bars */}
            {ndviBars.map((bar, i) => {
              const isHovered = hoveredBarIndex === i;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredBarIndex(i)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  className="w-full flex flex-col items-center justify-end h-full relative cursor-pointer group"
                >
                  {/* Tooltip */}
                  <div
                    className={`absolute -top-9 bg-[#2e3131] text-white text-[11px] font-semibold py-1 px-2 rounded-md whitespace-nowrap shadow-md transition-opacity z-20 pointer-events-none ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {bar.label}: {bar.value.toFixed(2)}
                  </div>

                  {/* Indicator dot for latest point */}
                  {bar.isLatest && (
                    <div className="absolute -top-3 w-2.5 h-2.5 bg-[#a03f2e] rounded-full border-2 border-white shadow-xs z-10"></div>
                  )}

                  <div
                    style={{ height: bar.height }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      bar.isLatest
                        ? 'bg-[#012d1d] shadow-[0_0_12px_rgba(1,45,29,0.3)]'
                        : `bg-[#012d1d] opacity-${30 + i * 10} hover:opacity-90`
                    }`}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* Bottom Stats */}
          <div className="flex justify-between items-center mt-4 border-t border-[#c1c8c2]/30 pt-4">
            <div>
              <p className="text-[12px] text-[#414844] font-medium uppercase tracking-wider">Current Index</p>
              <p className="text-[32px] text-[#012d1d] font-bold leading-tight">
                {ndviReadings[0]?.observed?.toFixed(2) || '0.82'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[#414844] font-medium uppercase tracking-wider">Status</p>
              <p
                onClick={() => onNavigateToTab('crop-health')}
                className="text-[18px] font-bold text-[#191c1c] flex items-center gap-1 justify-end hover:text-[#012d1d] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#012d1d] text-[20px]">arrow_upward</span>
                <span>{ndviReadings[0]?.variance <= -0.1 ? 'Anomaly' : 'Excellent'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Soil Moisture Balance Widget (Spans 6 cols on desktop) */}
        <div className="col-span-1 md:col-span-6 bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[18px] font-bold text-[#191c1c] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0b4345] text-[22px]">waves</span>
              <span>Soil Moisture Balance</span>
            </h3>
            <button
              onClick={() => onNavigateToTab('water')}
              className="text-[#414844] hover:bg-[#edeeed] p-1.5 rounded-full transition-colors"
              title="Water Simulator"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>

          {/* Circular Gauge Representation */}
          <div className="flex-grow flex items-center justify-center p-4">
            <div className="relative w-44 h-44 rounded-full border-8 border-[#e7e8e7] flex items-center justify-center overflow-hidden shadow-inner">
              {/* Simulated Moisture Wave Fill */}
              <div
                className="absolute bottom-0 w-full bg-[#9ecfd1]/60 transition-all duration-700 ease-in-out"
                style={{ height: `${agronomic.soilMoisturePercent}%` }}
              ></div>

              {/* Inner Circle Overlay */}
              <div className="relative z-10 w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-xs">
                <span className="text-[38px] text-[#191c1c] font-bold tracking-tight">
                  {agronomic.soilMoisturePercent}
                  <span className="text-[20px] font-normal">%</span>
                </span>
                <span className="text-[12px] text-[#414844] font-medium">Field Capacity</span>
              </div>
            </div>
          </div>

          {/* Metrics Footer */}
          <div className="grid grid-cols-2 gap-3 mt-4 border-t border-[#c1c8c2]/30 pt-4">
            <div className="bg-[#f9f9f8] p-3 rounded-lg border border-[#c1c8c2]/40">
              <p className="text-[11px] text-[#414844] font-medium uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                <span>Root Zone Depletion</span>
              </p>
              <p className="text-[18px] text-[#191c1c] font-semibold mt-0.5">
                {agronomic.rootZoneDepletion} mm
              </p>
            </div>
            <div className="bg-[#f9f9f8] p-3 rounded-lg border border-[#c1c8c2]/40">
              <p className="text-[11px] text-[#414844] font-medium uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">opacity</span>
                <span>Available Water</span>
              </p>
              <p className="text-[18px] text-[#191c1c] font-semibold mt-0.5">
                {agronomic.availableWater} mm
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
