import { MessageSquare, AlertTriangle, X, Bot, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SystemState } from '../../hooks/useStateMachine';
import { SensorDataWithRate } from '../../hooks/useSensorData';

interface GeminiSafetyConsultantProps {
  systemState: SystemState;
  sensorData: SensorDataWithRate;
  isOpen: boolean;
  onClose: () => void;
  onAuthorizeAction: (action: string) => void;
}

export const GeminiSafetyConsultant = ({ 
  systemState, 
  sensorData, 
  isOpen, 
  onClose,
  onAuthorizeAction
}: GeminiSafetyConsultantProps) => {
  const [messages, setMessages] = useState<Array<{ 
    type: 'system' | 'ai'; 
    content: string; 
    timestamp: Date;
    actions?: string[];
  }>>([]);

  const generateEmergencyPlan = (): { content: string; actions: string[] } => {
    const plans: string[] = [];
    const actions: string[] = [];

    // Pressure-based emergency (Bhopal Scenario)
    if (sensorData.pressure > 55) {
      plans.push('🚨 BHOPAL SCENARIO DETECTED 🚨\n\n');
      plans.push('CRITICAL PRESSURE EXCEEDED (>55 psi)\n');
      plans.push('IMMEDIATE ACTIONS REQUIRED:\n');
      plans.push('1. Activate Vent Gas Scrubber System\n');
      plans.push('2. Initiate Water Curtain immediately\n');
      plans.push('3. Evacuate personnel from Zone A (MIC Storage)\n');
      plans.push('4. Notify emergency response team\n');
      plans.push('5. Begin controlled pressure release protocol\n');
      actions.push('Activate Vent Gas Scrubber System');
      actions.push('Initiate Water Curtain');
      actions.push('Evacuate Zone A (MIC Storage)');
      actions.push('Begin Controlled Pressure Release');
    }

    // Temperature-based emergency
    if (sensorData.temperature > 35) {
      plans.push('🔥 THERMAL RUNAWAY DETECTED 🔥\n\n');
      plans.push('CRITICAL TEMPERATURE EXCEEDED (>35°C)\n');
      plans.push('IMMEDIATE ACTIONS REQUIRED:\n');
      plans.push('1. Activate cooling system (Zone B: Styrene Tank)\n');
      plans.push('2. Reduce reactor feed rate (Zone C)\n');
      plans.push('3. Monitor for exothermic reaction\n');
      plans.push('4. Prepare emergency shutdown sequence\n');
      actions.push('Activate Cooling System (Zone B)');
      actions.push('Reduce Reactor Feed Rate (Zone C)');
      actions.push('Prepare Emergency Shutdown');
    }

    // Rate of change emergency
    if (sensorData.temperatureRateOfChange > 5) {
      plans.push('RAPID TEMPERATURE RISE DETECTED\n\n');
      plans.push(`Temperature rising at ${sensorData.temperatureRateOfChange.toFixed(2)}°C/min\n`);
      plans.push('IMMEDIATE ACTIONS REQUIRED:\n');
      plans.push('1. EMERGENCY SHUTDOWN INITIATED\n');
      plans.push('2. Isolate all heat sources\n');
      plans.push('3. Activate emergency cooling\n');
      plans.push('4. Evacuate all zones immediately\n');
      plans.push('5. Contact fire department\n');
      actions.push('Emergency Shutdown');
      actions.push('Isolate Heat Sources');
      actions.push('Activate Emergency Cooling');
      actions.push('Evacuate All Zones');
    }

    // Inhibitor depletion emergency
    if (sensorData.inhibitorLevel < 50) {
      plans.push('⚠️ INHIBITOR DEPLETION CRITICAL ⚠️\n\n');
      plans.push('TBC Level below safe threshold (<50 ppm)\n');
      plans.push('IMMEDIATE ACTIONS REQUIRED:\n');
      plans.push('1. Stop all polymerization processes\n');
      plans.push('2. Inject emergency inhibitor supply\n');
      plans.push('3. Monitor for spontaneous polymerization\n');
      plans.push('4. Prepare for potential runaway reaction\n');
      actions.push('Stop Polymerization Processes');
      actions.push('Inject Emergency Inhibitor Supply');
    }

    // Multiple critical conditions
    if (plans.length === 0 && systemState === 'CRITICAL') {
      plans.push('🚨 MULTIPLE CRITICAL CONDITIONS DETECTED 🚨\n\n');
      plans.push('System in CRITICAL state. Review all sensor readings.\n');
      plans.push('IMMEDIATE ACTIONS REQUIRED:\n');
      plans.push('1. Activate full emergency protocol\n');
      plans.push('2. Evacuate facility\n');
      plans.push('3. Notify regulatory authorities\n');
      plans.push('4. Begin incident documentation\n');
      actions.push('Activate Full Emergency Protocol');
      actions.push('Evacuate Facility');
    }

    return {
      content: plans.join('\n') || 'System monitoring active. No immediate emergency actions required.',
      actions: actions.length > 0 ? actions : [],
    };
  };

  useEffect(() => {
    if (systemState === 'CRITICAL' && isOpen) {
      const emergencyPlan = generateEmergencyPlan();
      setMessages([
        {
          type: 'system',
          content: '🚨 CRITICAL STATE DETECTED - AI Safety Protocol Activated 🚨',
          timestamp: new Date(),
        },
        {
          type: 'ai',
          content: emergencyPlan.content,
          timestamp: new Date(),
          actions: emergencyPlan.actions,
        },
      ]);
    } else if (systemState !== 'CRITICAL') {
      // Clear messages when state returns to normal (only if not manually opened)
      setMessages([]);
    }
  }, [systemState, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-industrial-panel border-l-2 border-industrial-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-industrial-darker border-b border-industrial-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-industrial-accent" />
          <h2 className="text-xl font-bold text-gray-100">AI Safety Protocol</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status Indicator */}
      <div className={`p-3 border-b border-industrial-border ${
        systemState === 'CRITICAL' ? 'bg-red-500/20 border-red-500' :
        systemState === 'WARNING' ? 'bg-yellow-500/20 border-yellow-500' :
        'bg-green-500/20 border-green-500'
      }`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${
            systemState === 'CRITICAL' ? 'text-red-500' :
            systemState === 'WARNING' ? 'text-yellow-500' :
            'text-green-500'
          }`} />
          <span className={`font-bold ${
            systemState === 'CRITICAL' ? 'text-red-500' :
            systemState === 'WARNING' ? 'text-yellow-500' :
            'text-green-500'
          }`}>
            Status: {systemState}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>AI Safety Protocol Standby</p>
            <p className="text-xs mt-2">Will activate automatically on CRITICAL state</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                message.type === 'system'
                  ? 'bg-industrial-darker border-industrial-accent text-industrial-accent'
                  : 'bg-industrial-darker border-industrial-border text-gray-100'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                {message.type === 'ai' && <Bot className="w-4 h-4 text-industrial-accent mt-1 flex-shrink-0" />}
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="whitespace-pre-wrap text-sm font-mono leading-relaxed mb-3">
                    {message.content}
                  </div>
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-industrial-border space-y-2">
                      <div className="text-xs text-gray-400 mb-2">
                        Human-in-the-Loop Authorization Required (ISO 10218 / OSHA PSM 2025)
                      </div>
                      {message.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => onAuthorizeAction(action)}
                          className="w-full flex items-center justify-between gap-2 p-2 bg-industrial-panel border border-industrial-accent rounded hover:bg-industrial-accent/10 transition-colors text-left"
                        >
                          <span className="text-xs text-gray-200 flex-1">{action}</span>
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-xs text-industrial-accent">Authorize</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-industrial-border p-3 bg-industrial-darker">
        <div className="text-xs text-gray-400 text-center">
          Gemini Safety Consultant v2.0
        </div>
        <div className="text-xs text-gray-500 text-center mt-1">
          Protocol #5 Compliant
        </div>
      </div>
    </div>
  );
};

