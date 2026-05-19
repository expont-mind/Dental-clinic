-- Add rich content columns to services table
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS icon_key text,
  ADD COLUMN IF NOT EXISTS long_description_mn text,
  ADD COLUMN IF NOT EXISTS long_description_en text,
  ADD COLUMN IF NOT EXISTS duration_text_mn text,
  ADD COLUMN IF NOT EXISTS duration_text_en text,
  ADD COLUMN IF NOT EXISTS price_text_mn text,
  ADD COLUMN IF NOT EXISTS price_text_en text,
  ADD COLUMN IF NOT EXISTS content_mn jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS content_en jsonb DEFAULT '{}';

COMMENT ON COLUMN services.content_mn IS 'JSONB: {treatments: [], benefits: [{title,body}], faq: [{q,a}], pricing: [{label,price,note?}]}';
COMMENT ON COLUMN services.content_en IS 'Same structure as content_mn but in English';
