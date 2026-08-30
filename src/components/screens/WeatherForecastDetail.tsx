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
  const avgEt0 = (weather7Day.reduce((acc, curr) => acc + curr.et0, 0) / weather7Day.length).toFixed(1);

  return (
    <div className="flex-1 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[36px] md:text-[48px] font-bold text-[#191c1c] tracking-tight leading-tight">
            Climate & Weather Forecast
          </h2>
          <p className="text-[18px] text-[#414844] mt-1">
            7-Day Precipitation, Solar Radiation, and Evapotranspiration Projections for {farm.name}
          </p>
        </div>
        <button
          onClick={() => onNavigateToTab('today')}
          className="self-start md:self-auto bg-[#012d1d] hover:bg-[#1b4332] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Operations</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 flex items-center gap-4">
          <div className="p-3.5 bg-[#b9ecee] text-[#002021] rounded-full">
            <span className="material-symbols-outlined icon-fill text-[24px]">rainy</span>
          </div>
          <div>
            <p className="text-[12px] text-[#414844] font-semibold uppercase tracking-wider">7-Day Rain Total</p>
            <p className="text-[28px] font-bold text-[#191c1c] leading-tight">
              {total7DayRain.toFixed(1)} <span className="text-[14px] font-normal text-[#414844]">mm</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 flex items-center gap-4">
          <div className="p-3.5 bg-[#c1ecd4] text-[#002114] rounded-full">
            <span className="material-symbols-outlined icon-fill text-[24px]">sunny</span>
          </div>
          <div>
            <p className="text-[12px] text-[#414844] font-semibold uppercase tracking-wider">Mean Daily ET₀</p>
            <p className="text-[28px] font-bold text-[#191c1c] leading-tight">
              {avgEt0} <span className="text-[14px] font-normal text-[#414844]">mm/day</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 flex items-center gap-4">
          <div className="p-3.5 bg-[#fe8770]/30 text-[#741f11] rounded-full">
            <span className="material-symbols-outlined icon-fill text-[24px]">air</span>
          </div>
          <div>
            <p className="text-[12px] text-[#414844] font-semibold uppercase tracking-wider">Wind Vulnerability</p>
            <p className="text-[24px] font-bold text-[#191c1c] leading-tight">
              Moderate <span className="text-[13px] font-normal text-[#741f11]">(14-24 km/h)</span>
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Detailed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
        {weather7Day.map((day, idx) => {
          const isToday = idx === 0;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                isToday
                  ? 'bg-white border-[#012d1d] shadow-md ring-2 ring-[#012d1d]/10'
                  : 'bg-white border-[#c1c8c2]/30 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:border-[#717973]'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[15px] ${isToday ? 'font-bold text-[#012d1d]' : 'font-semibold text-[#191c1c]'}`}>
                    {day.dayLabel}
                  </span>
                  {isToday && (
                    <span className="text-[10px] uppercase font-bold bg-[#012d1d] text-white px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#717973] mb-3">{day.fullDate}</p>

                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[32px] text-[#0b4345]">
                    {day.icon}
                  </span>
                  <div>
                    <p className="text-[16px] font-bold text-[#191c1c]">
                      {day.tempMax}° / <span className="text-[13px] text-[#717973]">{day.tempMin}°</span>
                    </p>
                    <p className="text-[11px] text-[#414844]">{day.condition}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#c1c8c2]/30 flex flex-col gap-1.5 text-[12px]">
                <div className="flex justify-between text-[#414844]">
                  <span>Rain:</span>
                  <span className="font-bold text-[#191c1c]">{day.rainMm} mm ({day.pop}%)</span>
                </div>
                <div className="flex justify-between text-[#414844]">
                  <span>ET₀:</span>
                  <span className="font-semibold text-[#012d1d]">{day.et0} mm/d</span>
                </div>
                <div className="flex justify-between text-[#414844]">
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
