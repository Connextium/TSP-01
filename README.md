# TSP-01 — Tokenization Structures Programme

**Live:** https://tsp01.connextium.xyz/
**Vercel project:** tsp-01 (prj_MNiKNfm01sc3SQURCcKdJWmr2oaK)
**Intended repository:** Connextium/TSP-01

This is an export of the exact live static HTML/CSS/JavaScript website. The deployed public/ directory contains the animated hero, nine chapter indexes, 22 full research reports, ACTOR, the evidence library, methodology, styles, and research data catalogs.

## Develop and validate

Node.js 20+ is supported. Run npm run build to validate all links, report sections and navigation. To serve locally, run python3 -m http.server 8080 --directory public.

## Connect this repository to the EXISTING Vercel project

1. Create Connextium/TSP-01 on GitHub and push all files to its main branch.
2. Go to the existing Vercel project tsp-01 (not a new import), open Settings → Git → Connect Git Repository and select Connextium/TSP-01. Set main as Production Branch.
3. Keep the existing domains associated with project tsp-01. Build command: npm run build. Output directory: public. Framework: Other / no framework.
4. Check preview and production routes before enabling automatic publication on main.
5. Retain the previous direct-API deployment history for rollback.

## Layout

- public/index.html: Homepage with water-ripple hero
- public/styles.css, hero.js, report-filter.js: visual and interactive assets
- public/research/<chapter>/index.html: 9 chapter landing pages
- public/reports/<chapter>/<slug>/index.html: 22 full report pages
- public/data/catalog.json and public/data/reports/*.json: report metadata and authoring structures
- public/evidence/: evidence registry
- public/methodology/: research methods
- scripts/validate.mjs: checks static routes, pages and content
- .github/workflows/validate.yml: checks pull requests and pushes

## Editorial limitation

This repository contains already-rendered static HTML and the source data. The research JSON is NOT compiled into HTML automatically. When adding or revising a report, update its HTML, the matching chapter index, and the report catalog together; run npm run build before committing.

Numerical scenarios are illustrative unless otherwise attributed. Research sources are selective and should be verified independently for external publication. This repository is not a live financial application.
