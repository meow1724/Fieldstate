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

  const sim = simulateIrrigationScenario(agronomic, plannedMm);
  const simulatedLitres = calculateWaterVolumeLitres(plannedMm, farm.areaHectares);

  const handleApply = () => {
    onApplyIrrigation(plannedMm);
    setAppliedFeedback(`Successfully scheduled ${plannedMm.toFixed(1)} mm (${simulatedLitres.toLocaleString()} Litres) application.`);
    setTimeout(() => setAppliedFeedback(null), 5000);
  };

  return (
    <div className="flex-1 max-w-[1380px] mx-auto w-full">
      {/* Page Header (Matching Slide 5 & 6 of Fieldstate Presentation) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#1e3a29] text-[#e6a833] text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Engine 1 — Water Demand & Balance
            </span>
            <span className="text-[12px] text-[#64748b]">FAO Irrigation and Drainage Paper 56</span>
          </div>
          <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#0f172a] tracking-tight leading-tight">
            Evapotranspiration & Water Balance
          </h2>
          <p className="text-[15px] text-[#475569] mt-0.5">
            {farm.name} · Day {agronomic.cropAgeDays} ({agronomic.growthStageName})
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('today')}
          className="self-start md:self-auto bg-[#1e3a29] hover:bg-[#14281c] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Operations</span>
        </button>
      </div>

      {appliedFeedback && (
        <div className="mb-6 p-4 bg-[#ecfdf5] text-[#065f46] rounded-2xl flex items-center justify-between border border-[#a7f3d0] shadow-sm animate-in fade-in">
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
        {/* Evapotranspiration Formula Breakdown (Spans 12 cols - Slide 5) */}
        <div className="lg:col-span-12 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#cbd5e1]">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
              <h3 className="text-[19px] font-extrabold text-[#0f172a]">FAO-56 Penman-Monteith Model</h3>
              <p className="text-[13px] text-[#64748b]">Atmospheric evaporative demand × agronomic crop coefficient</p>
            </div>
            <div className="flex items-center gap-2 bg-[#d1fae5] text-[#065f46] px-3 py-1 rounded-full text-[12px] font-bold border border-[#a7f3d0]">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
              <span>Model Active (ETc = Kc × ET₀)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-[#f8fafc] p-6 rounded-2xl border border-[#e2e8f0]">
            {/* Box 1: Reference ET0 */}
            <div className="bg-white p-5 rounded-xl border border-[#cbd5e1] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#64748b] mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Reference ET₀</span>
                <span className="material-symbols-outlined text-[20px] text-[#0284c7]">sunny</span>
              </div>
              <div>
                <p className="text-[28px] font-extrabold text-[#0f172a] leading-none">
                  {agronomic.referenceEt0.toFixed(1)} <span className="text-[13px] font-normal text-[#64748b]">mm/d</span>
                </p>
                <p className="text-[11px] text-[#64748b] mt-1.5">Penman-Monteith equation</p>
              </div>
            </div>

            {/* Operator Multiply */}
            <div className="hidden md:flex justify-center items-center text-[#94a3b8] text-[24px] font-bold">
              ×
            </div>

            {/* Box 2: Kc */}
            <div className="bg-white p-5 rounded-xl border border-[#cbd5e1] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#64748b] mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Crop Coeff. ($K_c$)</span>
                <span className="material-symbols-outlined text-[20px] text-[#1e3a29]">grass</span>
              </div>
              <div>
                <p className="text-[28px] font-extrabold text-[#0f172a] leading-none">
                  {agronomic.cropCoefficientKc.toFixed(2)}
                </p>
                <p className="text-[11px] text-[#64748b] mt-1.5">{agronomic.growthStageName}</p>
              </div>
            </div>

            {/* Operator Equals */}
            <div className="hidden md:flex justify-center items-center text-[#94a3b8] text-[24px] font-bold">
              =
            </div>

            {/* Box 3: Crop ETc */}
            <div className="bg-[#101b13] text-white p-5 rounded-xl border border-[#2d4436] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#86a894] mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Crop Water Use ($ET_c$)</span>
                <span className="material-symbols-outlined text-[20px] text-[#e6a833]">water_drop</span>
              </div>
              <div>
                <p className="text-[28px] font-extrabold text-white leading-none">
                  {agronomic.cropEtDemand.toFixed(2)} <span className="text-[13px] font-normal text-[#86a894]">mm/d</span>
                </p>
                <p className="text-[11px] text-[#c1ecd4] mt-1.5">Daily Transpiration Loss</p>
              </div>
            </div>
          </div>
        </div>

        {/* Water Balance Equation Card (Spans 4 cols - Slide 6) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-[#cbd5e1] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[17px] font-extrabold text-[#0f172a]">Water Balance Model</h3>
              <span className="text-[11px] font-bold bg-[#f1f5f9] text-[#64748b] px-2 py-0.5 rounded-md">
                24h Window
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] font-mono mb-4 bg-[#f8fafc] p-2 rounded-lg border border-[#e2e8f0]">
              {'S(t) = S(t-1) + R + I - ETc - RO - DP'}
            </p>

            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between items-center py-2 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-[#0284c7]">rainy</span>
                  <span>Effective Rain ($R$)</span>
                </span>
                <span className="font-bold text-[#0f172a]">+{agronomic.effectiveRain.toFixed(1)} mm</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-[#1e3a29]">shower</span>
                  <span>Applied Irrigation ($I$)</span>
                </span>
                <span className="font-bold text-[#0f172a]">+{agronomic.irrigationAppliedToday.toFixed(1)} mm</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-[#f1f5f9]">
                <span className="text-[#64748b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-red-600">trending_up</span>
                  <span>Crop Evapotranspiration ($ET_c$)</span>
                </span>
                <span className="font-bold text-red-600">-{agronomic.cropEtDemand.toFixed(2)} mm</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex justify-between items-center bg-[#f8fafc] p-3 rounded-xl">
            <span className="text-[13px] font-bold text-[#0f172a]">Net Profile Delta ($\Delta S$)</span>
            <span className={`text-[17px] font-extrabold font-mono ${agronomic.netWaterChange >= 0 ? 'text-[#059669]' : 'text-red-600'}`}>
              {agronomic.netWaterChange > 0 ? `+${agronomic.netWaterChange.toFixed(1)}` : agronomic.netWaterChange.toFixed(1)} mm
            </span>
          </div>
        </div>

        {/* What-If Simulator (Spans 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#cbd5e1] flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <div>
                <h3 className="text-[19px] font-extrabold text-[#0f172a]">What-If Irrigation Simulator</h3>
                <p className="text-[13px] text-[#64748b]">Simulate soil response to planned irrigation depth.</p>
              </div>
              <span className="text-[11px] font-bold bg-[#f1f5f9] text-[#1e293b] px-2.5 py-1 rounded-full border border-[#cbd5e1]">
                Interactive Sandbox
              </span>
            </div>

            {/* Slider */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[13px] font-bold text-[#0f172a]">
                  Planned Irrigation Event (mm depth)
                </label>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[18px] font-extrabold text-[#1e3a29]">{plannedMm.toFixed(1)} mm</span>
                  <span className="text-[12px] text-[#64748b]">({simulatedLitres.toLocaleString()} L)</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={plannedMm}
                onChange={(e) => setPlannedMm(parseFloat(e.target.value))}
                className="w-full accent-[#1e3a29] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#64748b] mt-1 font-medium">
                <span>0 mm (Skip)</span>
                <span>6 mm (Deficit)</span>
                <span>12 mm (Moderate)</span>
                <span>18 mm (Heavy)</span>
                <span>25 mm (Full Soak)</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4 bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
              <div className="flex justify-between items-center mb-1.5 text-[13px]">
                <span className="font-bold text-[#0f172a]">Projected Profile Storage:</span>
                <span className="font-extrabold text-[#1e3a29]">{sim.newMoisturePercent}% Field Capacity</span>
              </div>
              <div className="relative w-full h-5 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  style={{ width: `${sim.newMoisturePercent}%` }}
                  className={`h-full transition-all duration-300 rounded-full ${
                    sim.newMoisturePercent < 35
                      ? 'bg-red-500'
                      : sim.newMoisturePercent > 80
                      ? 'bg-cyan-600'
                      : 'bg-[#1e3a29]'
                  }`}
                ></div>
              </div>
            </div>

            {/* Insight Text */}
            <div className="flex items-start gap-2.5 bg-[#f1f5f9] p-3.5 rounded-xl border border-[#e2e8f0]">
              <span className={`material-symbols-outlined text-[20px] ${sim.insightColor} mt-0.5`}>
                {sim.insightIcon}
              </span>
              <p className="text-[13px] text-[#334155] leading-relaxed">
                {sim.insightText}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex justify-end gap-3">
            <button
              onClick={() => setPlannedMm(0)}
              className="px-4 py-2 text-[12px] font-bold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl cursor-pointer"
            >
              Reset to 0 mm
            </button>
            <button
              onClick={handleApply}
              className="bg-[#1e3a29] hover:bg-[#14281c] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Apply Plan ({plannedMm.toFixed(1)} mm)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
