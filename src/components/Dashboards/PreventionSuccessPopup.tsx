import { X, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';

interface PreventionSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  estimatedSavings: number;
}

export const PreventionSuccessPopup = ({
  isOpen,
  onClose,
  action,
  estimatedSavings,
}: PreventionSuccessPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-industrial-panel border-2 border-green-500 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <h3 className="text-2xl font-bold text-green-500">Prevention Success</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-200 mb-2">
            <span className="font-semibold">Action Authorized:</span> {action}
          </p>
          <p className="text-gray-300 text-sm">
            Disaster prevented through timely intervention.
          </p>
        </div>

        <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-6 h-6 text-green-400" />
            <span className="text-gray-300 font-semibold">Estimated Savings</span>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-1">
            ${estimatedSavings.toFixed(1)}M
          </div>
          <div className="text-xs text-gray-400">
            In soil remediation and healthcare costs prevented
          </div>
        </div>

        <div className="bg-industrial-darker border border-industrial-border rounded p-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span>Environmental Damage Prevented (EDP) calculation includes:</span>
          </div>
          <ul className="text-xs text-gray-500 mt-2 ml-6 list-disc space-y-1">
            <li>Soil remediation costs</li>
            <li>Healthcare and medical expenses</li>
            <li>Regulatory compliance penalties</li>
            <li>Long-term environmental impact</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

