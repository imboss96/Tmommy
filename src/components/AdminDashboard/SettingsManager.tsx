import React, { useState } from 'react';
import { 
  Settings, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldAlert, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { supabase } from '../../lib/supabase';
import { getApiBaseUrl } from '../../lib/api';

export const SettingsManager: React.FC = () => {
  const { siteConfig, updateSiteConfig, resetAllData, nannies, insights, bookings, emergencyRequests, mediaItems } = useContent();

  const [formConfig, setFormConfig] = useState(siteConfig);
  const [isSaved, setIsSaved] = useState(false);

  // PIN security management
  const [currentPin, setCurrentPin] = useState(() => localStorage.getItem('mommycare_admin_pin') || '2540');
  const [newPin, setNewPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinSuccessMsg, setPinSuccessMsg] = useState(false);
  const [pinErrorMsg, setPinErrorMsg] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = getApiBaseUrl();
    if (!/^\d{4,6}$/.test(newPin)) {
      setPinErrorMsg('PIN must be 4 to 6 numeric digits');
      return;
    }
    const response = await fetch(`${apiUrl}/api/admin/pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': currentPin
      },
      body: JSON.stringify({ newPin })
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setPinErrorMsg(result.error || 'Unable to update the server PIN.');
      return;
    }
    localStorage.setItem('mommycare_admin_pin', newPin);
    sessionStorage.setItem('mommycare_admin_pin', newPin);
    setCurrentPin(newPin);
    setNewPin('');
    setPinErrorMsg('');
    setPinSuccessMsg(true);
    setTimeout(() => setPinSuccessMsg(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteConfig(formConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleInviteAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    const apiUrl = getApiBaseUrl();
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    if (!data.session) { setInviteError('Your administrator session has expired. Sign in again.'); return; }
    setIsInviting(true); setInviteError(''); setInviteMessage('');
    const response = await fetch(`${apiUrl}/api/admin/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
      body: JSON.stringify({ email: inviteEmail, displayName: inviteName })
    });
    const result = await response.json().catch(() => ({}));
    setIsInviting(false);
    if (!response.ok) { setInviteError(result.error || 'Unable to invite administrator.'); return; }
    setInviteEmail(''); setInviteName(''); setInviteMessage(`Invitation sent to ${result.email}.`);
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
    link.download = `mommycare-backup-${new Date().toISOString().split('T')[0]}.json`;
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

        {/* Backups, Security PIN & Factory Reset */}
        <div className="space-y-4">

          {/* Admin Security PIN Card */}
          <div className="bg-white rounded-2xl border border-[#E8DFD3] p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-[#1A201C] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#D96B43]" />
                <span>Dashboard Access PIN</span>
              </span>
              <span className="font-mono text-xs font-bold text-[#1D432D] bg-[#E8F0EA] px-2 py-0.5 rounded-lg border border-[#C5D9CB]">
                Current: {showPinInput ? currentPin : '••••'}
              </span>
            </h3>

            <p className="text-xs text-[#635E59] leading-relaxed">
              This PIN protects <code className="bg-[#FAF7F2] px-1 py-0.5 rounded font-bold text-[#1D432D]">mydomain/admin</code> from unauthorized public access.
            </p>

            <form onSubmit={handleUpdatePin} className="space-y-2 pt-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPinInput ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="New 4-6 digit PIN"
                    maxLength={6}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C9BA] focus:outline-none focus:ring-2 focus:ring-[#1D432D] font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinInput(!showPinInput)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#635E59] hover:text-[#1A201C]"
                  >
                    {showPinInput ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={newPin.length < 4}
                  className="px-4 py-2 bg-[#1D432D] hover:bg-[#153322] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap"
                >
                  Update PIN
                </button>
              </div>

              {pinErrorMsg && (
                <p className="text-[11px] text-red-600 font-medium">{pinErrorMsg}</p>
              )}

              {pinSuccessMsg && (
                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PIN updated successfully!
                </p>
              )}
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFD3] p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-[#1A201C] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#1D432D]" /> Invite an administrator
            </h3>
            <p className="text-xs text-[#635E59] leading-relaxed">Administrator invitations will be enabled after SMTP and email OTP are configured.</p>
            <div className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] text-[11px] text-[#7D766D]">
              For now, add administrators manually in Supabase Authentication → Users and the <code className="font-bold">admin_users</code> table.
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

          {/* Danger Zone: Factory Reset */}
          <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Reset Content to Defaults</span>
            </h3>
            <p className="text-xs text-[#635E59] leading-relaxed">
              Reset all domestic staff profiles, parenting insight articles, and form submissions back to the original vetted directory seeds.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all site content and submissions back to factory defaults?')) {
                  resetAllData();
                }
              }}
              className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 border border-red-300 rounded-xl font-bold text-xs text-red-700 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore Factory Defaults</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
