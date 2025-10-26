// src/lib/sensors.ts

export interface Sensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'light';
  location_lat: number;
  location_lng: number;
  status: 'optimal' | 'warning' | 'critical' | 'offline';
  created_at: string;
  updated_at: string;
}

export interface SensorReading {
  id: string;
  sensor_id: string;
  value: number;
  unit: string;
  timestamp: string;
  created_at: string;
}

// Dummy sensor list
export const sensors: Sensor[] = [
  {
    id: '1',
    name: 'Sensor A - Greenhouse 1',
    type: 'temperature',
    location_lat: -8.65,
    location_lng: 115.22,
    status: 'optimal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sensor B - Greenhouse 2',
    type: 'humidity',
    location_lat: -8.64,
    location_lng: 115.23,
    status: 'warning',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Sensor C - Rice Field',
    type: 'soil_moisture',
    location_lat: -8.66,
    location_lng: 115.20,
    status: 'critical',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Sensor D - Open Field',
    type: 'light',
    location_lat: -8.63,
    location_lng: 115.21,
    status: 'optimal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Function: generate random reading per sensor
export function generateDummyReading(sensor: Sensor): SensorReading {
  const valueRanges: Record<Sensor['type'], [number, number, string]> = {
    temperature: [24, 36, '°C'],
    humidity: [40, 90, '%'],
    soil_moisture: [20, 80, '%'],
    light: [200, 1200, 'lux'],
  };

  const [min, max, unit] = valueRanges[sensor.type];
  const value = Number((Math.random() * (max - min) + min).toFixed(2));

  return {
    id: crypto.randomUUID(),
    sensor_id: sensor.id,
    value,
    unit,
    timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

// Function: simulate periodic updates
export function simulateSensorReadings(
  intervalMs = 3000,
  callback: (reading: SensorReading) => void
) {
  setInterval(() => {
    const sensor = sensors[Math.floor(Math.random() * sensors.length)];
    const reading = generateDummyReading(sensor);
    callback(reading);
  }, intervalMs);
}
