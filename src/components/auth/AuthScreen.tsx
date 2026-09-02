import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, signup, verifyEmailCode, pendingVerificationEmail, isLoading } = useAuth();
  
  const [view, setView] = useState<'welcome' | 'signin' | 'signup' | 'verify'>('welcome');

  // Sign In form
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Sign Up form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('2000-01-01');
  const [gender, setGender] = useState('Rather not say');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Verification Code
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [resendSent, setResendSent] = useState(false);

  // Forgot Password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginId || !loginPassword) {
      setLoginError('Please enter your email, username, or phone and password');
      return;
    }
    const res = await login(loginId, loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'Failed to sign in');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (!firstName || !lastName || !username || !email || !password) {
      setSignupError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setSignupError('Password must be at least 6 characters long');
      return;
    }
    if (!termsAccepted) {
      setSignupError('Please accept the Terms of Service');
      return;
    }

    const res = await signup({
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      phone,
      password,
      dob,
      gender,
    });

    if (res.success) {
      setView('verify');
    } else {
      setSignupError(res.error || 'Sign up failed');
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    const res = await verifyEmailCode(verificationCode);
    if (!res.success) {
      setVerifyError(res.error || 'Invalid verification code');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-[#F0F2F5] to-blue-50/50 dark:from-[#0F172A] dark:via-[#1E293B] dark:to-blue-950/30">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#2563EB]/30 mb-3 animate-pulse-slow">
            <span className="text-white font-black text-2xl tracking-tighter">KC</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            KC Social Network
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect with friends, share stories, and explore communities
          </p>
        </div>

        {/* 1. WELCOME VIEW */}
        {view === 'welcome' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-3 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#2563EB] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modern Social Experience</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Share posts, 24h stories, real-time messaging, groups, pages, marketplace items & events.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-lg"
                onClick={() => setView('signin')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to KC
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setView('signup')}
              >
                Create New Account
              </Button>
            </div>
          </div>
        )}

        {/* 2. SIGN IN VIEW */}
        {view === 'signin' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
            {loginError && (
              <div className="p-3 text-xs font-medium rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-600 dark:text-rose-400">
                {loginError}
              </div>
            )}

            <Input
              label="Email, Username or Phone"
              placeholder="alex@example.com or alex_j"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input type="checkbox" defaultChecked className="rounded text-[#2563EB] focus:ring-[#2563EB]" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[#2563EB] font-bold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full shadow-lg mt-2" isLoading={isLoading}>
              Sign In
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className="text-[#2563EB] font-bold hover:underline"
                >
                  Create account
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 3. SIGN UP VIEW */}
        {view === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3 animate-fade-in">
            {signupError && (
              <div className="p-3 text-xs font-medium rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                {signupError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <Input
                label="First Name"
                placeholder="Alex"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Last Name"
                placeholder="Johnson"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Input
                label="Username"
                placeholder="alex_j"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full py-2 px-3 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full py-2 px-3 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Custom">Custom</option>
                  <option value="Rather not say">Rather not say</option>
                </select>
              </div>
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            {password && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                  <span>Password strength</span>
                  <span>{strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong'}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strength <= 25 ? 'bg-rose-500' : strength <= 50 ? 'bg-amber-500' : strength <= 75 ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>
            )}

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 pt-1">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span>I accept KC's Terms of Service & Privacy Policy</span>
            </label>

            <Button type="submit" variant="primary" size="lg" className="w-full shadow-lg" isLoading={isLoading}>
              Create KC Account
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setView('signin')}
                  className="text-[#2563EB] font-bold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        )}

        {/* 4. EMAIL VERIFICATION CODE VIEW */}
        {view === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="space-y-5 animate-fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Check your email</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                We've sent a 6-digit code to <strong>{pendingVerificationEmail || email || 'your email'}</strong>
              </p>
            </div>

            {verifyError && (
              <div className="p-3 text-xs font-medium rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                {verifyError}
              </div>
            )}

            <div className="flex justify-center">
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-48 text-center text-2xl font-mono tracking-widest py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                autoFocus
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full shadow-lg" isLoading={isLoading}>
              Verify & Complete Registration
            </Button>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={() => setResendSent(true)}
                className="text-[#2563EB] font-bold hover:underline"
              >
                Resend code
              </button>
              {resendSent && <p className="text-emerald-500 font-semibold mt-1">Verification code sent!</p>}
            </div>
          </form>
        )}

      </div>

      {/* FORGOT PASSWORD MODAL */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => {
          setIsForgotModalOpen(false);
          setResetSuccess(false);
        }}
        title="Password Reset"
        description="Enter your account email or phone number to receive recovery instructions."
      >
        {resetSuccess ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Check your inbox</h4>
            <p className="text-xs text-slate-500">
              Recovery instructions have been sent to <strong>{resetEmail}</strong>.
            </p>
            <Button variant="primary" className="w-full" onClick={() => setIsForgotModalOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setResetSuccess(true); }} className="space-y-4">
            <Input
              label="Email or Phone"
              placeholder="alex@example.com or +1 (555) 123-4567"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsForgotModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Send Recovery Instructions
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
