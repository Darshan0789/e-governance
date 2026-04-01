import { useEffect, useState } from 'react';
import { Building2, CheckCircle, Clock, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from './Router';
import { supabase, Application } from '../lib/supabase';

type OfficerTab = 'pending' | 'processed' | 'escalations';
type OfficerDepartment = 'RTO' | 'CivilRevenue' | 'SocialWelfare' | 'FoodSupplies' | 'CitizenServices';

const DEPT_PREFIX: Record<OfficerDepartment, string> = {
  RTO: 'RTO',
  CivilRevenue: 'CRV',
  SocialWelfare: 'SWG',
  FoodSupplies: 'FCS',
  CitizenServices: 'CTS',
};

export default function OfficerDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<OfficerTab>('pending');
  const [queue, setQueue] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [department, setDepartment] = useState<OfficerDepartment | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('officerLogin');
      return;
    }
    if (profile && !['verification_officer', 'approving_authority'].includes(profile.role)) {
      // Not an officer account
      navigate('officerLogin');
      return;
    }
    const stored = localStorage.getItem('OFFICER_DEPARTMENT') as OfficerDepartment | null;
    setDepartment(stored);
    fetchQueue();
  }, [user, profile]);

  const fetchQueue = async () => {
    setError('');

    const stored = (localStorage.getItem('OFFICER_DEPARTMENT') as OfficerDepartment | null);
    const prefix = stored ? DEPT_PREFIX[stored] : null;

    let query = supabase
      .from('applications')
      .select('*')
      .in('status', ['submitted', 'under_review']);

    if (prefix) {
      query = query.like('application_number', `${prefix}-%`);
    }

    const { data, error } = await query;

    if (error) {
      setError('Unable to load applications.');
    } else if (data) {
      setQueue(data as Application[]);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('landing');
  };

  const updateStatus = async (app: Application, status: Application['status']) => {
    const remarks = prompt('Enter remarks (minimum 10 characters):') || '';
    if (remarks.trim().length < 10) {
      alert('Remarks must be at least 10 characters.');
      return;
    }
    setUpdatingId(app.id);
    const { error } = await supabase
      .from('applications')
      .update({
        status,
        remarks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', app.id);
    setUpdatingId(null);
    if (error) {
      alert('Failed to update status: ' + error.message);
    } else {
      await fetchQueue();
      alert('Status updated.');
    }
  };

  const pendingCount = queue.length;
  const processedToday = 0;
  const escalations = 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-7 w-7 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Seva Portal</p>
              <p className="text-xs text-slate-500">
                Officer Dashboard{department ? ` — ${department}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{profile?.full_name}</p>
              <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-4 gap-6">
        <aside className="bg-white border border-slate-200 rounded-xl p-4 h-fit">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Officer Menu</h2>
          <nav className="space-y-2 text-sm">
            <button
              onClick={() => setTab('pending')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                tab === 'pending' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              Pending Applications
            </button>
            <button
              onClick={() => setTab('processed')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                tab === 'processed' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              Processed Today
            </button>
            <button
              onClick={() => setTab('escalations')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                tab === 'escalations' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              Escalations & Notifications
            </button>
          </nav>
        </aside>

        <section className="lg:col-span-3 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Pending Queue</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">{pendingCount}</span>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Processed Today</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">{processedToday}</span>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">In Escalation</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">{escalations}</span>
                <Users className="h-5 w-5 text-rose-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Pending Applications</h2>
              {error && (
                <p className="text-xs text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{error}</span>
                </p>
              )}
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">Loading...</div>
            ) : queue.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No pending applications in your queue.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                      <th className="py-2 pr-4">App ID</th>
                      <th className="py-2 pr-4">Citizen</th>
                      <th className="py-2 pr-4">Service</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map(app => (
                      <tr key={app.id} className="border-b border-slate-100 last:border-b-0">
                        <td className="py-2 pr-4 font-mono text-xs text-slate-900">{app.application_number}</td>
                        <td className="py-2 pr-4 text-slate-700 text-xs">
                          {/* form_data could hold citizen name if populated later */}
                          Citizen
                        </td>
                        <td className="py-2 pr-4 text-slate-700 text-xs">
                          {(app.form_data as { serviceName?: string })?.serviceName || 'Service'}
                        </td>
                        <td className="py-2 pr-4 text-slate-500 text-xs">
                          {new Date(app.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-2 pr-4 text-slate-600 text-xs capitalize">
                          {app.status.replace('_', ' ')}
                        </td>
                        <td className="py-2 pr-0 text-right">
                          <div className="inline-flex items-center space-x-1">
                            <button
                              type="button"
                              disabled={updatingId === app.id}
                              onClick={() => updateStatus(app, 'approved')}
                              className="px-2 py-1 rounded-md text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={updatingId === app.id}
                              onClick={() => updateStatus(app, 'rejected')}
                              className="px-2 py-1 rounded-md text-xs bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              disabled={updatingId === app.id}
                              onClick={() => updateStatus(app, 'under_review')}
                              className="px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                            >
                              Request Info
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

