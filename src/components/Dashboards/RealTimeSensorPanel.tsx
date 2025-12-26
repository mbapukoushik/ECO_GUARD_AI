import { Thermometer, Gauge, Droplets, TrendingUp, AlertTriangle } from 'lucide-react';
import { SystemState } from '../../hooks/useStateMachine';
import { SensorData } from '../../hooks/useSensorData';

interface RealTimeSensorPanelProps {
  sensorData: SensorData;
  systemState: SystemState;
}

export const RealTimeSensorPanel = ({ sensorData, systemState }: RealTimeSensorPanelProps) => {
  const getTemperatureStatus = () => {
    if (sensorData.temperature > 35) return 'CRITICAL';
    if (sensorData.temperature > 25) return 'WARNING';
    return 'NORMAL';
  };

  const getPressureStatus = () => {
    if (sensorData.pressure > 55) return 'CRITICAL';
    if (sensorData.pressure < 2 || sensorData.pressure > 25) return 'WARNING';
    return 'NORMAL';
  };

  const getInhibitorStatus = () => {
    if (sensorData.inhibitorLevel < 50) return 'ALERT';
    if (sensorData.inhibitorLevel < 100) return 'WARNING';
    return 'NORMAL';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
      case 'ALERT':
        return 'text-red-500 border-red-500 bg-red-500/10';
      case 'WARNING':
        return 'text-yellow-500 border-yellow-500 bg-yellow-500/10';
      default:
        return 'text-green-500 border-green-500 bg-green-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'CRITICAL' || status === 'ALERT') {
      return <AlertTriangle className="w-5 h-5" />;
    }
    return null;
  };

  const tempStatus = getTemperatureStatus();
  const pressureStatus = getPressureStatus();
  const inhibitorStatus = getInhibitorStatus();

  return (
    <div className="bg-industrial-panel border border-industrial-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Gauge className="w-6 h-6 text-industrial-accent" />
          Real-Time Sensor Panel
        </h2>
        <div className={`px-4 py-2 rounded-lg border-2 font-bold ${
          systemState === 'CRITICAL' ? 'text-red-500 border-red-500 bg-red-500/10' :
          systemState === 'WARNING' ? 'text-yellow-500 border-yellow-500 bg-yellow-500/10' :
          'text-green-500 border-green-500 bg-green-500/10'
        }`}>
          {systemState}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Temperature Sensor */}
        <div className={`border-2 rounded-lg p-4 ${getStatusColor(tempStatus)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              <span className="font-semibold">Temperature</span>
            </div>
            {getStatusIcon(tempStatus)}
          </div>
          <div className="text-3xl font-bold mb-1">
            {sensorData.temperature.toFixed(1)}°C
          </div>
          <div className="text-sm opacity-75">
            M6 Styrene Tank
          </div>
          <div className="mt-2 text-xs">
            Normal: 15-25°C | Warning: &gt;25°C | Critical: &gt;35°C
          </div>
          {sensorData.temperatureRateOfChange > 5 && (
            <div className="mt-2 flex items-center gap-1 text-red-400 text-xs font-bold">
              <TrendingUp className="w-4 h-4" />
              Rate: {sensorData.temperatureRateOfChange.toFixed(2)}°C/min (CRITICAL)
            </div>
          )}
        </div>

        {/* Pressure Sensor */}
        <div className={`border-2 rounded-lg p-4 ${getStatusColor(pressureStatus)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              <span className="font-semibold">Pressure</span>
            </div>
            {getStatusIcon(pressureStatus)}
          </div>
          <div className="text-3xl font-bold mb-1">
            {sensorData.pressure.toFixed(1)} psi
          </div>
          <div className="text-sm opacity-75">
            Bhopal E610 Tank
          </div>
          <div className="mt-2 text-xs">
            Normal: 2-25 psi | Critical: &gt;55 psi
          </div>
        </div>

        {/* Inhibitor Level Sensor */}
        <div className={`border-2 rounded-lg p-4 ${getStatusColor(inhibitorStatus)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              <span className="font-semibold">Inhibitor Level</span>
            </div>
            {getStatusIcon(inhibitorStatus)}
          </div>
          <div className="text-3xl font-bold mb-1">
            {sensorData.inhibitorLevel.toFixed(0)} ppm
          </div>
          <div className="text-sm opacity-75">
            TBC Depletion Tracking
          </div>
          <div className="mt-2 text-xs">
            Normal: 100-500 ppm | Alert: &lt;50 ppm
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-industrial-darker rounded border border-industrial-border">
        <div className="text-xs text-gray-400">
          Last Update: {new Date(sensorData.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

