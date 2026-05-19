import { notFound } from "next/navigation";
import { hasLocale, getDictionary } from "@/lib/i18n/dictionaries";
import { PaymentPoller } from "@/components/booking/PaymentPoller";

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    id?: string;
    qr?: string;
    amount?: string;
    service?: string;
  }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const sp = await searchParams;

  if (!sp.id || !sp.qr) notFound();

  const amount = Number(sp.amount || 0);
  const isMn = lang === "mn";

  return (
    <div className="mx-auto max-w-lg px-5 py-12 sm:px-8 sm:py-20">
      <div className="text-center">
        <span
          aria-hidden
          className="inline-grid h-14 w-14 place-items-center rounded-full bg-accent/20 text-accent"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </span>
        <h1 className="font-display mt-5 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
          {isMn ? "Төлбөр төлөх" : "Payment"}
        </h1>
        <p className="mt-2 text-muted">
          {isMn
            ? "QPay апп-аар QR кодыг уншуулна уу"
            : "Scan the QR code with your QPay app"}
        </p>
      </div>

      {/* Amount badge */}
      {amount > 0 && (
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-5 py-2 text-lg font-bold text-primary">
            {amount.toLocaleString()}₮
          </span>
          {sp.service && (
            <p className="mt-2 text-[13px] text-muted">{sp.service}</p>
          )}
        </div>
      )}

      {/* QR Code */}
      <div className="mt-8 flex justify-center">
        <div className="overflow-hidden rounded-3xl border border-line bg-white p-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${sp.qr}`}
            alt="QPay QR Code"
            width={280}
            height={280}
            className="h-[280px] w-[280px]"
          />
        </div>
      </div>

      {/* Payment status poller */}
      <PaymentPoller
        pendingId={sp.id}
        lang={lang}
        checkingLabel={isMn ? "Төлбөр шалгаж байна..." : "Checking payment..."}
        expiredLabel={isMn ? "Хугацаа дууссан. Дахин оролдоно уу." : "Payment expired. Please try again."}
        failedLabel={isMn ? "Алдаа гарлаа. Төлбөр хийгдсэн бол манай утсанд залгана уу." : "Something went wrong. If you paid, please call us."}
      />

      <p className="mt-8 text-center text-[12px] text-muted">
        {isMn
          ? "15 минутын дотор төлбөрөө хийнэ үү. Хугацаа хэтэрвэл захиалга цуцлагдана."
          : "Please complete payment within 15 minutes or the booking will be cancelled."}
      </p>
    </div>
  );
}
