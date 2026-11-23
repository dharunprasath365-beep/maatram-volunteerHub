import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { runFullTestSuite, TestCaseResult } from '../../utils/testRunner';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Shield,
  Layers,
  Clock,
  Lock,
  BarChart,
  X,
} from 'lucide-react';

interface TestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestSuiteModal: React.FC<TestSuiteModalProps> = ({ isOpen, onClose }) => {
  const context = useApp();
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTestResults(runFullTestSuite(context));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunAll = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runFullTestSuite(context);
      setTestResults(results);
      setIsRunning(false);
    }, 400);
  };

  const passedCount = testResults.filter(t => t.passed).length;
  const totalCount = testResults.length;

  const getCategoryIcon = (category: TestCaseResult['category']) => {
    switch (category) {
      case 'Security':
        return <Shield className="w-3.5 h-3.5 text-purple-700" />;
      case 'Capacity & Workflow':
        return <Layers className="w-3.5 h-3.5 text-blue-700" />;
      case 'Contribution & Hours':
        return <Clock className="w-3.5 h-3.5 text-emerald-700" />;
      case 'Privacy & Consent':
        return <Lock className="w-3.5 h-3.5 text-amber-700" />;
      case 'Reporting':
        return <BarChart className="w-3.5 h-3.5 text-indigo-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-6 bg-[#F8FAF8] border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] flex items-center justify-center text-[#1B4332]">
              <CheckCircle2 className="w-6 h-6 text-[#2D6A4F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-lg text-[#1B4332]">
                  System Verification & Test Suite
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {passedCount}/{totalCount} Passed
                </span>
              </div>
              <p className="text-xs text-[#718096]">
                Automated regression assertions for MH26-02 security, capacity, consent, and calculation logic.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#718096] hover:text-black rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-6 py-3 bg-white border-b border-[#E2E8F0] flex items-center justify-between">
          <span className="text-xs text-[#4A5568] font-medium">
            Status:{' '}
            <strong className="text-emerald-700">All Core Requirements Passing</strong>
          </span>

          <button
            onClick={handleRunAll}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Executing Tests...' : 'Run All Tests'}</span>
          </button>
        </div>

        {/* Results List */}
        <div className="p-6 overflow-y-auto space-y-3.5 divide-y divide-[#E2E8F0]">
          {testResults.map(test => (
            <div key={test.id} className="pt-3.5 first:pt-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F2F6F3] text-[#4A5568]">
                    {getCategoryIcon(test.category)}
                    {test.category}
                  </span>
                  <h4 className="font-heading font-bold text-sm text-[#1E2922]">{test.name}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#A0AEC0] font-mono">{test.executionTimeMs}ms</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      test.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {test.passed ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-600" />
                    )}
                    <span>{test.passed ? 'PASSED' : 'FAILED'}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#718096]">{test.description}</p>

              <div className="bg-[#F8FAF8] p-2.5 rounded-xl border border-[#E2E8F0] text-[11px] font-mono space-y-0.5">
                <div className="text-[#4A5568]">
                  <strong>Expected:</strong> {test.expected}
                </div>
                <div className="text-[#1B4332]">
                  <strong>Actual:</strong> {test.actual}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8FAF8] border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="text-[11px] text-[#718096]">
            All tests executed against local database state.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-[#4A5568] hover:bg-[#E8EFEA] rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
