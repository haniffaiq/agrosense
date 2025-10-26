import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { getStatusColors, calculateStatus } from '../utils/colorStatus';
import {
  sensors as SENSOR_LIST,
  type Sensor,
  simulateSensorReadings,
  type SensorReading,
} from '../lib/sensors';

const createCustomIcon = (status: Sensor['status']) => {
  // kalau lu butuh gradient/warna detail, ambil dari getStatusColors(status)
  const colorMap = {
    optimal: '#22c55e',
    warning: '#eab308',
    critical: '#ef4444',
    offline: '#6b7280',
  } as const;

  const c = colorMap[status] ?? colorMap.offline;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${c};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 20px ${c}80;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

function MapUpdater({ sensors }: { sensors: Sensor[] }) {
  const map = useMap();
  useEffect(() => {
    if (sensors.length > 0) {
      const bounds = L.latLngBounds(sensors.map((s) => [s.location_lat, s.location_lng] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [sensors, map]);
  return null;
}

export const MapView = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSensors(SENSOR_LIST);
    setLoading(false);

    const stop = simulateSensorReadings(3000, (reading: SensorReading) => {
      setSensors((prev) =>
        prev.map((s) => {
          if (s.id !== reading.sensor_id) return s;

          // hitung status baru berdasar tipe sensor & nilai
          const newStatus = calculateStatus(s.type as any, reading.value) as Sensor['status'];

          return {
            ...s,
            status: newStatus,
            updated_at: reading.timestamp,
          };
        })
      );
    });

    return stop; 
  }, []);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 p-6 h-96 flex items-center justify-center">
        <div className="text-white/60">Loading map...</div>
      </div>
    );
  }

  const defaultCenter: [number, number] =
    sensors.length > 0 ? [sensors[0].location_lat, sensors[0].location_lng] : [-8.65, 115.22];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Sensor Locations
          </h3>
          <p className="text-white/60 text-sm">Live sensor map with status indicators</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-white/60">Optimal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-white/60">Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-white/60">Critical</span>
          </div>
        </div>
      </div>

      <div className="h-96 rounded-xl overflow-hidden">
        <MapContainer center={defaultCenter} zoom={15} style={{ height: '100%', width: '100%' }} className="z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater sensors={sensors} />
          {sensors.map((sensor) => (
            <Marker
              key={sensor.id}
              position={[sensor.location_lat, sensor.location_lng]}
              icon={createCustomIcon(sensor.status)}
            >
              <Popup>
                <div className="p-2 min-w-[220px]">
                  <h4 className="font-semibold text-gray-900 mb-1">{sensor.name}</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      Type:{' '}
                      <span className="font-medium capitalize">
                        {sensor.type.replace('_', ' ')}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Status:{' '}
                      <span
                        className={`font-medium capitalize ${
                          sensor.status === 'optimal'
                            ? 'text-green-600'
                            : sensor.status === 'warning'
                            ? 'text-yellow-600'
                            : sensor.status === 'critical'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {sensor.status}
                      </span>
                    </p>
                    <p className="text-gray-600 text-xs">
                      Updated: {new Date(sensor.updated_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .leaflet-container { background: rgba(15, 23, 42, 0.8); }
      `}</style>
    </motion.div>
  );
};
