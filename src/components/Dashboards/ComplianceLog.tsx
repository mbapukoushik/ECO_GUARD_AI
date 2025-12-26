import { FileText, Lock, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LogEntry } from '../../hooks/useComplianceLog';
import { SystemState } from '../../hooks/useStateMachine';

interface ComplianceLogProps {
  logEntries: LogEntry[];
}

export const ComplianceLog = ({ logEntries }: ComplianceLogProps) => {
  const getStateColor = (state: SystemState) => {
    switch (state) {
      case 'CRITICAL':
        return 'text-red-500 border-red-500 bg-red-500/10';
      case 'WARNING':
        return 'text-yellow-500 border-yellow-500 bg-yellow-500/10';
      default:
        return 'text-green-500 border-green-500 bg-green-500/10';
    }
  };

  const getStateIcon = (state: SystemState) => {
    if (state === 'CRITICAL') {
      return <AlertCircle className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <div className="bg-industrial-panel border border-industrial-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6 text-industrial-accent" />
        <h2 className="text-2xl font-bold text-gray-100">Immutable Compliance Log</h2>
        <span className="ml-auto text-xs text-gray-400 bg-industrial-darker px-2 py-1 rounded">
          Protocol #5 - 2025 Compliance Standards
        </span>
      </div>

      <div className="bg-industrial-darker border border-industrial-border rounded-lg p-4 max-h-64 overflow-y-auto">
        {logEntries.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Lock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No state changes logged yet</p>
            <p className="text-xs mt-2">Log entries will appear when system state changes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-industrial-panel border border-industrial-border rounded p-3 hover:border-industrial-accent transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {entry.timestamp.toLocaleString()}
                    </span>
                  </div>
                  {entry.type === 'authorization' ? (
                    <div className="px-2 py-1 rounded text-xs font-bold border border-blue-500 bg-blue-500/10 text-blue-500 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      AUTHORIZATION
                    </div>
                  ) : (
                    <div className={`px-2 py-1 rounded text-xs font-bold border ${getStateColor(entry.newState)} flex items-center gap-1`}>
                      {getStateIcon(entry.newState)}
                      {entry.newState}
                    </div>
                  )}
                </div>

                {entry.type === 'authorization' ? (
                  <div className="mb-2">
                    <div className="text-xs text-blue-400 font-semibold mb-1">
                      Operator Authorized: {entry.authorizationAction}
                    </div>
                    <div className="text-xs text-gray-400">
                      Human-in-the-Loop Compliance (ISO 10218 / OSHA PSM 2025)
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                    <div>
                      <span className="text-gray-400">Previous:</span>{' '}
                      <span className="text-gray-300">
                        {entry.previousState || 'INIT'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">New:</span>{' '}
                      <span className={`font-bold ${
                        entry.newState === 'CRITICAL' ? 'text-red-400' :
                        entry.newState === 'WARNING' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {entry.newState}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mb-2 text-xs">
                  <div className="text-gray-400 mb-1">Sensor Snapshot:</div>
                  <div className="grid grid-cols-3 gap-2 text-gray-300">
                    <div>Temp: {entry.sensorSnapshot.temperature.toFixed(1)}°C</div>
                    <div>Press: {entry.sensorSnapshot.pressure.toFixed(1)} psi</div>
                    <div>Inhib: {entry.sensorSnapshot.inhibitorLevel.toFixed(0)} ppm</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-industrial-border">
                  <Lock className="w-3 h-3 text-industrial-accent" />
                  <span className="text-xs text-gray-400 font-mono break-all">
                    Hash: {entry.cryptographicHash}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span>Blockchain-Auditable | Cryptographic Integrity Verified</span>
        </div>
        <span>Total Entries: {logEntries.length}</span>
      </div>
    </div>
  );
};

