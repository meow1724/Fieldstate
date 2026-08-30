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
  const [hardinessZone, setHardinessZone] = useState(currentFarm.hardinessZone || 'Hardiness 9b');
  const [locationName, setLocationName] = useState(currentFarm.locationName || 'California Central Valley');

  const [livePreviewWeather, setLivePreviewWeather] = useState<LiveWeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Fetch live weather preview whenever coordinates change
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
        console.error('Error fetching live weather preview:', err);
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
    const cropConfig = CROP_DATABASE[crop] || CROP_DATABASE.corn;
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
    };
    onSaveFarm(updated);
  };

  return (
    <div className="flex-1 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-[36px] md:text-[48px] font-bold text-[#191c1c] tracking-tight leading-tight">
          Farm Profile Setup
        </h2>
        <p className="text-[18px] text-[#414844] mt-1">
          Select real field coordinates worldwide to fetch live meteorological data, FAO-56 evapotranspiration models, and satellite signals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Basic Information Card (Spans 6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#012d1d] text-[24px]">badge</span>
                <h3 className="text-[20px] font-bold text-[#191c1c]">Basic Information</h3>
              </div>

              <div className="flex flex-col gap-4">
                {/* Farm Name */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1c] mb-1.5">
                    Farm or Field Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Zone 4: North Field Corn"
                    className="w-full bg-[#f9f9f8] border border-[#c1c8c2] rounded-lg px-4 py-2.5 text-[14px] text-[#191c1c] focus:outline-none focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d]"
                  />
                </div>

                {/* Total Area */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1c] mb-1.5">
                    Total Area (Hectares)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={areaHectares}
                      onChange={(e) => setAreaHectares(parseFloat(e.target.value))}
                      className="w-full bg-[#f9f9f8] border border-[#c1c8c2] rounded-lg px-4 py-2.5 text-[14px] text-[#191c1c] focus:outline-none focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[#717973] font-medium pointer-events-none">
                      ha
                    </span>
                  </div>
                </div>

                {/* Primary Crop Focus */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1c] mb-1.5">
                    Primary Crop Focus
                  </label>
                  <div className="relative">
                    <select
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      className="w-full bg-[#f9f9f8] border border-[#c1c8c2] rounded-lg px-4 py-2.5 text-[14px] text-[#191c1c] appearance-none focus:outline-none focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] cursor-pointer"
                    >
                      {Object.entries(CROP_DATABASE).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.displayName} ({config.totalCycleDays} days cycle)
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#717973] text-[20px]">
                      arrow_drop_down
                    </span>
                  </div>
                </div>

                {/* Sowing / Planting Date */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#191c1c] mb-1.5">
                    Sowing / Planting Date
                  </label>
                  <input
                    type="date"
                    required
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    className="w-full bg-[#f9f9f8] border border-[#c1c8c2] rounded-lg px-4 py-2.5 text-[14px] text-[#191c1c] focus:outline-none focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d]"
                  />
                  <p className="text-[11px] text-[#717973] mt-1">
                    Used to accurately compute vegetative growth stages and daily FAO-56 crop coefficient ($K_c$).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Interactive Satellite Map Card (Spans 6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30 flex flex-col justify-between gap-4">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#012d1d] text-[24px]">map</span>
                  <h3 className="text-[20px] font-bold text-[#191c1c]">Global Location & Satellite Pin</h3>
                </div>
              </div>

              {/* Location Picker with Search & GPS */}
              <div className="mb-4">
                <LocationPicker
                  latitude={latitude}
                  longitude={longitude}
                  locationName={locationName}
                  hardinessZone={hardinessZone}
                  onLocationSelected={handleLocationPicked}
                />
              </div>

              {/* Interactive Satellite Map with Leaflet & Real ESRI Tiles */}
              <div className="mt-2">
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

            {/* Live API Telemetry Preview */}
            <div className="mt-2 bg-[#f3f4f3] p-4 rounded-xl border border-[#c1c8c2]/50 flex items-center justify-between">
              {isLoadingWeather ? (
                <div className="flex items-center gap-2 text-[13px] text-[#414844]">
                  <span className="material-symbols-outlined text-[18px] animate-spin text-[#012d1d]">
                    progress_activity
                  </span>
                  <span>Fetching live meteorological telemetry from Open-Meteo API...</span>
                </div>
              ) : livePreviewWeather ? (
                <div className="w-full flex flex-wrap items-center justify-between gap-3 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#012d1d] text-[20px]">cloud_sync</span>
                    <div>
                      <span className="font-bold text-[#191c1c]">Live API Status: Active</span>
                      <p className="text-[11px] text-[#414844]">
                        Temp: {livePreviewWeather.currentTemp}°C • Wind: {livePreviewWeather.currentWindSpeed} km/h • 24h Rain: {livePreviewWeather.rainForecast24h} mm
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-[#717973] uppercase block">FAO-56 ET₀ Today</span>
                    <span className="text-[16px] font-bold text-[#012d1d]">{livePreviewWeather.referenceEt0Today} mm/day</span>
                  </div>
                </div>
              ) : (
                <span className="text-[13px] text-[#717973]">Enter coordinates to load live telemetry</span>
              )}
            </div>
          </div>

          {/* Environmental Specifications Card (Spans full 12 cols) */}
          <div className="lg:col-span-12 bg-white rounded-2xl p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c1c8c2]/30">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[#012d1d] text-[24px]">nature</span>
              <h3 className="text-[20px] font-bold text-[#191c1c]">Environmental Specifications</h3>
            </div>

            {/* Soil Type Selection */}
            <div className="mb-6">
              <label className="block text-[14px] font-bold text-[#191c1c] mb-3">
                Predominant Soil Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sandy */}
                <div
                  onClick={() => setSoilType('sandy')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    soilType === 'sandy'
                      ? 'border-[#012d1d] bg-[#c1ecd4]/20 shadow-xs'
                      : 'border-[#c1c8c2]/50 bg-[#f9f9f8] hover:border-[#717973]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[24px] text-[#012d1d]">grain</span>
                    <input
                      type="radio"
                      checked={soilType === 'sandy'}
                      onChange={() => setSoilType('sandy')}
                      className="accent-[#012d1d]"
                    />
                  </div>
                  <h4 className="text-[15px] font-bold text-[#191c1c]">Sandy Soil</h4>
                  <p className="text-[12px] text-[#414844] mt-1">
                    High infiltration rate, lower available water storage capacity (80 mm/m).
                  </p>
                </div>

                {/* Loam */}
                <div
                  onClick={() => setSoilType('loam')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    soilType === 'loam'
                      ? 'border-[#012d1d] bg-[#c1ecd4]/20 shadow-xs'
                      : 'border-[#c1c8c2]/50 bg-[#f9f9f8] hover:border-[#717973]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[24px] text-[#012d1d]">layers</span>
                    <input
                      type="radio"
                      checked={soilType === 'loam'}
                      onChange={() => setSoilType('loam')}
                      className="accent-[#012d1d]"
                    />
                  </div>
                  <h4 className="text-[15px] font-bold text-[#191c1c]">Loam Soil (Recommended)</h4>
                  <p className="text-[12px] text-[#414844] mt-1">
                    Balanced drainage and optimal moisture holding capacity (140 mm/m).
                  </p>
                </div>

                {/* Clay */}
                <div
                  onClick={() => setSoilType('clay')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    soilType === 'clay'
                      ? 'border-[#012d1d] bg-[#c1ecd4]/20 shadow-xs'
                      : 'border-[#c1c8c2]/50 bg-[#f9f9f8] hover:border-[#717973]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[24px] text-[#012d1d]">water</span>
                    <input
                      type="radio"
                      checked={soilType === 'clay'}
                      onChange={() => setSoilType('clay')}
                      className="accent-[#012d1d]"
                    />
                  </div>
                  <h4 className="text-[15px] font-bold text-[#191c1c]">Clay Soil</h4>
                  <p className="text-[12px] text-[#414844] mt-1">
                    High water retention (180 mm/m), slower infiltration and higher runoff risk.
                  </p>
                </div>
              </div>
            </div>

            {/* Irrigation Method Selection */}
            <div>
              <label className="block text-[14px] font-bold text-[#191c1c] mb-3">
                Primary Irrigation Method
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Drip */}
                <div
                  onClick={() => setIrrigationMethod('drip')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    irrigationMethod === 'drip'
                      ? 'border-[#012d1d] bg-[#c1ecd4]/20 shadow-xs'
                      : 'border-[#c1c8c2]/50 bg-[#f9f9f8] hover:border-[#717973]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[24px] text-[#012d1d]">opacity</span>
                    <input
                      type="radio"
                      checked={irrigationMethod === 'drip'}
                      onChange={() => setIrrigationMethod('drip')}
                      className="accent-[#012d1d]"
                    />
                  </div>
                  <h4 className="text-[15px] font-bold text-[#191c1c]">Drip Irrigation (90% Eff.)</h4>
                  <p className="text-[12px] text-[#414844] mt-1">
                    Precision targeted emitter lines delivering water straight to root zone.
                  </p>
                </div>

                {/* Sprinkler */}
                <div
                  onClick={() => setIrrigationMethod('sprinkler')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    irrigationMethod === 'sprinkler'
                      ? 'border-[#012d1d] bg-[#c1ecd4]/20 shadow-xs'
                      : 'border-[#c1c8c2]/50 bg-[#f9f9f8] hover:border-[#717973]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[24px] text-[#012d1d]">shower</span>
                    <input
                      type="radio"
                      checked={irrigationMethod === 'sprinkler'}
                      onChange={() => setIrrigationMethod('sprinkler')}
                      className="accent-[#012d1d]"
                    />
                  </div>
                  <h4 className="text-[15px] font-bold text-[#191c1c]">Sprinkler System (75% Eff.)</h4>
                  <p className="text-[12px] text-[#414844] mt-1">
                    Overhead distributed spray subject to moderate wind evaporation.
                  </p>
                </div>

                {/* Flood */}
                <div
                  onClick={() => setIrrigationMethod('flood')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    irrigationMethod === 'flood'
                      ? 'border-[#012d1d] bg-[#c1ecd4]/20 shadow-xs'
                      : 'border-[#c1c8c2]/50 bg-[#f9f9f8] hover:border-[#717973]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[24px] text-[#012d1d]">tsunami</span>
                    <input
                      type="radio"
                      checked={irrigationMethod === 'flood'}
                      onChange={() => setIrrigationMethod('flood')}
                      className="accent-[#012d1d]"
                    />
                  </div>
                  <h4 className="text-[15px] font-bold text-[#191c1c]">Flood / Furrow (60% Eff.)</h4>
                  <p className="text-[12px] text-[#414844] mt-1">
                    Basin gravitational distribution with higher deep percolation losses.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Real API Calculation Banner */}
          <div className="lg:col-span-12 bg-[#c1ecd4]/30 border border-[#a5d0b9] rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#002114] text-[22px] mt-0.5">cloud_sync</span>
            <div className="text-[13px] text-[#002114]">
              <strong>Live Synchronization Enabled:</strong> Saving this field will immediately query real global meteorological and evapotranspiration data from Open-Meteo API for these coordinates ({latitude.toFixed(4)}°, {longitude.toFixed(4)}°) and sync all calculations dynamically.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-[#c1c8c2]/40">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-[#717973] text-[#191c1c] hover:bg-[#f3f4f3] rounded-lg text-[14px] font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-[#012d1d] hover:bg-[#1b4332] text-white rounded-lg text-[14px] font-bold shadow-sm transition-all cursor-pointer active:scale-98 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
            <span>Save Field & Sync Live API</span>
          </button>
        </div>
      </form>
    </div>
  );
};
