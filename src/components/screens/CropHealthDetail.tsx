import React, { useState } from 'react';
import { FarmProfile, AgronomicState, NdviReading, SatelliteImageMeta } from '../../types';
import { InteractiveSatelliteMap } from '../InteractiveSatelliteMap';

interface CropHealthDetailProps {
  farm: FarmProfile;
  agronomic: AgronomicState;
  ndviReadings: NdviReading[];
  satelliteMeta: SatelliteImageMeta;
  onScheduleInspection: () => void;
  onNewSurvey: () => void;
}

export const CropHealthDetail: React.FC<CropHealthDetailProps> = ({
  farm,
  agronomic,
  ndviReadings,
  satelliteMeta,
  onScheduleInspection,
  onNewSurvey,
}) => {
  const [timeRange, setTimeRange] = useState('30');
  const [anomalyDismissed, setAnomalyDismissed] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ obs: number; exp: number; label: string } | null>(null);

  const currentReading = ndviReadings[0] || {
    date: 'Today',
    observed: 0.82,
    expected: 0.80,
    variance: 0.02,
    status: 'Normal' as const,
  };

  const hasAnomaly = ndviReadings.some((r) => r.variance <= -0.08);

  const handleExportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Observed NDVI,Expected NDVI,Variance,Status'].concat(
        ndviReadings.map((r) => `${r.date},${r.observed},${r.expected},${r.variance},${r.status}`)
      ).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${farm.id}-ndvi-readings.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 max-w-[1400px] mx-auto w-full">
      {/* Page Header with Real Address & Synchronized Crop Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-[#c1ecd4] text-[#002114] text-[12px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span>{farm.locationName}</span>
            </span>
            <span className="bg-[#edeeed] text-[#191c1c] text-[12px] font-medium px-2.5 py-0.5 rounded-full">
              {farm.cropDisplayName} • Day {agronomic.cropAgeDays}
            </span>
            <span className="text-[12px] text-[#717973] font-mono">
              {farm.latitude.toFixed(4)}° N, {farm.longitude.toFixed(4)}° W
            </span>
          </div>

          <h2 className="text-[36px] md:text-[48px] font-bold text-[#191c1c] tracking-tight leading-tight">
            {farm.name} Health & NDVI
          </h2>
          <p className="text-[18px] text-[#414844] mt-1">
            Normalized Difference Vegetation Index (NDVI) & Multi-spectral Sentinel-2 Signals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-[#c1c8c2] text-[#191c1c] text-[14px] font-medium py-2 pl-4 pr-9 rounded-lg hover:bg-[#f3f4f3] transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#012d1d]"
            >
              <option value="30">Last 30 Days</option>
              <option value="60">Last 60 Days</option>
              <option value="90">Full Season (90 Days)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#414844] text-[18px]">
              arrow_drop_down
            </span>
          </div>
          <button
            onClick={handleExportData}
            title="Download CSV"
            className="bg-white border border-[#c1c8c2] text-[#191c1c] p-2.5 rounded-lg hover:bg-[#f3f4f3] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Chart Card (Spans 7 cols on large screens) */}
        <div className="xl:col-span-7 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 p-6 md:p-8 flex flex-col min-h-[480px]">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h3 className="text-[20px] font-bold text-[#191c1c]">NDVI Trajectory Curve</h3>
              <p className="text-[13px] text-[#414844] mt-1">Observed values vs. Expected growth model for {farm.cropDisplayName}</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-[13px]">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1b4332] border border-[#012d1d]"></div>
                <span className="text-[#414844] font-medium">Expected ({currentReading.expected.toFixed(2)})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#a03f2e]"></div>
                <span className="text-[#414844] font-medium">Observed ({currentReading.observed.toFixed(2)})</span>
              </div>
            </div>
          </div>

          {/* SVG Chart Area */}
          <div className="flex-1 relative w-full h-[300px] border-b border-l border-[#c1c8c2]/50 pb-8 pl-10 pt-4">
            {/* Y-Axis Labels */}
            <div className="absolute left-0 top-4 bottom-8 w-10 flex flex-col justify-between items-end pr-2 text-[12px] font-medium text-[#717973]">
              <span>1.0</span>
              <span>0.8</span>
              <span>0.6</span>
              <span>0.4</span>
              <span>0.2</span>
              <span>0.0</span>
            </div>

            {/* X-Axis Labels */}
            <div className="absolute bottom-0 left-10 right-0 h-8 flex justify-between items-center text-[12px] font-medium text-[#717973] px-2">
              <span>Day 1</span>
              <span>Day {Math.round(agronomic.cropAgeDays * 0.3)}</span>
              <span>Day {Math.round(agronomic.cropAgeDays * 0.6)}</span>
              <span>Day {Math.round(agronomic.cropAgeDays * 0.85)}</span>
              <span className="font-bold text-[#191c1c]">Today (Day {agronomic.cropAgeDays})</span>
            </div>

            {/* Background Grid Lines */}
            <div className="absolute inset-0 left-10 bottom-8 top-4 flex flex-col justify-between pointer-events-none opacity-15">
              <div className="w-full h-px bg-[#414844]"></div>
              <div className="w-full h-px bg-[#414844]"></div>
              <div className="w-full h-px bg-[#414844]"></div>
              <div className="w-full h-px bg-[#414844]"></div>
              <div className="w-full h-px bg-[#414844]"></div>
            </div>

            {/* Responsive SVG Curves */}
            <svg
              className="absolute inset-0 left-10 bottom-8 top-4 w-[calc(100%-2.5rem)] h-[calc(100%-3rem)] overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              {/* Expected Line */}
              <path
                d="M 5,80 Q 25,65 50,40 T 75,25 T 95,18"
                fill="none"
                stroke="#1b4332"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="opacity-70"
              />

              {/* Anomaly Shade if variance is negative */}
              {currentReading.variance < -0.05 && (
                <path
                  d="M 50,48 Q 65,40 75,32 L 95,38 L 95,18 L 75,25 L 50,40 Z"
                  fill="#a03f2e"
                  className="opacity-20"
                />
              )}

              {/* Observed Line */}
              <path
                d={
                  currentReading.variance < -0.05
                    ? "M 5,82 Q 28,68 50,48 T 75,32 Q 85,34 95,38"
                    : "M 5,80 Q 25,64 50,38 T 75,22 T 95,16"
                }
                fill="none"
                stroke={currentReading.variance < -0.05 ? "#a03f2e" : "#012d1d"}
                strokeWidth="3.5"
                className="drop-shadow-xs"
              />

              {/* Point at Today */}
              <circle
                cx="95"
                cy={currentReading.variance < -0.05 ? "38" : "16"}
                r="4.5"
                className="fill-[#a03f2e] stroke-white stroke-2 hover:scale-150 transition-transform cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    obs: currentReading.observed,
                    exp: currentReading.expected,
                    label: 'Today',
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </svg>

            {/* Tooltip */}
            <div className="absolute right-4 top-[25%] bg-[#2e3131] text-white px-3 py-2 rounded-lg text-[12px] shadow-lg transform -translate-y-full pointer-events-none z-30">
              <div className="font-semibold text-white">Observed: {currentReading.observed.toFixed(2)}</div>
              <div className="text-[#a5d0b9]">Expected: {currentReading.expected.toFixed(2)}</div>
              <div className={`text-[11px] font-bold mt-0.5 ${currentReading.variance < 0 ? 'text-[#ffb4a5]' : 'text-[#c1ecd4]'}`}>
                Variance: {currentReading.variance > 0 ? `+${currentReading.variance.toFixed(2)}` : currentReading.variance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real Live Map & Anomaly Panel (Spans 5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* Anomaly Alert Card */}
          {hasAnomaly && !anomalyDismissed && (
            <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-4 border-l-[#a03f2e] border border-[#c1c8c2]/30 p-6 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-[#a03f2e] opacity-[0.03] pointer-events-none"></div>
              <div className="flex items-start gap-3 mb-2 relative z-10">
                <span className="material-symbols-outlined text-[#a03f2e] text-[28px]">warning</span>
                <div>
                  <h3 className="text-[18px] font-bold text-[#191c1c] leading-tight">Inspection Recommended</h3>
                  <p className="text-[12px] text-[#a03f2e] font-bold uppercase tracking-wider mt-0.5">NDVI Anomaly Detected</p>
                </div>
              </div>
              <p className="text-[14px] text-[#414844] leading-relaxed relative z-10 mb-4 mt-2">
                Observed NDVI is tracking <strong className="text-[#a03f2e]">{currentReading.variance.toFixed(2)}</strong> below the expected canopy baseline for {farm.cropDisplayName} at {farm.locationName}. Ground inspection recommended.
              </p>
              <div className="mt-auto relative z-10 pt-3 border-t border-[#c1c8c2]/30 flex justify-end gap-3">
                <button
                  onClick={() => setAnomalyDismissed(true)}
                  className="border border-[#a03f2e] text-[#a03f2e] text-[13px] font-semibold py-2 px-4 rounded-lg hover:bg-[#ffdad3] transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={onScheduleInspection}
                  className="bg-[#a03f2e] hover:bg-[#802919] text-white text-[13px] font-semibold py-2 px-4 rounded-lg transition-colors shadow-xs cursor-pointer active:scale-98"
                >
                  Schedule Inspection
                </button>
              </div>
            </div>
          )}

          {/* Synchronized Live Satellite View for This Address */}
          <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[16px] font-bold text-[#191c1c] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#012d1d] text-[20px]">satellite_alt</span>
                <span>Live Satellite Layer ({farm.locationName})</span>
              </h3>
              <span className="text-[11px] font-semibold text-[#002114] bg-[#c1ecd4] px-2.5 py-1 rounded-md">
                Live Tiles
              </span>
            </div>

            {/* Interactive Satellite Map component centered on actual coordinates */}
            <div className="w-full rounded-xl overflow-hidden mb-3">
              <InteractiveSatelliteMap
                latitude={farm.latitude}
                longitude={farm.longitude}
                locationName={`${farm.name} (${farm.cropDisplayName})`}
                areaHectares={farm.areaHectares}
                onCoordinatesChanged={() => {}}
              />
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#c1c8c2]/30 text-[13px]">
              <div>
                <p className="text-[11px] font-medium text-[#717973] uppercase tracking-wider">Field Parcel Area</p>
                <p className="text-[14px] font-semibold text-[#191c1c] mt-0.5">{farm.areaHectares} ha</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#717973] uppercase tracking-wider">Coordinates</p>
                <p className="text-[14px] font-semibold text-[#191c1c] mt-0.5 font-mono text-[12px]">
                  {farm.latitude.toFixed(4)}°, {farm.longitude.toFixed(4)}°
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Data Table */}
      <div className="mt-8 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 overflow-hidden">
        <div className="p-6 border-b border-[#c1c8c2]/30 flex justify-between items-center">
          <div>
            <h3 className="text-[18px] font-bold text-[#191c1c]">Recent Readings Log ({farm.locationName})</h3>
            <p className="text-[12px] text-[#414844]">Multi-spectral Sentinel-2 NDVI aggregation calibrated for {farm.cropDisplayName}</p>
          </div>
          <button
            onClick={onNewSurvey}
            className="text-[#012d1d] hover:text-[#1b4332] text-[13px] font-semibold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>+ Log Ground Check</span>
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4f3] border-b border-[#c1c8c2]/40 text-[12px] font-semibold text-[#414844] uppercase tracking-wider">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Observed NDVI</th>
                <th className="py-3.5 px-6">Expected NDVI</th>
                <th className="py-3.5 px-6">Variance</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c1c8c2]/20 text-[14px]">
              {ndviReadings.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#f9f9f8] transition-colors"
                >
                  <td className="py-3.5 px-6 font-medium text-[#191c1c]">{row.date}</td>
                  <td className="py-3.5 px-6 font-bold text-[#191c1c]">{row.observed.toFixed(2)}</td>
                  <td className="py-3.5 px-6 text-[#414844]">{row.expected.toFixed(2)}</td>
                  <td className={`py-3.5 px-6 font-semibold ${row.variance < 0 ? 'text-[#a03f2e]' : 'text-[#012d1d]'}`}>
                    {row.variance > 0 ? `+${row.variance.toFixed(2)}` : row.variance.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-6">
                    {row.status === 'High Deviation' && (
                      <span className="inline-flex items-center gap-1 bg-[#ffdad6] text-[#93000a] px-2.5 py-1 rounded-full text-[12px] font-bold">
                        <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                        High Deviation
                      </span>
                    )}
                    {row.status === 'Monitoring' && (
                      <span className="inline-flex items-center gap-1 bg-[#e1e3e2] text-[#414844] px-2.5 py-1 rounded-full text-[12px] font-semibold">
                        Monitoring
                      </span>
                    )}
                    {row.status === 'Normal' && (
                      <span className="inline-flex items-center gap-1 bg-[#c1ecd4] text-[#002114] px-2.5 py-1 rounded-full text-[12px] font-semibold">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
