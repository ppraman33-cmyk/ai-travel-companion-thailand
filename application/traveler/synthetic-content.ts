export type DemoCategory =
  "attractions" | "restaurants" | "foods" | "events" | "emergency";

export const demoProvince = {
  id: "00000000-0000-4000-8000-000000000077",
  slug: "demo-lanna-province",
  region: "northern",
  name: "Demo Lanna Province",
  thaiName: "จังหวัดล้านนาจำลอง",
  introduction:
    "A fictional northern destination used to validate traveler journeys without publishing real-world claims.",
};

export const demoItems = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    slug: "lantern-garden",
    category: "attractions",
    name: "Lantern Garden",
    thaiName: "สวนโคมจำลอง",
    summary: "A fictional cultural garden with evidence-pending visitor information.",
    meta: "Hours and fees pending",
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    slug: "river-leaf-kitchen",
    category: "restaurants",
    name: "River Leaf Kitchen",
    thaiName: "ครัวใบไม้ริมน้ำ",
    summary:
      "A fictional restaurant card for menu, price, suitability and save interactions.",
    meta: "฿฿ · hours pending",
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    slug: "forest-tea-bites",
    category: "foods",
    name: "Forest Tea Bites",
    thaiName: "ขนมชาป่าจำลอง",
    summary:
      "A synthetic specialty demonstrating cultural context and producer evidence slots.",
    meta: "Production area pending",
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    slug: "moon-market",
    category: "events",
    name: "Moon Market",
    thaiName: "ตลาดแสงจันทร์จำลอง",
    summary:
      "A fictional annual market whose occurrence must be reverified every year.",
    meta: "2027 occurrence pending",
  },
  {
    id: "00000000-0000-4000-8000-000000000105",
    slug: "demo-assistance-point",
    category: "emergency",
    name: "Demo Assistance Point",
    thaiName: "จุดช่วยเหลือจำลอง",
    summary:
      "Not a real emergency service. Critical call and map fields are intentionally suppressed.",
    meta: "Verification expired · actions disabled",
  },
] as const;

export const categoryLabels: Record<DemoCategory, string> = {
  attractions: "Attractions",
  restaurants: "Restaurants",
  foods: "Local specialties",
  events: "Events",
  emergency: "Emergency help",
};

export const findDemoItem = (category: string, slug: string) =>
  demoItems.find((item) => item.category === category && item.slug === slug);
