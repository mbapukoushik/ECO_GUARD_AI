import { useState, useEffect, useRef } from 'react';

export interface SensorData {
  temperature: number;
  pressure: number;
  inhibitorLevel: number;
  timestamp: number;
  temperatureRateOfChange: number; // dT/dt in °C/min
}

// Explicit named export for the hook
export const useSensorData = (
  updateInterval: number = 1000,
  simulatedData: { temperature: number; pressure: number; inhibitorLevel: number } | null = null
): SensorData => {
  const [data, setData] = useState<SensorData>({
    temperature: 20,
    pressure: 15,
    inhibitorLevel: 300,
    timestamp: Date.now(),
  });

  const previousDataRef = useRef<SensorData | null>(null);
  const [rateOfChange, setRateOfChange] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        // Use simulated data if provided, otherwise use normal random generation
        const newData: SensorData = simulatedData ? {
          temperature: Math.max(10, Math.min(40, simulatedData.temperature)),
          pressure: Math.max(1, Math.min(60, simulatedData.pressure)),
          inhibitorLevel: Math.max(0, Math.min(600, simulatedData.inhibitorLevel)),
          timestamp: Date.now(),
        } : {
          // Temperature: M6 Styrene tank simulation
          // Normal: 15-25°C, Warning: >25°C, Critical: >35°C
          temperature: Math.max(
            10,
            Math.min(
              40,
              prev.temperature + (Math.random() - 0.5) * 2
            )
          ),
          
          // Pressure: Bhopal E610 tank simulation
          // Normal: 2-25 psi, Critical/Pegged: >55 psi
          pressure: Math.max(
            1,
            Math.min(
              60,
              prev.pressure + (Math.random() - 0.5) * 3
            )
          ),
          
          // Inhibitor Level: TBC depletion tracking
          // Normal: 100-500 ppm, Alert: <50 ppm
          inhibitorLevel: Math.max(
            0,
            Math.min(
              600,
              prev.inhibitorLevel + (Math.random() - 0.52) * 5 // Slight downward trend
            )
          ),
          
          timestamp: Date.now(),
        };

        // Calculate rate of change (dT/dt) in °C/min
        if (previousDataRef.current) {
          const timeDiffMinutes = (newData.timestamp - previousDataRef.current.timestamp) / 60000;
          const tempDiff = newData.temperature - previousDataRef.current.temperature;
          const rate = timeDiffMinutes > 0 ? tempDiff / timeDiffMinutes : 0;
          setRateOfChange(rate);
        }

        previousDataRef.current = newData;
        return newData;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval, simulatedData]);

  return {
    ...data,
    temperatureRateOfChange: rateOfChange,
  };
};

