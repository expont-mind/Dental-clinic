import type { Dictionary } from "@/lib/i18n/dictionaries";

const ICONS = [
  // Insurance / shield
  "M12 2l8 3v7c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3z",
  // Expert / star+person
  "M12 2l2.9 6.9L22 9.7l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.5L2 9.7l7.1-.8z",
  // Pain-free / smile
  "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
];

export function CareCards({ dict }: { dict: Dictionary }) {
  const cards = dict.home.care_cards;

  return (
    <section className="bg-forest-grain text-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-script text-[34px] leading-none text-primary sm:text-[42px]">
            {dict.home.care_eyebrow}
          </p>
          <h2 className="mt-3 text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight sm:text-[48px]">
            {dict.home.care_title}
          </h2>
          <p className="mt-5 text-[15px] leading-7 text-white/65">
            {dict.home.care_lede}
          </p>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-3">
          {cards.map((card, i) => (
            <li
              key={card.title}
              className="rounded-[28px] bg-white/[0.04] p-7 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/[0.07]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-ink">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={ICONS[i] || ICONS[0]} />
                </svg>
              </span>
              <h3 className="font-display mt-6 text-xl font-medium tracking-tight">
                {card.title}
              </h3>
              <p className="mt-3 text-[14px] leading-6 text-white/65">
                {card.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
