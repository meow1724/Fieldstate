import React, { useState, useEffect, useRef } from 'react';
import { searchLocations, LocationSearchResult, estimateHardinessZone } from '../lib/weatherApi';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  locationName: string;
  hardinessZone: string;
  onLocationSelected: (lat: number, lon: number, name: string, zone: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  locationName,
  hardinessZone,
  onLocationSelected,
}) => {
  const [searchQuery, setSearchQuery] = useState(locationName || '');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const debounceTimerRef = useRef<any>(null);

  const agriculturalPresets = [
    { name: 'Assam Brahmaputra Valley (Guwahati)', lat: 26.1445, lon: 91.7362 },
    { name: 'Kansas Wheat Belt (Salina)', lat: 38.8403, lon: -97.6114 },
    { name: 'California Central Valley (Fresno)', lat: 36.7468, lon: -119.7726 },
    { name: 'Iowa Corn Basin (Des Moines)', lat: 41.5868, lon: -93.625 },
    { name: 'Po Valley Vineyard (Bologna, Italy)', lat: 44.4949, lon: 11.3426 },
    { name: 'Mendoza Wine Valley (Argentina)', lat: -32.8895, lon: -68.8458 },
  ];

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error('Geocoding search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  const handleSelectResult = (result: LocationSearchResult) => {
    const fullName = `${result.name}${result.admin1 ? `, ${result.admin1}` : ''}, ${result.country || ''}`;
    const zone = estimateHardinessZone(result.latitude);
    setSearchQuery(fullName);
    setShowDropdown(false);
    onLocationSelected(result.latitude, result.longitude, fullName, zone);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        const zone = estimateHardinessZone(lat);
        const name = `Local Field (Lat ${lat}, Lon ${lon})`;
        setSearchQuery(name);
        setIsLocating(false);
        onLocationSelected(lat, lon, name, zone);
      },
      (err) => {
        setIsLocating(false);
        setGpsError(`GPS access error: ${err.message}. Please search or select from presets.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Search Bar & Auto-locate */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            placeholder="Search any global farm, county, or coordinates..."
            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-[#1e293b] focus:outline-none focus:border-[#1e3a29] focus:ring-1 focus:ring-[#1e3a29] shadow-xs font-medium"
          />
          {isSearching ? (
            <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1e3a29] text-[18px] animate-spin">
              progress_activity
            </span>
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowDropdown(false);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#334155]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : null}

          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#cbd5e1] rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
              {searchResults.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleSelectResult(res)}
                  className="w-full text-left px-4 py-3 hover:bg-[#f1f5f9] flex items-center justify-between border-b border-[#f1f5f9] last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#1e3a29] text-[18px]">location_on</span>
                    <div>
                      <p className="text-[13px] font-bold text-[#0f172a]">
                        {res.name}
                        {res.admin1 ? `, ${res.admin1}` : ''}
                      </p>
                      <p className="text-[11px] text-[#64748b]">{res.country || 'Region'}</p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-[#64748b] font-mono">
                    {res.latitude}°, {res.longitude}°
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] text-[#1e3a29] px-4 py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <span className={`material-symbols-outlined text-[17px] ${isLocating ? 'animate-spin' : ''}`}>
            {isLocating ? 'progress_activity' : 'my_location'}
          </span>
          <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
        </button>
      </div>

      {gpsError && (
        <div className="text-[12px] text-[#b91c1c] bg-[#fee2e2] p-2.5 rounded-lg border border-[#fca5a5] flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{gpsError}</span>
        </div>
      )}

      {/* Preset Pills */}
      <div>
        <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-1.5">
          Agricultural Benchmark Basins
        </label>
        <div className="flex flex-wrap gap-1.5">
          {agriculturalPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const zone = estimateHardinessZone(preset.lat);
                setSearchQuery(preset.name);
                onLocationSelected(preset.lat, preset.lon, preset.name, zone);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                Math.abs(latitude - preset.lat) < 0.1 && Math.abs(longitude - preset.lon) < 0.1
                  ? 'bg-[#1e3a29] text-white border-[#1e3a29] font-bold shadow-xs'
                  : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Coordinates Display */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#f1f5f9] p-2.5 rounded-xl border border-[#e2e8f0] text-[12px]">
        <div className="flex items-center gap-2 text-[#334155]">
          <span className="material-symbols-outlined text-[#1e3a29] text-[18px]">explore</span>
          <span>
            Lat: <strong>{latitude.toFixed(4)}° N</strong>, Lon: <strong>{longitude.toFixed(4)}° E</strong>
          </span>
        </div>
        <div className="flex items-center gap-1 font-bold text-[#065f46] bg-[#d1fae5] px-2 py-0.5 rounded">
          <span className="material-symbols-outlined text-[14px]">eco</span>
          <span>{hardinessZone}</span>
        </div>
      </div>
    </div>
  );
};
