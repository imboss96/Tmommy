import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Lock, Mail, ShieldAlert } from 'lucide-react';
import { MommyCareLogo } from '../MommyCareLogo';
import { supabase } from '../../lib/supabase';
import { getApiBaseUrl } from '../../lib/api';

interface AdminOtpGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const apiUrl = getApiBaseUrl();

export const AdminOtpGate: React.FC<AdminOtpGateProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    const response = await fetch(`${apiUrl}/api/admin/session`, {
      headers: { Authorization: `Bearer ${data.session.access_token}` }
    });
    setIsLoading(false);
    if (!response.ok) {
      await supabase.auth.signOut();
      setError('This account is not an active MommyCare administrator.');
      return;
    }
    sessionStorage.setItem('mommycare_admin_access_token', data.session.access_token);
    sessionStorage.setItem('mommycare_admin_authenticated', 'true');
    window.dispatchEvent(new Event('mommycare-admin-authenticated'));
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#14261B] flex items-center justify-center p-4 text-white relative font-['Plus_Jakarta_Sans']">
      <button onClick={onCancel} className="absolute top-6 left-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-white/90 text-xs font-semibold">
        <ArrowLeft className="w-4 h-4" /> Return to Public Website
      </button>
      <div className="w-full max-w-md bg-[#1A3324] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex justify-center mb-5"><MommyCareLogo colorScheme="white" size="lg" showTagline showLocationBadge={false} /></div>
        <div className="inline-flex items-center gap-2 text-emerald-300 text-xs font-bold mb-3"><Lock className="w-4 h-4 text-[#F4A261]" /> Restricted Coordinator Console</div>
        <h1 className="text-2xl font-bold font-['Outfit']">Administrator sign in</h1>
        <p className="text-sm text-[#A8C2B0] mt-2 mb-6">Use your invited email address. We will send a one-time verification code.</p>
        {step === 'email' ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A8C2B0]">Administrator email</label>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4A261]" /><input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="admin@example.com" className="w-full rounded-xl bg-white/10 border border-white/15 py-3 pl-10 pr-3 text-white placeholder:text-white/40" /></div>
            <button disabled={isLoading} className="w-full py-3 rounded-xl bg-[#D96B43] disabled:opacity-50 font-bold">{isLoading ? 'Sending code...' : 'Send email code'}</button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A8C2B0]">One-time code</label>
            <input required inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="Enter code from email" className="w-full rounded-xl bg-white/10 border border-white/15 py-3 px-3 text-white placeholder:text-white/40 tracking-[0.3em]" />
            <button disabled={isLoading} className="w-full py-3 rounded-xl bg-[#D96B43] disabled:opacity-50 font-bold">{isLoading ? 'Verifying...' : 'Verify and open dashboard'}</button>
            <button type="button" onClick={() => { setStep('email'); setOtp(''); setMessage(''); }} className="w-full text-xs text-[#A8C2B0]">Use a different email</button>
          </form>
        )}
        {message && <p className="mt-4 text-xs text-emerald-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{message}</p>}
        {error && <p className="mt-4 text-xs text-red-300 flex items-center gap-2"><ShieldAlert className="w-4 h-4" />{error}</p>}
      </div>
    </div>
  );
};
