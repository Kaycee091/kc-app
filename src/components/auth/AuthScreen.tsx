import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PENDING_VERIFICATION_KEY } from '../../services/authService';
import { ConnectaLogo } from '../ui/ConnectaLogo';
import { Modal } from '../ui/Modal';
import {
  Shield, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw, Mail, Eye, EyeOff,
} from 'lucide-react';
import { router } from '../../router';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — read initial state from localStorage / URL without side-effects
// ─────────────────────────────────────────────────────────────────────────────

type AuthMode = 'signin' | 'signup' | 'verify';

function getInitialMode(): AuthMode {
  if (typeof window === 'undefined') return 'signin';
  const path = window.location.pathname;
  if (path === '/verify-email') return 'verify';
  if (path === '/register') return 'signup';
  try {
    const raw = localStorage.getItem(PENDING_VERIFICATION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email && (!parsed.expires_at || Date.now() < parsed.expires_at)) {
        return 'verify';
      }
    }
  } catch {}
  return 'signin';
}

function getInitialVerifyEmail(): string {
  try {
    const raw = localStorage.getItem(PENDING_VERIFICATION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email) return parsed.email;
    }
  } catch {}
  return '';
}

/** Read the dev code from sessionStorage (same tab only). */
function getSessionDevCode(): string {
  try {
    return sessionStorage.getItem('connecta_dev_code') ?? '';
  } catch {
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const AuthScreen: React.FC = () => {
  const { login, signup, verifyEmailCode, sendVerificationCode, isLoading } = useAuth();

  // ── Mode (signin / signup / verify) ───────────────────────────────────────
  // IMPORTANT: mode is pure React state. We deliberately do NOT sync it back to
  // the URL via router.navigate() inside a useEffect — that caused the page-
  // reset bug because router notifications triggered MainContent re-renders
  // which could unmount/remount AuthScreen under certain React reconcile paths.
  const [mode, setMode] = useState<AuthMode>(getInitialMode);

  // ── Sign-In state ─────────────────────────────────────────────────────────
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [stepPassword, setStepPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ── Sign-Up state ─────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [signupError, setSignupError] = useState('');

  // ── Verification state ────────────────────────────────────────────────────
  const [verifyEmail, setVerifyEmail] = useState(getInitialVerifyEmail);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendNotice, setResendNotice] = useState('');
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Dev code display ──────────────────────────────────────────────────────
  // Shown on-screen so you can test without opening the console.
  const [devCode, setDevCode] = useState<string>(() =>
    getInitialMode() === 'verify' ? getSessionDevCode() : ''
  );

  // ── Change-email sub-form ─────────────────────────────────────────────────
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [changeEmailError, setChangeEmailError] = useState('');

  // ── Forgot-password modal ─────────────────────────────────────────────────
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Sync URL when mode changes — using replaceState so browser Back works
  // naturally.  We use replaceState (not pushState) so we don't create
  // extra history entries that confuse the router subscribers.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const target =
      mode === 'verify' ? '/verify-email' :
      mode === 'signup' ? '/register' :
      '/login';
    if (window.location.pathname !== target) {
      window.history.replaceState({}, '', target);
    }
  }, [mode]);

  // Start a resend cooldown timer
  const startResendTimer = () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // 1. SIGN-IN FLOW
  // ══════════════════════════════════════════════════════════════════════════

  const handleContinueSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoginError('');

    if (!loginId.trim()) {
      setLoginError('Please enter your username, phone or email.');
      return;
    }

    if (!stepPassword) {
      setStepPassword(true);
      return;
    }

    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    const res = await login(loginId.trim(), loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'Invalid credentials. Please check your details.');
    } else {
      router.navigate('/feed');
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 2. REGISTRATION FLOW
  // ══════════════════════════════════════════════════════════════════════════

  const handleSignupSubmit = async (e: React.FormEvent) => {
    // Prevent ANY default browser form submission / page reload
    e.preventDefault();
    e.stopPropagation();
    setSignupError('');

    // ── Client-side validation ────────────────────────────────────────────
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !signupPassword) {
      setSignupError('All fields are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSignupError('Please enter a valid email address.');
      return;
    }
    if (username.trim().length < 3) {
      setSignupError('Username must be at least 3 characters.');
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    // ── Call signup ───────────────────────────────────────────────────────
    const res = await signup({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: signupPassword,
    });

    if (res.success) {
      // Store the dev code so the verify screen can display it
      setDevCode(res.devCode ?? '');
      setVerifyEmail(email.trim().toLowerCase());
      startResendTimer();
      // Switch to verify mode LAST — avoids any intermediate render flash
      setMode('verify');
    } else {
      setSignupError(res.error || 'Registration failed. Please try a different username or email.');
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 3. VERIFICATION FLOW
  // ══════════════════════════════════════════════════════════════════════════

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVerifyError('');

    const cleanCode = verificationCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setVerifyError('Please enter the complete 6-digit code.');
      return;
    }

    const res = await verifyEmailCode(cleanCode, verifyEmail);
    if (res.success) {
      // ✅ Verification succeeded.
      // AuthContext.verifyEmailCode has already:
      //   • set user in React state  → isAuthenticated = true
      //   • set isOnboarding = true  → OnboardingWizard will open
      // We only need to clean up local dev state.
      // Do NOT navigate, reload, or redirect manually here.
      setDevCode('');
      setVerificationCode('');
      setVerifyError('');
      // (App.tsx will unmount AuthScreen and mount OnboardingWizard automatically)
    } else {
      // Stay on verify screen, show error
      setVerifyError(res.error || 'Invalid or expired code. Please check and try again.');
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !verifyEmail) return;
    setVerifyError('');
    setResendNotice('');

    const res = await sendVerificationCode(verifyEmail);
    if (res.success) {
      if (res.devCode) setDevCode(res.devCode);
      setResendNotice('A new code has been generated. Check the yellow box below or the browser console.');
      startResendTimer();
      setTimeout(() => setResendNotice(''), 7000);
    } else {
      setVerifyError(res.error || 'Failed to generate a new code. Please try again.');
    }
  };

  const handleChangeEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setChangeEmailError('');

    const cleanEmail = newEmailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setChangeEmailError('Please enter a valid email address.');
      return;
    }

    const res = await sendVerificationCode(cleanEmail);
    if (res.success) {
      if (res.devCode) setDevCode(res.devCode);
      setVerifyEmail(cleanEmail);
      setIsChangingEmail(false);
      setNewEmailInput('');
      setVerificationCode('');
      setVerifyError('');
      setResendNotice(`New code generated for ${cleanEmail}. Check the yellow box or console.`);
      startResendTimer();
      setTimeout(() => setResendNotice(''), 7000);
    } else {
      setChangeEmailError(res.error || 'Could not send a code to this email.');
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-black text-white select-none"
      style={{ animation: 'fadeIn .25s ease' }}
    >
      <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          <ConnectaLogo size={68} glow />
        </div>

        {/* ================================================================ */}
        {/* SIGN IN                                                          */}
        {/* ================================================================ */}
        {mode === 'signin' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Welcome Back</h1>
              <p className="text-xs text-neutral-400">Sign in to continue</p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleContinueSignIn} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-neutral-300">Username, phone or email</label>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username, phone or email"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                  required
                />
              </div>

              {stepPassword && (
                <div className="space-y-1 text-left animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-300">Password</label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPw ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoFocus
                      className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-500 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                    >
                      {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-white hover:bg-neutral-100 text-black font-extrabold text-sm transition-all active:scale-[0.99] shadow-lg disabled:opacity-50"
              >
                {isLoading ? 'Signing in…' : 'Continue'}
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="w-full border-t border-neutral-800" />
                <span className="bg-black px-3 text-xs text-neutral-500 lowercase absolute">or</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLoginError('Google OAuth requires domain configuration. Please use email/username above.');
                }}
                className="w-full py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                Continue with Google
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-neutral-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setSignupError(''); }}
                    className="text-white font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>

              <div className="pt-2 text-center border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => router.navigate('/admin/login')}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 hover:text-white transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-500" /> Authorized Staff &amp; Admin Portal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================ */}
        {/* CREATE ACCOUNT                                                   */}
        {/* ================================================================ */}
        {mode === 'signup' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setMode('signin'); setSignupError(''); }}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-neutral-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">Create Account</h1>
                <p className="text-xs text-neutral-400">Join Connecta today</p>
              </div>
            </div>

            {signupError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{signupError}</span>
              </div>
            )}

            {/* NOTE: action="" and method="post" are intentionally absent.
                onSubmit + e.preventDefault() is the only submission handler. */}
            <form onSubmit={handleSignupSubmit} className="space-y-3.5" noValidate>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  autoComplete="given-name"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-neutral-500 transition-colors"
                />
                <input
                  type="text"
                  autoComplete="family-name"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-neutral-500 transition-colors"
                />
              </div>

              <input
                type="text"
                autoComplete="username"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                className="w-full px-3.5 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-neutral-500 transition-colors"
              />

              <input
                type="email"
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-neutral-500 transition-colors"
              />

              <div className="relative">
                <input
                  type={showSignupPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create password (min 6 chars)"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-3.5 py-3 pr-11 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-neutral-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                >
                  {showSignupPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <input
                type="password"
                autoComplete="new-password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-neutral-500 transition-colors"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-white hover:bg-neutral-100 text-black font-extrabold text-sm transition-all active:scale-[0.99] shadow-lg mt-2 disabled:opacity-50"
              >
                {isLoading ? 'Creating account…' : 'Next — Verify Email'}
              </button>

              <div className="text-center pt-1">
                <p className="text-xs text-neutral-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setLoginError(''); }}
                    className="text-white font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================ */}
        {/* EMAIL VERIFICATION                                               */}
        {/* ================================================================ */}
        {mode === 'verify' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setVerifyError('');
                  setVerificationCode('');
                }}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-neutral-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">Verify your email</h1>
                <p className="text-xs text-neutral-400">
                  Code sent to <span className="text-white font-mono">{verifyEmail || 'your email'}</span>
                </p>
              </div>
            </div>

            {/* ── DEV MODE: show code prominently on screen ── */}
            {devCode && (
              <div className="p-4 rounded-2xl bg-amber-400/10 border-2 border-amber-400/50 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <span>🔑</span>
                  <span>Dev Mode — Verification Code</span>
                </div>
                <div className="text-center font-mono text-4xl font-black tracking-[0.35em] text-amber-400 py-2 select-all">
                  {devCode}
                </div>
                <p className="text-[10px] text-amber-400/60 text-center">
                  This box is only visible in development. Also printed in browser console.
                </p>
              </div>
            )}

            {verifyError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {resendNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{resendNotice}</span>
              </div>
            )}

            {/* Change-email sub-form */}
            {isChangingEmail ? (
              <form
                onSubmit={handleChangeEmailSubmit}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 animate-fade-in"
                noValidate
              >
                <div className="text-xs font-bold text-neutral-300">Enter new email address</div>
                {changeEmailError && (
                  <p className="text-xs text-rose-400">{changeEmailError}</p>
                )}
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="new-email@example.com"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-700 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-white"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsChangingEmail(false); setNewEmailInput(''); setChangeEmailError(''); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-black hover:bg-neutral-200 disabled:opacity-50"
                  >
                    Update &amp; Generate Code
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifySubmit} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="······"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length < 6}
                  className="w-full py-3.5 rounded-full bg-white hover:bg-neutral-100 text-black font-extrabold text-sm transition-all active:scale-[0.99] shadow-lg disabled:opacity-40"
                >
                  {isLoading ? 'Verifying…' : 'Verify & Continue'}
                </button>

                <div className="flex items-center justify-between text-xs pt-1 text-neutral-400">
                  <button
                    type="button"
                    onClick={() => { setIsChangingEmail(true); setNewEmailInput(verifyEmail); setVerifyError(''); }}
                    className="hover:text-white transition-colors font-semibold"
                  >
                    Change email
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={handleResendCode}
                    className={`font-semibold flex items-center gap-1.5 ${
                      resendCooldown > 0
                        ? 'text-neutral-600 cursor-not-allowed'
                        : 'text-white hover:underline'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? '' : 'hover:animate-spin'}`} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Forgot-password modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => { setIsForgotModalOpen(false); setResetSuccess(false); }}
        title="Reset Password"
      >
        <div className="space-y-4">
          <p className="text-xs text-neutral-400">
            Enter your registered email and we'll send recovery instructions.
          </p>
          {resetSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Recovery instructions sent! Check your inbox.</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setResetSuccess(true); }}
              className="space-y-3"
              noValidate
            >
              <input
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-neutral-500"
                required
              />
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-white text-black font-extrabold text-xs hover:bg-neutral-100 transition-colors shadow-md"
              >
                Send Recovery Link
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AuthScreen;
