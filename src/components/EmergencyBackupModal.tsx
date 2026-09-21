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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="my-0 sm:my-6 bg-white rounded-3xl border border-[#F2C2B2] max-w-xl w-full max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-3rem)] shadow-2xl overflow-y-auto relative">
        
        {/* Emergency Alert Header */}
        <div className="sticky top-0 z-10 p-6 bg-gradient-to-r from-[#D96B43] to-[#B8532F] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Outfit'] flex items-center gap-2">
                <span>Emergency Domestic & Homecare Dispatch</span>
              </h2>
              <p className="text-xs text-white/90">
                Arrives at your Nairobi home in 2 to 4 hours • 100% DCI Pre-cleared
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {isDispatched ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A201C] font-['Outfit']">
                Dispatch Alert Transmitted!
              </h3>
              <p className="text-sm text-[#524D47] leading-relaxed">
                Emergency dispatch alert has been routed to our on-call coordinator in 
                <strong> {formData.estate}</strong>. You will receive an immediate phone call on 
                <strong> {formData.phone}</strong> within 15 minutes with the candidate's verified profile and ETA.
              </p>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs space-y-1 text-left">
                <p><strong>Hotline:</strong> +254 700 666 227</p>
                <p><strong>Requested Role:</strong> <span className="capitalize font-bold">{formData.requestedRole?.replace('-', ' ')}</span></p>
                <p><strong>Standby Daily Rate:</strong> From KES 2,500 / day</p>
                <p><strong>DCI & Clinical Checks:</strong> 100% Pre-cleared before dispatch</p>
              </div>

              <button
                onClick={handleReset}
                className="mt-4 px-8 py-3 rounded-xl bg-[#D96B43] text-white font-bold text-sm"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-[#FFF8F5] border border-[#FAD9CE] text-xs text-[#8C3419] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D96B43] shrink-0" />
                <span>
                  Has your regular staff suddenly fallen ill or failed to report? We maintain active standby professionals across Nairobi estates for instant relief.
                </span>
              </div>

              {/* Service Requested */}
              <div>
                <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-[#1D432D]" />
                  Emergency Staff Needed *
                </label>
                <select
                  value={formData.requestedRole}
                  onChange={(e) => setFormData({ ...formData, requestedRole: e.target.value as HomecareRole })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#D96B43]"
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

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="e.g. Susan Mutua"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#D96B43]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                    Emergency Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+254 7..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#D96B43]"
                  />
                </div>
              </div>

              {/* Estate & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                    Nairobi Estate *
                  </label>
                  <select
                    value={formData.estate}
                    onChange={(e) => setFormData({ ...formData, estate: e.target.value as NairobiEstate })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#D96B43]"
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

                <div>
                  <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                    Required Arrival Time
                  </label>
                  <select
                    value={formData.requiredTime}
                    onChange={(e) => setFormData({ ...formData, requiredTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#D96B43]"
                  >
                    <option value="Immediate (Within 2-3 Hours)">Immediate (Within 2-3 Hours)</option>
                    <option value="Today Evening (After 5 PM)">Today Evening (After 5 PM)</option>
                    <option value="Tomorrow Morning (7:30 AM)">Tomorrow Morning (7:30 AM)</option>
                    <option value="This Coming Weekend">This Coming Weekend</option>
                  </select>
                </div>
              </div>

              {/* Duration & Notes */}
              <div>
                <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                  Estimated Standby Coverage Needed (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#D96B43]"
                />
              </div>

              {/* Urgent Notes */}
              <div>
                <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                  Urgent Household Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.urgentNotes}
                  onChange={(e) => setFormData({ ...formData, urgentNotes: e.target.value })}
                  placeholder="e.g. Need help with infant twins + laundry, or need compound cleanup for guest arrival."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#D96B43]"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#D96B43]/30 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Trigger Immediate Standby Dispatch</span>
              </button>

              <p className="text-[11px] text-center text-[#7D766D]">
                Or call our rapid dispatch desk directly at <strong>+254 700 666 227</strong>
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
