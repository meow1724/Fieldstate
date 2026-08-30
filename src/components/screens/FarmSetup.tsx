import React, { useState, useEffect } from 'react';
import { FarmProfile, SoilType, IrrigationMethod } from '../../types';
import { CROP_DATABASE } from '../../lib/agronomy';
import { LocationPicker } from '../LocationPicker';
import { InteractiveSatelliteMap } from '../InteractiveSatelliteMap';
import { fetchLiveWeatherData, LiveWeatherData } from '../../lib/weatherApi';

interface FarmSetupProps {
  currentFarm: FarmProfile;
  onSaveFarm: (updatedFarm: FarmProfile) => void;
  onCancel: () => void;
}

export const FarmSetup: React.FC<FarmSetupProps> = ({
  currentFarm,
  onSaveFarm,
  onCancel,
}) => {
  const [name, setName] = useState(currentFarm.name);
  const [areaHectares, setAreaHectares] = useState(currentFarm.areaHectares);
  const [crop, setCrop] = useState(currentFarm.crop);
  const [plantingDate, setPlantingDate] = useState(currentFarm.plantingDate || '2026-07-02');
  const [soilType, setSoilType] = useState<SoilType>(currentFarm.soilType);
  const [irrigationMethod, setIrrigationMethod] = useState<IrrigationMethod>(currentFarm.irrigationMethod);
  const [latitude, setLatitude] = useState(currentFarm.latitude);
  const [longitude, setLongitude] = useState(currentFarm.longitude);
  const [hardinessZone, setHardinessZone] = useState(currentFarm.hardinessZone || 'Zone 10a');
  const [locationName, setLocationName] = useState(currentFarm.locationName || 'Assam Brahmaputra Valley');
  const [pumpType, setPumpType] = useState<'diesel' | 'electric_grid' | 'solar'>(currentFarm.pumpType || 'diesel');
  const [energyTariff, setEnergyTariff] = useState(currentFarm.energyTariffPerKwh || 0.18);
  const [pumpingHead, setPumpingHead] = useState(currentFarm.pumpingHeadMeters || 30);

  const [livePreviewWeather, setLivePreviewWeather] = useState<LiveWeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingWeather(true);
    fetchLiveWeatherData(latitude, longitude)
      .then((data) => {
        if (isMounted) {
          setLivePreviewWeather(data);
          setIsLoadingWeather(false);
        }
      })
      .catch((err) => {
        console.error('Error loading weather preview:', err);
        if (isMounted) setIsLoadingWeather(false);
      });
    return () => {
      isMounted = false;
    };
  }, [latitude, longitude]);

  const handleLocationPicked = (lat: number, lon: number, nameStr: string, zone: string) => {
    setLatitude(lat);
    setLongitude(lon);
    setLocationName(nameStr);
    setHardinessZone(zone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cropConfig = CROP_DATABASE[crop] || CROP_DATABASE.rice;
    const updated: FarmProfile = {
      ...currentFarm,
      name,
      areaHectares: Number(areaHectares) || 1,
      crop,
      cropDisplayName: cropConfig.displayName,
      plantingDate,
      soilType,
      irrigationMethod,
      latitude: Number(latitude),
      longitude: Number(longitude),
      locationName,
      hardinessZone,
      pumpType,
      energyTariffPerKwh: Number(energyTariff) || 0.16,
      pumpingHeadMeters: Number(pumpingHead) || 30,
    };
    onSaveFarm(updated);
  };

  return (
    <div className="flex-1 max-w-[1380px] mx-auto w-full">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="bg-[#1e3a29] text-[#e6a833] text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
            Field Configuration
          </span>
          <span className="text-[12px] text-[#64748b]">Real-world GPS coordinates and pumping profile</span>
        </div>
        <h2 className="text-[32px] md:text-[42px] font-extrabold text-[#0f172a] tracking-tight leading-tight">
          Farm & Economic Profile Setup
        </h2>
        <p className="text-[15px] text-[#475569] mt-0.5">
          Select real field coordinates worldwide to fetch live meteorological data, FAO-56 evapotranspiration models, and satellite signals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Basic Info (Spans 6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#cbd5e1] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-[#1e3a29] text-[24px]">badge</span>
                <h3 className="text-[19px] font-extrabold text-[#0f172a]">Basic Farm Facts</h3>
              </div>

              <div className="flex flex-col gap-4 text-[13px]">
                <div>
                  <label className="block font-bold text-[#0f172a] mb-1.5">Farm or Field Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. North Plot — Rice (Paddy)"
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#1e3a29]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0f172a] mb-1.5">Total Area (Hectares)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={areaHectares}
                      onChange={(e) => setAreaHectares(parseFloat(e.target.value))}
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#1e3a29]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] font-medium">ha</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0f172a] mb-1.5">Primary Crop Variety</label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#1e3a29]"
                  >
                    {Object.entries(CROP_DATABASE).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.displayName} ({config.totalCycleDays} days cycle)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#0f172a] mb-1.5">Sowing / Planting Date</label>
                  <input
                    type="date"
                    required
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#1e3a29]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location & Interactive Map (Spans 6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#cbd5e1] flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#1e3a29] text-[24px]">explore</span>
                <h3 className="text-[19px] font-extrabold text-[#0f172a]">Worldwide GPS Location</h3>
              </div>

              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                locationName={locationName}
                hardinessZone={hardinessZone}
                onLocationSelected={handleLocationPicked}
              />

              <div className="mt-4">
                <InteractiveSatelliteMap
                  latitude={latitude}
                  longitude={longitude}
                  locationName={locationName}
                  areaHectares={areaHectares}
                  onCoordinatesChanged={(lat, lon) => {
                    setLatitude(lat);
                    setLongitude(lon);
                  }}
                  onAreaChanged={(newArea) => setAreaHectares(newArea)}
                />
              </div>
            </div>

            {/* Live Telemetry Preview */}
            <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#cbd5e1] flex items-center justify-between text-[12px]">
              {isLoadingWeather ? (
                <span className="text-[#64748b] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Fetching live meteorological telemetry...</span>
                </span>
              ) : livePreviewWeather ? (
                <span className="text-[#1e3a29] font-bold">
                  Live API: {livePreviewWeather.currentTemp}°C · ET₀ {livePreviewWeather.referenceEt0Today} mm/d · Rain {livePreviewWeather.rainForecast24h} mm
                </span>
              ) : (
                <span className="text-[#64748b]">Ready to sync</span>
              )}
            </div>
          </div>

          {/* Soil & Irrigation (Spans 6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#cbd5e1]">
            <h3 className="text-[18px] font-extrabold text-[#0f172a] mb-4">Soil & Irrigation Specs</h3>

            <div className="mb-4">
              <label className="block text-[12px] font-bold text-[#334155] uppercase tracking-wider mb-2">Soil Type</label>
              <div className="grid grid-cols-3 gap-2 text-[12px]">
                {(['sandy', 'loam', 'clay'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSoilType(s)}
                    className={`py-2 px-3 rounded-xl font-bold border capitalize transition-all ${
                      soilType === s
                        ? 'bg-[#1e3a29] text-white border-[#1e3a29]'
                        : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#334155] uppercase tracking-wider mb-2">Irrigation Method</label>
              <div className="grid grid-cols-3 gap-2 text-[12px]">
                {(['drip', 'sprinkler', 'flood'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setIrrigationMethod(m)}
                    className={`py-2 px-3 rounded-xl font-bold border capitalize transition-all ${
                      irrigationMethod === m
                        ? 'bg-[#1e3a29] text-white border-[#1e3a29]'
                        : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pumping & Economics Parameters (Spans 6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#cbd5e1]">
            <h3 className="text-[18px] font-extrabold text-[#0f172a] mb-4">Pumping Energy & Economic Rates</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div>
                <label className="block font-bold text-[#0f172a] mb-1">Pump Power Type</label>
                <select
                  value={pumpType}
                  onChange={(e) => setPumpType(e.target.value as any)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2"
                >
                  <option value="diesel">Diesel Generator</option>
                  <option value="electric_grid">Electric Grid</option>
                  <option value="solar">Solar PV Pump</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#0f172a] mb-1">Energy Rate ($/unit)</label>
                <input
                  type="number"
                  step="0.01"
                  value={energyTariff}
                  onChange={(e) => setEnergyTariff(parseFloat(e.target.value) || 0.16)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#0f172a] mb-1">Pumping Depth / Head (Meters)</label>
                <input
                  type="number"
                  step="1"
                  value={pumpingHead}
                  onChange={(e) => setPumpingHead(parseInt(e.target.value) || 30)}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#e2e8f0]">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-[#cbd5e1] text-[#475569] rounded-xl text-[13px] font-bold hover:bg-[#f8fafc]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-[#1e3a29] hover:bg-[#14281c] text-white rounded-xl text-[13px] font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            <span>Save & Recalculate Live</span>
          </button>
        </div>
      </form>
    </div>
  );
};
