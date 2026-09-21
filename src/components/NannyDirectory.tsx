import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  HeartHandshake, 
  CheckCircle, 
  Search, 
  Filter, 
  Sparkles,
  FileBadge,
  BadgeCheck,
  Check,
  Briefcase,
  Layers,
  Baby,
  Home,
  Trees,
  Wrench,
  UtensilsCrossed,
  Shirt,
  UserCheck,
  Car
} from 'lucide-react';
import { NannyProfile, NairobiEstate, NannyType, HomecareRole } from '../types';
import { useContent } from '../context/ContentContext';

interface NannyDirectoryProps {
  initialEstate?: NairobiEstate | 'All Nairobi';
  initialRole?: string;
  initialType?: NannyType | 'all';
  onSelectNannyForBooking: (nanny: NannyProfile) => void;
  onInspectNannyVetting: (nanny: NannyProfile) => void;
}

export const NannyDirectory: React.FC<NannyDirectoryProps> = ({
  initialEstate = 'All Nairobi',
  initialRole = 'all',
  initialType = 'all',
  onSelectNannyForBooking,
  onInspectNannyVetting
}) => {
  const { nannies } = useContent();
  const [selectedEstate, setSelectedEstate] = useState<NairobiEstate | 'All Nairobi'>(initialEstate);
  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [selectedType, setSelectedType] = useState<NannyType | 'all'>(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSwimOnly, setFilterSwimOnly] = useState(false);
  const [filterDriveOnly, setFilterDriveOnly] = useState(false);
  const [filterSpecialNeedsOnly, setFilterSpecialNeedsOnly] = useState(false);

  // Filtering logic
  const filteredStaff = nannies.filter((staff) => {
    // Role matching
    if (selectedRole !== 'all') {
      if (selectedRole === 'chef') {
        if (staff.role !== 'chef' && staff.role !== 'cook-chef') return false;
      } else if (staff.role !== selectedRole) {
        return false;
      }
    }

    // Estate matching
    if (selectedEstate !== 'All Nairobi') {
      const matchesEstate = staff.primaryEstate === selectedEstate || staff.availableEstates.includes(selectedEstate);
      if (!matchesEstate) return false;
    }

    // Type matching (Live-in, Day, etc.)
    if (selectedType !== 'all' && staff.nannyType !== selectedType) {
      return false;
    }

    // Special toggles
    if (filterSwimOnly && !staff.canSwim) return false;
    if (filterDriveOnly && !staff.canDrive) return false;
    if (filterSpecialNeedsOnly && !staff.hasSpecialNeedsTraining) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const nameMatch = staff.name.toLowerCase().includes(q);
      const roleTitleMatch = staff.roleTitle.toLowerCase().includes(q);
      const categoryMatch = staff.categoryLabel.toLowerCase().includes(q);
      const taglineMatch = staff.tagline.toLowerCase().includes(q);
      const bioMatch = staff.bio.toLowerCase().includes(q);
      const skillMatch = staff.skills.some(s => s.toLowerCase().includes(q));
      const certMatch = staff.certifications.some(c => c.toLowerCase().includes(q));
      return nameMatch || roleTitleMatch || categoryMatch || taglineMatch || bioMatch || skillMatch || certMatch;
    }

    return true;
  });

  const roleTabs = [
    { id: 'all', label: 'All Professionals', icon: Layers, count: nannies.length },
    { id: 'nanny', label: 'Vetted Nannies', icon: Baby, count: nannies.filter(s => s.role === 'nanny').length },
    { id: 'house-manager', label: 'House Managers', icon: Home, count: nannies.filter(s => s.role === 'house-manager').length },
    { id: 'house-girl', label: 'House Girls (Housekeepers)', icon: Shirt, count: nannies.filter(s => s.role === 'house-girl').length },
    { id: 'house-boy', label: 'House Boys (Stewards)', icon: UserCheck, count: nannies.filter(s => s.role === 'house-boy').length },
    { id: 'shamba-boy', label: 'Shamba Boys (Gardeners)', icon: Trees, count: nannies.filter(s => s.role === 'shamba-boy').length },
    { id: 'caretaker', label: 'Compound Caretakers', icon: Wrench, count: nannies.filter(s => s.role === 'caretaker').length },
    { id: 'chef', label: 'Private Chefs & Cooks', icon: UtensilsCrossed, count: nannies.filter(s => s.role === 'chef' || s.role === 'cook-chef').length },
    { id: 'home-driver', label: 'Home & Family Drivers', icon: Car, count: nannies.filter(s => s.role === 'home-driver').length },
  ];

  const getRoleBadgeStyle = (role: HomecareRole) => {
    switch (role) {
      case 'house-manager':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'shamba-boy':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'caretaker':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'house-girl':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      case 'house-boy':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'chef':
      case 'cook-chef':
        return 'bg-orange-100 text-orange-900 border-orange-200';
      case 'home-driver':
        return 'bg-sky-100 text-sky-900 border-sky-200';
      case 'nanny':
      default:
        return 'bg-[#FAF0EB] text-[#D96B43] border-[#F2C2B2]';
    }
  };

  return (
    <section id="nanny-directory" className="py-16 lg:py-24 bg-white border-b border-[#E8DFD3]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0EB] text-[#D96B43] text-xs font-bold uppercase tracking-wider mb-3">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Nairobi Verified Domestic & Homecare Registry</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A201C] tracking-tight font-['Outfit']">
            Meet Our Vetted Homecare Professionals
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#635E59]">
            From nurturing infant nannies and executive house managers to private chefs, professional family drivers, 
            meticulous housekeepers, groundskeepers (shamba boys), and compound caretakers. 
            All 100% DCI fingerprint cleared, medically screened, and background verified.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-thin scrollbar-thumb-stone-300">
          {roleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedRole === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedRole(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#1D432D] text-white shadow-md shadow-[#1D432D]/20 scale-[1.02]'
                    : 'bg-[#FAF7F2] text-[#635E59] hover:bg-[#F0EBE1] hover:text-[#1A201C] border border-[#E8DFD3]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F4A261]' : 'text-[#8E877D]'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-[#4A453F]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#FAF7F2] p-4 sm:p-6 rounded-3xl border border-[#E8DFD3] mb-10 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-[#7D766D] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills (e.g., Organic garden, Borehole, BLW, Laundry)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5C9BA] rounded-xl text-sm font-medium text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#D96B43]/50"
              />
            </div>

            {/* Estate Selector */}
            <div className="md:col-span-4">
              <select
                value={selectedEstate}
                onChange={(e) => setSelectedEstate(e.target.value as NairobiEstate | 'All Nairobi')}
                className="w-full px-3.5 py-2.5 bg-white border border-[#D5C9BA] rounded-xl text-sm font-semibold text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#D96B43]/50"
              >
                <option value="All Nairobi">All Nairobi Estates</option>
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

            {/* Living Arrangement Selector */}
            <div className="md:col-span-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as NannyType | 'all')}
                className="w-full px-3.5 py-2.5 bg-white border border-[#D5C9BA] rounded-xl text-sm font-semibold text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#D96B43]/50"
              >
                <option value="all">All Arrangements (Live-In & Day)</option>
                <option value="live-in">Full-Time Live-In</option>
                <option value="day-care">Day Staff (8am - 5pm)</option>
                <option value="night-nurse">Night Shifts / Overnight</option>
                <option value="temporary-backup">Emergency / Temporary Standby</option>
              </select>
            </div>

          </div>

          {/* Quick Filter Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E8DFD3] text-xs font-semibold text-[#635E59]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[#3D3A36] font-bold">Special Attributes:</span>
              
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterDriveOnly}
                  onChange={(e) => setFilterDriveOnly(e.target.checked)}
                  className="rounded text-[#D96B43] focus:ring-[#D96B43]"
                />
                <span>Valid Driving License (NTSA)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterSwimOnly}
                  onChange={(e) => setFilterSwimOnly(e.target.checked)}
                  className="rounded text-[#D96B43] focus:ring-[#D96B43]"
                />
                <span>Swimming & Pool Supervision</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterSpecialNeedsOnly}
                  onChange={(e) => setFilterSpecialNeedsOnly(e.target.checked)}
                  className="rounded text-[#D96B43] focus:ring-[#D96B43]"
                />
                <span>Special Needs / Medical First Aid</span>
              </label>
            </div>

            <span className="text-xs font-bold text-[#1D432D]">
              Showing {filteredStaff.length} verified professional{filteredStaff.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Staff Cards Grid */}
        {filteredStaff.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF7F2] rounded-3xl border border-dashed border-[#D5C9BA]">
            <p className="text-lg font-bold text-[#1A201C]">No staff profiles match your exact criteria.</p>
            <p className="text-sm text-[#635E59] mt-1">Try selecting "All Professionals" or widening your estate selection.</p>
            <button
              onClick={() => {
                setSelectedRole('all');
                setSelectedEstate('All Nairobi');
                setSelectedType('all');
                setSearchQuery('');
                setFilterDriveOnly(false);
                setFilterSwimOnly(false);
                setFilterSpecialNeedsOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-[#D96B43] text-white font-bold text-xs rounded-xl"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStaff.map((staff) => (
              <div 
                key={staff.id}
                className="bg-white rounded-3xl border border-[#E8DFD3] hover:border-[#D96B43]/50 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Top Image & Badge Header */}
                  <div className="relative h-64 overflow-hidden bg-stone-100">
                    <img
                      src={staff.avatar}
                      alt={`${staff.name} - MommyCare Vetted ${staff.categoryLabel} in Nairobi`}
                      className="w-full h-full object-contain object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

                    {/* Verified DCI Pill Top Left */}
                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-700/95 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> DCI Biometric Verified
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                        <MapPin className="w-3 h-3 text-[#F4A261]" /> {staff.primaryEstate}
                      </span>
                    </div>

                    {/* Role Tag Top Right */}
                    <div className="absolute top-3.5 right-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border shadow-md ${getRoleBadgeStyle(staff.role)}`}>
                        {staff.categoryLabel}
                      </span>
                    </div>

                    {/* Bottom Card Image Overlay: Name, Role Title & Rating */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold font-['Outfit'] flex items-center gap-1.5">
                            {staff.name}
                            <BadgeCheck className="w-5 h-5 text-[#2F80ED]" />
                          </h3>
                          <p className="text-xs text-white/90 font-medium">
                            {staff.experienceYears} Years Exp • {staff.age} yrs old
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                            <Star className="w-4 h-4 fill-amber-400" />
                            <span>{staff.rating}</span>
                          </div>
                          <span className="text-[10px] text-white/80">({staff.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    
                    {/* Role Title & Specialty */}
                    <div>
                      <span className="text-[11px] font-bold text-[#D96B43] uppercase tracking-wider block">
                        Professional Focus
                      </span>
                      <p className="text-sm font-bold text-[#1A201C] mt-0.5 font-['Outfit']">
                        {staff.roleTitle}
                      </p>
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-[#524D47] line-clamp-3 leading-relaxed">
                      {staff.bio}
                    </p>

                    {/* 4 Trust Micro Badges */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EFE9DF] text-[11px] text-[#2C2723] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>DCI Clean Record</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Clinical Lab Cleared</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{staff.verifiedReferenceCount}+ Phone Audited Refs</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Chief Letter on File</span>
                      </div>
                    </div>

                    {/* Key Skills Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {staff.skills.slice(0, 3).map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8DFD3] text-[11px] font-medium text-[#4A453F]"
                        >
                          {skill}
                        </span>
                      ))}
                      {staff.skills.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#FAF7F2] text-[10px] text-[#7A746E]">
                          +{staff.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Pricing Box */}
                    <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#7D766D] tracking-wider block">
                          Fair Monthly Salary
                        </span>
                        <span className="text-base font-extrabold text-[#1A201C] font-['Outfit']">
                          KES {staff.monthlySalaryKsh.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#635E59]"> / month</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#7D766D] block">Hourly / Trial</span>
                        <span className="text-xs font-bold text-[#1D432D]">
                          KES {staff.hourlyRateKsh}/hr
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onInspectNannyVetting(staff)}
                    className="w-full py-2.5 px-2 rounded-xl bg-white border border-[#D5C9BA] hover:bg-[#FAF7F2] text-[#1A201C] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileBadge className="w-3.5 h-3.5 text-[#1D432D]" />
                    <span>View Vetting File</span>
                  </button>

                  <button
                    onClick={() => onSelectNannyForBooking(staff)}
                    className="w-full py-2.5 px-2 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#D96B43]/20 transition-all hover:scale-[1.02]"
                  >
                    <span>Book 3-Day Trial</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
