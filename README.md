# Paid Media Budget Planner

A weighted-scoring tool for planning and managing paid media budgets across campaigns, programs, regions, and business priorities.

## What it does

Divides an annual paid media budget across known campaigns using weighted multipliers across three dimensions: **marketing objectives**, **business priorities**, and **regions**. Supports hard commitments (locked contractual spend), test reserves (for experiments), hold-back reserves (for mid-cycle campaigns), and per-campaign manual adjustments and locks. Every meaningful change is logged for audit.

## Key concepts

| Term | Definition |
|---|---|
| **Annual global budget** | The total paid media budget for the fiscal year. |
| **Hard commitments** | Locked, non-discretionary spend tied to signed contracts. Always editable but never rebalanced. |
| **Test reserve** | % of budget set aside for experiments and learning. |
| **Hold-back reserve** | % of budget set aside for mid-cycle campaigns that emerge after planning. New campaigns draw from here; cancellations return here. |
| **Campaigns** | Discretionary, weighted allocations across known campaigns. |
| **Locked campaign** | A campaign whose dollar amount is frozen — protected from rebalancing but still editable. |
| **Manual adjustment** | A campaign-level override of the model recommendation, capped at ±50% (configurable). |
| **Rebalance** | An explicit action that redistributes the unlocked pool across unlocked campaigns by current weights. Never automatic. |

The tool includes a Definitions & Governance section in Settings with full definitions and governance rules for every term.

## Running locally

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (usually http://localhost:5173).

## Building for production

```bash
npm run build
```

The build output is in `dist/`.

## Deploying to GitHub Pages

Two paths — pick whichever fits your setup.

### Option A: GitHub Actions (recommended)

1. Push this repo to GitHub.
2. In your repo's Settings → Pages, set the source to **GitHub Actions**.
3. Add this file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. Push to main. The workflow builds and deploys automatically.

### Option B: gh-pages CLI (manual)

```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d dist
```

In repo Settings → Pages, set source to "Deploy from a branch" → `gh-pages` → root.

### Note on base path

`vite.config.js` is set to `base: './'` which works on most hosts. If your GitHub Pages URL is `https://username.github.io/your-repo/`, this relative-path setup handles routing correctly without further changes.

## Data persistence

The tool stores all data in **localStorage** (browser-only). To share plans across users or back up your work:

- **Settings → Data management → Export plan as JSON** downloads a snapshot.
- **Settings → Data management → Import plan from JSON** loads a snapshot.

Your data does not leave your browser. Clearing browser storage will wipe the plan unless you've exported a backup.

## Tech stack

- **React 18** with Vite
- **Recharts** for charts
- No backend — fully static, deployable anywhere

## What v2 might add

- Multi-user collaboration (requires backend)
- Saved scenarios and side-by-side comparison
- Brand-to-demand blending in regional weights
- PWA installability (offline mode, home-screen install)
- Connectors to ad platform APIs for actual-vs-plan tracking
