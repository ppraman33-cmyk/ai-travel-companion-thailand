"use client";

import { useRef, useState, type FormEvent } from "react";

import { preferenceOptions } from "@/application/traveler/preferences";
import {
  Button,
  ContentCard,
  Field,
  SyntheticNotice,
  TextInput,
} from "@/components/ui/design-system";

import { useTravelerLocale } from "./locale-provider";

const readCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
const steps = [
  "transportation",
  "travelStyle",
  "companions",
  "activityLevel",
  "profile",
] as const;
type StepKey = (typeof steps)[number];
type SelectionKey = Exclude<StepKey, "profile">;
const copy = {
  en: {
    step: "Step",
    of: "of",
    skipAll: "Skip all",
    back: "Back",
    next: "Next",
    finish: "Save profile",
    saving: "Saving…",
    retry: "Your profile could not be saved. Your selections are safe—please retry.",
    localOnly:
      "Skip All stores only a local completion marker. Recommendations will not be personalized.",
    titles: {
      transportation: "How will you get around?",
      travelStyle: "What kind of trip feels right?",
      companions: "Who are you traveling with?",
      activityLevel: "How active should your days feel?",
      profile: "Name this travel profile",
    },
    profileName: "Profile name",
    profileHint: "For example: Solo Thailand, Family holiday, or Road trip",
    summary: "Your selections",
    setActive: "This profile becomes active for new recommendations and Trips.",
  },
  th: {
    step: "ขั้นตอน",
    of: "จาก",
    skipAll: "ข้ามทั้งหมด",
    back: "ย้อนกลับ",
    next: "ถัดไป",
    finish: "บันทึกโปรไฟล์",
    saving: "กำลังบันทึก…",
    retry: "ยังบันทึกโปรไฟล์ไม่ได้ ตัวเลือกของคุณยังอยู่ กรุณาลองอีกครั้ง",
    localOnly: "การข้ามทั้งหมดจะบันทึกเพียงสถานะในเครื่อง คำแนะนำจะไม่ปรับตามคุณ",
    titles: {
      transportation: "คุณจะเดินทางอย่างไร",
      travelStyle: "คุณชอบเที่ยวแบบไหน",
      companions: "คุณเดินทางกับใคร",
      activityLevel: "ต้องการกิจกรรมระดับใด",
      profile: "ตั้งชื่อโปรไฟล์การเดินทาง",
    },
    profileName: "ชื่อโปรไฟล์",
    profileHint: "เช่น เที่ยวคนเดียว, เที่ยวกับครอบครัว หรือขับรถเที่ยว",
    summary: "ตัวเลือกของคุณ",
    setActive: "โปรไฟล์นี้จะใช้กับคำแนะนำและทริปใหม่",
  },
} as const;
const options: Record<SelectionKey, readonly { value: string; label: string }[]> = {
  transportation: preferenceOptions.transportation,
  travelStyle: preferenceOptions.travelStyle,
  companions: preferenceOptions.companions,
  activityLevel: preferenceOptions.activityLevel,
};
const thaiOptionLabels: Record<string, string> = {
  public_transit: "ขนส่งสาธารณะ",
  private_car: "รถยนต์ส่วนตัว / แท็กซี่",
  motorcycle: "มอเตอร์ไซค์ / สกู๊ตเตอร์",
  bicycle: "จักรยาน",
  walking: "เดิน / เดินป่า",
  mixed: "ผสม / ยังไม่แน่ใจ",
  budget: "ประหยัด",
  relaxation: "สบาย ๆ",
  adventure: "ผจญภัย",
  cultural: "วัฒนธรรมและประวัติศาสตร์",
  food: "อาหาร",
  nature: "ธรรมชาติ",
  family: "ครอบครัว",
  solo: "เดินทางคนเดียว",
  couple: "คู่รัก",
  friends: "เพื่อน",
  children: "เด็ก",
  older_adults: "ผู้สูงอายุ",
  group: "กลุ่ม",
  low: "น้อย — เน้นสบาย",
  moderate: "ปานกลาง — เดินบ้าง",
  high: "สูง — กิจกรรมต่อเนื่อง",
  very_high: "สูงมาก — เต็มวัน",
};

export function OnboardingFlow({ onComplete }: { readonly onComplete: () => void }) {
  const { locale } = useTravelerLocale();
  const t = copy[locale];
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savingRef = useRef(false);
  const current = steps[step];
  const isProfile = current === "profile";
  const optionLabel = (value: string, fallback?: string) =>
    locale === "th"
      ? (thaiOptionLabels[value] ?? fallback ?? value)
      : (fallback ?? value);

  async function complete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isProfile) return setStep((value) => value + 1);
    if (savingRef.current) return;
    const form = new FormData(event.currentTarget);
    savingRef.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      let csrf = readCookie("atct_csrf");
      if (!csrf) {
        const session = await fetch("/api/v1/sessions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ locale }),
        });
        if (!session.ok) throw new Error("session");
        csrf = readCookie("atct_csrf");
      }
      const response = await fetch("/api/v1/profiles", {
        method: "POST",
        headers: { "content-type": "application/json", "x-csrf-token": csrf ?? "" },
        body: JSON.stringify({
          name: form.get("profileName"),
          transportation: selections.transportation,
          travelStyle: selections.travelStyle,
          companions: selections.companions,
          activityLevel: selections.activityLevel,
          interests: [],
          active: true,
        }),
      });
      if (!response.ok) throw new Error("profile");
      onComplete();
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <ContentCard className="mx-auto w-full max-w-3xl overflow-hidden">
      <SyntheticNotice />
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
          {t.step} {step + 1} {t.of} {steps.length}
        </p>
        <button
          className="min-h-11 px-2 text-sm font-semibold text-slate-600"
          onClick={onComplete}
          disabled={saving}
          type="button"
        >
          {t.skipAll}
        </button>
      </div>
      <div
        className="mt-3 flex gap-2"
        aria-label={`${step + 1} of ${steps.length}`}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={step + 1}
      >
        {steps.map((_, index) => (
          <span
            className={`h-2 flex-1 rounded-full ${index <= step ? "bg-emerald-700" : "bg-slate-200"}`}
            key={index}
          />
        ))}
      </div>
      <form className="mt-7 grid gap-6" onSubmit={complete}>
        <div>
          <h1 className="text-3xl font-black">{t.titles[current]}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isProfile ? t.setActive : t.localOnly}
          </p>
        </div>
        {isProfile ? (
          <>
            <>
              {saveError ? (
                <p
                  className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800"
                  role="alert"
                >
                  {t.retry}
                </p>
              ) : null}
            </>
            <Field label={t.profileName} hint={t.profileHint}>
              <TextInput
                autoComplete="off"
                maxLength={80}
                name="profileName"
                required
              />
            </Field>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <h2 className="font-bold">{t.summary}</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {Object.values(selections).map((value) => (
                  <li
                    className="rounded-full bg-white px-3 py-2 text-sm font-semibold"
                    key={value}
                  >
                    {optionLabel(
                      value,
                      Object.values(options)
                        .flat()
                        .find((option) => option.value === value)?.label,
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">{t.titles[current]}</legend>
            {options[current].map((option) => {
              const selected = selections[current] === option.value;
              return (
                <button
                  aria-pressed={selected}
                  className={`min-h-16 rounded-2xl border px-4 py-3 text-left font-semibold transition ${selected ? "border-emerald-700 bg-emerald-100 text-emerald-950" : "border-slate-200 bg-white hover:border-emerald-300"}`}
                  key={option.value}
                  onClick={() =>
                    setSelections((value) => ({ ...value, [current]: option.value }))
                  }
                  type="button"
                >
                  {optionLabel(option.value, option.label)}
                </button>
              );
            })}
          </fieldset>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
          <Button
            disabled={step === 0 || saving}
            onClick={() => setStep((value) => value - 1)}
            type="button"
            variant="ghost"
          >
            {t.back}
          </Button>
          <Button
            disabled={saving || (!isProfile && !selections[current])}
            type="submit"
          >
            {isProfile ? (saving ? t.saving : t.finish) : t.next}
          </Button>
        </div>
      </form>
    </ContentCard>
  );
}
