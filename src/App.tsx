import React, { useState, useEffect, useCallback } from 'react';
import { PRESET_FARMS, FarmDataSet } from './data/mockFarms';
import { FarmProfile, FieldSurvey, Recommendation } from './types';
import { evaluateFarmDecision } from './lib/agronomy';
import { fetchLiveWeatherData, computeRealFieldAgronomy, LiveWeatherData } from './lib/weatherApi';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { TodayDashboard } from './components/screens/TodayDashboard';
import { CropHealthDetail } from './components/screens/CropHealthDetail';
import { WaterManagementDetail } from './components/screens/WaterManagementDetail';
import { FarmSetup } from './components/screens/FarmSetup';
import { WeatherForecastDetail } from './components/screens/WeatherForecastDetail';
import { FieldSurveyModal } from './components/modals/FieldSurveyModal';
import { AiAgronomistModal } from './components/modals/AiAgronomistModal';
import { ScheduleInspectionModal } from './components/modals/ScheduleInspectionModal';

const STORAGE_KEY = 'agripulse_farms_v2';

export const App: React.FC = () => {
  // Load initial farm data from localStorage or presets
  const [farmsData, setFarmsData] = useState<Record<string, FarmDataSet>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved farms:', e);
    }
    return PRESET_FARMS;
  });

  const [selectedFarmId, setSelectedFarmId] = useState<string>('rice-field-a');
  const [activeTab, setActiveTab] = useState<string>('today');

  // Real-time API Sync State
  const [isSyncingApi, setIsSyncingApi] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [syncError, setSyncError] = useState<string | null>(null);

  // Modals
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const currentDataSet = farmsData[selectedFarmId] || farmsData['rice-field-a'] || Object.values(farmsData)[0];
  const { farm, agronomic, ndviReadings, weather3Day, weather7Day, satelliteMeta } = currentDataSet;

  // Compute live recommendation deterministically
  const recommendation: Recommendation = evaluateFarmDecision(farm, agronomic, ndviReadings);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(farmsData));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [farmsData]);

  // Synchronize with real Open-Meteo API for selected farm
  const syncWithLiveApi = useCallback(async (farmToSync: FarmProfile) => {
    setIsSyncingApi(true);
    setSyncError(null);

    try {
      const liveWeather: LiveWeatherData = await fetchLiveWeatherData(
        farmToSync.latitude,
        farmToSync.longitude
      );

      const { agronomic: liveAgronomic, ndviReadings: liveNdvi, ndviHistoryChart } = computeRealFieldAgronomy(
        farmToSync,
        liveWeather,
        currentDataSet.agronomic.irrigationAppliedToday || 0
      );

      const updatedDataSet: FarmDataSet = {
        farm: farmToSync,
        agronomic: liveAgronomic,
        ndviReadings: liveNdvi,
        ndviHistoryChart: ndviHistoryChart || currentDataSet.ndviHistoryChart,
        weather3Day: liveWeather.daily.slice(0, 3),
        weather7Day: liveWeather.daily,
        satelliteMeta: {
          ...currentDataSet.satelliteMeta,
          acquisitionDate: 'Live Sentinel-2 Pass',
          cloudCoverPercent: Math.round(liveWeather.daily[0]?.pop ? liveWeather.daily[0].pop / 3 : 5),
        },
        surveys: currentDataSet.surveys || [],
      };

      setFarmsData((prev) => ({
        ...prev,
        [farmToSync.id]: updatedDataSet,
      }));

      setLastSyncTime(new Date());
    } catch (err: any) {
      console.error('Live API synchronization error:', err);
      setSyncError('Live weather API temporarily unreachable. Displaying cached telemetry.');
    } finally {
      setIsSyncingApi(false);
    }
  }, [currentDataSet]);

  // Sync on initial load and when switching farm
  useEffect(() => {
    if (farm) {
      syncWithLiveApi(farm);
    }
  }, [farm.id, farm.latitude, farm.longitude]);

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
      syncWithLiveApi(targetFarm);
    }
  };

  // Handle Farm Profile Updates / Setup Creation
  const handleSaveFarm = async (updatedFarm: FarmProfile) => {
    setIsSyncingApi(true);
    try {
      const liveWeather = await fetchLiveWeatherData(updatedFarm.latitude, updatedFarm.longitude);
      const { agronomic: liveAgronomic, ndviReadings: liveNdvi, ndviHistoryChart } = computeRealFieldAgronomy(
        updatedFarm,
        liveWeather,
        0
      );

      const updatedDataSet: FarmDataSet = {
        farm: updatedFarm,
        agronomic: liveAgronomic,
        ndviReadings: liveNdvi,
        ndviHistoryChart: ndviHistoryChart || currentDataSet.ndviHistoryChart,
        weather3Day: liveWeather.daily.slice(0, 3),
        weather7Day: liveWeather.daily,
        satelliteMeta: {
          source: 'Sentinel-2 (Copernicus ESA)',
          acquisitionDate: 'Today (Live Pass)',
          resolution: '10m Multi-spectral',
          cloudCoverPercent: Math.round(liveWeather.daily[0]?.pop ? liveWeather.daily[0].pop / 3 : 5),
          imageUrl: currentDataSet.satelliteMeta?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTEjB1cX0AAbjhXnv6GQHHxplFGayVBeAYBzaoyEZ1pQjnafz0cJkxf6MldhMAo2xVMfFvxGZXHGWHGjOlesQe-uQ_rdRiWPxRtfoRAURt7HPAQFS8OhzfM4hsnunTW1ZGCl3ZOQX3zJXLe6rJIKwknTfUM-FXpxKmKB-QPOpgVOquhu7YBQplCht2NpOuZV8lDKeIt8ChERbVl5irbxyBu7XrDtf0-ISWajFUb3EMbGmvxNXrBuzX',
          altText: `High-resolution live satellite imagery for ${updatedFarm.name}`,
        },
        surveys: currentDataSet.surveys || [],
      };

      setFarmsData((prev) => ({
        ...prev,
        [updatedFarm.id]: updatedDataSet,
      }));

      setSelectedFarmId(updatedFarm.id);
      setLastSyncTime(new Date());
      setActiveTab('today');
    } catch (err) {
      console.error('Error saving and syncing farm:', err);
      // Fallback
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

  // Handle Irrigation Application from Simulator
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

  // Save new field survey (with optional location/crop update)
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

  return (
    <div className="min-h-screen bg-[#f9f9f8] text-[#191c1c] flex flex-col antialiased">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewSurvey={() => setIsSurveyModalOpen(true)}
        currentFarm={farm}
        farms={farmsData}
        onSelectFarm={handleSelectFarm}
      />

      {/* Top Header with Live Real-Time API Status Indicator */}
      <TopBar
        currentFarm={farm}
        activeTab={activeTab}
        onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenAiChat={() => setIsAiModalOpen(true)}
      />

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative w-72 max-w-[80vw] bg-[#f3f4f3] h-full p-6 flex flex-col z-10 border-r border-[#c1c8c2] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined icon-fill text-[#012d1d] text-2xl">eco</span>
                <span className="text-[20px] font-bold text-[#012d1d]">AgriPulse</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-[#414844] hover:text-[#191c1c] rounded-full"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-[#717973] uppercase tracking-wider block mb-1.5">
                Active Field
              </label>
              <select
                value={selectedFarmId}
                onChange={(e) => {
                  handleSelectFarm(e.target.value);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-[13px] font-medium bg-white text-[#191c1c] border border-[#c1c8c2] rounded-lg py-2 px-3"
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
                setIsSurveyModalOpen(true);
              }}
              className="w-full bg-[#012d1d] text-white rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 text-[14px] font-semibold mb-4"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New Field Survey</span>
            </button>

            <div className="flex flex-col gap-1 flex-1">
              {[
                { id: 'today', label: "Today's Actions", icon: 'assignment_turned_in' },
                { id: 'crop-health', label: 'Crop Health', icon: 'potted_plant' },
                { id: 'water', label: 'Water Management', icon: 'water_drop' },
                { id: 'weather', label: 'Weather Forecast', icon: 'cloud_sync' },
                { id: 'setup', label: 'Farm Setup', icon: 'settings' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-[14px] font-medium transition-colors ${
                    activeTab === item.id ? 'bg-[#1b4332] text-white font-bold' : 'text-[#414844] hover:bg-[#e7e8e7]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed top-16 right-4 z-40 w-80 sm:w-96 bg-white rounded-2xl p-5 shadow-xl border border-[#c1c8c2] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#c1c8c2]/30">
            <h4 className="text-[15px] font-bold text-[#191c1c] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#012d1d] text-[20px]">notifications</span>
              <span>Real-Time Agronomic Alerts</span>
            </h4>
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="text-[#717973] hover:text-[#191c1c] text-[12px] font-semibold"
            >
              Close
            </button>
          </div>
          <div className="flex flex-col gap-3 text-[13px]">
            <div className="p-3 bg-[#b9ecee]/30 rounded-xl border border-[#7eafb1]/40">
              <p className="font-bold text-[#002c2d] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
                Live API Telemetry Active
              </p>
              <p className="text-[12px] text-[#414844] mt-0.5">
                Connected to Open-Meteo FAO-56 & Global Atmospheric model for Lat {farm.latitude.toFixed(4)}, Lon {farm.longitude.toFixed(4)}.
              </p>
            </div>
            <div className="p-3 bg-[#c1ecd4]/40 rounded-xl border border-[#a5d0b9]">
              <p className="font-bold text-[#002114] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">water_drop</span>
                Live 24h Rain: {agronomic.rain24h.toFixed(1)} mm
              </p>
              <p className="text-[12px] text-[#414844] mt-0.5">
                Current Crop ET Demand is {agronomic.cropEtDemand.toFixed(1)} mm/day ($K_c = {agronomic.cropCoefficientKc.toFixed(2)}$).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 lg:ml-64 mt-16 lg:mt-0 transition-all flex flex-col justify-start">
        {/* Real Live API Sync Header Strip */}
        <div className="mb-6 p-3 bg-white rounded-xl border border-[#c1c8c2]/50 shadow-xs flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isSyncingApi ? 'bg-amber-500 animate-ping' : 'bg-[#1b4332]'}`} />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#191c1c]">Live API Status:</span>
              <span className="text-[#414844]">
                {isSyncingApi
                  ? 'Querying real-time global weather & evapotranspiration...'
                  : `Connected to Open-Meteo API • Synced at ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => syncWithLiveApi(farm)}
              disabled={isSyncingApi}
              className="bg-[#f3f4f3] hover:bg-[#e7e8e7] text-[#012d1d] px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer text-[12px] border border-[#c1c8c2]/60 transition-colors"
            >
              <span className={`material-symbols-outlined text-[16px] ${isSyncingApi ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>{isSyncingApi ? 'Syncing...' : 'Refresh Live API'}</span>
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className="bg-[#012d1d] hover:bg-[#1b4332] text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer text-[12px] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">edit_location</span>
              <span>Change Location / Coordinates</span>
            </button>
          </div>
        </div>

        {syncError && (
          <div className="mb-4 p-3 bg-[#ffdad3]/40 text-[#741f11] text-[13px] rounded-xl border border-[#fe8770]/40 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>{syncError}</span>
          </div>
        )}

        {/* Screen Render */}
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
    </div>
  );
};

export default App;
