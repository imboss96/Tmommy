import React, { useState } from 'react';
import { 
  X, 
  AlertCircle, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  CheckCircle2, 
  Send,
  Briefcase
} from 'lucide-react';
import { NairobiEstate, EmergencyRequestData, HomecareRole } from '../types';
import { useContent } from '../context/ContentContext';

interface EmergencyBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyBackupModal: React.FC<EmergencyBackupModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addEmergencyRequest } = useContent();
  const [formData, setFormData] = useState<EmergencyRequestData>({
    parentName: '',
    phone: '',
    estate: 'Kilimani',
    requestedRole: 'nanny',
    requiredTime: 'Immediate (Within 2-3 Hours)',
    durationDays: 1,
    childrenCount: 1,
    urgentNotes: ''
  });

  const [isDispatched, setIsDispatched] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEmergencyRequest(formData);
    setIsDispatched(true);
  };

  const handleReset = () => {
    setIsDispatched(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0F1F1C]/70 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="relative my-0 max-h-[calc(100vh-1.5rem)] w-full max-w-2xl overflow-hidden rounded-[30px] border border-[#F2D0BA] bg-[#F7F3EE] shadow-[0_26px_80px_rgba(7,25,20,0.25)] sm:my-6 sm:max-h-[calc(100vh-3rem)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.48),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(188,217,209,0.34),transparent_28%)]" />

        <div className="relative sticky top-0 z-10 flex items-center justify-between gap-4 bg-gradient-to-r from-[#D96B43] via-[#CB6435] to-[#B95D2E] p-5 text-white sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/18 shadow-inner shadow-white/10 ring-1 ring-white/20">
              <AlertCircle className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-['Outfit'] text-lg font-bold tracking-[-0.03em] sm:text-2xl">
                Emergency Domestic & Homecare Dispatch
              </h2>
              <p className="text-[11px] text-white/90 sm:text-xs">
                Arrives at your Nairobi home in 2 to 4 hours • 100% DCI Pre-cleared
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative p-4 sm:p-6">
          {isDispatched ? (
            <div className="space-y-4 py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F0EA] text-[#1D432D] shadow-inner shadow-[#1D432D]/10">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="font-['Outfit'] text-2xl font-bold tracking-[-0.03em] text-[#1A201C]">
                Dispatch Alert Transmitted!
              </h3>
              <p className="text-sm leading-relaxed text-[#524D47]">
                Emergency dispatch alert has been routed to our on-call coordinator in
                <strong> {formData.estate}</strong>. You will receive an immediate phone call on
                <strong> {formData.phone}</strong> within 15 minutes with the candidate's verified profile and ETA.
              </p>

              <div className="space-y-1 rounded-2xl border border-[#E8DFD3] bg-[#FAF7F2] p-4 text-left text-xs text-[#3D3A36]">
                <p><strong>Hotline:</strong> +254 700 666 227</p>
                <p><strong>Requested Role:</strong> <span className="capitalize font-bold">{formData.requestedRole?.replace('-', ' ')}</span></p>
                <p><strong>Standby Pricing:</strong> Shared by our coordinator after consultation</p>
                <p><strong>DCI & Clinical Checks:</strong> 100% Pre-cleared before dispatch</p>
              </div>

              <button
                onClick={handleReset}
                className="mt-2 rounded-xl bg-[#D96B43] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#D96B43]/25 transition-transform hover:-translate-y-0.5 hover:bg-[#C9582E]"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-2 rounded-2xl border border-[#F3D8C9] bg-[#FFFAF6] p-3 text-xs text-[#8C3419] shadow-[0_10px_24px_rgba(217,107,67,0.05)] sm:p-3.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#D96B43]" />
                <span>
                  Has your regular staff suddenly fallen ill or failed to report? We maintain active standby professionals across Nairobi neighbourhoods for instant relief.
                </span>
              </div>

              <div className="rounded-[22px] border border-[#E8DFD3] bg-white/50 p-3 shadow-[0_10px_20px_rgba(19,23,21,0.03)] sm:p-4">
                <label className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7D766D]">
                  <Briefcase className="h-3.5 w-3.5 text-[#1D432D]" />
                  Emergency Staff Needed *
                </label>
                <select
                  value={formData.requestedRole}
                  onChange={(e) => setFormData({ ...formData, requestedRole: e.target.value as HomecareRole })}
                  className="w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3.5 py-2.5 text-sm font-semibold text-[#1A201C] outline-none transition focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20"
                >
                  <option value="nanny">Emergency Backup Nanny & Childcare</option>
                  <option value="nanny">Au Pairs / Elite Nannies</option>
                  <option value="temporary-backup">Holiday Relievers</option>
                  <option value="house-girl">Emergency Housekeeper / House Girl</option>
                  <option value="house-boy">Emergency House Boy / Domestic Steward</option>
                  <option value="cook-chef">Emergency Cook / Kitchen Caterer</option>
                  <option value="caretaker">Emergency Compound Caretaker / Relief</option>
                  <option value="shamba-boy">Emergency Grounds / Garden Relief</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[#E8DFD3] bg-white/50 p-3 shadow-[0_10px_20px_rgba(19,23,21,0.03)] sm:p-4">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7D766D]">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="e.g. Susan Mutua"
                    className="w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3.5 py-2.5 text-sm font-medium text-[#1A201C] outline-none transition focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20"
                  />
                </div>

                <div className="rounded-[22px] border border-[#E8DFD3] bg-white/50 p-3 shadow-[0_10px_20px_rgba(19,23,21,0.03)] sm:p-4">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7D766D]">
                    Emergency Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+254 7..."
                    className="w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3.5 py-2.5 text-sm font-medium text-[#1A201C] outline-none transition focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[#E8DFD3] bg-white/50 p-3 shadow-[0_10px_20px_rgba(19,23,21,0.03)] sm:p-4">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7D766D]">
                    Neighbourhood *
                  </label>
                  <select
                    value={formData.estate}
                    onChange={(e) => setFormData({ ...formData, estate: e.target.value as NairobiEstate })}
                    className="w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3.5 py-2.5 text-sm font-semibold text-[#1A201C] outline-none transition focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20"
                  >
                    <option value="Kilimani">Kilimani</option>
                    <option value="Westlands">Westlands</option>
                    <option value="Karen">Karen</option>
                    <option value="Lavington">Lavington</option>
                    <option value="Kileleshwa">Kileleshwa</option>
                    <option value="Runda">Runda</option>
                    <option value="South C">South C</option>
                    <option value="Parklands">Parklands</option>
                    <option value="Gigiri">Gigiri</option>
                    <option value="Kiambu Road">Kiambu Road</option>
                    <option value="Ruaka">Ruaka</option>
                  </select>
                </div>

                <div className="rounded-[22px] border border-[#E8DFD3] bg-white/50 p-3 shadow-[0_10px_20px_rgba(19,23,21,0.03)] sm:p-4">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7D766D]">
                    Required Arrival Time
                  </label>
                  <select
                    value={formData.requiredTime}
                    onChange={(e) => setFormData({ ...formData, requiredTime: e.target.value })}
                    className="w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3.5 py-2.5 text-sm font-semibold text-[#1A201C] outline-none transition focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20"
                  >
                    <option value="Immediate (Within 2-3 Hours)">Immediate (Within 2-3 Hours)</option>
                    <option value="Today Evening (After 5 PM)">Today Evening (After 5 PM)</option>
                    <option value="Tomorrow Morning (7:30 AM)">Tomorrow Morning (7:30 AM)</option>
                    <option value="This Coming Weekend">This Coming Weekend</option>
                  </select>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#E8DFD3] bg-white/50 p-3 shadow-[0_10px_20px_rgba(19,23,21,0.03)] sm:p-4">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7D766D]">
                  Estimated Standby Coverage Needed (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3.5 py-2.5 text-sm font-medium text-[#1A201C] outline-none transition focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20"
                />
              </div>

              <div className="rounded-[22px] border border-[#E8DFD3] bg-white/50 p-3 shadow-[0_10px_20px_rgba(19,23,21,0.03)] sm:p-4">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7D766D]">
                  Urgent Household Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.urgentNotes}
                  onChange={(e) => setFormData({ ...formData, urgentNotes: e.target.value })}
                  placeholder="e.g. Need help with infant twins + laundry, or need compound cleanup for guest arrival."
                  className="w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3.5 py-2.5 text-sm font-medium text-[#1A201C] outline-none transition focus:border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20"
                />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D96B43] px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_18px_34px_rgba(217,107,67,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#C85B2D]"
              >
                <Send className="h-4 w-4" />
                <span>Trigger Immediate Standby Dispatch</span>
              </button>

              <p className="text-center text-[11px] text-[#7D766D]">
                Or call our rapid dispatch desk directly at <strong>+254 700 666 227</strong>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
