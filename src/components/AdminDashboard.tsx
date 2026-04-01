import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertCircle, Building2, CheckCircle, FileText, RefreshCw, Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from './Router';
import { supabase, Application } from '../lib/supabase';

type AdminTab = 'overview' | 'monitor' | 'audit' | 'announcements';

const DEPT_LABEL: Record<string, string> = {
  RTO: 'RTO & Transport',
  CRV: 'Civil & Revenue',
  SWG: 'Social Welfare',
  FCS: 'Food & Civil Supplies',
  CTS: 'Citizen Services',
};

function getDeptFromAppId(appId: string) {
  const prefix = appId.split('-')[0] || 'OTHER';
  return prefix;
}

export default function AdminDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);

  // monitor filters
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!user) {
      navigate('adminLogin');
      return;
    }
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    setError('');

    const appsRes = await supabase.from('applications').select('*').order('created_at', { ascending: false });

    if (appsRes.error) setError('Unable to load applications.');

    if (appsRes.data) setApplications(appsRes.data as Application[]);

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('landing');
  };

  const totals = useMemo(() => {
    const total = applications.length;
    const approved = applications.filter(a => a.status === 'approved').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    const inProgress = applications.filter(a => ['submitted', 'under_review'].includes(a.status)).length;
    return { total, approved, rejected, inProgress };
  }, [applications]);

  const deptBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const app of applications) {
      const d = getDeptFromAppId(app.application_number);
      map[d] = (map[d] || 0) + 1;
    }
    return Object.entries(map)
      .map(([dept, count]) => ({ dept, name: DEPT_LABEL[dept] || dept, count }))
      .sort((a, b) => b.count - a.count);
  }, [applications]);

  const statusBreakdown = useMemo(() => {
    const approved = totals.approved;
    const rejected = totals.rejected;
    const inProgress = totals.inProgress;
    const draft = applications.filter(a => a.status === 'draft').length;
    return [
      { name: 'Approved', value: approved, color: '#22c55e' },
      { name: 'In Progress', value: inProgress, color: '#3b82f6' },
      { name: 'Rejected', value: rejected, color: '#ef4444' },
      { name: 'Draft', value: draft, color: '#94a3b8' },
    ].filter(x => x.value > 0);
  }, [applications, totals.approved, totals.inProgress, totals.rejected]);

  const filteredMonitorRows = useMemo(() => {
    return applications.filter(app => {
      const dept = getDeptFromAppId(app.application_number);
      const deptOk = deptFilter === 'ALL' ? true : dept === deptFilter;
      const statusOk = statusFilter === 'ALL' ? true : app.status === statusFilter;
      return deptOk && statusOk;
    });
  }, [applications, deptFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-7 w-7 text-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Seva Portal</p>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={loadAll}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 inline-flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
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
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Admin Menu</h2>
          <nav className="space-y-2 text-sm">
            <button
              onClick={() => setTab('overview')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                tab === 'overview' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab('monitor')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                tab === 'monitor' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              Department Monitor
            </button>
            <button
              onClick={() => setTab('audit')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                tab === 'audit' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              Audit Logs
            </button>
            <button
              onClick={() => setTab('announcements')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                tab === 'announcements' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              Announcements
            </button>
          </nav>
        </aside>

        <section className="lg:col-span-3 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
              Loading admin data...
            </div>
          ) : (
            <>
              {tab === 'overview' && (
                <>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <p className="text-xs font-medium text-slate-500 mb-1">Total Applications</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-slate-900">{totals.total}</span>
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <p className="text-xs font-medium text-slate-500 mb-1">Approved</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-slate-900">{totals.approved}</span>
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <p className="text-xs font-medium text-slate-500 mb-1">In Progress</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-slate-900">{totals.inProgress}</span>
                        <Shield className="h-5 w-5 text-indigo-500" />
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4">Department-wise Applications</h3>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={deptBreakdown}>
                            <XAxis dataKey="dept" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Department is derived from Application ID prefix (RTO/CRV/SWG/FCS/CTS).
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4">Status Breakdown</h3>
                      <div className="h-56">
                        {statusBreakdown.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={2}
                                dataKey="value"
                                nameKey="name"
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {statusBreakdown.map((entry, i) => (
                                  <Cell key={i} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-sm text-slate-400">No data yet</div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {tab === 'monitor' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-sm font-semibold text-slate-900">Department-wise Application Monitor</h2>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={deptFilter}
                        onChange={e => setDeptFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                        <option value="ALL">All Departments</option>
                        <option value="RTO">RTO</option>
                        <option value="CRV">CivilRevenue</option>
                        <option value="SWG">SocialWelfare</option>
                        <option value="FCS">FoodSupplies</option>
                        <option value="CTS">CitizenServices</option>
                      </select>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                        <option value="ALL">All Status</option>
                        <option value="submitted">submitted</option>
                        <option value="under_review">under_review</option>
                        <option value="approved">approved</option>
                        <option value="rejected">rejected</option>
                        <option value="draft">draft</option>
                      </select>
                    </div>
                  </div>

                  {filteredMonitorRows.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500">No applications match your filters.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                            <th className="py-2 pr-4">App ID</th>
                            <th className="py-2 pr-4">Department</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4">Created</th>
                            <th className="py-2 pr-4">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMonitorRows.slice(0, 100).map(app => {
                            const dept = getDeptFromAppId(app.application_number);
                            return (
                              <tr key={app.id} className="border-b border-slate-100 last:border-b-0">
                                <td className="py-2 pr-4 font-mono text-xs text-slate-900">{app.application_number}</td>
                                <td className="py-2 pr-4 text-slate-700">{DEPT_LABEL[dept] || dept}</td>
                                <td className="py-2 pr-4 text-slate-700 capitalize">{app.status.replace('_', ' ')}</td>
                                <td className="py-2 pr-4 text-slate-500">
                                  {new Date(app.created_at).toLocaleDateString('en-IN')}
                                </td>
                                <td className="py-2 pr-4 text-slate-600 text-xs">{app.remarks || '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <p className="text-xs text-slate-500 mt-2">Showing first 100 rows.</p>
                    </div>
                  )}
                </div>
              )}

              {tab === 'audit' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600">
                  Audit Logs (mock) — coming next.
                </div>
              )}

              {tab === 'announcements' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600">
                  Announcements Manager (mock) — coming next.
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

