"use client";

type ServiceOption = { id: string; name_mn: string; name_en: string };

export function ServicePicker({
  services,
  defaultIds = [],
}: {
  services: ServiceOption[];
  defaultIds?: string[];
}) {
  if (services.length === 0) return null;
  const selected = new Set(defaultIds);

  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">
        Үйлчилгээ
      </label>
      <p className="mb-2 text-[11px] text-[#6b7280]">
        Энэ эмч ямар үйлчилгээ хийдгийг сонгоно уу. Booking хуудсанд шүүлтэд ашиглагдана.
      </p>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-[#fafbfc] p-3">
        {services.map((s) => (
          <label
            key={s.id}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-[#0f172a] has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary cursor-pointer"
          >
            <input
              type="checkbox"
              name="service_ids"
              value={s.id}
              defaultChecked={selected.has(s.id)}
              className="h-3.5 w-3.5 rounded border-line text-primary focus:ring-primary"
            />
            <span>{s.name_mn}</span>
            <span className="text-[10px] font-normal text-[#9ca3af]">/ {s.name_en}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
