import Link from "next/link";

export default function PublicNotFound() {
  return (
    <div className="bg-bg">
      <section className="relative overflow-hidden bg-primary-soft">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        />
        <div className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            ◦ 404
          </p>
          <p className="font-script mt-2 text-[34px] leading-none text-primary sm:text-[44px]">
            Уучлаарай
          </p>
          <h1 className="mt-2 text-[36px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[56px]">
            Хуудас олдсонгүй
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[14px] leading-7 text-muted sm:text-[15px]">
            Таны хайсан хуудас байхгүй эсвэл хаягийг шилжүүлсэн байж магадгүй.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/mn"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              Нүүр хуудас →
            </Link>
            <Link
              href="/mn/contact"
              className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-ink hover:text-white transition-colors"
            >
              Холбоо барих
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
