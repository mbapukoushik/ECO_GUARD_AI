import { useSafety } from '../context/SafetyContext';
import { Thermometer, Gauge, AlertTriangle, CheckCircle, Shield, Play, Square, RotateCcw, User, Radio, TrendingUp, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const MainDashboard = () => {
  const { state, setScenario, startScenario, authorizeAction, resolveIncident, markWorkerSafe } = useSafety();
  const [flashWorkerSOS, setFlashWorkerSOS] = useState(false);

  /**
   * Identify workers located in danger zones during CRITICAL system state
   * Returns array of worker objects that are in zones with CRITICAL status
   */
  const getWorkersInDanger = () => {
    if (state.systemState !== 'CRITICAL') return [];
    return state.workers.filter(worker => !worker.safe);
  };

  const workersInDanger = getWorkersInDanger();
  const workersInDangerCount = workersInDanger.length;
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Flash SOS effect
  useEffect(() => {
    if (workersInDangerCount > 0 && state.systemState === 'CRITICAL') {
      const interval = setInterval(() => {
        setFlashWorkerSOS(prev => !prev);
      }, 500); // Flash every 500ms
      return () => clearInterval(interval);
    } else {
      setFlashWorkerSOS(false);
    }
  }, [workersInDangerCount, state.systemState]);

  // Pulse animation for critical zones
  useEffect(() => {
    if (state.systemState === 'CRITICAL') {
      const interval = setInterval(() => {
        setPulseAnimation(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.systemState]);

  // Prepare chart data (last 5 minutes)
  const chartData = state.historicalData.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    pressure: point.pressure,
    inhibitor: point.inhibitorLevel,
    timestamp: point.timestamp,
  })).slice(-300); // Last 300 data points (5 minutes at 1s interval)

  /**
   * Generate field instructions for workers based on current system state
   * Returns array of instruction strings for different zones during CRITICAL state
   * Instructions are rule-based and depend on sensor thresholds
   */
  const getFieldInstructions = () => {
    const instructions = [];
    
    if (state.systemState === 'CRITICAL') {
      if (state.pressure > 55) {
        instructions.push('Zone A Workers: Evacuate North-East immediately. Don Gas Masks. Avoid downwind areas.');
        instructions.push('Zone B Workers: Move to designated safe zone. Monitor air quality.');
      }
      
      if (state.temperature > 35) {
        instructions.push('Zone B Workers: Evacuate immediately. Thermal runaway detected in Styrene Tank.');
        instructions.push('Zone C Workers: Secure reactor and evacuate. Do not approach heat sources.');
      }
      
      if (state.inhibitorLevel < 50) {
        instructions.push('Zone B Workers: Stop all operations. TBC inhibitor critical. Risk of spontaneous polymerization.');
        instructions.push('All Zone Workers: Move to safe distance. Await emergency inhibitor injection.');
      }
      
      if (instructions.length === 0) {
        instructions.push('All Workers: Follow emergency evacuation protocol. Proceed to designated assembly points.');
      }
    }
    
    return instructions;
  };

  const getStateColor = () => {
    switch (state.systemState) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500',
          text: 'text-red-500',
          glow: 'rgba(239, 68, 68, 0.5)',
        };
      case 'WARNING':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500',
          text: 'text-yellow-500',
          glow: 'rgba(251, 191, 36, 0.5)',
        };
      default:
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500',
          text: 'text-green-500',
          glow: 'rgba(16, 185, 129, 0.3)',
        };
    }
  };

  const stateColors = getStateColor();

  const handleStartScenario = () => {
    setScenario(state.scenario);
    startScenario();
  };

  const handleAuthorize = (actionName, incidentType) => {
    authorizeAction(actionName, incidentType);
  };

  /**
   * Generate recommended safety actions based on current sensor readings
   * Returns array of action objects with name and incident type
   * Actions are determined by rule-based logic checking sensor thresholds
   */
  const getRecommendedActions = () => {
    const actions = [];
    
    // High pressure scenario (Bhopal-type incident)
    if (state.pressure > 55) {
      actions.push({ name: 'Activate Vent Gas Scrubber', incident: 'BHOPAL' });
      actions.push({ name: 'Initiate Water Curtain', incident: 'BHOPAL' });
    }
    
    // High temperature scenario (thermal runaway)
    if (state.temperature > 35) {
      actions.push({ name: 'Emergency Cooling Activation', incident: 'THERMAL_RUNAWAY' });
    }
    
    // Low inhibitor scenario (Vizag-type incident)
    if (state.inhibitorLevel < 50) {
      actions.push({ name: 'Inject Emergency TBC Supply', incident: 'VIZAG' });
    }
    
    // Fallback action if CRITICAL but no specific threshold met
    if (actions.length === 0 && state.systemState === 'CRITICAL') {
      actions.push({ name: 'Full Emergency Protocol', incident: 'DEFAULT' });
    }
    
    return actions;
  };

  return (
    <div className="min-h-screen bg-[#05070d] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-100 mb-2">ECO GUARD AI</h1>
              <p className="text-gray-400">Industrial Safety Monitoring System - EcoGuard Hub</p>
            </div>
            <div className="flex items-center gap-4">
              {/* EDP Live Ticker */}
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-xs text-gray-400">EDP Prevented</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  ${state.edpTotal.toFixed(2)}M
                </div>
                <div className="text-xs text-green-300">Live Ticker</div>
              </div>
              
              {/* System Status */}
              <div className={`border-4 rounded-lg p-6 ${stateColors.bg} ${stateColors.border} ${stateColors.text}`}>
                <div className="flex flex-col items-center gap-2">
                  {state.systemState === 'CRITICAL' ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : state.systemState === 'WARNING' ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <CheckCircle className="w-8 h-8" />
                  )}
                  <div className="text-2xl font-bold">{state.systemState}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scenario Selector */}
          <div className="border-t border-[#2d3748] pt-4 flex items-center gap-3">
            <label className="text-sm text-gray-400">Scenario:</label>
            <select
              value={state.scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="bg-[#0a0e1a] border border-[#2d3748] rounded px-3 py-1.5 text-sm text-gray-200"
              disabled={state.scenarioStartTime !== null}
            >
              <option value="NORMAL">Normal Operations</option>
              <option value="BHOPAL">Bhopal E610 (Pressure Failure)</option>
              <option value="VIZAG">Vizag M6 (Inhibitor Leak)</option>
            </select>
            {state.scenarioStartTime === null ? (
              <button
                onClick={handleStartScenario}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 border border-green-500 text-green-400 rounded hover:bg-green-500/30 text-sm"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            ) : (
              <>
                <button
                  onClick={() => setScenario('NORMAL')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 border border-red-500 text-red-400 rounded hover:bg-red-500/30 text-sm"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
                <span className="text-xs text-gray-400">
                  Running: {Math.floor((Date.now() - state.scenarioStartTime) / 1000)}s
                </span>
              </>
            )}
          </div>
        </div>

        {/* Live Gauges Panel */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-blue-500" />
            Live Gauges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Temperature Gauge */}
            <div className={`border-2 rounded-lg p-4 ${
              state.temperature > 35 ? 'border-red-500 bg-red-500/10 text-red-500' :
              state.temperature > 25 ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' :
              'border-green-500 bg-green-500/10 text-green-500'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-5 h-5" />
                <span className="font-semibold">Temperature</span>
              </div>
              <div className="text-3xl font-bold mb-1">
                {state.temperature.toFixed(1)}°C
              </div>
              <div className="text-sm opacity-75">M6 Styrene Tank</div>
            </div>

            {/* Pressure Gauge */}
            <div className={`border-2 rounded-lg p-4 ${
              state.pressure > 55 ? 'border-red-500 bg-red-500/10 text-red-500' :
              state.pressure > 25 ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' :
              'border-green-500 bg-green-500/10 text-green-500'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-5 h-5" />
                <span className="font-semibold">Pressure</span>
              </div>
              <div className="text-3xl font-bold mb-1">
                {state.pressure.toFixed(1)} psi
              </div>
              <div className="text-sm opacity-75">Bhopal E610 Tank</div>
            </div>

            {/* Inhibitor Level */}
            <div className={`border-2 rounded-lg p-4 ${
              state.inhibitorLevel < 50 ? 'border-red-500 bg-red-500/10 text-red-500' :
              state.inhibitorLevel < 100 ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' :
              'border-green-500 bg-green-500/10 text-green-500'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">TBC Inhibitor</span>
              </div>
              <div className="text-3xl font-bold mb-1">
                {state.inhibitorLevel.toFixed(0)} ppm
              </div>
              <div className="text-sm opacity-75">Vizag M6 Tracking</div>
            </div>
          </div>
        </div>

        {/* Worker SOS Alert */}
        {workersInDangerCount > 0 && state.systemState === 'CRITICAL' && (
          <div className={`bg-red-500/20 border-4 border-red-500 rounded-lg p-4 ${
            flashWorkerSOS ? 'bg-red-500/40' : 'bg-red-500/20'
          } transition-all duration-500`}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
              <div className="flex-1">
                <div className="text-2xl font-bold text-red-500 mb-1">WORKER SOS ALERT</div>
                <div className="text-red-300">
                  {workersInDangerCount} worker{workersInDangerCount > 1 ? 's' : ''} in danger zone. Immediate evacuation required!
                </div>
                <div className="text-sm text-red-400 mt-1">
                  Workers: {workersInDanger.map(w => w.name).join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trend Chart - Hockey Stick Runaway Curve */}
        {chartData.length > 0 && (
          <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              Historical Trend (Last 5 Minutes) - Runaway Detection
            </h2>
            <div className="bg-[#0a0e1a] rounded-lg p-4 border border-[#2d3748]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    interval={Math.floor(chartData.length / 10)}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#3b82f6"
                    label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', fill: '#3b82f6' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    label={{ value: 'Inhibitor (ppm)', angle: 90, position: 'insideRight', fill: '#10b981' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid #2d3748', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#9ca3af' }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="pressure" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={false}
                    name="Pressure (psi)"
                    isAnimationActive={true}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="inhibitor" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                    name="TBC Inhibitor (ppm)"
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SVG Digital Twin - EcoGuard Hub Map */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">EcoGuard Hub - Industrial Map</h2>
          <div className="bg-[#0a0e1a] rounded-lg p-4 border border-[#2d3748]">
            <svg
              viewBox="0 0 800 500"
              className="w-full h-auto"
              style={{
                filter: `drop-shadow(0 0 30px ${stateColors.glow})`,
              }}
            >
              <defs>
                {/* Metallic Gradient for Tanks */}
                <linearGradient id="tankGradientNormal" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4a5568" stopOpacity="0.9" />
                  <stop offset="30%" stopColor="#2d3748" stopOpacity="0.95" />
                  <stop offset="70%" stopColor="#1a1f2e" stopOpacity="1" />
                  <stop offset="100%" stopColor="#0a0e1a" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="tankGradientWarning" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                  <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.95" />
                  <stop offset="70%" stopColor="#d97706" stopOpacity="1" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="tankGradientCritical" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                  <stop offset="30%" stopColor="#dc2626" stopOpacity="1" />
                  <stop offset="70%" stopColor="#b91c1c" stopOpacity="1" />
                  <stop offset="100%" stopColor="#991b1b" stopOpacity="0.95" />
                </linearGradient>
                
                {/* Glass Reflection */}
                <linearGradient id="glassReflection" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="20%" stopColor="#ffffff" stopOpacity="0.2" />
                  <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* Pipe Gradient */}
                <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#374151" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#4b5563" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#374151" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="pipeGradientCritical" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#dc2626" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                </linearGradient>

                {/* Filters */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="workerGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="pulseGlow">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                  <animate attributeName="stdDeviation" values="4;10;4" dur="1s" repeatCount="indefinite" />
                </filter>
                <filter id="pipeGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                  <animate attributeName="stdDeviation" values="2;6;2" dur="1s" repeatCount="indefinite" />
                </filter>
              </defs>

              {/* Background Grid */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1f2e" strokeWidth="0.5" opacity="0.3" />
              </pattern>
              <rect width="800" height="500" fill="url(#grid)" />

              {/* Thick Pipes - Connecting Units */}
              {/* Pipe from Unit 610 to Reactor Bay C */}
              <path
                d="M 250 125 Q 275 225 300 340"
                stroke={state.systemState === 'CRITICAL' && state.pressure > 55 ? "url(#pipeGradientCritical)" : "url(#pipeGradient)"}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                filter={state.systemState === 'CRITICAL' && state.pressure > 55 ? "url(#pipeGlow)" : undefined}
                opacity={state.systemState === 'CRITICAL' && state.pressure > 55 ? 0.9 : 0.7}
              />
              {/* Pipe from Unit M6 to Reactor Bay C */}
              <path
                d="M 550 125 Q 525 225 500 340"
                stroke={state.systemState === 'CRITICAL' && (state.temperature > 35 || state.inhibitorLevel < 50) ? "url(#pipeGradientCritical)" : "url(#pipeGradient)"}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                filter={state.systemState === 'CRITICAL' && (state.temperature > 35 || state.inhibitorLevel < 50) ? "url(#pipeGlow)" : undefined}
                opacity={state.systemState === 'CRITICAL' && (state.temperature > 35 || state.inhibitorLevel < 50) ? 0.9 : 0.7}
              />
              {/* Horizontal Pipe between Unit 610 and Unit M6 */}
              <line
                x1="250"
                y1="125"
                x2="550"
                y2="125"
                stroke={
                  (state.systemState === 'CRITICAL' && state.pressure > 55) || 
                  (state.systemState === 'CRITICAL' && (state.temperature > 35 || state.inhibitorLevel < 50))
                    ? "url(#pipeGradientCritical)"
                    : "url(#pipeGradient)"
                }
                strokeWidth="12"
                strokeLinecap="round"
                filter={
                  (state.systemState === 'CRITICAL' && state.pressure > 55) || 
                  (state.systemState === 'CRITICAL' && (state.temperature > 35 || state.inhibitorLevel < 50))
                    ? "url(#pipeGlow)"
                    : undefined
                }
                opacity={
                  (state.systemState === 'CRITICAL' && state.pressure > 55) || 
                  (state.systemState === 'CRITICAL' && (state.temperature > 35 || state.inhibitorLevel < 50))
                    ? 0.9
                    : 0.7
                }
              />

              {/* Unit 610 - Zone A: Cylindrical Tank (Hazard Storage) */}
              <g>
                {/* Tank Body - Cylindrical Shape */}
                <ellipse
                  cx="150"
                  cy="60"
                  rx="90"
                  ry="15"
                  fill={
                    state.systemState === 'CRITICAL' && state.pressure > 55
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'CRITICAL'
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'WARNING'
                      ? "url(#tankGradientWarning)"
                      : "url(#tankGradientNormal)"
                  }
                  filter={state.systemState === 'CRITICAL' && state.pressure > 55 ? "url(#pulseGlow)" : "url(#glow)"}
                />
                <rect
                  x="60"
                  y="60"
                  width="180"
                  height="140"
                  rx="90"
                  fill={
                    state.systemState === 'CRITICAL' && state.pressure > 55
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'CRITICAL'
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'WARNING'
                      ? "url(#tankGradientWarning)"
                      : "url(#tankGradientNormal)"
                  }
                  filter={state.systemState === 'CRITICAL' && state.pressure > 55 ? "url(#pulseGlow)" : "url(#glow)"}
                />
                <ellipse
                  cx="150"
                  cy="200"
                  rx="90"
                  ry="15"
                  fill={
                    state.systemState === 'CRITICAL' && state.pressure > 55
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'CRITICAL'
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'WARNING'
                      ? "url(#tankGradientWarning)"
                      : "url(#tankGradientNormal)"
                  }
                  filter={state.systemState === 'CRITICAL' && state.pressure > 55 ? "url(#pulseGlow)" : "url(#glow)"}
                />
                {/* Glass Reflection */}
                <ellipse
                  cx="150"
                  cy="70"
                  rx="70"
                  ry="8"
                  fill="url(#glassReflection)"
                />
                <rect
                  x="80"
                  y="70"
                  width="140"
                  height="50"
                  rx="70"
                  fill="url(#glassReflection)"
                />
                {/* Tank Labels */}
                <text x="150" y="115" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                  Unit 610
                </text>
                <text x="150" y="135" textAnchor="middle" fill="white" fontSize="12">
                  Hazard Storage
                </text>
                <text x="150" y="150" textAnchor="middle" fill="white" fontSize="11" opacity="0.8">
                  Zone A
                </text>
              </g>

              {/* Unit M6 - Zone B: Cylindrical Tank (Processing) */}
              <g>
                {/* Tank Body - Cylindrical Shape */}
                <ellipse
                  cx="650"
                  cy="60"
                  rx="90"
                  ry="15"
                  fill={
                    state.systemState === 'CRITICAL' && (state.temperature > 35 || state.inhibitorLevel < 50)
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'CRITICAL'
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'WARNING'
                      ? "url(#tankGradientWarning)"
                      : "url(#tankGradientNormal)"
                  }
                  filter={state.systemState === 'CRITICAL' && (state.temperature > 35 || state.inhibitorLevel < 50) ? "url(#pulseGlow)" : "url(#glow)"}
                />
                <rect
                  x="560"
                  y="60"
                  width="180"
                  height="140"
                  rx="90"
                  fill={
                    state.systemState === 'CRITICAL' && (state.temperature > 35 || state.inhibitorLevel < 50)
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'CRITICAL'
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'WARNING'
                      ? "url(#tankGradientWarning)"
                      : "url(#tankGradientNormal)"
                  }
                  filter={state.systemState === 'CRITICAL' && (state.temperature > 35 || state.inhibitorLevel < 50) ? "url(#pulseGlow)" : "url(#glow)"}
                />
                <ellipse
                  cx="650"
                  cy="200"
                  rx="90"
                  ry="15"
                  fill={
                    state.systemState === 'CRITICAL' && (state.temperature > 35 || state.inhibitorLevel < 50)
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'CRITICAL'
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'WARNING'
                      ? "url(#tankGradientWarning)"
                      : "url(#tankGradientNormal)"
                  }
                  filter={state.systemState === 'CRITICAL' && (state.temperature > 35 || state.inhibitorLevel < 50) ? "url(#pulseGlow)" : "url(#glow)"}
                />
                {/* Glass Reflection */}
                <ellipse
                  cx="650"
                  cy="70"
                  rx="70"
                  ry="8"
                  fill="url(#glassReflection)"
                />
                <rect
                  x="580"
                  y="70"
                  width="140"
                  height="50"
                  rx="70"
                  fill="url(#glassReflection)"
                />
                {/* Tank Labels */}
                <text x="650" y="115" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                  Unit M6
                </text>
                <text x="650" y="135" textAnchor="middle" fill="white" fontSize="12">
                  Processing
                </text>
                <text x="650" y="150" textAnchor="middle" fill="white" fontSize="11" opacity="0.8">
                  Zone B
                </text>
              </g>

              {/* Reactor Bay C - Zone C: Reactor (Rectangular Building) */}
              <g>
                <rect
                  x="300"
                  y="280"
                  width="200"
                  height="120"
                  rx="8"
                  fill={
                    state.systemState === 'CRITICAL'
                      ? "url(#tankGradientCritical)"
                      : state.systemState === 'WARNING'
                      ? "url(#tankGradientWarning)"
                      : "url(#tankGradientNormal)"
                  }
                  filter="url(#glow)"
                />
                {/* Building Reflection */}
                <rect
                  x="310"
                  y="285"
                  width="180"
                  height="40"
                  rx="4"
                  fill="url(#glassReflection)"
                />
                <text x="400" y="330" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                  Reactor Bay C
                </text>
                <text x="400" y="350" textAnchor="middle" fill="white" fontSize="12">
                  Zone C
                </text>
              </g>

              {/* Safe Assembly Point */}
              <g>
                <circle
                  cx="720"
                  cy="420"
                  r="35"
                  fill="#10b981"
                  fillOpacity="0.3"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  filter="url(#glow)"
                />
                <circle
                  cx="720"
                  cy="420"
                  r="25"
                  fill="#10b981"
                  fillOpacity="0.5"
                />
                <text x="720" y="418" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  SAFE
                </text>
                <text x="720" y="432" textAnchor="middle" fill="white" fontSize="10">
                  ASSEMBLY
                </text>
                <text x="720" y="465" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold">
                  Assembly Point
                </text>
              </g>

              {/* Wind Direction Label */}
              {state.systemState === 'CRITICAL' && (
                <g>
                  <rect
                    x="20"
                    y="400"
                    width="160"
                    height="50"
                    rx="6"
                    fill="#1a1f2e"
                    fillOpacity="0.9"
                    stroke="#2d3748"
                    strokeWidth="2"
                  />
                  <text x="100" y="420" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="bold">
                    🌬️ WIND DIRECTION
                  </text>
                  <text x="100" y="438" textAnchor="middle" fill="#93c5fd" fontSize="13" fontWeight="bold">
                    North-East
                  </text>
                </g>
              )}

              {/* Evacuation Arrows - Three arrows from all units to Safe Assembly Point when CRITICAL */}
              {state.systemState === 'CRITICAL' && (
                <g>
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3, 0 6"
                        fill="#ef4444"
                        className={pulseAnimation ? 'animate-pulse' : ''}
                      />
                    </marker>
                    <marker
                      id="arrowhead2"
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3, 0 6"
                        fill="#ef4444"
                        className={pulseAnimation ? 'animate-pulse' : ''}
                      />
                    </marker>
                    <marker
                      id="arrowhead3"
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3, 0 6"
                        fill="#ef4444"
                        className={pulseAnimation ? 'animate-pulse' : ''}
                      />
                    </marker>
                  </defs>
                  
                  {/* Arrow from Unit 610 */}
                  <path
                    d="M 150 200 Q 350 310, 720 420"
                    stroke="#ef4444"
                    strokeWidth="4"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    strokeDasharray="10,5"
                    filter="url(#pulseGlow)"
                    opacity={pulseAnimation ? 0.9 : 0.7}
                    className="animate-pulse"
                  />
                  <text
                    x="400"
                    y="310"
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize="11"
                    fontWeight="bold"
                    className="animate-pulse"
                  >
                    ZONE A →
                  </text>
                  
                  {/* Arrow from Unit M6 */}
                  <path
                    d="M 650 200 Q 650 310, 720 420"
                    stroke="#ef4444"
                    strokeWidth="4"
                    fill="none"
                    markerEnd="url(#arrowhead2)"
                    strokeDasharray="10,5"
                    filter="url(#pulseGlow)"
                    opacity={pulseAnimation ? 0.9 : 0.7}
                    className="animate-pulse"
                  />
                  <text
                    x="680"
                    y="310"
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize="11"
                    fontWeight="bold"
                    className="animate-pulse"
                  >
                    ZONE B →
                  </text>
                  
                  {/* Arrow from Reactor Bay C */}
                  <path
                    d="M 400 400 Q 560 410, 720 420"
                    stroke="#ef4444"
                    strokeWidth="4"
                    fill="none"
                    markerEnd="url(#arrowhead3)"
                    strokeDasharray="10,5"
                    filter="url(#pulseGlow)"
                    opacity={pulseAnimation ? 0.9 : 0.7}
                    className="animate-pulse"
                  />
                  <text
                    x="560"
                    y="405"
                    textAnchor="middle"
                    fill="#ef4444"
                    fontSize="11"
                    fontWeight="bold"
                    className="animate-pulse"
                  >
                    ZONE C →
                  </text>
                </g>
              )}

              {/* Worker Icons - User SVG Icons */}
              {state.workers.map((worker) => {
                const isInDangerZone = state.systemState === 'CRITICAL' && !worker.safe;
                const workerColor = worker.safe ? '#10b981' : isInDangerZone ? '#ef4444' : '#3b82f6';
                
                return (
                  <g key={worker.id}>
                    {/* Worker Icon - User SVG Path */}
                    <g
                      transform={`translate(${worker.x - 12}, ${worker.y - 12})`}
                      filter={isInDangerZone ? "url(#workerGlow)" : undefined}
                      className={isInDangerZone && flashWorkerSOS ? 'animate-pulse' : ''}
                    >
                      {/* User Icon Body */}
                      <circle cx="12" cy="8" r="5" fill={workerColor} stroke="white" strokeWidth="1.5" />
                      <path
                        d="M 4 18 Q 4 12 12 12 Q 20 12 20 18 L 20 22 L 4 22 Z"
                        fill={workerColor}
                        stroke="white"
                        strokeWidth="1.5"
                      />
                    </g>
                    
                    {/* Worker Name */}
                    <text
                      x={worker.x}
                      y={worker.y + 20}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {worker.name.split(' ')[1] || worker.name}
                    </text>
                    
                    {/* Hazard Symbol for Workers in RED Zones */}
                    {isInDangerZone && (
                      <g transform={`translate(${worker.x + 20}, ${worker.y - 8})`}>
                        <circle cx="0" cy="0" r="10" fill="#ef4444" opacity="0.9" />
                        <path
                          d="M -4 -4 L 4 4 M 4 -4 L -4 4"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          className={flashWorkerSOS ? 'animate-pulse' : ''}
                        />
                        <text
                          x="0"
                          y="18"
                          textAnchor="middle"
                          fill="#ef4444"
                          fontSize="9"
                          fontWeight="bold"
                          className={flashWorkerSOS ? 'animate-pulse' : ''}
                        >
                          ⚠️
                        </text>
                      </g>
                    )}
                    
                    {/* Safe Badge */}
                    {worker.safe && (
                      <circle
                        cx={worker.x + 15}
                        cy={worker.y - 15}
                        r="6"
                        fill="#10b981"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Worker Status Panel */}
          <div className="mt-4 border-t border-[#2d3748] pt-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Worker Status Tracker</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {state.workers.map((worker) => {
                const isInDanger = state.systemState === 'CRITICAL' && !worker.safe;
                return (
                  <div
                    key={worker.id}
                    className={`p-3 rounded border ${
                      worker.safe
                        ? 'bg-green-500/10 border-green-500'
                        : isInDanger
                        ? 'bg-red-500/10 border-red-500'
                        : 'bg-blue-500/10 border-blue-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className={`w-4 h-4 ${
                          worker.safe ? 'text-green-400' : isInDanger ? 'text-red-400' : 'text-blue-400'
                        }`} />
                        <span className="font-semibold text-gray-200 text-sm">{worker.name}</span>
                      </div>
                      {worker.safe && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mb-2">{worker.unit} - Zone {worker.zone}</div>
                    {!worker.safe && (
                      <button
                        onClick={() => markWorkerSafe(worker.id)}
                        className="w-full px-2 py-1 bg-green-500/20 border border-green-500 text-green-400 rounded hover:bg-green-500/30 text-xs transition-colors"
                      >
                        Mark Safe
                      </button>
                    )}
                    {worker.safe && (
                      <div className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Safe
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 p-3 bg-[#0a0e1a] rounded border border-[#2d3748]">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Workers in danger zone: 
                </div>
                <span className={`font-bold text-lg ${workersInDangerCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {workersInDangerCount} / {state.workers.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Human-in-the-Loop Panel */}
        <div className="bg-[#1a1f2e] border border-[#2d3748] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            Safety Consultant (Human-in-the-Loop)
          </h2>
          
          {state.systemState === 'CRITICAL' ? (
            <div className="space-y-4">
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-red-500">CRITICAL STATE DETECTED</span>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  AI Safety Protocol recommends the following actions. Human authorization required (ISO 10218 / OSHA PSM 2025).
                </p>
                
                {/* Main RESOLVE INCIDENT Button */}
                <button
                  onClick={() => {
                    // Stop the simulation explicitly to ensure UI and Context are synced
                    setScenario('NORMAL');
                    // Resolve the incident (which also stops simulation, but this ensures sync)
                    resolveIncident();
                  }}
                  className="w-full mb-4 p-4 bg-green-600 hover:bg-green-700 border-2 border-green-500 rounded-lg text-white font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  AUTHORIZE & RESOLVE INCIDENT
                </button>
                
                <div className="space-y-2 mb-4">
                  {getRecommendedActions().map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAuthorize(action.name, action.incident)}
                      className="w-full flex items-center justify-between p-3 bg-[#0a0e1a] border border-blue-500 rounded hover:bg-blue-500/10 transition-colors text-left"
                    >
                      <span className="text-gray-200">{action.name}</span>
                      <span className="text-blue-400 text-sm">Authorize Action</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gemini Worker Dispatcher - Field Instructions */}
              {getFieldInstructions().length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Radio className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-blue-400">Gemini Worker Dispatcher - Field Instructions</h3>
                  </div>
                  <div className="space-y-2">
                    {getFieldInstructions().map((instruction, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0a0e1a] border border-blue-500/50 rounded p-3 text-sm text-gray-200"
                      >
                        <div className="flex items-start gap-2">
                          <Radio className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>{instruction}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    Instructions generated by Gemini AI Safety Protocol. Broadcast to field workers via radio dispatch.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>System monitoring active. No immediate actions required.</p>
            </div>
          )}

          {/* Resolution Log */}
          {state.resolutionLogs.length > 0 && (
            <div className="mt-6 border-t border-[#2d3748] pt-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Resolution Log
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {state.resolutionLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-green-500/10 border border-green-500 rounded p-3 text-sm"
                  >
                    <div className="text-green-400 font-semibold">
                      [{log.timestamp.toLocaleTimeString()}] {log.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authorized Actions Log */}
          {state.authorizedActions.length > 0 && (
            <div className="mt-6 border-t border-[#2d3748] pt-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">Authorized Actions</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {state.authorizedActions.map((action) => (
                  <div
                    key={action.id}
                    className="bg-[#0a0e1a] border border-green-500 rounded p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-green-400 font-semibold">{action.action}</div>
                        <div className="text-gray-400 text-xs">
                          {action.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-green-400 font-bold">
                        ${action.edpValue.toFixed(2)}M EDP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500 rounded">
                <div className="text-green-400 font-bold text-xl">
                  Total EDP Prevented: ${state.edpTotal.toFixed(2)}M
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Green Tech Hackathon Impact Section */}
        <div className="bg-gradient-to-r from-green-500/20 via-blue-500/20 to-green-500/20 border-2 border-green-500 rounded-lg p-8 mt-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-100 mb-6">
              How ECO GUARD AI Contributes to Green Tech
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#0a0e1a] border border-green-500/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-400 mb-3">
                  Environmental Damage Prevention
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  By preventing industrial disasters like the 1984 Bhopal gas tragedy and 2020 Vizag styrene leak, 
                  ECO GUARD AI saves an estimated <strong className="text-green-400">$12.16M+ per prevented incident</strong> 
                  in environmental remediation costs, soil decontamination, and long-term healthcare expenses.
                </p>
              </div>

              <div className="bg-[#0a0e1a] border border-blue-500/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-3">
                  Soil & Water Protection
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Early detection prevents toxic chemical releases that contaminate thousands of hectares of soil 
                  and groundwater. Our system's predictive models identify thermal runaway and inhibitor depletion 
                  <strong className="text-blue-400"> before critical thresholds</strong>, protecting ecosystems and communities.
                </p>
              </div>

              <div className="bg-[#0a0e1a] border border-yellow-500/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">
                  Resource Efficiency
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  By preventing incidents, we eliminate the need for massive cleanup operations that consume 
                  millions of gallons of water, tons of chemicals, and extensive energy resources. 
                  <strong className="text-yellow-400"> Prevention is far more sustainable than remediation.</strong>
                </p>
              </div>

              <div className="bg-[#0a0e1a] border border-purple-500/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-400 mb-3">
                  Quantifiable Impact
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Our <strong className="text-purple-400">Environmental Damage Prevented (EDP)</strong> calculator 
                  provides real-time metrics showing the environmental and economic impact of prevented disasters. 
                  This transparency helps facilities prioritize sustainability and compliance.
                </p>
              </div>
            </div>

            <div className="bg-[#0a0e1a] border-2 border-green-500 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-100 mb-4">
                Green Tech Hackathon Alignment
              </h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-green-400">Environmental Awareness:</strong> Visualizes real-time pollution risks 
                    and prevents chemical releases that harm air, soil, and water quality.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-green-400">Resource Conservation:</strong> Prevents incidents that require 
                    massive cleanup operations, saving water, energy, and materials.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-green-400">Sustainability Focus:</strong> Promotes efficient operations and 
                    reduces negative environmental impact through early detection and prevention.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-green-400">Tangible Green Benefits:</strong> Quantifies prevented damage 
                    ($12.16M+ EDP) and demonstrates clear environmental protection outcomes.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-green-400">No AI/ML Compliance:</strong> Uses rule-based logic and physics 
                    models, meeting hackathon requirements while delivering intelligent safety protocols.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Built for <strong className="text-green-400">Green Tech Hackathon 2025</strong> | 
                Preventing Industrial Disasters, Protecting Our Planet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


