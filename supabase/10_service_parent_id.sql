-- Add parent-child hierarchy to services
ALTER TABLE services ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES services(id);
CREATE INDEX IF NOT EXISTS idx_services_parent_id ON services(parent_id);

COMMENT ON COLUMN services.parent_id IS 'Parent service ID for category grouping. NULL = top-level category.';
