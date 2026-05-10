# Paid Media Budget Planner — 2026 Redesign

These 8 files replace the existing files in your repo. The folder structure here mirrors `src/` exactly, so the simplest move is to drop the `src/` folder from this download into `C:\Users\gavin\Desktop\budget-tool\` and let it overwrite.

## Files included

| File | Path in repo |
|---|---|
| styles.css | `src/styles.css` |
| App.jsx | `src/App.jsx` |
| UI.jsx | `src/components/UI.jsx` |
| Breakdowns.jsx | `src/components/Breakdowns.jsx` |
| HardCommitments.jsx | `src/components/HardCommitments.jsx` |
| ChangeLog.jsx | `src/components/ChangeLog.jsx` |
| RegionEnvelope.jsx | `src/components/budget/RegionEnvelope.jsx` |
| ScoringMatrix.jsx | `src/components/regional/ScoringMatrix.jsx` |

## What changed

Every change is encapsulated in these 8 files. No new dependencies. No build/tooling changes.

**Brand**: TI red `#CC0000` → Science Blue `#0251D6` everywhere.

**Surfaces**: Pure white pages → off-white `#F7F7F8` page with white cards. 10px corner radius on cards (was 2px).

**Header**: Stacked black header + black tabs row → single white horizontal bar with brand mark, inline tabs, and "Auto-saved" trailing indicator. Active tab is now a solid Science Blue pill (was ALL CAPS underline).

**Strategic labels**: Old soft red/green/amber/slate → maturity-graded grayscale gradient. Build is the lightest (newest market), Defend is dark slate with white text (most established). The visual weight of each tag now encodes maturity.

**Validators**: Bright green "sums correctly" banner → neutral surface with green status dot only.

**Buttons & inputs**: 6px radius, sentence case, borderless inputs until focus (Science Blue ring on focus).

**Section headers**: Red vertical bars removed. Section hierarchy now established with weight + spacing only.

**Donut chart**: TI-red palette → Science Blue accent leading a slate gradient that mirrors the strategic label progression.

## To deploy

After replacing the files:

```powershell
cd C:\Users\gavin\Desktop\budget-tool
npm run build
git add .
git commit -m "Redesign: 2026 visual system — Science Blue accent, maturity-grayscale labels, modern surfaces"
git push
```

GitHub Pages will rebuild automatically and deploy to:
https://rn7m6hw989-boop.github.io/paid-media-budget-planner/

## Verifying before you push

To preview locally first:

```powershell
npm run dev
```

Visit `http://localhost:5173`. Click through Budget allocation, Objectives & priorities, Regional analysis, Change log, Settings — each page should look like the final mockups.

If anything renders unexpectedly, double-check that all 8 files were copied (especially `styles.css`, which carries the design token changes).
