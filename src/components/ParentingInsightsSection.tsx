import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Clock, 
  Tag, 
  ArrowRight, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Share2, 
  Check, 
  ShieldCheck, 
  HeartHandshake, 
  UserCheck
} from 'lucide-react';
import { ParentingInsight } from '../types';
import { useContent } from '../context/ContentContext';

interface ParentingInsightsSectionProps {
  onOpenBooking: () => void;
}

export const ParentingInsightsSection: React.FC<ParentingInsightsSectionProps> = ({
  onOpenBooking
}) => {
  const { insights } = useContent();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<ParentingInsight | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const categories = ['All', 'Infant Nutrition', 'Developmental Milestones', 'Childcare & Safety', 'Nanny Management'];

  const filteredArticles = useMemo(() => {
    return insights.filter(article => {
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        article.title.toLowerCase().includes(q) || 
        article.excerpt.toLowerCase().includes(q) ||
        article.tags.some(tag => tag.toLowerCase().includes(q)) ||
        article.author.name.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [insights, selectedCategory, searchQuery]);

  const handleShare = (article: ParentingInsight) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}#${article.slug}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <section id="parenting-insights" className="py-20 bg-[#FAF7F2] border-t border-[#E8DFD3] relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#D96B43]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-96 h-96 bg-[#1D432D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F0EA] text-[#1D432D] text-xs font-bold uppercase tracking-wider mb-4 border border-[#C5DDCB]">
            <BookOpen className="w-3.5 h-3.5 text-[#D96B43]" />
            <span>Nairobi Childcare Knowledge Base</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A201C] tracking-tight font-['Outfit']">
            Parenting Insights & Childcare Guides
          </h2>
          
          <p className="mt-4 text-base sm:text-lg text-[#635E59] leading-relaxed">
            Evidence-grounded advice authored by Kenyan pediatricians, nutritionists, and Red Cross emergency instructors. 
            Tailored specifically for modern Nairobi households.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1D432D] text-white shadow-sm'
                    : 'bg-white border border-[#D5C9BA] text-[#554F49] hover:bg-[#F2ECE3]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#8C847B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search weaning, first aid, milestones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#D5C9BA] rounded-xl text-xs sm:text-sm placeholder:text-[#9E978F] focus:outline-none focus:ring-2 focus:ring-[#D96B43]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8DFD3] p-8">
            <BookOpen className="w-12 h-12 text-[#B8AEA3] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#1A201C] font-['Outfit']">No articles match your search</h3>
            <p className="text-sm text-[#7A746E] mt-1">Try another keyword or reset the category filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#D96B43] text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredArticles.map(article => (
              <article 
                key={article.id}
                id={article.slug}
                className="bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
                onClick={() => setActiveArticle(article)}
              >
                {/* Image Cover */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F2EDE4]">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain object-center transition-opacity duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/95 text-[#1D432D] shadow-sm backdrop-blur-sm border border-[#E8DFD3]">
                      {article.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#14261B]/80 text-white backdrop-blur-sm">
                      <Clock className="w-3 h-3 text-[#F4A261]" />
                      {article.readTime}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#7A746E] border border-[#E8DFD3]">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Headline */}
                    <h3 className="text-xl sm:text-2xl font-bold text-[#1A201C] group-hover:text-[#D96B43] transition-colors font-['Outfit'] leading-snug">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-[#635E59] leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Author & Action Footer */}
                  <div className="pt-6 mt-6 border-t border-[#F2ECE3] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-[#E8DFD3]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#1A201C]">{article.author.name}</div>
                        <div className="text-[11px] text-[#8C847B]">{article.author.role}</div>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D96B43] group-hover:translate-x-1 transition-transform">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Nanny Training Link Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1D432D] to-[#142F1F] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F4A261] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Nanny Implementation</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold font-['Outfit']">
              Want a Nanny Trained in These Exact Standards?
            </h4>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              Every MommyCare nanny undergoes verified training in infant weaning nutrition, pediatric CPR, 
              Montessori developmental activities, and high-rise apartment safety.
            </p>
          </div>

          <button
            onClick={onOpenBooking}
            className="px-6 py-3.5 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-xs sm:text-sm whitespace-nowrap shadow-lg shadow-[#D96B43]/30 transition-all"
          >
            Match with a Trained Nanny
          </button>
        </div>

      </div>

      {/* ARTICLE FULL MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8DFD3] text-[#1A201C] my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image with close button */}
            <div className="relative h-64 sm:h-72 w-full">
              <img
                src={activeArticle.coverImage}
                alt={activeArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                aria-label="Close article"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D96B43] text-white inline-block">
                  {activeArticle.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] leading-tight">
                  {activeArticle.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-white/90">
                  <span>{activeArticle.publishedDate}</span>
                  <span>•</span>
                  <span>{activeArticle.readTime}</span>
                  <span>•</span>
                  <span>{activeArticle.relatedNairobiTopic}</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Author & Share bar */}
              <div className="flex items-center justify-between py-3 px-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3]">
                <div className="flex items-center gap-3">
                  <img
                    src={activeArticle.author.avatar}
                    alt={activeArticle.author.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-[#D5C9BA]"
                  />
                  <div>
                    <div className="text-sm font-bold text-[#1A201C]">{activeArticle.author.name}</div>
                    <div className="text-xs text-[#7A746E]">{activeArticle.author.role}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleShare(activeArticle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5C9BA] bg-white text-xs font-bold text-[#1A201C] hover:bg-[#F2ECE3] transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Share'}</span>
                </button>
              </div>

              {/* Key Takeaways Box */}
              <div className="p-5 rounded-2xl bg-[#E8F0EA] border border-[#C5DDCB] space-y-3">
                <div className="flex items-center gap-2 text-[#1D432D] font-bold text-sm font-['Outfit']">
                  <CheckCircle2 className="w-4 h-4 text-[#D96B43]" />
                  <span>Clinical & Practical Key Takeaways for Nairobi Families</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-[#23432F]">
                  {activeArticle.keyTakeaways.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D96B43] mt-2 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Article Paragraphs */}
              <div className="space-y-4 text-sm sm:text-base text-[#3D3A36] leading-relaxed">
                {activeArticle.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Tags */}
              <div className="pt-4 border-t border-[#E8DFD3] flex flex-wrap gap-2">
                {activeArticle.tags.map(tag => (
                  <span key={tag} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FAF7F2] text-[#635E59] border border-[#E8DFD3]">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Bottom Conversion Action */}
              <div className="pt-6 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#7A746E] text-center sm:text-left">
                  Need a nanny who understands pediatric nutrition & Red Cross safety protocols?
                </div>
                <button
                  onClick={() => {
                    setActiveArticle(null);
                    onOpenBooking();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-xs sm:text-sm shadow-md"
                >
                  Book a 3-Day Nanny Trial
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
};
