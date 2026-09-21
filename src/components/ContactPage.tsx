import React, { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, LoaderCircle, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { getApiBaseUrl } from '../lib/api';

interface ContactPageProps {
  onOpenBooking: () => void;
  onOpenEmergency: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenBooking, onOpenEmergency }) => {
  const { siteConfig } = useContent();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submissionState, setSubmissionState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [submissionError, setSubmissionError] = useState('');
  const [copied, setCopied] = useState(false);
  const whatsappUrl = useMemo(() => {
    const number = siteConfig.whatsappPhone.replace(/\D/g, '');
    const text = form.message.trim() || siteConfig.whatsappMessage;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }, [form.message, siteConfig.whatsappMessage, siteConfig.whatsappPhone]);

  const submitContactForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const apiUrl = getApiBaseUrl();
    setSubmissionState('sending');
    setSubmissionError('');
    try {
      const response = await fetch(`${apiUrl}/api/contact-inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not send your message. Please try WhatsApp instead.');
      setSubmissionState('sent');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setSubmissionState('error');
      setSubmissionError(error instanceof Error ? error.message : 'We could not send your message.');
    }
  };

  const copyEmail = async () => {
    await navigator.clipboard?.writeText(siteConfig.conciergeEmail);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="flex-1 bg-[#FAF7F2]">
      <section className="relative overflow-hidden border-b border-[#E8DFD3] py-16 sm:py-20">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#E76F51]/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#F2C2B2] bg-[#FAF0EB] px-3.5 py-1.5 text-xs font-bold text-[#D96B43]"><MessageCircle className="h-4 w-4" /> Contact MommyCare</div>
          <h1 className="font-['Outfit'] text-4xl font-extrabold leading-tight tracking-tight text-[#1A201C] sm:text-5xl">Let&apos;s find the right care together.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#635E59]">Whether you are planning ahead or need support today, our care team is ready to help you take the next step.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={onOpenBooking} className="rounded-xl bg-[#D96B43] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#D96B43]/20 transition-colors hover:bg-[#C25832]">Book a care consultation</button>
            <button onClick={onOpenEmergency} className="rounded-xl border border-[#1D432D] px-5 py-3 text-sm font-bold text-[#1D432D] transition-colors hover:bg-[#E8F0EA]">Request emergency backup</button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8 lg:py-20">
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-[#E8DFD3] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3"><div className="rounded-xl bg-[#FAF0EB] p-2.5 text-[#D96B43]"><MessageCircle className="h-5 w-5" /></div><div><h2 className="font-['Outfit'] text-2xl font-bold text-[#1A201C]">Send us a message</h2><p className="mt-1 text-sm leading-relaxed text-[#635E59]">Tell us what you need, and our care team will follow up using your preferred contact details.</p></div></div>
            {submissionState === 'sent' ? (
              <div className="mt-7 rounded-2xl border border-[#BFE2C8] bg-[#F1FBF3] p-5 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-[#1D432D]" /><h3 className="mt-3 font-['Outfit'] text-lg font-bold text-[#1A201C]">Your message has been sent.</h3><p className="mt-1 text-sm text-[#635E59]">Thank you. Our care team will be in touch soon.</p><button onClick={() => setSubmissionState('idle')} className="mt-4 text-sm font-bold text-[#1D432D] underline">Send another message</button></div>
            ) : (
              <form onSubmit={submitContactForm} className="mt-7 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-bold text-[#1A201C]">Your name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" className="mt-2 w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#D96B43]/50" /></label>
                  <label className="block text-sm font-bold text-[#1A201C]">Phone number<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} type="tel" autoComplete="tel" className="mt-2 w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#D96B43]/50" /></label>
                </div>
                <label className="block text-sm font-bold text-[#1A201C]">Email address<input required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" autoComplete="email" className="mt-2 w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#D96B43]/50" /></label>
                <label className="block text-sm font-bold text-[#1A201C]">How can we help?<textarea required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} rows={5} placeholder="For example: I am looking for a live-in nanny in Westlands for two children..." className="mt-2 w-full resize-none rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] p-3 text-sm text-[#1A201C] outline-none transition focus:ring-2 focus:ring-[#D96B43]/50" /></label>
                {submissionState === 'error' && <p role="alert" className="rounded-xl bg-[#FFF1ED] p-3 text-sm font-medium text-[#A33E21]">{submissionError}</p>}
                <button disabled={submissionState === 'sending'} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D96B43] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#D96B43]/20 transition-colors hover:bg-[#C25832] disabled:cursor-not-allowed disabled:opacity-70">{submissionState === 'sending' ? <><LoaderCircle className="h-5 w-5 animate-spin" /> Sending...</> : <>Send message <ArrowRight className="h-4 w-4" /></>}</button>
              </form>
            )}
            <div className="mt-4 border-t border-[#E8DFD3] pt-4 text-center"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[#128C7E] underline hover:text-[#075E54]"><MessageCircle className="h-4 w-4" /> Prefer WhatsApp? Start a chat instead.</a></div>
          </div>
        </div>

        <aside className="space-y-4 lg:col-span-2">
          <h2 className="font-['Outfit'] text-xl font-bold text-[#1A201C]">Other ways to reach us</h2>
          <a href={`tel:${siteConfig.hotlinePhone}`} className="flex gap-3 rounded-2xl border border-[#E8DFD3] bg-white p-4 transition hover:border-[#D96B43] hover:shadow-sm"><Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#D96B43]" /><div><p className="text-sm font-bold text-[#1A201C]">Call our care team</p><p className="mt-1 text-sm text-[#635E59]">{siteConfig.hotlinePhone}</p></div></a>
          <button onClick={copyEmail} className="flex w-full gap-3 rounded-2xl border border-[#E8DFD3] bg-white p-4 text-left transition hover:border-[#D96B43] hover:shadow-sm"><Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#D96B43]" /><div><p className="text-sm font-bold text-[#1A201C]">Email concierge</p><p className="mt-1 break-all text-sm text-[#635E59]">{copied ? 'Email copied to clipboard' : siteConfig.conciergeEmail}</p></div></button>
          <div className="flex gap-3 rounded-2xl border border-[#E8DFD3] bg-white p-4"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#D96B43]" /><div><p className="text-sm font-bold text-[#1A201C]">Visit our office</p><p className="mt-1 text-sm leading-relaxed text-[#635E59]">{siteConfig.headquartersAddress}</p></div></div>
          <div className="rounded-2xl bg-[#1D432D] p-5 text-white"><div className="flex items-center gap-2 text-[#F4A261]"><Clock3 className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-wider">Need help urgently?</p></div><p className="mt-3 text-sm leading-relaxed text-white/80">Tell us when and where you need cover, and we will begin arranging emergency backup staff.</p><button onClick={onOpenEmergency} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-white underline">Start an emergency request <ArrowRight className="h-4 w-4" /></button></div>
        </aside>
      </section>

      <section className="border-t border-[#E8DFD3] bg-white py-12"><div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center sm:px-6"><ShieldCheck className="h-7 w-7 text-[#1D432D]" /><div><h2 className="font-['Outfit'] text-xl font-bold text-[#1A201C]">Your family&apos;s privacy comes first</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#635E59]">Share only what you are comfortable sharing at first. We use your details to understand your care needs and arrange the appropriate next step.</p></div></div></section>
    </main>
  );
};
