import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldAlert, 
  Download, 
  Upload, 
  Check, 
  LoaderCircle,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { supabase } from '../../lib/supabase';
import { getApiBaseUrl } from '../../lib/api';
import { getAdminAccessToken } from '../../lib/adminAuth';
import { PaymentSettingsPanel } from './MpesaSettingsPanel';

type Administrator = {
  email: string;
  display_name: string | null;
  invited_by: string | null;
  status: 'invited' | 'active' | 'disabled';
  created_at: string;
};

export const SettingsManager: React.FC = () => {
  const { siteConfig, updateSiteConfig, nannies, insights, bookings, emergencyRequests, mediaItems } = useContent();

  const [formConfig, setFormConfig] = useState(siteConfig);
  const [isSaved, setIsSaved] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [currentAdminEmail, setCurrentAdminEmail] = useState('');
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [adminListError, setAdminListError] = useState('');
  const [adminActionMessage, setAdminActionMessage] = useState('');
  const [adminActionError, setAdminActionError] = useState('');
  const [updatingAdminEmail, setUpdatingAdminEmail] = useState('');
  const [resettingAdminEmail, setResettingAdminEmail] = useState('');

  const loadAdministrators = async () => {
    const token = getAdminAccessToken();
    if (!token) {
      setAdminListError('Your administrator session has expired. Sign in again.');
      setIsLoadingAdmins(false);
      return;
    }
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to load administrator accounts.');
      setAdministrators(result.administrators || []);
      setCurrentAdminEmail(typeof result.currentUserEmail === 'string' ? result.currentUserEmail.toLowerCase() : '');
      setAdminListError('');
    } catch (error) {
      setAdminListError(error instanceof Error ? error.message : 'Unable to load administrator accounts.');
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  useEffect(() => { void loadAdministrators(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteConfig(formConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleInviteAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = getAdminAccessToken();
    if (!token || !supabase) { setInviteError('Your administrator session has expired. Sign in again.'); return; }
    setIsInviting(true); setInviteError(''); setInviteMessage('');
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, displayName: inviteName })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (result.administratorCreated) await loadAdministrators();
        throw new Error(result.error || 'Unable to add administrator.');
      }
      setInviteEmail(''); setInviteName('');
      setInviteMessage(result.message || `Administrator account created and setup email sent to ${result.email}.`);
      await loadAdministrators();
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Unable to add administrator.');
    } finally {
      setIsInviting(false);
    }
  };

  const updateAdministratorStatus = async (administrator: Administrator) => {
    const nextStatus = administrator.status === 'active' ? 'disabled' : 'active';
    const action = nextStatus === 'disabled' ? 'suspend' : 'restore';
    if (!window.confirm(`Are you sure you want to ${action} administrator access for ${administrator.email}?`)) return;

    const token = getAdminAccessToken();
    if (!token) {
      setAdminActionError('Your administrator session has expired. Sign in again.');
      return;
    }

    setUpdatingAdminEmail(administrator.email);
    setAdminActionError('');
    setAdminActionMessage('');
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/users/${encodeURIComponent(administrator.email)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to update administrator access.');
      setAdminActionMessage(nextStatus === 'disabled'
        ? `Administrator access suspended for ${administrator.email}.`
        : `Administrator access restored for ${administrator.email}.`);
      await loadAdministrators();
    } catch (error) {
      setAdminActionError(error instanceof Error ? error.message : 'Unable to update administrator access.');
    } finally {
      setUpdatingAdminEmail('');
    }
  };

  const resetAdministratorPassword = async (administrator: Administrator) => {
    if (!window.confirm(`Send a one-time password setup link to ${administrator.email}? The user will choose their own password.`)) return;

    const token = getAdminAccessToken();
    if (!token) {
      setAdminActionError('Your administrator session has expired. Sign in again.');
      return;
    }

    setResettingAdminEmail(administrator.email);
    setAdminActionError('');
    setAdminActionMessage('');
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/users/${encodeURIComponent(administrator.email)}/password-reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to send password setup email.');
      setAdminActionMessage(result.message || `Password setup email sent to ${administrator.email}.`);
    } catch (error) {
      setAdminActionError(error instanceof Error ? error.message : 'Unable to send password setup email.');
    } finally {
      setResettingAdminEmail('');
    }
  };

  const handleExportBackup = () => {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      siteConfig: formConfig,
      nannies,
      insights,
      bookings,
      emergencyRequests,
      mediaItems
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tmommycare-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm">
        <h2 className="text-xl font-bold font-['Outfit'] text-[#1A201C] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#1D432D]" />
          <span>System & Website Content Settings</span>
        </h2>
        <p className="text-xs text-[#635E59] mt-0.5">
          Configure global site parameters, emergency contact hotlines, top notification messages, and data backups.
        </p>
      </div>

      <PaymentSettingsPanel />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Settings Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8DFD3] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            
            <h3 className="font-bold text-sm text-[#1A201C] border-b border-[#F2ECE1] pb-2">
              Communication & Hotline Numbers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  Primary Customer Hotline *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1D432D]" />
                  <input
                    type="text"
                    required
                    value={formConfig.hotlinePhone}
                    onChange={(e) => setFormConfig({ ...formConfig, hotlinePhone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  Emergency Standby Dispatch Line *
                </label>
                <div className="relative">
                  <ShieldAlert className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-red-600" />
                  <input
                    type="text"
                    required
                    value={formConfig.emergencyDispatchPhone}
                    onChange={(e) => setFormConfig({ ...formConfig, emergencyDispatchPhone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl font-bold text-red-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  WhatsApp Recipient Number *
                </label>
                <input
                  type="text"
                  required
                  value={formConfig.whatsappPhone}
                  onChange={(e) => setFormConfig({ ...formConfig, whatsappPhone: e.target.value })}
                  placeholder="+254 700 666 227"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl font-medium"
                />
                <p className="mt-1 text-[11px] text-[#7D766D]">Use the full international number.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  WhatsApp Prefilled Message *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formConfig.whatsappMessage}
                  onChange={(e) => setFormConfig({ ...formConfig, whatsappMessage: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  Concierge Support Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1D432D]" />
                  <input
                    type="email"
                    required
                    value={formConfig.conciergeEmail}
                    onChange={(e) => setFormConfig({ ...formConfig, conciergeEmail: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  Free Replacement Warranty (Days) *
                </label>
                <input
                  type="number"
                  required
                  value={formConfig.replacementWarrantyDays}
                  onChange={(e) => setFormConfig({ ...formConfig, replacementWarrantyDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl font-bold text-[#1A201C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                Headquarters Physical Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D96B43]" />
                <input
                  type="text"
                  value={formConfig.headquartersAddress}
                  onChange={(e) => setFormConfig({ ...formConfig, headquartersAddress: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                Top Announcement Ribbon Text
              </label>
              <textarea
                rows={2}
                value={formConfig.notificationBanner}
                onChange={(e) => setFormConfig({ ...formConfig, notificationBanner: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl font-medium text-xs sm:text-sm"
              />
            </div>

            <div className="pt-3 border-t border-[#E8DFD3] flex items-center justify-between">
              {isSaved ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Settings saved successfully!
                </span>
              ) : (
                <span className="text-xs text-[#7D766D]">Changes apply instantly across site</span>
              )}

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1D432D] hover:bg-[#143020] text-white font-bold text-xs shadow-md transition-all"
              >
                Save Settings
              </button>
            </div>

          </form>
        </div>
        {/* Administrator access, backups & factory reset */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8DFD3] p-5 shadow-sm space-y-2">
            <h3 className="font-bold text-sm text-[#1A201C]">Administrator sign-in security</h3>
            <p className="text-xs text-[#635E59] leading-relaxed">Suspend or restore another administrator, or send them a one-time password setup link. Passwords are never shown or emailed to the inviter.</p>
          </div>


          <div className="bg-white rounded-2xl border border-[#E8DFD3] p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-[#1A201C] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#1D432D]" /> Add an administrator
            </h3>
            <p className="text-xs text-[#635E59] leading-relaxed">Create an admin login and send a password setup link to their email. They can set a password or use an email code without accepting a separate invitation.</p>
            <form onSubmit={handleInviteAdmin} className="space-y-2">
              <input
                type="text"
                maxLength={120}
                value={inviteName}
                onChange={(event) => setInviteName(event.target.value)}
                placeholder="Administrator name (optional)"
                aria-label="Administrator name"
                className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs"
              />
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="name@example.com"
                aria-label="Administrator email"
                className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs"
              />
              <button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
                className="w-full py-2.5 px-3 bg-[#1D432D] hover:bg-[#143020] disabled:opacity-60 disabled:cursor-not-allowed rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-colors"
              >
                {isInviting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {isInviting ? 'Creating account…' : 'Add admin and send setup link'}
              </button>
            </form>
            {inviteMessage && <p role="status" className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">{inviteMessage}</p>}
            {inviteError && <p role="alert" className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700">{inviteError}</p>}

            <div className="border-t border-[#F2ECE1] pt-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-xs text-[#1A201C]">Administrators</h4>
                <button type="button" onClick={() => void loadAdministrators()} disabled={isLoadingAdmins} aria-label="Refresh administrators" className="p-1.5 rounded-lg text-[#1D432D] hover:bg-[#F2ECE1] disabled:opacity-50">
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdmins ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {adminListError && <p role="alert" className="text-[11px] text-red-700">{adminListError}</p>}
              {adminActionMessage && <p role="status" className="text-[11px] text-emerald-800">{adminActionMessage}</p>}
              {adminActionError && <p role="alert" className="text-[11px] text-red-700">{adminActionError}</p>}
              {isLoadingAdmins ? (
                <p className="text-[11px] text-[#7D766D] flex items-center gap-2"><LoaderCircle className="w-3.5 h-3.5 animate-spin" /> Loading administrators…</p>
              ) : administrators.length === 0 ? (
                <p className="text-[11px] text-[#7D766D]">No administrator accounts found.</p>
              ) : (
                <ul className="max-h-52 overflow-y-auto divide-y divide-[#F2ECE1]">
                  {administrators.map((administrator) => (
                    <li key={administrator.email} className="py-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1A201C] truncate">{administrator.display_name || administrator.email}</p>
                        {administrator.display_name && <p className="text-[11px] text-[#7D766D] truncate">{administrator.email}</p>}
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${administrator.status === 'active' ? 'bg-emerald-50 text-emerald-800' : administrator.status === 'invited' ? 'bg-amber-50 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                          {administrator.status}
                        </span>
                        {administrator.email.toLowerCase() === currentAdminEmail ? (
                          <span className="text-[10px] text-[#7D766D]">You</span>
                        ) : administrator.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => void updateAdministratorStatus(administrator)}
                            disabled={Boolean(updatingAdminEmail || resettingAdminEmail)}
                            className="text-[10px] font-bold text-red-700 hover:text-red-900 disabled:opacity-50"
                          >
                            {updatingAdminEmail === administrator.email ? 'Suspending…' : 'Suspend'}
                          </button>
                        ) : administrator.status === 'disabled' ? (
                          <button
                            type="button"
                            onClick={() => void updateAdministratorStatus(administrator)}
                            disabled={Boolean(updatingAdminEmail || resettingAdminEmail)}
                            className="text-[10px] font-bold text-[#1D432D] hover:text-[#143020] disabled:opacity-50"
                          >
                            {updatingAdminEmail === administrator.email ? 'Restoring…' : 'Restore'}
                          </button>
                        ) : null}
                        {administrator.email.toLowerCase() !== currentAdminEmail && administrator.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => void resetAdministratorPassword(administrator)}
                            disabled={Boolean(updatingAdminEmail || resettingAdminEmail)}
                            className="text-[10px] font-bold text-[#1D432D] hover:text-[#143020] disabled:opacity-50"
                          >
                            {resettingAdminEmail === administrator.email ? 'Sending…' : 'Reset password'}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Backup Card */}
          <div className="bg-white rounded-2xl border border-[#E8DFD3] p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-[#1A201C] flex items-center gap-2">
              <Download className="w-4 h-4 text-[#D96B43]" />
              <span>Full Data Backup</span>
            </h3>
            <p className="text-xs text-[#635E59] leading-relaxed">
              Download a complete JSON snapshot of all published articles, registered domestic staff, customer submissions, and photos.
            </p>
            <button
              onClick={handleExportBackup}
              className="w-full py-2.5 px-3 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#D5C9BA] rounded-xl font-bold text-xs text-[#1A201C] flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-[#1D432D]" />
              <span>Download Site Backup (JSON)</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
