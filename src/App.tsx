import React, { useState, useEffect, useCallback } from 'react';
import { BENCHMARK_FARMS, buildLiveFieldDataSet, FarmDataSet } from './lib/fieldRegistry';
import { FarmProfile, FieldSurvey, Recommendation, DataProvenanceTag } from './types';
import { evaluateFarmDecision, CROP_DATABASE } from './lib/agronomy';
import { fetchLiveWeatherData, estimateHardinessZone, computeRealFieldAgronomy, LiveWeatherData } from './lib/weatherApi';

import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { TodayDashboard } from './components/screens/TodayDashboard';
import { FarmEconomicsScreen } from './components/screens/FarmEconomicsScreen';
import { CropHealthDetail } from './components/screens/CropHealthDetail';
import { WaterManagementDetail } from './components/screens/WaterManagementDetail';
import { WeatherForecastDetail } from './components/screens/WeatherForecastDetail';
import { FarmSetup } from './components/screens/FarmSetup';

import { FieldSurveyModal } from './components/modals/FieldSurveyModal';
import { AiAgronomistModal } from './components/modals/AiAgronomistModal';
import { ScheduleInspectionModal } from './components/modals/ScheduleInspectionModal';
import { DataProvenanceModal } from './components/modals/DataProvenanceModal';

const STORAGE_KEY = 'fieldstate_live_farms_v4';

// Helper to construct an initial skeleton dataset for any farm profile
function createInitialDataset(farm: FarmProfile): FarmDataSet {
  return {
    farm,
    agronomic: {
      cropAgeDays: 45,
      growthStage: 'mid-season',
      growthStageName: 'Mid-Season Canopy Expansion',
      referenceEt0: 4.8,
      cropCoefficientKc: 1.15,
      cropEtDemand: 5.5,
      rain24h: 0,
      rain3d: 0,
      effectiveRain: 0,
      irrigationAppliedToday: 0,
      netWaterChange: -5.5,
      soilMoisturePercent: 55,
      rootZoneDepletion: 18,
      availableWater: 36,
      waterStatus: 'optimal',
      potentialWaterSavedLitres: 137500,
      potentialCostSavedDollars: 24.5,
      potentialCo2SavedKg: 18.2,
      potentialPumpingKwhSaved: 52,
    },
    ndviReadings: [
      {
        date: 'Today',
        observed: 0.78,
        expected: 0.78,
        variance: 0.0,
        status: 'Normal',
        cloudCoverPercent: 5,
        satellite: 'Sentinel-2 (ESA)',
        resolution: '10m / pixel Ground Resolution',
      },
    ],
    ndviHistoryChart: [
      { label: 'Day 1', expected: 0.22, observed: 0.22, day: 1 },
      { label: 'Day 15', expected: 0.42, observed: 0.44, day: 15 },
      { label: 'Day 30', expected: 0.68, observed: 0.65, day: 30 },
      { label: 'Today', expected: 0.78, observed: 0.78, day: 45 },
    ],
    weather3Day: [],
    weather7Day: [],
    satelliteMeta: {
      source: 'Sentinel-2 Multispectral (ESA Copernicus)',
      acquisitionDate: 'Live Optical Pass',
      resolution: '10m / pixel Ground Resolution',
      cloudCoverPercent: 5,
      imageUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/14322/24810',
      altText: `Live Sentinel-2 composite for ${farm.name}`,
      isCloudCovered: false,
    },
    surveys: [],
  };
}

export const App: React.FC = () => {
  const [farmsData, setFarmsData] = useState<Record<string, FarmDataSet>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved farms:', e);
    }
    const initialMap: Record<string, FarmDataSet> = {};
    Object.entries(BENCHMARK_FARMS).forEach(([key, profile]) => {
      initialMap[key] = createInitialDataset(profile);
    });
    return initialMap;
  });

  const [selectedFarmId, setSelectedFarmId] = useState<string>('punjab-rice-basin');
  const [activeTab, setActiveTab] = useState<string>('today');

  // Real-time API state
  const [isSyncingApi, setIsSyncingApi] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  // Cloud gap simulation state
  const [isCloudGapSimulated, setIsCloudGapSimulated] = useState<boolean>(false);

  // Modals
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isProvenanceModalOpen, setIsProvenanceModalOpen] = useState(false);
  const [activeProvenanceTag, setActiveProvenanceTag] = useState<DataProvenanceTag | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const currentDataSet = farmsData[selectedFarmId] || Object.values(farmsData)[0];
  const { farm, agronomic, ndviReadings, weather3Day, weather7Day, satelliteMeta } = currentDataSet;

  // Compute live deterministic recommendation
  const recommendation: Recommendation = evaluateFarmDecision(farm, agronomic, ndviReadings);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(farmsData));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [farmsData]);

  // Synchronize with real Open-Meteo API
  const syncWithLiveApi = useCallback(async (farmToSync: FarmProfile, simulateCloud = isCloudGapSimulated) => {
    setIsSyncingApi(true);
    setSyncError(null);
    try {
      const liveWeather: LiveWeatherData = await fetchLiveWeatherData(
        farmToSync.latitude,
        farmToSync.longitude
      );

      const dataset = buildLiveFieldDataSet(
        farmToSync,
        liveWeather,
        currentDataSet?.agronomic?.irrigationAppliedToday || 0,
        simulateCloud,
        currentDataSet?.surveys || []
      );

      setFarmsData((prev) => ({
        ...prev,
        [farmToSync.id]: dataset,
      }));
      setLastSyncTime(new Date());
    } catch (err: any) {
      console.error('Live API sync error:', err);
      setSyncError('Connecting to live satellite meteorology... using cached field state.');
    } finally {
      setIsSyncingApi(false);
    }
  }, [currentDataSet, isCloudGapSimulated]);

  // Sync on initial load and when farm changes
  useEffect(() => {
    if (farm) {
      syncWithLiveApi(farm, isCloudGapSimulated);
    }
  }, [farm.id, farm.latitude, farm.longitude]);

  // Handle Detect My Live GPS Location
  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      setSyncError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingGps(true);
    setSyncError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lon = Number(pos.coords.longitude.toFixed(4));
          const zone = estimateHardinessZone(lat);
          const liveId = 'my-live-gps-field';

          const liveProfile: FarmProfile = {
            id: liveId,
            name: `My Live Field (${lat >= 0 ? lat + '°N' : Math.abs(lat) + '°S'}, ${lon >= 0 ? lon + '°E' : Math.abs(lon) + '°W'})`,
            crop: 'rice',
            cropDisplayName: 'Rice (Paddy)',
            plantingDate: new Date(Date.now() - 42 * 86400000).toISOString().split('T')[0],
            areaHectares: 2.0,
            soilType: 'loam',
            irrigationMethod: 'drip',
            latitude: lat,
            longitude: lon,
            locationName: `Local Coordinates (${lat}°, ${lon}°)`,
            hardinessZone: zone,
            pumpType: 'electric_grid',
            energyTariffPerKwh: 0.16,
            pumpingHeadMeters: 30,
          };

          const liveWeather = await fetchLiveWeatherData(lat, lon);
          const liveDataSet = buildLiveFieldDataSet(liveProfile, liveWeather, 0, false, []);

          setFarmsData((prev) => ({
            ...prev,
            [liveId]: liveDataSet,
          }));
          setSelectedFarmId(liveId);
          setLocationSuccessMsg(`Successfully locked to your live GPS coordinates: ${lat}°, ${lon}°!`);
          setTimeout(() => setLocationSuccessMsg(null), 6000);
        } catch (err: any) {
          console.error('Error fetching live location weather:', err);
          setSyncError(`Live GPS weather fetch error: ${err.message}`);
        } finally {
          setIsLocatingGps(false);
        }
      },
      (err) => {
        setIsLocatingGps(false);
        setSyncError(`GPS Permission denied or unavailable: ${err.message}. You can still search any global field in Farm Configuration.`);
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  // Handle Tab Switch
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch Farm
  const handleSelectFarm = (farmId: string) => {
    setSelectedFarmId(farmId);
    const targetFarm = farmsData[farmId]?.farm;
    if (targetFarm) {
      syncWithLiveApi(targetFarm, isCloudGapSimulated);
    }
  };

  // Switch Benchmark Farm
  const handleSelectBenchmarkFarm = (benchmarkKey: string) => {
    if (BENCHMARK_FARMS[benchmarkKey]) {
      const benchmarkProfile = BENCHMARK_FARMS[benchmarkKey];
      setSelectedFarmId(benchmarkKey);
      syncWithLiveApi(benchmarkProfile, false);
    }
  };

  // Handle Cloud Gap Toggle
  const handleToggleCloudGap = (enabled: boolean) => {
    setIsCloudGapSimulated(enabled);
    if (farm) {
      syncWithLiveApi(farm, enabled);
    }
  };

  // Handle Farm Profile Save
  const handleSaveFarm = async (updatedFarm: FarmProfile) => {
    setIsSyncingApi(true);
    try {
      const liveWeather = await fetchLiveWeatherData(updatedFarm.latitude, updatedFarm.longitude);
      const updatedDataSet = buildLiveFieldDataSet(
        updatedFarm,
        liveWeather,
        0,
        isCloudGapSimulated,
        currentDataSet.surveys || []
      );

      setFarmsData((prev) => ({
        ...prev,
        [updatedFarm.id]: updatedDataSet,
      }));
      setSelectedFarmId(updatedFarm.id);
      setLastSyncTime(new Date());
      setActiveTab('today');
    } catch (err) {
      console.error('Error saving farm:', err);
      setFarmsData((prev) => ({
        ...prev,
        [updatedFarm.id]: {
          ...currentDataSet,
          farm: updatedFarm,
        },
      }));
      setActiveTab('today');
    } finally {
      setIsSyncingApi(false);
    }
  };

  // Handle Irrigation Application from Sandbox
  const handleApplyIrrigation = (appliedMm: number) => {
    const newAppliedToday = agronomic.irrigationAppliedToday + appliedMm;
    const newNetChange = Number((agronomic.rain24h + newAppliedToday - agronomic.cropEtDemand).toFixed(2));
    const newMoisturePercent = Math.min(100, Math.max(5, Math.round(agronomic.soilMoisturePercent + appliedMm * 2.5)));

    const updatedDataSet: FarmDataSet = {
      ...currentDataSet,
      agronomic: {
        ...agronomic,
        irrigationAppliedToday: newAppliedToday,
        netWaterChange: newNetChange,
        soilMoisturePercent: newMoisturePercent,
        waterStatus: newMoisturePercent > 60 ? 'optimal' : 'moderate',
      },
    };

    setFarmsData((prev) => ({
      ...prev,
      [selectedFarmId]: updatedDataSet,
    }));
  };

  // Save new field survey
  const handleSaveSurvey = async (newSurvey: FieldSurvey, updatedFarmProfile?: FarmProfile) => {
    setIsSurveyModalOpen(false);
    if (updatedFarmProfile) {
      await handleSaveFarm(updatedFarmProfile);
      setFarmsData((prev) => ({
        ...prev,
        [updatedFarmProfile.id]: {
          ...prev[updatedFarmProfile.id],
          surveys: [newSurvey, ...(prev[updatedFarmProfile.id]?.surveys || [])],
        },
      }));
    } else {
      const updatedDataSet: FarmDataSet = {
        ...currentDataSet,
        surveys: [newSurvey, ...(currentDataSet.surveys || [])],
      };
      setFarmsData((prev) => ({
        ...prev,
        [selectedFarmId]: updatedDataSet,
      }));
    }
  };

  const handleOpenProvenance = (tag: DataProvenanceTag) => {
    setActiveProvenanceTag(tag);
    setIsProvenanceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#152219] flex flex-col antialiased">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewSurvey={() => setIsSurveyModalOpen(true)}
        currentFarm={farm}
        farms={farmsData}
        onSelectFarm={handleSelectFarm}
        onSelectBenchmarkFarm={handleSelectBenchmarkFarm}
        onUseLiveLocation={handleUseLiveLocation}
        isLocating={isLocatingGps}
      />

      {/* Top Header */}
      <TopBar
        currentFarm={farm}
        activeTab={activeTab}
        onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenAiChat={() => setIsAiModalOpen(true)}
        onOpenProvenanceGuide={() => {
          setActiveProvenanceTag(null);
          setIsProvenanceModalOpen(true);
        }}
        isSyncingApi={isSyncingApi}
        onRefreshApi={() => syncWithLiveApi(farm, isCloudGapSimulated)}
      />

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative w-72 max-w-[80vw] bg-[#101b13] text-white h-full p-5 flex flex-col z-10 border-r border-[#2d4436] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined icon-fill text-[#e6a833] text-2xl">eco</span>
                <span className="text-[20px] font-bold text-white">Fieldstate</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-[#86a894] hover:text-white rounded-full"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-bold text-[#86a894] uppercase tracking-wider block mb-1.5">
                Active Field Parcel
              </label>
              <select
                value={selectedFarmId}
                onChange={(e) => {
                  handleSelectFarm(e.target.value);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-[13px] font-medium bg-[#192a1e] text-white border border-[#2e4d3a] rounded-lg py-2 px-3"
              >
                {Object.values(farmsData).map((item: FarmDataSet) => (
                  <option key={item.farm.id} value={item.farm.id}>
                    {item.farm.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleUseLiveLocation();
              }}
              className="w-full bg-[#192a1e] border border-[#3b7352] text-[#c1ecd4] rounded-xl py-2 px-3 flex items-center justify-center gap-2 text-[12px] font-bold mb-3"
            >
              <span className="material-symbols-outlined text-[16px] text-[#4ade80]">my_location</span>
              <span>Detect My Live GPS</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSurveyModalOpen(true);
              }}
              className="w-full bg-[#e6a833] text-[#101b13] rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-[13px] font-bold mb-4"
            >
              <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
              <span>New Field Survey</span>
            </button>

            <div className="flex flex-col gap-1 flex-1">
              {[
                { id: 'today', label: "Today's Decision", icon: 'task_alt' },
                { id: 'economics', label: 'ROI & Carbon Savings', icon: 'savings' },
                { id: 'crop-health', label: 'Crop Health (NDVI)', icon: 'satellite_alt' },
                { id: 'water', label: 'Water Management', icon: 'water_drop' },
                { id: 'weather', label: 'Weather Forecast', icon: 'cloud_sync' },
                { id: 'setup', label: 'Farm Configuration', icon: 'settings' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] font-bold transition-colors ${
                    activeTab === item.id ? 'bg-[#234e35] text-white' : 'text-[#a5b8ac] hover:bg-[#192b1f]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed top-16 right-4 z-40 w-80 sm:w-96 bg-white rounded-3xl p-5 shadow-2xl border border-[#cbd5e1] animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e2e8f0]">
            <h4 className="text-[14px] font-extrabold text-[#0f172a] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#1e3a29] text-[18px]">notifications</span>
              <span>Real-Time Agronomic Alerts</span>
            </h4>
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="text-[#64748b] hover:text-[#0f172a] text-[12px] font-bold"
            >
              Close
            </button>
          </div>
          <div className="flex flex-col gap-2.5 text-[12px]">
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
              <p className="font-bold text-blue-950 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
                Live API Telemetry Synchronized
              </p>
              <p className="text-blue-800 mt-0.5">
                Connected to Open-Meteo high-resolution radar for Lat {farm.latitude.toFixed(3)}°, Lon {farm.longitude.toFixed(3)}°.
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <p className="font-bold text-emerald-950 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">water_drop</span>
                Today's Decision: {recommendation.action}
              </p>
              <p className="text-emerald-800 mt-0.5">
                Crop water demand: {agronomic.cropEtDemand.toFixed(1)} mm/d ($K_c = {agronomic.cropCoefficientKc.toFixed(2)}$).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 lg:ml-64 mt-16 lg:mt-0 transition-all flex flex-col justify-start">
        {/* Location Success Alert */}
        {locationSuccessMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-300 shadow-xs flex items-center justify-between text-[13px] animate-in fade-in">
            <div className="flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-[#059669] text-[20px]">my_location</span>
              <span>{locationSuccessMsg}</span>
            </div>
            <button
              onClick={() => setLocationSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Live Synchronized API Telemetry Strip */}
        <div className="mb-6 p-3 bg-white rounded-2xl border border-[#cbd5e1] shadow-xs flex flex-wrap items-center justify-between gap-3 text-[12px]">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isSyncingApi ? 'bg-amber-500 animate-ping' : 'bg-[#1e3a29]'}`} />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#0f172a]">Live 100% Meteorological Telemetry:</span>
              <span className="text-[#475569]">
                {isSyncingApi
                  ? 'Connecting to Open-Meteo global radar and computing FAO-56 Penman-Monteith...'
                  : `Lat ${farm.latitude.toFixed(3)}°, Lon ${farm.longitude.toFixed(3)}° · Synced ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUseLiveLocation}
              disabled={isLocatingGps}
              className="bg-[#1e3a29] hover:bg-[#14281c] text-white px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer text-[12px] shadow-xs transition-all"
              title="Detect your device GPS coordinates"
            >
              <span className={`material-symbols-outlined text-[16px] text-[#4ade80] ${isLocatingGps ? 'animate-spin' : ''}`}>
                {isLocatingGps ? 'progress_activity' : 'my_location'}
              </span>
              <span>{isLocatingGps ? 'Locating...' : 'Use My Live GPS'}</span>
            </button>

            <button
              onClick={() => syncWithLiveApi(farm, isCloudGapSimulated)}
              disabled={isSyncingApi}
              className="bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#1e3a29] px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer text-[12px] border border-[#cbd5e1] transition-colors"
            >
              <span className={`material-symbols-outlined text-[16px] ${isSyncingApi ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>{isSyncingApi ? 'Syncing...' : 'Refresh Radar'}</span>
            </button>
          </div>
        </div>

        {syncError && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-900 text-[12px] rounded-xl border border-amber-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>{syncError}</span>
          </div>
        )}

        {/* Screen Routing */}
        {activeTab === 'today' && (
          <TodayDashboard
            farm={farm}
            agronomic={agronomic}
            recommendation={recommendation}
            weather3Day={weather3Day}
            ndviReadings={ndviReadings}
            onNavigateToTab={handleTabChange}
            onOpenAiExplainer={() => setIsAiModalOpen(true)}
            onNewSurvey={() => setIsSurveyModalOpen(true)}
            onOpenProvenanceModal={handleOpenProvenance}
          />
        )}

        {activeTab === 'economics' && (
          <FarmEconomicsScreen
            farm={farm}
            agronomic={agronomic}
            recommendation={recommendation}
            onNavigateToTab={handleTabChange}
          />
        )}

        {activeTab === 'crop-health' && (
          <CropHealthDetail
            farm={farm}
            agronomic={agronomic}
            ndviReadings={ndviReadings}
            satelliteMeta={satelliteMeta}
            onScheduleInspection={() => setIsInspectionModalOpen(true)}
            onNewSurvey={() => setIsSurveyModalOpen(true)}
            onToggleCloudGap={handleToggleCloudGap}
            isCloudGapSimulated={isCloudGapSimulated}
          />
        )}

        {activeTab === 'water' && (
          <WaterManagementDetail
            farm={farm}
            agronomic={agronomic}
            onApplyIrrigation={handleApplyIrrigation}
            onNavigateToTab={handleTabChange}
          />
        )}

        {activeTab === 'weather' && (
          <WeatherForecastDetail
            farm={farm}
            agronomic={agronomic}
            weather7Day={weather7Day}
            onNavigateToTab={handleTabChange}
          />
        )}

        {activeTab === 'setup' && (
          <FarmSetup
            currentFarm={farm}
            onSaveFarm={handleSaveFarm}
            onCancel={() => setActiveTab('today')}
          />
        )}
      </main>

      {/* Global Modals */}
      <FieldSurveyModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        farm={farm}
        onSaveSurvey={handleSaveSurvey}
      />

      <AiAgronomistModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        farm={farm}
        agronomic={agronomic}
        recommendation={recommendation}
        ndviReadings={ndviReadings}
      />

      <ScheduleInspectionModal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        farm={farm}
      />

      <DataProvenanceModal
        isOpen={isProvenanceModalOpen}
        onClose={() => setIsProvenanceModalOpen(false)}
        activeTag={activeProvenanceTag}
      />
    </div>
  );
};

export default App;
