# Handoff: Agentia v2 "Iris" Visual Redesign

## Overview
This is a **visual + UX redesign** of the existing Agentia "Observable AI Workflow Automation System" — a Next.js + TypeScript app for AI email orchestration (LangGraph · ChromaDB · Groq · Gemini · React Flow · Zustand). The redesign re-skins all four screens (Landing, Simulation, Live Workflow, Human Review) with a new identity, motion system, and depth treatment.

**This is a presentation-layer task. Do NOT change business logic.** Preserve every API call, store reducer, route, auth flow, data-fetch, form submission, and user workflow. You are swapping markup/classNames/design-tokens — not rewriting behavior.

## About the Design Files
The files in `prototype/` are **design references created in HTML/React-via-Babel** — a runnable prototype showing the intended look, motion, and behavior. **They are not production code to copy verbatim.** Your job is to **recreate this design inside the existing Next.js codebase** using its established patterns: keep Tailwind, `@xyflow/react`, Framer Motion, Zustand (`useWorkflowStore`), the App Router, and the FastAPI integration exactly as they are. Port styling and structure, not the prototype's mock store/driver.

Open `prototype/Agentia.html` in a browser to see the target. Use the **Tweaks** panel (top toolbar) to preview accent options.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, motion, and interactions are all specified below and in `prototype/styles.css` (the token source of truth). Recreate pixel-faithfully using the codebase's libraries.

## Target identity (the change in one line)
From **orange (`#ff6b00`) on near-black** → **cool deep-ink canvas with a luminous Iris-violet accent**, General Sans + JetBrains Mono, cinematic motion. Semantic green/amber/red are **reserved exclusively for status/confidence** and must never be replaced by the brand accent.

---

## Design Tokens
All defined in `prototype/styles.css` `:root`. Mirror these into the Tailwind `@theme` / `globals.css`.

### Color — canvas / ink (cool, blue-violet undertone)
- `--ink-900 #07080d` (page base) · `--ink-850 #0a0c13` (sunk) · `--ink-800 #0e111a` (surface)
- `--ink-750 #131724` (raised card) · `--ink-700 #1a1f30` (hover) · `--ink-650 #222840` (active)

### Color — hairlines
- `--line rgba(255,255,255,.07)` · `--line-2 rgba(255,255,255,.11)` · `--line-strong rgba(255,255,255,.18)`

### Color — text
- `--fg #eef0f6` · `--fg-dim #a7adbe` · `--fg-faint #6b7287` · `--fg-ghost #444b5e`

### Color — accent (themeable; default = Iris)
- `--accent oklch(0.70 0.17 285)` · `--accent-bright oklch(0.82 0.15 285)` · `--accent-deep oklch(0.58 0.17 285)`
- `--accent-rgb 139,120,255` (for rgba glows) · `--accent-ink #0a0712` (text on accent fills)
- Alt themes (hue / rgb): **Azure** 248 / `96,135,255` · **Aqua** 190 / `54,211,224` · **Ember** 42 / `247,170,74`. Pick one for production; copy that `--accent*` set in. (See `applyAccent()` in `prototype/app.jsx`.)

### Color — semantic (RESERVED — never re-theme these)
- `--ok oklch(0.80 0.15 152)` green = completed / sent / trusted (conf ≥ 0.75)
- `--warn oklch(0.83 0.13 80)` amber = needs review / low conf (0.5–0.75)
- `--bad oklch(0.67 0.20 23)` red = failed / discarded (< 0.5)
- `--info oklch(0.74 0.13 235)` blue = informational
- `--accent` = "running"/active/brand only — **never a status.**

### Radii
`--r-xs 8` · `--r-sm 11` · `--r 15` · `--r-lg 20` · `--r-xl 28` (px)

### Elevation
- `--e1 0 1px 2px rgba(0,0,0,.4)`
- `--e2 0 8px 24px -8px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.4)`
- `--e3 0 30px 60px -20px rgba(0,0,0,.7), 0 8px 24px -10px rgba(0,0,0,.5)`
- `--glow 0 0 40px -6px rgba(var(--accent-rgb),.35)`

### Motion
- `--ease cubic-bezier(.22,1,.36,1)` (cinematic default) · `--ease-soft cubic-bezier(.4,.14,.2,1)`
- Reveal-on-scroll: opacity 0→1 + translateY(28px→0), 0.8s, staggered via `transition-delay`.
- Reduced-motion: all animation/transition collapsed; revealed content forced visible (already handled in `styles.css`).

### Typography
- Display/body: **General Sans** (400/500/600/700). Headings: weight 600, `letter-spacing: -0.02em` to `-0.035em`, `line-height` 1.04–1.1.
- Mono micro-labels/metrics/code: **JetBrains Mono**. The `.kicker` style = 10.5px, `letter-spacing .22em`, uppercase, 600, accent-bright.
- Min sizes: body 13–15px; never below 11px except mono micro-labels (8.5–10px).

---

## Screens / Views

### 1. Header (`components/shared/Header.tsx` ← `prototype/components.jsx`)
- Sticky, `backdrop-blur`, bottom hairline. Left: logo mark (gradient rounded square + "AGENTIA / WORKFLOW ENGINE" mono sublabel). Center: pill-group nav (Home, Simulation, Live Workflow, Human Review) with animated active state (raised bg + accent icon). Right: "v2.0 · LIVE" pill with green ping dot.
- The **Human Review** nav item shows an amber ping badge when `pausedExecutions` count > 0.
- **Keep your `usePathname()` + `<Link>` routing.** The prototype's `store.page` is only a router stand-in.

### 2. Landing (`app/page.tsx` ← `prototype/landing.jsx`)
- **Hero**: two-column. Left — pill kicker, word-by-word rising headline ("Visualize autonomous / **AI email workflows**" with accent gradient on line 2), sub-paragraph, two CTAs (`Run a simulation` primary → /simulation, `Explore live graph` ghost → /workflow), and 3 mono stats (8 agent nodes / 0.75 confidence gate / 6 sandbox scenarios). Right — floating glass "STATE_ORCHESTRATOR" dashboard preview with 3D pointer-tilt, drifting node cards, animated dashed connectors, and a live review card.
- Pointer-parallax blurred accent + info orbs in the background.
- **Features** grid (auto-fit, min 280px): 6 tilt cards w/ icon, title, desc + radial pointer-spotlight.
- **Stages** section: left copy + CTA; right interactive vertical stepper that auto-advances every 3s through the 7 workflow stages (highlight + active chip).
- **Tech stack** grid: 7 cards (FastAPI, LangGraph, ChromaDB, Gemini, Groq, React Flow, Next.js) with hover lift.
- **Footer**: logo, blurb, resource links, mono legal row.

### 3. Simulation (`app/simulation/page.tsx` ← `prototype/simulation.jsx`)
- Page header (pulse dot kicker + InfoTip). Two-column: left = email selector panel (300px scroll list of the 6 mock emails — colored tone dot, sender, kind, subject, 2-line body clamp, selected ring) + controls panel (email preview, "Force human review" toggle [`aria-pressed`], big Execute button with spinner when running). Right = MetricsPanel row + graph panel + LogsTimeline.
- Selecting an email sets `selectedEmailId`; Execute triggers the workflow run (your store action / fetch). Disable inputs while executing.

### 4. Live Workflow (`app/workflow/page.tsx` ← `prototype/workflowpage.jsx` + `graph.jsx`)
- Page header; if status is `needs_review`, show a pulsing amber "Paused · review draft" button → /review.
- MetricsPanel (4 cards: Workflow Status, Classified Category + confidence bar, Draft Confidence %, Orchestration Steps count).
- Graph panel (legend: completed/running/pending) + LogsTimeline side panel.
- **Graph node** (`workflow/CustomNode.tsx` ← `GraphNode`): rounded card, icon tile, label + mono sub (the node fn name), status-colored border/glow, running = accent + ping, completed = green + optional confidence %. Port the inner JSX into your React Flow `CustomNode`; **keep `@xyflow/react`**, node ids, and edge topology from your graph definition. Edges animate with flowing dashes when active; gain arrowheads + labels (`product`, `feedback`, `pass`, `low conf`, `approve`).
- **LogsTimeline** (`workflow/LogsTimeline.tsx`): vertical timeline, status dot per row, step name + mono timestamp, message, expandable JSON `details` (`<pre>`). Auto-scrolls to newest.

### 5. Human Review (`review/page.tsx` ← `prototype/review.jsx`)
- Page header + InfoTip. Two-column: left = pending audit queue (cards: sender, subject, category chip, selected ring). Right = work panel: header w/ "Awaiting approval" chip; 3 mini-metrics (classification, classifier conf, draft conf colored by threshold); inbound message block; **editable AI draft** (preview ↔ textarea toggle); actions row (`Discard draft` danger / `Approve & dispatch` primary). On decide → a centered confirm flash (check/x) then resolve.
- Empty state = green shield "Queue is clear" + CTA to /simulation.
- **Keep your approve/reject API calls and store updates.** The prototype edits a local draft string then calls `actions.approve(id, editedText)` / `actions.reject(id)` — map these onto your existing handlers.

---

## Interactions & Behavior
- **Cinematic easing** `cubic-bezier(.22,1,.36,1)` everywhere; buttons lift `translateY(-2px)` on hover, `scale(.98)` on active.
- **Scroll reveal**: sections fade+rise as they enter viewport (IntersectionObserver), staggered. Always provide a fallback that reveals content if the observer doesn't fire (see `useReveal` in `primitives.jsx`).
- **3D tilt** on hero preview + feature cards follows pointer (`perspective(900px)` rotateX/Y, ±6–7°), plus a radial spotlight tracking the cursor.
- **Count-up** animation on numeric metrics/confidence.
- **Status pings** (expanding ring) on running nodes and live indicators.
- **Page transitions**: fade + 8px rise on route change.
- **Confirmation flash** overlay on approve/discard.
- **Loading**: spinner on Execute + "Executing…" status; skeleton shimmer class available.
- All interactive controls have `:focus-visible` rings; respect `prefers-reduced-motion`.

## State Management
Use the **existing `useWorkflowStore` (Zustand)** — do not introduce a new store. The store fields the UI reads: `selectedEmailId`, `forceReview`, `isExecuting`, `currentExecution` (`{ email, category, category_confidence, response_confidence, workflow_status, nodeStatus, logs[], draft }`), `pausedExecutions{}`. The prototype's `data.jsx`/`driver.jsx` only *simulate* these so the design is runnable in isolation — replace with your real store + backend execution stream.

### Confidence/threshold contract
`confColor(score)` encodes 0.75 (trusted) and 0.5 boundaries — match your backend `RESPONSE_CONFIDENCE_THRESHOLD`. Drafts below threshold (or with Force Review on) pause and route to the Review board.

## Assets
No external image assets — all iconography is an inline stroke icon set (`prototype/icons.jsx`, lucide-style, `currentColor`). Replace with `lucide-react` (or your existing icon lib) using equivalent names: cpu, database, shield-check, send, play, activity, terminal, tag, gauge, pen-tool, user-check, inbox, sparkles, etc.

## Files
- `prototype/Agentia.html` — entry; open to view the target design.
- `prototype/styles.css` — **design-token source of truth.**
- `prototype/landing.jsx` · `simulation.jsx` · `workflowpage.jsx` · `review.jsx` — per-screen markup.
- `prototype/graph.jsx` — node card, metrics panel, logs timeline.
- `prototype/components.jsx` — header. `primitives.jsx` — reveal/tilt/count-up hooks + shared atoms. `icons.jsx` — icon set.
- `prototype/data.jsx` · `driver.jsx` · `app.jsx` · `tweaks-panel.jsx` — prototype plumbing (mock store, run simulator, theming). **Reference only — do not port.**
- `MAPPING.md` — concise file-by-file map from prototype → your repo + preserved-functionality checklist.
