import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

  // Calculate polygon delta based on actual field area (1 ha = 10,000 m^2)
  // 1 degree latitude ~ 111,000 meters
  const getPolygonCoords = (lat: number, lon: number, hectares: number): [number, number][] => {
    const sideMeters = Math.sqrt(Math.max(0.1, hectares) * 10000);
    const deltaLat = (sideMeters / 111000) / 2;
    const deltaLon = (sideMeters / (111000 * Math.cos((lat * Math.PI) / 180))) / 2;

    return [
      [lat + deltaLat, lon - deltaLon],
      [lat + deltaLat * 1.05, lon + deltaLon],
      [lat - deltaLat * 0.95, lon + deltaLon * 1.08],
      [lat - deltaLat, lon - deltaLon * 0.92],
    ];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      // Add ESRI World Imagery Satellite Layer (Live real-time satellite tiles)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Tiles &copy; Esri',
        }
      ).addTo(map);

      // Custom Pin Icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: #012d1d;
            color: #ffffff;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.45);
            transform: translate(-50%, -50%);
          ">
            <span style="font-family: 'Material Symbols Outlined'; font-size: 22px;">agriculture</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([latitude, longitude], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup(`<b>${locationName || 'Field Parcel'}</b><br>Size: ${areaHectares} ha<br>Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);

      marker.on('dragend', (e) => {
        const newPos = e.target.getLatLng();
        onCoordinatesChanged(Number(newPos.lat.toFixed(4)), Number(newPos.lng.toFixed(4)));
      });

      // Click on map to place pin & recalculate
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        marker.setPopupContent(`<b>Selected Field Pin</b><br>Size: ${areaHectares} ha<br>Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`);
        onCoordinatesChanged(Number(lat.toFixed(4)), Number(lng.toFixed(4)));
      });

      // Dynamic parcel polygon with area scaling
      const polygonCoords = getPolygonCoords(latitude, longitude, areaHectares);
      const polygon = L.polygon(polygonCoords, {
        color: '#012d1d',
        fillColor: '#c1ecd4',
        fillOpacity: 0.4,
        weight: 2.5,
        dashArray: '6, 4',
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      polygonRef.current = polygon;
    } else {
      const map = mapInstanceRef.current;
      map.setView([latitude, longitude], map.getZoom());

      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
        markerRef.current.setPopupContent(`<b>${locationName || 'Field Parcel'}</b><br>Size: ${areaHectares} ha<br>Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
      }

      if (polygonRef.current) {
        const updatedCoords = getPolygonCoords(latitude, longitude, areaHectares);
        polygonRef.current.setLatLngs(updatedCoords);
      }
    }
  }, [latitude, longitude, locationName, areaHectares]);

  return (
    <div className="flex flex-col gap-2">
      {/* Field Size Scaler Toolbar */}
      <div className="bg-[#f3f4f3] p-3 rounded-xl border border-[#c1c8c2]/50 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#012d1d] text-[20px]">crop_free</span>
          <span className="font-bold text-[#191c1c]">Field Boundary Area:</span>
          <span className="bg-white px-2.5 py-0.5 rounded-md font-mono font-bold text-[#012d1d] border border-[#c1c8c2]/40">
            {areaHectares} ha ({Math.round(areaHectares * 2.47105)} acres)
          </span>
        </div>

        {onAreaChanged && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#717973] uppercase font-semibold">Resize:</span>
            <button
              type="button"
              onClick={() => onAreaChanged(Math.max(0.2, Number((areaHectares - 0.5).toFixed(1))))}
              className="w-7 h-7 bg-white hover:bg-[#e7e8e7] text-[#191c1c] font-bold rounded-lg border border-[#c1c8c2] flex items-center justify-center cursor-pointer shadow-xs"
              title="Decrease field size"
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
              className="w-24 sm:w-36 accent-[#012d1d] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => onAreaChanged(Number((areaHectares + 0.5).toFixed(1)))}
              className="w-7 h-7 bg-white hover:bg-[#e7e8e7] text-[#191c1c] font-bold rounded-lg border border-[#c1c8c2] flex items-center justify-center cursor-pointer shadow-xs"
              title="Increase field size"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#c1c8c2] shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Control Overlay Hint */}
        <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#012d1d] shadow-sm flex items-center gap-1.5 border border-[#c1c8c2]/50 pointer-events-none">
          <span className="material-symbols-outlined text-[16px]">touch_app</span>
          <span>Click anywhere or drag pin to move parcel</span>
        </div>

        {/* Live Satellite Pill */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#191c1c] shadow-sm flex items-center gap-2 border border-[#c1c8c2]/50 pointer-events-none">
          <span className="material-symbols-outlined text-[16px] text-[#012d1d]">satellite_alt</span>
          <span>
            ESRI Live Satellite • {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° W ({areaHectares} ha)
          </span>
        </div>
      </div>
    </div>
  );
};
