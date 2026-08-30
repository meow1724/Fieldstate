import React, { useState } from 'react';
import { FarmProfile, AgronomicState } from '../../types';
import { simulateIrrigationScenario, calculateWaterVolumeLitres } from '../../lib/agronomy';

interface WaterManagementDetailProps {
  farm: FarmProfile;
  agronomic: AgronomicState;
  onApplyIrrigation: (appliedMm: number) => void;
  onNavigateToTab: (tab: string) => void;
}

export const WaterManagementDetail: React.FC<WaterManagementDetailProps> = ({
  farm,
  agronomic,
  onApplyIrrigation,
  onNavigateToTab,
}) => {
  const [plannedMm, setPlannedMm] = useState<number>(0);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  // Run simulation calculation
  const sim = simulateIrrigationScenario(agronomic, plannedMm);
  const simulatedLitres = calculateWaterVolumeLitres(plannedMm, farm.areaHectares);

  const handleApply = () => {
    onApplyIrrigation(plannedMm);
    setAppliedFeedback(`Successfully scheduled ${plannedMm.toFixed(1)} mm (${simulatedLitres.toLocaleString()} Litres) application.`);
    setTimeout(() => setAppliedFeedback(null), 4000);
  };

  return (
    <div className="flex-1 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[36px] md:text-[48px] font-bold text-[#191c1c] tracking-tight leading-tight">
            Water Management Details
          </h2>
          <p className="text-[18px] text-[#414844] mt-1">
            {farm.name} • Day {agronomic.cropAgeDays} ({agronomic.growthStageName})
          </p>
        </div>
      </div>

      {appliedFeedback && (
        <div className="mb-6 p-4 bg-[#c1ecd4] text-[#002114] rounded-xl flex items-center justify-between border border-[#a5d0b9] shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">water_drop</span>
            <div>
              <p className="text-[14px] font-bold">Irrigation Plan Recorded</p>
              <p className="text-[12px]">{appliedFeedback}</p>
            </div>
          </div>
          <button onClick={() => setAppliedFeedback(null)} className="text-[12px] font-bold uppercase underline">
            Close
          </button>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Evapotranspiration Model (Spans full 12 cols) */}
        <div className="lg:col-span-12 bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h3 className="text-[20px] font-bold text-[#191c1c]">Evapotranspiration Model</h3>
              <p className="text-[13px] text-[#414844] mt-0.5">Real-time deterministic calculation for crop water demand.</p>
            </div>
            <div className="flex items-center gap-2 bg-[#c1ecd4] text-[#002114] px-3 py-1 rounded-full text-[12px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#012d1d] animate-pulse"></span>
              <span>Model Active (Penman-Monteith FAO-56)</span>
            </div>
          </div>

          {/* Formula Visual Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-[#f9f9f8] p-6 rounded-xl border border-[#c1c8c2]/30">
            {/* Box 1: Reference ET */}
            <div className="bg-white p-5 rounded-lg border border-[#c1c8c2]/40 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#414844] mb-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider">Reference ET (ET₀)</span>
                <span className="material-symbols-outlined text-[20px] text-[#0b4345]">sunny</span>
              </div>
              <div>
                <p className="text-[28px] font-bold text-[#191c1c] leading-tight">
                  {agronomic.referenceEt0.toFixed(1)} <span className="text-[14px] font-normal text-[#414844]">mm/d</span>
                </p>
                <p className="text-[11px] text-[#717973] mt-1">Penman-Monteith equation</p>
              </div>
            </div>

            {/* Operator Multiply */}
            <div className="hidden md:flex justify-center items-center text-[#717973] text-[28px] font-bold">
              ×
            </div>

            {/* Box 2: Crop Coefficient */}
            <div className="bg-white p-5 rounded-lg border border-[#c1c8c2]/40 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#414844] mb-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider">Crop Coeff. (Kc)</span>
                <span className="material-symbols-outlined text-[20px] text-[#012d1d]">grass</span>
              </div>
              <div>
                <p className="text-[28px] font-bold text-[#191c1c] leading-tight">
                  {agronomic.cropCoefficientKc.toFixed(2)}
                </p>
                <p className="text-[11px] text-[#717973] mt-1">{agronomic.growthStageName}</p>
              </div>
            </div>

            {/* Operator Equals */}
            <div className="hidden md:flex justify-center items-center text-[#717973] text-[28px] font-bold">
              =
            </div>

            {/* Box 3: Crop ETc Total Demand */}
            <div className="bg-[#1b4332] text-white p-5 rounded-lg shadow-sm flex flex-col justify-between border-2 border-[#012d1d]">
              <div className="flex items-center justify-between text-[#86af99] mb-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider">Crop ET (ETc)</span>
                <span className="material-symbols-outlined text-[20px] text-[#c1ecd4]">water_drop</span>
              </div>
              <div>
                <p className="text-[28px] font-bold text-white leading-tight">
                  {agronomic.cropEtDemand.toFixed(2)} <span className="text-[14px] font-normal text-[#86af99]">mm/d</span>
                </p>
                <p className="text-[11px] text-[#c1ecd4] mt-1">Total Daily Demand</p>
              </div>
            </div>
          </div>
        </div>

        {/* Water Balance Equation (Spans 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-[#191c1c]">Water Balance</h3>
              <span className="text-[11px] font-medium bg-[#edeeed] text-[#414844] px-2.5 py-1 rounded-md">
                24h Window
              </span>
            </div>
            <p className="text-[12px] text-[#717973] font-mono mb-4 bg-[#f9f9f8] p-2.5 rounded-lg border border-[#c1c8c2]/30">
              ΔS = R + I - ETc - RO - DP
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center py-2 border-b border-[#c1c8c2]/20 text-[14px]">
                <span className="text-[#414844] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#0b4345]">rainy</span>
                  <span>Rain (R)</span>
                </span>
                <span className="font-semibold text-[#191c1c]">+{agronomic.rain24h.toFixed(1)} mm</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#c1c8c2]/20 text-[14px]">
                <span className="text-[#414844] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#012d1d]">shower</span>
                  <span>Irrigation (I)</span>
                </span>
                <span className="font-semibold text-[#191c1c]">+{agronomic.irrigationAppliedToday.toFixed(1)} mm</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#c1c8c2]/20 text-[14px]">
                <span className="text-[#414844] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#a03f2e]">trending_up</span>
                  <span>Demand (ETc)</span>
                </span>
                <span className="font-semibold text-[#a03f2e]">-{agronomic.cropEtDemand.toFixed(2)} mm</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#c1c8c2]/30 flex justify-between items-center bg-[#f3f4f3] p-3.5 rounded-xl">
            <span className="text-[14px] font-bold text-[#191c1c]">Net Water Change (ΔS)</span>
            <span className={`text-[18px] font-bold ${agronomic.netWaterChange >= 0 ? 'text-[#012d1d]' : 'text-[#a03f2e]'}`}>
              {agronomic.netWaterChange > 0 ? `+${agronomic.netWaterChange.toFixed(1)}` : agronomic.netWaterChange.toFixed(1)} mm
            </span>
          </div>
        </div>

        {/* What-If Simulator (Spans 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
              <div>
                <h3 className="text-[20px] font-bold text-[#191c1c]">Scenario Simulator</h3>
                <p className="text-[13px] text-[#414844] mt-0.5">Simulate soil moisture response to planned irrigation.</p>
              </div>
              <span className="text-[12px] font-semibold bg-[#e1e3e2] text-[#191c1c] px-3 py-1 rounded-full">
                Interactive Model
              </span>
            </div>

            {/* Slider Control */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[14px] font-semibold text-[#191c1c]">
                  Planned Irrigation Event (mm depth)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[20px] font-bold text-[#012d1d]">{plannedMm.toFixed(1)} mm</span>
                  <span className="text-[12px] text-[#414844]">({simulatedLitres.toLocaleString()} Litres)</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={plannedMm}
                onChange={(e) => setPlannedMm(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#c1c8c2] rounded-lg appearance-none cursor-pointer accent-[#1b4332]"
              />
              <div className="flex justify-between text-[11px] text-[#717973] mt-1.5 font-medium">
                <span>0 mm (Skip)</span>
                <span>6 mm (Deficit)</span>
                <span>12 mm (Moderate)</span>
                <span>18 mm (Heavy)</span>
                <span>25 mm (Full Soak)</span>
              </div>
            </div>

            {/* Projected Moisture Level Bar */}
            <div className="mb-6 bg-[#f9f9f8] p-4 rounded-xl border border-[#c1c8c2]/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-semibold text-[#191c1c]">
                  Projected Soil Moisture Buffer:
                </span>
                <span className="text-[16px] font-bold text-[#191c1c]">
                  {sim.newMoisturePercent}% <span className="text-[12px] font-normal text-[#414844]">of Field Capacity</span>
                </span>
              </div>

              {/* Multi-zone Progress Bar */}
              <div className="relative w-full h-6 bg-[#e1e3e2] rounded-full overflow-hidden flex shadow-inner">
                {/* Wilting zone marker */}
                <div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-red-400 z-10" title="Wilting Point (30%)"></div>
                {/* Field capacity marker */}
                <div className="absolute left-[80%] top-0 bottom-0 w-0.5 bg-blue-400 z-10" title="Field Capacity (80%)"></div>

                {/* Progress Fill */}
                <div
                  style={{ width: `${sim.newMoisturePercent}%` }}
                  className={`h-full transition-all duration-300 rounded-full ${
                    sim.newMoisturePercent < 35
                      ? 'bg-[#fe8770]'
                      : sim.newMoisturePercent > 85
                      ? 'bg-[#7eafb1]'
                      : 'bg-[#1b4332]'
                  }`}
                ></div>
              </div>

              {/* Threshold Labels */}
              <div className="relative w-full text-[10px] text-[#717973] font-medium mt-1.5 flex justify-between">
                <span>0% (Dry)</span>
                <span className="text-red-700 font-semibold">Wilting Point (30%)</span>
                <span className="text-green-800 font-semibold">Optimal Range (45-80%)</span>
                <span className="text-blue-800 font-semibold">Field Capacity (80%)</span>
              </div>
            </div>

            {/* Dynamic Insight Feedback */}
            <div className="flex items-start gap-3 bg-[#f3f4f3] p-3.5 rounded-lg border border-[#c1c8c2]/30">
              <span className={`material-symbols-outlined text-[20px] ${sim.insightColor} mt-0.5`}>
                {sim.insightIcon}
              </span>
              <p className="text-[13px] text-[#414844] leading-relaxed">
                {sim.insightText}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#c1c8c2]/30 flex justify-end gap-3">
            <button
              onClick={() => setPlannedMm(0)}
              className="px-4 py-2 text-[13px] font-medium text-[#414844] hover:bg-[#f3f4f3] rounded-lg transition-colors cursor-pointer"
            >
              Reset to 0 mm
            </button>
            <button
              onClick={handleApply}
              className="bg-[#012d1d] hover:bg-[#1b4332] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Apply Irrigation Plan ({plannedMm.toFixed(1)} mm)
            </button>
          </div>
        </div>

        {/* Weather Context Alert (Spans full 12 cols) */}
        <div className="lg:col-span-12 bg-[#b9ecee]/30 border border-[#7eafb1]/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#0b4345] text-[24px]">air</span>
            <div>
              <h4 className="text-[14px] font-bold text-[#002c2d]">Weather & Wind Context</h4>
              <p className="text-[13px] text-[#1a4e50] mt-0.5">
                High winds (15-24 km/h NW) anticipated tomorrow afternoon may increase crop evapotranspiration (ETc) by up to 12%. Consider early morning application to minimize drift loss.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('weather')}
            className="text-[#0b4345] hover:text-[#002c2d] text-[13px] font-bold whitespace-nowrap hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Wind Forecast</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
