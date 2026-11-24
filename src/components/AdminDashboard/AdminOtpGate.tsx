import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Lock, Mail, ShieldAlert } from 'lucide-react';
import { TmommycareLogo } from '../MommyCareLogo';
import { supabase } from '../../lib/supabase';
import { getApiBaseUrl } from '../../lib/api';

interface AdminOtpGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const apiUrl = getApiBaseUrl();

export const AdminOtpGate: React.FC<AdminOtpGateProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [method, setMethod] = useState<'otp' | 'password'>('otp');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isPasswordSetup, setIsPasswordSetup] = useState(
    () => new URLSearchParams(window.location.search).get('setup-password') === '1'
  );
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const verifyAdminAccess = async (accessToken: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/session`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        await supabase?.auth.signOut();
        setError('This account does not have an active administrator invitation.');
        return false;
      }
      return true;
    } catch (sessionError) {
      console.error('[Admin sign-in] Could not verify administrator session:', sessionError);
      setError('Could not verify administrator access. Check your connection and try again.');
      return false;
    }
  };

  const authorizeAdminSession = async (accessToken: string) => {
    try {
      if (!await verifyAdminAccess(accessToken)) return;
      sessionStorage.setItem('Tmommycare_admin_access_token', accessToken);
      sessionStorage.setItem('Tmommycare_admin_authenticated', 'true');
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.has('setup-password')) {
        currentUrl.searchParams.delete('setup-password');
        window.history.replaceState(null, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
      }
      window.dispatchEvent(new Event('Tmommycare-admin-authenticated'));
      onSuccess();
    } catch (sessionError) {
      console.error('[Admin sign-in] Could not verify administrator session:', sessionError);
      await supabase?.auth.signOut();
      setError('Could not verify administrator access. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setIsLoading(true);
    setError('');
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false }
    });
    setIsLoading(false);
    if (otpError) {
      console.error('[Admin OTP] Supabase failed to send the one-time code:', otpError);
      setError('This email is not an invited administrator, or the OTP could not be sent.');
      return;
    }
    setMessage('A one-time code was sent to your email.');
    setStep('otp');
  };

  const signInWithPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setIsLoading(true);
    setError('');
    setMessage('');
    const { data, error: passwordError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (passwordError || !data.session) {
      console.error('[Admin password] Supabase sign-in failed:', passwordError);
      setIsLoading(false);
      setError('Could not sign in with those credentials. Check the email and password, or use an email code.');
      return;
    }
    await authorizeAdminSession(data.session.access_token);
  };

  const saveAdminPassword = async (accessToken: string) => {
    if (!supabase) return;
    try {
      if (!await verifyAdminAccess(accessToken)) {
        setIsLoading(false);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        console.error('[Admin password setup] Supabase could not set the password:', updateError);
        setError(updateError.message || 'Could not set your password. Please try again.');
        setIsLoading(false);
        return;
      }
      await authorizeAdminSession(accessToken);
    } catch (setupError) {
      console.error('[Admin password setup] Could not complete password setup:', setupError);
      setError('Could not set your password. Check your connection and try again.');
      setIsLoading(false);
    }
  };

  const beginPasswordSetup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    const emailAddress = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      setError('Enter a valid administrator email address.');
      return;
    }
    if (password.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (session) {
        const sessionEmail = session.user.email?.toLowerCase();
        if (!sessionEmail || sessionEmail !== emailAddress) {
          setError('Use the email address that received and accepted the administrator invitation.');
          return;
        }
        await saveAdminPassword(session.access_token);
        return;
      }
      setError('Accept the administrator invitation in this browser first. Password setup does not use an email code.');
    } catch (setupError) {
      console.error('[Admin password setup] Could not start password setup:', setupError);
      setError('Could not start password setup. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setIsLoading(true);
    setError('');
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp.trim(),
      type: 'email'
    });
    if (verifyError || !data.session) {
      setIsLoading(false);
      setError('Invalid or expired code. Request a new code and try again.');
      return;
    }
    await authorizeAdminSession(data.session.access_token);
  };

  return (
    <div className="min-h-screen bg-[#14261B] flex items-center justify-center p-4 text-white relative font-['Plus_Jakarta_Sans']">
      <button onClick={onCancel} className="absolute top-6 left-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-white/90 text-xs font-semibold">
        <ArrowLeft className="w-4 h-4" /> Return to Public Website
      </button>
      <div className="w-full max-w-md bg-[#1A3324] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex justify-center mb-5"><TmommycareLogo colorScheme="white" size="lg" showTagline showLocationBadge={false} /></div>
        <div className="inline-flex items-center gap-2 text-emerald-300 text-xs font-bold mb-3"><Lock className="w-4 h-4 text-[#F4A261]" /> Restricted Coordinator Console</div>
        <h1 className="text-2xl font-bold font-['Outfit']">{isPasswordSetup ? 'Set your administrator password' : 'Administrator sign in'}</h1>
        <p className="text-sm text-[#A8C2B0] mt-2 mb-6">{isPasswordSetup ? 'Accept your administrator invitation in this browser first. Only an active invited administrator can save a password.' : 'Use the email address associated with your active administrator account.'}</p>
        {isPasswordSetup ? (
          <form onSubmit={beginPasswordSetup} className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A8C2B0]">Administrator email
              <input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="admin@example.com" className="mt-2 w-full rounded-xl bg-white/10 border border-white/15 py-3 px-3 text-white placeholder:text-white/40 normal-case tracking-normal" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A8C2B0]">New password
              <input required type="password" autoComplete="new-password" minLength={8} value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl bg-white/10 border border-white/15 py-3 px-3 text-white" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A8C2B0]">Confirm password
              <input required type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-xl bg-white/10 border border-white/15 py-3 px-3 text-white" />
            </label>
            <button disabled={isLoading} className="w-full py-3 rounded-xl bg-[#D96B43] disabled:opacity-50 font-bold">{isLoading ? 'Saving password...' : 'Save password and continue'}</button>
            <button type="button" onClick={() => { setIsPasswordSetup(false); setStep('email'); setError(''); setMessage(''); }} className="w-full text-xs text-[#A8C2B0]">Already have a password? Sign in</button>
          </form>
        ) : (
          <>
        <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/15 bg-white/5 p-1" role="tablist" aria-label="Administrator sign-in method">
          <button type="button" role="tab" aria-selected={method === 'otp'} onClick={() => {
            setMethod('otp');
            setIsPasswordSetup(false);
            setStep('email');
            setError('');
            setMessage('');
          }} className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${method === 'otp' ? 'bg-white/15 text-white' : 'text-[#A8C2B0] hover:text-white'}`}>
            Email code
          </button>
          <button type="button" role="tab" aria-selected={method === 'password'} onClick={() => {
            setMethod('password');
            setIsPasswordSetup(false);
            setStep('email');
            setError('');
            setMessage('');
          }} className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${method === 'password' ? 'bg-white/15 text-white' : 'text-[#A8C2B0] hover:text-white'}`}>
            Password
          </button>
        </div>
        {step === 'email' ? (
          method === 'otp' ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A8C2B0]">Administrator email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4A261]" /><input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="admin@example.com" className="w-full rounded-xl bg-white/10 border border-white/15 py-3 pl-10 pr-3 text-white placeholder:text-white/40" /></div>
              <button disabled={isLoading} className="w-full py-3 rounded-xl bg-[#D96B43] disabled:opacity-50 font-bold">{isLoading ? 'Sending code...' : 'Send email code'}</button>
            </form>
          ) : (
            <form onSubmit={signInWithPassword} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A8C2B0]">Administrator email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4A261]" /><input required type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} placeholder="admin@example.com" className="w-full rounded-xl bg-white/10 border border-white/15 py-3 pl-10 pr-3 text-white placeholder:text-white/40" /></div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A8C2B0]">Password
                <input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl bg-white/10 border border-white/15 py-3 px-3 text-white" />
              </label>
              <button disabled={isLoading} className="w-full py-3 rounded-xl bg-[#D96B43] disabled:opacity-50 font-bold">{isLoading ? 'Signing in...' : 'Sign in with password'}</button>
              <button type="button" disabled={isLoading} onClick={() => { setIsPasswordSetup(true); setStep('email'); setError(''); setMessage(''); }} className="w-full text-xs text-[#A8C2B0] underline underline-offset-4 disabled:opacity-50">First time? Create a password</button>
            </form>
          )
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A8C2B0]">One-time code</label>
            <input required inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="Enter code from email" className="w-full rounded-xl bg-white/10 border border-white/15 py-3 px-3 text-white placeholder:text-white/40 tracking-[0.3em]" />
            <button disabled={isLoading} className="w-full py-3 rounded-xl bg-[#D96B43] disabled:opacity-50 font-bold">{isLoading ? 'Verifying...' : 'Verify and open dashboard'}</button>
            <button type="button" onClick={() => { setStep('email'); setOtp(''); setMessage(''); }} className="w-full text-xs text-[#A8C2B0]">Use a different email</button>
          </form>
        )}
          </>
        )}
        {message && <p className="mt-4 text-xs text-emerald-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{message}</p>}
        {error && <p className="mt-4 text-xs text-red-300 flex items-center gap-2"><ShieldAlert className="w-4 h-4" />{error}</p>}
      </div>
    </div>
  );
};
