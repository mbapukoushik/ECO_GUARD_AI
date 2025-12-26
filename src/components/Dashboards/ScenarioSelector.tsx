import { useEffect, useRef } from 'react';
import { Play, Square, RotateCcw, AlertTriangle } from 'lucide-react';
import { ScenarioType, useScenarioSimulation } from '../../hooks/useScenarioSimulation';

interface ScenarioSelectorProps {
  selectedScenario: ScenarioType;
  onScenarioChange: (scenario: ScenarioType) => void;
  onSimulatedDataChange: (data: { temperature: number; pressure: number; inhibitorLevel: number } | null) => void;
}

export const ScenarioSelector = ({
  selectedScenario,
  onScenarioChange,
  onSimulatedDataChange,
}: ScenarioSelectorProps) => {
  const scenarioSim = useScenarioSimulation(selectedScenario, 1000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scenarioSim.isActive) {
      intervalRef.current = setInterval(() => {
        const data = scenarioSim.getSimulatedData();
        if (data) {
          onSimulatedDataChange(data);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      onSimulatedDataChange(null);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioSim.isActive]);

  const handleStart = () => {
    scenarioSim.startScenario();
  };

  const handleStop = () => {
    scenarioSim.stopScenario();
  };

  const handleReset = () => {
    scenarioSim.resetScenario();
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-400 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        Simulations:
      </label>
      <select
        value={selectedScenario}
        onChange={(e) => {
          handleStop();
          onScenarioChange(e.target.value as ScenarioType);
        }}
        className="bg-industrial-panel border border-industrial-border rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-industrial-accent"
        disabled={scenarioSim.isActive}
      >
        <option value="NORMAL">Normal Ops (Steady sensors)</option>
        <option value="BHOPAL_E610">Bhopal E610 (High Pressure)</option>
        <option value="VIZAG_M6">Vizag M6 (Inhibitor Leak)</option>
      </select>

      {!scenarioSim.isActive ? (
        <button
          onClick={handleStart}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 border border-green-500 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm"
        >
          <Play className="w-4 h-4" />
          Start
        </button>
      ) : (
        <>
          <button
            onClick={handleStop}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 border border-red-500 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </>
      )}

      {scenarioSim.isActive && (
        <span className="text-xs text-gray-400">
          Running: {scenarioSim.config.name} ({scenarioSim.elapsedTime.toFixed(1)}s)
        </span>
      )}
    </div>
  );
};

