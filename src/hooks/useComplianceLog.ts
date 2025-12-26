import { useState, useEffect, useRef } from 'react';
import { SystemState } from './useStateMachine';

export interface LogEntry {
  id: string;
  timestamp: Date;
  previousState: SystemState | null;
  newState: SystemState;
  cryptographicHash: string;
  sensorSnapshot: {
    temperature: number;
    pressure: number;
    inhibitorLevel: number;
  };
  type: 'state_change' | 'authorization';
  authorizationAction?: string;
}

// Mock cryptographic hash generator (SHA-256 style)
const generateHash = (data: string): string => {
  // In a real implementation, this would use actual crypto
  // For now, we'll generate a mock hash that looks realistic
  const hash = btoa(data + Date.now().toString())
    .replace(/[^a-f0-9]/gi, '')
    .substring(0, 64)
    .toLowerCase();
  
  // Format as SHA-256 style
  return Array.from({ length: 8 }, (_, i) => 
    hash.substring(i * 8, (i + 1) * 8)
  ).join(':');
};

export const useComplianceLog = (currentState: SystemState, sensorData: {
  temperature: number;
  pressure: number;
  inhibitorLevel: number;
}) => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const previousStateRef = useRef<SystemState | null>(null);

  useEffect(() => {
    // Only log when state actually changes
    if (previousStateRef.current !== currentState) {
      const entry: LogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        previousState: previousStateRef.current,
        newState: currentState,
        cryptographicHash: generateHash(
          `${previousStateRef.current || 'INIT'}-${currentState}-${sensorData.temperature}-${sensorData.pressure}-${sensorData.inhibitorLevel}-${Date.now()}`
        ),
        sensorSnapshot: {
          temperature: sensorData.temperature,
          pressure: sensorData.pressure,
          inhibitorLevel: sensorData.inhibitorLevel,
        },
        type: 'state_change',
      };

      setLogEntries((prev) => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
      previousStateRef.current = currentState;
    }
  }, [currentState, sensorData]);

  const addAuthorizationEntry = (action: string) => {
    const entry: LogEntry = {
      id: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      previousState: currentState,
      newState: currentState,
      cryptographicHash: generateHash(
        `AUTHORIZATION-${action}-${currentState}-${sensorData.temperature}-${sensorData.pressure}-${sensorData.inhibitorLevel}-${Date.now()}`
      ),
      sensorSnapshot: {
        temperature: sensorData.temperature,
        pressure: sensorData.pressure,
        inhibitorLevel: sensorData.inhibitorLevel,
      },
      type: 'authorization',
      authorizationAction: action,
    };

    setLogEntries((prev) => [entry, ...prev].slice(0, 100));
  };

  return { logEntries, addAuthorizationEntry };
};

