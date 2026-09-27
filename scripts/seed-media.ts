import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_CORE_SERVICE_CATEGORIES } from '../src/data/coreServiceCategories';
import { DEFAULT_MEDIA } from './defaultDemoMedia';
import { DEMO_CORE_CATEGORY_IMAGES } from './demoImageUrls';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('YOUR_') || serviceRoleKey.includes('YOUR_')) {
  throw new Error('Set real SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY values in .env.local before seeding media.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const coreCategoryMedia = DEFAULT_CORE_SERVICE_CATEGORIES.map(category => ({
  id: `core-category-${category.id}`,
  title: category.title,
  url: DEMO_CORE_CATEGORY_IMAGES[category.id],
  category: 'general',
  tags: ['core-service-category', category.id],
  dimensions: 'Homepage category',
  uploaded_at: '2025-01-01'
}));

const mediaRows = [
  ...DEFAULT_MEDIA.map(media => ({
    id: media.id,
    title: media.title,
    url: media.url,
    category: media.category,
    tags: media.tags,
    dimensions: media.dimensions,
    uploaded_at: media.uploadedAt
  })),
  ...coreCategoryMedia
];

const { error } = await supabase
  .from('media_items')
  .upsert(mediaRows, { onConflict: 'id', ignoreDuplicates: true });

if (error) throw new Error(`media_items: ${error.message}`);
console.log(`Seeded ${mediaRows.length} demo image record(s), preserving any existing media IDs.`);
