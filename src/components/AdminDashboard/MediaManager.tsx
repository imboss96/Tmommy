import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  Pencil,
  Search, 
  ExternalLink,
  Tag,
  Info,
  Layers3
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { MediaItem } from '../../types';
import { DEFAULT_MEDIA } from '../../data/defaultMedia';
import { DEFAULT_CORE_SERVICE_CATEGORIES, getCoreServiceCategories, saveCoreServiceCategories, CoreServiceCategory } from '../../data/coreServiceCategories';

const MAX_UPLOAD_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

function readCompressedImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to read the selected image.'));
        return;
      }

      const image = new Image();
      image.onerror = () => reject(new Error('The selected file is not a valid image.'));
      image.onload = () => {
        const scale = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Your browser could not prepare the image for upload.'));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export const MediaManager: React.FC = () => {
  const { mediaItems, addMediaItem, updateMediaItem, deleteMediaItem } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [coreCategoryDrafts, setCoreCategoryDrafts] = useState<CoreServiceCategory[]>(() => getCoreServiceCategories());

  // New photo modal
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'staff' | 'insights' | 'estate' | 'general'>('staff');
  const [newTags, setNewTags] = useState('');
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editCategory, setEditCategory] = useState<MediaItem['category']>('general');
  const [editTags, setEditTags] = useState('');
  const [heroDrafts, setHeroDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      ['hero-slide-1', 'hero-slide-2', 'hero-slide-3'].map(id => [
        id,
        DEFAULT_MEDIA.find(item => item.id === id)?.url || ''
      ])
    )
  );

  const categories = [
    { value: 'all', label: 'All Photos' },
    { value: 'staff', label: 'Domestic Staff Profiles' },
    { value: 'insights', label: 'Insights & Nutrition' },
    { value: 'estate', label: 'Nairobi Estates' },
    { value: 'general', label: 'General & Academy' }
  ];

  const filteredMedia = mediaItems.filter(item => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.title.toLowerCase().includes(q) || 
      item.tags.some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(prev => prev === id ? null : prev);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    void readCompressedImage(file).then(url => {
        setNewUrl(url);
        if (!newTitle) {
          setNewTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
    }).catch(error => {
      console.error('Gallery image preparation failed:', error);
    });
  };

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);
    addMediaItem({
      title: newTitle || 'Uploaded Frontend Photo',
      url: newUrl,
      category: newCategory,
      tags: tagsArray.length > 0 ? tagsArray : ['frontend', 'photo'],
      dimensions: 'High-Res'
    });

    setIsAdding(false);
    setNewTitle('');
    setNewUrl('');
    setNewTags('');
  };

  const openEditMedia = (item: MediaItem) => {
    setEditingMedia(item);
    setEditTitle(item.title);
    setEditUrl(item.url);
    setEditCategory(item.category);
    setEditTags(item.tags.join(', '));
  };

  const closeEditMedia = () => {
    setEditingMedia(null);
    setEditTitle('');
    setEditUrl('');
    setEditTags('');
  };

  const handleEditFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    void readCompressedImage(file).then(setEditUrl).catch(error => {
      console.error('Gallery image preparation failed:', error);
    });
  };

  const handleUpdateMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia || !editUrl.trim()) return;

    updateMediaItem(editingMedia.id, {
      title: editTitle.trim() || editingMedia.title,
      url: editUrl.trim(),
      category: editCategory,
      tags: editTags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
    closeEditMedia();
  };

  const getHeroMedia = (id: string) => mediaItems.find(item => item.id === id) || DEFAULT_MEDIA.find(item => item.id === id);

  const handleCoreCategoryImageUpdate = (id: string, image: string) => {
    const next = coreCategoryDrafts.map((category) => category.id === id ? { ...category, image } : category);
    setCoreCategoryDrafts(next);
    saveCoreServiceCategories(next);
  };

  const handleCoreCategoryFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    void readCompressedImage(file).then(image => {
      handleCoreCategoryImageUpdate(id, image);
    }).catch(error => {
      console.error('Gallery image preparation failed:', error);
    });
  };

  const saveCoreCategoryEdits = () => {
    saveCoreServiceCategories(coreCategoryDrafts);
    window.location.reload();
  };

  const handleHeroFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    void readCompressedImage(file).then(image => {
      setHeroDrafts(prev => ({ ...prev, [id]: image }));
      updateMediaItem(id, { url: image });
    }).catch(error => {
      console.error('Gallery image preparation failed:', error);
    });
  };

  const saveHeroImage = (id: string) => {
    const url = heroDrafts[id]?.trim();
    if (!url) return;
    updateMediaItem(id, { url });
  };

  return (
    <div className="space-y-6">

      {/* Hero slider controls */}
      <section className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <ImageIcon className="w-5 h-5 text-[#D96B43] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold font-['Outfit'] text-[#1A201C]">Homepage Hero Slider</h2>
            <p className="text-xs text-[#635E59] mt-0.5">Replace the three images shown in the homepage hero carousel. Changes appear on the public website immediately.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['hero-slide-1', 'hero-slide-2', 'hero-slide-3'].map((id, index) => {
            const heroMedia = getHeroMedia(id);
            return (
              <div key={id} className="rounded-xl border border-[#E8DFD3] overflow-hidden bg-[#FAF7F2]">
                <div className="relative h-36 bg-[#EFE9DF]">
                  <img src={heroDrafts[id] || heroMedia?.url} alt={`Hero slide ${index + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/65 text-white text-[10px] font-bold uppercase">Slide {index + 1}</span>
                </div>
                <div className="p-3 space-y-2">
                  <input
                    type="url"
                    value={heroDrafts[id] || ''}
                    onChange={e => setHeroDrafts(prev => ({ ...prev, [id]: e.target.value }))}
                    placeholder="Paste image URL"
                    className="w-full px-2.5 py-2 bg-white border border-[#D5C9BA] rounded-lg text-[11px] font-mono"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => saveHeroImage(id)} className="flex-1 px-2 py-2 rounded-lg bg-[#1D432D] text-white text-[11px] font-bold hover:bg-[#163322]">Save Image</button>
                    <label className="inline-flex items-center justify-center px-2.5 rounded-lg border border-[#D5C9BA] bg-white text-[#1D432D] cursor-pointer" title="Upload replacement image">
                      <Upload className="w-3.5 h-3.5" />
                      <input type="file" accept="image/*" onChange={e => handleHeroFileUpload(id, e)} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      
      {/* Header */}
      <section className="bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <Layers3 className="w-5 h-5 text-[#D96B43] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold font-['Outfit'] text-[#1A201C]">Core Service Category Images</h2>
            <p className="text-xs text-[#635E59] mt-0.5">Update the images for each service card on the homepage. These values are stored in the browser and used instantly.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {coreCategoryDrafts.map((category) => (
            <div key={category.id} className="rounded-xl border border-[#E8DFD3] overflow-hidden bg-[#FAF7F2]">
              <div className="relative h-32 bg-[#EFE9DF]">
                <img src={category.image} alt={category.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 space-y-2">
                <div className="text-[11px] font-bold text-[#1A201C]">{category.title}</div>
                <input
                  type="url"
                  value={category.image}
                  onChange={(e) => handleCoreCategoryImageUpdate(category.id, e.target.value)}
                  placeholder="Paste image URL"
                  className="w-full px-2.5 py-2 bg-white border border-[#D5C9BA] rounded-lg text-[11px] font-mono"
                />
                <div className="grid grid-cols-2 gap-2">
                  <label className="inline-flex items-center justify-center gap-1 px-2 py-2 rounded-lg border border-[#D5C9BA] bg-white text-[#1D432D] text-[10px] font-bold cursor-pointer">
                    <Upload className="w-3 h-3" />
                    Upload
                    <input type="file" accept="image/*" onChange={(e) => handleCoreCategoryFileUpload(category.id, e)} className="hidden" />
                  </label>
                  <select
                    value={category.image}
                    onChange={(e) => handleCoreCategoryImageUpdate(category.id, e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-[#D5C9BA] bg-white text-[10px] font-bold text-[#1A201C]"
                    aria-label={`Choose image for ${category.title}`}
                  >
                    <option value="">Choose gallery image</option>
                    {mediaItems.map((item) => (
                      <option key={item.id} value={item.url}>{item.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={saveCoreCategoryEdits} className="px-4 py-2 rounded-lg bg-[#1D432D] text-white text-xs font-bold hover:bg-[#163322]">
            Save core category images
          </button>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8DFD3] shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-['Outfit'] text-[#1A201C] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#D96B43]" />
            <span>Frontend Photo & Media Gallery</span>
          </h2>
          <p className="text-xs text-[#635E59] mt-0.5">
            Post and update photos across the website. Copy photo links with 1 click to use in blog posts, staff profiles, or banners.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-xs rounded-xl shadow-md shadow-[#D96B43]/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Upload / Add New Photo</span>
        </button>
      </div>

      {/* Quick instructions banner */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#D96B43] shrink-0 mt-0.5" />
        <div className="text-xs text-[#524D47] leading-relaxed">
          <strong className="text-[#1A201C]">How to use frontend photos:</strong> Upload photos from your computer or paste any image link. Click <strong>"Copy Image Link"</strong> on any card to insert it directly into new blog articles or nanny profiles.
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D766D]" />
          <input
            type="text"
            placeholder="Search photos by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E8DFD3] rounded-xl focus:ring-2 focus:ring-[#D96B43] text-[#1A201C]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map(c => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === c.value
                  ? 'bg-[#1D432D] text-white'
                  : 'bg-white text-[#524D47] border border-[#E8DFD3] hover:bg-[#FAF7F2]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map(item => (
          <div 
            key={item.id}
            className="bg-white rounded-2xl border border-[#E8DFD3] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-44 w-full bg-[#FAF7F2] overflow-hidden">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase">
                  {item.category}
                </span>
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/90 text-[#1A201C] text-[10px] font-semibold">
                  {item.uploadedAt}
                </span>
              </div>

              <div className="p-3.5 space-y-1.5">
                <h4 className="font-bold text-xs text-[#1A201C] line-clamp-1" title={item.title}>
                  {item.title}
                </h4>

                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#7D766D] text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-[#FAF7F2] border-t border-[#E8DFD3] flex items-center justify-between gap-1.5">
              <button
                onClick={() => openEditMedia(item)}
                className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white border border-[#D5C9BA] hover:bg-[#F2ECE1] text-[#1D432D] text-xs font-bold"
                title="Edit Photo"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleCopy(item.id, item.url)}
                className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  copiedId === item.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-[#D5C9BA] hover:bg-[#F2ECE1] text-[#1A201C]'
                }`}
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#1D432D]" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete photo "${item.title}"?`)) {
                    deleteMediaItem(item.id);
                  }
                }}
                className="p-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-red-600"
                title="Delete Photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredMedia.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-[#D5C9BA]">
            <ImageIcon className="w-10 h-10 text-[#D5C9BA] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1A201C]">No photos found</p>
            <p className="text-xs text-[#7D766D] mt-1">Upload a photo to expand the frontend media gallery.</p>
          </div>
        )}
      </div>

      {/* EDIT PHOTO MODAL */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5C9BA] max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-4 bg-[#1D432D] text-white flex items-center justify-between">
              <h3 className="font-bold text-base font-['Outfit'] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-emerald-300" />
                <span>Edit Photo</span>
              </h3>
              <button onClick={closeEditMedia} className="p-1 text-white/80 hover:text-white" aria-label="Close edit photo dialog">✕</button>
            </div>

            <form onSubmit={handleUpdateMedia} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-[#7D766D] tracking-wider mb-1">Photo Title / Description</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[#7D766D] tracking-wider mb-1">Photo Category</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value as MediaItem['category'])}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-semibold"
                >
                  <option value="staff">Domestic Staff Profile</option>
                  <option value="insights">Insights & Nutrition Article</option>
                  <option value="estate">Nairobi Estate & Residence</option>
                  <option value="general">General & Training</option>
                </select>
              </div>

              <div className="space-y-2 p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3]">
                <label className="block font-bold uppercase text-[#7D766D] tracking-wider">Photo Source</label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={e => setEditUrl(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#D5C9BA] rounded-xl text-xs font-mono"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#7D766D]">Or upload a replacement:</span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5C9BA] hover:bg-[#F2ECE1] rounded-xl text-xs font-bold cursor-pointer text-[#1D432D]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse Files</span>
                    <input type="file" accept="image/*" onChange={handleEditFileUpload} className="hidden" />
                  </label>
                </div>
                {editUrl && <img src={editUrl} alt="Edited photo preview" className="w-full h-32 object-cover rounded-lg border border-[#D5C9BA]" />}
              </div>

              <div>
                <label className="block font-bold uppercase text-[#7D766D] tracking-wider mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DFD3] flex justify-end gap-2">
                <button type="button" onClick={closeEditMedia} className="px-4 py-2 rounded-xl border border-[#D5C9BA] text-[#524D47] font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD / ADD PHOTO MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#D5C9BA] max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-4 bg-[#1D432D] text-white flex items-center justify-between">
              <h3 className="font-bold text-base font-['Outfit'] flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-300" />
                <span>Upload or Add Frontend Photo</span>
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMedia} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  Photo Title / Description *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Baby Weaning Avocado Bowl"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  Photo Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs font-semibold"
                >
                  <option value="staff">Domestic Staff Profile</option>
                  <option value="insights">Insights & Nutrition Article</option>
                  <option value="estate">Nairobi Estate & Residence</option>
                  <option value="general">General & Training</option>
                </select>
              </div>

              {/* URL or Upload */}
              <div className="space-y-2 p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3]">
                <label className="block font-bold uppercase text-[#7D766D] tracking-wider">
                  Photo Source (File Upload or Image URL) *
                </label>
                
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-white border border-[#D5C9BA] rounded-xl text-xs font-mono"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#7D766D]">Or pick a local image file:</span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5C9BA] hover:bg-[#F2ECE1] rounded-xl text-xs font-bold cursor-pointer text-[#1D432D]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse Files</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {newUrl && (
                  <div className="pt-2">
                    <img
                      src={newUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border border-[#D5C9BA]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold uppercase text-[#7D766D] tracking-wider mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="nanny, nutrition, kilimani, baby"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D5C9BA] rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DFD3] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5C9BA] text-[#524D47] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold shadow-md shadow-[#D96B43]/20"
                >
                  Add Photo to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
