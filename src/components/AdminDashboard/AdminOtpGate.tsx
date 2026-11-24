import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldAlert, ShieldCheck } from 'lucide-react';
import { TmommycareLogo } from '../TmommycareLogo';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const verifyAdminAccess = async (accessToken: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/session`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        await supabase?.auth.signOut();
        setError('This account does not have active administrator access.');
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
          setError('Use the email address that received the administrator password setup link.');
          return;
        }
        await saveAdminPassword(session.access_token);
        return;
      }
      setError('Open the password setup link sent to your email in this browser first. If it has expired, ask an administrator to send another.');
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

  const fieldClass = 'w-full rounded-xl border border-[#E3E6EB] bg-white py-3 pl-10 pr-3 text-sm text-[#191B22] outline-none transition focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 placeholder:text-[#A2A7B0]';
  const passwordClass = 'w-full rounded-xl border border-[#E3E6EB] bg-white py-3 pl-10 pr-11 text-sm text-[#191B22] outline-none transition focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 placeholder:text-[#A2A7B0]';
  const buttonClass = 'w-full rounded-xl bg-[#17182C] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#292A40] focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-0 text-[#191B22] sm:min-h-0 sm:p-4">
      <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col overflow-hidden border border-[#E5E7EB] bg-white sm:min-h-[calc(100vh-2rem)] sm:rounded-2xl">
        <header className="relative z-20 flex h-[68px] shrink-0 items-center justify-between border-b border-[#EEF0F3] bg-white px-4 sm:px-7">
          <div className="flex items-center gap-2.5">
            <TmommycareLogo variant="icon" size="sm" onClick={event => event.preventDefault()} />
            <div>
              <p className="text-sm font-bold tracking-tight text-[#191B22]">Tmommycare</p>
              <p className="text-[10px] font-medium text-[#89909B]">Administrator portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-full border border-[#E6E8EC] px-3.5 py-2 text-xs font-semibold text-[#383B44] transition hover:bg-[#F7F8FA]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Return to public website</span>
            <span className="sm:hidden">Back</span>
          </button>
        </header>

        <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-white px-4 py-6 sm:px-6">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-40" aria-hidden="true">
            <svg viewBox="0 0 1400 220" preserveAspectRatio="none" className="h-full w-full">
              <path d="M0 100 C190 124 250 190 470 163 C700 134 855 186 1050 139 C1195 104 1295 112 1400 90 V220 H0 Z" fill="#D9EE9B" />
              <path d="M0 148 C175 116 278 193 488 179 C690 166 810 200 1010 154 C1185 115 1310 132 1400 118 V220 H0 Z" fill="#A9D957" />
              <path d="M0 180 C210 145 315 208 535 190 C748 173 850 216 1080 178 C1208 157 1328 171 1400 156 V220 H0 Z" fill="#69B337" />
              <path d="M0 203 C200 181 329 218 535 205 C778 189 895 221 1122 197 C1261 182 1332 192 1400 184 V220 H0 Z" fill="#4C972E" />
              <g fill="#FFFDF2">
                <circle cx="95" cy="188" r="7" /><circle cx="89" cy="181" r="5" /><circle cx="101" cy="181" r="5" /><circle cx="95" cy="176" r="5" />
                <circle cx="318" cy="198" r="7" /><circle cx="312" cy="191" r="5" /><circle cx="324" cy="191" r="5" /><circle cx="318" cy="186" r="5" />
                <circle cx="1115" cy="180" r="7" /><circle cx="1109" cy="173" r="5" /><circle cx="1121" cy="173" r="5" /><circle cx="1115" cy="168" r="5" />
                <circle cx="1310" cy="167" r="7" /><circle cx="1304" cy="160" r="5" /><circle cx="1316" cy="160" r="5" /><circle cx="1310" cy="155" r="5" />
              </g>
              <g fill="#F2B84B">
                <circle cx="95" cy="186" r="2.5" /><circle cx="318" cy="196" r="2.5" /><circle cx="1115" cy="178" r="2.5" /><circle cx="1310" cy="165" r="2.5" />
              </g>
            </svg>
          </div>

          <div className="relative z-10 flex w-full flex-col items-center">
            <div className="mb-[-16px] flex h-[104px] w-full items-end justify-center">
              <TmommycareLogo
                variant="compact"
                size="md"
                onClick={event => event.preventDefault()}
              />
            </div>
            <section className="w-full max-w-[390px] rounded-[22px] border border-[#E7E8EC] bg-white px-5 pb-6 pt-5 shadow-[0_12px_42px_rgba(20,25,38,0.10)] sm:px-7 sm:pb-7">
            <div className="mb-2 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2F7F4] px-2.5 py-1 text-[10px] font-bold text-[#276344]">
                <ShieldCheck className="h-3.5 w-3.5" /> Restricted administrator access
              </span>
            </div>
            <h1 className="text-center text-xl font-bold tracking-tight text-[#191B22] sm:text-[22px]">
              {isPasswordSetup ? 'Set your password' : step === 'otp' ? 'Check your email' : 'Welcome back'}
            </h1>
            <p className="mx-auto mt-1.5 max-w-[300px] text-center text-xs leading-relaxed text-[#737985]">
              {isPasswordSetup
                ? 'Use the secure setup link sent to your administrator email.'
                : step === 'otp'
                  ? `Enter the one-time code sent to ${email}.`
                  : 'Sign in to continue to the Tmommycare admin console.'}
            </p>

            {isPasswordSetup ? (
              <form onSubmit={beginPasswordSetup} className="mt-5 space-y-3.5">
                <label className="block text-xs font-semibold text-[#353944]">
                  Administrator email
                  <span className="relative mt-1.5 block">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D939D]" />
                    <input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="admin@example.com" className={fieldClass} />
                  </span>
                </label>
                <label className="block text-xs font-semibold text-[#353944]">
                  New password
                  <span className="relative mt-1.5 block">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D939D]" />
                    <input required type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} value={password} onChange={event => setPassword(event.target.value)} className={passwordClass} />
                    <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#818895]">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                  <span className="mt-1 block text-[10px] font-normal text-[#89909B]">Use at least 8 characters.</span>
                </label>
                <label className="block text-xs font-semibold text-[#353944]">
                  Confirm password
                  <span className="relative mt-1.5 block">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D939D]" />
                    <input required type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className={passwordClass} />
                    <button type="button" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} onClick={() => setShowConfirmPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#818895]">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                </label>
                <button disabled={isLoading} className={buttonClass}>{isLoading ? 'Saving password…' : 'Save password and continue'}</button>
                <button type="button" onClick={() => { setIsPasswordSetup(false); setStep('email'); setError(''); setMessage(''); }} className="w-full py-1 text-xs font-semibold text-[#555B67] hover:text-[#17182C]">
                  Already have a password? Sign in
                </button>
              </form>
            ) : (
              <>
                <div className="mt-5 grid grid-cols-2 rounded-xl bg-[#F3F5F8] p-1" role="tablist" aria-label="Administrator sign-in method">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={method === 'otp'}
                    onClick={() => {
                      setMethod('otp');
                      setIsPasswordSetup(false);
                      setStep('email');
                      setError('');
                      setMessage('');
                    }}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${method === 'otp' ? 'bg-white text-[#1E2430] shadow-sm' : 'text-[#737985] hover:text-[#343945]'}`}
                  >
                    Email code
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={method === 'password'}
                    onClick={() => {
                      setMethod('password');
                      setIsPasswordSetup(false);
                      setStep('email');
                      setError('');
                      setMessage('');
                    }}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${method === 'password' ? 'bg-white text-[#1E2430] shadow-sm' : 'text-[#737985] hover:text-[#343945]'}`}
                  >
                    Password
                  </button>
                </div>

                {step === 'email' ? (
                  method === 'otp' ? (
                    <form onSubmit={sendOtp} className="mt-4 space-y-4">
                      <label className="block text-xs font-semibold text-[#353944]">
                        Administrator email
                        <span className="relative mt-1.5 block">
                          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D939D]" />
                          <input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="admin@example.com" className={fieldClass} />
                        </span>
                      </label>
                      <button disabled={isLoading} className={buttonClass}>{isLoading ? 'Sending code…' : 'Send email code'}</button>
                    </form>
                  ) : (
                    <form onSubmit={signInWithPassword} className="mt-4 space-y-3.5">
                      <label className="block text-xs font-semibold text-[#353944]">
                        Administrator email
                        <span className="relative mt-1.5 block">
                          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D939D]" />
                          <input required type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} placeholder="admin@example.com" className={fieldClass} />
                        </span>
                      </label>
                      <label className="block text-xs font-semibold text-[#353944]">
                        Password
                        <span className="relative mt-1.5 block">
                          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D939D]" />
                          <input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className={passwordClass} />
                          <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#818895]">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </span>
                      </label>
                      <div className="flex justify-end">
                        <button type="button" disabled={isLoading} onClick={() => { setIsPasswordSetup(true); setStep('email'); setError(''); setMessage(''); }} className="text-[11px] font-semibold text-[#4B5D93] hover:underline disabled:opacity-50">
                          First time? Set up a password
                        </button>
                      </div>
                      <button disabled={isLoading} className={buttonClass}>{isLoading ? 'Signing in…' : 'Sign in'}</button>
                    </form>
                  )
                ) : (
                  <form onSubmit={verifyOtp} className="mt-4 space-y-4">
                    <label className="block text-xs font-semibold text-[#353944]">
                      One-time code
                      <input required inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="Enter code from email" className="mt-1.5 w-full rounded-xl border border-[#E3E6EB] bg-white px-3 py-3 text-center text-base tracking-[0.35em] text-[#191B22] outline-none transition focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-100 placeholder:text-xs placeholder:tracking-normal placeholder:text-[#A2A7B0]" />
                    </label>
                    <button disabled={isLoading} className={buttonClass}>{isLoading ? 'Verifying…' : 'Verify and open dashboard'}</button>
                    <button type="button" onClick={() => { setStep('email'); setOtp(''); setMessage(''); }} className="w-full text-xs font-semibold text-[#555B67] hover:text-[#17182C]">
                      Use a different email
                    </button>
                  </form>
                )}
              </>
            )}

            {message && <p role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs leading-relaxed text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{message}</p>}
            {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-700"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
            <p className="mt-5 border-t border-[#EEF0F3] pt-4 text-center text-[10px] text-[#858B96]">
              Only active, invited administrators can access this console.
            </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};
