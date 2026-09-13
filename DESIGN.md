# Design Brief

## Direction

SR Battle — a dark, high-energy esports arena hub for creating, browsing, and joining Free Fire and BR CS lone-wolf custom-room tournaments.

## Tone

Arena-grade battle royale: near-black arena floor, hot ember orange for Free Fire, electric cyan for BR CS, aggressive angular HUD geometry, and bold condensed display type.

## Differentiation

The dual-accent system that reads the game at a glance (ember orange = Free Fire, electric cyan = BR CS) wrapped in chamfered `clip-angle` card frames and a signature `clip-slash` corner that feels like battle-royale HUD, not SaaS.

## Color Palette

| Token       | OKLCH (dark)  | Role                                   |
| ----------- | ------------- | -------------------------------------- |
| background  | 0.11 0.014 260| near-black arena floor                 |
| foreground  | 0.95 0.01 260 | primary text                           |
| card        | 0.15 0.02 260 | elevated surface                       |
| primary     | 0.68 0.19 40  | ember orange — Free Fire / CTA         |
| accent      | 0.78 0.14 200 | electric cyan — BR CS / secondary      |
| muted       | 0.19 0.018 260| secondary surfaces                     |
| success     | 0.62 0.18 150 | open / joinable status                 |
| warning     | 0.76 0.15 85  | full / near-capacity status            |
| destructive | 0.58 0.22 25  | delete / closed                        |

## Typography

- Display: Space Grotesk — headings, hero, tournament titles
- Body: DM Sans — paragraphs, UI labels, form fields
- Mono: Geist Mono — room IDs, passwords, player counts, entry fees
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-sm font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Three-tier surface hierarchy (background → card → popover) with subtle/elevated shadows and a `card-hover` shadow that adds a faint ember ring on lift; depth comes from layered dark surfaces and angular edges, not glow or neon.

## Structural Zones

| Zone    | Background      | Border   | Notes                                   |
| ------- | --------------- | -------- | --------------------------------------- |
| Header  | card, elevated  | border-b | sticky, logo + nav, subtle shadow       |
| Content | background      | —        | alternating card sections, card grid    |
| Footer  | muted/40        | border-t | muted text, compact                     |

## Spacing & Rhythm

Section gaps `gap-8 md:gap-12`; card grids `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`; micro-spacing `space-y-4` inside cards; generous `p-6` card padding.

## Component Patterns

- Buttons: primary = ember `gradient-primary`, `rounded-md`, hover brightens + lifts; ghost = muted with border
- Cards: `rounded-md`, card background, `shadow-subtle` resting / `shadow-card-hover` on hover, `clip-angle` top corner
- Badges: `rounded-full` pills — Free Fire ember, BR CS cyan, status (open/success, full/warning, closed/destructive); room ID/password in mono

## Motion

- Entrance: `fade-in-up` staggered 0.4s on cards and sections
- Hover: cards lift with `shadow-card-hover` + border brighten, 0.3s ease
- Decorative: `pulse-glow` on LIVE status dots, `scan` sweep across tournament card headers

## Constraints

- Dark mode only — designed intentionally, not inverted
- No raw color literals or arbitrary Tailwind color classes in components; use semantic tokens
- No glow/neon shadows; keep shadows moody and layered
- 3 fonts max, 3–5 core colors, one dominant interaction (card → detail)

## Signature Detail

The `clip-angle` chamfered corner on tournament cards, echoing a battle-royale HUD frame and giving every card a sharp, tactical silhouette.
