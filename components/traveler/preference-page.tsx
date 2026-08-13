import Link from "next/link";
import {
  Badge,
  ContentCard,
  PageHeader,
  SyntheticNotice,
} from "@/components/ui/design-system";
export function PreferencePage({
  kind,
}: {
  readonly kind: "settings" | "notifications" | "privacy";
}) {
  const content = {
    settings: {
      title: "Settings",
      intro: "Only preferences supported by the current application are interactive.",
      rows: [
        "Language · use the EN/TH switch",
        "Theme · system appearance only",
        "Offline access · availability explanation",
        "Help and application information",
      ],
    },
    notifications: {
      title: "Notifications",
      intro: "No notification persistence or delivery contract is active in this MVP.",
      rows: [
        "Trip reminders · unavailable",
        "Festival alerts · unavailable",
        "Safety updates · verified publication required",
      ],
    },
    privacy: {
      title: "Privacy and security",
      intro: "Your traveler data belongs to a secure anonymous HttpOnly session.",
      rows: [
        "No registered account or password",
        "Server-validated session ownership",
        "Profile and Trip data controls",
        "Publication and evidence gates remain enforced",
      ],
    },
  }[kind];
  return (
    <div className="reference-page">
      <SyntheticNotice />
      <PageHeader
        eyebrow="Anonymous traveler"
        title={content.title}
        description={content.intro}
      />
      <ContentCard>
        <ul className="grid gap-3">
          {content.rows.map((row) => (
            <li
              className="flex min-h-14 items-center justify-between rounded-xl bg-slate-50 px-4"
              key={row}
            >
              <span>{row}</span>
              <Badge tone={row.includes("unavailable") ? "warning" : "info"}>MVP</Badge>
            </li>
          ))}
        </ul>
      </ContentCard>
      <nav className="flex flex-wrap gap-2" aria-label="Profile settings">
        <Link
          className="inline-flex min-h-11 items-center rounded-xl border px-4 font-bold"
          href="/profile"
        >
          Travel Profiles
        </Link>
        <Link
          className="inline-flex min-h-11 items-center rounded-xl border px-4 font-bold"
          href="/help"
        >
          Help
        </Link>
        <Link
          className="inline-flex min-h-11 items-center rounded-xl border px-4 font-bold"
          href="/about"
        >
          About
        </Link>
      </nav>
    </div>
  );
}
