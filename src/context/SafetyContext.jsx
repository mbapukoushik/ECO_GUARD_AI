import { createContext, useContext, useReducer, useEffect } from 'react';

// Initial State
const initialState = {
  temperature: 25,
  pressure: 15,
  inhibitorLevel: 200,
  systemState: 'NORMAL', // NORMAL, WARNING, CRITICAL
  timestamp: Date.now(),
  scenario: 'NORMAL', // NORMAL, BHOPAL, VIZAG
  scenarioStartTime: null,
  authorizedActions: [],
  edpTotal: 12.16, // Starting EDP for prevented incidents
  historicalData: [], // Store last 5 minutes of sensor data for charts
  resolutionLogs: [], // Log entries for incident resolutions
  workers: [
    // Unit 610 (Hazard Storage) - Zone A
    { id: 1, name: 'Worker A', zone: 'A', unit: '610', safe: false, x: 120, y: 80 },
    { id: 2, name: 'Worker B', zone: 'A', unit: '610', safe: false, x: 150, y: 100 },
    { id: 3, name: 'Worker C', zone: 'A', unit: '610', safe: false, x: 180, y: 120 },
    // Unit M6 (Processing) - Zone B
    { id: 4, name: 'Worker D', zone: 'B', unit: 'M6', safe: false, x: 620, y: 80 },
    { id: 5, name: 'Worker E', zone: 'B', unit: 'M6', safe: false, x: 650, y: 100 },
    { id: 6, name: 'Worker F', zone: 'B', unit: 'M6', safe: false, x: 680, y: 120 },
    // Reactor Bay C - Zone C
    { id: 7, name: 'Worker G', zone: 'C', unit: 'Reactor', safe: false, x: 350, y: 270 },
    { id: 8, name: 'Worker H', zone: 'C', unit: 'Reactor', safe: false, x: 400, y: 300 },
    { id: 9, name: 'Worker I', zone: 'C', unit: 'Reactor', safe: false, x: 450, y: 320 },
    { id: 10, name: 'Worker J', zone: 'B', unit: 'M6', safe: false, x: 630, y: 140 }, // Additional worker in M6
  ],
};

// Action Types
const ActionTypes = {
  UPDATE_SENSORS: 'UPDATE_SENSORS',
  SET_SCENARIO: 'SET_SCENARIO',
  START_SCENARIO: 'START_SCENARIO',
  AUTHORIZE_ACTION: 'AUTHORIZE_ACTION',
  RESOLVE_INCIDENT: 'RESOLVE_INCIDENT',
  MARK_WORKER_SAFE: 'MARK_WORKER_SAFE',
  RESET: 'RESET',
};

// Bhopal Physics: T(t) = 25 + (120 - 25) × (1 - e^(-t/15))
const calculateBhopalTemperature = (elapsedSeconds) => {
  const T0 = 25; // Initial temperature
  const Tmax = 120; // Maximum temperature
  const tau = 15; // Time constant (seconds)
  const t = elapsedSeconds;
  
  return T0 + (Tmax - T0) * (1 - Math.exp(-t / tau));
};

// Vizag Physics: [TBC](t) = 200 × e^(-k × t)
const calculateVizagInhibitor = (elapsedSeconds) => {
  const initialLevel = 200; // Initial TBC level (ppm)
  const k = 0.02; // Depletion rate constant (per second)
  const t = elapsedSeconds;
  
  return initialLevel * Math.exp(-k * t);
};

// Calculate Environmental Damage Prevented (EDP)
const calculateEDP = (preventedIncident) => {
  // Vizag-scale incident prevention: ~$12.16M
  const edpValues = {
    VIZAG: 12.16, // Million USD
    BHOPAL: 45.2, // Million USD
    THERMAL_RUNAWAY: 28.9, // Million USD
    DEFAULT: 15.0, // Million USD
  };
  
  return edpValues[preventedIncident] || edpValues.DEFAULT;
};

// Calculate live EDP based on prevented incidents and time
const calculateLiveEDP = (authorizedActions, baseEDP) => {
  // Base EDP for continuous monitoring and prevention
  let liveEDP = baseEDP;
  
  // Add EDP for each authorized action
  authorizedActions.forEach(action => {
    liveEDP += action.edpValue;
  });
  
  // Continuous prevention bonus (small increment per second of safe operation in critical scenarios)
  return liveEDP;
};

// State Machine Logic
const evaluateSystemState = (temperature, pressure, inhibitorLevel) => {
  // Critical conditions
  if (temperature > 35 || pressure > 55 || inhibitorLevel < 50) {
    return 'CRITICAL';
  }
  
  // Warning conditions
  if (temperature > 25 || pressure > 25 || inhibitorLevel < 100) {
    return 'WARNING';
  }
  
  // Normal conditions
  return 'NORMAL';
};

// Reducer
const safetyReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_SENSORS: {
      const { temperature, pressure, inhibitorLevel } = action.payload;
      const systemState = evaluateSystemState(temperature, pressure, inhibitorLevel);
      const now = Date.now();
      
      // Add to historical data (keep last 5 minutes = 300 seconds = 300 data points at 1s interval)
      const newDataPoint = {
        timestamp: now,
        temperature,
        pressure,
        inhibitorLevel,
        systemState,
      };
      
      const updatedHistorical = [
        ...state.historicalData,
        newDataPoint,
      ].filter(point => now - point.timestamp <= 300000); // Keep only last 5 minutes
      
      return {
        ...state,
        temperature,
        pressure,
        inhibitorLevel,
        systemState,
        timestamp: now,
        historicalData: updatedHistorical,
      };
    }
    
    case ActionTypes.SET_SCENARIO: {
      return {
        ...state,
        scenario: action.payload,
        scenarioStartTime: null,
      };
    }
    
    case ActionTypes.START_SCENARIO: {
      return {
        ...state,
        scenarioStartTime: Date.now(),
      };
    }
    
    case ActionTypes.AUTHORIZE_ACTION: {
      const { action: actionName, preventedIncident } = action.payload;
      const edpValue = calculateEDP(preventedIncident);
      
      return {
        ...state,
        authorizedActions: [
          ...state.authorizedActions,
          {
            id: Date.now(),
            action: actionName,
            timestamp: new Date(),
            edpValue,
            preventedIncident,
          },
        ],
        edpTotal: state.edpTotal + edpValue,
      };
    }
    
    case ActionTypes.RESOLVE_INCIDENT: {
      /**
       * Resolve incident action handler
       * - Stops active scenario simulation by resetting scenario and scenarioStartTime
       * - Resets all sensor values to baseline (safe) levels
       * - Marks all workers as safe
       * - Updates EDP total with resolution impact
       * - Adds resolution log entry for audit trail
       */
      const resolutionEDP = 12.16; // Environmental Damage Prevented value in millions USD
      const timestamp = new Date();
      const resolutionLog = {
        id: Date.now(),
        timestamp,
        message: `SUCCESS: Remote intervention authorized. Personnel evacuated to Safe Assembly Point. EDP Impact: +$${resolutionEDP.toFixed(2)}M`,
      };
      
      return {
        ...state,
        // Stop scenario simulation
        scenario: 'NORMAL',
        scenarioStartTime: null,
        // Reset sensor values to baseline safe levels
        temperature: 25, // Baseline temperature in Celsius
        pressure: 15, // Baseline pressure in psi (approximately 1.0 bar)
        inhibitorLevel: 200, // Baseline TBC inhibitor level in ppm
        systemState: 'NORMAL',
        // Update worker safety status
        workers: state.workers.map(worker => ({ ...worker, safe: true })),
        // Update environmental impact metrics
        edpTotal: state.edpTotal + resolutionEDP,
        resolutionLogs: [...state.resolutionLogs, resolutionLog],
        authorizedActions: [
          ...state.authorizedActions,
          {
            id: Date.now(),
            action: 'Remote Incident Resolution',
            timestamp,
            edpValue: resolutionEDP,
            preventedIncident: 'VIZAG',
          },
        ],
      };
    }
    
    case ActionTypes.MARK_WORKER_SAFE: {
      const { workerId } = action.payload;
      return {
        ...state,
        workers: state.workers.map(worker =>
          worker.id === workerId ? { ...worker, safe: true } : worker
        ),
      };
    }
    
    case ActionTypes.RESET: {
      return initialState;
    }
    
    default:
      return state;
  }
};

// Context Creation
const SafetyContext = createContext(null);

// Safety Provider Component
export const SafetyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(safetyReducer, initialState);

  /**
   * Scenario simulation effect
   * Runs physics-based calculations for active scenarios (BHOPAL or VIZAG)
   * Updates sensor values based on elapsed time since scenario start
   * Updates occur every 1 second while scenario is active
   */
  useEffect(() => {
    if (state.scenario === 'NORMAL' || !state.scenarioStartTime) {
      return;
    }

    const interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - state.scenarioStartTime) / 1000;
      
      let newTemperature = state.temperature;
      let newPressure = state.pressure;
      let newInhibitorLevel = state.inhibitorLevel;

      if (state.scenario === 'BHOPAL') {
        // Bhopal scenario: Thermal runaway simulation
        // Temperature follows exponential rise model, pressure increases linearly
        newTemperature = Math.min(calculateBhopalTemperature(elapsedSeconds), 120);
        newPressure = Math.min(15 + elapsedSeconds * 0.3, 60);
      } else if (state.scenario === 'VIZAG') {
        // Vizag scenario: Inhibitor depletion simulation
        // TBC inhibitor depletes exponentially, temperature rises gradually
        newInhibitorLevel = Math.max(calculateVizagInhibitor(elapsedSeconds), 0);
        newTemperature = Math.min(25 + elapsedSeconds * 0.1, 40);
      }

      dispatch({
        type: ActionTypes.UPDATE_SENSORS,
        payload: {
          temperature: newTemperature,
          pressure: newPressure,
          inhibitorLevel: newInhibitorLevel,
        },
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.scenario, state.scenarioStartTime, state.temperature, state.pressure, state.inhibitorLevel]);

  /**
   * Normal operations simulation effect
   * Simulates stable sensor readings with small random variations
   * Runs when no emergency scenario is active
   * Updates occur every 2 seconds with baseline values plus small random noise
   */
  useEffect(() => {
    if (state.scenario !== 'NORMAL' || state.scenarioStartTime) {
      return;
    }

    const interval = setInterval(() => {
      dispatch({
        type: ActionTypes.UPDATE_SENSORS,
        payload: {
          temperature: 20 + (Math.random() - 0.5) * 4, // Range: 18-22°C
          pressure: 15 + (Math.random() - 0.5) * 2, // Range: 14-16 psi
          inhibitorLevel: 200 + (Math.random() - 0.5) * 20, // Range: 190-210 ppm
        },
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [state.scenario, state.scenarioStartTime]);

  const value = {
    state,
    dispatch,
    // Action creators
    updateSensors: (sensors) => dispatch({ type: ActionTypes.UPDATE_SENSORS, payload: sensors }),
    setScenario: (scenario) => dispatch({ type: ActionTypes.SET_SCENARIO, payload: scenario }),
    startScenario: () => dispatch({ type: ActionTypes.START_SCENARIO }),
    authorizeAction: (action, preventedIncident = 'DEFAULT') => 
      dispatch({ type: ActionTypes.AUTHORIZE_ACTION, payload: { action, preventedIncident } }),
    resolveIncident: () => dispatch({ type: ActionTypes.RESOLVE_INCIDENT }),
    markWorkerSafe: (workerId) => dispatch({ type: ActionTypes.MARK_WORKER_SAFE, payload: { workerId } }),
    reset: () => dispatch({ type: ActionTypes.RESET }),
  };

  return (
    <SafetyContext.Provider value={value}>
      {children}
    </SafetyContext.Provider>
  );
};

// Custom Hook
export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
};

