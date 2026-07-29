# MVP Design System

## Brand principles

Trustworthy, calm, locally respectful, practical, and legible under travel conditions. Decorative styling never competes with emergency or provenance information.

## Color direction

- Primary: emerald green family for brand and ordinary primary actions.
- Neutrals: warm-white canvas, white surfaces, charcoal text, cool/warm gray borders.
- Semantic: blue informational, amber uncertain/stale, red emergency/error, green verified, violet AI-related.
- Exact color values remain a visual design decision and must pass contrast testing.

Emergency red is reserved for safety-critical status and destructive warnings, not ordinary marketing. Sponsored, synthetic, AI-generated, stale, and uncertain labels each use text/icon plus color.

## Typography

Use system fonts only initially, with robust Thai glyph coverage:

- Sans stack must prefer platform UI fonts and a Thai-capable system fallback.
- Minimum body target 16 CSS pixels; comfortable 1.5 line height.
- Heading scale: display, H1, H2, H3, body, small, caption; no skipped semantic levels.
- Thai line height is tested separately; do not force English tracking or uppercase styles onto Thai.
- Numbers, phone actions, dates, and status labels require high legibility.

No paid fonts.

## Scales

- Spacing: 4, 8, 12, 16, 24, 32, 48, 64 units.
- Radius: 0, 4, 8, 12, 16, full/pill.
- Elevation: none, raised card, overlay/dialog; prefer border and spacing over shadow.
- Breakpoints (proposed): compact under 640; medium 640–1023; wide 1024 and above. Content determines final tests.

## Icons

Use one open, license-reviewed outline icon family plus text labels for unfamiliar actions. Emergency icons must not impersonate official insignia. Google/Apple branding follows provider terms. No emoji as the only semantic indicator.

## Components

| Component | Specification |
|---|---|
| Buttons | Primary emerald, secondary outline, tertiary text, destructive red, emergency call treatment; loading preserves width; disabled explains only when needed |
| Inputs | Visible label, help/error association, 44px target, clear focus, Thai/English entry, no placeholder-only labels |
| Cards | Clear title/type/Thai name, concise facts, status, image credit, entire-card link only if nested actions remain valid |
| Chips | Filters/tags; selected state uses check/text and color; removable chips announce removal |
| Status badges | Verified, stale, uncertain, sponsored, synthetic, AI-generated; always icon/text, never color alone |
| Navigation | Mobile bottom bar (five items); desktop rail; active state programmatic; Assistance remains prominent |
| Dialogs | Focus trap/return, explicit title, safe default, no nested dialogs |
| Toasts | Brief confirmations only; errors persist in context; screen-reader live region |
| Loading | Skeleton or progress with cancel for AI; no fake completion; reduced-motion compatible |
| Empty states | Reason, scope limitation, one next action; no invented fallback content |
| Error states | User-safe category, recovery, correlation reference; provider internals hidden |

## Trust labels

- **Verified:** evidence and freshness pass; show verification date.
- **Stale:** ordinary content may display with limitation; critical emergency fields suppress.
- **Uncertain:** conflicting/incomplete noncritical evidence; do not present as verified.
- **Sponsored:** post-MVP only; visually distinct from organic and never used for emergency.
- **Synthetic:** development/test data; persistent banner and local badge.
- **AI-generated:** generated interpretation or decorative media; never a verified factual source.

## Emergency treatment

Use a dedicated assistance header, direct service-type naming, verified call/map actions, verification date, freshness, and a concise limitation. Avoid alarming animation. Critical action disabling must state why and offer only approved alternatives.

## Accessibility requirements

- Target WCAG 2.2 AA.
- Normal text contrast at least 4.5:1; large text at least 3:1; controls and focus indicators at least 3:1.
- Full keyboard operation, visible focus, semantic landmarks, skip link, logical reading order.
- Touch targets target 44×44; zoom/reflow to 400%; no horizontal scroll for primary content at narrow widths.
- Respect reduced motion and user text settings.
- Alt text distinguishes documentary, decorative, and unavailable images.
- English and Thai screen-reader pronunciation needs device testing.

## Responsive behavior

Compact uses single-column lists, bottom navigation, drawers sparingly, and sticky primary actions only when they do not hide content. Medium introduces side panels. Wide uses constrained columns, not stretched text. Admin tables become cards on compact screens without losing evidence fields.

## MVP versus future

MVP includes the tokens and patterns above. Dark mode, advanced data visualization, native-component parity, destination themes, partner branding, and motion systems are future-state.

## Unresolved decisions

Exact palette, logo/mark, icon license, system-font stack by platform, breakpoint validation, and whether AI-generated decorative assets are used at all.
