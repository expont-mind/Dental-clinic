-- Add IT Doctor dentist ID mapping to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS itdoctor_dentist_id integer UNIQUE;

COMMENT ON COLUMN doctors.itdoctor_dentist_id IS 'Maps to IT Doctor API dentist ID for online booking';
