# PipStart Platform

The PipStart Platform is a pnpm/Turborepo monorepo containing two related educational products:

- **PipStart** — the main Forex and cryptocurrency education platform.
- **Skillcima** — a standalone beginner-focused educational acquisition microsite.

The project is owned by **Kibubu Pay**.

---

## Project purpose

PipStart is being built to provide structured, beginner-friendly and risk-conscious education for people learning about Forex and cryptocurrency.

Skillcima serves as the educational acquisition layer. Its first experience is a free five-day Forex Foundations course designed for complete beginners.

The products are intentionally separated so Skillcima can remain a focused acquisition experience while PipStart develops into the broader education platform.

---

## Repository structure

```text
pipstart-platform/
├── apps/
│   ├── pipstart/
│   └── skillcima/
├── packages/
│   ├── brand/
│   ├── content/
│   ├── types/
│   ├── ui/
│   └── validation/
├── .github/
│   └── workflows/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md