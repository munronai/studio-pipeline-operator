# pipeline-fields.md — The Write-Back Taxonomy

Every **PIPELINE UPDATE** line uses **only** these values. Invent nothing. If a value isn't here, it isn't valid.

---

## STAGES (funnel order)
```
new · contacted · replied · qualifier · diagnostic · proposal · won
```
Plus `lost` (outside the funnel). Labels: New · Contacted · Replied · Qualifier · Diagnostic · Proposal · Won / Signed · Lost.

## OPEN_STAGES (an active, working opportunity)
```
contacted · replied · qualifier · diagnostic · proposal
```
`new` is unworked; `won`/`lost` are closed.

## CHANNELS (how the touch went out)
```
call · sms · email · linkedin · walk-in · referral · other
```

## OUTCOMES (the result of a touch) + labels
| Value | Label |
|---|---|
| `sent` | Sent |
| `no_answer` | No answer |
| `voicemail` | Voicemail |
| `replied` | Replied |
| `booked` | Booked |
| `callback` | Callback |
| `nurture` | Nurture |
| `not_interested` | Not interested |
| `wrong_number` | Wrong number |
| `drafted` | Drafted (not sent) |

## DECLINE_REASONS (captured on every `lost`) + labels
| Value | Label |
|---|---|
| `budget-floor` | Below budget floor |
| `timeline` | Timeline mismatch |
| `scope-mismatch` | Scope mismatch |
| `not-a-fit` | Not a fit |
| `vendor-mode` | Wants a vendor, not a partner |
| `no-decision-maker` | No decision-maker |
| `competitor-chosen` | Chose a competitor |
| `bad-timing` | Bad timing |
| `ghosted` | Ghosted |
| `studio-declined` | Studio declined |
| `referred-elsewhere` | Referred elsewhere |

---

## Hard walk-away flag → decline_reason mapping
When a flag fires (`walk-away-flags.md`), write `stage: lost` with the matching reason:

| Flag key | decline_reason |
|---|---|
| `budget-below-floor` | `budget-floor` |
| `timeline-impossible` | `timeline` |
| `wrong-scope` | `scope-mismatch` (or `referred-elsewhere` if you referred) |
| `excluded-industry` | `studio-declined` |
| `vendor-labor` | `vendor-mode` |
| `no-decision-maker` | `no-decision-maker` |
| `pricing-pressure` | `studio-declined` |

`ghosted` = two follow-ups, no reply. `competitor-chosen`/`bad-timing` = lead-reported. `not-a-fit` = soft non-fit.

---

## Re-entry rule (sets whether `lost` is dormant or dead)
- Lost to **`bad-timing`** or a **budget that may grow** → 60–90 day nurture re-entry.
- Lost to **`vendor-mode`, `studio-declined`, `scope-mismatch`, `not-a-fit`** → archive, no re-entry.

---

## Valid PIPELINE UPDATE examples
```
stage: contacted · grade: B · channel: call · outcome: no_answer · next_action_due: +2d
stage: qualifier · grade: B+ · outcome: booked
stage: lost · decline_reason: budget-floor
stage: lost · decline_reason: ghosted
stage: won · grade: A · tier: standard
```
Use a grade only from `A+ · A · B · C · D`. A tier only from `express · standard · build · retainer`.
