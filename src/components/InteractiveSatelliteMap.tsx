import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface InteractiveSatelliteMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
  areaHectares: number;
  onCoordinatesChanged: (lat: number, lon: number) => void;
  onAreaChanged?: (newAreaHectares: number) => void;
}

export const InteractiveSatelliteMap: React.FC<InteractiveSatelliteMapProps> = ({
  latitude,
  longitude,
  locationName,
  areaHectares,
  onCoordinatesChanged,
  onAreaChanged,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);

  // 1 ha = 10,000 m^2. Calculate polygon boundaries around latitude/longitude
  const getPolygonCoords = (lat: number, lon: number, hectares: number): [number, number][] => {
    const sideMeters = Math.sqrt(Math.max(0.1, hectares) * 10000);
    const deltaLat = (sideMeters / 111000) / 2;
    const deltaLon = (sideMeters / (111000 * Math.cos((lat * Math.PI) / 180))) / 2;
    return [
      [lat + deltaLat, lon - deltaLon],
      [lat + deltaLat * 1.04, lon + deltaLon],
      [lat - deltaLat * 0.96, lon + deltaLon * 1.05],
      [lat - deltaLat, lon - deltaLon * 0.94],
    ];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      // Real Satellite Imagery from ESRI ArcGIS
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Tiles &copy; Esri',
        }
      ).addTo(map);

      // Custom Marker Pin
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: #1e3a29;
            color: #e6a833;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            transform: translate(-50%, -50%);
          ">
            <span style="font-family: 'Material Symbols Outlined'; font-size: 20px;">agriculture</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([latitude, longitude], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup(`<b>${locationName || 'Field Parcel'}</b><br>Area: ${areaHectares} ha<br>Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        onCoordinatesChanged(Number(newPos.lat.toFixed(4)), Number(newPos.lng.toFixed(4)));
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        marker.setPopupContent(`<b>Selected Parcel</b><br>Area: ${areaHectares} ha<br>Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`);
        onCoordinatesChanged(Number(lat.toFixed(4)), Number(lng.toFixed(4)));
      });

      const polygonCoords = getPolygonCoords(latitude, longitude, areaHectares);
      const polygon = L.polygon(polygonCoords, {
        color: '#e6a833',
        fillColor: '#22c55e',
        fillOpacity: 0.35,
        weight: 2.5,
        dashArray: '5, 5',
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      polygonRef.current = polygon;
    } else {
      const map = mapInstanceRef.current;
      map.setView([latitude, longitude], map.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
        markerRef.current.setPopupContent(`<b>${locationName || 'Field Parcel'}</b><br>Area: ${areaHectares} ha<br>Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
      }
      if (polygonRef.current) {
        const updatedCoords = getPolygonCoords(latitude, longitude, areaHectares);
        polygonRef.current.setLatLngs(updatedCoords);
      }
    }
  }, [latitude, longitude, locationName, areaHectares]);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Area & Coordinate Controls */}
      <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#cbd5e1] flex flex-wrap items-center justify-between gap-2.5 text-[12px]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1e3a29] text-[18px]">crop_free</span>
          <span className="font-bold text-[#1e293b]">Field Parcel Area:</span>
          <span className="bg-white px-2 py-0.5 rounded font-mono font-bold text-[#1e3a29] border border-[#cbd5e1]">
            {areaHectares} ha ({(areaHectares * 2.471).toFixed(1)} acres)
          </span>
        </div>
        {onAreaChanged && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#64748b] uppercase font-semibold">Scale:</span>
            <button
              type="button"
              onClick={() => onAreaChanged(Math.max(0.2, Number((areaHectares - 0.5).toFixed(1))))}
              className="w-6 h-6 bg-white hover:bg-[#e2e8f0] text-[#1e293b] font-bold rounded border border-[#cbd5e1] flex items-center justify-center cursor-pointer shadow-xs"
            >
              -
            </button>
            <input
              type="range"
              min="0.2"
              max="50"
              step="0.5"
              value={areaHectares}
              onChange={(e) => onAreaChanged(parseFloat(e.target.value))}
              className="w-24 sm:w-32 accent-[#1e3a29] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => onAreaChanged(Number((areaHectares + 0.5).toFixed(1)))}
              className="w-6 h-6 bg-white hover:bg-[#e2e8f0] text-[#1e293b] font-bold rounded border border-[#cbd5e1] flex items-center justify-center cursor-pointer shadow-xs"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Map View */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#cbd5e1] shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Map Overlay Badge */}
        <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#1e3a29] shadow-sm flex items-center gap-1.5 border border-[#cbd5e1] pointer-events-none">
          <span className="material-symbols-outlined text-[15px]">touch_app</span>
          <span>Click anywhere or drag pin to relocate</span>
        </div>

        {/* Satellite Indicator */}
        <div className="absolute bottom-3 left-3 z-20 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-medium text-white shadow-md flex items-center gap-2 pointer-events-none">
          <span className="material-symbols-outlined text-[15px] text-[#e6a833]">satellite_alt</span>
          <span>ESRI World Imagery · Lat {latitude.toFixed(4)}°, Lon {longitude.toFixed(4)}°</span>
        </div>
      </div>
    </div>
  );
};
