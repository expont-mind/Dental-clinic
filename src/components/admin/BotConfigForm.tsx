"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  patchBotPersonaAction,
  type BotConfigFormState,
} from "@/lib/actions/bot";
import { BilingualField } from "./BilingualField";
import { useFormToast } from "@/lib/hooks/use-form-toast";
import type {
  BotPersona,
  BotTone,
  PhoneInRepliesPolicy,
} from "@/lib/dentexgo/client";

const initial: BotConfigFormState = {};

const TONE_OPTIONS: Array<{ value: BotTone; label: string; description: string }> = [
  { value: "formal", label: "Албаны", description: "Хүндэт хэллэг, мэргэжлийн өнгөтэй" },
  { value: "friendly", label: "Найрсаг", description: "Дотно, дулаахан өнгө" },
  { value: "casual", label: "Энгийн", description: "Хөнгөн, найзлаг" },
];

const PHONE_POLICY_OPTIONS: Array<{
  value: PhoneInRepliesPolicy;
  label: string;
  description: string;
}> = [
  {
    value: "when_uncertain",
    label: "Тодорхой биш үед",
    description: "Зөвхөн эргэлзээтэй эсвэл хүн рүү шилжүүлэх үед утсаа санал болгоно",
  },
  {
    value: "always",
    label: "Үргэлж",
    description: "Хариулт бүрийн төгсгөлд утсаа дурдана",
  },
  {
    value: "never",
    label: "Хэзээ ч үгүй",
    description: "Бот өөрөө утас санал болгохгүй (хүн рүү шилжүүлэх үед л өгнө)",
  },
];

export type FeaturedServiceOption = {
  id: string;
  slug: string;
  name_mn: string;
  name_en: string;
};

export function BotConfigForm({
  persona,
  featuredServices,
}: {
  persona: BotPersona;
  featuredServices: FeaturedServiceOption[];
}) {
  const [state, formAction, pending] = useActionState(
    patchBotPersonaAction,
    initial,
  );
  useFormToast(state);

  const tone = persona.tone ?? "friendly";
  const phonePolicy = persona.phone_in_replies ?? "when_uncertain";

  return (
    <form action={formAction} className="space-y-10">
      {/* Tone */}
      <fieldset>
        <legend className="mb-2 block text-[12px] font-semibold text-[#374151]">
          Өнгө аяс
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {TONE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-line transition-colors hover:bg-[#fafbff] has-[:checked]:bg-primary-soft has-[:checked]:ring-primary"
            >
              <input
                type="radio"
                name="tone"
                value={opt.value}
                defaultChecked={tone === opt.value}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span className="flex flex-col">
                <span className="text-[13px] font-semibold text-[#0f172a]">
                  {opt.label}
                </span>
                <span className="text-[11px] leading-5 text-[#6b7280]">
                  {opt.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Greeting */}
      <div>
        <BilingualField
          label="Мэндчилгээ"
          nameMn="greeting_mn"
          nameEn="greeting_en"
          mode="textarea"
          rows={2}
          defaultMn={persona.greeting?.mn ?? ""}
          defaultEn={persona.greeting?.en ?? ""}
          placeholderMn="Сайн байна уу 👋 Манай эмнэлэгт тавтай морил."
          placeholderEn="Hi 👋 Welcome to our clinic."
        />
        <p className="mt-1 text-[11px] text-[#9ca3af]">
          Чат бүрийн эхний хариултад нэг удаа гарна.
        </p>
      </div>

      {/* AI disclosure */}
      <div>
        <BilingualField
          label="AI мэдэгдэл"
          nameMn="ai_disclosure_mn"
          nameEn="ai_disclosure_en"
          mode="textarea"
          rows={2}
          defaultMn={persona.ai_disclosure?.mn ?? ""}
          defaultEn={persona.ai_disclosure?.en ?? ""}
          placeholderMn="Би таны клиникийн AI туслах."
          placeholderEn="I'm your clinic's AI assistant."
        />
        <p className="mt-1 text-[11px] text-[#9ca3af]">
          Эхний хариултын эхэнд автоматаар нэмэгдэнэ (Meta-ийн шаардлага).
        </p>
      </div>

      {/* Off-hours */}
      <fieldset className="space-y-4 rounded-2xl bg-[#fafbff] p-5 ring-1 ring-line">
        <legend className="text-[13px] font-bold text-[#0f172a]">
          Ажлын цагаас гадуурх хариу
        </legend>
        <p className="-mt-2 text-[11px] leading-5 text-[#6b7280]">
          Хуваарь нь салбарын ажлын цагаас автоматаар тооцоологдоно. Энд зөвхөн
          хаалттай үеийн хэллэгээ оруулна.
        </p>
        <BilingualField
          label="Мэндчилгээ (хаалттай үе)"
          nameMn="off_hours_greeting_mn"
          nameEn="off_hours_greeting_en"
          mode="textarea"
          rows={2}
          defaultMn={persona.off_hours?.greeting?.mn ?? ""}
          defaultEn={persona.off_hours?.greeting?.en ?? ""}
          placeholderMn="Сайн байна уу. Бид одоо хаалттай байна."
          placeholderEn="Hi. We are closed right now."
        />
        <BilingualField
          label="Төгсгөлийн үг"
          nameMn="off_hours_closer_mn"
          nameEn="off_hours_closer_en"
          mode="textarea"
          rows={2}
          defaultMn={persona.off_hours?.closer?.mn ?? ""}
          defaultEn={persona.off_hours?.closer?.en ?? ""}
          placeholderMn="Маргааш 09:00 цагт холбогдох болно."
          placeholderEn="We will respond at 09:00."
        />
        <div>
          <label
            htmlFor="off_hours_emergency_phone"
            className="mb-1.5 block text-[12px] font-semibold text-[#374151]"
          >
            Яаралтай утас
          </label>
          <input
            id="off_hours_emergency_phone"
            name="off_hours_emergency_phone"
            type="text"
            inputMode="tel"
            defaultValue={persona.off_hours?.emergency_phone ?? ""}
            placeholder="99001122"
            className="w-full max-w-xs rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] outline-none focus:border-primary"
          />
          <p className="mt-1 text-[11px] text-[#9ca3af]">
            Хоосон үлдээвэл эмнэлгийн профайл дахь утсыг автоматаар ашиглана.
          </p>
        </div>
      </fieldset>

      {/* Fallback message */}
      <div>
        <BilingualField
          label="Эргэлзээтэй үеийн хариу"
          nameMn="fallback_message_mn"
          nameEn="fallback_message_en"
          mode="textarea"
          rows={2}
          defaultMn={persona.fallback_message?.mn ?? ""}
          defaultEn={persona.fallback_message?.en ?? ""}
          placeholderMn="Энэ асуултанд итгэлтэйгээр хариулж чадахгүй байна. 77000022 руу залгана уу."
          placeholderEn="I can't answer this with confidence. Please call 77000022."
        />
        <p className="mt-1 text-[11px] text-[#9ca3af]">
          Бот итгэлтэй хариулж чадахгүй үед энэ үгийг яг шиг нь буцаана.
        </p>
      </div>

      {/* Phone policy */}
      <fieldset>
        <legend className="mb-2 block text-[12px] font-semibold text-[#374151]">
          Утсыг хариунд оруулах
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {PHONE_POLICY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-line transition-colors hover:bg-[#fafbff] has-[:checked]:bg-primary-soft has-[:checked]:ring-primary"
            >
              <input
                type="radio"
                name="phone_in_replies"
                value={opt.value}
                defaultChecked={phonePolicy === opt.value}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span className="flex flex-col">
                <span className="text-[13px] font-semibold text-[#0f172a]">
                  {opt.label}
                </span>
                <span className="text-[11px] leading-5 text-[#6b7280]">
                  {opt.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Featured services (read-only summary — source of truth is `services.is_featured`) */}
      <section>
        <h3 className="mb-1 block text-[12px] font-semibold text-[#374151]">
          Онцлох үйлчилгээ
        </h3>
        <p className="mb-3 text-[11px] leading-5 text-[#6b7280]">
          Эдгээр үйлчилгээ <strong>/featured</strong> хуудас,{" "}
          <strong>/services</strong> хуудасны дээд хэсгийн онцлох
          картууд болон Messenger ботын карусел гурвууланд эхэнд гарна.
          Жагсаалтыг өөрчлөхийн тулд{" "}
          <Link
            href="/admin/services"
            className="font-semibold text-primary underline"
          >
            /admin/services
          </Link>{" "}
          руу орж тус үйлчилгээний &ldquo;Онцлох&rdquo; чагтыг асаа/унтраа.
        </p>
        {featuredServices.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-[#fafbff] px-4 py-6 text-center text-[12px] text-[#9ca3af]">
            Одоогоор онцолсон үйлчилгээ алга байна.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {featuredServices.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-line"
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">
                  ★
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-[#0f172a]">
                    {s.name_mn}
                  </span>
                  <span className="block truncate text-[11px] text-[#6b7280]">
                    {s.name_en || s.slug}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {featuredServices.length >= 8 && (
          <p className="mt-2 text-[11px] text-amber-700">
            Контрактаар хамгийн ихдээ 8 үйлчилгээ карусел дээр гарна. Илүү
            гарсан тохиолдолд <span className="font-mono">sort_order</span>{" "}
            дарааллаар эхний 8-ийг сонгоно.
          </p>
        )}
      </section>

      {/* Duration in cards (carousel display option) */}
      <fieldset>
        <legend className="mb-2 block text-[12px] font-semibold text-[#374151]">
          Карусел дээр үргэлжлэх хугацаа харуулах
        </legend>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-line transition-colors hover:bg-[#fafbff] has-[:checked]:bg-primary-soft has-[:checked]:ring-primary">
          {/* Hidden default ensures the action always receives a value */}
          <input type="hidden" name="show_duration_in_cards" value="0" />
          <input
            type="checkbox"
            name="show_duration_in_cards"
            value="1"
            defaultChecked={persona.show_duration_in_cards ?? false}
            className="mt-0.5 h-4 w-4 accent-primary"
          />
          <span className="flex flex-col">
            <span className="text-[13px] font-semibold text-[#0f172a]">
              Үнийн дэргэд хугацаа харуулах
            </span>
            <span className="text-[11px] leading-5 text-[#6b7280]">
              Жнь:{" "}
              <span className="font-mono">2,400,000₮ · 60 минут</span>.
              Анхдагч: унтраалттай.
            </span>
          </span>
        </label>
      </fieldset>

      {/* Custom rules */}
      <div>
        <label
          htmlFor="custom_rules"
          className="mb-1.5 block text-[12px] font-semibold text-[#374151]"
        >
          Тусгай дүрэм
        </label>
        <div className="mb-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-5 text-amber-900">
          ⚠️ <strong>FAQ vs дүрэм</strong> — Үнэ, цаг, бодлого зэрэг{" "}
          <em>баримтуудыг</em> FAQ дотор оруул. Энд зөвхөн бот{" "}
          <em>хэрхэн</em> хариулах ёстой дүрмийг бичнэ үү (жнь: &ldquo;Имплантын
          асуулт бүрд 1 жилийн баталгааг дурдах&rdquo;). Дүрэм нь FAQ-тэй
          зөрчилдвөл FAQ нь дийлнэ.
        </div>
        <textarea
          id="custom_rules"
          name="custom_rules"
          rows={5}
          defaultValue={(persona.custom_rules ?? []).join("\n")}
          placeholder={`Нэг мөр = нэг дүрэм
Жнь: Үнэ асуусан үед үргэлж үнэгүй зөвлөгөө санал болго
Жнь: 7-аас доош насны хүүхдийг Доктор Бат-Эрдэнэд илгээ`}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[13px] leading-6 outline-none focus:border-primary"
        />
        <p className="mt-1 text-[11px] text-[#9ca3af]">
          Хоосон үлдээвэл анхдагч зан үйл ажиллана.
        </p>
      </div>

      {state.error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-[14px] font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Хадгалж байна..." : "Хадгалах"}
        </button>
      </div>
    </form>
  );
}
