import { useState } from 'react';
import { ArrowLeft, Car } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from '../Router';
import StepWizard, { Step } from '../StepWizard';
import { supabase } from '../../lib/supabase';

const RTO_SERVICES = [
  { id: 'dl-new', name: 'Driving License — New Application' },
  { id: 'learners-test', name: 'Online Learner\'s License Test (mock MCQ flow)' },
  { id: 'license-renewal', name: 'License Renewal' },
  { id: 'duplicate-license', name: 'Duplicate License' },
  { id: 'address-change', name: 'Address Change Request' },
  { id: 'fitness-renewal', name: 'Vehicle Fitness Certificate Renewal' },
  { id: 'vehicle-permit', name: 'Vehicle Permit Application' },
];

function generateAppId() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `RTO-${year}-${random}`;
}

export default function CitizenRto() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<typeof RTO_SERVICES[0] | null>(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [appId, setAppId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleStartApplication = (service: typeof RTO_SERVICES[0]) => {
    setSelectedService(service);
    setStep(0);
    setFormData({});
    setAppId(null);
  };

  const handleComplete = async () => {
    if (!user || !selectedService) return;
    setSubmitting(true);
    const id = generateAppId();
    const { error } = await supabase.from('applications').insert({
      application_number: id,
      user_id: user.id,
      service_id: '00000000-0000-0000-0000-000000000000',
      status: 'submitted',
      form_data: { serviceName: selectedService.name, ...formData },
      documents: [],
    });
    setSubmitting(false);
    if (error) {
      setAppId(id);
      alert('Application submitted locally. (DB insert failed: ' + error.message + ')');
    } else {
      setAppId(id);
    }
  };

  const steps: Step[] = [
    {
      id: 'details',
      title: 'Details',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Enter your application details</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name ?? ''}
              onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">License Number (if applicable)</label>
            <input
              type="text"
              value={formData.licenseNo ?? ''}
              onChange={e => setFormData(d => ({ ...d, licenseNo: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="e.g. DL-01-1234567890"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'documents',
      title: 'Documents',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Upload required documents (mock upload)</p>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
            <p className="text-slate-500 text-sm">Drag and drop files here or click to browse</p>
            <input type="file" className="mt-2" multiple disabled />
          </div>
        </div>
      ),
    },
    {
      id: 'payment',
      title: 'Fee Payment',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Mock payment — amount will be shown at payment gateway</p>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="font-semibold text-slate-900">Fee: ₹500</p>
            <p className="text-sm text-slate-500">Proceeding will simulate payment completion</p>
          </div>
        </div>
      ),
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      content: (
        <div className="space-y-4">
          {appId ? (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="font-semibold text-emerald-800">Application submitted successfully!</p>
                <p className="text-lg font-bold text-emerald-900 mt-2">Application ID: {appId}</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">Review and submit</p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700">
                <p><strong>Service:</strong> {selectedService?.name}</p>
                <p><strong>Name:</strong> {formData.name || '-'}</p>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  if (!selectedService) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => navigate('dashboard')} className="flex items-center space-x-2 text-slate-700 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-lg bg-blue-100">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">RTO & Transport</h1>
              <p className="text-slate-600">Driving licenses, permits, and vehicle services</p>
            </div>
          </div>
          <div className="grid gap-4">
            {RTO_SERVICES.map(svc => (
              <button
                key={svc.id}
                onClick={() => handleStartApplication(svc)}
                className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all"
              >
                <p className="font-semibold text-slate-900">{svc.name}</p>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => appId ? navigate('dashboard') : setSelectedService(null)}
            className="flex items-center space-x-2 text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{appId ? 'Back to Dashboard' : 'Back to Services'}</span>
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">{selectedService.name}</h2>
        <StepWizard
          steps={steps}
          currentStep={step}
          onStepChange={setStep}
          onComplete={handleComplete}
          canProceed={() => (step === 0 ? !!formData.name : true)}
        />
        {submitting && <p className="mt-4 text-sm text-slate-500">Submitting...</p>}
      </main>
    </div>
  );
}
