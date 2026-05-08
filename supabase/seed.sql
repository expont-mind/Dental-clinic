-- ============================================================================
-- Seed data: 5 departments + 9 doctors + 2 weeks of slots for each doctor.
-- Re-runnable: uses ON CONFLICT to skip duplicates.
-- ============================================================================

insert into public.departments (slug, name_mn, name_en, description_mn, description_en, icon_key, sort_order) values
  ('internal', 'Дотрын тасаг', 'Internal Medicine',
   'Дотрын өвчний оношилгоо, эмчилгээ, урьдчилан сэргийлэх үзлэг.',
   'Diagnosis and care for adult internal medicine conditions.',
   'stethoscope', 1),
  ('pediatrics', 'Хүүхдийн тасаг', 'Pediatrics',
   '0–18 насны хүүхдийн эрүүл мэндийн үйлчилгээ.',
   'Care for infants, children and adolescents.',
   'baby', 2),
  ('cardiology', 'Зүрх судасны төв', 'Cardiology',
   'Зүрх судасны өвчний оношилгоо, ECG, эхо шинжилгээ.',
   'Heart and vascular care including ECG and echocardiography.',
   'heart-pulse', 3),
  ('dermatology', 'Арьс гоо засал', 'Dermatology',
   'Арьс, үс, хумсны өвчний эмчилгээ, гоо заслын үйлчилгээ.',
   'Skin, hair and nail care including aesthetic services.',
   'sparkles', 4),
  ('dental', 'Шүдний эмнэлэг', 'Dentistry',
   'Шүдний цэвэрлэгээ, ломбо, гоо засал.',
   'Cleaning, restoration and cosmetic dental work.',
   'tooth', 5)
on conflict (slug) do nothing;

-- Doctors (department_id resolved via subqueries)
insert into public.doctors (department_id, slug, name_mn, name_en, title_mn, title_en, bio_mn, bio_en, photo_url, years_exp, sort_order) values
  ((select id from public.departments where slug='internal'),
   'b-tuvshintur', 'Б. Түвшинтөр', 'B. Tuvshintur',
   'Дотрын тасгийн эрхлэгч, MD', 'Department Head, MD',
   '15 жил дотрын өвчний эмчилгээний туршлагатай. Зүрх, чихрийн шижин, бөөрний өвчний чиглэлээр.',
   '15 years of internal medicine. Specialises in cardiometabolic and renal conditions.',
   'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80&auto=format&fit=crop', 15, 1),
  ((select id from public.departments where slug='internal'),
   'g-oyuntsetseg', 'Г. Оюунцэцэг', 'G. Oyuntsetseg',
   'Дотрын эмч, MD', 'Internal Medicine, MD',
   'Урьдчилан сэргийлэх үзлэг ба архаг өвчний удирдлага.',
   'Preventive care and chronic disease management.',
   'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80&auto=format&fit=crop', 8, 2),
  ((select id from public.departments where slug='pediatrics'),
   'm-saruul', 'М. Саруул', 'M. Saruul',
   'Хүүхдийн эмч, MD', 'Pediatrician, MD',
   'Нярай ба бага насны хүүхдийн эрүүл мэнд, дархлаажуулалт.',
   'Newborn and early-childhood care, immunisation.',
   'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=600&q=80&auto=format&fit=crop', 10, 1),
  ((select id from public.departments where slug='pediatrics'),
   'd-naranbat', 'Д. Наранбат', 'D. Naranbat',
   'Хүүхдийн эмч', 'Pediatrician',
   'Хүүхдийн амьсгалын замын өвчин, харшил.',
   'Pediatric respiratory and allergy care.',
   'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80&auto=format&fit=crop', 6, 2),
  ((select id from public.departments where slug='cardiology'),
   's-batjargal', 'С. Батжаргал', 'S. Batjargal',
   'Зүрх судасны төвийн дарга, MD, PhD', 'Cardiology Director, MD, PhD',
   '20 жилийн туршлагатай. Эхокардиографи ба катетерийн оношилгоо.',
   '20 years experience. Echocardiography and interventional diagnostics.',
   'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80&auto=format&fit=crop', 20, 1),
  ((select id from public.departments where slug='cardiology'),
   'b-altantsetseg', 'Б. Алтанцэцэг', 'B. Altantsetseg',
   'Зүрхний эмч, MD', 'Cardiologist, MD',
   'Артерийн даралт, зүрхний хэмнэлийн өөрчлөлт.',
   'Hypertension and arrhythmia care.',
   'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&q=80&auto=format&fit=crop', 11, 2),
  ((select id from public.departments where slug='dermatology'),
   'e-undral', 'Э. Үндрал', 'E. Undral',
   'Арьсны эмч, MD', 'Dermatologist, MD',
   'Эмчилгээний дерматологи ба laser гоо засал.',
   'Medical dermatology and laser aesthetics.',
   'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&q=80&auto=format&fit=crop', 9, 1),
  ((select id from public.departments where slug='dental'),
   't-bayasgalan', 'Т. Баясгалан', 'T. Bayasgalan',
   'Шүдний их эмч', 'Senior Dentist',
   'Гоо засал, имплант, ломбо.',
   'Cosmetic dentistry, implants, restorative work.',
   'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&q=80&auto=format&fit=crop', 12, 1),
  ((select id from public.departments where slug='dental'),
   'p-enkhtuya', 'П. Энхтуяа', 'P. Enkhtuya',
   'Шүдний эмч', 'Dentist',
   'Хүүхдийн шүдний эмчилгээ.',
   'Pediatric dentistry.',
   'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=600&q=80&auto=format&fit=crop', 7, 2)
on conflict (slug) do nothing;

-- Generate 2 weeks of slots starting tomorrow for every active doctor
do $$
declare
  d record;
begin
  for d in select id from public.doctors where is_active loop
    perform public.generate_slots(
      d.id,
      (current_date + 1)::date,
      (current_date + 14)::date,
      '09:00'::time,
      '17:00'::time,
      30,
      true
    );
  end loop;
end$$;
