# TSP-01 Research Edition 02 — Authoring data

Site structure: `/research/{chapter}/` is an expandable editorial landing page; `/reports/{chapter}/{slug}/` is a standalone report with its own source trace; `/reports/` is the cross-chapter library.

There are nine chapters grouped into three domains: Instruments & Assets, Capital & Markets, Infrastructure & Assurance. Chapter 03 Funding & Settlement Instruments is supporting context, while chapters 01, 02 and 04 emphasize tokenization, asset backing and capital circulation.

The reports are stored in `data/reports/{chapter}.json`; the evidence catalog is `data/source-registry.json`; `data/catalog.json` lists canonical report links. Reports contain sections for literature, architecture, synthetic worked cases, failure modes, experiments and conclusions.

To add a study, create a new unique slug in its chapter data, verify primary sources and state evidence/assumptions explicitly, then regenerate its standalone page, chapter index, and cross-chapter report library. Maintain versioned editorial review before updating the published TSP-01 edition.

The figures and financial cases are TSP-01 conceptual designs and synthetic scenarios, not representations of actual transactions or achieved market performance. Original supplied Google Drive papers were sampled, not exhaustively reviewed.
