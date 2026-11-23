import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { BadgeCheck, LoaderCircle, LockKeyhole, Smartphone } from 'lucide-react';
import { getApiBaseUrl } from '../lib/api';

type PaymentStatus = 'awaiting_payment' | 'initiating' | 'pending' | 'paid' | 'failed';
const mapPaymentErrorMessage = (message: string) => {
  const normalized = message.toLowerCase();
  if (normalized.includes('ds timeout') || normalized.includes('user cannot be reached')) {
    return 'Phone unreachable. Please retry in a moment or use another number.';
  }
  if (normalized.includes('insufficient')) {
    return 'Insufficient M-Pesa balance. Top up and try again, or use another number.';
  }
  if (normalized.includes('cancelled by user') || normalized.includes('request cancelled')) {
    return 'Payment prompt was cancelled. Tap "Pay" to retry.';
  }
  if (normalized.includes('wrong pin') || normalized.includes('invalid pin')) {
    return 'Incorrect M-Pesa PIN. Please try again.';
  }
  return message;
};
const salaryBandOptions = [
  'KES 6,000–8,000',
  'KES 8,001–12,000',
  'KES 12,001–15,000',
  'KES 15,001–20,000',
  'Above KES 20,000'
] as const;

export const ProviderPaymentPage: React.FC = () => {
  const api = getApiBaseUrl();
  const paymentId = new URLSearchParams(window.location.search).get('id') || '';
  const [feeKes, setFeeKes] = useState(0);
  const [available, setAvailable] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [monthlySalaryRange, setMonthlySalaryRange] = useState('');
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [updatingSalaryBand, setUpdatingSalaryBand] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const statusCheckInFlight = useRef(false);

  const checkStatus = useCallback(async () => {
    if (statusCheckInFlight.current) return;
    statusCheckInFlight.current = true;
    try {
      const response = await fetch(`${api}/api/provider-payments/${encodeURIComponent(paymentId)}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not check payment status.');
      setStatus(result.status);
      setFeeKes(Number(result.amountKes) || 0);
      setReceiptNumber(result.receiptNumber || '');
      if (typeof result.monthlySalaryRange === 'string') setMonthlySalaryRange(result.monthlySalaryRange);
      if (result.status === 'failed' && result.message) setError(mapPaymentErrorMessage(result.message));
    } finally {
      statusCheckInFlight.current = false;
    }
  }, [api, paymentId]);

  useEffect(() => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentId)) {
      setError('This payment link is invalid. Please return to provider registration and try again.');
      return;
    }
    const savedPhone = sessionStorage.getItem(`Tmommycare-provider-payment-phone-${paymentId}`);
    if (savedPhone) setPhoneNumber(savedPhone);
    void Promise.all([
      fetch(`${api}/api/provider-payment-settings`).then(async response => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Could not load payment information.');
        setAvailable(Boolean(result.available));
      }),
      checkStatus()
    ]).catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Could not load payment information.'));
  }, [api, checkStatus, paymentId]);

  useEffect(() => {
    if (status !== 'pending') return;
    let pollCount = 0;
    const maxPolls = 24;
    const timer = window.setInterval(() => {
      if (pollCount >= maxPolls) {
        window.clearInterval(timer);
        setMessage('Still waiting for payment confirmation. Tap "Check payment status" after you complete the prompt.');
        return;
      }
      pollCount += 1;
      void checkStatus().catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Could not check payment status.'));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [checkStatus, status]);

  useEffect(() => {
    if (status === 'paid') sessionStorage.removeItem(`Tmommycare-provider-payment-phone-${paymentId}`);
  }, [paymentId, status]);

  const startPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${api}/api/payments/stk-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: paymentId, phoneNumber })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(mapPaymentErrorMessage(result.error || 'Could not start M-Pesa payment.'));
      setStatus('pending');
      if (result.message) setMessage(result.message);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? mapPaymentErrorMessage(paymentError.message) : 'Could not start M-Pesa payment.');
    } finally {
      setBusy(false);
    }
  };

  const cancelPaymentPrompt = async () => {
    setCancelling(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${api}/api/provider-payments/${encodeURIComponent(paymentId)}/cancel`, { method: 'POST' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not cancel payment request.');
      setStatus('failed');
      setError(result.message || 'Payment prompt cancelled. You can retry now.');
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Could not cancel payment request.');
    } finally {
      setCancelling(false);
    }
  };

  const updateSalaryBand = async () => {
    if (!monthlySalaryRange) return;
    setUpdatingSalaryBand(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${api}/api/provider-payments/${encodeURIComponent(paymentId)}/salary-band`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlySalaryRange })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not update the salary band.');
      setStatus(result.status || 'awaiting_payment');
      setFeeKes(Number(result.amountKes) || 0);
      setMessage(result.message || 'Salary band updated.');
      if (result.status === 'paid') setError('');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update the salary band.');
    } finally {
      setUpdatingSalaryBand(false);
    }
  };

  const isPaid = status === 'paid';
  const isPending = status === 'pending' || status === 'initiating';

  return <main className="flex-1 bg-[radial-gradient(ellipse_at_top,_#f1e9dc_0%,_#faf7f2_45%)] px-4 py-10 sm:px-6 sm:py-16">
    <section className="mx-auto max-w-xl rounded-[2rem] border border-[#E8DFD3] bg-white p-6 shadow-[0_24px_70px_rgba(42,35,25,0.08)] sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F0EA] text-[#1D432D]">
        {isPaid ? <BadgeCheck className="h-7 w-7" /> : isPending ? <LoaderCircle className="h-7 w-7 animate-spin" /> : <Smartphone className="h-7 w-7" />}
      </div>
      <p className="mt-5 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-[#D96B43]">Provider registration</p>
      <h1 className="mt-2 text-center font-['Outfit'] text-3xl font-extrabold text-[#1A201C]">
        {isPaid ? 'Payment confirmed' : isPending ? 'Complete payment on your phone' : 'Registration fee'}
      </h1>
      {isPaid ? <>
        <p className="mt-4 text-center text-sm leading-7 text-[#635E59]">Your payment has been confirmed and your application is now in the private Tmommycare review queue.</p>
        {receiptNumber && <p className="mt-3 text-center text-sm font-bold text-[#1D432D]">M-Pesa receipt: {receiptNumber}</p>}
        <a href="/provider/applications" className="mt-3 block text-center text-xs font-bold text-[#1D432D] underline underline-offset-4">View my applications</a>
        <a href="/" className="mt-7 block rounded-xl bg-[#1D432D] px-5 py-3.5 text-center text-sm font-bold text-white">Return to Tmommycare</a>
      </> : isPending ? <>
        <p className="mt-4 text-center text-sm leading-7 text-[#635E59]">An M-Pesa STK Push was sent to <strong>{phoneNumber}</strong>. Enter your M-Pesa PIN on your phone. This page will update after Tmommycares confirms the payment.</p>
        {(message || error) && <p role={error ? 'alert' : 'status'} className={`mt-4 rounded-xl p-3 text-center text-sm ${error ? 'border border-red-200 bg-red-50 text-red-800' : 'bg-[#FAF7F2] text-[#635E59]'}`}>{error || message}</p>}
        <button type="button" onClick={() => void checkStatus().catch(statusError => setError(statusError instanceof Error ? statusError.message : 'Could not check payment status.'))} className="mt-6 w-full rounded-xl border border-[#D5C9BA] px-5 py-3 text-sm font-bold text-[#1D432D]">Check payment status</button>
        <button type="button" onClick={() => void cancelPaymentPrompt()} disabled={cancelling} className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-60">
          {cancelling ? <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" /> Cancelling prompt…</span> : 'Cancel payment and retry'}
        </button>
        <div className="mt-4 rounded-xl border border-[#E7E1D9] bg-[#FCFBF9] p-4">
          <label className="block text-xs font-bold text-[#514B44]">Wrong salary band? Update application
            <select value={monthlySalaryRange} onChange={event => setMonthlySalaryRange(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#E7E1D9] bg-white px-4 py-3 text-sm text-[#1A201C] outline-none focus:border-[#1D432D] focus:ring-4 focus:ring-[#1D432D]/10">
              <option value="">Select salary band</option>
              {salaryBandOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => void updateSalaryBand()} disabled={updatingSalaryBand || !monthlySalaryRange}
            className="mt-3 w-full rounded-xl border border-[#D5C9BA] px-5 py-3 text-sm font-bold text-[#1D432D] disabled:cursor-not-allowed disabled:opacity-60">
            {updatingSalaryBand ? <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" /> Updating salary band…</span> : 'Update salary band'}
          </button>
        </div>
      </> : <>
        <p className="mt-3 text-center text-sm leading-6 text-[#635E59]">Pay the provider registration fee to submit your application for review. Your profile will not be created until M-Pesa confirms the payment.</p>
        <div className="mt-6 rounded-2xl bg-[#FAF7F2] p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#777067]">Registration fee · KES</p>
          <p className="mt-1 font-['Outfit'] text-4xl font-extrabold text-[#1D432D]">{feeKes ? feeKes.toLocaleString() : '—'}</p>
        </div>
        <div className="mt-4 rounded-xl border border-[#E7E1D9] bg-[#FCFBF9] p-4">
          <label className="block text-xs font-bold text-[#514B44]">Salary band
            <select value={monthlySalaryRange} onChange={event => setMonthlySalaryRange(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#E7E1D9] bg-white px-4 py-3 text-sm text-[#1A201C] outline-none focus:border-[#1D432D] focus:ring-4 focus:ring-[#1D432D]/10">
              <option value="">Select salary band</option>
              {salaryBandOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => void updateSalaryBand()} disabled={updatingSalaryBand || !monthlySalaryRange}
            className="mt-3 w-full rounded-xl border border-[#D5C9BA] px-5 py-3 text-sm font-bold text-[#1D432D] disabled:cursor-not-allowed disabled:opacity-60">
            {updatingSalaryBand ? <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" /> Updating salary band…</span> : 'Update salary band fee'}
          </button>
        </div>
        <form onSubmit={startPayment} className="mt-6 space-y-4">
          <label className="block text-xs font-bold text-[#514B44]">M-Pesa phone number
            <input required type="tel" autoComplete="tel" value={phoneNumber} onChange={event => setPhoneNumber(event.target.value)} placeholder="07XXXXXXXX or 2547XXXXXXXX" className="mt-2 w-full rounded-xl border border-[#E7E1D9] bg-[#FCFBF9] px-4 py-3.5 text-sm text-[#1A201C] outline-none focus:border-[#1D432D] focus:ring-4 focus:ring-[#1D432D]/10" />
          </label>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {!available && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">M-Pesa payments are not available yet. Please contact Tmommycare or try again later.</p>}
          <button type="submit" disabled={!available || !feeKes || busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D432D] px-5 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Requesting payment…</> : <><LockKeyhole className="h-4 w-4" /> Pay KES {feeKes ? feeKes.toLocaleString() : ''} with M-Pesa</>}
          </button>
          <p className="text-center text-xs leading-5 text-[#777067]">You will receive a secure STK Push on your phone. Your application details and documents stay private while payment is pending.</p>
        </form>
      </>}
    </section>
  </main>;
};
