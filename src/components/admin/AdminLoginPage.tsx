import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Shield, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { router } from '../../router';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setIsLoading(true);

    try {
      // Perform authentication via AuthContext
      const res = await login(loginId, password);
      setIsLoading(false);

      if (res.success && res.user) {
        if (res.user.role === 'user') {
          setError('Access Denied: Standard user accounts do not have administrator permissions.');
          return;
        }

        // Verified Admin Role -> navigate to admin dashboard
        router.navigate('/admin/dashboard');
      } else {
        setError(res.error || 'Invalid administrator credentials. Please check your username/email and password.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError('Authentication failed. Unable to connect to authorization server.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-900 text-white animate-fade-in">
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Connecta Admin Portal</h1>
          <p className="text-xs text-slate-400">Strictly Authorized Personnel Access Only</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Credentials Tip */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
          <p className="font-bold text-emerald-400">Authorized Administrator Account:</p>
          <p><strong>Email:</strong> asogwakenechukwu284@gmail.com</p>
          <p><strong>Username:</strong> Humble</p>
          <p><strong>Password:</strong> treasuremu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Administrator Email or Username"
            type="text"
            placeholder="asogwakenechukwu284@gmail.com or Humble"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500" isLoading={isLoading}>
            Sign In to Admin Portal
          </Button>
        </form>

        <div className="pt-2 text-center border-t border-slate-700/80">
          <button
            onClick={() => router.navigate('/feed')}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to User Application
          </button>
        </div>
      </div>
    </div>
  );
};
