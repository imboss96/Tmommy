import React, { useState } from 'react';
import { CheckCircle2, EyeOff, MessageSquareQuote, Pencil, Trash2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { NairobiEstate, Review, ReviewStatus } from '../../types';

const estates: NairobiEstate[] = ['Kilimani', 'Westlands', 'Karen', 'Lavington', 'Kileleshwa', 'Runda', 'Muthaiga', 'South C', 'Parklands', 'Gigiri', 'Kiambu Road', 'Ruaka'];

export const ReviewsManager: React.FC = () => {
  const { reviews, updateReview, deleteReview } = useContent();
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [draft, setDraft] = useState<Review | null>(null);
  const filteredReviews = reviews.filter(review => statusFilter === 'all' || review.status === statusFilter);

  const openEditor = (review: Review) => {
    setEditingReview(review);
    setDraft({ ...review });
  };

  const saveEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    updateReview(draft.id, draft);
    setEditingReview(null);
    setDraft(null);
  };

  const statusClass = (status: ReviewStatus) => status === 'published'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : status === 'hidden'
      ? 'bg-gray-100 text-gray-700 border-gray-200'
      : 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-['Outfit'] text-[#1A201C] flex items-center gap-2"><MessageSquareQuote className="w-5 h-5 text-[#D96B43]" />Reviews & Testimonials</h2>
          <p className="text-xs text-[#635E59] mt-1">Review new submissions before publishing them on the public website.</p>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | ReviewStatus)} className="px-3 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-bold">
          <option value="all">All reviews ({reviews.length})</option>
          <option value="pending">Pending ({reviews.filter(review => review.status === 'pending').length})</option>
          <option value="published">Published ({reviews.filter(review => review.status === 'published').length})</option>
          <option value="hidden">Hidden ({reviews.filter(review => review.status === 'hidden').length})</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredReviews.map(review => (
          <article key={review.id} className="bg-white rounded-2xl border border-[#E8DFD3] p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-[#1A201C]">{review.parentName}</h3>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusClass(review.status)}`}>{review.status}</span>
                  <span className="text-amber-500 text-sm">{'★'.repeat(review.rating)}<span className="text-stone-300">{'★'.repeat(5 - review.rating)}</span></span>
                </div>
                <p className="text-xs text-[#635E59]">{review.estate} • {review.familyRole} • {review.serviceType || 'Homecare service'}</p>
                <p className="text-sm leading-relaxed text-[#3D3A36]">“{review.comment}”</p>
                <p className="text-[11px] text-[#7D766D]">Submitted {new Date(review.submittedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {review.status !== 'published' && <button onClick={() => updateReview(review.id, { status: 'published' })} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#1D432D] text-white text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" />Publish</button>}
                {review.status === 'published' && <button onClick={() => updateReview(review.id, { status: 'hidden' })} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-[#D5C9BA] text-[#524D47] text-xs font-bold"><EyeOff className="w-3.5 h-3.5" />Hide</button>}
                {review.status === 'hidden' && <button onClick={() => updateReview(review.id, { status: 'published' })} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#1D432D] text-white text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" />Show</button>}
                <button onClick={() => openEditor(review)} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-[#D5C9BA] text-[#1D432D] text-xs font-bold"><Pencil className="w-3.5 h-3.5" />Edit</button>
                <button onClick={() => { if (confirm(`Delete review from ${review.parentName}?`)) deleteReview(review.id); }} className="p-2 rounded-lg bg-white border border-red-200 text-red-600" title="Delete review"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </article>
        ))}
        {filteredReviews.length === 0 && <div className="p-10 bg-white rounded-2xl border border-dashed border-[#D5C9BA] text-center text-sm text-[#7D766D]">No reviews in this status.</div>}
      </div>

      {editingReview && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <form onSubmit={saveEdit} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold font-['Outfit']">Edit Review</h3><button type="button" onClick={() => setEditingReview(null)} className="text-[#7D766D]">✕</button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={draft.parentName} onChange={e => setDraft({ ...draft, parentName: e.target.value })} required placeholder="Parent name" className="rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2 text-sm" />
              <input value={draft.familyRole} onChange={e => setDraft({ ...draft, familyRole: e.target.value })} required placeholder="Family role" className="rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2 text-sm" />
              <select value={draft.estate} onChange={e => setDraft({ ...draft, estate: e.target.value as NairobiEstate })} className="rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2 text-sm">{estates.map(estate => <option key={estate}>{estate}</option>)}</select>
              <input value={draft.serviceType} onChange={e => setDraft({ ...draft, serviceType: e.target.value })} placeholder="Service type" className="rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2 text-sm" />
            </div>
            <textarea value={draft.comment} onChange={e => setDraft({ ...draft, comment: e.target.value })} required rows={5} className="w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2 text-sm" />
            <div className="flex items-center justify-between gap-3"><select value={draft.rating} onChange={e => setDraft({ ...draft, rating: Number(e.target.value) })} className="rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2 text-sm">{[5, 4, 3, 2, 1].map(rating => <option key={rating} value={rating}>{rating} stars</option>)}</select><div className="flex gap-2"><button type="button" onClick={() => setEditingReview(null)} className="px-4 py-2 rounded-xl border border-[#D5C9BA] text-sm font-bold">Cancel</button><button type="submit" className="px-4 py-2 rounded-xl bg-[#D96B43] text-white text-sm font-bold">Save Changes</button></div></div>
          </form>
        </div>
      )}
    </div>
  );
};