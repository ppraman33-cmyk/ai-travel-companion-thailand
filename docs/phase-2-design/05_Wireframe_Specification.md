# Wireframe Specification

## Shared frame

Text specification only. Mobile uses a top app bar and bottom navigation: Home, Explore, Trip, Assistance, Saved. Desktop uses a left rail and centered max-width content. Every screen supports keyboard focus, semantic headings, 44×44 CSS-pixel target guidance, scalable text, and non-color status cues.

Shared states:

- Loading: skeleton matching content shape, not indefinite spinner.
- Empty: explain why and offer one safe next action.
- Error: plain-language cause category, retry if safe, correlation reference.
- Synthetic: persistent top banner and per-card `TEST DATA` badge.
- Trust: source/freshness near consequential content; full evidence drawer.

## Traveler screens

| Screen | Layout hierarchy, header, main content | Actions and navigation | States and responsive behavior | Accessibility, provenance, synthetic |
|---|---|---|---|---|
| Home | Coverage/safety banner; greeting; current Trip; quick categories; curated cards | Primary Explore; secondary create Trip/Assistance | Mobile stacked; desktop two-column; empty prompts destination selection; service error keeps static links | H1 once; card labels; source/freshness on alerts; persistent test banner |
| Explore | Header with area selector; category chips; result grid/list | Primary open result; filters/search/map handoff only from detail | Loading skeleton; empty broaden filters; mobile single list, desktop 2–3 columns | Chips keyboard-operable; cards expose category, verification, image attribution |
| Search | Search header; query input; suggestions; grouped results/disambiguation | Submit, filter, choose entity | Debounced local/catalog search; empty “no verified result”; mobile full screen, desktop panel | Label/input instructions; Thai/English alias display; synthetic badge |
| Place detail | Name/category/Thai name; authorized media or neutral placeholder; facts; subtypes; trust panel | Save, add to Trip, external map; report | Missing image text-first; suppressed fact omitted; desktop media/content split | Alt/credit; last verified; source drawer; AI decorative never in gallery |
| Restaurant detail | Common Place header; cuisine/specialties/dietary claims; hours/contact; trust | Save/add/map/report | Unsupported dietary claim absent; closed/unknown distinct; responsive as Place | Claims source-linked; no paid rank or booking CTA |
| Event detail | Event header; selected occurrence; status; venue; recurrence; trust | Save/add/map venue/report | Cancelled/rescheduled prominent; no active occurrence empty; desktop occurrence side panel | Dates semantic/local timezone; source and last check visible |
| Emergency assistance | High-contrast assistance header; category selector; one-time/manual location; verified result list | Call, external map, report | Stale fields suppress action; no-result official fallback only; mobile call actions prominent | Not-an-emergency-service notice; verification date adjacent; screen-reader action names |
| Trip overview | Trip title/dates; day tabs; ordered items; source-change indicators | Manual add/edit/confirm; Plan with AI | Empty day suggestions; conflict/error state; mobile accordion, desktop day columns | Reordering keyboard alternatives; AI-proposed state text label |
| AI itinerary chat | Context summary; bounded messages; proposed-diff cards; citations/quota | Ask, cancel, accept selected changes, manual fallback | Quota/unavailable/validation failure states; mobile composer fixed safely | Live-region used sparingly; citations keyboard reachable; synthetic response label |
| Saved places | Header/filter by Trip/category; saved cards | Open/remove/add to Trip | Empty guidance; unavailable saved item visibly suppressed; responsive grid/list | Remove confirmation accessible; current freshness displayed |
| Report incorrect information | Target summary; field/category; details; optional evidence/contact consent | Submit/cancel | Validation, success reference, offline error; single-column at all sizes | Explicit labels, privacy/retention note; no public-review wording |
| Settings and privacy | Language; location explanation; session expiry; data controls; quota | Delete conversation/trip/session; manage consent | Confirmation dialog; deletion pending/error | Destructive actions clear; no dark patterns; current retention proposal linked |

## Admin screens

| Screen | Layout hierarchy, header, main content | Actions/navigation | States/responsive | Accessibility, evidence, synthetic |
|---|---|---|---|---|
| Admin dashboard | Protected header; priority queue; stale/expiry/takedown metrics; recent audit | Open queue/new draft | Empty “queue clear”; provider/error state; mobile basic, desktop primary | Severity not color-only; synthetic and real totals separated |
| Admin record editor | Identity/duplicate check; common fields; subtype sections; assertions; validation summary | Save draft, submit review, suppress | Conflict and unsaved-change states; desktop split editor/evidence, mobile stacked | Field errors linked; evidence status visible; synthetic cannot publish |
| Admin verification queue | Priority filters; queue table/cards; evidence preview | Claim/open/verify/dispute/expire | Loading/empty/error; mobile cards, desktop table | Keyboard sortable; critical status text; reviewer/date mandatory |
| Admin image-rights review | Asset preview; subject; origin; rights/license; transformations; contexts | Approve/reject/takedown | Missing evidence blocks approval; image load failure metadata remains | Alt/creator/credit; AI decorative real-gallery context hard error |

## Dialogs and safety confirmations

Use dialogs only for destructive deletion, leaving for a call/map when context needs clarity, publishing, suppression, takedown, and high-impact admin transitions. Never use a dialog to hide source limitations.

## Post-MVP screen inventory

Account/recovery, collaboration, notifications, partner portal, public reviews, sponsored placements, booking referral, live weather, and advanced offline management are excluded.

## Unresolved design dependencies

Exact content hierarchy needs usability testing; final breakpoint values are in the design system; exact PWA install behavior and AI streaming are implementation decisions.
