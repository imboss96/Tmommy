import React, { useState } from 'react';
import { 
  X, 
  HeartHandshake, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Home, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Clock,
  Briefcase
} from 'lucide-react';
import { NairobiEstate, NannyType, NannyProfile, BookingFormData, HomecareRole } from '../types';
import { useContent } from '../context/ContentContext';
import { MommyCareLogo } from './MommyCareLogo';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedNanny?: NannyProfile | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  preSelectedNanny
}) => {
  const { addBooking } = useContent();
  const [formData, setFormData] = useState<BookingFormData>({
    nannyId: preSelectedNanny?.id || '',
    nannyName: preSelectedNanny?.name || '',
    role: preSelectedNanny?.role || 'nanny',
    parentName: '',
    phone: '',
    email: '',
    estate: (preSelectedNanny?.primaryEstate || 'Kilimani') as NairobiEstate,
    residenceDetails: '',
    residenceType: 'Apartment',
    nannyType: (preSelectedNanny?.nannyType || 'live-in') as NannyType,
    numberOfChildren: 1,
    childrenAges: '',
    startDate: '',
    preferredTrialDays: 3,
    additionalNotes: '',
    needsCooking: true,
    needsPetFriendly: false,
    hasGardenOrLawn: false
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync preSelectedNanny changes if user clicks different profile
  React.useEffect(() => {
    if (preSelectedNanny) {
      setFormData(prev => ({
        ...prev,
        nannyId: preSelectedNanny.id,
        nannyName: preSelectedNanny.name,
        role: preSelectedNanny.role,
        estate: preSelectedNanny.primaryEstate,
        nannyType: preSelectedNanny.nannyType
      }));
    }
  }, [preSelectedNanny]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBooking(formData);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="my-0 sm:my-6 bg-white rounded-3xl border border-[#D5C9BA] max-w-2xl w-full max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-3rem)] shadow-2xl overflow-y-auto relative">
        
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 bg-[#FAF7F2] border-b border-[#E8DFD3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MommyCareLogo variant="icon" size="sm" />
            <div>
              <h2 className="text-xl font-bold text-[#1A201C] font-['Outfit']">
                Schedule a 3-Day Risk-Free Home Trial
              </h2>
              <p className="text-xs text-[#635E59]">
                {preSelectedNanny 
                  ? `Selected: ${preSelectedNanny.name} (${preSelectedNanny.categoryLabel})` 
                  : 'Request customized homecare matching for your Nairobi residence'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7D766D] hover:text-[#1A201C] hover:bg-[#F2EDE4] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A201C] font-['Outfit']">
                Trial Request Received!
              </h3>
              <p className="text-sm text-[#524D47] max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.parentName}</strong>. Our senior Nairobi placement coordinator 
                will call you on <strong>{formData.phone}</strong> within 30–45 minutes to confirm candidate 
                availability, share complete verification documents, and arrange your 3-day home trial.
              </p>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs text-left max-w-md mx-auto space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#635E59]">Role Requested:</span>
                  <span className="font-bold text-[#1A201C] capitalize">{formData.role?.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#635E59]">Estate:</span>
                  <span className="font-bold text-[#1A201C]">{formData.estate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#635E59]">Property Type:</span>
                  <span className="font-bold text-[#1A201C]">{formData.residenceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#635E59]">Living Arrangement:</span>
                  <span className="font-bold text-[#1A201C]">{formData.nannyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#635E59]">Warranty Protection:</span>
                  <span className="font-bold text-emerald-700">90-Day Free Replacement</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-[#1D432D] text-white font-bold text-sm hover:bg-[#143020] transition-colors"
                >
                  Return to Registry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Staff Selection Pill if preselected */}
              {preSelectedNanny ? (
                <div className="p-3.5 rounded-2xl bg-[#FAF0EB] border border-[#F2C2B2] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={preSelectedNanny.avatar}
                      alt={preSelectedNanny.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#1A201C]">{preSelectedNanny.name}</p>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D96B43] text-white">
                          {preSelectedNanny.categoryLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#635E59]">{preSelectedNanny.tagline}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#D96B43]">
                    KES {preSelectedNanny.monthlySalaryKsh.toLocaleString()}/mo
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#1D432D]" />
                    Homecare Profession Needed *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as HomecareRole })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold text-[#1A201C] focus:ring-2 focus:ring-[#D96B43]"
                  >
                    <option value="nanny">Vetted Nanny & Childcare Specialist</option>
                    <option value="nanny">Au Pairs / Elite Nannies</option>
                    <option value="temporary-backup">Holiday Relievers</option>
                    <option value="house-manager">Executive House Manager</option>
                    <option value="house-girl">House Girl / Professional Housekeeper</option>
                    <option value="house-boy">House Boy / Domestic Steward</option>
                    <option value="shamba-boy">Shamba Boy / Groundskeeper & Gardener</option>
                    <option value="caretaker">Compound Caretaker & Property Custodian</option>
                    <option value="cook-chef">Private Domestic Cook / Chef</option>
                  </select>
                </div>
              )}

              {/* Row 1: Parent/Employer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="e.g. Wanjiku Mwangi"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium text-[#1A201C] focus:ring-2 focus:ring-[#D96B43]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                    Phone (M-Pesa / WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+254 7..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium text-[#1A201C] focus:ring-2 focus:ring-[#D96B43]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium text-[#1A201C] focus:ring-2 focus:ring-[#D96B43]"
                />
              </div>

              {/* Row 2: Estate & Residence Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                    Nairobi Estate *
                  </label>
                  <select
                    value={formData.estate}
                    onChange={(e) => setFormData({ ...formData, estate: e.target.value as NairobiEstate })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold text-[#1A201C] focus:ring-2 focus:ring-[#D96B43]"
                  >
                    <option value="Kilimani">Kilimani</option>
                    <option value="Westlands">Westlands</option>
                    <option value="Karen">Karen</option>
                    <option value="Lavington">Lavington</option>
                    <option value="Kileleshwa">Kileleshwa</option>
                    <option value="Runda">Runda</option>
                    <option value="Muthaiga">Muthaiga</option>
                    <option value="South C">South C</option>
                    <option value="Parklands">Parklands</option>
                    <option value="Gigiri">Gigiri</option>
                    <option value="Kiambu Road">Kiambu Road</option>
                    <option value="Ruaka">Ruaka</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                    Residence Type
                  </label>
                  <select
                    value={formData.residenceType}
                    onChange={(e) => setFormData({ ...formData, residenceType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold text-[#1A201C] focus:ring-2 focus:ring-[#D96B43]"
                  >
                    <option value="Apartment">Apartment / Penthouse</option>
                    <option value="Townhouse">Gated Townhouse</option>
                    <option value="Standalone Villa">Standalone Villa / House</option>
                    <option value="Country Compound">Large Compound / Acreage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                  Residence Details *
                </label>
                <input
                  type="text"
                  required
                  value={formData.residenceDetails}
                  onChange={(e) => setFormData({ ...formData, residenceDetails: e.target.value })}
                  placeholder="e.g. Apartment name, house number, or estate gate"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium text-[#1A201C] focus:ring-2 focus:ring-[#D96B43]"
                />
              </div>

              {/* Row 3: Living Arrangement & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                    Engagement Arrangement
                  </label>
                  <select
                    value={formData.nannyType}
                    onChange={(e) => setFormData({ ...formData, nannyType: e.target.value as NannyType })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold text-[#1A201C] focus:ring-2 focus:ring-[#D96B43]"
                  >
                    <option value="live-in">Full-Time Live-In (Room Provided)</option>
                    <option value="day-care">Day Staff (8:00 AM - 5:00 PM)</option>
                    <option value="night-nurse">Overnight / Night Shift</option>
                    <option value="temporary-backup">Temporary / Emergency Backup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-[#7D766D] tracking-wider mb-1">
                    Target Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium text-[#1A201C] focus:ring-2 focus:ring-[#D96B43]"
                  />
                </div>
              </div>

              {/* Checkbox preferences */}
              <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold text-[#4A453F]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needsCooking}
                    onChange={(e) => setFormData({ ...formData, needsCooking: e.target.checked })}
                    className="rounded text-[#D96B43] focus:ring-[#D96B43]"
                  />
                  <span>Includes Cooking Meals</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needsPetFriendly}
                    onChange={(e) => setFormData({ ...formData, needsPetFriendly: e.target.checked })}
                    className="rounded text-[#D96B43] focus:ring-[#D96B43]"
                  />
                  <span>Pet Friendly (Dogs / Cats)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasGardenOrLawn}
                    onChange={(e) => setFormData({ ...formData, hasGardenOrLawn: e.target.checked })}
                    className="rounded text-[#D96B43] focus:ring-[#D96B43]"
                  />
                  <span>Compound Lawn / Gardening Included</span>
                </label>
              </div>

              {/* Guarantees Reassurance */}
              <div className="p-3.5 rounded-2xl bg-[#E8F0EA] border border-[#C5DDCB] flex items-center gap-3 text-xs text-[#1D432D]">
                <ShieldCheck className="w-5 h-5 text-[#1D432D] shrink-0" />
                <span>
                  <strong>Our 90-Day Guarantee:</strong> If the candidate is not the perfect fit during or after the 3-day home trial, we replace them at zero extra agency cost.
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#D96B43]/20 transition-all hover:scale-[1.01]"
              >
                Confirm 3-Day Home Trial Booking
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
