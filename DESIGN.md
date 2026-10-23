---
name: HacksonAloysis
description: An evidence-led security portfolio with an editorial archive and case-file visual system.
colors:
  archive-carbon: "#0b0b0a"
  archive-amber: "#ffce1b"
  archive-paper: "#f2ede2"
  hazard-carbon: "#0a0a09"
  hazard-orange: "#f05a28"
  hazard-paper: "#f1ebdd"
  blueprint-ink: "#06111e"
  blueprint-ice: "#8fd8f2"
  blueprint-paper: "#e6eef1"
  paper-white: "#f8fbff"
typography:
  display:
    fontFamily: "Bigger Display, sans-serif"
    fontSize: "clamp(6rem, 16vw, 15rem)"
    fontWeight: 700
    lineHeight: 0.78
    letterSpacing: "-0.045em"
  body:
    fontFamily: "Editorial New, Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.48
  label:
    fontFamily: "Fraktion Mono, monospace"
    fontSize: "9px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  square: "0px"
  circular: "999px"
spacing:
  report-gutter: "clamp(1rem, 4vw, 4rem)"
  section-gap: "clamp(2rem, 5vw, 5.5rem)"
  compact: "0.5rem"
  control-height: "2.75rem"
components:
  audio-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.archive-amber}"
    rounded: "{rounded.square}"
    padding: "0 0.85rem"
    height: "2.75rem"
  evidence-plate:
    backgroundColor: "{colors.blueprint-ink}"
    rounded: "{rounded.square}"
---

# Design System: HacksonAloysis

## 1. Overview

**Creative North Star: “The White Room”**

The White Room is a metaphor for forensic clarity, not a white-first theme. Each project should feel like evidence arranged under clean light: deliberate, legible, and easy to examine. The site keeps its carbon, amber, orange, and ice-blue palette modes while using editorial typography, case-file structure, and personal field notes to make the work feel authored rather than templated.

The experience is evidence-led, editorial, and technically assured. Keep the cinematic motion as atmosphere, never as a barrier to content or operation. On narrow screens, preserve the identity while simplifying layout and motion. The site explicitly rejects generic neon “hacker” styling, template-like SaaS cards, unsupported claims, and any implication that private commercial work is public.

**Key Characteristics:**
- A three-mode palette: Archive, Hazard, and Blueprint.
- Large display type balanced by editorial reading text and precise mono labels.
- Structural paper layers and hard offset shadows in reports; atmospheric depth elsewhere.
- Responsive, keyboard-operable controls and reduced-motion alternatives.

## 2. Colors

The palette is a deliberate set of dark workspaces with warm or cool evidence accents and paper-like reading surfaces.

### Primary
- **Archive Amber** (`#ffce1b`): the default signal color for navigation, evidence marks, controls, and report accents.
- **Hazard Orange** (`#f05a28`): the safety-orange accent in Hazard mode.
- **Blueprint Ice** (`#8fd8f2`): the cool technical accent in Blueprint mode.

### Secondary
- **Archive Carbon** (`#0b0b0a`): default page ground.
- **Hazard Carbon** (`#0a0a09`): the near-black Hazard ground.
- **Blueprint Ink** (`#06111e`): the deep-blue Blueprint ground and technical plate color.

### Neutral
- **Archive Paper** (`#f2ede2`): warm reading surface in the default mode.
- **Hazard Paper** (`#f1ebdd`): warm neutral in Hazard mode.
- **Blueprint Paper** (`#e6eef1`): cool reading surface in Blueprint mode.
- **Report Paper** (`#f8fbff`): light evidence-sheet surface within the project reports.

**The Three-Mode Rule.** Keep Archive as the default. Cycle only Archive → Hazard → Blueprint → Archive; preserve readable contrast and the semantic role of each accent in every mode.

## 3. Typography

**Display Font:** Bigger Display (sans-serif)
**Body Font:** Editorial New (serif)
**Label/Mono Font:** Fraktion Mono (monospace)

**Character:** The display face gives section titles a bold, compressed poster voice. Editorial New carries project explanations and personal narrative; Fraktion Mono handles metadata, status, indices, and small technical labels.

### Hierarchy
- **Display** (700, responsive `clamp(6rem, 16vw, 15rem)`, line-height 0.78): large section and report-cover titles.
- **Headline** (Editorial New, responsive): case titles, subheads, and section-level reading headings.
- **Body** (400, 16px base, line-height 1.48): explanatory copy; keep paragraphs comfortably readable and avoid overly long lines.
- **Label** (Fraktion Mono, usually 8–10px, tracked uppercase): metadata, report indices, captions, and control labels. Do not use this small scale for essential explanatory copy.

## 4. Elevation

Depth is structural, not glassy. Work reports use paper sheets, dark evidence plates, crisp borders, and hard offset shadows to suggest physical documents on a desk. The hero, Field Notes, and Journey create depth through atmosphere, grids, grain, and controlled motion. Do not turn every element into a floating card.

### Shadow Vocabulary
- **Evidence-sheet offset**: a short, hard amber offset behind paper report/index surfaces; use only where the sheet metaphor is meaningful.
- **Ambient scene shadow**: broad, low-opacity shadows under large project plates; separate evidence from the dark field without adding a visible card stack.

**The Physical-Evidence Rule.** A shadow must communicate a physical layer or depth in the scene. If it only decorates a generic container, remove it.

## 5. Components

Components should feel tactile and precise: restrained labels, clear state changes, square geometry, and high-contrast focus treatment.

### Buttons
- **Shape:** square corners for functional controls; circular geometry only for the dedicated back-to-top control.
- **Palette key:** compact, subtle text control; communicate the current palette without a large switch treatment.
- **Audio toggle:** footer control with speaker icon, visible Sound off/Sound on state on larger screens, and an accessible name and pressed state at all sizes.
- **Hover / Focus:** use color and border changes; keyboard focus must remain clearly visible and must not depend on hover.

### Navigation
- **Style:** compact uppercase mono labels in the framed site header.
- **Mobile treatment:** reflow for narrow viewports, maintain an operable menu and palette control, and never require hover or precise pointer gestures.

### Evidence Reports
- **Structure:** one numbered report per project, with a stable index, case notes, visual evidence plate, and concise result.
- **Visual:** paper report body against the darker site ground; evidence media stays inside a consistent plate and scales without cropping essential material.
- **Links:** make approved repositories or original evidence directly findable; do not imply a private commercial project is available publicly.

### Archive and Journey
- **Field Notes:** personal image archive remains distinct from the four selected reports.
- **Journey:** preserve the chronological dossier and rail where screen space permits; provide a readable, reduced-motion path on mobile.

## 6. Do's and Don'ts

### Do:
- **Do** show evidence before claims and label public, private, and withheld material accurately.
- **Do** preserve the “The White Room” principle of forensic clarity while retaining the three approved palettes.
- **Do** keep all core content usable at phone widths, with keyboard access, focus visibility, readable contrast, and reduced-motion support.
- **Do** use Archive Carbon, Archive Amber, and Archive Paper as the default palette roles.
- **Do** use Editorial New for reading, Bigger Display for impact, and Fraktion Mono for metadata.

### Don't:
- **Don't** use generic neon “hacker” styling or stock cyber imagery.
- **Don't** use template-like SaaS dashboards or repetitive card grids.
- **Don't** publish private commercial work, repositories, or evidence without approval.
- **Don't** make motion, hover, or desktop-only interactions necessary to understand or operate the site.
- **Don't** use hard offset shadows where there is no physical evidence-sheet metaphor.
