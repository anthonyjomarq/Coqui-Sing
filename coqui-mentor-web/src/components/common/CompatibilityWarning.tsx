/**
 * Browser Compatibility Warning Component
 * Displays a warning if the browser doesn't support required features
 */

import { useEffect, useState } from 'react';
import { checkBrowserCompatibility, getBrowserInfo } from '../../utils/browserCompatibility';
import { Modal } from './Modal';

export function CompatibilityWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [compatibility, setCompatibility] = useState<ReturnType<typeof checkBrowserCompatibility> | null>(null);

  useEffect(() => {
    const result = checkBrowserCompatibility();
    setCompatibility(result);

    if (!result.supported) {
      setShowWarning(true);
    }
  }, []);

  if (!compatibility || !showWarning) {
    return null;
  }

  const browserInfo = getBrowserInfo();

  return (
    <Modal isOpen={showWarning} onClose={() => setShowWarning(false)}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          Browser Compatibility Warning
        </h2>

        <p className="text-gray-300 mb-4">
          Your browser ({browserInfo}) is missing some required features for Coqui Sing to work properly.
        </p>

        {compatibility.missing.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Missing Features:
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {compatibility.missing.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {compatibility.warnings.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
              Warnings:
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {compatibility.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            Recommended Browsers:
          </h3>
          <ul className="text-gray-300 space-y-1">
            <li>Chrome 90+ or Edge 90+</li>
            <li>Firefox 88+</li>
            <li>Safari 14+</li>
          </ul>
        </div>

        <button
          onClick={() => setShowWarning(false)}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
        >
          I Understand
        </button>
      </div>
    </Modal>
  );
}
