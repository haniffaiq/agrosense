import { useMqtt } from './hooks/useMqtt';
import { Header } from './components/Header';
import { SensorCard } from './components/SensorCard';
import { RealtimeChart } from './components/RealtimeChart';
import { MapView } from './components/MapView';
import { calculateStatus, getSensorColor } from './utils/colorStatus';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const { isConnected, sensorData, historicalData } = useMqtt();

  const temperatureStatus = calculateStatus('temperature', sensorData.temperature);
  const humidityStatus = calculateStatus('humidity', sensorData.humidity);
  const soilStatus = calculateStatus('soil_moisture', sensorData.soilMoisture);
  const lightStatus = calculateStatus('light', sensorData.light);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="max-w-[1920px] mx-auto">
        <Header isConnected={isConnected} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
          <SensorCard
            title="Temperature"
            value={sensorData.temperature}
            unit="°C"
            status={temperatureStatus}
            trend={historicalData.temperature.length > 1
              ? sensorData.temperature - historicalData.temperature[historicalData.temperature.length - 2].value
              : 0}
            type="temperature"
          />
          <SensorCard
            title="Humidity"
            value={sensorData.humidity}
            unit="%"
            status={humidityStatus}
            trend={historicalData.humidity.length > 1
              ? sensorData.humidity - historicalData.humidity[historicalData.humidity.length - 2].value
              : 0}
            type="humidity"
          />
          <SensorCard
            title="Soil Moisture"
            value={sensorData.soilMoisture}
            unit="%"
            status={soilStatus}
            trend={historicalData.soilMoisture.length > 1
              ? sensorData.soilMoisture - historicalData.soilMoisture[historicalData.soilMoisture.length - 2].value
              : 0}
            type="soilMoisture"
          />
          <SensorCard
            title="Light Intensity"
            value={sensorData.light}
            unit="lux"
            status={lightStatus}
            trend={historicalData.light.length > 1
              ? sensorData.light - historicalData.light[historicalData.light.length - 2].value
              : 0}
            type="light"
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Live Analytics</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <RealtimeChart
              data={historicalData.temperature}
              color={getSensorColor('temperature')}
              title="Temperature Trend"
              unit="°C"
            />
            <RealtimeChart
              data={historicalData.humidity}
              color={getSensorColor('humidity')}
              title="Humidity Trend"
              unit="%"
            />
            <RealtimeChart
              data={historicalData.soilMoisture}
              color={getSensorColor('soil_moisture')}
              title="Soil Moisture Trend"
              unit="%"
            />
            <RealtimeChart
              data={historicalData.light}
              color={getSensorColor('light')}
              title="Light Intensity Trend"
              unit="lux"
            />
          </div>
        </motion.div>

        <MapView />
      </div>
    </div>
  );
}

export default App;
