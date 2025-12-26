import { useState, useEffect } from 'react';

export type ScenarioType = 'NORMAL' | 'BHOPAL_E610' | 'VIZAG_M6';

export interface ScenarioConfig {
  name: string;
  description: string;
  temperature: {
    base: number;
    trend: number; // per second
    variance: number;
  };
  pressure: {
    base: number;
    trend: number; // per second
    variance: number;
  };
  inhibitorLevel: {
    base: number;
    trend: number; // per second
    variance: number;
  };
}

const scenarios: Record<ScenarioType, ScenarioConfig> = {
  NORMAL: {
    name: 'Normal Operations',
    description: 'Steady state operations with normal sensor readings',
    temperature: {
      base: 20,
      trend: 0,
      variance: 0.5,
    },
    pressure: {
      base: 15,
      trend: 0,
      variance: 1,
    },
    inhibitorLevel: {
      base: 300,
      trend: -0.1, // slight depletion
      variance: 2,
    },
  },
  BHOPAL_E610: {
    name: 'Bhopal E610 Scenario',
    description: 'Simulating pressure buildup in E610 tank (Bhopal incident pattern)',
    temperature: {
      base: 22,
      trend: 0.02, // slight temp increase
      variance: 0.5,
    },
    pressure: {
      base: 20,
      trend: 0.15, // gradually ramps to 55+ psi
      variance: 1,
    },
    inhibitorLevel: {
      base: 250,
      trend: -0.2,
      variance: 2,
    },
  },
  VIZAG_M6: {
    name: 'Vizag M6 Scenario',
    description: 'Inhibitor leak simulation with temperature rise (Vizag incident pattern)',
    temperature: {
      base: 18,
      trend: 0.08, // rising temperature
      variance: 0.8,
    },
    pressure: {
      base: 12,
      trend: 0.05, // moderate pressure increase
      variance: 1.5,
    },
    inhibitorLevel: {
      base: 200,
      trend: -1.5, // rapid depletion
      variance: 3,
    },
  },
};

export const useScenarioSimulation = (
  scenario: ScenarioType,
  updateInterval: number = 1000
) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + updateInterval / 1000); // seconds
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isActive, updateInterval]);

  const startScenario = () => {
    setIsActive(true);
    setElapsedTime(0);
  };

  const stopScenario = () => {
    setIsActive(false);
  };

  const resetScenario = () => {
    setIsActive(false);
    setElapsedTime(0);
  };

  const config = scenarios[scenario];

  const getSimulatedValue = (
    base: number,
    trend: number,
    variance: number,
    time: number
  ): number => {
    const trendValue = base + trend * time;
    const randomVariance = (Math.random() - 0.5) * variance;
    return Math.max(0, trendValue + randomVariance);
  };

  const getSimulatedData = () => {
    if (!isActive) {
      return null;
    }

    return {
      temperature: getSimulatedValue(
        config.temperature.base,
        config.temperature.trend,
        config.temperature.variance,
        elapsedTime
      ),
      pressure: getSimulatedValue(
        config.pressure.base,
        config.pressure.trend,
        config.pressure.variance,
        elapsedTime
      ),
      inhibitorLevel: getSimulatedValue(
        config.inhibitorLevel.base,
        config.inhibitorLevel.trend,
        config.inhibitorLevel.variance,
        elapsedTime
      ),
    };
  };

  return {
    scenario,
    config,
    isActive,
    elapsedTime,
    startScenario,
    stopScenario,
    resetScenario,
    getSimulatedData,
  };
};

