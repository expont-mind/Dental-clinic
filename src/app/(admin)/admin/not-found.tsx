import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="relative min-h-[60vh] overflow-hidden bg-primary-soft">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl"
      />
      <div className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          ◦ 404
        </p>
        <h1 className="mt-3 text-[36px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[52px]">
          Хуудас олдсонгүй
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[14px] leading-7 text-muted sm:text-[15px]">
          Таны хайсан хуудас байхгүй байна.
        </p>
        <Link
          href="/admin"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
        >
          Хяналт руу буцах →
        </Link>
      </div>
    </div>
  );
}
