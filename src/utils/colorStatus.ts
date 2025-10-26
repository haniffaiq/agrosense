export type SensorStatus = 'optimal' | 'warning' | 'critical' | 'offline';

export interface StatusColors {
  bg: string;
  text: string;
  border: string;
  glow: string;
}

export const getStatusColors = (status: SensorStatus): StatusColors => {
  switch (status) {
    case 'optimal':
      return {
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        border: 'border-green-500/30',
        glow: 'shadow-green-500/50'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        glow: 'shadow-yellow-500/50'
      };
    case 'critical':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
        glow: 'shadow-red-500/50'
      };
    case 'offline':
      return {
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
        glow: 'shadow-gray-500/50'
      };
  }
};

export const getSensorColor = (type: string): string => {
  switch (type) {
    case 'temperature':
      return '#f97316';
    case 'humidity':
      return '#3b82f6';
    case 'soil_moisture':
      return '#22c55e';
    case 'light':
      return '#eab308';
    default:
      return '#6b7280';
  }
};

export const getSensorIcon = (type: string): string => {
  switch (type) {
    case 'temperature':
      return 'Thermometer';
    case 'humidity':
      return 'Droplet';
    case 'soil_moisture':
      return 'Leaf';
    case 'light':
      return 'Sun';
    default:
      return 'Activity';
  }
};

export const getThresholds = (type: string) => {
  switch (type) {
    case 'temperature':
      return { warning: 30, critical: 35, unit: '°C' };
    case 'humidity':
      return { warning: 75, critical: 85, unit: '%' };
    case 'soil_moisture':
      return { warning: 30, critical: 20, unit: '%' };
    case 'light':
      return { warning: 800, critical: 1000, unit: 'lux' };
    default:
      return { warning: 0, critical: 0, unit: '' };
  }
};

export const calculateStatus = (type: string, value: number): SensorStatus => {
  const thresholds = getThresholds(type);

  if (type === 'soil_moisture') {
    if (value <= thresholds.critical) return 'critical';
    if (value <= thresholds.warning) return 'warning';
    return 'optimal';
  } else {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'optimal';
  }
};
