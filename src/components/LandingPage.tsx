import { Building2, FileText, Car, Users, Shield, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from './Router';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">e-Governance Portal</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('login')}
                className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('signup')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-sm hover:shadow-md"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Digital Government
              <span className="block text-blue-600 mt-2">Services Portal</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Access all government services from the comfort of your home. Fast, transparent, and secure digital services for citizens.
            </p>
            <button
              onClick={() => navigate('signup')}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Departments</h2>
            <p className="text-lg text-slate-600">Comprehensive services across multiple government departments</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100 hover:shadow-xl transition-all">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Revenue & Civil</h3>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Income, caste, and residence certificates with quick processing and verification.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Income Certificate
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Caste Certificate
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Residence Certificate
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl border border-green-100 hover:shadow-xl transition-all">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Car className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Transport & Licensing</h3>
              <p className="text-slate-600 mb-4 leading-relaxed">
                RTO services including license applications, slot booking, and vehicle tax payments.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Learner's License
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Slot Booking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Vehicle Tax Payment
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-xl border border-orange-100 hover:shadow-xl transition-all">
              <div className="bg-orange-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Social Welfare</h3>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Public support services, pension schemes, and grievance redressal system.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Old Age Pension
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Grievance Redressal
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Status Tracking
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-slate-600">Modern, efficient, and transparent government services</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure & Safe</h3>
              <p className="text-slate-600 leading-relaxed">
                Your data is protected with enterprise-grade security and encryption
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fast Processing</h3>
              <p className="text-slate-600 leading-relaxed">
                Quick turnaround times with real-time status tracking for all services
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Transparent</h3>
              <p className="text-slate-600 leading-relaxed">
                Track your application status and know which officer is reviewing your case
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            Join thousands of citizens already using our digital services platform
          </p>
          <button
            onClick={() => navigate('signup')}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Create Your Account
          </button>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Building2 className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold text-white">e-Governance Portal</span>
            </div>
            <p className="text-sm">2024 Government Services Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
