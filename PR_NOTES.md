Summary of changes for PR

What changed:
- Backend: `supabase/functions/generar-rutina/index.ts`
  - Enforce deterministic JSON output by adding a system message instructing the model to return only JSON and setting `temperature: 0`.
  - Added server-side validation & repair of OpenAI output: if any `semana.dias` is a descriptive string, the server expands it by cloning semana 1 and applying heuristics (RPE overrides, series increments, reductions).
  - Improved error handling and guards for non-string or empty responses.

- Frontend:
  - `app/(tabs)/index.tsx`: removed dev-only debug UI (modal and raw JSON dump) and cleaned unused imports. Kept defensive rendering logic.
  - `hooks/tabs/useHomeScreenData.ts`: now uses a shared utility to normalize/expand `rutina_periodizada`.
  - `app/utils/expandRoutine.ts`: new shared utility that normalizes and expands descriptor weeks into concrete `dias` arrays.

- Tests & scripts:
  - `scripts/test_expand_routine.ts`: small test harness to validate the expansion logic (may require ts-node config adjustments locally).

Why:
- The OpenAI generator sometimes returned human-readable instructions in `dias` for weeks 2..6 instead of concrete arrays. This caused the app to show empty weeks. Repairing at the server avoids frontend-only hacks and ensures consistent data for all clients. The frontend util remains as a safe fallback.

Notes for reviewers:
- The Edge Function changes are intended to run in Supabase's Deno environment. Local TypeScript/IDE may show warnings about `Deno` globals or remote imports; those are expected when editing locally.
- Please test onboarding (regenerate routine) in a staging Supabase environment to ensure the function returns `rutina_periodizada` with arrays for all weeks.

How to test locally (quick):
1. In the app, run `npx expo start` and confirm Home shows upcoming days.
2. Re-run onboarding/generate routine to get a fresh JSON from the Edge Function and verify `rutina_periodizada` contains arrays in all weeks.

If you want, I can prepare a PR branch and create a PR description and checklist — tell me the target branch name and PR title you'd like.
