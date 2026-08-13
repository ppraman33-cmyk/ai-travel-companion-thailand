# Reference UI Design Tokens

## Color

- Primary green: `#16A34A`
- Supporting green: `#22C55E`
- Light green: `#DCFCE7`
- Background: `#F3F4F6`
- Surface: `#FFFFFF`
- Dark text: `#111827`
- Secondary text: `#64748B`
- Border: `#E5E7EB`

Semantic warning, error and information colors must retain accessible contrast and must not imply verified or successful state without evidence.

## Typography

Prompt is canonical for Thai and English. Until a licensed, provenance-recorded local font file is approved, use `Prompt` as the preferred family followed by safe Thai-capable system fonts. Text containers must expand naturally; fixed text heights are prohibited.

## Scale

- Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 px
- Radius: 8, 12, 16, 20, 24, 32 px and pill
- Minimum interactive target: 44 × 44 px
- Icons: one rounded outline/filled family; active navigation may use filled emphasis

## Responsive and motion

Mobile controls content order. Tablet and desktop may add columns or the existing sidebar without changing that order. Bottom navigation includes safe-area padding. Thai and English must not clip or create document overflow. Motion is optional and disabled by `prefers-reduced-motion`.

## Surfaces

Cards use white surfaces, subtle borders and low elevation. Visual cards use code-native synthetic media with readable overlays. Focus is always visible, and loading/empty/error/unavailable/demo states have programmatic status semantics.
