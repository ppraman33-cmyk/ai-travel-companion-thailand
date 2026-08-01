export const travelerLocales = ["en", "th"] as const;
export type TravelerLocale = (typeof travelerLocales)[number];

export const travelerStrings = {
  en: {
    appName: "Thailand Companion",
    home: "Home",
    explore: "Explore",
    saved: "Saved",
    trips: "Trips",
    profile: "Profile",
    assistant: "AI assistant",
    help: "Help & emergency",
    search: "Search places, food, events…",
    syntheticBanner: "DEMO MODE — all travel and emergency examples are synthetic",
    synthetic: "Synthetic demo",
    evidencePending: "Evidence pending",
    verifiedOnly: "Real publication remains blocked until evidence is verified.",
    viewAll: "View all",
    save: "Save",
    savedLabel: "Saved",
    addToTrip: "Add to trip",
    report: "Report incorrect information",
    maps: "Open external map",
    language: "Language",
  },
  th: {
    appName: "เพื่อนเที่ยวไทย",
    home: "หน้าหลัก",
    explore: "สำรวจ",
    saved: "บันทึก",
    trips: "ทริป",
    profile: "โปรไฟล์",
    assistant: "ผู้ช่วย AI",
    help: "ช่วยเหลือและฉุกเฉิน",
    search: "ค้นหาสถานที่ อาหาร กิจกรรม…",
    syntheticBanner: "โหมดสาธิต — ข้อมูลท่องเที่ยวและฉุกเฉินทั้งหมดเป็นข้อมูลจำลอง",
    synthetic: "ข้อมูลจำลอง",
    evidencePending: "รอการตรวจหลักฐาน",
    verifiedOnly: "ข้อมูลจริงยังไม่เผยแพร่จนกว่าจะผ่านการตรวจหลักฐาน",
    viewAll: "ดูทั้งหมด",
    save: "บันทึก",
    savedLabel: "บันทึกแล้ว",
    addToTrip: "เพิ่มลงทริป",
    report: "แจ้งข้อมูลไม่ถูกต้อง",
    maps: "เปิดแผนที่ภายนอก",
    language: "ภาษา",
  },
} as const;

export type TravelerStrings = (typeof travelerStrings)[TravelerLocale];

export const normalizeTravelerLocale = (value?: string | null): TravelerLocale =>
  value?.toLowerCase().startsWith("th") ? "th" : "en";
