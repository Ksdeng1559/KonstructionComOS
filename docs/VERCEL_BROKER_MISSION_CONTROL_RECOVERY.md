# Broker Mission Control — Vercel deployment recovery

**Observed:** October 21, 2026  
**Project:** `broker-mission-control` (`prj_FtZ3yi4hzyZcOLUjHNPg04bZMuF0`)  
**Vercel team:** `dennis-projects-90b236e8`  
**Source repository:** `Ksdeng1559/KonstructionComOS`  
**Feature branch:** `feature/leadsniper-multisource-discovery`

## Verified failure

The latest inspected failed deployment `dpl_8hStSKzKWtz5Xf3d5Fy6yLbzER1j` (commit `ea02a25`) reports:

```text
NOW_SANDBOX_WORKER_ROOTDIR_NOT_EXIST
The specified Root Directory "docs/mission-control/prototype" does not exist. Please update your Project Settings.
```

The repository's Next.js application is at the **repository root**, confirmed by root-level `package.json` (`next build` script) and `src/app`. The former `docs/mission-control/prototype` setting is invalid for this branch. The build stops before compilation; no application-code or runtime failure can yet be inferred.

## Recovery procedure (Vercel project settings)

1. Open [Broker Mission Control on Vercel](https://vercel.com/dennis-projects-90b236e8/broker-mission-control).
2. Go to **Settings → Build and Deployment → Root Directory** and clear `docs/mission-control/prototype`, so the repository **root (`./`)** is used. Do **not** set `src/app` as the root: the actual `package.json` is in `./`.
3. Confirm the Git connection points to `Ksdeng1559/KonstructionComOS` and the desired branch is selected for preview. Set framework to **Next.js**, if automatic detection does not apply; use `npm run build` / `next build`. Do not overwrite existing environment variables or credentials.
4. Trigger a **preview** redeployment for `feature/leadsniper-multisource-discovery` after saving settings. If necessary use **Redeploy** on the latest failed deployment (prefer a fresh commit that matches the intended code).
5. Verify the new build reaches `READY`, check build output and the deployed `/` and `/business-search?q=...` routes, and test search-text persistence, synthetic prospect disclaimer, and optional enrichment controls.
6. Audit server-side environment variables, Clerk authentication, tenant isolation, API quotas and Supabase RLS before considering production release. Do not promote or assign a production alias until reviewed.

## Operational safeguards

- A GitHub commit alone **cannot change** Vercel's project-level Root Directory. The fix must be made in Vercel settings by a project administrator (or through an appropriately authorized Vercel project-settings API action).
- A preview may deploy automatically from a feature-branch push, but with the wrong Root Directory it will fail again.
- `/business-search` is currently a **fictional prototype**, not a working live business lookup. Do not describe it as production-ready or sell real-time enrichment until providers, data rights, verification, persistence, security and tests are in place.
- Keep the separate `mix-commercial-financing` Vercel project unchanged. At inspection its production deployment was `READY`; the homepage returned HTTP 200.

**Source:** [Vercel failed deployment inspection](https://vercel.com/dennis-projects-90b236e8/broker-mission-control/8hStSKzKWtz5Xf3d5Fy6yLbzER1j).
