import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { calculateStatus, getThresholds } from '../utils/colorStatus';

export interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  light: number;
  timestamp: string;
  location: { lat: number; lng: number };
}

export interface HistoricalData {
  timestamp: string;
  value: number;
}

export const useMqtt = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 25,
    humidity: 60,
    soilMoisture: 45,
    light: 650,
    timestamp: new Date().toISOString(),
    location: { lat: -8.65, lng: 115.22 }
  });

  const [historicalData, setHistoricalData] = useState<{
    temperature: HistoricalData[];
    humidity: HistoricalData[];
    soilMoisture: HistoricalData[];
    light: HistoricalData[];
  }>({
    temperature: [],
    humidity: [],
    soilMoisture: [],
    light: []
  });

  const generateRealisticValue = useCallback((
    currentValue: number,
    min: number,
    max: number,
    volatility: number = 0.5
  ): number => {
    const change = (Math.random() - 0.5) * volatility;
    const newValue = currentValue + change;
    return Math.max(min, Math.min(max, newValue));
  }, []);

  const updateSensorInDB = useCallback(async (type: string, value: number, unit: string) => {
    try {
      const { data: sensors } = await supabase
        .from('sensors')
        .select('id')
        .eq('type', type)
        .limit(1)
        .maybeSingle();

      if (sensors) {
        const status = calculateStatus(type, value);

        await supabase
          .from('sensors')
          .update({
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', sensors.id);

        await supabase
          .from('sensor_readings')
          .insert({
            sensor_id: sensors.id,
            value,
            unit,
            timestamp: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error updating sensor:', error);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData((prev) => {
        const newData = {
          temperature: generateRealisticValue(prev.temperature, 18, 40, 0.3),
          humidity: generateRealisticValue(prev.humidity, 30, 90, 2),
          soilMoisture: generateRealisticValue(prev.soilMoisture, 15, 80, 1),
          light: generateRealisticValue(prev.light, 200, 1200, 30),
          timestamp: new Date().toISOString(),
          location: prev.location
        };

        updateSensorInDB('temperature', newData.temperature, '°C');
        updateSensorInDB('humidity', newData.humidity, '%');
        updateSensorInDB('soil_moisture', newData.soilMoisture, '%');
        updateSensorInDB('light', newData.light, 'lux');

        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [generateRealisticValue, updateSensorInDB]);

  useEffect(() => {
    setHistoricalData((prev) => {
      const timestamp = new Date().toISOString();
      const maxPoints = 20;

      return {
        temperature: [...prev.temperature, { timestamp, value: sensorData.temperature }].slice(-maxPoints),
        humidity: [...prev.humidity, { timestamp, value: sensorData.humidity }].slice(-maxPoints),
        soilMoisture: [...prev.soilMoisture, { timestamp, value: sensorData.soilMoisture }].slice(-maxPoints),
        light: [...prev.light, { timestamp, value: sensorData.light }].slice(-maxPoints)
      };
    });
  }, [sensorData]);

  return {
    isConnected,
    sensorData,
    historicalData
  };
};
