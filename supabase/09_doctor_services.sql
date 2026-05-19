-- Junction table: which doctors perform which services
CREATE TABLE IF NOT EXISTS doctor_services (
  doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, service_id)
);
