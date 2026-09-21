import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Lock, Mail, ShieldAlert } from 'lucide-react';
import { MommyCareLogo } from '../MommyCareLogo';
import { supabase } from '../../lib/supabase';

interface AdminOtpGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

interface AdminPinGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminPinGate: React.FC<AdminPinGateProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);
  const getPin = () => localStorage.getItem('mommycare_admin_pin') || '2540';
  const verify = (candidate: string) => {
    if (candidate === getPin()) {
      localStorage.setItem('mommycare_admin_pin', candidate);
      sessionStorage.setItem('mommycare_admin_pin', candidate);
      sessionStorage.setItem('mommycare_admin_authenticated', 'true');
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };
  const press = (digit: string) => {
    const next = `${pin}${digit}`;
    setPin(next);
    setError(false);
    if (next.length === getPin().length) verify(next);
  };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (/^\d$/.test(event.key)) press(event.key);
      else if (event.key === 'Backspace') setPin(value => value.slice(0, -1));
      else if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
  return (
    <div className="min-h-screen bg-[#14261B] flex items-center justify-center p-4 text-white">
      <button onClick={onCancel} className="absolute top-6 left-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-white/90 text-xs font-semibold"><ArrowLeft className="w-4 h-4" /> Return to Public Website</button>
      <div className="w-full max-w-sm bg-[#1A3324] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-5"><MommyCareLogo colorScheme="white" size="lg" showTagline showLocationBadge={false} /></div>
        <div className="inline-flex items-center gap-2 text-emerald-300 text-xs font-bold mb-3"><Lock className="w-4 h-4 text-[#F4A261]" /> Restricted Coordinator Console</div>
        <p className="text-sm text-[#A8C2B0] mb-5">Enter the dashboard security PIN.</p>
        <div className="flex justify-center gap-3 mb-4">{[0,1,2,3,4,5].map(index => <div key={index} className={`w-10 h-11 rounded-xl flex items-center justify-center text-lg font-bold ${pin.length > index ? 'bg-[#D96B43]' : 'bg-white/5 border border-white/10'}`}>{pin.length > index ? (showPin ? pin[index] : '•') : ''}</div>)}</div>
        <div className="h-6 mb-3 text-xs">{error ? <span className="text-red-300 inline-flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Invalid PIN</span> : <button onClick={() => setShowPin(value => !value)} className="text-[#A8C2B0] inline-flex items-center gap-1">{showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showPin ? 'Hide' : 'Show'} characters</button>}</div>
        <div className="grid grid-cols-3 gap-2.5 mb-5">{['1','2','3','4','5','6','7','8','9'].map(digit => <button key={digit} onClick={() => press(digit)} className="h-12 rounded-2xl bg-white/10 text-white font-bold text-lg">{digit}</button>)}<button onClick={() => setPin('')} className="h-12 rounded-2xl bg-white/5 text-white/70 text-xs font-semibold">Clear</button><button onClick={() => press('0')} className="h-12 rounded-2xl bg-white/10 text-white font-bold text-lg">0</button><button onClick={() => setPin(value => value.slice(0,-1))} className="h-12 rounded-2xl bg-white/5 text-white/70 text-xs font-semibold">Delete</button></div>
        <button onClick={() => verify(pin)} disabled={pin.length < 4} className="w-full py-3 rounded-xl bg-[#D96B43] disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2"><KeyRound className="w-4 h-4" /> Unlock Dashboard</button>
        <p className="mt-4 text-[11px] text-[#A8C2B0]">Default PIN: <strong className="text-white">2540</strong>. Change it in Dashboard Settings.</p>
      </div>
    </div>
  );
};
