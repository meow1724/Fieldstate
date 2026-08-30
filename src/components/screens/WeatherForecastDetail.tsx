import React from 'react';
import { FarmProfile, WeatherDay, AgronomicState } from '../../types';

interface WeatherForecastDetailProps {
  farm: FarmProfile;
  agronomic: AgronomicState;
  weather7Day: WeatherDay[];
  onNavigateToTab: (tab: string) => void;
}

export const WeatherForecastDetail: React.FC<WeatherForecastDetailProps> = ({
  farm,
  agronomic,
  weather7Day,
  onNavigateToTab,
}) => {
  const total7DayRain = weather7Day.reduce((acc, curr) => acc + curr.rainMm, 0);
  const avgEt0 = (weather7Day.reduce((acc, curr) => acc + curr.et0, 0) / (weather7Day.length || 1)).toFixed(1);

  return (
    <div className="flex-1 max-w-[1380px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#1e3a29] text-[#e6a833] text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Atmospheric & Radar Telemetry
            </span>
            <span className="text-[12px] text-[#64748b]">Open-Meteo High-Resolution Global Model</span>
          </div>
          <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#0f172a] tracking-tight leading-tight">
            Climate & 7-Day Forecast
          </h2>
          <p className="text-[15px] text-[#475569] mt-0.5">
            Precipitation probability, solar irradiance, and reference evapotranspiration ($ET_0$) for {farm.name}
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-[#cbd5e1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">rainy</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">7-Day Rain Total</p>
            <p className="text-[26px] font-extrabold text-[#0f172a] leading-none mt-1">
              {total7DayRain.toFixed(1)} <span className="text-[14px] font-normal text-[#64748b]">mm</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#cbd5e1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">wb_sunny</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Mean Reference ET₀</p>
            <p className="text-[26px] font-extrabold text-[#1e3a29] leading-none mt-1">
              {avgEt0} <span className="text-[14px] font-normal text-[#64748b]">mm/day</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#cbd5e1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">air</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Wind & Drift Risk</p>
            <p className="text-[22px] font-extrabold text-[#0f172a] leading-none mt-1">
              Low-Moderate <span className="text-[12px] font-medium text-[#64748b]">(10-18 km/h)</span>
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5 mb-6">
        {weather7Day.map((day, idx) => {
          const isToday = idx === 0;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                isToday
                  ? 'bg-[#101b13] text-white border-[#2d4436] shadow-md ring-2 ring-[#e6a833]'
                  : 'bg-white border-[#cbd5e1] shadow-xs hover:border-[#94a3b8]'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[14px] font-bold ${isToday ? 'text-white' : 'text-[#0f172a]'}`}>
                    {day.dayLabel}
                  </span>
                  {isToday && (
                    <span className="text-[9px] uppercase font-extrabold bg-[#e6a833] text-[#101b13] px-1.5 py-0.2 rounded">
                      Today
                    </span>
                  )}
                </div>
                <p className={`text-[11px] mb-3 ${isToday ? 'text-[#86a894]' : 'text-[#94a3b8]'}`}>{day.fullDate}</p>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`material-symbols-outlined text-[28px] ${isToday ? 'text-[#e6a833]' : 'text-[#0284c7]'}`}>
                    {day.icon}
                  </span>
                  <div>
                    <p className={`text-[15px] font-extrabold ${isToday ? 'text-white' : 'text-[#0f172a]'}`}>
                      {day.tempMax}° / <span className={`text-[12px] ${isToday ? 'text-[#86a894]' : 'text-[#94a3b8]'}`}>{day.tempMin}°</span>
                    </p>
                    <p className={`text-[10px] ${isToday ? 'text-[#c1ecd4]' : 'text-[#64748b]'}`}>{day.condition}</p>
                  </div>
                </div>
              </div>

              <div className={`pt-2.5 border-t flex flex-col gap-1 text-[11px] ${
                isToday ? 'border-[#233b2c] text-[#c1ecd4]' : 'border-[#f1f5f9] text-[#64748b]'
              }`}>
                <div className="flex justify-between font-medium">
                  <span>Rain:</span>
                  <span className={`font-bold ${isToday ? 'text-[#93c5fd]' : 'text-[#0f172a]'}`}>
                    {day.rainMm} mm ({day.pop}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ET₀:</span>
                  <span className="font-bold">{day.et0} mm/d</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind:</span>
                  <span>{day.windSpeedKmh} km/h {day.windDirection}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
