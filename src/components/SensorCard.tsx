import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Thermometer, Droplet, Leaf, Sun } from 'lucide-react';
import { getStatusColors, getSensorColor } from '../utils/colorStatus';
import type { SensorStatus } from '../utils/colorStatus';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  status: SensorStatus;
  trend?: number;
  type: 'temperature' | 'humidity' | 'soilMoisture' | 'light';
}

const iconMap = {
  temperature: Thermometer,
  humidity: Droplet,
  soilMoisture: Leaf,
  light: Sun
};

export const SensorCard = ({ title, value, unit, status, trend = 0, type }: SensorCardProps) => {
  const colors = getStatusColors(status);
  const sensorColor = getSensorColor(type);
  const Icon = iconMap[type];

  const getTrendIcon = () => {
    if (Math.abs(trend) < 0.1) return <Minus className="w-4 h-4" />;
    return trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/5 border ${colors.border} p-6 hover:bg-white/10 transition-all duration-300`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10">
        <Icon className="w-full h-full" style={{ color: sensorColor }} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}
              style={{ boxShadow: `0 0 20px ${sensorColor}40` }}
            >
              <Icon className="w-5 h-5" style={{ color: sensorColor }} />
            </div>
            <h3 className="text-white/80 font-medium text-sm">{title}</h3>
          </div>

          <div className={`flex items-center gap-1 ${colors.text} text-xs font-semibold`}>
            {getTrendIcon()}
            <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <motion.span
              key={value}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-white"
              style={{ textShadow: `0 0 30px ${sensorColor}80` }}
            >
              {value.toFixed(1)}
            </motion.span>
            <span className="text-xl text-white/60 font-medium">{unit}</span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`h-2 flex-1 rounded-full bg-white/10 overflow-hidden`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: sensorColor,
                  boxShadow: `0 0 10px ${sensorColor}`
                }}
              />
            </div>
            <span className={`text-xs font-semibold uppercase ${colors.text} px-2 py-1 rounded ${colors.bg}`}>
              {status}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
