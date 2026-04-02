import { useState } from 'react';
import { Building2, Lock, LogIn, UserPlus, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from './Router';
import { supabase } from '../lib/supabase';
import SevaPortalLogo from './SevaPortalLogo';

export default function OfficerLoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState<'verification_officer' | 'approving_authority'>('verification_officer');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const formatSbError = (err: unknown) => {
    const e = err as { message?: string; status?: number; code?: string; name?: string };
    return [e.message || 'Request failed.', e.status ? `status=${e.status}` : null, e.code ? `code=${e.code}` : null, e.name ? `name=${e.name}` : null]
      .filter(Boolean)
      .join(' | ');
  };

  const ensureOfficerProfile = async (userId: string) => {
    let pending: { fullName: string; role: typeof role; department: string; designation?: string } | null = null;
    try {
      const pendingRaw = localStorage.getItem('PENDING_OFFICER_PROFILE');
      pending = pendingRaw
        ? (JSON.parse(pendingRaw) as { fullName: string; role: typeof role; department: string; designation?: string })
        : null;
    } catch {
      pending = null;
    }

    const profilePayload = {
      id: userId,
      full_name: pending?.fullName || fullName.trim(),
      role: pending?.role || role,
      employee_id: null,
      department: pending?.department || department,
      designation: pending?.designation ?? (designation.trim() || null),
      is_active: true,
    };

    // Try an upsert to avoid duplicate insert errors if the row already exists.
    // (If RLS blocks this, we'll surface the exact error.)
    const { error: profileErr } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });
    if (profileErr) throw new Error(formatSbError(profileErr));

    localStorage.removeItem('PENDING_OFFICER_PROFILE');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim()) {
      setError('Email is required.');
      setLoading(false);
      return;
    }

    if (mode === 'login') {
      const result = await signIn(email.trim(), password);

      if (result.error) {
        if (result.error.includes('code=invalid_credentials')) {
          setError('Officer account not found or password is wrong. If you are a new officer, please register first.');
          setMode('register');
        } else {
          setError(result.error);
        }
        setLoading(false);
      } else {
        // If this officer signed up earlier but profile insert couldn't run (email confirm),
        // complete the profile row now.
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userRes.user) {
          setLoading(false);
          setError('Signed in, but unable to load user.');
          return;
        }
        try {
          await ensureOfficerProfile(userRes.user.id);
        } catch (e) {
          setLoading(false);
          setError((e as Error).message);
          return;
        }

        // Store selected department for filtering officer queue
        localStorage.setItem('OFFICER_DEPARTMENT', department);
        setLoading(false);
        navigate('officerDashboard');
      }
      return;
    }

    // Register mode
    if (!fullName.trim()) {
      setError('Full name is required.');
      setLoading(false);
      return;
    }
    if (!department) {
      setError('Department is required.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    if (signUpErr) {
      setError(formatSbError(signUpErr));
      setLoading(false);
      return;
    }

    if (!signUpData.user?.id) {
      setError('Signup succeeded but user was not returned. Please try logging in.');
      setLoading(false);
      setMode('login');
      return;
    }

    // Save profile data locally in case email confirmation blocks immediate sign-in.
    localStorage.setItem(
      'PENDING_OFFICER_PROFILE',
      JSON.stringify({ fullName: fullName.trim(), role, department, designation: designation.trim() || undefined }),
    );

    // Try sign-in right after signup so we can insert the profile with a real auth user id.
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInErr) {
      setLoading(false);
      setError(
        `Account created, but automatic login failed. ${formatSbError(signInErr)}. If you see "Email not confirmed", open Supabase Auth settings and disable email confirmation (or confirm the user), then login.`,
      );
      setMode('login');
      return;
    }

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes.user) {
      setLoading(false);
      setError('Signed in, but unable to load user.');
      return;
    }
    try {
      await ensureOfficerProfile(userRes.user.id);
    } catch (e) {
      setLoading(false);
      setError((e as Error).message);
      return;
    }

    localStorage.setItem('OFFICER_DEPARTMENT', department);
    setLoading(false);
    navigate('officerDashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-emerald-100">
              <SevaPortalLogo variant="auth" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {mode === 'login' ? 'Officer Login' : 'Officer Registration'}
          </h1>
          <p className="text-slate-600 text-sm">
            {mode === 'login'
              ? 'Sign in to manage applications.'
              : 'Create your officer account to start managing applications.'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="officer@email.com"
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

            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="designation" className="block text-sm font-semibold text-slate-700 mb-2">
                    Designation (optional)
                  </label>
                  <input
                    id="designation"
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="e.g. Inspector"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">
                    Officer Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as typeof role)}
                    className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
                    required
                  >
                    <option value="verification_officer">Verification Officer</option>
                    <option value="approving_authority">Approving Authority</option>
                  </select>
                </div>
              </>
            )}

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
              {mode === 'login' ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              <span>
                {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : mode === 'login' ? 'Sign In' : 'Create Account'}
              </span>
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

