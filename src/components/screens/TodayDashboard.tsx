import React, { useState } from 'react';
import { FarmProfile, AgronomicState, Recommendation, WeatherDay, NdviReading, DataProvenanceTag } from '../../types';
import confetti from 'canvas-confetti';

interface TodayDashboardProps {
  farm: FarmProfile;
  agronomic: AgronomicState;
  recommendation: Recommendation;
  weather3Day: WeatherDay[];
  ndviReadings: NdviReading[];
  onNavigateToTab: (tab: string) => void;
  onOpenAiExplainer: () => void;
  onNewSurvey: () => void;
  onOpenProvenanceModal: (tag: DataProvenanceTag) => void;
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
  onOpenProvenanceModal,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const ndviBars = [
    { value: 0.35, height: '35%', label: 'Day 10' },
    { value: 0.46, height: '45%', label: 'Day 20' },
    { value: 0.58, height: '58%', label: 'Day 30' },
    { value: 0.69, height: '70%', label: 'Day 40' },
    { value: 0.76, height: '78%', label: 'Day 45' },
    {
      value: ndviReadings[0]?.observed || 0.80,
      height: `${Math.round((ndviReadings[0]?.observed || 0.80) * 100)}%`,
      label: 'Today',
      isLatest: true,
    },
  ];

  const handleAcknowledge = () => {
    setAcknowledged(true);
    if (recommendation.action === 'WAIT') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#22c55e', '#e6a833', '#3b82f6'],
      });
    }
    setTimeout(() => setAcknowledged(false), 5000);
  };

  const getStatusBadge = () => {
    switch (recommendation.action) {
      case 'WAIT':
        return (
          <div className="flex items-center gap-2 bg-[#2d523b] text-[#c1ecd4] px-4 py-2 rounded-xl text-[14px] font-bold border border-[#3f7a57] shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-[#e6a833]">pause_circle</span>
            <span>WAIT — DO NOT IRRIGATE</span>
          </div>
        );
      case 'IRRIGATE':
        return (
          <div className="flex items-center gap-2 bg-[#7f1d1d] text-[#fecaca] px-4 py-2 rounded-xl text-[14px] font-bold border border-[#b91c1c] shadow-sm animate-pulse">
            <span className="material-symbols-outlined text-[20px]">water_drop</span>
            <span>IRRIGATE NOW</span>
          </div>
        );
      case 'INSPECT':
        return (
          <div className="flex items-center gap-2 bg-[#78350f] text-[#fef3c7] px-4 py-2 rounded-xl text-[14px] font-bold border border-[#b45309] shadow-sm">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span>GROUND INSPECTION</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 bg-[#1e3a29] text-white px-4 py-2 rounded-xl text-[14px] font-bold">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>OPTIMAL</span>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 max-w-[1380px] mx-auto w-full">
      {/* Page Header (Matching Slide 1 & 12 of Fieldstate Deck) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#1e3a29] text-[#e6a833] text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-[#2d523b]">
              Earth Forward 2026 Engine
            </span>
            <span className="text-[12px] text-[#64748b] font-medium">
              Three signals in · One decision out
            </span>
          </div>
          <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#0f172a] tracking-tight leading-tight">
            Today's Irrigation Decision
          </h2>
          <p className="text-[15px] text-[#475569] mt-0.5">
            Physics-based water demand model + independent Sentinel-2 satellite vigor + AI plain-language explanation.
          </p>
        </div>

        {/* Quick Provenance Summary Pill */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#cbd5e1] shadow-xs">
          <span className="text-[11px] font-bold text-[#64748b] uppercase">Confidence:</span>
          <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${
            recommendation.confidence === 'High' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
          }`}>
            {recommendation.confidence}
          </span>
          <span className="text-[11px] text-[#64748b] hidden sm:inline truncate max-w-xs" title={recommendation.confidenceReason}>
            ({recommendation.confidenceReason})
          </span>
        </div>
      </div>

      {/* Acknowledged Toast Alert */}
      {acknowledged && (
        <div className="mb-6 p-4 bg-[#ecfdf5] text-[#065f46] rounded-2xl flex items-center justify-between border border-[#a7f3d0] shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[26px] text-[#059669]">verified</span>
            <div>
              <p className="text-[14px] font-bold">Decision Logged to Farm Audit Ledger</p>
              <p className="text-[12px] text-[#047857]">
                {recommendation.action === 'WAIT'
                  ? `Successfully avoided ~${agronomic.potentialWaterSavedLitres.toLocaleString()} L of pumping. Energy savings added to ROI ledger.`
                  : `Action recorded for ${farm.name}.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAcknowledged(false)}
            className="text-[12px] font-bold uppercase underline hover:opacity-80 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
        {/* HERO CARD: The One Decision Box (Matching Slide 10 & 12 of Fieldstate Deck) */}
        <div className="col-span-1 md:col-span-8 bg-[#101b13] text-white rounded-3xl p-6 md:p-8 shadow-xl border border-[#2d4436] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#234e35]/30 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            {/* Header / Subhead */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#192b1f] border border-[#2d523b] rounded-full text-[12px] font-medium text-[#c1ecd4] mb-2.5">
                  <span className="material-symbols-outlined text-[15px] text-[#e6a833]">agriculture</span>
                  <span>
                    {farm.name} · Day {agronomic.cropAgeDays} ({agronomic.growthStageName})
                  </span>
                </span>
                <h3 className="text-[26px] md:text-[30px] font-bold text-white tracking-tight leading-snug">
                  {recommendation.title}
                </h3>
              </div>
              {getStatusBadge()}
            </div>

            {/* Demand vs Forecast 2-Col Grid with Provenance Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3">
              {/* Crop Demand (ETc) */}
              <div className="bg-[#192a1e] p-5 rounded-2xl border border-[#2d4e39] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#86a894] uppercase tracking-wider font-bold">
                    Crop Demand (ETc)
                  </span>
                  <button
                    onClick={() => onOpenProvenanceModal(recommendation.provenance.demand)}
                    className="text-[10px] bg-[#234e35] text-[#c1ecd4] px-2 py-0.5 rounded-full font-bold border border-[#3b7352] hover:bg-[#346848] transition-colors cursor-pointer"
                  >
                    {recommendation.provenance.demand.label}
                  </button>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-[34px] font-extrabold text-white leading-none">
                    {agronomic.cropEtDemand.toFixed(1)}
                  </p>
                  <span className="text-[14px] font-medium text-[#86a894]">mm/day</span>
                </div>
                <p className="text-[11px] text-[#86a894] mt-2">
                  Penman-Monteith ET₀ ({agronomic.referenceEt0} mm) × Kc ({agronomic.cropCoefficientKc})
                </p>
              </div>

              {/* 24h Rain Forecast */}
              <div className="bg-[#192a1e] p-5 rounded-2xl border border-[#2d4e39] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#86a894] uppercase tracking-wider font-bold">
                    Rain Forecast (24h)
                  </span>
                  <button
                    onClick={() => onOpenProvenanceModal(recommendation.provenance.rain)}
                    className="text-[10px] bg-[#1e3a5f] text-[#93c5fd] px-2 py-0.5 rounded-full font-bold border border-[#2563eb]/40 hover:bg-[#2563eb]/30 transition-colors cursor-pointer"
                  >
                    {recommendation.provenance.rain.label}
                  </button>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-[34px] font-extrabold text-[#93c5fd] leading-none">
                    {agronomic.rain24h.toFixed(1)}
                  </p>
                  <span className="text-[14px] font-medium text-[#86a894]">mm</span>
                </div>
                <p className="text-[11px] text-[#86a894] mt-2">
                  Radar probability: {weather3Day[0]?.pop || 90}% · Covers modeled demand
                </p>
              </div>
            </div>

            {/* Scientific Rationale Summary Box */}
            <div className="bg-[#152319] p-4 rounded-xl border border-[#284936] text-[13px] text-[#c1ecd4] leading-relaxed mt-3">
              <strong className="text-white font-semibold">Agronomic Logic:</strong> {recommendation.reason}
            </div>
          </div>

          {/* Card Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-6 border-t border-[#233b2c] pt-5">
            <button
              onClick={handleAcknowledge}
              className="bg-[#e6a833] hover:bg-[#d49624] text-[#101b13] px-6 py-2.5 rounded-xl text-[13px] font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              <span>Acknowledge Decision</span>
            </button>

            <button
              onClick={() => onNavigateToTab('economics')}
              className="bg-[#1e3a29] hover:bg-[#284f37] text-white border border-[#3b7352] px-5 py-2.5 rounded-xl text-[13px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px] text-[#e6a833]">savings</span>
              <span>View ROI & Carbon Savings</span>
            </button>

            <button
              onClick={onOpenAiExplainer}
              className="ml-auto text-[#a5d0b9] hover:text-white text-[12px] font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px] text-[#e6a833]">psychology</span>
              <span>Why this recommendation?</span>
            </button>
          </div>
        </div>

        {/* 3-Day Radar Weather (Spans 4 cols on desktop) */}
        <div className="col-span-1 md:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-[#cbd5e1] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[17px] font-extrabold text-[#0f172a] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1e3a29] text-[22px]">cloud_sync</span>
                <span>3-Day Atmosphere</span>
              </h3>
              <button
                onClick={() => onNavigateToTab('weather')}
                className="text-[#1e3a29] text-[12px] font-bold hover:underline cursor-pointer"
              >
                7-Day Forecast →
              </button>
            </div>

            <div className="flex flex-col divide-y divide-[#f1f5f9]">
              {weather3Day.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between py-3">
                  <div className="flex flex-col">
                    <span className={`text-[14px] ${idx === 0 ? 'font-bold text-[#0f172a]' : 'text-[#475569]'}`}>
                      {day.dayLabel}
                    </span>
                    <span className="text-[11px] text-[#94a3b8]">{day.condition}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0284c7]">
                    <span className="material-symbols-outlined text-[18px]">
                      {day.icon}
                    </span>
                    <span>{day.rainMm} mm ({day.pop}%)</span>
                  </div>

                  <div className="text-[13px] text-[#475569] font-medium text-right">
                    <span className="text-[#0f172a] font-bold">{day.tempMax}°</span> / {day.tempMin}°
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e2e8f0] bg-[#f8fafc] p-3 rounded-xl flex items-center justify-between text-[12px]">
            <span className="text-[#64748b]">Reference ET₀ Today:</span>
            <span className="font-bold text-[#1e3a29] font-mono">{agronomic.referenceEt0} mm/day</span>
          </div>
        </div>

        {/* Crop Vigor (NDVI) Widget (Spans 6 cols on desktop) */}
        <div className="col-span-1 md:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-[#cbd5e1] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1e3a29] text-[22px]">satellite_alt</span>
                <h3 className="text-[17px] font-extrabold text-[#0f172a]">Sentinel-2 Crop Vigor (NDVI)</h3>
              </div>
              <button
                onClick={() => onOpenProvenanceModal(recommendation.provenance.satellite)}
                className="text-[10px] bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-full font-bold cursor-pointer"
              >
                {recommendation.provenance.satellite.label}
              </button>
            </div>
            <p className="text-[12px] text-[#64748b]">Observed canopy reflectance vs. modeled stage baseline</p>

            {/* Custom Bar Visualization */}
            <div className="flex items-end justify-between gap-3 h-36 mt-4 mb-2 relative px-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="border-t border-[#475569] w-full"></div>
                <div className="border-t border-[#475569] w-full"></div>
                <div className="border-t border-[#475569] w-full"></div>
              </div>

              {ndviBars.map((bar, i) => {
                const isHovered = hoveredBarIndex === i;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredBarIndex(i)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="w-full flex flex-col items-center justify-end h-full relative cursor-pointer group"
                  >
                    <div
                      className={`absolute -top-8 bg-[#0f172a] text-white text-[10px] font-semibold py-1 px-2 rounded-md whitespace-nowrap shadow-md transition-opacity z-20 pointer-events-none ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {bar.label}: {bar.value.toFixed(2)}
                    </div>
                    {bar.isLatest && (
                      <div className="absolute -top-2 w-2 h-2 bg-[#e6a833] rounded-full border-2 border-white shadow-xs z-10"></div>
                    )}
                    <div
                      style={{ height: bar.height }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        bar.isLatest
                          ? 'bg-[#1e3a29] shadow-sm'
                          : 'bg-[#94a3b8] hover:bg-[#64748b]'
                      }`}
                    ></div>
                    <span className="text-[10px] font-medium text-[#64748b] mt-1.5">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#e2e8f0]">
            <div>
              <p className="text-[11px] text-[#64748b] font-bold uppercase">Latest Observed NDVI</p>
              <p className="text-[26px] font-extrabold text-[#1e3a29] leading-tight">
                {ndviReadings[0]?.observed?.toFixed(2) || '0.80'}
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('crop-health')}
              className="text-[#1e3a29] font-bold text-[13px] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Curve</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Soil Moisture Buffer & Profile (Spans 6 cols on desktop) */}
        <div className="col-span-1 md:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-[#cbd5e1] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0284c7] text-[22px]">waves</span>
                <h3 className="text-[17px] font-extrabold text-[#0f172a]">Profile Soil Water Buffer</h3>
              </div>
              <button
                onClick={() => onOpenProvenanceModal(recommendation.provenance.soil)}
                className="text-[10px] bg-stone-100 text-stone-800 border border-stone-300 px-2 py-0.5 rounded-full font-bold cursor-pointer"
              >
                {recommendation.provenance.soil.label}
              </button>
            </div>
            <p className="text-[12px] text-[#64748b]">Dynamic root zone moisture buffer (S(t) = S(t-1) + R + I - ETc)</p>

            {/* Circular / Horizontal Gauge */}
            <div className="my-5 bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-bold text-[#1e293b]">Field Capacity Storage</span>
                <span className="text-[20px] font-extrabold text-[#1e3a29]">
                  {agronomic.soilMoisturePercent}%
                </span>
              </div>
              <div className="relative w-full h-4 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  style={{ width: `${agronomic.soilMoisturePercent}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    agronomic.soilMoisturePercent < 35
                      ? 'bg-red-500'
                      : agronomic.soilMoisturePercent > 80
                      ? 'bg-cyan-600'
                      : 'bg-[#1e3a29]'
                  }`}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-[#64748b] font-semibold mt-1">
                <span>0% (Wilting)</span>
                <span>Optimal (45-75%)</span>
                <span>100% (Saturated)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#e2e8f0] text-[12px]">
            <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e2e8f0]">
              <span className="text-[#64748b] block font-medium">Root Zone Depletion:</span>
              <span className="text-[15px] font-bold text-[#0f172a] font-mono">{agronomic.rootZoneDepletion} mm</span>
            </div>
            <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e2e8f0]">
              <span className="text-[#64748b] block font-medium">Available Water:</span>
              <span className="text-[15px] font-bold text-[#0f172a] font-mono">{agronomic.availableWater} mm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
