import { useEffect, useState } from 'react';
import SevaPortalLogo from './SevaPortalLogo';
import {
  FileText,
  Car,
  Users,
  LogOut,
  User,
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
  MessageSquare,
  MapPin,
  ArrowRight,
  MessageCircle,
  Search,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from './Router';
import { supabase, Application } from '../lib/supabase';

const DEPARTMENTS = [
  { code: 'RTO', name: 'RTO & Transport', icon: Car, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', route: 'citizenRto' as const },
  { code: 'CivilRevenue', name: 'Civil & Revenue', icon: FileText, iconBg: 'bg-sky-100', iconColor: 'text-sky-600', route: 'citizenCivilRevenue' as const },
  { code: 'SocialWelfare', name: 'Social Welfare & Grievance', icon: Users, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', route: 'citizenSocialWelfare' as const },
  { code: 'FoodSupplies', name: 'Food & Civil Supplies', icon: MapPin, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', route: 'citizenFoodSupplies' as const },
  { code: 'CitizenServices', name: 'Citizen Services', icon: Shield, iconBg: 'bg-violet-100', iconColor: 'text-violet-600', route: 'citizenCitizenServices' as const },
];

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarActive, setSidebarActive] = useState<'overview' | 'applications' | 'track' | 'complaints' | 'feedback'>('overview');

  useEffect(() => {
    if (!user) {
      navigate('login');
      return;
    }
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (data) setApplications(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('landing');
  };

  const total = applications.length;
  const approved = applications.filter(a => a.status === 'approved').length;
  const inProgress = applications.filter(a => ['submitted', 'under_review'].includes(a.status)).length;
  const rejected = applications.filter(a => a.status === 'rejected').length;

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
  });
  const monthlyData = last6Months.map(month => {
    const [m, y] = month.split(' ');
    const count = applications.filter(app => {
      const appDate = new Date(app.created_at);
      return appDate.toLocaleString('en-IN', { month: 'short' }) === m && appDate.getFullYear().toString().slice(-2) === y;
    }).length;
    return { month, count };
  });

  const statusData = [
    { name: 'Approved', value: approved, color: '#22c55e' },
    { name: 'In Progress', value: inProgress, color: '#3b82f6' },
    { name: 'Rejected', value: rejected, color: '#ef4444' },
    { name: 'Draft', value: applications.filter(a => a.status === 'draft').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const getStatusStyles = (status: string) => {
    const m: Record<string, { bg: string; text: string }> = {
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700' },
      under_review: { bg: 'bg-blue-100', text: 'text-blue-700' },
      submitted: { bg: 'bg-amber-100', text: 'text-amber-700' },
      draft: { bg: 'bg-slate-100', text: 'text-slate-700' },
    };
    return m[status] || { bg: 'bg-slate-100', text: 'text-slate-700' };
  };
  const StatusIcon = (status: string) => status === 'approved' ? CheckCircle : status === 'rejected' ? AlertCircle : Clock;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center">
            <SevaPortalLogo variant="compact" />
          </div>
          <p className="text-xs text-slate-500 mt-1">Citizen Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setSidebarActive('overview')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${sidebarActive === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Overview</span>
          </button>
          <button
            onClick={() => setSidebarActive('applications')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${sidebarActive === 'applications' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm font-medium">My Applications</span>
          </button>
          <button
            onClick={() => navigate('citizenTrackStatus')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50"
          >
            <Search className="h-5 w-5" />
            <span className="text-sm font-medium">Track Status</span>
          </button>
          <button
            onClick={() => setSidebarActive('complaints')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${sidebarActive === 'complaints' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Complaints & Grievances</span>
          </button>
          <button
            onClick={() => setSidebarActive('feedback')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${sidebarActive === 'feedback' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">Feedback</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50 relative">
            <Bell className="h-5 w-5" />
            <span className="text-sm font-medium">Notifications</span>
            <span className="absolute top-2 right-3 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{profile?.full_name}</p>
              <p className="text-xs text-slate-500">Profile</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-slate-900">
            Welcome back, {profile?.full_name?.split(' ')[0]}
          </h1>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {sidebarActive === 'overview' && (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Applied</p>
                  <p className="text-3xl font-bold text-slate-900">{total}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500 mb-1">Approved ✅</p>
                  <p className="text-3xl font-bold text-emerald-600">{approved}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500 mb-1">In Progress 🔄</p>
                  <p className="text-3xl font-bold text-blue-600">{inProgress}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500 mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{rejected}</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Applications (Last 6 Months)</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Status Breakdown</h3>
                  <div className="h-48">
                    {statusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {statusData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data yet</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Department cards */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Departments</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {DEPARTMENTS.map(dept => {
                    const Icon = dept.icon;
                    return (
                      <div
                        key={dept.code}
                        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                        onClick={() => navigate(dept.route)}
                      >
                        <div className={`inline-flex p-3 rounded-lg ${dept.iconBg} mb-4`}>
                          <Icon className={`h-6 w-6 ${dept.iconColor}`} />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">{dept.name}</h3>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(dept.route); }}
                          className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
                        >
                          <span>Apply Now</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {sidebarActive === 'applications' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">My Applications</h2>
              {applications.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No applications yet. Start by selecting a department from Overview.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map(app => {
                    const statusStyles = getStatusStyles(app.status);
                    const Icon = StatusIcon(app.status);
                    return (
                      <div key={app.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{app.application_number}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(app.created_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${statusStyles.bg} ${statusStyles.text}`}>
                          <Icon className="h-4 w-4" />
                          {app.status.replace('_', ' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {sidebarActive === 'complaints' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Complaints & Grievances</h2>
              <p className="text-slate-500 text-sm">Lodge and track department-specific grievances. (Coming soon)</p>
            </div>
          )}

          {sidebarActive === 'feedback' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Feedback</h2>
              <p className="text-slate-500 text-sm">Star rating and suggestions. (Coming soon)</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
