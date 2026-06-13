# the-pipeline.md — The Stages and the Funnel Math

The diagnostic-first funnel. Locate every lead on exactly one stage, then run that stage's station rule.

```
new → contacted → replied → qualifier → diagnostic → proposal → won
                                                                    (lost — off to the side)
```

---

## The 7 stages (funnel order)

| # | Stage | What it means | Exit when |
|---|---|---|---|
| 1 | `new` | Raw lead, gated + graded, not yet touched | First touch is sent → `contacted` |
| 2 | `contacted` | A touch went out (call/email/SMS), no reply yet | They reply → `replied`; 3 dials no answer → nurture |
| 3 | `replied` | They responded to the touch (positive engagement) | You book the qualifier → `qualifier` |
| 4 | `qualifier` | 15-min fit call; the 5 questions get asked | Proceed → `diagnostic`; decline/refer → `lost` |
| 5 | `diagnostic` | 60-min full diagnostic; prescription gets formed | Proposal drafted → `proposal`; mid-call fit problem → `lost` |
| 6 | `proposal` | Written proposal sent, one specific price | Accepted → `won`; declined/ghosted → `lost` |
| 7 | `won` | Signed engagement, into delivery | Terminal (hands off to the engagement layer) |

`lost` sits **outside** the funnel. Any stage can exit to `lost` with a decline reason (`pipeline-fields.md`).

---

## OPEN_STAGES (an active, working opportunity)

```
contacted · replied · qualifier · diagnostic · proposal
```

`new` is not yet worked. `won` and `lost` are closed. Everything in OPEN_STAGES has a next action and a due date — a lead at rest in one of these is a lead decaying.

---

## The funnel math (the operator's targets)

| Transition | Rate | What it means |
|---|---|---|
| inquiry → qualifier | **70–80%** | Most inquiries should reach the qualifier. The gate kills the obvious nos; the qualifier is the real filter. |
| qualifier → diagnostic | **20–30%** | Only a fifth-to-a-third pass the qualifier. A qualifier that advances everyone is broken. |
| diagnostic → signed | **50–70%** | A good diagnostic closes the majority it runs. |
| **end-to-end (inquiry → client)** | **~10–15%** | Roughly one in eight inquiries becomes a paying client. |

These bound your dispositions:
- Higher than this usually means **under-pricing or under-scoping** (the qualifier is too loose).
- Lower usually means **bad lead qualification upstream** (the gate/scoring is letting junk through).
- Target **decline rate: 50–70% of inquiries.** Under 50% = taking too many wrong-fit leads. Over 70% = the qualifier is filtering before the data is in.

Use these as the sanity check on a board summary: if a stage's conversion is way off the band, that's the disposition to flag.
