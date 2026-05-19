-- Add IT Doctor service ID mapping to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS itdoctor_service_id integer UNIQUE;

COMMENT ON COLUMN services.itdoctor_service_id IS 'Maps to IT Doctor API service ID for online booking';
