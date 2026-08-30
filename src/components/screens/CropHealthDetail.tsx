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
  onToggleCloudGap: (enabled: boolean) => void;
  isCloudGapSimulated: boolean;
}

export const CropHealthDetail: React.FC<CropHealthDetailProps> = ({
  farm,
  agronomic,
  ndviReadings,
  satelliteMeta,
  onScheduleInspection,
  onNewSurvey,
  onToggleCloudGap,
  isCloudGapSimulated,
}) => {
  const [timeRange, setTimeRange] = useState('30');
  const [anomalyDismissed, setAnomalyDismissed] = useState(false);

  const currentReading = ndviReadings[0] || {
    date: 'Today',
    observed: 0.80,
    expected: 0.78,
    variance: 0.02,
    status: 'Normal' as const,
  };

  const hasAnomaly = ndviReadings.some((r) => r.variance <= -0.08);

  const handleExportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Observed NDVI,Expected NDVI,Variance,Status,Cloud Cover %'].concat(
        ndviReadings.map((r) => `${r.date},${r.observed},${r.expected},${r.variance},${r.status},${r.cloudCoverPercent || 0}`)
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
    <div className="flex-1 max-w-[1380px] mx-auto w-full">
      {/* Page Header (Matching Slide 7 & 8 of Fieldstate Presentation) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-[#1e3a29] text-[#e6a833] text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">satellite_alt</span>
              <span>Sentinel-2 Multispectral</span>
            </span>
            <span className="bg-white border border-[#cbd5e1] text-[#0f172a] text-[12px] font-semibold px-2.5 py-0.5 rounded-md">
              {farm.cropDisplayName} · Day {agronomic.cropAgeDays}
            </span>
            <span className="text-[12px] text-[#64748b] font-mono">
              {farm.latitude.toFixed(4)}° N, {farm.longitude.toFixed(4)}° E
            </span>
          </div>
          <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#0f172a] tracking-tight leading-tight">
            Crop Vigor (NDVI) & Canopy Analysis
          </h2>
          <p className="text-[15px] text-[#475569] mt-0.5">
            Comparing observed Sentinel-2 NIR/Red reflectance against modeled vegetative growth trajectories.
          </p>
        </div>

        {/* Action Controls & Cloud Gap Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Cloud Gap Simulator Toggle (Demonstrating Slide 11 Scientific Honesty) */}
          <button
            onClick={() => onToggleCloudGap(!isCloudGapSimulated)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold border transition-all cursor-pointer ${
              isCloudGapSimulated
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f8fafc]'
            }`}
            title="Simulate cloudy optical scene gap and test confidence downgrading"
          >
            <span className="material-symbols-outlined text-[17px] text-amber-600">
              {isCloudGapSimulated ? 'cloud' : 'wb_sunny'}
            </span>
            <span>{isCloudGapSimulated ? 'Cloud Gap Mode: ACTIVE' : 'Simulate Cloud Gap'}</span>
          </button>

          <button
            onClick={handleExportData}
            title="Download CSV"
            className="bg-white border border-[#cbd5e1] text-[#0f172a] p-2 rounded-xl hover:bg-[#f8fafc] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[19px]">download</span>
          </button>
        </div>
      </div>

      {/* Cloud Gap Banner when Active */}
      {isCloudGapSimulated && (
        <div className="mb-6 p-4 bg-amber-50 text-amber-950 rounded-2xl border border-amber-300 flex items-start gap-3 shadow-xs animate-in fade-in">
          <span className="material-symbols-outlined text-[24px] text-amber-700 mt-0.5">cloud</span>
          <div className="text-[13px] leading-relaxed">
            <strong className="text-amber-900">Atmospheric Cloud Interference Protocol Active:</strong>
            <p className="mt-0.5">
              Recent Sentinel-2 pass was obscured by optical cloud cover (&gt;65%). Rather than interpolating uncertain vegetative vigor, Fieldstate automatically adjusts decision confidence to <strong>Medium</strong> and anchors to the last validated optical pass.
            </p>
          </div>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Chart Card (Spans 7 cols on large screens) */}
        <div className="xl:col-span-7 bg-white rounded-3xl shadow-sm border border-[#cbd5e1] p-6 md:p-8 flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <h3 className="text-[19px] font-extrabold text-[#0f172a]">NDVI Trajectory Curve</h3>
                <p className="text-[13px] text-[#64748b] mt-0.5">
                  Observed $(NIR - Red) / (NIR + Red)$ vs. Expected Growth Stage Baseline
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#1e3a29]"></div>
                  <span className="text-[#475569] font-semibold">Expected ({currentReading.expected.toFixed(2)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#e6a833]"></div>
                  <span className="text-[#475569] font-semibold">Observed ({currentReading.observed.toFixed(2)})</span>
                </div>
              </div>
            </div>

            {/* SVG Trajectory Chart */}
            <div className="relative w-full h-[280px] border-b border-l border-[#cbd5e1] pb-8 pl-10 pt-4 mt-4">
              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-4 bottom-8 w-10 flex flex-col justify-between items-end pr-2 text-[11px] font-mono font-medium text-[#64748b]">
                <span>1.0</span>
                <span>0.8</span>
                <span>0.6</span>
                <span>0.4</span>
                <span>0.2</span>
                <span>0.0</span>
              </div>

              {/* X-Axis Labels */}
              <div className="absolute bottom-0 left-10 right-0 h-7 flex justify-between items-center text-[11px] font-medium text-[#64748b] px-2">
                <span>Day 1</span>
                <span>Day {Math.round(agronomic.cropAgeDays * 0.3)}</span>
                <span>Day {Math.round(agronomic.cropAgeDays * 0.6)}</span>
                <span>Day {Math.round(agronomic.cropAgeDays * 0.85)}</span>
                <span className="font-bold text-[#0f172a]">Today (Day {agronomic.cropAgeDays})</span>
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0 left-10 bottom-8 top-4 flex flex-col justify-between pointer-events-none opacity-15">
                <div className="w-full h-px bg-[#475569]"></div>
                <div className="w-full h-px bg-[#475569]"></div>
                <div className="w-full h-px bg-[#475569]"></div>
                <div className="w-full h-px bg-[#475569]"></div>
                <div className="w-full h-px bg-[#475569]"></div>
              </div>

              {/* SVG Curves */}
              <svg
                className="absolute inset-0 left-10 bottom-8 top-4 w-[calc(100%-2.5rem)] h-[calc(100%-3rem)] overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                {/* Expected Line (Dashed Green) */}
                <path
                  d="M 5,80 Q 25,65 50,40 T 75,25 T 95,20"
                  fill="none"
                  stroke="#1e3a29"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  className="opacity-70"
                />

                {/* Observed Line */}
                <path
                  d={
                    currentReading.variance < -0.05
                      ? 'M 5,80 Q 28,68 50,48 T 75,32 Q 85,36 95,45'
                      : 'M 5,80 Q 25,64 50,38 T 75,22 T 95,18'
                  }
                  fill="none"
                  stroke={currentReading.variance < -0.05 ? '#dc2626' : '#e6a833'}
                  strokeWidth="3.5"
                />

                {/* Point at Today */}
                <circle
                  cx="95"
                  cy={currentReading.variance < -0.05 ? '45' : '18'}
                  r="5"
                  className="fill-[#e6a833] stroke-[#101b13] stroke-2 cursor-pointer"
                />
              </svg>
            </div>
          </div>

          {/* Scientific Disclaimer Pill */}
          <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748b]">
            <span><strong>Remote Sensing Grounding:</strong> NDVI measures canopy chlorophyll and leaf area index — physical scouting confirms causes.</span>
            <span className="font-mono text-[#0f172a] font-bold">Variance: {currentReading.variance > 0 ? `+${currentReading.variance.toFixed(2)}` : currentReading.variance.toFixed(2)}</span>
          </div>
        </div>

        {/* Right Col: Map & Scout Anomaly Dispatch (Spans 5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* Anomaly Card if present */}
          {hasAnomaly && !anomalyDismissed && (
            <div className="bg-red-50 rounded-3xl shadow-sm border border-red-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <span className="material-symbols-outlined text-red-600 text-[26px]">warning</span>
                  <div>
                    <h3 className="text-[17px] font-bold text-red-950">Ground Inspection Recommended</h3>
                    <p className="text-[11px] text-red-700 font-bold uppercase tracking-wider">Canopy Reflectance Variance Flagged</p>
                  </div>
                </div>
                <p className="text-[13px] text-red-900 leading-relaxed mt-2">
                  Canopy NDVI is tracking <strong className="text-red-700 font-bold">{currentReading.variance.toFixed(2)}</strong> below the expected stage baseline. This flags for physical scouting (water distribution, pests, or localized drainage).
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-red-200 flex justify-end gap-2">
                <button
                  onClick={() => setAnomalyDismissed(true)}
                  className="text-red-700 border border-red-300 px-3 py-1.5 rounded-lg text-[12px] font-bold hover:bg-red-100"
                >
                  Dismiss
                </button>
                <button
                  onClick={onScheduleInspection}
                  className="bg-red-700 hover:bg-red-800 text-white px-4 py-1.5 rounded-lg text-[12px] font-bold shadow-xs cursor-pointer"
                >
                  Schedule Inspection Order
                </button>
              </div>
            </div>
          )}

          {/* Interactive Satellite Parcel Map */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#cbd5e1] p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[16px] font-extrabold text-[#0f172a] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#1e3a29] text-[20px]">layers</span>
                <span>Live Satellite Layer ({farm.locationName})</span>
              </h3>
              <span className="text-[11px] font-bold text-[#065f46] bg-[#d1fae5] px-2.5 py-0.5 rounded-md">
                10m Optical
              </span>
            </div>

            <InteractiveSatelliteMap
              latitude={farm.latitude}
              longitude={farm.longitude}
              locationName={`${farm.name} (${farm.cropDisplayName})`}
              areaHectares={farm.areaHectares}
              onCoordinatesChanged={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Historical Readings Log */}
      <div className="mt-6 bg-white rounded-3xl shadow-sm border border-[#cbd5e1] overflow-hidden">
        <div className="p-5 border-b border-[#e2e8f0] flex justify-between items-center">
          <div>
            <h3 className="text-[17px] font-extrabold text-[#0f172a]">Sentinel-2 Multispectral Log ({farm.name})</h3>
            <p className="text-[12px] text-[#64748b]">Historical optical passes calibrated for {farm.cropDisplayName}</p>
          </div>
          <button
            onClick={onNewSurvey}
            className="text-[#1e3a29] hover:text-[#14281c] text-[12px] font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Log Ground Observation</span>
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                <th className="py-3 px-6">Observation Date</th>
                <th className="py-3 px-6">Observed NDVI</th>
                <th className="py-3 px-6">Expected Baseline</th>
                <th className="py-3 px-6">Variance</th>
                <th className="py-3 px-6">Scene Quality</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {ndviReadings.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-3 px-6 font-bold text-[#0f172a]">{row.date}</td>
                  <td className="py-3 px-6 font-extrabold text-[#1e3a29] font-mono">{row.observed.toFixed(2)}</td>
                  <td className="py-3 px-6 text-[#64748b] font-mono">{row.expected.toFixed(2)}</td>
                  <td className={`py-3 px-6 font-bold font-mono ${row.variance < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {row.variance > 0 ? `+${row.variance.toFixed(2)}` : row.variance.toFixed(2)}
                  </td>
                  <td className="py-3 px-6 text-[#64748b]">
                    {row.cloudCoverPercent !== undefined ? `${row.cloudCoverPercent}% Cloud` : 'Clear'}
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      row.status === 'High Deviation'
                        ? 'bg-red-100 text-red-900 border border-red-300'
                        : row.status === 'Monitoring'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {row.status}
                    </span>
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
