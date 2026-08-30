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
  const [surveyor, setSurveyor] = useState('J. Doe (Field Manager)');
  const [observations, setObservations] = useState('');
  const [moistureCondition, setMoistureCondition] = useState<'Dry' | 'Optimal' | 'Saturated'>('Optimal');
  const [pestSpotted, setPestSpotted] = useState(false);
  const [pestNotes, setPestNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  const [locationName, setLocationName] = useState(farm.locationName || 'Assam Brahmaputra Valley');
  const [latitude, setLatitude] = useState(farm.latitude);
  const [longitude, setLongitude] = useState(farm.longitude);
  const [hardinessZone, setHardinessZone] = useState(farm.hardinessZone || 'Zone 10a');
  const [selectedCrop, setSelectedCrop] = useState(farm.crop || 'rice');
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
    const cropConfig = CROP_DATABASE[selectedCrop] || CROP_DATABASE.rice;
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
      setAiAnalysisResult(data.analysis || 'Ground observation recorded into permanent farm audit log.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-[#cbd5e1] max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a29] text-[#e6a833] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">assignment_add</span>
            </div>
            <div>
              <h3 className="text-[19px] font-extrabold text-[#0f172a]">Log Field Scout Survey</h3>
              <p className="text-[12px] text-[#64748b]">Ground observation and physical check for {farm.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {aiAnalysisResult ? (
          <div className="flex flex-col gap-4">
            <div className="p-5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl text-[#065f46]">
              <div className="flex items-center gap-2 font-bold mb-2 text-[15px]">
                <span className="material-symbols-outlined text-[22px] text-[#059669]">psychology</span>
                <span>Fieldstate AI Agronomist Assessment</span>
              </div>
              <p className="text-[13px] leading-relaxed whitespace-pre-line text-[#047857]">{aiAnalysisResult}</p>
            </div>
            <div className="flex justify-end pt-3">
              <button
                onClick={() => {
                  setAiAnalysisResult(null);
                  onClose();
                }}
                className="bg-[#1e3a29] hover:bg-[#14281c] text-white px-6 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer"
              >
                Complete & Apply Sync
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-[13px]">
            {/* Location / Crop Switcher Accordion */}
            <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#cbd5e1] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0f172a] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#1e3a29] text-[18px]">location_on</span>
                  <span>Field Location & Crop Parameters</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowLocationCropEditor(!showLocationCropEditor)}
                  className="text-[12px] font-bold text-[#1e3a29] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{showLocationCropEditor ? 'Collapse Location' : 'Change Location / Crop'}</span>
                </button>
              </div>

              {showLocationCropEditor && (
                <div className="pt-3 border-t border-[#e2e8f0] flex flex-col gap-3.5">
                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    locationName={locationName}
                    hardinessZone={hardinessZone}
                    onLocationSelected={handleLocationPicked}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-[#0f172a] mb-1 text-[12px]">Crop</label>
                      <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-xl px-3 py-2 text-[12px]"
                      >
                        {Object.entries(CROP_DATABASE).map(([k, cfg]) => (
                          <option key={k} value={k}>
                            {cfg.displayName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#0f172a] mb-1 text-[12px]">Area (ha)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={areaHectares}
                        onChange={(e) => setAreaHectares(parseFloat(e.target.value) || 1)}
                        className="w-full bg-white border border-[#cbd5e1] rounded-xl px-3 py-2 text-[12px]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="syncFarmCheckbox"
                      checked={updateActiveFarmLocation}
                      onChange={(e) => setUpdateActiveFarmLocation(e.target.checked)}
                      className="w-4 h-4 accent-[#1e3a29] cursor-pointer"
                    />
                    <label htmlFor="syncFarmCheckbox" className="text-[12px] font-bold text-[#1e3a29] cursor-pointer">
                      Update active field coordinates, crop, and live weather recommendations with this survey
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Surveyor */}
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Scout / Surveyor Name</label>
              <input
                type="text"
                required
                value={surveyor}
                onChange={(e) => setSurveyor(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#1e3a29]"
              />
            </div>

            {/* Soil condition */}
            <div>
              <label className="block font-bold text-[#0f172a] mb-1.5">Soil Moisture Condition at 15cm Depth</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Dry', 'Optimal', 'Saturated'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMoistureCondition(m)}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      moistureCondition === m
                        ? 'bg-[#1e3a29] text-white border-[#1e3a29]'
                        : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Pest spotted toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-[#0f172a]">Pests, Weeds, or Chlorosis Spotted?</label>
                <input
                  type="checkbox"
                  checked={pestSpotted}
                  onChange={(e) => setPestSpotted(e.target.checked)}
                  className="w-4 h-4 accent-[#1e3a29] cursor-pointer"
                />
              </div>
              {pestSpotted && (
                <input
                  type="text"
                  placeholder="Describe pest type (e.g. Stem borer, Leaf rust, Aphids)..."
                  value={pestNotes}
                  onChange={(e) => setPestNotes(e.target.value)}
                  className="w-full mt-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2"
                />
              )}
            </div>

            {/* Observations */}
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Field Observations & Canopy Health Notes</label>
              <textarea
                required
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="e.g. Robust greening stand. Topsoil moisture buffer holding well. No drainage blockage noted..."
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl p-3 text-[#0f172a] focus:outline-none focus:border-[#1e3a29]"
              ></textarea>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-[#cbd5e1] text-[#475569] rounded-xl font-bold hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#1e3a29] hover:bg-[#14281c] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Syncing & Auditing...</span>
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
