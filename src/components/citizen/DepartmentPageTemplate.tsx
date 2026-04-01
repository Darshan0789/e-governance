import { useState } from 'react';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from '../Router';
import StepWizard, { Step } from '../StepWizard';
import { supabase } from '../../lib/supabase';

export interface DepartmentService {
  id: string;
  name: string;
}

interface DepartmentPageTemplateProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  deptPrefix: string;
  services: DepartmentService[];
}

function generateAppId(prefix: string) {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${random}`;
}

export default function DepartmentPageTemplate({
  title,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  deptPrefix,
  services,
}: DepartmentPageTemplateProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<DepartmentService | null>(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [appId, setAppId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleStartApplication = (service: DepartmentService) => {
    setSelectedService(service);
    setStep(0);
    setFormData({});
    setAppId(null);
  };

  const handleComplete = async () => {
    if (!user || !selectedService) return;
    setSubmitting(true);
    setSubmitError(null);
    const id = generateAppId(deptPrefix);
    const { error } = await supabase.from('applications').insert({
      application_number: id,
      user_id: user.id,
      status: 'submitted',
      applicant_full_name: formData.full_name || formData.name || null,
      applicant_phone: formData.phone || null,
      applicant_aadhaar: formData.aadhaar || null,
      applicant_address: formData.address || null,
      applicant_dob: formData.dob || null,
      form_data: { serviceName: selectedService.name, department: title, ...formData },
      documents: [],
    });
    setSubmitting(false);
    if (error) {
      setAppId(id);
      setSubmitError(error.message);
    } else {
      setAppId(id);
      // Redirect after successful save
      navigate('dashboard');
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
              value={formData.full_name ?? ''}
              onChange={e => setFormData(d => ({ ...d, full_name: e.target.value, name: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Enter full name"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={formData.phone ?? ''}
                onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="10-digit mobile number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob ?? ''}
                onChange={e => setFormData(d => ({ ...d, dob: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Number</label>
            <input
              type="text"
              value={formData.aadhaar ?? ''}
              onChange={e => setFormData(d => ({ ...d, aadhaar: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Enter Aadhaar number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea
              value={formData.address ?? ''}
              onChange={e => setFormData(d => ({ ...d, address: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg min-h-[90px]"
              placeholder="Enter full address"
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
          <p className="text-sm text-slate-600">Upload required documents (mock)</p>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
            <p className="text-slate-500 text-sm">Document upload placeholder</p>
          </div>
        </div>
      ),
    },
    {
      id: 'payment',
      title: 'Fee Payment',
      content: (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="font-semibold text-slate-900">Fee: ₹200</p>
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
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="font-semibold text-emerald-800">Application submitted successfully!</p>
              <p className="text-lg font-bold text-emerald-900 mt-2">Application ID: {appId}</p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg p-4 text-sm">
              <p><strong>Service:</strong> {selectedService?.name}</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  if (!selectedService) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button onClick={() => navigate('dashboard')} className="flex items-center space-x-2 text-slate-700 hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className={`flex items-center space-x-3 mb-6 p-4 rounded-xl w-fit ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              <p className="text-slate-600">{subtitle}</p>
            </div>
          </div>
          <div className="grid gap-4">
            {services.map(svc => (
              <button
                key={svc.id}
                onClick={() => handleStartApplication(svc)}
                className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all"
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
        <div className="max-w-3xl mx-auto px-4 py-4">
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
          canProceed={() => (step === 0 ? !!(formData.full_name || formData.name) : true)}
        />
        {submitting && <p className="mt-4 text-sm text-slate-500">Submitting...</p>}
        {submitError && <p className="mt-2 text-sm text-red-600">Save failed: {submitError}</p>}
      </main>
    </div>
  );
}
