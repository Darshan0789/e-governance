import { Building2, FileText, Car, Users, Shield, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from './Router';
import SevaPortalLogo from './SevaPortalLogo';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <SevaPortalLogo variant="nav" />
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('login')}
                className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Citizen Login
              </button>
              <button
                onClick={() => navigate('officerLogin')}
                className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Officer Login
              </button>
              <button
                onClick={() => navigate('adminLogin')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-sm hover:shadow-md"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden min-h-[480px] md:min-h-[540px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/landing-hero-bg.png')" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/40 to-slate-800/70"
          aria-hidden
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg border border-white/50">
                <SevaPortalLogo variant="nav" className="mx-auto max-w-[min(90vw,340px)] sm:max-w-[380px] h-10 sm:h-11" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-md">
              <span className="text-blue-200">Digital India Services</span>
            </h1>
            <p className="text-xl text-white/90 mb-6 max-w-3xl mx-auto leading-relaxed drop-shadow">
              One unified platform for citizens, officers, and administrators to manage end-to-end government services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4 space-x-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Citizen</h3>
                  <p className="text-sm text-slate-600">Application, track, and manage your applications.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('login')}
                className="mt-10 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Citizen Login
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4 space-x-3">
                <Shield className="h-8 w-8 text-emerald-600" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Officer</h3>
                  <p className="text-sm text-slate-600">Process applications and manage departmental workflows.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('officerLogin')}
                className="mt-6 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
              >
                Officer Login
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4 space-x-3">
                <Building2 className="h-8 w-8 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Admin</h3>
                  <p className="text-sm text-slate-600">Monitor system-wide performance and manage officers.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('adminLogin')}
                className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Departments</h2>
            <p className="text-lg text-slate-600">Access services across all major citizen-facing departments.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 hover:shadow-md transition-all">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">RTO & Transport</h3>
              <p className="text-sm text-slate-600">
                Driving licenses, vehicle permits, fitness and tax services.
              </p>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-white p-6 rounded-xl border border-sky-100 hover:shadow-md transition-all">
              <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Civil & Revenue</h3>
              <p className="text-sm text-slate-600">
                Certificates, land records, tax payments and mutations.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border border-emerald-100 hover:shadow-md transition-all">
              <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Social Welfare</h3>
              <p className="text-sm text-slate-600">
                Pensions, scholarships, and grievance redressal services.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-xl border border-orange-100 hover:shadow-md transition-all">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Food & Supplies</h3>
              <p className="text-sm text-slate-600">
                Ration cards, entitlements, fair price shops and complaints.
              </p>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-white p-6 rounded-xl border border-violet-100 hover:shadow-md transition-all">
              <div className="bg-violet-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Citizen Services</h3>
              <p className="text-sm text-slate-600">
                Identity cards, certificates, NOCs and feedback services.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose Seva Portal?</h2>
            <p className="text-lg text-slate-600">Modern, efficient, and transparent government services.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure & Safe</h3>
              <p className="text-slate-600 leading-relaxed">
                Your data is protected with enterprise-grade security and encryption.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fast Processing</h3>
              <p className="text-slate-600 leading-relaxed">
                Quick turnaround times with real-time status tracking for all services.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Transparent</h3>
              <p className="text-slate-600 leading-relaxed">
                Track your application status and know which officer is reviewing your case.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-6 text-blue-100 leading-relaxed">
            Choose your portal and experience seamless digital governance services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('login')}
              className="px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 font-semibold text-sm md:text-base transition-all shadow-lg hover:shadow-xl"
            >
              Citizen Portal
            </button>
            <button
              onClick={() => navigate('officerLogin')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 font-semibold text-sm md:text-base transition-all shadow-lg hover:shadow-xl"
            >
              Officer Portal
            </button>
            <button
              onClick={() => navigate('adminLogin')}
              className="px-6 py-3 border border-white/60 text-white rounded-lg hover:bg-white/10 font-semibold text-sm md:text-base transition-all"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="bg-white/10 rounded-xl px-3 py-2 border border-white/10">
                <SevaPortalLogo variant="compact" className="brightness-0 invert opacity-95 max-w-[200px]" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm font-semibold text-white">Government of India</p>
                <p className="text-xs text-slate-400">A unified digital platform for citizen services.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-xs sm:text-sm text-slate-400">Helpline: 1800-000-000 (Toll Free)</p>
              <button className="text-xs sm:text-sm text-blue-300 hover:text-blue-200 underline">
                RTI Information Portal
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
