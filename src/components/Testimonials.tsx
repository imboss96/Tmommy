import React, { useState } from 'react';
import { Star, CheckCircle2, MapPin, Heart, Send } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { NairobiEstate } from '../types';

export const Testimonials: React.FC = () => {
  const { reviews, addReview } = useContent();
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    parentName: '', familyRole: '', estate: 'Kilimani' as NairobiEstate, nannyName: '',
    comment: '', rating: 5, childrenAge: '', serviceType: ''
  });
  const publishedReviews = reviews.filter(review => review.status === 'published');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    addReview(form);
    setSubmitted(true);
    setForm({ parentName: '', familyRole: '', estate: 'Kilimani', nannyName: '', comment: '', rating: 5, childrenAge: '', serviceType: '' });
  };

  return (
    <section className="py-16 lg:py-24 bg-[#FAF7F2] border-b border-[#E8DFD3]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0EA] text-[#1D432D] text-xs font-bold uppercase tracking-wider mb-3">
            <Heart className="w-3.5 h-3.5 text-[#D96B43]" />
            <span>Nairobi Family Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A201C] tracking-tight font-['Outfit']">
            Trusted in Over 280 Homes Across Nairobi
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#635E59]">
            Read verified reviews from parents in Karen, Westlands, Kilimani, and Runda who found peace of mind with MommyCare.
          </p>
        </div>

        {/* Grid of Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {publishedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DFD3] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Rating Stars & Estate */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-400' : 'text-stone-300'}`} />
                    ))}
                    <span className="text-xs font-bold text-[#1A201C] ml-1.5">{rev.rating.toFixed(1)}</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DFD3] text-xs font-bold text-[#1D432D] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#D96B43]" />
                    <span>{rev.estate}, Nairobi</span>
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-sm sm:text-base text-[#3D3A36] leading-relaxed italic mb-6">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-[#EFE9DF] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1A201C] font-['Outfit'] flex items-center gap-1.5">
                    {rev.parentName}
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </h4>
                  <p className="text-xs text-[#635E59]">{rev.familyRole} • {rev.childrenAge}</p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#D96B43] block">
                    Nanny: {rev.nannyName}
                  </span>
                  <span className="text-[10px] text-[#7A746E]">
                    {rev.serviceType}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          {!isReviewFormOpen && !submitted && (
            <button
              onClick={() => setIsReviewFormOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white text-sm font-bold shadow-md"
            >
              <Star className="w-4 h-4" />
              Share Your Experience
            </button>
          )}

          {submitted && (
            <div className="mx-auto max-w-xl rounded-2xl border border-[#BFE2C8] bg-[#F1FBF3] p-5 text-sm text-[#1D432D]">
              Thank you for sharing your experience. Your review has been sent for verification and will appear after approval.
            </div>
          )}

          {isReviewFormOpen && !submitted && (
            <form onSubmit={handleSubmit} className="mx-auto max-w-3xl rounded-2xl border border-[#E8DFD3] bg-white p-5 sm:p-7 text-left shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-[#1A201C] font-['Outfit']">Share your experience</h3>
                  <p className="mt-1 text-xs text-[#635E59]">Reviews are checked before they are published.</p>
                </div>
                <Heart className="w-6 h-6 text-[#D96B43]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} placeholder="Your name" className="rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2.5 text-sm" />
                <input required value={form.familyRole} onChange={e => setForm({ ...form, familyRole: e.target.value })} placeholder="Family role (e.g. Parent of two)" className="rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2.5 text-sm" />
                <select value={form.estate} onChange={e => setForm({ ...form, estate: e.target.value as NairobiEstate })} className="rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2.5 text-sm">
                  {['Kilimani', 'Westlands', 'Karen', 'Lavington', 'Kileleshwa', 'Runda', 'Muthaiga', 'South C', 'Parklands', 'Gigiri', 'Kiambu Road', 'Ruaka'].map(estate => <option key={estate}>{estate}</option>)}
                </select>
                <input value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })} placeholder="Service used (optional)" className="rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2.5 text-sm" />
                <input value={form.nannyName} onChange={e => setForm({ ...form, nannyName: e.target.value })} placeholder="Professional's name (optional)" className="rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2.5 text-sm" />
                <input value={form.childrenAge} onChange={e => setForm({ ...form, childrenAge: e.target.value })} placeholder="Children's age (optional)" className="rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2.5 text-sm" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <label htmlFor="review-rating" className="text-sm font-bold text-[#1A201C]">Rating</label>
                <select id="review-rating" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} className="rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2 text-sm">
                  {[5, 4, 3, 2, 1].map(rating => <option key={rating} value={rating}>{rating} out of 5</option>)}
                </select>
              </div>
              <textarea required minLength={20} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Tell us about your experience..." rows={5} className="mt-4 w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2.5 text-sm" />
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsReviewFormOpen(false)} className="px-4 py-2.5 rounded-xl border border-[#D5C9BA] text-sm font-bold text-[#524D47]">Cancel</button>
                <button type="submit" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D432D] text-white text-sm font-bold"><Send className="w-4 h-4" />Submit Review</button>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};
