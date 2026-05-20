import Link from "next/link";
import { listActiveServicesPublic } from "@/lib/queries/catalog";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { ServicesCarousel } from "./ServicesCarousel";

const SERVICE_LIST = [
  "Шүдний гажиг засал",
  "Согог засал",
  "Мэс засал",
  "Урьдчилан сэргийлэх эмчилгээ",
  "Шүдний эмчилгээ",
  "Хүүхдийн шүдний эмчилгээ",
  "Шүдний гоо заслын эмчилгээ",
  "Тулгуур эдийн эмчилгээ",
];

export async function ServicesGrid({
  lang,
  dict,
}: {
  lang: string;
  dict: Dictionary;
}) {
  await listActiveServicesPublic();

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16 lg:py-24">
      <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        {/* Left: image carousel */}
        <div className="mx-auto w-full max-w-[420px] lg:max-w-none">
          <ServicesCarousel />
        </div>

        {/* Right: copy + numbered services */}
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-primary sm:text-[11px]">
            ◦ {dict.home.services_eyebrow ?? "Бидний үйлчилгээ"}
          </p>
          <h2 className="font-display mt-2 text-[20px] font-extrabold leading-[1.2] tracking-tight text-ink sm:mt-3 sm:text-[26px] lg:text-[32px]">
            Сар бүр <span className="text-primary">2,500+</span> үйлчлүүлэгчийн итгэмжит сонголт
          </h2>
          <p className="mt-4 text-[13.5px] leading-7 text-muted sm:mt-5 sm:text-[14.5px]">
            Сар бүр 2,500 гаруй үйлчлүүлэгч дараах эмчилгээ үйлчилгээг сонгон
            үйлчлүүлж байна.
          </p>

          {/* Numbered service list */}
          <ul className="mt-5 grid gap-x-4 gap-y-2.5 sm:mt-6 sm:gap-x-6 sm:gap-y-3 sm:grid-cols-2">
            {SERVICE_LIST.map((name, i) => (
              <li
                key={name}
                className="flex items-center gap-2.5 text-[12.5px] font-semibold text-ink-2 sm:gap-3 sm:text-[13.5px]"
              >
                <span className="font-display grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[10px] font-extrabold text-primary sm:h-7 sm:w-7 sm:text-[11px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {name}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[13px] leading-6 text-muted sm:mt-6 sm:text-[14px] sm:leading-7">
            Манай эмнэлэг нь шүдний эмчилгээний салбарт дэвшилтэт дижитал
            технологийг, эрүүл мэндийн стандартын дагуу эмчилгээ үйлчилгээндээ
            нэвтрүүлж, хэрэглэгчдэд ойртуулан итгэл даасан үйлчилгээ үзүүлж
            байна.
          </p>

          <p className="font-script mt-3 text-[16px] leading-7 text-primary sm:mt-4 sm:text-[18px] lg:text-[20px]">
            Өөртөө итгэлтэй төгс эрүүл инээмсэглэлийг бид танд бэлэглэх болно.
          </p>

          <Link
            href={`/${lang}/services`}
            className="group mt-5 inline-flex items-center gap-2.5 rounded-full bg-primary py-1.5 pl-5 pr-1.5 text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors sm:mt-6 sm:gap-3 sm:py-2 sm:pl-6 sm:pr-2 sm:text-[14px]"
          >
            {dict.home.services_cta}
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5 sm:h-9 sm:w-9">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 17 17 7M9 7h8v8"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
