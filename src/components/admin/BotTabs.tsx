import Link from "next/link";

export type BotTabKey = "faqs" | "gaps" | "config";

const TABS: Array<{ key: BotTabKey; href: string; label: string }> = [
  { key: "faqs", href: "/admin/bot/faqs", label: "Асуулт хариулт" },
  { key: "gaps", href: "/admin/bot/faq-gaps", label: "FAQ санал" },
  { key: "config", href: "/admin/bot/config", label: "Тохиргоо" },
];

export function BotTabs({ active }: { active: BotTabKey }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Бот удирдлага">
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            aria-current={isActive ? "page" : undefined}
            className={
              "inline-flex min-h-9 items-center rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors " +
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c7b6e] focus-visible:ring-offset-2 " +
              (isActive
                ? "bg-[#0f172a] text-white"
                : "bg-white text-[#6b7280] ring-1 ring-line hover:bg-[#fafbff]")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
