import React, { FormEvent, useEffect, useState } from 'react';
import { LoaderCircle, Save } from 'lucide-react';
import { getApiBaseUrl } from '../../lib/api';
import { getAdminAuthHeaders } from '../../lib/adminAuth';

type MpesaSettings = {
  enabled: boolean;
  feeKes: number;
  environment: 'sandbox' | 'production';
  merchantType: 'paybill' | 'till';
  shortcode: string;
  accountReference: string;
  credentialsConfigured: boolean;
  encryptionKeyConfigured: boolean;
  callbackConfigured: boolean;
};

const initialSettings: MpesaSettings = {
  enabled: false,
  feeKes: 0,
  environment: 'sandbox',
  merchantType: 'paybill',
  shortcode: '',
  accountReference: 'MOMMYCARE',
  credentialsConfigured: false,
  encryptionKeyConfigured: false,
  callbackConfigured: false
};

export const MpesaSettingsPanel: React.FC = () => {
  const api = getApiBaseUrl();
  const [settings, setSettings] = useState(initialSettings);
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [passkey, setPasskey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${api}/api/admin/mpesa-settings`, { headers: getAdminAuthHeaders() });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not load M-Pesa settings.');
      setSettings({ ...initialSettings, ...result });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load M-Pesa settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [api]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`${api}/api/admin/mpesa-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify({ ...settings, consumerKey, consumerSecret, passkey })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not save M-Pesa settings.');
      setConsumerKey('');
      setConsumerSecret('');
      setPasskey('');
      setNotice('M-Pesa settings saved. Secret credentials are stored encrypted and are never shown again.');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save M-Pesa settings.');
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = 'mt-1.5 w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3.5 py-2.5 text-sm font-medium text-[#1A201C]';

  return <section className="rounded-2xl border border-[#E8DFD3] bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-5">
      <h3 className="font-['Outfit'] text-lg font-bold text-[#1A201C]">Provider registration payments · Safaricom M-Pesa</h3>
      <p className="mt-1 text-xs leading-5 text-[#635E59]">Configure the KES registration fee and Daraja STK Push credentials. Credentials are encrypted on the server and cannot be read back from this form.</p>
    </div>
    {loading ? <div className="flex items-center gap-2 py-4 text-sm text-[#635E59]"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading payment settings…</div> : <form onSubmit={save} className="space-y-4">
      {!settings.encryptionKeyConfigured && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Set the backend-only MPESA_CONFIG_ENCRYPTION_KEY (64 hexadecimal characters) in the server environment before saving credentials.</p>}
      {!settings.callbackConfigured && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Set MPESA_CALLBACK_URL to the public HTTPS API callback URL in the server environment before enabling payments.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold text-[#635E59]">Registration fee (KES)
          <input required type="number" min="1" max="1000000" step="1" value={settings.feeKes || ''} onChange={event => setSettings(current => ({ ...current, feeKes: Number(event.target.value) }))} className={fieldClass} />
        </label>
        <label className="text-xs font-bold text-[#635E59]">Daraja environment
          <select value={settings.environment} onChange={event => setSettings(current => ({ ...current, environment: event.target.value as MpesaSettings['environment'] }))} className={fieldClass}>
            <option value="sandbox">Sandbox / testing</option><option value="production">Production</option>
          </select>
        </label>
        <label className="text-xs font-bold text-[#635E59]">Merchant type
          <select value={settings.merchantType} onChange={event => setSettings(current => ({ ...current, merchantType: event.target.value as MpesaSettings['merchantType'] }))} className={fieldClass}>
            <option value="paybill">PayBill</option><option value="till">Buy Goods / Till</option>
          </select>
        </label>
        <label className="text-xs font-bold text-[#635E59]">Business short code
          <input required inputMode="numeric" pattern="[0-9]{5,7}" value={settings.shortcode} onChange={event => setSettings(current => ({ ...current, shortcode: event.target.value }))} className={fieldClass} />
        </label>
        <label className="text-xs font-bold text-[#635E59] sm:col-span-2">Account reference
          <input required maxLength={12} pattern="[A-Za-z0-9]{1,12}" value={settings.accountReference} onChange={event => setSettings(current => ({ ...current, accountReference: event.target.value }))} className={fieldClass} />
          <span className="mt-1 block font-normal">For PayBill this appears as the account number; use up to 12 letters or digits.</span>
        </label>
        <label className="text-xs font-bold text-[#635E59]">Consumer Key {settings.credentialsConfigured && <span className="font-normal text-emerald-700">· saved; blank keeps current</span>}
          <input type="password" autoComplete="new-password" value={consumerKey} onChange={event => setConsumerKey(event.target.value)} className={fieldClass} />
        </label>
        <label className="text-xs font-bold text-[#635E59]">Consumer Secret {settings.credentialsConfigured && <span className="font-normal text-emerald-700">· saved; blank keeps current</span>}
          <input type="password" autoComplete="new-password" value={consumerSecret} onChange={event => setConsumerSecret(event.target.value)} className={fieldClass} />
        </label>
        <label className="text-xs font-bold text-[#635E59] sm:col-span-2">Lipa Na M-Pesa Passkey {settings.credentialsConfigured && <span className="font-normal text-emerald-700">· saved; blank keeps current</span>}
          <input type="password" autoComplete="new-password" value={passkey} onChange={event => setPasskey(event.target.value)} className={fieldClass} />
        </label>
      </div>
      <label className="flex items-start gap-2 text-xs font-semibold text-[#3D3A36]">
        <input type="checkbox" checked={settings.enabled} onChange={event => setSettings(current => ({ ...current, enabled: event.target.checked }))} className="mt-0.5 accent-[#1D432D]" />
        Enable provider registration payments. Applicants will not enter the admin review queue until M-Pesa payment is confirmed.
      </label>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      <button type="submit" disabled={saving || !settings.encryptionKeyConfigured} className="inline-flex items-center gap-2 rounded-xl bg-[#1D432D] px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save M-Pesa settings
      </button>
    </form>}
  </section>;
};
