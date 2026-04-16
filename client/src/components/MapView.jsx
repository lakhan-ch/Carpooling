import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths (Vite/Webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 1) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

/**
 * MapView — renders an interactive Leaflet map with pickup/drop markers.
 * @param {number[]} pickup - [lat, lng]
 * @param {number[]} drop   - [lat, lng]
 * @param {string}   pickupLabel
 * @param {string}   dropLabel
 * @param {string}   height - CSS height class or string
 */
export default function MapView({ pickup, drop, pickupLabel, dropLabel, height = 'h-72' }) {
  const center = pickup || [20.5937, 78.9629]; // India center fallback

  const positions = [pickup, drop].filter(Boolean);
  const routeLine = positions.length === 2 ? positions : null;

  return (
    <div className={`${height} w-full rounded-2xl overflow-hidden border border-slate-200`}>
      <MapContainer
        center={center}
        zoom={pickup ? 13 : 5}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pickup && (
          <Marker position={pickup} icon={pickupIcon}>
            <Popup>{pickupLabel || 'Pickup'}</Popup>
          </Marker>
        )}
        {drop && (
          <Marker position={drop} icon={dropIcon}>
            <Popup>{dropLabel || 'Drop-off'}</Popup>
          </Marker>
        )}
        {routeLine && (
          <Polyline
            positions={routeLine}
            pathOptions={{ color: '#1d6fe8', weight: 3, dashArray: '6,6', opacity: 0.75 }}
          />
        )}
        {positions.length > 0 && <FitBounds positions={positions} />}
      </MapContainer>
    </div>
  );
}
