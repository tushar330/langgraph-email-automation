# Agentia v2 — "Iris" Redesign · Developer Handoff

**Scope:** presentation-layer only. This is a faithful HTML/React prototype of the redesigned UI to serve as the visual + motion north-star for porting into your Next.js app. **No business logic, API contract, store shape, route, or workflow was changed in intent** — the prototype reproduces your existing data flow so you can see exactly how the new skin maps onto current behavior.

The prototype lives in `agentia/` and opens at `agentia/Agentia.html`.

---

## 1. What changed (design only)

| Area | Before | After |
|---|---|---|
| Palette | Orange `#ff6b00` on near-black `#030303` | **Cool deep-ink** (`#07080d`, blue-violet undertone) + **luminous Iris-violet** accent. Semantic green/amber/red **reserved exclusively** for status & confidence so the accent never collides with meaning. |
| Accent | Hard-coded orange | CSS variables (`--accent`, `--accent-bright`, `--accent-deep`, `--accent-rgb`). **Swappable live** via Tweaks: Iris / Azure / Aqua / Ember. |
| Type | Geist / Inter + mono | **General Sans** (display/body) + **JetBrains Mono** (micro-labels, metrics, code). |
| Motion | Mostly static | Cinematic easing `cubic-bezier(.22,1,.36,1)`, scroll-reveal stagger, pointer parallax orbs, 3D card tilt, animated graph edges (flowing dashes), count-ups, status pings. |
| Depth | Flat cards | Layered glass surfaces, soft elevation scale (`--e1/2/3`), accent glow, atmospheric gradient + masked grid. |
| A11y | — | Visible `:focus-visible` rings, `prefers-reduced-motion` honored, toggles use `aria-pressed`, hit targets ≥ 40px. |

The design tokens are centralized in **`agentia/styles.css`** — that file is the single source of truth to mirror into your Tailwind theme / `globals.css`.

---

## 2. File-by-file mapping to your repo

Your repo → prototype equivalent. Port the **styling/markup**, keep **your** logic.

| Your file | Prototype file | Notes |
|---|---|---|
| `frontend/src/app/globals.css` + `@theme` | `agentia/styles.css` | Replace color tokens. Keep your Tailwind setup; copy the `--accent*`, `--ink-*`, `--ok/warn/bad`, radii, elevation, and `--ease` variables. |
| `frontend/src/app/layout.tsx` (fonts) | `<head>` of `Agentia.html` | Swap Geist → General Sans + JetBrains Mono (`next/font` or `<link>`). |
| `components/shared/Header.tsx` | `agentia/components.jsx` | New pill nav, animated active state, ping badge on the review tab driven by `pausedExecutions` count. **Keep your `usePathname()` / `<Link>` routing** — the prototype's `store.page` is only a stand-in for your router. |
| `app/page.tsx` (landing) | `agentia/landing.jsx` | Hero, feature cards, interactive stage list, tech grid, footer. Pure presentation — wire your existing CTAs/links. |
| `app/simulation/page.tsx` + `simulation/*` | `agentia/simulation.jsx` | `EmailSelector`, `SimulationControls`, force-review toggle. Keep your `useWorkflowStore` calls & fetch trigger. |
| `app/workflow/page.tsx` + `workflow/CustomNode.tsx`, `LogsTimeline.tsx` | `agentia/graph.jsx`, `agentia/workflowpage.jsx` | Restyled React-Flow node card (`GraphNode` ≈ `CustomNode`), animated edges, expandable log rows, metrics. **Keep `@xyflow/react`** — port the node's inner JSX/classes into your `CustomNode`. |
| `dashboard/MetricsPanel.tsx` | `MetricsPanel` in `agentia/graph.jsx` | Same four metrics (status, category+conf, draft conf, step count), restyled. |
| `review/page.tsx` + `review/ReviewForm.tsx` | `agentia/review.jsx` | Queue list, editable draft textarea, approve/discard with confirm flash. Keep your approve/reject API calls. |

Support files (no repo equivalent — prototype plumbing only): `data.jsx` (mock emails + graph topology + scripted runs + a Zustand-like store mirroring `useWorkflowStore`), `driver.jsx` (simulates your backend execution stream), `primitives.jsx` (reveal/tilt/count-up hooks), `icons.jsx`.

---

## 3. Confidence & status color contract (important)

Status meaning is **decoupled** from the brand accent. Port these exactly so a re-theme never changes what a color *means*:

- `--ok` (green) = completed / sent / trusted (confidence ≥ 0.75)
- `--warn` (amber) = needs review / low confidence (0.5–0.75)
- `--bad` (red) = failed / discarded (< 0.5)
- `--accent` (themeable) = "running" / active / brand only — **never** a status.

`confColor(score)` in `primitives.jsx` encodes the 0.75 / 0.5 thresholds — match your backend's `RESPONSE_CONFIDENCE_THRESHOLD`.

---

## 4. Functionality preserved (verification notes)

The prototype reproduces — and was tested against — your real flows:

- **Email set**: all 6 `mock_emails.json` records, verbatim sender/subject/body.
- **Classification routes**: product_enquiry → RAG path; complaint/feedback → direct draft; unrelated/spam → skip & archive (no reply). Matches the LangGraph conditional edges.
- **Rewrite loop**: the furious-feedback email demonstrates the proofreader → rewrite cycle back to the writer.
- **Confidence gate**: drafts < 0.75 (or "Force Human Review" on) pause execution, cache state into `pausedExecutions`, and surface on the Review board — exactly your human-in-the-loop pause/resume.
- **Operator resume**: approve (optionally edited) → send + log; discard → archive + log.

Driving the new UI does **not** alter any of this — it only restyles the surface. When porting, you are changing className/markup/tokens, not the store reducers or the FastAPI calls.

---

## 5. Theming (Tweaks → production)

The Tweaks panel (top toolbar) flips: **Accent** (Iris/Azure/Aqua/Ember), **Motion** (crisp/cinematic), **Depth & glass**, **Background grid**. In production these map to a CSS-variable theme — pick the accent your brand lands on, copy that `--accent*` set into `globals.css`, and you're done. `applyAccent()` in `app.jsx` shows the exact variable values per theme.

---

## 6. Port checklist

1. Copy color/spacing/motion tokens from `styles.css` → your Tailwind `@theme` / `globals.css`.
2. Swap fonts in `layout.tsx`.
3. Restyle components top-down (Header → Landing → Simulation → Workflow/Node/Logs → Review), keeping every hook, store selector, and fetch untouched.
4. Verify the status-color contract is intact after theming.
5. Keep `@xyflow/react`, Framer Motion, and Zustand — the redesign is compatible with all three.
