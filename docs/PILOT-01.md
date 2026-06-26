# PILOT-01 — External Adopter Pilot

> **Purpose:** watch a developer who knows little/nothing about DOEH go
> **clone → brand → smoke → build → submit**, and record exactly where they
> struggle. The friction is the deliverable — it tells us whether to pull PD-02
> (self-serve sandbox keys), improve docs, or do nothing. **Do not coach mid-run**
> beyond what the docs say; silence reveals the real gaps.
>
> Copy this file to `PILOT-02.md`, `PILOT-03.md`, … for each new pilot.

## Participant

| Field | Value |
|---|---|
| Developer (handle) | |
| Date | |
| Prior DOEH knowledge | none / some / a lot |
| Machine | |
| OS | |
| Node version | |
| pnpm version | |
| Expo/EAS account ready? | yes / no |
| Time started | |
| Time first success (app running on device) | |
| **Time-to-first-success** | |

## The pipeline (record duration + friction per step)

For each step: how long, what commands they actually ran, what broke, which doc
they opened, and any wording that confused them.

### 1. Clone
- Repo: `git clone git@github.com:beyondplusmyanmar-lab/doeh-loyalty-template.git`
- Duration:
- Friction / doc opened:

### 2. Bootstrap — `pnpm bootstrap`
- Duration:
- Friction:

### 3. Branding — edit `brand.json`, then `pnpm validate:brand`
- Duration:
- Friction (schema clarity? which fields are required? assets?):

### 4. Doctor — `pnpm doctor`
- Duration:
- Friction (did it catch what they got wrong? was the message actionable?):

### 5. Sandbox smoke — `pnpm smoke:sandbox`
- **Did they have a sandbox key?** yes / no — *if no, HOW did they try to get one, and where did they stall?* ← this is the PD-02 signal
- Duration:
- Friction:

### 6. Run the app — `pnpm start` (Expo) on device/simulator
- Duration:
- Friction (mock mode vs real key? Settings screen? login?):

### 7. EAS preview build
- Duration:
- Friction (bundle id naming? credentials? EAS account?):

### 8. Store submission — TestFlight / Play internal
- Reached it? yes / no
- Duration:
- Friction:

## Rollup

| Question | Answer |
|---|---|
| Questions they asked out loud | |
| Docs opened (in order) | |
| Confusing wording (verbatim quotes) | |
| Abandonment point (if any) | |
| Would they ship this app? | yes / no |
| Overall rating (1–5) | |
| **Severity** (blocker / high / medium / low) | |

## Business signal (ask after the run — these probe the model, not the DX)

> The pilot tests a hypothesis: that a merchant/developer will **clone → brand →
> deploy broker → submit** rather than buy a SaaS app from DOEH. These questions
> reveal whether the model holds, independent of how smooth the tooling felt.

| Question | Answer |
|---|---|
| Would you use this for a real client? | yes / no — why |
| Would you pay for a DOEH-hosted broker? | yes / no — what price feels fair |
| Would you rather just use a SaaS loyalty app? | yes / no — why |
| Biggest concern | |
| Biggest surprise | |
| What almost made you stop | |

*Read against the promotion signals below: "pay for hosted broker" / "hate running
the broker" → **M8**; "rather use SaaS" → revisit the platform-vs-product thesis.*

## Top fixes this pilot surfaced

1.
2.
3.

## Promotion signals (fill only if observed — do NOT pre-empt)

- [ ] Couldn't get a sandbox key → evidence to **pull PD-02** (self-serve sandbox keys)
- [ ] Asked for publishable keys / "why do I need a broker?" → evidence toward **M8**
- [ ] Broker deploy confusing → improve `broker/README.md` / `DEPLOYMENT-MODES.md`
- [ ] Wanted a product catalog → evidence toward **Catalog Read** epic
- [ ] Smooth all the way to store → **validates current SDK + Starter Kit model** (do nothing)
