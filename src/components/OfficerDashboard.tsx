import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Users, AlertCircle, FileText, ExternalLink, Eye, X } from 'lucide-react';
import SevaPortalLogo from './SevaPortalLogo';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from './Router';
import { supabase, Application } from '../lib/supabase';
import { getDocumentSignedUrl, parseApplicationDocuments } from '../lib/applicationDocuments';

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
  const [detailApp, setDetailApp] = useState<Application | null>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<Record<string, string>>({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [openingDoc, setOpeningDoc] = useState<string | null>(null);

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

  const openDocument = async (path: string) => {
    setOpeningDoc(path);
    try {
      const url = await getDocumentSignedUrl(path, 3600);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setOpeningDoc(null);
    }
  };

  useEffect(() => {
    if (!detailApp) {
      setImagePreviewUrls({});
      return;
    }
    const docs = parseApplicationDocuments(detailApp.documents);
    let cancelled = false;
    (async () => {
      setPreviewLoading(true);
      const next: Record<string, string> = {};
      for (const d of docs) {
        if (d.mime_type.startsWith('image/')) {
          try {
            const url = await getDocumentSignedUrl(d.path, 3600);
            if (!cancelled) next[d.path] = url;
          } catch {
            /* preview unavailable */
          }
        }
      }
      if (!cancelled) setImagePreviewUrls(next);
      setPreviewLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [detailApp?.id]);

  const markDocumentsVerified = async (app: Application) => {
    if (!user) return;
    setUpdatingId(app.id);
    const nextForm = {
      ...app.form_data,
      documents_verified: true,
      documents_verified_at: new Date().toISOString(),
      documents_verified_by: user.id,
    };
    const { error } = await supabase
      .from('applications')
      .update({
        form_data: nextForm,
        updated_at: new Date().toISOString(),
      })
      .eq('id', app.id);
    setUpdatingId(null);
    if (error) alert('Update failed: ' + error.message);
    else {
      await fetchQueue();
      alert('Documents marked as verified.');
      setDetailApp(prev => (prev?.id === app.id ? { ...prev, form_data: nextForm } : prev));
    }
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
      setDetailApp(null);
    }
  };

  function renderFormDataEntries(formData: Record<string, unknown>) {
    const skip = new Set([
      'documents_verified',
      'documents_verified_at',
      'documents_verified_by',
    ]);
    return Object.entries(formData).filter(([k]) => !skip.has(k));
  }

  const pendingCount = queue.length;
  const processedToday = 0;
  const escalations = 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SevaPortalLogo variant="compact" />
            <div>
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
                      <th className="py-2 pr-3">View</th>
                      <th className="py-2 pr-4">App ID</th>
                      <th className="py-2 pr-4">Citizen</th>
                      <th className="py-2 pr-4">Service</th>
                      <th className="py-2 pr-4">Docs</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map(app => {
                      const docs = parseApplicationDocuments(app.documents);
                      const fd = app.form_data as { documents_verified?: boolean; full_name?: string; name?: string };
                      const citizenName = fd?.full_name || fd?.name || '—';
                      const verified = !!fd?.documents_verified;
                      return (
                        <tr key={app.id} className="border-b border-slate-100 last:border-b-0">
                          <td className="py-2 pr-3">
                            <button
                              type="button"
                              onClick={() => setDetailApp(app)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View application
                            </button>
                          </td>
                          <td className="py-2 pr-4 font-mono text-xs text-slate-900">{app.application_number}</td>
                          <td className="py-2 pr-4 text-slate-700 text-xs max-w-[120px] truncate" title={citizenName}>
                            {citizenName}
                          </td>
                          <td className="py-2 pr-4 text-slate-700 text-xs">
                            {(app.form_data as { serviceName?: string })?.serviceName || 'Service'}
                          </td>
                          <td className="py-2 pr-4 text-xs">
                            <span className="inline-flex items-center gap-1 text-slate-700">
                              <FileText className="h-3.5 w-3.5" />
                              {docs.length}
                              {verified && (
                                <span className="ml-1 text-emerald-700 font-medium" title="Documents verified">
                                  ✓
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-slate-500 text-xs">
                            {new Date(app.created_at).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-2 pr-4 text-slate-600 text-xs capitalize">
                            {app.status.replace('_', ' ')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {detailApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[min(90vh,900px)] flex flex-col border border-slate-200">
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Application details</h3>
                <p className="text-sm font-mono text-slate-600 mt-0.5">{detailApp.application_number}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailApp(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5 text-sm">
              <div className="grid sm:grid-cols-2 gap-3 text-slate-700">
                <p>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Status</span>
                  <br />
                  <span className="capitalize">{detailApp.status.replace('_', ' ')}</span>
                </p>
                <p>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Submitted</span>
                  <br />
                  {new Date(detailApp.created_at).toLocaleString('en-IN')}
                </p>
                <p>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Citizen user ID</span>
                  <br />
                  <span className="font-mono text-xs break-all">{detailApp.user_id}</span>
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Form details</h4>
                <dl className="grid gap-2 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {renderFormDataEntries(detailApp.form_data as Record<string, unknown>).map(([key, val]) => (
                    <div key={key} className="grid sm:grid-cols-[140px_1fr] gap-1">
                      <dt className="text-slate-500 font-medium capitalize">{key.replace(/_/g, ' ')}</dt>
                      <dd className="text-slate-900 break-words">{String(val ?? '—')}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Uploaded documents
                  {(detailApp.form_data as { documents_verified?: boolean }).documents_verified && (
                    <span className="ml-2 text-emerald-600 font-normal normal-case">(verified)</span>
                  )}
                </h4>
                {parseApplicationDocuments(detailApp.documents).length === 0 ? (
                  <p className="text-slate-500">No files uploaded.</p>
                ) : (
                  <>
                    {previewLoading && (
                      <p className="text-xs text-slate-500 mb-2">Loading image previews…</p>
                    )}
                    <ul className="space-y-4">
                      {parseApplicationDocuments(detailApp.documents).map(d => (
                        <li key={d.path} className="border border-slate-200 rounded-xl p-3 bg-white">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="font-medium text-slate-800">{d.file_name}</span>
                            <span className="text-xs text-slate-500">{d.mime_type}</span>
                          </div>
                          {d.mime_type.startsWith('image/') && imagePreviewUrls[d.path] ? (
                            <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 mt-2">
                              <img
                                src={imagePreviewUrls[d.path]}
                                alt={d.file_name}
                                className="max-h-64 w-full object-contain"
                              />
                            </div>
                          ) : null}
                          <div className="mt-2">
                            <button
                              type="button"
                              disabled={openingDoc === d.path}
                              onClick={() => openDocument(d.path)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-900 disabled:opacity-50"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              {openingDoc === d.path ? 'Opening…' : d.mime_type.startsWith('image/') ? 'Open full size' : 'Open / download'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {detailApp.remarks && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-slate-800">
                  <span className="text-xs font-semibold text-amber-900 uppercase">Remarks</span>
                  <p className="mt-1">{detailApp.remarks}</p>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-200 flex flex-wrap gap-2 justify-end shrink-0 bg-slate-50/80 rounded-b-2xl">
              <button
                type="button"
                disabled={
                  updatingId === detailApp.id ||
                  parseApplicationDocuments(detailApp.documents).length === 0 ||
                  !!(detailApp.form_data as { documents_verified?: boolean }).documents_verified
                }
                onClick={() => markDocumentsVerified(detailApp)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-white disabled:opacity-50"
              >
                Verify documents
              </button>
              <button
                type="button"
                disabled={updatingId === detailApp.id}
                onClick={() => updateStatus(detailApp, 'approved')}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={updatingId === detailApp.id}
                onClick={() => updateStatus(detailApp, 'rejected')}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={updatingId === detailApp.id}
                onClick={() => updateStatus(detailApp, 'under_review')}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                Request info
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

