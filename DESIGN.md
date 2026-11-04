# Ui — Style Reference (Álbum QR Festa)
> clinical blueprint on frosted paper + dynamic festive theme overrides for guest views

**Theme:** light (Admin, Painel do Pai, Painel B2B & Landing Page) + Dynamic Event Theme (`--cor1`, `--cor2` on `/e/:slug` and `/telao/:slug`)

Source measurements are normalized; roles and recommendations are interpreted. Font summary lists are independent, not paired by position. HTML examples are reconstructions, not source components.

shadcn/ui is a monochromatic design-system workshop: pure white canvas, soft warm-gray surfaces, and large-radius cards floating on hairline borders. For **Álbum QR Festa**, the SaaS panels (Admin, Host Management, B2B Partner) use **Festive Violet (`#7c3aed`)** as the primary action accent and **Midnight Plum (`#130d1e`)** for navigation sidebars, while the Guest App (`/e/:slug`) and Live Screen (`/telao/:slug`) dynamically inject the event's custom primary and secondary colors (`--cor1`, `--cor2`) and friendly display typography (`Fredoka` / `Geist`).

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Canvas | `#f5f5f5` | `--color-canvas` | Page background, muted surface fills, secondary buttons |
| Paper | `#ffffff` | `--color-paper` | Card surfaces, popover backgrounds, primary container fills |
| Surface Alt | `#fafafa` | `--color-surface-alt` | Subtle card variant, secondary container, input resting state |
| Ink | `#0a0a0a` | `--color-ink` | Primary text, headings, button labels, icon strokes |
| Ink Soft | `#171717` | `--color-ink-soft` | Secondary text on light surfaces |
| Mid Gray | `#737373` | `--color-mid-gray` | Muted body text, placeholder text, helper labels, icon fills at rest |
| Hairline | `#e5e5e5` | `--color-hairline` | Borders, input outlines, card edges, badge outlines |
| Primary | `#7c3aed` | `--color-primary` | Primary actions, CTA buttons, active state accents (Álbum QR Festa Violet, hover `#6d28d9`) |
| Accent Rose | `#e11d48` | `--color-accent-rose` | Secondary festive highlight for badges, demo tags, and celebratory accents |
| Midnight Plum | `#130d1e` | `--color-midnight-plum` | Official Álbum QR Festa dark anchor for desktop and mobile navigation sidebars |
| Ember | `#e7000b` | `--color-ember` | Red decorative accent for destructive actions and error states |

## Tokens — Typography

### Geist / Inter — SaaS & Management Interfaces (`--font-geist`)
- **Substitute:** Inter
- **Weights:** 400, 500, 600
- **Sizes:** 12, 13, 14, 16, 18, 24, 30, 36, 48
- **Role:** All SaaS, Admin, Host Management (`/gestao/:token`) and B2B interfaces — body at 14px/400, headings ranging 24–48px/600, buttons at 13–14px/500.

### Fredoka — Guest App (`/e/:slug`) & Live Screen (`/telao/:slug`) (`--font-festive`)
- **Weights:** 400, 500, 600, 700
- **Role:** Used exclusively in the Guest Camera/Gallery view and Live Screen to preserve the warm, playful, celebratory atmosphere validated in the pilot.

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | — | — | 12px | 1.33 | 0.6px | `--text-caption` |
| body | — | — | 14px | 1.43 | — | `--text-body` |
| body-lg | — | — | 16px | 1.5 | — | `--text-body-lg` |
| subheading | — | — | 18px | 1.56 | — | `--text-subheading` |
| heading-sm | — | — | 24px | 1.33 | -0.6px | `--text-heading-sm` |
| heading | — | — | 30px | 1.2 | -0.75px | `--text-heading` |
| heading-lg | — | — | 36px | 1.11 | -0.9px | `--text-heading-lg` |
| display | — | — | 48px | 1.1 | -2.4px | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 4px  
**Density:** compact

### Border Radius

| Element | Value |
|---------|-------|
| cards | 24px |
| small | 6px |
| badges | 18px |
| inputs | 18px |
| nested | 10px |
| buttons | 18px |

### Layout

- **Page max-width:** 1280px (Admin / Host / Site) | 480px centered mobile shell (Guest App `/e/:slug`)
- **Section gap:** 48-80px
- **Card padding:** 20px
- **Element gap:** 8px

## Components

### Primary Filled Button
**Role:** High-emphasis action (Submit, Save, Create)

Background `var(--primary)` (`#7c3aed`, Álbum QR Festa Violet, hover `#6d28d9`), text `#ffffff`, border none, radius 18px, padding 0px 12px (compact) or 8px 16px (comfortable), font 14px Geist weight 500. Height ≈ 36–40px.

### Soft Tonal Button (`variant="tonal"` / `variant="soft"`)
**Role:** Medium-emphasis actions that repeat across multiple rows in tables or lists (e.g. Gerar QR Code, Baixar ZIP, Moderar)

Background `bg-primary/10`, text `text-primary`, hover `hover:bg-primary hover:text-primary-foreground`, border `border-primary/15`, radius 18px, height 32px (`size="sm"`), font 12px weight 500.

### Secondary Ghost Button
**Role:** Low-emphasis action (Cancel, Back)

Background `#f5f5f5`, text `#0a0a0a`, no border, radius 18px, padding 0px 12px or 8px 16px, font 14px weight 500.

### Card
**Role:** Content container for blocks, previews, dashboard panels

Background `#ffffff`, radius 24px, border 1px solid `#e5e5e5`, shadow `0 0 0 1px rgba(23,23,23,0.05), 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)`, padding 20px.

### Sidebar Surface
**Role:** Left navigation panel (Desktop) and Slide-out Navigation Drawer (Mobile)

Background `var(--color-midnight-plum)` (`#130d1e`), full-height, contained width (`w-72` on desktop, `w-80` on mobile). Navigation items use 18px rounded pill geometry (`rounded-[18px]`), with white text/icons and soft white fills (`bg-white/10`) on active states.

### Contextual Banner (`<Banner />`)
**Role:** In-page contextual alerts, system notifications, hints, and warnings (Apple Soft Tint)

Container background: 8%–10% soft semantic tint with matching 20% hairline border and 18px radius (`rounded-[18px]`).
- **Info:** Background `bg-sky-500/[0.08]`, border `border-sky-500/20`, icon box `bg-sky-500/15 text-sky-700` (14px radius), title `#0a0a0a` weight 600, description `text-slate-600`.
- **Warning:** Background `bg-amber-500/[0.08]`, border `border-amber-500/20`, icon box `bg-amber-500/15 text-amber-700` (14px radius), title `#0a0a0a` weight 600, description `text-slate-600`.
- **Danger / Error:** Background `bg-[#e7000b]/[0.08]`, border `border-[#e7000b]/20`, icon box `bg-[#e7000b]/15 text-[#e7000b]` (14px radius), title `#0a0a0a` weight 600, description `text-slate-600`.
- **Success:** Background `bg-emerald-500/[0.08]`, border `border-emerald-500/20`, icon box `bg-emerald-500/15 text-emerald-700` (14px radius), title `#0a0a0a` weight 600, description `text-slate-600`.
- **Neutral:** Background `#f5f5f5`, border `#e5e5e5`, icon box `bg-white text-[#737373]`, title `#0a0a0a` weight 600, description `#737373`.
