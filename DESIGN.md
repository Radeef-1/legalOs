---
name: LegalOS Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4f6073'
  primary: '#041627'
  on-primary: '#ffffff'
  primary-container: '#1a2b3c'
  on-primary-container: '#8192a7'
  inverse-primary: '#b7c8de'
  secondary: '#1b6d24'
  on-secondary: '#ffffff'
  secondary-container: '#a0f399'
  on-secondary-container: '#217128'
  tertiary: '#00162a'
  on-tertiary: '#ffffff'
  tertiary-container: '#002b4b'
  on-tertiary-container: '#3d95e2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4fb'
  primary-fixed-dim: '#b7c8de'
  on-primary-fixed: '#0b1d2d'
  on-primary-fixed-variant: '#38485a'
  secondary-fixed: '#a3f69c'
  secondary-fixed-dim: '#88d982'
  on-secondary-fixed: '#002204'
  on-secondary-fixed-variant: '#005312'
  tertiary-fixed: '#d0e4ff'
  tertiary-fixed-dim: '#9ccaff'
  on-tertiary-fixed: '#001d35'
  on-tertiary-fixed-variant: '#00497b'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style
The design system establishes a high-trust, authoritative environment for legal practitioners. It blends **Corporate Modernism** with **Systematic Precision**, prioritizing clarity for high-stakes legal workflows and Saudi regulatory compliance.

The emotional response is one of absolute reliability and forward-thinking innovation. The UI utilizes a structured grid, ample whitespace to reduce cognitive load during complex data entry, and a sophisticated color logic that mirrors the digital transformation of the Saudi judicial system (Najiz). 

- **Primary Style:** Corporate Modern with a focus on Information Density and Legibility.
- **Visual Tone:** Professional, Institutional, and Transparent.
- **Internationalization:** Native Support for RTL (Arabic) as the primary direction, with seamless LTR (English) mirroring.

## Colors
The palette is rooted in institutional trust and growth.

- **Primary (Deep Navy - #1A2B3C):** Used for navigation, headers, and primary actions. It represents the sobriety of the legal profession.
- **Secondary (Emerald Green - #2E7D32):** Used for "Success" states, Najiz integration indicators, and positive financial trajectories. It aligns with the national identity of Saudi Arabia.
- **Neutral (Slate Grays):** A refined range of grays used for borders, secondary text, and surface backgrounds to maintain a calm, non-distracting workspace.
- **Status Tones:** 
    - *Ongoing:* Tertiary Blue (#0077C2)
    - *Action Required/Overdue:* Crimson (#D32F2F)
    - *Warning:* Amber (#F59E0B)

## Typography
The system uses a dual-font strategy. **IBM Plex Sans Arabic** provides an authoritative, modern feel for headings and navigation, while **Inter** is utilized for dense Latin data and numerical values in financial tables.

- **Legibility:** Paragraph lengths are capped at 70 characters for readability.
- **Hierarchy:** Strong weight contrast (600 vs 400) is used to differentiate between case titles and descriptive metadata.
- **Numerical Data:** Tabular figures are used in financial cards to ensure decimal alignment.

## Layout & Spacing
A **Fixed-Fluid Hybrid Grid** is employed. Sidebar navigation remains fixed at 280px, while the main content area utilizes a 12-column fluid grid.

- **Margins:** 32px on desktop, 16px on mobile.
- **Rhythm:** An 8px linear scale (4, 8, 16, 24, 32, 40, 48, 64) ensures consistent vertical rhythm between card components and sections.
- **RTL Considerations:** Layout directions flip entirely for Arabic. Margins and padding defined as `padding-inline-start` to ensure consistency across locales.

## Elevation & Depth
The design system uses **Tonal Layering** supplemented by subtle **Ambient Shadows**. This creates a hierarchy that feels grounded and professional rather than "floaty."

- **Level 0 (Background):** #F8FAFC (Slate 50).
- **Level 1 (Cards/Tables):** White surface with a 1px border in Slate 200 and a 2px soft shadow (Alpha 0.05).
- **Level 2 (Dropdowns/Modals):** White surface with a 1px border in Slate 300 and a 12px diffused shadow (Alpha 0.1).
- **Interactive:** Hover states on interactive cards use a slight lift (move -2px Y-axis) and a primary-colored 2px left-border (or right-border in RTL).

## Shapes
The shape language is **Soft (0.25rem)**. This "near-sharp" aesthetic communicates precision and legal rigor while maintaining a modern software feel.

- **Buttons/Inputs:** 4px radius (Soft).
- **Cards/Modals:** 8px radius (Rounded-lg).
- **Status Badges:** Full-round (Pill) to distinguish them from interactive buttons.

## Components

### Case Status Badges
Badges are pill-shaped with a low-opacity background tint and high-contrast text.
- **Ongoing:** Light Blue background / Tertiary Blue text.
- **Closed:** Light Gray background / Slate 700 text.
- **Pending Najiz Sync:** Light Amber background / Dark Amber text + "Sync" icon.

### Financial Data Cards
Used for "Billable Hours" and "Collections."
- **Structure:** Large Display-SM value (Inter font), Title-XS label, and a small Sparkline or Percentage trend indicator in the bottom right corner.
- **Visuals:** Left-aligned (RTL-Right) accent bar in Secondary Green or Primary Navy to categorize data types.

### Najiz Integration Indicators
- **Connected:** Emerald Green dot icon + "Synced with Ministry of Justice" label.
- **Disconnected:** Crimson Red "Warning" icon + "Connection Lost" button for re-authentication.

### Professional Tables
- **Header:** Slate 100 background, bolded Label-MD text.
- **Rows:** 1px border-bottom, subtle hover highlight in Slate 50.
- **Density:** Tight vertical padding (12px) to allow for maximum data visibility without scrolling.

### Inputs & Buttons
- **Primary Button:** Solid Deep Navy with white text.
- **Secondary Button:** White background with 1px Slate 300 border.
- **Form Fields:** Clear labels above the field; focus state uses a 2px Emerald Green ring to signify "Active/Ready."