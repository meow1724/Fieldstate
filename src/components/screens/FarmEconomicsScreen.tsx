import React, { useState } from 'react';
import { FarmProfile, AgronomicState, Recommendation } from '../../types';
import { calculatePumpingEnergyAndCost, calculateWaterVolumeLitres } from '../../lib/agronomy';

interface FarmEconomicsScreenProps {
  farm: FarmProfile;
  agronomic: AgronomicState;
  recommendation: Recommendation;
  onNavigateToTab: (tab: string) => void;
}

export const FarmEconomicsScreen: React.FC<FarmEconomicsScreenProps> = ({
  farm,
  agronomic,
  recommendation,
  onNavigateToTab,
}) => {
  const [headMeters, setHeadMeters] = useState(farm.pumpingHeadMeters || 30);
  const [pumpType, setPumpType] = useState<'diesel' | 'electric_grid' | 'solar'>(farm.pumpType || 'electric_grid');
  const [tariffRate, setTariffRate] = useState(farm.energyTariffPerKwh || 0.16);

  // Cumulative season projections (assuming 40 irrigation events / season)
  const daysInSeason = 90;
  const skippedEventsSeason = 14; // ~14 rainy or optimal days where Fieldstate avoided pumping
  const avgDemandPerEventMm = agronomic.cropEtDemand || 5.2;
  const waterSavedSeasonLitres = calculateWaterVolumeLitres(avgDemandPerEventMm * skippedEventsSeason, farm.areaHectares);
  const waterSavedSeasonM3 = waterSavedSeasonLitres / 1000;

  // Real-time calculation based on sliders
  const todaySavedM3 = (agronomic.potentialWaterSavedLitres || calculateWaterVolumeLitres(agronomic.cropEtDemand, farm.areaHectares)) / 1000;
  const todayEnergy = calculatePumpingEnergyAndCost(todaySavedM3, headMeters, pumpType, tariffRate);
  const seasonEnergy = calculatePumpingEnergyAndCost(waterSavedSeasonM3, headMeters, pumpType, tariffRate);

  return (
    <div className="flex-1 max-w-[1380px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#1e3a29] text-[#e6a833] text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-[#2d523b]">
              Precision Resource Economics
            </span>
            <span className="text-[12px] text-[#64748b]">
              Direct financial savings & GHG reduction from precision timing
            </span>
          </div>
          <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#0f172a] tracking-tight leading-tight">
            Farm Economics & Carbon Footprint
          </h2>
          <p className="text-[15px] text-[#475569] mt-0.5">
            Translating every skipped pump run and precise deficit replenishment into dollars, kilowatt-hours, and metric tons of avoided carbon.
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

      {/* Global Context Banner (Matches Slide 2 & 16 of Hackathon Presentation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#101b13] text-white p-5 rounded-2xl border border-[#2d4436] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#234e35] flex items-center justify-center text-[#e6a833] shrink-0">
            <span className="material-symbols-outlined text-[28px]">water_drop</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#86a894] uppercase tracking-wider">Global Freshwater</p>
            <p className="text-[26px] font-extrabold text-white leading-tight">~72%</p>
            <p className="text-[11px] text-[#86a894]">Consumed globally by agricultural irrigation (FAO)</p>
          </div>
        </div>

        <div className="bg-[#101b13] text-white p-5 rounded-2xl border border-[#2d4436] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#234e35] flex items-center justify-center text-[#e6a833] shrink-0">
            <span className="material-symbols-outlined text-[28px]">co2</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#86a894] uppercase tracking-wider">Agrifood Emissions</p>
            <p className="text-[26px] font-extrabold text-white leading-tight">~32%</p>
            <p className="text-[11px] text-[#86a894]">Of global GHG emissions stem from agrifood pumping & inputs</p>
          </div>
        </div>

        <div className="bg-[#101b13] text-white p-5 rounded-2xl border border-[#2d4436] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#234e35] flex items-center justify-center text-[#e6a833] shrink-0">
            <span className="material-symbols-outlined text-[28px]">speed</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#86a894] uppercase tracking-wider">Irrigation Efficiency</p>
            <p className="text-[26px] font-extrabold text-[#e6a833] leading-tight">~56%</p>
            <p className="text-[11px] text-[#86a894]">Estimated global average; nearly 44% lost to over-watering</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Cumulative Season Savings Ledger (Spans 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#cbd5e1] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[20px] font-extrabold text-[#0f172a]">Estimated Full-Season Savings Ledger</h3>
                <p className="text-[13px] text-[#64748b] mt-0.5">
                  Modeled across {farm.areaHectares} ha of {farm.cropDisplayName} ({farm.name})
                </p>
              </div>
              <span className="bg-[#d1fae5] text-[#065f46] text-[11px] font-bold px-3 py-1 rounded-full border border-[#a7f3d0]">
                Season Forecast
              </span>
            </div>

            {/* Big Stat Hero Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
              <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Water Conserved</span>
                <p className="text-[24px] font-extrabold text-[#0284c7] mt-1">
                  {waterSavedSeasonM3.toLocaleString()} <span className="text-[13px] font-semibold text-[#64748b]">m³</span>
                </p>
                <p className="text-[11px] text-[#64748b] mt-1">({waterSavedSeasonLitres.toLocaleString()} Litres)</p>
              </div>

              <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Energy & Fuel Saved</span>
                <p className="text-[24px] font-extrabold text-[#1e3a29] mt-1">
                  {seasonEnergy.energyKwh.toLocaleString()} <span className="text-[13px] font-semibold text-[#64748b]">kWh</span>
                </p>
                <p className="text-[11px] text-[#64748b] mt-1">Hydraulic lift work avoided</p>
              </div>

              <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
                <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Net Cash Savings</span>
                <p className="text-[24px] font-extrabold text-[#e6a833] mt-1">
                  ${seasonEnergy.costDollars.toLocaleString()}
                </p>
                <p className="text-[11px] text-[#64748b] mt-1">${(seasonEnergy.costDollars / farm.areaHectares).toFixed(0)} / hectare</p>
              </div>
            </div>

            {/* Environmental CO2 Offset */}
            <div className="bg-[#ecfdf5] p-4.5 rounded-2xl border border-[#a7f3d0] flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">forest</span>
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#065f46]">GHG Carbon Emissions Avoided</h4>
                  <p className="text-[12px] text-[#047857]">
                    Equivalent to avoiding burning ~{(seasonEnergy.co2eKg / 2.68).toFixed(0)} Litres of diesel fuel
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[22px] font-extrabold text-[#065f46]">{seasonEnergy.co2eKg} kg</span>
                <span className="text-[11px] block font-semibold text-[#047857]">CO₂e Offsets</span>
              </div>
            </div>
          </div>

          {/* Today's Single Action ROI */}
          <div className="mt-6 pt-4 border-t border-[#e2e8f0]">
            <h4 className="text-[14px] font-bold text-[#0f172a] mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#1e3a29]">today</span>
              <span>Today's Decision Impact ({recommendation.action})</span>
            </h4>
            <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 text-[13px]">
              <div>
                <span className="text-[#64748b]">Decision:</span>{' '}
                <strong className="text-[#0f172a]">{recommendation.title}</strong>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[#0284c7] font-bold font-mono">
                  +{todaySavedM3.toFixed(0)} m³ Water
                </span>
                <span className="text-[#16a34a] font-bold font-mono">
                  +${todayEnergy.costDollars.toFixed(2)} Saved
                </span>
                <span className="text-[#059669] font-bold font-mono">
                  +{todayEnergy.co2eKg} kg CO₂
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Pump & Tariff Physics Model (Spans 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#cbd5e1] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#1e3a29] text-[24px]">tune</span>
              <div>
                <h3 className="text-[18px] font-extrabold text-[#0f172a]">Pumping Physics Parameters</h3>
                <p className="text-[12px] text-[#64748b]">Adjust water lift depth and power tariffs</p>
              </div>
            </div>

            {/* Pump Power Source */}
            <div className="mb-5">
              <label className="block text-[12px] font-bold text-[#334155] uppercase tracking-wider mb-2">
                Irrigation Pump Power Source
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'diesel', label: 'Diesel Gen', icon: 'local_gas_station' },
                  { id: 'electric_grid', label: 'Electric Grid', icon: 'bolt' },
                  { id: 'solar', label: 'Solar PV', icon: 'solar_power' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPumpType(item.id as any)}
                    className={`py-2 px-2 rounded-xl text-[12px] font-bold border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      pumpType === item.id
                        ? 'bg-[#1e3a29] text-white border-[#1e3a29] shadow-xs'
                        : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pumping Head (Meters Lift) */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[12px] font-bold text-[#334155] uppercase tracking-wider">
                  Groundwater Well Lift / Pressure Head
                </label>
                <span className="text-[13px] font-extrabold text-[#1e3a29] font-mono">{headMeters} meters</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={headMeters}
                onChange={(e) => setHeadMeters(parseInt(e.target.value))}
                className="w-full accent-[#1e3a29] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748b] mt-1 font-semibold">
                <span>5m (Surface Canal)</span>
                <span>35m (Typical Well)</span>
                <span>100m (Deep Aquifer)</span>
              </div>
            </div>

            {/* Tariff Cost */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[12px] font-bold text-[#334155] uppercase tracking-wider">
                  {pumpType === 'diesel' ? 'Diesel Fuel Price ($ / Litre)' : 'Electricity Rate ($ / kWh)'}
                </label>
                <span className="text-[13px] font-extrabold text-[#1e3a29] font-mono">${tariffRate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.01"
                value={tariffRate}
                onChange={(e) => setTariffRate(parseFloat(e.target.value))}
                className="w-full accent-[#1e3a29] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748b] mt-1 font-semibold">
                <span>$0.05 (Subsidized)</span>
                <span>$0.16 (US Avg)</span>
                <span>$0.50 (Peak Peak)</span>
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="bg-[#f1f5f9] p-3.5 rounded-xl border border-[#e2e8f0] text-[11px] text-[#475569] font-mono leading-relaxed">
              <strong>Hydraulic Work Formula:</strong><br />
              $$E_{'{kWh}'} = \frac{'{Volume(m^3) \\times 9.81 \\times Head(m)}'}{'{3600 \\times 0.65}'}$$
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex justify-between items-center text-[12px]">
            <span className="text-[#64748b]">Modeled Pump Efficiency:</span>
            <span className="font-bold text-[#0f172a]">65% Mechanical</span>
          </div>
        </div>
      </div>
    </div>
  );
};
