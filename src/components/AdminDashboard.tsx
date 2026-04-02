import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
  AlertCircle,
  CheckCircle,
  FileText,
  RefreshCw,
  Shield,
  Users,
  ScrollText,
  Megaphone,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from './Router';
import { supabase, Application } from '../lib/supabase';
import SevaPortalLogo from './SevaPortalLogo';

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

const ANNOUNCEMENTS_STORAGE_KEY = 'seva_portal_admin_announcements';

interface AdminAnnouncement {
  id: string;
  title: string;
  body: string;
  priority: 'normal' | 'high';
  createdAt: string;
}

interface AuditLogRow {
  id: string;
  occurredAt: string;
  category: 'submission' | 'update' | 'verification';
  applicationNumber: string;
  summary: string;
  detail?: string;
}

function loadAnnouncementsFromStorage(): AdminAnnouncement[] {
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AdminAnnouncement[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [
    {
      id: 'default-1',
      title: 'Portal availability',
      body:
        'Seva Portal citizen services are monitored continuously. Use Department Monitor for live application volumes. For incidents, coordinate with departmental nodal officers.',
      priority: 'normal',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-2',
      title: 'Document verification',
      body:
        'Officers should verify uploaded PDFs, images, and supporting documents before approving applications. Audit Log reflects submissions and status changes from the applications register.',
      priority: 'high',
      createdAt: new Date().toISOString(),
    },
  ];
}

function buildAuditLogFromApplications(apps: Application[]): AuditLogRow[] {
  const rows: AuditLogRow[] = [];

  for (const app of apps) {
    const fd = app.form_data as Record<string, unknown>;
    const docsCount = Array.isArray(app.documents) ? app.documents.length : 0;
    const dept = getDeptFromAppId(app.application_number);
    const deptName = DEPT_LABEL[dept] || dept;

    rows.push({
      id: `${app.id}-submitted`,
      occurredAt: app.created_at,
      category: 'submission',
      applicationNumber: app.application_number,
      summary: 'Application submitted',
      detail: `${deptName} · Status: ${app.status}${docsCount ? ` · ${docsCount} file(s) attached` : ''}`,
    });

    if (fd?.documents_verified === true && fd?.documents_verified_at) {
      rows.push({
        id: `${app.id}-doc-verify`,
        occurredAt: String(fd.documents_verified_at),
        category: 'verification',
        applicationNumber: app.application_number,
        summary: 'Documents verified (officer)',
        detail: `Verification recorded in application record.`,
      });
    }

    const createdMs = new Date(app.created_at).getTime();
    const updatedMs = new Date(app.updated_at).getTime();
    const hasRemarks = !!(app.remarks && app.remarks.trim());
    if (updatedMs > createdMs + 1500 || hasRemarks) {
      const remarksPreview = app.remarks
        ? app.remarks.length > 160
          ? `${app.remarks.slice(0, 160)}…`
          : app.remarks
        : undefined;
      rows.push({
        id: `${app.id}-updated`,
        occurredAt: app.updated_at,
        category: 'update',
        applicationNumber: app.application_number,
        summary: 'Application updated',
        detail: `Current status: ${app.status}${remarksPreview ? ` · Remarks: ${remarksPreview}` : ''}`,
      });
    }
  }

  return rows
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 150);
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

  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>(loadAnnouncementsFromStorage);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'high'>('normal');

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

  const auditLogRows = useMemo(() => buildAuditLogFromApplications(applications), [applications]);

  const persistAnnouncements = (next: AdminAnnouncement[]) => {
    setAnnouncements(next);
    try {
      localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  };

  const addAnnouncement = () => {
    const title = annTitle.trim();
    const body = annBody.trim();
    if (!title || !body) {
      alert('Title and message are required.');
      return;
    }
    const next: AdminAnnouncement[] = [
      {
        id: crypto.randomUUID(),
        title,
        body,
        priority: annPriority,
        createdAt: new Date().toISOString(),
      },
      ...announcements,
    ];
    persistAnnouncements(next);
    setAnnTitle('');
    setAnnBody('');
    setAnnPriority('normal');
  };

  const removeAnnouncement = (id: string) => {
    if (!confirm('Remove this announcement?')) return;
    persistAnnouncements(announcements.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SevaPortalLogo variant="compact" />
            <div>
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
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <ScrollText className="h-5 w-5 text-indigo-600" />
                      <h2 className="text-sm font-semibold text-slate-900">Audit log</h2>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      Events below are derived from the <span className="font-mono">applications</span> table: new
                      submissions, record updates (status / remarks), and document verification flags. Refresh pulls the
                      latest data.
                    </p>
                    <div className="grid sm:grid-cols-4 gap-3 mb-4 text-center">
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <p className="text-lg font-bold text-slate-900">{applications.length}</p>
                        <p className="text-xs text-slate-500">Total applications</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <p className="text-lg font-bold text-emerald-700">{totals.approved}</p>
                        <p className="text-xs text-slate-500">Approved</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <p className="text-lg font-bold text-blue-700">{totals.inProgress}</p>
                        <p className="text-xs text-slate-500">In progress</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <p className="text-lg font-bold text-red-700">{totals.rejected}</p>
                        <p className="text-xs text-slate-500">Rejected</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto max-h-[420px] overflow-y-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                          <tr className="text-left text-xs text-slate-500 uppercase tracking-wide border-b border-slate-200">
                            <th className="py-2 px-3">Time</th>
                            <th className="py-2 px-3">Type</th>
                            <th className="py-2 px-3">Application</th>
                            <th className="py-2 px-3">Summary</th>
                            <th className="py-2 px-3">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogRows.map(row => (
                            <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80">
                              <td className="py-2 px-3 text-slate-600 whitespace-nowrap text-xs">
                                {new Date(row.occurredAt).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                    row.category === 'submission'
                                      ? 'bg-blue-50 text-blue-800'
                                      : row.category === 'update'
                                        ? 'bg-amber-50 text-amber-800'
                                        : 'bg-emerald-50 text-emerald-800'
                                  }`}
                                >
                                  {row.category}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono text-xs text-slate-900">{row.applicationNumber}</td>
                              <td className="py-2 px-3 text-slate-800 font-medium">{row.summary}</td>
                              <td className="py-2 px-3 text-slate-600 text-xs max-w-md">{row.detail || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'announcements' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Megaphone className="h-5 w-5 text-indigo-600" />
                      <h2 className="text-sm font-semibold text-slate-900">Publish announcement</h2>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      Announcements are saved in this browser for administrators. Citizens see landing and dashboard
                      messaging when you expose this list via API in a future release; for now they support internal ops
                      notes and desk reference.
                    </p>
                    <div className="space-y-3 max-w-2xl">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                        <input
                          value={annTitle}
                          onChange={e => setAnnTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="e.g. Holiday schedule — office counters"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                        <textarea
                          value={annBody}
                          onChange={e => setAnnBody(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="Full text for staff and future public display…"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                        <select
                          value={annPriority}
                          onChange={e => setAnnPriority(e.target.value as 'normal' | 'high')}
                          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        >
                          <option value="normal">Normal</option>
                          <option value="high">High visibility</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={addAnnouncement}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                      >
                        <Plus className="h-4 w-4" />
                        Add announcement
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Active announcements ({announcements.length})</h3>
                    {announcements.length === 0 ? (
                      <p className="text-sm text-slate-500">No announcements yet.</p>
                    ) : (
                      <ul className="space-y-3">
                        {announcements.map(a => (
                          <li
                            key={a.id}
                            className={`rounded-xl border p-4 ${
                              a.priority === 'high'
                                ? 'border-amber-200 bg-amber-50/50'
                                : 'border-slate-200 bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-slate-900">{a.title}</p>
                                  {a.priority === 'high' && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-medium">
                                      High priority
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(a.createdAt).toLocaleString('en-IN')}
                                </p>
                                <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{a.body}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAnnouncement(a.id)}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 shrink-0"
                                title="Remove"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900">
                    <p className="font-semibold mb-1">Related to current workload</p>
                    <ul className="list-disc list-inside space-y-1 text-indigo-800">
                      <li>
                        Pending pipeline: <strong>{totals.inProgress}</strong> application(s) awaiting officer action.
                      </li>
                      <li>
                        Department mix: top volume {deptBreakdown[0]?.name || '—'} (
                        {deptBreakdown[0]?.count ?? 0} applications).
                      </li>
                      <li>Use Department Monitor to spot bottlenecks before publishing citizen-facing notices.</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

