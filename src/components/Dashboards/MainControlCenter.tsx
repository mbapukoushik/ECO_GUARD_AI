import { useState } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { RealTimeSensorPanel } from './RealTimeSensorPanel';
import { SustainabilityScorecard } from './SustainabilityScorecard';
// import { DigitalTwinMap } from './DigitalTwinMap';
// import { ComplianceLog } from './ComplianceLog';
// import { GeminiSafetyConsultant } from './GeminiSafetyConsultant';
import { ScenarioSelector } from './ScenarioSelector';
// import { PreventionSuccessPopup } from './PreventionSuccessPopup';
import { useStateMachine, SystemState } from '../../hooks/useStateMachine';
import { useSensorData } from '../../hooks/useSensorData';
// import { useComplianceLog } from '../../hooks/useComplianceLog';
import { ScenarioType } from '../../hooks/useScenarioSimulation';

export const MainControlCenter = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('NORMAL');
  const [simulatedData, setSimulatedData] = useState<{ temperature: number; pressure: number; inhibitorLevel: number } | null>(null);
  // const [preventionPopup, setPreventionPopup] = useState<{ isOpen: boolean; action: string; savings: number }>({
  //   isOpen: false,
  //   action: '',
  //   savings: 0,
  // });

  const sensorData = useSensorData(1000, simulatedData); // Update every second
  const systemState = useStateMachine({
    temperature: sensorData.temperature,
    pressure: sensorData.pressure,
    inhibitorLevel: sensorData.inhibitorLevel,
    temperatureRateOfChange: sensorData.temperatureRateOfChange,
  });

  // const [isSafetyConsultantOpen, setIsSafetyConsultantOpen] = useState(false);
  // const { logEntries, addAuthorizationEntry } = useComplianceLog(systemState, {
  //   temperature: sensorData.temperature,
  //   pressure: sensorData.pressure,
  //   inhibitorLevel: sensorData.inhibitorLevel,
  // });

  // // Calculate estimated savings based on action type
  // const calculateSavings = (action: string): number => {
  //   // Base savings for different action types
  //   const savingsMap: Record<string, number> = {
  //     'Activate Vent Gas Scrubber System': 45.2,
  //     'Initiate Water Curtain': 12.8,
  //     'Evacuate Zone A (MIC Storage)': 8.5,
  //     'Begin Controlled Pressure Release': 2.9,
  //     'Activate Cooling System (Zone B)': 38.7,
  //     'Reduce Reactor Feed Rate (Zone C)': 15.3,
  //     'Prepare Emergency Shutdown': 22.1,
  //     'Emergency Shutdown': 55.6,
  //     'Isolate Heat Sources': 18.4,
  //     'Activate Emergency Cooling': 31.2,
  //     'Evacuate All Zones': 11.7,
  //     'Stop Polymerization Processes': 28.9,
  //     'Inject Emergency Inhibitor Supply': 9.3,
  //     'Activate Full Emergency Protocol': 69.4,
  //     'Evacuate Facility': 14.6,
  //   };
  //   return savingsMap[action] || 25.0; // Default savings
  // };

  // const handleAuthorizeAction = (action: string) => {
  //   // Log the authorization
  //   addAuthorizationEntry(action);
    
  //   // Calculate savings
  //   const savings = calculateSavings(action);
    
  //   // Show prevention success popup
  //   setPreventionPopup({
  //     isOpen: true,
  //     action,
  //     savings,
  //   });
  // };

  // // Auto-open safety consultant on CRITICAL state
  // useEffect(() => {
  //   if (systemState === 'CRITICAL') {
  //     setIsSafetyConsultantOpen(true);
  //   }
  // }, [systemState]);

  const getStateIcon = (state: SystemState) => {
    switch (state) {
      case 'CRITICAL':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'WARNING':
        return <AlertCircle className="w-8 h-8 text-yellow-500" />;
      default:
        return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
  };

  const getStateColor = (state: SystemState) => {
    switch (state) {
      case 'CRITICAL':
        return 'border-red-500 bg-red-500/10 text-red-500';
      case 'WARNING':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-500';
      default:
        return 'border-green-500 bg-green-500/10 text-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-industrial-darker p-6 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-industrial-panel border border-industrial-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-100 mb-2 flex items-center gap-3">
                <Activity className="w-10 h-10 text-industrial-accent" />
                ECO GUARD AI
              </h1>
              <p className="text-gray-400 text-lg">Main Control Center - Industrial IoT Monitoring</p>
            </div>
            <div className="flex items-center gap-4">
              {/* <button
                onClick={() => setIsSafetyConsultantOpen(!isSafetyConsultantOpen)}
                className={`border-2 rounded-lg p-3 ${getStateColor(systemState)} hover:opacity-80 transition-opacity flex items-center gap-2`}
                title="Toggle AI Safety Protocol"
              >
                <Bot className="w-5 h-5" />
                <span className="text-sm font-semibold">AI Safety</span>
              </button> */}
              <div className={`border-4 rounded-lg p-6 ${getStateColor(systemState)}`}>
                <div className="flex flex-col items-center gap-2">
                  {getStateIcon(systemState)}
                  <div className="text-2xl font-bold">{systemState}</div>
                  <div className="text-xs opacity-75">System Status</div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-industrial-border pt-4">
            <ScenarioSelector
              selectedScenario={selectedScenario}
              onScenarioChange={setSelectedScenario}
              onSimulatedDataChange={setSimulatedData}
            />
          </div>
        </div>

        {/* Real-Time Sensor Panel */}
        <RealTimeSensorPanel sensorData={sensorData} systemState={systemState} />

        {/* 2D Digital Twin Map */}
        {/* <DigitalTwinMap systemState={systemState} /> */}

        {/* Sustainability Scorecard */}
        <SustainabilityScorecard sensorData={sensorData} systemState={systemState} />

        {/* Immutable Compliance Log */}
        {/* <ComplianceLog logEntries={logEntries} /> */}

        {/* System Information Footer */}
        <div className="bg-industrial-panel border border-industrial-border rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Last System Check: {new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Rate of Change Monitor: {sensorData.temperatureRateOfChange > 5 ? 'ACTIVE' : 'STABLE'}</span>
              {sensorData.temperatureRateOfChange > 5 && (
                <span className="text-red-400 font-bold">⚠ dT/dt Critical Threshold Exceeded</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gemini Safety Consultant Sidebar */}
      {/* <GeminiSafetyConsultant
        systemState={systemState}
        sensorData={sensorData}
        isOpen={isSafetyConsultantOpen}
        onClose={() => setIsSafetyConsultantOpen(false)}
        onAuthorizeAction={handleAuthorizeAction}
      /> */}

      {/* Prevention Success Popup */}
      {/* <PreventionSuccessPopup
        isOpen={preventionPopup.isOpen}
        onClose={() => setPreventionPopup({ ...preventionPopup, isOpen: false })}
        action={preventionPopup.action}
        estimatedSavings={preventionPopup.savings}
      /> */}
    </div>
  );
};

