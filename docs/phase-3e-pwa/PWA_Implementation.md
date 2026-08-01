# Phase 3E Traveler PWA

## Information architecture

The mobile-first shell provides Home, Explore, Food, Events, Trips, and Help. Desktop uses header
navigation; compact screens use a fixed bottom navigation with accessible labels and touch targets.
Home includes Trip planning, eligible catalog previews, and a prominent Help shortcut.

Explore presents attractions and restaurants. Food presents Food specialties and restaurants.
Events presents eligible event concepts. Help requests only RLS-eligible, current emergency
records and states clearly when none are available. Trips creates a secure anonymous session before
persisting traveler-owned data.

## Design system

The existing emerald tokens remain the brand foundation with white surfaces, calm spacing, rounded
cards, visible focus, and semantic amber warnings. Green is not used to imply that unsafe content is
approved. Development environments carry an explicit banner.

## PWA behavior

The manifest supplies standalone display, theme colors, and a project-owned SVG icon. The service
worker caches only the static traveler shell. API requests, mutations, and Help routes are never
cached. Network-first navigation can fall back to the shell; full offline catalog support is not
claimed. Emergency information is not served as authoritative offline data.

## Accessibility

Semantic landmarks, heading order, accessible navigation names, visible focus, form labels,
status/live regions, responsive reflow, readable warning states, and Thai `lang` annotations are
included. The target remains WCAG 2.2 AA; automated component/browser checks do not replace manual
keyboard, screen-reader, zoom, and contrast review.

## External maps and Trips

Map actions use the centralized Google/Apple URL provider only. It validates coordinates and labels,
encodes values, needs no key, and performs no routing itself. Trip records remain anonymous-session
owned. The API supports bounded item creation/update/removal and preserves AI/traveler-modification
metadata; collaborative trips, accounts, booking, tickets, traffic, and internal routing are absent.
