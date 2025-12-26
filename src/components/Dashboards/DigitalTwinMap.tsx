import { MapPin, Factory } from 'lucide-react';
import { SystemState } from '../../hooks/useStateMachine';

interface DigitalTwinMapProps {
  systemState: SystemState;
}

export const DigitalTwinMap = ({ systemState }: DigitalTwinMapProps) => {
  const getZoneColor = (zone: 'A' | 'B' | 'C'): string => {
    // All zones reflect the overall system state
    switch (systemState) {
      case 'CRITICAL':
        return '#ef4444'; // red-500
      case 'WARNING':
        return '#fbbf24'; // yellow-500
      default:
        return '#10b981'; // green-500
    }
  };

  const getGlowColor = (): string => {
    switch (systemState) {
      case 'CRITICAL':
        return 'rgba(239, 68, 68, 0.5)'; // red glow
      case 'WARNING':
        return 'rgba(251, 191, 36, 0.5)'; // yellow glow
      default:
        return 'rgba(16, 185, 129, 0.3)'; // green glow
    }
  };

  const zoneA = getZoneColor('A');
  const zoneB = getZoneColor('B');
  const zoneC = getZoneColor('C');
  const glowColor = getGlowColor();

  return (
    <div className="bg-industrial-panel border border-industrial-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Factory className="w-6 h-6 text-industrial-accent" />
        <h2 className="text-2xl font-bold text-gray-100">2D Digital Twin Map</h2>
      </div>

      <div className="relative bg-industrial-darker rounded-lg p-4 border border-industrial-border">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-auto"
          style={{
            filter: `drop-shadow(0 0 20px ${glowColor})`,
          }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2d3748" strokeWidth="1" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <rect width="800" height="500" fill="url(#grid)" opacity="0.3" />

          {/* Zone A: MIC Storage (Top Left) */}
          <g>
            <rect
              x="50"
              y="50"
              width="200"
              height="150"
              fill={zoneA}
              stroke="#1a1f2e"
              strokeWidth="3"
              opacity="0.8"
              filter="url(#glow)"
            />
            <text
              x="150"
              y="100"
              textAnchor="middle"
              fill="white"
              fontSize="18"
              fontWeight="bold"
            >
              Zone A
            </text>
            <text
              x="150"
              y="125"
              textAnchor="middle"
              fill="white"
              fontSize="14"
            >
              MIC Storage
            </text>
            <circle cx="150" cy="160" r="8" fill="white" />
          </g>

          {/* Zone B: Styrene Tank (Top Right) */}
          <g>
            <rect
              x="550"
              y="50"
              width="200"
              height="150"
              fill={zoneB}
              stroke="#1a1f2e"
              strokeWidth="3"
              opacity="0.8"
              filter="url(#glow)"
            />
            <text
              x="650"
              y="100"
              textAnchor="middle"
              fill="white"
              fontSize="18"
              fontWeight="bold"
            >
              Zone B
            </text>
            <text
              x="650"
              y="125"
              textAnchor="middle"
              fill="white"
              fontSize="14"
            >
              Styrene Tank
            </text>
            <circle cx="650" cy="160" r="8" fill="white" />
          </g>

          {/* Zone C: Reactor (Bottom Center) */}
          <g>
            <rect
              x="300"
              y="300"
              width="200"
              height="150"
              fill={zoneC}
              stroke="#1a1f2e"
              strokeWidth="3"
              opacity="0.8"
              filter="url(#glow)"
            />
            <text
              x="400"
              y="350"
              textAnchor="middle"
              fill="white"
              fontSize="18"
              fontWeight="bold"
            >
              Zone C
            </text>
            <text
              x="400"
              y="375"
              textAnchor="middle"
              fill="white"
              fontSize="14"
            >
              Reactor
            </text>
            <circle cx="400" cy="410" r="8" fill="white" />
          </g>

          {/* Connecting pathways */}
          <line
            x1="250"
            y1="125"
            x2="300"
            y2="375"
            stroke="#4a5568"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.5"
          />
          <line
            x1="550"
            y1="125"
            x2="500"
            y2="375"
            stroke="#4a5568"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.5"
          />
          <line
            x1="250"
            y1="125"
            x2="550"
            y2="125"
            stroke="#4a5568"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.5"
          />

          {/* Legend */}
          <g transform="translate(600, 300)">
            <rect
              x="0"
              y="0"
              width="180"
              height="80"
              fill="#1a1f2e"
              stroke="#2d3748"
              strokeWidth="2"
              rx="4"
            />
            <text x="90" y="20" textAnchor="middle" fill="#9ca3af" fontSize="12" fontWeight="bold">
              System State
            </text>
            <circle cx="20" cy="40" r="6" fill="#10b981" />
            <text x="35" y="45" fill="#9ca3af" fontSize="11">NORMAL</text>
            <circle cx="20" cy="60" r="6" fill="#fbbf24" />
            <text x="35" y="65" fill="#9ca3af" fontSize="11">WARNING</text>
            <circle cx="100" cy="40" r="6" fill="#ef4444" />
            <text x="115" y="45" fill="#9ca3af" fontSize="11">CRITICAL</text>
          </g>
        </svg>

        {/* Status overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-industrial-accent" />
          <span className="text-sm text-gray-300">
            Real-time Status: <span className={`font-bold ${
              systemState === 'CRITICAL' ? 'text-red-500' :
              systemState === 'WARNING' ? 'text-yellow-500' :
              'text-green-500'
            }`}>{systemState}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

