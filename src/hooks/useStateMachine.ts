import { useState, useEffect, useCallback } from 'react';

export type SystemState = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface StateMachineConfig {
  temperature: number;
  pressure: number;
  inhibitorLevel: number;
  temperatureRateOfChange: number; // dT/dt in °C/min
}

export const useStateMachine = (config: StateMachineConfig): SystemState => {
  const [state, setState] = useState<SystemState>('NORMAL');

  const evaluateState = useCallback((cfg: StateMachineConfig): SystemState => {
    // Critical: Rate of change check (highest priority)
    if (cfg.temperatureRateOfChange > 5) {
      return 'CRITICAL';
    }

    // Critical conditions
    if (cfg.temperature > 35 || cfg.pressure > 55) {
      return 'CRITICAL';
    }

    // Warning conditions
    if (cfg.temperature > 25 || cfg.inhibitorLevel < 50) {
      return 'WARNING';
    }

    // Normal conditions
    if (
      cfg.temperature >= 15 &&
      cfg.temperature <= 25 &&
      cfg.pressure >= 2 &&
      cfg.pressure <= 25 &&
      cfg.inhibitorLevel >= 100 &&
      cfg.inhibitorLevel <= 500
    ) {
      return 'NORMAL';
    }

    // Default to warning if conditions don't match exactly
    return 'WARNING';
  }, []);

  useEffect(() => {
    const newState = evaluateState(config);
    setState(newState);
  }, [config, evaluateState]);

  return state;
};

