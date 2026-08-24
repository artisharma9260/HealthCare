import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithPassword, signInWithPassword } from '@/lib/authService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight, Stethoscope, Loader2, Mail, Lock, User } from 'lucide-react';
import heroClinic from '@/assets/hero-clinic.jpg';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Register-only fields
  const [name, setName] = useState('');

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'patient') navigate('/patient', { replace: true });
      else if (user.role === 'doctor') navigate('/doctor', { replace: true });
      else navigate('/admin', { replace: true });
    }
  }, [user, loading, navigate]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const authUser = await signInWithPassword(email, password);
      login(authUser);
      if (authUser.role === 'doctor') navigate('/doctor');
      else if (authUser.role === 'admin') navigate('/admin');
      else navigate('/patient');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid email or password.');
      setSubmitting(false);
    }
  };

  // ── Register: create account directly with email + password ──────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const authUser = await signUpWithPassword(email, password, name || email.split('@')[0], 'patient');
      login(authUser);
      toast.success('Account created successfully.');
      navigate('/patient');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  const resetMode = (newMode: Mode) => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setName('');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1C4A45]/20 border-t-[#1C4A45] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex">
      {/* Left Panel — Hero */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-[#1C4A45]">
        <img
          src={heroClinic}
          alt="Modern clinic environment"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">HealthCare</p>
              <p className="text-white/60 text-xs font-mono tracking-wider">APPOINTMENT MANAGER</p>
            </div>
          </div>

          <div>
            <h1 className="font-serif text-4xl xl:text-5xl font-semibold leading-tight mb-4">
              Care, coordinated<br />with clarity.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              A calm, clinical tool for patients, doctors, and administrators — built around
              trust, transparency, and efficient care delivery.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { value: '3 Portals', label: 'Patient · Doctor · Admin' },
                { value: 'Real AI', label: 'Gemini-powered summaries' },
                { value: 'Live DB', label: 'OnSpace Cloud backend' },
              ].map(stat => (
                <div key={stat.value} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="font-semibold text-white text-base">{stat.value}</p>
                  <p className="text-white/60 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/30 text-xs font-mono">© 2026 HealthCare Manager · Powered by OnSpace Cloud</p>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Stethoscope size={22} className="text-[#1C4A45]" />
            <span className="font-bold text-[#1A2523]">HealthCare Manager</span>
          </div>

          {/* ── LOGIN FORM ── */}
          {mode === 'login' && (
            <>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1A2523]">Sign in to your portal</h2>
                <p className="text-sm text-[#1A2523]/50 mt-1">Enter your email and password to continue.</p>
              </div>

              <form onSubmit={handleLogin} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#1A2523]/70 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2523]/30 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                        placeholder-[#1A2523]/30 focus:outline-none focus:ring-2 focus:ring-[#1C4A45]/30 focus:border-[#1C4A45] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-[#1A2523]/70">Password</label>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2523]/30 pointer-events-none" />
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Your password"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                        placeholder-[#1A2523]/30 focus:outline-none focus:ring-2 focus:ring-[#1C4A45]/30 focus:border-[#1C4A45] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A2523]/30 hover:text-[#1A2523]/60 transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1C4A45] text-white text-sm font-semibold rounded-lg
                    hover:bg-[#163D38] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-[#1C4A45] focus:ring-offset-2"
                >
                  {submitting
                    ? <Loader2 size={16} className="animate-spin" />
                    : <><span>Sign In</span><ArrowRight size={15} /></>}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#1A2523]/50">
                {"Don't have an account? "}
                <button onClick={() => resetMode('register')} className="text-[#1C4A45] font-medium hover:underline">
                  Create account
                </button>
              </p>

              <div className="mt-8 p-4 bg-[#E8EFEC] rounded-xl border border-[#C4D9CE]">
                <p className="text-xs font-medium text-[#1C4A45] mb-2">Demo credentials</p>
                <div className="space-y-1 text-xs text-[#1A2523]/60 font-mono">
                  <p>patient@demo.com · password123 (Patient)</p>
                  <p>doctor@demo.com · password123 (Doctor)</p>
                  <p>admin@demo.com · password123 (Admin)</p>
                </div>
                <p className="text-xs text-[#1A2523]/40 mt-2">Register first with any of these emails to create the demo accounts.</p>
              </div>
            </>
          )}

          {/* ── REGISTER ── */}
          {mode === 'register' && (
            <>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1A2523]">Create your account</h2>
                <p className="text-sm text-[#1A2523]/50 mt-1">Sign up with your email and a password.</p>
              </div>
              <form onSubmit={handleRegister} className="mt-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A2523]/70 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2523]/30 pointer-events-none" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                        placeholder-[#1A2523]/30 focus:outline-none focus:ring-2 focus:ring-[#1C4A45]/30 focus:border-[#1C4A45] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2523]/70 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2523]/30 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                        placeholder-[#1A2523]/30 focus:outline-none focus:ring-2 focus:ring-[#1C4A45]/30 focus:border-[#1C4A45] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2523]/70 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A2523]/30 pointer-events-none" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="Create a password"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E0E8E4] rounded-lg text-sm text-[#1A2523]
                        placeholder-[#1A2523]/30 focus:outline-none focus:ring-2 focus:ring-[#1C4A45]/30 focus:border-[#1C4A45] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A2523]/30 hover:text-[#1A2523]/60 transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password.length > 0 && password.length < 6 && (
                    <p className="mt-1 text-xs text-[#C4482E]">Password must be at least 6 characters</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting || password.length < 6}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1C4A45] text-white text-sm font-semibold rounded-lg
                    hover:bg-[#163D38] disabled:opacity-60 transition-all duration-150 active:scale-[0.98]
                    focus:outline-none focus:ring-2 focus:ring-[#1C4A45] focus:ring-offset-2"
                >
                  {submitting
                    ? <Loader2 size={16} className="animate-spin" />
                    : <><span>Create Account</span><ArrowRight size={15} /></>}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-[#1A2523]/50">
                Already have an account?{' '}
                <button onClick={() => resetMode('login')} className="text-[#1C4A45] font-medium hover:underline">Sign in</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
