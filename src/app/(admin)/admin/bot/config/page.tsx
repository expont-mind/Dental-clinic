import { BotTabs } from "@/components/admin/BotTabs";
import {
  BotConfigForm,
  type FeaturedServiceOption,
} from "@/components/admin/BotConfigForm";
import {
  getBot,
  isConfigured,
  DentexgoError,
  type BotConfig,
} from "@/lib/dentexgo/client";
import { listServicesAdmin } from "@/lib/queries/admin";

export default async function AdminBotConfigPage() {
  let data: BotConfig | null = null;
  let services: FeaturedServiceOption[] = [];
  let errorMessage: string | null = null;

  if (!isConfigured()) {
    errorMessage =
      "Dentexgo тохиргоо ороогүй байна. .env-д DENTEXGO_SHARED_SECRET болон CLINIC_SLUG-г оруулна уу.";
  } else {
    const [botRes, servicesRes] = await Promise.allSettled([
      getBot(),
      listServicesAdmin(),
    ]);
    if (botRes.status === "fulfilled") {
      data = botRes.value;
    } else {
      console.error("[admin/bot/config] getBot failed:", botRes.reason);
      const e = botRes.reason;
      errorMessage =
        e instanceof DentexgoError
          ? `${e.code}: ${e.message}`
          : e instanceof Error
            ? e.message
            : "Алдаа гарлаа.";
    }
    if (servicesRes.status === "fulfilled") {
      services = servicesRes.value
        .filter((s) => s.is_active && s.is_featured)
        .map((s) => ({
          id: s.id,
          slug: s.slug,
          name_mn: s.name_mn,
          name_en: s.name_en,
        }));
    } else {
      console.error("[admin/bot/config] listServicesAdmin failed:", servicesRes.reason);
    }
  }

  return (
    <div>
      <header className="flex items-center justify-between gap-4 border-b border-line bg-white/90 px-6 py-5 backdrop-blur sm:px-10">
        <div>
          <h1 className="font-display text-[20px] font-extrabold uppercase tracking-tight text-[#0f172a] sm:text-[24px]">
            Бот
          </h1>
          <p className="mt-0.5 text-[12px] text-[#6b7280]">
            Ботын хэллэг, дүрэм, утасны бодлого
          </p>
        </div>
      </header>

      <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
        <BotTabs active="config" />

        {errorMessage && (
          <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
            {errorMessage}
          </p>
        )}

        {data && !errorMessage && (
          <>
            {/* Persona form */}
            <div className="rounded-[22px] bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] sm:p-8">
              <BotConfigForm
                persona={data.persona}
                featuredServices={services}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
