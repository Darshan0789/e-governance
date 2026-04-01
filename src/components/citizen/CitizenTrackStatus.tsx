import { useState } from 'react';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { supabase, Application } from '../../lib/supabase';
import { useNavigate } from '../Router';

type TimelineStepId = 'submitted' | 'under_review' | 'field_verification' | 'final_decision';

interface TimelineStep {
  id: TimelineStepId;
  label: string;
  description: string;
}

const TIMELINE: TimelineStep[] = [
  {
    id: 'submitted',
    label: 'Submitted',
    description: 'Your application has been submitted to the department.',
  },
  {
    id: 'under_review',
    label: 'Under Review',
    description: 'Department officers are reviewing your application and documents.',
  },
  {
    id: 'field_verification',
    label: 'Field Verification (if required)',
    description: 'On‑ground verification or additional checks may be carried out.',
  },
  {
    id: 'final_decision',
    label: 'Final Decision',
    description: 'Your application will be Approved or Rejected, or returned for correction.',
  },
];

function statusToStepIndex(status: Application['status']): number {
  switch (status) {
    case 'draft':
      return 0;
    case 'submitted':
      return 0;
    case 'under_review':
      return 1;
    case 'approved':
    case 'rejected':
      return 3;
    default:
      return 0;
  }
}

export default function CitizenTrackStatus() {
  const navigate = useNavigate();
  const [appIdInput, setAppIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState<Application | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setApplication(null);

    const trimmed = appIdInput.trim();
    if (!trimmed) {
      setError('Please enter an Application ID.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('application_number', trimmed)
      .maybeSingle();

    setLoading(false);

    if (error) {
      setError('Unable to fetch status. Please try again later.');
      return;
    }

    if (!data) {
      setError('No application found with this ID. Please check and try again.');
      return;
    }

    setApplication(data as Application);
  };

  const currentStepIndex = application ? statusToStepIndex(application.status) : -1;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center space-x-2 text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <p className="text-sm text-slate-500">Track Application Status</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900 mb-4">Track Status</h1>
          <p className="text-sm text-slate-600 mb-4">
            Enter your Application ID in the format <span className="font-mono">DEPT-YYYY-XXXXXX</span>, for example{' '}
            <span className="font-mono">RTO-2026-004821</span>.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={appIdInput}
                onChange={e => setAppIdInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Application ID (e.g. RTO-2026-123456)"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? 'Searching...' : 'Check Status'}</span>
            </button>
          </form>
          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </section>

        {application && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Application ID</p>
                <p className="font-mono text-base font-semibold text-slate-900">{application.application_number}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Current Status</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  <Clock className="h-3 w-3 mr-1" />
                  {application.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Status Timeline</h2>
              <div className="space-y-4">
                {TIMELINE.map((step, index) => {
                  const reached = currentStepIndex >= index;
                  const isCurrent = currentStepIndex === index;
                  const isFinal = step.id === 'final_decision';
                  const finalStatusApproved = application.status === 'approved';
                  const finalStatusRejected = application.status === 'rejected';

                  let Icon = Clock;
                  let iconColor = 'text-slate-400';
                  if (reached) {
                    if (isFinal && finalStatusApproved) {
                      Icon = CheckCircle;
                      iconColor = 'text-emerald-600';
                    } else if (isFinal && finalStatusRejected) {
                      Icon = AlertCircle;
                      iconColor = 'text-red-600';
                    } else {
                      Icon = CheckCircle;
                      iconColor = 'text-blue-600';
                    }
                  }

                  return (
                    <div key={step.id} className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div
                          className={`h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                            reached
                              ? isFinal && finalStatusRejected
                                ? 'border-red-500 bg-red-50'
                                : 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${iconColor}`} />
                        </div>
                        {index < TIMELINE.length - 1 && (
                          <div className={`flex-1 w-px mt-1 ${reached ? 'bg-blue-500' : 'bg-slate-200'}`} />
                        )}
                      </div>
                      <div className="pb-6 flex-1">
                        <p className={`text-sm font-semibold ${reached ? 'text-slate-900' : 'text-slate-500'}`}>
                          {step.label}
                          {isCurrent && !isFinal && (
                            <span className="ml-2 text-xs font-medium text-blue-600">(Current)</span>
                          )}
                          {isFinal && finalStatusApproved && (
                            <span className="ml-2 text-xs font-medium text-emerald-600">(Approved)</span>
                          )}
                          {isFinal && finalStatusRejected && (
                            <span className="ml-2 text-xs font-medium text-red-600">(Rejected)</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

