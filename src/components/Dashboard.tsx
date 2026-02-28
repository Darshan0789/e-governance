import { useEffect, useState } from 'react';
import {
  Building2,
  FileText,
  Car,
  Users,
  LogOut,
  User,
  Bell,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from './Router';
import { supabase, Department, Service, Application } from '../lib/supabase';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('login');
      return;
    }

    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [deptResult, servicesResult, appsResult] = await Promise.all([
      supabase.from('departments').select('*').eq('is_active', true).order('name'),
      supabase.from('services').select('*').eq('is_active', true),
      supabase
        .from('applications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    if (deptResult.data) setDepartments(deptResult.data);
    if (servicesResult.data) setServices(servicesResult.data);
    if (appsResult.data) setRecentApplications(appsResult.data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('landing');
  };

  const getDepartmentIcon = (code: string) => {
    switch (code) {
      case 'RCD': return FileText;
      case 'TLD': return Car;
      case 'SWGD': return Users;
      default: return Building2;
    }
  };

  const getDepartmentColor = (code: string) => {
    switch (code) {
      case 'RCD': return 'blue';
      case 'TLD': return 'green';
      case 'SWGD': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'under_review': return 'blue';
      case 'submitted': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return AlertCircle;
      case 'under_review': return Clock;
      default: return Clock;
    }
  };

  const filteredServices = selectedDepartment
    ? services.filter(s => s.department_id === selectedDepartment)
    : services;

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
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">e-Governance Portal</span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">{profile?.full_name}</p>
                  <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {profile?.full_name?.split(' ')[0]}</h1>
          <p className="text-slate-600">Access government services and track your applications</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Applications</p>
                <p className="text-3xl font-bold">{recentApplications.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-blue-100">All time submissions</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Approved</p>
                <p className="text-3xl font-bold">
                  {recentApplications.filter(app => app.status === 'approved').length}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-green-100">Successfully processed</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">In Progress</p>
                <p className="text-3xl font-bold">
                  {recentApplications.filter(app => ['submitted', 'under_review'].includes(app.status)).length}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-orange-100">Under review</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Departments</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {departments.map(dept => {
                  const Icon = getDepartmentIcon(dept.code);
                  const color = getDepartmentColor(dept.code);
                  const isSelected = selectedDepartment === dept.id;

                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDepartment(isSelected ? null : dept.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? `border-${color}-500 bg-${color}-50`
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg bg-${color}-100`}>
                          <Icon className={`h-6 w-6 text-${color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                          <p className="text-sm text-slate-600">{dept.description}</p>
                        </div>
                        <ArrowRight className={`h-5 w-5 transition-transform ${isSelected ? 'rotate-90' : ''} text-slate-400`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  {selectedDepartment ? 'Available Services' : 'All Services'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredServices.map(service => {
                    const dept = departments.find(d => d.id === service.department_id);
                    const color = getDepartmentColor(dept?.code || '');

                    return (
                      <div
                        key={service.id}
                        className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all bg-white group cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {service.name}
                          </h4>
                          <span className={`text-xs px-2 py-1 bg-${color}-100 text-${color}-700 rounded-full font-medium`}>
                            {dept?.code}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{service.processing_days} days</span>
                          </div>
                          <span className="font-semibold">₹{service.fee_amount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Applications</h2>

              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 text-sm">No applications yet</p>
                  <p className="text-slate-500 text-xs mt-1">Start by selecting a service</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApplications.map(app => {
                    const StatusIcon = getStatusIcon(app.status);
                    const statusColor = getStatusColor(app.status);

                    return (
                      <div
                        key={app.id}
                        className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-slate-900 text-sm">
                            {app.application_number}
                          </p>
                          <StatusIcon className={`h-4 w-4 text-${statusColor}-600`} />
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-700 mb-2`}>
                          {app.status.replace('_', ' ').toUpperCase()}
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(app.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-slate-300 text-sm mb-4">
                Contact our support team for assistance with your applications
              </p>
              <button className="w-full bg-white text-slate-900 py-2 rounded-lg hover:bg-slate-100 font-semibold text-sm transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
