import { useState } from 'react';
import { Building2, Lock, LogIn, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from './Router';

export default function OfficerLoginPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(employeeId, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      navigate('officerDashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-600 p-3 rounded-xl">
              <Users className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Officer Login</h1>
          <p className="text-slate-600 text-sm">
            Sign in with your department-issued credentials to manage applications.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="employeeId" className="block text-sm font-semibold text-slate-700 mb-2">
                Employee ID
              </label>
              <input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Enter your employee ID"
                required
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-slate-700 mb-2">
                Department
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
                required
              >
                <option value="">Select department</option>
                <option value="RTO">RTO & Transport</option>
                <option value="CivilRevenue">Civil & Revenue</option>
                <option value="SocialWelfare">Social Welfare & Grievance</option>
                <option value="FoodSupplies">Food & Civil Supplies</option>
                <option value="CitizenServices">Citizen Services</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              <LogIn className="h-5 w-5" />
              <span>{loading ? 'Signing in...' : 'Sign In as Officer'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={() => navigate('landing')}
              className="text-sm text-slate-600 hover:text-slate-800 transition-colors flex items-center justify-center space-x-2"
            >
              <Building2 className="h-4 w-4" />
              <span>Back to Seva Portal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

