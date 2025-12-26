import { Leaf, DollarSign, TrendingUp, Shield } from 'lucide-react';
import { SensorData } from '../../hooks/useSensorData';
import { SystemState } from '../../hooks/useStateMachine';

interface SustainabilityScorecardProps {
  sensorData: SensorData;
  systemState: SystemState;
}

export const SustainabilityScorecard = ({ sensorData, systemState }: SustainabilityScorecardProps) => {
  // Calculate Environmental Damage Prevented (EDP)
  // EDP = Volume × Persistence × RemediationCost
  
  // Mock values for calculation
  // In a real system, these would come from actual tank specifications
  const tankVolume = 50000; // liters (example: 50kL tank)
  const persistenceFactor = systemState === 'CRITICAL' ? 0.1 : 
                           systemState === 'WARNING' ? 0.5 : 1.0; // Higher persistence = better prevention
  const remediationCostPerLiter = 0.15; // $0.15 per liter remediation cost
  
  // Calculate EDP based on system state and sensor readings
  // Better state = more damage prevented
  const baseEDP = tankVolume * persistenceFactor * remediationCostPerLiter;
  
  // Adjust based on actual sensor readings (prevented incidents)
  const temperatureFactor = sensorData.temperature > 35 ? 0 : 
                            sensorData.temperature > 25 ? 0.7 : 1.0;
  const pressureFactor = sensorData.pressure > 55 ? 0 : 
                        sensorData.pressure > 25 ? 0.8 : 1.0;
  const inhibitorFactor = sensorData.inhibitorLevel < 50 ? 0.5 : 
                         sensorData.inhibitorLevel < 100 ? 0.8 : 1.0;
  
  const adjustedEDP = baseEDP * temperatureFactor * pressureFactor * inhibitorFactor;
  
  // Calculate prevention score (0-100)
  const preventionScore = Math.min(100, Math.max(0, 
    (temperatureFactor * 0.4 + pressureFactor * 0.4 + inhibitorFactor * 0.2) * 100
  ));

  return (
    <div className="bg-industrial-panel border border-industrial-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Leaf className="w-6 h-6 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-100">Sustainability Scorecard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EDP Calculation */}
        <div className="bg-industrial-darker border border-industrial-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-gray-200">Environmental Damage Prevented (EDP)</span>
          </div>
          <div className="text-4xl font-bold text-green-400 mb-2">
            ${adjustedEDP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-2 space-y-1">
            <div>Formula: EDP = Volume × Persistence × RemediationCost</div>
            <div>Volume: {tankVolume.toLocaleString()} L</div>
            <div>Persistence: {(persistenceFactor * 100).toFixed(0)}%</div>
            <div>Remediation Cost: ${remediationCostPerLiter}/L</div>
          </div>
        </div>

        {/* Prevention Score */}
        <div className="bg-industrial-darker border border-industrial-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-gray-200">Prevention Score</span>
          </div>
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {preventionScore.toFixed(1)}%
          </div>
          <div className="mt-3">
            <div className="w-full bg-industrial-panel rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full transition-all ${
                  preventionScore >= 80 ? 'bg-green-500' :
                  preventionScore >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${preventionScore}%` }}
              />
            </div>
            <div className="text-xs text-gray-400">
              Based on Temperature, Pressure, and Inhibitor Level factors
            </div>
          </div>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="mt-6 bg-industrial-darker border border-industrial-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-industrial-accent" />
          <span className="font-semibold text-gray-200">Factor Breakdown</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-1">Temperature Factor</div>
            <div className={`text-lg font-bold ${
              temperatureFactor >= 0.8 ? 'text-green-400' :
              temperatureFactor >= 0.5 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {(temperatureFactor * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Pressure Factor</div>
            <div className={`text-lg font-bold ${
              pressureFactor >= 0.8 ? 'text-green-400' :
              pressureFactor >= 0.5 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {(pressureFactor * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Inhibitor Factor</div>
            <div className={`text-lg font-bold ${
              inhibitorFactor >= 0.8 ? 'text-green-400' :
              inhibitorFactor >= 0.5 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {(inhibitorFactor * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

