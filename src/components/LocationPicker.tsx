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

  // Quick Agricultural Presets
  const agriculturalPresets = [
    { name: 'California Central Valley (Fresno)', lat: 36.7468, lon: -119.7726 },
    { name: 'Kansas Wheat Belt (Salina)', lat: 38.8403, lon: -97.6114 },
    { name: 'Assam Valley Paddy (Guwahati)', lat: 26.1445, lon: 91.7362 },
    { name: 'Iowa Corn Belt (Des Moines)', lat: 41.5868, lon: -93.625 },
    { name: 'Po Valley Vineyard (Bologna, Italy)', lat: 44.4949, lon: 11.3426 },
    { name: 'Mendoza Wine Region (Argentina)', lat: -32.8895, lon: -68.8458 },
  ];

  // Debounced search
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
        setGpsError(`Unable to retrieve GPS: ${err.message}. Select from map or search.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar & Auto-locate */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            placeholder="Search any global city, county, or agricultural basin..."
            className="w-full bg-[#f9f9f8] border border-[#c1c8c2] rounded-xl pl-10 pr-10 py-2.5 text-[14px] text-[#191c1c] focus:outline-none focus:border-[#012d1d] focus:ring-1 focus:ring-[#012d1d] shadow-xs"
          />
          {isSearching ? (
            <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#012d1d] text-[18px] animate-spin">
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#191c1c]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : null}

          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#c1c8c2] rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
              {searchResults.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleSelectResult(res)}
                  className="w-full text-left px-4 py-3 hover:bg-[#f3f4f3] flex items-center justify-between border-b border-[#c1c8c2]/20 last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#012d1d] text-[18px]">location_on</span>
                    <div>
                      <p className="text-[13px] font-bold text-[#191c1c]">
                        {res.name}
                        {res.admin1 ? `, ${res.admin1}` : ''}
                      </p>
                      <p className="text-[11px] text-[#717973]">{res.country || 'Region'}</p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-[#717973] font-mono">
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
          className="bg-white border border-[#c1c8c2] hover:bg-[#f3f4f3] text-[#012d1d] px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <span className={`material-symbols-outlined text-[18px] ${isLocating ? 'animate-spin' : ''}`}>
            {isLocating ? 'progress_activity' : 'my_location'}
          </span>
          <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
        </button>
      </div>

      {gpsError && (
        <div className="text-[12px] text-[#a03f2e] bg-[#ffdad3]/40 p-2.5 rounded-lg border border-[#fe8770]/40 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>{gpsError}</span>
        </div>
      )}

      {/* Quick Global Agricultural Region Pills */}
      <div>
        <label className="text-[11px] font-semibold text-[#717973] uppercase tracking-wider block mb-2">
          Quick Agricultural Basins
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
              className={`text-[12px] px-3 py-1 rounded-full border transition-all cursor-pointer ${
                Math.abs(latitude - preset.lat) < 0.1 && Math.abs(longitude - preset.lon) < 0.1
                  ? 'bg-[#012d1d] text-white border-[#012d1d] font-bold shadow-xs'
                  : 'bg-white text-[#414844] border-[#c1c8c2] hover:bg-[#f3f4f3]'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Coordinate Display & Active Zone Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f3f4f3] p-3 rounded-xl border border-[#c1c8c2]/40 text-[13px]">
        <div className="flex items-center gap-2 text-[#191c1c]">
          <span className="material-symbols-outlined text-[#012d1d] text-[20px]">explore</span>
          <span>
            Coordinates: <strong>{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° W</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#002114] bg-[#c1ecd4] px-2.5 py-1 rounded-md">
          <span className="material-symbols-outlined text-[16px]">eco</span>
          <span>{hardinessZone}</span>
        </div>
      </div>
    </div>
  );
};
