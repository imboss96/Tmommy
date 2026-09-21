import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  BookOpen, 
  Clock, 
  Tag, 
  Sparkles, 
  Check, 
  X, 
  Image as ImageIcon,
  ExternalLink,
  Upload,
  AlertCircle
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { ParentingInsight } from '../../types';

export const PostsManager: React.FC = () => {
  const { insights, addInsight, updateInsight, deleteInsight, mediaItems } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [editingPost, setEditingPost] = useState<ParentingInsight | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewPost, setPreviewPost] = useState<ParentingInsight | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<ParentingInsight>>({
    title: '',
    category: 'Infant Nutrition',
    excerpt: '',
    readTime: '5 min read',
    publishedDate: new Date().toISOString().split('T')[0],
    coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop',
    author: {
      name: 'Dr. Stella Njoki, MD',
      role: 'Consultant Pediatrician & Child Health Advisor',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop'
    },
    tags: ['Nairobi Parenting', 'Nutrition'],
    keyTakeaways: ['Key advice point 1', 'Key advice point 2'],
    content: ['First paragraph of the guide...', 'Second paragraph of actionable advice...'],
    relatedNairobiTopic: 'Nairobi Infant Health & Wellbeing'
  });

  // Helper string states for tags/takeaways/content textareas
  const [tagsInput, setTagsInput] = useState('');
  const [takeawaysInput, setTakeawaysInput] = useState('');
  const [contentInput, setContentInput] = useState('');

  const categories = ['All', 'Infant Nutrition', 'Developmental Milestones', 'Childcare & Safety', 'Nanny Management'];

  const filteredPosts = insights.filter(post => {
    const matchesCat = categoryFilter === 'All' || post.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      post.title.toLowerCase().includes(q) || 
      post.excerpt.toLowerCase().includes(q) ||
      post.tags.some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      category: 'Infant Nutrition',
      excerpt: '',
      readTime: '5 min read',
      publishedDate: new Date().toISOString().split('T')[0],
      coverImage: 'https://images.unsplash.com/photo-1594488518001-0810787e8fd0?q=80&w=1000&auto=format&fit=crop',
      author: {
        name: 'Dr. Stella Njoki, MD',
        role: 'Consultant Pediatrician & Child Health Advisor',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop'
      },
      tags: ['Nairobi Parenting'],
      keyTakeaways: ['Clear communication with your domestic staff ensures consistent care.'],
      content: ['Introduce local ingredients carefully and keep a daily feeding log.'],
      relatedNairobiTopic: 'Kenyan Infant Development'
    });
    setTagsInput('Nairobi Parenting, Infant Health');
    setTakeawaysInput('Clear communication with your domestic staff ensures consistent care.\nPrioritize pediatric-certified first aid training.');
    setContentInput('Introduce local ingredients carefully and keep a daily feeding log.\nCoordinate with your nanny to maintain strict hygiene standards in your home kitchen.');
    setEditingPost(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (post: ParentingInsight) => {
    setEditingPost(post);
    setFormData(post);
    setTagsInput(post.tags.join(', '));
    setTakeawaysInput(post.keyTakeaways.join('\n'));
    setContentInput(post.content.join('\n\n'));
    setIsCreating(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const parsedTakeaways = takeawaysInput.split('\n').map(t => t.trim()).filter(Boolean);
    const parsedContent = contentInput.split('\n\n').map(c => c.trim()).filter(Boolean);

    const payload: Partial<ParentingInsight> = {
      ...formData,
      tags: parsedTags.length > 0 ? parsedTags : ['Nairobi Parenting'],
      keyTakeaways: parsedTakeaways.length > 0 ? parsedTakeaways : ['Key advice for parents.'],
      content: parsedContent.length > 0 ? parsedContent : ['Guide content details.']
    };

    if (editingPost) {
      updateInsight(editingPost.id, payload);
    } else {
      addInsight(payload);
    }

    setIsCreating(false);
    setEditingPost(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to Base64 Data URL for persistent storage
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-['Outfit'] text-[#1A201C] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D96B43]" />
            <span>Parenting & Household Posts Manager</span>
          </h2>
          <p className="text-xs text-[#635E59] mt-0.5">
            Create, edit, and publish expert guides, nutrition articles, and household advice. Updates reflect immediately on the live website.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-xs rounded-xl shadow-md shadow-[#D96B43]/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Post</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D766D]" />
          <input
            type="text"
            placeholder="Search posts by title, tag, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E8DFD3] rounded-xl focus:ring-2 focus:ring-[#D96B43] text-[#1A201C]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#1D432D] text-white'
                  : 'bg-white text-[#524D47] border border-[#E8DFD3] hover:bg-[#FAF7F2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPosts.map(post => (
          <div 
            key={post.id}
            className="bg-white rounded-2xl border border-[#E8DFD3] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 w-full overflow-hidden bg-[#FAF7F2]">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  {post.category}
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/90 text-[#1A201C] text-[10px] font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D96B43]" />
                  {post.readTime}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-[#1A201C] line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-[#635E59] line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-[#F2ECE1]">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-[#1A201C] block">{post.author.name}</span>
                    <span className="text-[#7D766D]">{post.publishedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F2] border-t border-[#E8DFD3] flex items-center justify-between gap-2">
              <button
                onClick={() => setPreviewPost(post)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D432D] hover:underline"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(post)}
                  className="p-1.5 rounded-lg bg-white border border-[#E8DFD3] hover:bg-[#F2ECE1] text-[#1A201C] transition-colors"
                  title="Edit Post"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                      deleteInsight(post.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                  title="Delete Post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-[#D5C9BA]">
            <BookOpen className="w-10 h-10 text-[#D5C9BA] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1A201C]">No posts found</p>
            <p className="text-xs text-[#7D766D] mt-1">Try adjusting your search query or publish a new article.</p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5C9BA] max-w-3xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 bg-[#1D432D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-['Outfit']">
                    {editingPost ? 'Edit Post & Guidance Article' : 'Create & Publish New Post'}
                  </h3>
                  <p className="text-xs text-white/80">Manage blog content, upload cover photos, and set takeaways</p>
                </div>
              </div>

              <button
                onClick={() => setIsCreating(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
              
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Post Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Traditional Kenyan Weaning Foods & Infant Nutrition"
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#D96B43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category || 'Infant Nutrition'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#D96B43]"
                  >
                    <option value="Infant Nutrition">Infant Nutrition</option>
                    <option value="Developmental Milestones">Developmental Milestones</option>
                    <option value="Childcare & Safety">Childcare & Safety</option>
                    <option value="Nanny Management">Nanny Management</option>
                  </select>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  Short Excerpt / Meta Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Summary for cards and SEO search snippets..."
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#D96B43]"
                />
              </div>

              {/* Cover Image URL / File Upload */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2">
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#D96B43]" />
                    Cover Photo (URL or Device Upload) *
                  </span>
                  <span className="text-[11px] text-[#7D766D] normal-case">Recommended: 1200x800px</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    required
                    value={formData.coverImage || ''}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2 bg-white border border-[#D5C9BA] rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#D96B43]"
                  />

                  <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[#D5C9BA] hover:bg-[#F2ECE1] rounded-xl text-xs font-semibold cursor-pointer text-[#1A201C] transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5 text-[#1D432D]" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.coverImage && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={formData.coverImage}
                      alt="Cover Preview"
                      className="w-16 h-12 object-cover rounded-lg border border-[#D5C9BA]"
                    />
                    <span className="text-[11px] text-[#635E59]">Photo preview loaded</span>
                  </div>
                )}
              </div>

              {/* Author Details & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.author?.name || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      author: { ...formData.author!, name: e.target.value } 
                    })}
                    placeholder="Dr. Stella Njoki, MD"
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#D96B43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Author Role / Credential
                  </label>
                  <input
                    type="text"
                    value={formData.author?.role || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      author: { ...formData.author!, role: e.target.value } 
                    })}
                    placeholder="Consultant Pediatrician"
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#D96B43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={formData.readTime || ''}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="5 min read"
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#D96B43]"
                  />
                </div>
              </div>

              {/* Tags & Related Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Weaning, Nutrition, Porridge, Kilimani"
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#D96B43]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                    Nairobi Regional Context
                  </label>
                  <input
                    type="text"
                    value={formData.relatedNairobiTopic || ''}
                    onChange={(e) => setFormData({ ...formData, relatedNairobiTopic: e.target.value })}
                    placeholder="e.g. Karen & Kilimani Pediatric Weaning"
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#D96B43]"
                  />
                </div>
              </div>

              {/* Key Takeaways */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  Key Takeaways (One per line)
                </label>
                <textarea
                  rows={2}
                  value={takeawaysInput}
                  onChange={(e) => setTakeawaysInput(e.target.value)}
                  placeholder="Key point 1&#10;Key point 2"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#D96B43]"
                />
              </div>

              {/* Full Article Content (Paragraphs) */}
              <div>
                <label className="block text-xs font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  Full Article Content (Separate paragraphs with double Enter / blank line)
                </label>
                <textarea
                  rows={6}
                  required
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  placeholder="Paragraph 1...&#10;&#10;Paragraph 2...&#10;&#10;Paragraph 3..."
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#D96B43]"
                />
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
                  {editingPost ? 'Save Updates' : 'Publish Article'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5C9BA] max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-[#1D432D] text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Live Post Preview</span>
              <button
                onClick={() => setPreviewPost(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <img
                src={previewPost.coverImage}
                alt={previewPost.title}
                className="w-full h-56 object-cover rounded-2xl"
              />
              <span className="px-2.5 py-1 rounded-full bg-[#E8F0EA] text-[#1D432D] text-xs font-bold">
                {previewPost.category}
              </span>
              <h2 className="text-2xl font-bold font-['Outfit'] text-[#1A201C]">
                {previewPost.title}
              </h2>
              <p className="text-xs font-semibold text-[#D96B43]">{previewPost.author.name} • {previewPost.publishedDate}</p>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2">
                <h4 className="text-xs font-bold uppercase text-[#1D432D]">Key Takeaways:</h4>
                <ul className="space-y-1 text-xs text-[#524D47]">
                  {previewPost.keyTakeaways.map((k, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-[#3D3A36] leading-relaxed">
                {previewPost.content.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DFD3] flex justify-end">
              <button
                onClick={() => setPreviewPost(null)}
                className="px-5 py-2 rounded-xl bg-[#1D432D] text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
