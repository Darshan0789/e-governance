import { Building2, CheckCircle, Clock, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from './Router';

export default function OfficerDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('landing');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-7 w-7 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Seva Portal</p>
              <p className="text-xs text-slate-500">Officer Dashboard</p>
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
            <button className="w-full text-left px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-medium">
              Pending Applications
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700">
              Processed Today
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700">
              Escalations & Notifications
            </button>
          </nav>
        </aside>

        <section className="lg:col-span-3 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Pending Queue</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">--</span>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">Processed Today</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">--</span>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 mb-1">In Escalation</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">--</span>
                <Users className="h-5 w-5 text-rose-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Pending Applications</h2>
              <p className="text-xs text-slate-500">Table coming soon</p>
            </div>
            <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-sm text-slate-500">
              This is a placeholder for the officer queue table (App ID, Citizen, Service, Date, Action).
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

