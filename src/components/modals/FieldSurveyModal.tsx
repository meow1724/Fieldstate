import React, { useState } from 'react';
import { FarmProfile, FieldSurvey } from '../../types';
import { CROP_DATABASE } from '../../lib/agronomy';
import { LocationPicker } from '../LocationPicker';

interface FieldSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmProfile;
  onSaveSurvey: (survey: FieldSurvey, updatedFarmProfile?: FarmProfile) => void;
}

export const FieldSurveyModal: React.FC<FieldSurveyModalProps> = ({
  isOpen,
  onClose,
  farm,
  onSaveSurvey,
}) => {
  const [surveyor, setSurveyor] = useState('J. Doe (Farm Manager)');
  const [observations, setObservations] = useState('');
  const [moistureCondition, setMoistureCondition] = useState<'Dry' | 'Optimal' | 'Saturated'>('Optimal');
  const [pestSpotted, setPestSpotted] = useState(false);
  const [pestNotes, setPestNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // Field & Location / Crop Overrides
  const [locationName, setLocationName] = useState(farm.locationName || 'California Central Valley');
  const [latitude, setLatitude] = useState(farm.latitude);
  const [longitude, setLongitude] = useState(farm.longitude);
  const [hardinessZone, setHardinessZone] = useState(farm.hardinessZone || 'Zone 9b');
  const [selectedCrop, setSelectedCrop] = useState(farm.crop || 'corn');
  const [areaHectares, setAreaHectares] = useState(farm.areaHectares || 2.0);
  const [plantingDate, setPlantingDate] = useState(farm.plantingDate || '2026-07-02');
  const [updateActiveFarmLocation, setUpdateActiveFarmLocation] = useState(true);
  const [showLocationCropEditor, setShowLocationCropEditor] = useState(false);

  if (!isOpen) return null;

  const handleLocationPicked = (lat: number, lon: number, nameStr: string, zone: string) => {
    setLatitude(lat);
    setLongitude(lon);
    setLocationName(nameStr);
    setHardinessZone(zone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cropConfig = CROP_DATABASE[selectedCrop] || CROP_DATABASE.corn;

    const updatedProfile: FarmProfile = {
      ...farm,
      name: `${cropConfig.displayName} Field (${locationName.split(',')[0]})`,
      crop: selectedCrop,
      cropDisplayName: cropConfig.displayName,
      latitude,
      longitude,
      locationName,
      hardinessZone,
      areaHectares: Number(areaHectares) || 1,
      plantingDate,
    };

    try {
      const res = await fetch('/api/gemini/analyze-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyNotes: observations,
          farm: updateActiveFarmLocation ? updatedProfile : farm,
          pestSpotted,
          moistureCondition,
        }),
      });
      const data = await res.json();
      setAiAnalysisResult(data.analysis || 'Survey verified successfully.');

      const newSurvey: FieldSurvey = {
        id: `srv-${Date.now()}`,
        farmId: farm.id,
        date: 'Today',
        surveyor,
        observations,
        pestSpotted,
        pestNotes: pestSpotted ? pestNotes : undefined,
        moistureCondition,
      };

      onSaveSurvey(newSurvey, updateActiveFarmLocation ? updatedProfile : undefined);
    } catch (err) {
      console.error(err);
      const newSurvey: FieldSurvey = {
        id: `srv-${Date.now()}`,
        farmId: farm.id,
        date: 'Today',
        surveyor,
        observations,
        pestSpotted,
        pestNotes: pestSpotted ? pestNotes : undefined,
        moistureCondition,
      };
      onSaveSurvey(newSurvey, updateActiveFarmLocation ? updatedProfile : undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[#c1c8c2] max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#c1c8c2]/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#012d1d] text-[26px]">assignment_add</span>
            <div>
              <h3 className="text-[20px] font-bold text-[#191c1c]">Log New Field Survey & Location</h3>
              <p className="text-[12px] text-[#414844]">Record ground observation or configure new field location & crop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#717973] hover:text-[#191c1c] hover:bg-[#edeeed] rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {aiAnalysisResult ? (
          <div className="flex flex-col gap-4">
            <div className="p-5 bg-[#c1ecd4]/40 border border-[#a5d0b9] rounded-xl text-[#002114]">
              <div className="flex items-center gap-2 font-bold mb-2 text-[16px]">
                <span className="material-symbols-outlined text-[22px]">psychology</span>
                <span>AI Agronomist Scout Assessment</span>
              </div>
              <p className="text-[14px] leading-relaxed whitespace-pre-line">{aiAnalysisResult}</p>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setAiAnalysisResult(null);
                  onClose();
                }}
                className="bg-[#012d1d] hover:bg-[#1b4332] text-white px-6 py-2.5 rounded-lg text-[14px] font-bold cursor-pointer"
              >
                Complete & Apply Sync
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Location & Crop Configuration Box */}
            <div className="bg-[#f9f9f8] p-4.5 rounded-xl border border-[#c1c8c2]/60 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#191c1c] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#012d1d] text-[18px]">location_on</span>
                  <span>Field Location & Crop Parameters</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowLocationCropEditor(!showLocationCropEditor)}
                  className="text-[12px] font-semibold text-[#012d1d] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showLocationCropEditor ? 'expand_less' : 'edit_location'}
                  </span>
                  <span>{showLocationCropEditor ? 'Collapse Location' : 'Change Location / Crop'}</span>
                </button>
              </div>

              {/* Collapsible Location Selector & Crop Options */}
              {showLocationCropEditor ? (
                <div className="pt-2 border-t border-[#c1c8c2]/30 flex flex-col gap-4">
                  {/* Location Picker */}
                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    locationName={locationName}
                    hardinessZone={hardinessZone}
                    onLocationSelected={handleLocationPicked}
                  />

                  {/* Crop & Area Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#191c1c] mb-1">
                        Select Crop
                      </label>
                      <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-3 py-2 text-[13px] font-medium text-[#191c1c]"
                      >
                        {Object.entries(CROP_DATABASE).map(([k, cfg]) => (
                          <option key={k} value={k}>
                            {cfg.displayName} ({cfg.totalCycleDays} days)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#191c1c] mb-1">
                        Field Size (Hectares)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={areaHectares}
                        onChange={(e) => setAreaHectares(parseFloat(e.target.value) || 1)}
                        className="w-full bg-white border border-[#c1c8c2] rounded-lg px-3 py-2 text-[13px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#191c1c] mb-1">
                      Sowing / Planting Date
                    </label>
                    <input
                      type="date"
                      value={plantingDate}
                      onChange={(e) => setPlantingDate(e.target.value)}
                      className="w-full bg-white border border-[#c1c8c2] rounded-lg px-3 py-2 text-[13px]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="syncFarmCheckbox"
                      checked={updateActiveFarmLocation}
                      onChange={(e) => setUpdateActiveFarmLocation(e.target.checked)}
                      className="w-4 h-4 accent-[#012d1d] cursor-pointer"
                    />
                    <label htmlFor="syncFarmCheckbox" className="text-[12px] font-semibold text-[#012d1d] cursor-pointer">
                      Update active field coordinates, crop, and live weather recommendations with this survey
                    </label>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] bg-white p-2.5 rounded-lg border border-[#c1c8c2]/40">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#191c1c]">{farm.name}</span>
                    <span className="text-[#717973]">•</span>
                    <span className="text-[#414844]">{locationName}</span>
                  </div>
                  <div className="text-[12px] font-mono text-[#012d1d] bg-[#c1ecd4] px-2 py-0.5 rounded">
                    {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                  </div>
                </div>
              )}
            </div>

            {/* Scout / Surveyor Name */}
            <div>
              <label className="block text-[13px] font-semibold text-[#191c1c] mb-1.5">
                Scout / Surveyor Name
              </label>
              <input
                type="text"
                required
                value={surveyor}
                onChange={(e) => setSurveyor(e.target.value)}
                className="w-full bg-[#f9f9f8] border border-[#c1c8c2] rounded-lg px-3.5 py-2 text-[14px] text-[#191c1c] focus:outline-none focus:border-[#012d1d]"
              />
            </div>

            {/* Soil Moisture Visual Check */}
            <div>
              <label className="block text-[13px] font-semibold text-[#191c1c] mb-1.5">
                Soil Moisture Status at 15cm Depth
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Dry', 'Optimal', 'Saturated'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMoistureCondition(m)}
                    className={`py-2 px-3 rounded-lg text-[13px] font-semibold border text-center transition-all cursor-pointer ${
                      moistureCondition === m
                        ? 'bg-[#1b4332] text-white border-[#012d1d]'
                        : 'bg-[#f9f9f8] text-[#414844] border-[#c1c8c2]/50 hover:bg-[#e7e8e7]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Pest spotted toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[#191c1c]">
                  Pests, Weeds, or Chlorosis Spotted?
                </label>
                <input
                  type="checkbox"
                  checked={pestSpotted}
                  onChange={(e) => setPestSpotted(e.target.checked)}
                  className="w-4 h-4 accent-[#012d1d] cursor-pointer"
                />
              </div>
              {pestSpotted && (
                <input
                  type="text"
                  placeholder="Describe pest type or weed pressure (e.g. Stem borer, Rust, Aphids)..."
                  value={pestNotes}
                  onChange={(e) => setPestNotes(e.target.value)}
                  className="w-full mt-2 bg-[#f9f9f8] border border-[#c1c8c2] rounded-lg px-3.5 py-2 text-[13px]"
                />
              )}
            </div>

            {/* Observations */}
            <div>
              <label className="block text-[13px] font-semibold text-[#191c1c] mb-1.5">
                Field Observations & Canopy Health Notes
              </label>
              <textarea
                required
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="e.g. Uniform vegetative stand. Moisture adequate in root zone. East parcel showing robust greening..."
                className="w-full bg-[#f9f9f8] border border-[#c1c8c2] rounded-lg p-3 text-[14px] text-[#191c1c] focus:outline-none focus:border-[#012d1d]"
              ></textarea>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#c1c8c2]/30">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-[#717973] text-[#191c1c] rounded-lg text-[13px] font-medium hover:bg-[#f3f4f3] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#012d1d] hover:bg-[#1b4332] text-white px-6 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Syncing & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
                    <span>Log Survey & Recalculate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
