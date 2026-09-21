import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  BadgeCheck, 
  Briefcase, 
  MapPin, 
  Banknote, 
  CheckCircle2, 
  X, 
  Upload, 
  Eye, 
  UserCheck,
  Award
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { NannyProfile, HomecareRole, NairobiEstate, NannyType } from '../../types';

export const StaffManager: React.FC = () => {
  const { nannies, addNanny, updateNanny, deleteNanny } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingStaff, setEditingStaff] = useState<NannyProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<NannyProfile>>({
    name: '',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
    age: 30,
    role: 'nanny',
    roleTitle: 'Certified Infant & Childcare Professional',
    categoryLabel: 'Infant Nanny Specialist',
    nannyType: 'live-in',
    primaryEstate: 'Kilimani',
    availableEstates: ['Kilimani', 'Westlands', 'Karen'],
    experienceYears: 4,
    monthlySalaryKsh: 26000,
    tagline: 'Warm, reliable, and DCI-biometric verified.',
    bio: 'Dedicated homecare professional with pristine references and CPR training.',
    certifications: ['DCI Police Certificate of Good Conduct', 'Red Cross First Aid'],
    skills: ['Deep Cleaning', 'Cooking', 'Childcare'],
    languages: ['English', 'Swahili'],
    education: 'Kenya Certificate of Secondary Education (KCSE)',
    dciGoodConductNumber: 'DCI-NBO-883912',
    dciIssueDate: '2025-01-10',
    firstAidCertNumber: 'FA-KE-9921',
    medicalClearanceDate: '2025-01-20',
    verifiedReferenceCount: 2,
    isAvailableNow: true,
    canSwim: false,
    hasSpecialNeedsTraining: false,
    canDrive: false
  });

  const roles: { value: string; label: string }[] = [
    { value: 'all', label: 'All Professions' },
    { value: 'nanny', label: 'Nannies & Childcare' },
    { value: 'house-manager', label: 'House Managers' },
    { value: 'house-girl', label: 'House Girls' },
    { value: 'house-boy', label: 'House Boys' },
    { value: 'shamba-boy', label: 'Shamba Boys' },
    { value: 'caretaker', label: 'Caretakers' },
    { value: 'cook-chef', label: 'Cooks & Chefs' }
  ];

  const estates: NairobiEstate[] = [
    'Kilimani', 'Westlands', 'Karen', 'Lavington', 'Kileleshwa', 
    'Runda', 'Muthaiga', 'South C', 'Parklands', 'Gigiri', 'Kiambu Road', 'Ruaka'
  ];

  const filteredStaff = nannies.filter(staff => {
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      staff.name.toLowerCase().includes(q) || 
      staff.primaryEstate.toLowerCase().includes(q) ||
      staff.roleTitle.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
      age: 29,
      role: 'nanny',
      roleTitle: 'Certified Infant & Childcare Professional',
      categoryLabel: 'Infant Nanny Specialist',
      nannyType: 'live-in',
      primaryEstate: 'Kilimani',
      availableEstates: ['Kilimani', 'Westlands'],
      experienceYears: 4,
      monthlySalaryKsh: 26000,
      tagline: 'Warm, reliable, and verified.',
      bio: 'Thoroughly checked domestic professional with strong Nairobi references.',
      certifications: ['DCI Good Conduct', 'Red Cross First Aid'],
      skills: ['Childcare', 'Cooking', 'Housekeeping'],
      languages: ['English', 'Swahili'],
      education: 'KCSE Certificate',
      dciGoodConductNumber: `DCI-NBO-${Math.floor(100000 + Math.random() * 900000)}`,
      dciIssueDate: '2025-01-15',
      firstAidCertNumber: `FA-KE-${Math.floor(10000 + Math.random() * 90000)}`,
      medicalClearanceDate: '2025-01-20',
      verifiedReferenceCount: 2,
      isAvailableNow: true,
      canSwim: false,
      hasSpecialNeedsTraining: false,
      canDrive: false
    });
    setEditingStaff(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (staff: NannyProfile) => {
    setEditingStaff(staff);
    setFormData(staff);
    setIsCreating(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      updateNanny(editingStaff.id, formData);
    } else {
      addNanny(formData);
    }
    setIsCreating(false);
    setEditingStaff(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-['Outfit'] text-[#1A201C] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#1D432D]" />
            <span>Domestic Staff & Professional Registry</span>
          </h2>
          <p className="text-xs text-[#635E59] mt-0.5">
            Manage candidates, photos, monthly compensation rates, DCI records, and live estate availability.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-xs rounded-xl shadow-md shadow-[#D96B43]/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Candidate</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D766D]" />
          <input
            type="text"
            placeholder="Search candidate name, estate, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E8DFD3] rounded-xl focus:ring-2 focus:ring-[#D96B43] text-[#1A201C]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {roles.map(r => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === r.value
                  ? 'bg-[#1D432D] text-white'
                  : 'bg-white text-[#524D47] border border-[#E8DFD3] hover:bg-[#FAF7F2]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table / Cards */}
      <div className="bg-white rounded-2xl border border-[#E8DFD3] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-[#7D766D] uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Role & Category</th>
                <th className="py-3 px-4">Primary Estate</th>
                <th className="py-3 px-4">Monthly Salary</th>
                <th className="py-3 px-4">Vetting Status</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1]">
              {filteredStaff.map(staff => (
                <tr key={staff.id} className="hover:bg-[#FFFDF9] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[#D5C9BA]"
                      />
                      <div>
                        <span className="font-bold text-sm text-[#1A201C] block">{staff.name}</span>
                        <span className="text-[11px] text-[#7D766D]">{staff.age} yrs • {staff.experienceYears} yrs exp</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8DFD3] font-bold text-[#1D432D] text-[11px] block w-max">
                      {staff.categoryLabel}
                    </span>
                    <span className="text-[11px] text-[#635E59] block mt-0.5 capitalize">{staff.nannyType}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 font-semibold text-[#1A201C]">
                      <MapPin className="w-3.5 h-3.5 text-[#D96B43]" />
                      <span>{staff.primaryEstate}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#1A201C]">
                      KES {staff.monthlySalaryKsh.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#7D766D] block">/ month</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>DCI: {staff.dciGoodConductNumber}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => updateNanny(staff.id, { isAvailableNow: !staff.isAvailableNow })}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        staff.isAvailableNow
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-gray-100 text-gray-600 border-gray-300'
                      }`}
                    >
                      {staff.isAvailableNow ? '● Ready for Trial' : '○ Booked / Offline'}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(staff)}
                        className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8DFD3] hover:bg-[#F2ECE1] text-[#1A201C]"
                        title="Edit Candidate"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${staff.name} from the active candidate registry?`)) {
                            deleteNanny(staff.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-red-600"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-xs text-[#7D766D]">
                    No domestic staff found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT STAFF MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5C9BA] max-w-3xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 bg-[#1D432D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-['Outfit']">
                    {editingStaff ? `Edit Candidate: ${editingStaff.name}` : 'Register New Vetted Candidate'}
                  </h3>
                  <p className="text-xs text-white/80">Update profile photo, salary, estate, and DCI forensic files</p>
                </div>
              </div>

              <button
                onClick={() => setIsCreating(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
              
              {/* Photo & Basic Info */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-3">
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider">
                  Candidate Profile Photo (URL or Device Upload) *
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <img
                    src={formData.avatar}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border border-[#D5C9BA] shrink-0"
                  />
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="url"
                      required
                      value={formData.avatar || ''}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 bg-white border border-[#D5C9BA] rounded-xl text-xs font-mono"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5C9BA] hover:bg-[#F2ECE1] rounded-xl text-xs font-semibold cursor-pointer text-[#1A201C] transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#1D432D]" />
                      <span>Upload Photo from Computer/Phone</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Name, Role, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Grace Wambui"
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Role Profession *
                  </label>
                  <select
                    value={formData.role || 'nanny'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as HomecareRole })}
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold"
                  >
                    <option value="nanny">Nanny & Childcare</option>
                    <option value="house-manager">Executive House Manager</option>
                    <option value="house-girl">House Girl (Housekeeper)</option>
                    <option value="house-boy">House Boy (Steward)</option>
                    <option value="shamba-boy">Shamba Boy (Grounds)</option>
                    <option value="caretaker">Compound Caretaker</option>
                    <option value="cook-chef">Private Domestic Cook / Chef</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Category Badge Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.categoryLabel || ''}
                    onChange={(e) => setFormData({ ...formData, categoryLabel: e.target.value })}
                    placeholder="e.g. Infant Nanny Specialist"
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              {/* Estate, Type, Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Primary Nairobi Estate *
                  </label>
                  <select
                    value={formData.primaryEstate || 'Kilimani'}
                    onChange={(e) => setFormData({ ...formData, primaryEstate: e.target.value as NairobiEstate })}
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold"
                  >
                    {estates.map(est => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Living Arrangement *
                  </label>
                  <select
                    value={formData.nannyType || 'live-in'}
                    onChange={(e) => setFormData({ ...formData, nannyType: e.target.value as NannyType })}
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold"
                  >
                    <option value="live-in">Live-in</option>
                    <option value="day-care">Day Care (Daily 8am-5pm)</option>
                    <option value="night-nurse">Night Nurse</option>
                    <option value="temporary-backup">Temporary Relief</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Monthly Salary (KES) *
                  </label>
                  <input
                    type="number"
                    step="500"
                    required
                    value={formData.monthlySalaryKsh || 25000}
                    onChange={(e) => setFormData({ ...formData, monthlySalaryKsh: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-bold text-[#1A201C]"
                  />
                </div>
              </div>

              {/* Tagline & Bio */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  Tagline *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tagline || ''}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. 5+ Years Experience with High-Rise Kilimani Families & Toddlers"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  Candidate Bio & Household Strengths
                </label>
                <textarea
                  rows={2}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Summary of experience, past employers, and strengths..."
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-medium"
                />
              </div>

              {/* Vetting Credentials Details */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1D432D] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Forensic Vetting Clearances
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#1D432D] mb-1">
                      DCI Good Conduct Ref #
                    </label>
                    <input
                      type="text"
                      value={formData.dciGoodConductNumber || ''}
                      onChange={(e) => setFormData({ ...formData, dciGoodConductNumber: e.target.value })}
                      placeholder="DCI-NBO-883912"
                      className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1D432D] mb-1">
                      CPR / First Aid Cert #
                    </label>
                    <input
                      type="text"
                      value={formData.firstAidCertNumber || ''}
                      onChange={(e) => setFormData({ ...formData, firstAidCertNumber: e.target.value })}
                      placeholder="FA-KE-9921"
                      className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1D432D] mb-1">
                      Clinical Clearance Date
                    </label>
                    <input
                      type="date"
                      value={formData.medicalClearanceDate || '2025-01-20'}
                      onChange={(e) => setFormData({ ...formData, medicalClearanceDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[#E8DFD3] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5C9BA] hover:bg-[#FAF7F2] text-[#524D47] font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-xs shadow-md shadow-[#D96B43]/25 transition-all"
                >
                  {editingStaff ? 'Update Candidate Profile' : 'Save Candidate'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
