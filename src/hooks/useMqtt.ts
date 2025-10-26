// src/hooks/useMqtt.ts
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { calculateStatus } from '../utils/colorStatus';

export interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  light: number;
  timestamp: string;
  location: { lat: number; lng: number };
}

export interface HistoricalDataPoint {
  timestamp: string;
  value: number;
}

type Series = HistoricalDataPoint[];

type UseMqttOptions = {
  intervalMs?: number;   // default 3000ms
  maxPoints?: number;    // default 20
  jitter?: boolean;      // simulate brief disconnects
};

export const useMqtt = (opts: UseMqttOptions = {}) => {
  const { intervalMs = 10000, maxPoints = 20, jitter = false } = opts;

  const [isConnected, setIsConnected] = useState(true);

  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 25,
    humidity: 60,
    soilMoisture: 45,
    light: 650,
    timestamp: new Date().toISOString(),
    location: { lat: -8.65, lng: 115.22 },
  });

  const [historicalData, setHistoricalData] = useState<{
    temperature: Series;
    humidity: Series;
    soilMoisture: Series;
    light: Series;
  }>({
    temperature: [],
    humidity: [],
    soilMoisture: [],
    light: [],
  });

  // helper untuk bikin nilai realistis (bounded random walk)
  const generateRealisticValue = useCallback(
    (current: number, min: number, max: number, volatility = 0.5) => {
      const change = (Math.random() - 0.5) * volatility;
      const next = current + change;
      return Math.max(min, Math.min(max, Number(next.toFixed(2))));
    },
    []
  );

  // timer ref supaya clearInterval pasti jalan
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // optional: simulasi disconnect singkat
    const maybeJitter = () => {
      if (!jitter) return;
      // ~5% peluang drop koneksi 1 tick
      const drop = Math.random() < 0.05;
      setIsConnected(!drop);
    };

    const tick = () => {
      maybeJitter();

      setSensorData((prev) => {
        const next: SensorData = {
          temperature: generateRealisticValue(prev.temperature, 18, 40, 0.3),
          humidity: generateRealisticValue(prev.humidity, 30, 90, 2),
          soilMoisture: generateRealisticValue(prev.soilMoisture, 15, 80, 1),
          light: generateRealisticValue(prev.light, 200, 1200, 30),
          timestamp: new Date().toISOString(),
          location: prev.location,
        };
        return next;
      });
    };

    // start interval
    timerRef.current = window.setInterval(tick, intervalMs);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [intervalMs, jitter, generateRealisticValue]);

  // maintain historis (ring buffer sederhana)
  useEffect(() => {
    const timestamp = sensorData.timestamp;
    setHistoricalData((prev) => ({
      temperature: [...prev.temperature, { timestamp, value: sensorData.temperature }].slice(-maxPoints),
      humidity: [...prev.humidity, { timestamp, value: sensorData.humidity }].slice(-maxPoints),
      soilMoisture: [...prev.soilMoisture, { timestamp, value: sensorData.soilMoisture }].slice(-maxPoints),
      light: [...prev.light, { timestamp, value: sensorData.light }].slice(-maxPoints),
    }));
  }, [sensorData, maxPoints]);

  // status per metrik (buat badge warna/gauge state)
  const statuses = useMemo(() => ({
    temperature: calculateStatus('temperature', sensorData.temperature),
    humidity: calculateStatus('humidity', sensorData.humidity),
    soilMoisture: calculateStatus('soil_moisture', sensorData.soilMoisture),
    light: calculateStatus('light', sensorData.light),
  }), [sensorData]);

  return {
    isConnected,
    sensorData,
    historicalData,
    statuses,        
  };
};
