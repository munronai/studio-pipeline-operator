import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCREENS_DIR = path.join(ROOT, "_tv", "screens");

function iso(daysFromNow, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

let actSeq = 0;
function aid() {
  return `seed-act-${actSeq++}`;
}

const STAGE_DIRS = {
  new: "01-new",
  contacted: "02-contacted",
  replied: "03-replied",
  qualifier: "04-qualifier",
  diagnostic: "05-diagnostic",
  proposal: "06-proposal",
  won: "07-won",
  lost: "08-lost"
};

const STAGE_NUM = {
  new: 1,
  contacted: 2,
  replied: 3,
  qualifier: 4,
  diagnostic: 5,
  proposal: 6,
  won: 7,
  lost: 8
};

const leads = [
  {
    place_id: "ld-northway-electric",
    stage: "new",
    name: "Northway Electric",
    category: "Electrician",
    owner_name: "Marcus Hill",
    owner_role: "Owner",
    phone: "(720) 555-0142",
    email: "marcus@northwayelectric.example",
    website: null,
    platform: null,
    address: "Aurora, CO",
    rating: 4.6,
    review_count: 38,
    pain_signals: ["No website", "No online booking", "Phone-only intake"],
    description: "Residential + light-commercial electrician, two vans, owner-operated. Strong reviews, zero web presence beyond a Google profile.",
    selling: "A booking-enabled site + Google profile cleanup so jobs stop dying on voicemail.",
    opener: "Marcus — 38 reviews at 4.6 and no website is leaving money on the table. Your competitors are catching the after-hours searches you aren't.",
    fit_score: 84,
    need_score: 9,
    fit_dim_score: 9,
    reach_score: 7,
    pay_score: 7,
    intent_score: 6,
    score_evidence: {
      need: "No site at all — pure voicemail intake. Highest-need profile.",
      fit: "Local service, right size (2 vans), core vertical.",
      reach: "Owner named with a direct line.",
      pay: "Two vans + steady review velocity signals $750+ capacity.",
      intent: "No explicit growth signal yet; needs a qualifier touch."
    },
    discovered_at: iso(-1),
    updated_at: iso(0),
    activities: []
  },
  {
    place_id: "ld-meadow-cleaning",
    stage: "new",
    name: "Meadowlark Cleaning Co.",
    category: "Cleaning",
    owner_name: "Tanya Brooks",
    owner_role: "Owner",
    phone: "(303) 555-0188",
    email: null,
    website: "meadowlarkclean.example",
    platform: "wix",
    address: "Lakewood, CO",
    rating: 4.3,
    review_count: 61,
    pain_signals: ["Outdated Wix site", "No quote form", "Slow mobile load"],
    description: "Residential cleaning crew, 4 staff. Has a dated Wix site with no quote capture.",
    selling: "A conversion-focused rebuild with an instant quote form.",
    opener: "Tanya — your reviews are great but the site is doing none of the selling. A quote form alone would change your week.",
    fit_score: 71,
    need_score: 7,
    fit_dim_score: 8,
    reach_score: 6,
    pay_score: 6,
    intent_score: 5,
    score_evidence: {
      need: "Site exists but converts nothing — moderate need.",
      fit: "Right vertical, right size.",
      reach: "No owner email yet; phone only.",
      pay: "4 staff suggests budget capacity.",
      intent: "No active growth signal."
    },
    discovered_at: iso(-2),
    updated_at: iso(-1),
    activities: []
  },
  {
    place_id: "ld-summit-roofing",
    stage: "contacted",
    name: "Summit Roofing",
    category: "Roofing",
    owner_name: "Dave Sullivan",
    owner_role: "Owner",
    phone: "(720) 555-0110",
    email: null,
    website: null,
    platform: null,
    address: "Denver, CO",
    rating: 4.7,
    review_count: 47,
    pain_signals: ["No website at all", "Hiring two crews", "Google-profile only"],
    description: "Roofing contractor, no website — just a Google Business profile. Currently hiring two crews, which signals active growth.",
    selling: "A full booking-enabled site + lead capture before the hiring ramp outpaces intake.",
    opener: "Dave — you're hiring two crews and you've got no website to feed them. Let's fix the intake before the new crews sit idle.",
    fit_score: 86,
    need_score: 9,
    fit_dim_score: 9,
    reach_score: 7,
    pay_score: 8,
    intent_score: 8,
    score_evidence: {
      need: "Zero web presence — highest need.",
      fit: "Local roofing, owner-operated, core ICP.",
      reach: "Owner Dave named with a phone number.",
      pay: "Hiring two crews signals strong cash flow.",
      intent: "Active hiring = active growth, now."
    },
    deal_value: 6500,
    next_action: "Call Dave — A-tier, lead with the hiring angle",
    next_action_due: iso(0, 14),
    discovered_at: iso(-7),
    updated_at: iso(0),
    activities: [
      {
        id: aid(),
        channel: "system",
        direction: "out",
        outcome: "graded",
        notes: "Operator graded A (86). Routed ADVANCE → call.",
        created_at: iso(-1, 9)
      },
      {
        id: aid(),
        channel: "call",
        direction: "out",
        outcome: "voicemail",
        notes: "Left voicemail with the hiring angle. SMS follow-up queued.",
        created_at: iso(0, 9)
      }
    ]
  },
  {
    place_id: "ld-apex-hvac",
    stage: "contacted",
    name: "Apex HVAC",
    category: "HVAC",
    owner_name: null,
    owner_role: null,
    phone: "(303) 555-0175",
    email: "info@apexhvac.example",
    website: "apexhvac.example",
    platform: "squarespace",
    address: "Denver, CO",
    rating: 4.8,
    review_count: 220,
    pain_signals: ["Owner not named", "Decent site, weak conversion path", "No booking widget"],
    description: "Established HVAC company with a decent Squarespace site, 220 reviews. Owner isn't named publicly — reach is the soft spot.",
    selling: "A conversion layer + booking widget on top of the existing site, not a rebuild.",
    opener: "You've got the reviews and the traffic — what you don't have is a booking path. That's the Angle-3 fix.",
    fit_score: 72,
    need_score: 6,
    fit_dim_score: 8,
    reach_score: 5,
    pay_score: 8,
    intent_score: 6,
    score_evidence: {
      need: "Site exists and works — moderate need, conversion gap only.",
      fit: "Established local HVAC, right vertical.",
      reach: "Owner not named — reach is the weak signal.",
      pay: "220 reviews + established = clear budget.",
      intent: "Steady, no urgent growth trigger."
    },
    deal_value: 3200,
    next_action: "Call into the front office, ask for the owner by role",
    next_action_due: iso(1, 11),
    discovered_at: iso(-7),
    updated_at: iso(-1),
    activities: [
      {
        id: aid(),
        channel: "system",
        direction: "out",
        outcome: "graded",
        notes: "Operator graded B (72). Routed ADVANCE → calling rotation, Angle 3.",
        created_at: iso(-1, 13)
      }
    ]
  },
  {
    place_id: "ld-greenline-landscaping",
    stage: "replied",
    name: "Greenline Landscaping",
    category: "Landscaping",
    owner_name: "Priya Nadakar",
    owner_role: "Co-owner",
    phone: "(720) 555-0203",
    email: "priya@greenlineland.example",
    website: "greenlineland.example",
    platform: "wordpress",
    address: "Littleton, CO",
    rating: 4.5,
    review_count: 96,
    pain_signals: ["Replied to outreach", "Wants seasonal booking", "WordPress is slow"],
    description: "Landscaping + hardscape crew. Replied to the cold email asking about seasonal booking before spring.",
    selling: "A fast rebuild with a seasonal booking calendar ahead of spring demand.",
    opener: "Priya — you replied right as the spring rush is about to start. Let's get the booking calendar live before the phones blow up.",
    fit_score: 81,
    need_score: 7,
    fit_dim_score: 8,
    reach_score: 8,
    pay_score: 7,
    intent_score: 9,
    score_evidence: {
      need: "Has a site but it's slow and bookingless.",
      fit: "Core local vertical, right size.",
      reach: "Replied directly — warmest reach.",
      pay: "96 reviews + hardscape work = budget.",
      intent: "Explicitly asking before the spring rush — high intent."
    },
    deal_value: 4800,
    next_action: "Book the qualifier call",
    next_action_due: iso(1, 15),
    discovered_at: iso(-7),
    updated_at: iso(-1),
    activities: [
      {
        id: aid(),
        channel: "email",
        direction: "out",
        outcome: "sent",
        notes: "Cold intro — seasonal booking angle.",
        created_at: iso(-3, 10)
      },
      {
        id: aid(),
        channel: "email",
        direction: "in",
        outcome: "replied",
        notes: '"Yes — interested in booking before spring. What\'s the timeline?"',
        created_at: iso(-1, 16)
      }
    ]
  },
  {
    place_id: "ld-brightsmile-dental",
    stage: "qualifier",
    name: "Brightsmile Dental",
    category: "Dental",
    owner_name: "Dr. Elena Voss",
    owner_role: "Practice owner",
    phone: "(303) 555-0260",
    email: "office@brightsmiledental.example",
    website: "brightsmiledental.example",
    platform: "wordpress",
    address: "Centennial, CO",
    rating: 4.9,
    review_count: 410,
    pain_signals: ["Qualifier booked", "Wants new-patient funnel", "Aging site"],
    description: "Single-location dental practice, very high review count. In the qualifier — wants a new-patient acquisition funnel.",
    selling: "A new-patient landing funnel + booking integration with their PMS.",
    opener: "Dr. Voss — 410 reviews is a moat. The gap is a funnel that turns searches into booked new patients.",
    fit_score: 91,
    need_score: 7,
    fit_dim_score: 9,
    reach_score: 9,
    pay_score: 10,
    intent_score: 8,
    score_evidence: {
      need: "Site is dated; new-patient funnel missing.",
      fit: "High-value local practice, premium ICP.",
      reach: "Owner-dentist engaged directly in qualifier.",
      pay: "Dental practice — top of the budget band.",
      intent: "Actively scoping a new-patient funnel."
    },
    deal_value: 9500,
    next_action: "Run the 5-question qualifier on the call",
    next_action_due: iso(2, 13),
    appointment_at: iso(2, 13),
    appointment_status: "booked",
    meeting_url: "https://meet.example/brightsmile-qualifier",
    discovered_at: iso(-7),
    updated_at: iso(-1),
    activities: [
      {
        id: aid(),
        channel: "call",
        direction: "out",
        outcome: "connected",
        notes: "Connected with Dr. Voss. Booked the qualifier.",
        created_at: iso(-1, 11)
      }
    ]
  },
  {
    place_id: "ld-brightline-franchise",
    stage: "diagnostic",
    name: "Brightline Home Services",
    category: "Franchise (multi-location)",
    owner_name: "Reggie Okafor",
    owner_role: "VP Operations",
    phone: "(720) 555-0300",
    email: "reggie@brightlinehome.example",
    website: "brightlinehome.example",
    platform: "custom",
    address: "8 locations · CO + UT",
    rating: 4.4,
    review_count: 1280,
    pain_signals: ["$30K+ budget", "Multi-market rollout", "Above usual job size - ESCALATED"],
    description: "8-location home-services franchise doing a multi-market rollout. Scoped as Substrate-tier, flagged for the human.",
    selling: "A multi-location web + booking system.",
    opener: "Reggie — this is bigger than our standard lane, which is exactly why it gets a proper diagnostic before any number.",
    fit_score: 88,
    need_score: 8,
    fit_dim_score: 7,
    reach_score: 8,
    pay_score: 10,
    intent_score: 9,
    score_evidence: {
      need: "Fragmented multi-location presence — real need.",
      fit: "Above usual size — fit dim capped, but routable via diagnostic.",
      reach: "VP Ops engaged directly through the form.",
      pay: "$30K+ stated budget — top of the whale band.",
      intent: "Active multi-market rollout, funded."
    },
    modifiers: "ESCALATE — $25K+ whale. Flagged for the human. Do not auto-quote; name Substrate tier.",
    deal_value: 32000,
    next_action: "Human-led scoping call — operator flagged, drafted the diagnostic agenda",
    next_action_due: iso(1, 10),
    appointment_at: iso(3, 10),
    appointment_status: "booked",
    meeting_url: "https://meet.example/brightline-scoping",
    discovered_at: iso(-7),
    updated_at: iso(-1),
    activities: [
      {
        id: aid(),
        channel: "system",
        direction: "out",
        outcome: "escalated",
        notes: "Operator ESCALATED — $30K+ whale. Routed to diagnostic, flagged for the human.",
        created_at: iso(-2, 9)
      },
      {
        id: aid(),
        channel: "email",
        direction: "out",
        outcome: "sent",
        notes: "Drafted the diagnostic agenda + scoping-call invite.",
        created_at: iso(-1, 14)
      }
    ]
  },
  {
    place_id: "ld-ironpeak-auto",
    stage: "proposal",
    name: "Iron Peak Auto Repair",
    category: "Auto repair",
    owner_name: "Sal Romano",
    owner_role: "Owner",
    phone: "(303) 555-0321",
    email: "sal@ironpeakauto.example",
    website: "ironpeakauto.example",
    platform: "wordpress",
    address: "Englewood, CO",
    rating: 4.6,
    review_count: 152,
    pain_signals: ["Proposal out", "Wants appointment scheduling", "Decision pending"],
    description: "Independent auto shop. Proposal sent for a rebuild + scheduling integration; waiting on the decision.",
    selling: "A rebuild + online appointment scheduling tied to their bay capacity.",
    opener: "Sal — the proposal's the one that gets you off the phone for scheduling. Ready when you are to lock the start date.",
    fit_score: 76,
    need_score: 6,
    fit_dim_score: 8,
    reach_score: 8,
    pay_score: 7,
    intent_score: 7,
    score_evidence: {
      need: "Site exists; scheduling is the gap.",
      fit: "Right vertical and size.",
      reach: "Owner named and responsive.",
      pay: "152 reviews + steady shop = budget.",
      intent: "Engaged through proposal stage."
    },
    deal_value: 5400,
    next_action: "Follow-up #1 on the proposal",
    next_action_due: iso(1, 12),
    demo_url: "https://demo.example/ironpeak-preview",
    discovered_at: iso(-7),
    updated_at: iso(-1),
    activities: [
      {
        id: aid(),
        channel: "email",
        direction: "out",
        outcome: "sent",
        notes: "Proposal + demo preview link sent.",
        created_at: iso(-2, 15)
      }
    ]
  },
  {
    place_id: "ld-lumen-medspa",
    stage: "won",
    name: "Lumen Med Spa",
    category: "Med spa",
    owner_name: "Carla Méndez",
    owner_role: "Founder",
    phone: "(720) 555-0410",
    email: "carla@lumenmedspa.example",
    website: "lumenmedspa.example",
    platform: "webflow",
    address: "Cherry Creek, CO",
    rating: 4.9,
    review_count: 305,
    pain_signals: ["Signed", "Kickoff scheduled", "Membership funnel scope"],
    description: "Premium med spa. Signed for a rebuild + membership funnel. In kickoff.",
    selling: "A premium rebuild + membership funnel.",
    opener: "Carla — signed. Kickoff agenda + first invoice attached.",
    fit_score: 89,
    need_score: 7,
    fit_dim_score: 9,
    reach_score: 9,
    pay_score: 10,
    intent_score: 9,
    score_evidence: {
      need: "Wanted a membership funnel — clear scope.",
      fit: "Premium local ICP.",
      reach: "Founder engaged throughout.",
      pay: "Med spa — top of the budget band.",
      intent: "Signed — highest intent."
    },
    deal_value: 11500,
    next_action: "Kickoff call + send first invoice",
    next_action_due: iso(2, 10),
    discovered_at: iso(-7),
    updated_at: iso(0),
    activities: [
      {
        id: aid(),
        channel: "system",
        direction: "out",
        outcome: "won",
        notes: "Signed. Routed to won. Kickoff drafted.",
        created_at: iso(-1, 16)
      }
    ]
  },
  {
    place_id: "ld-castle-plumbing",
    stage: "won",
    name: "Castle Rock Plumbing",
    category: "Plumbing",
    owner_name: "Doug Friel",
    owner_role: "Owner",
    phone: "(303) 555-0455",
    email: "doug@castlerockplumb.example",
    website: "castlerockplumb.example",
    platform: "webflow",
    address: "Castle Rock, CO",
    rating: 4.7,
    review_count: 118,
    pain_signals: ["Signed", "Emergency-call funnel live", "Phase 2 pending"],
    description: "Plumbing company. Signed for an emergency-call funnel; phase 2 in discussion.",
    selling: "An emergency-call funnel + booking.",
    opener: "Doug — phase 1 is live. Phase 2 scope when you're ready.",
    fit_score: 78,
    need_score: 7,
    fit_dim_score: 8,
    reach_score: 8,
    pay_score: 7,
    intent_score: 8,
    score_evidence: {
      need: "Needed an emergency funnel.",
      fit: "Core vertical.",
      reach: "Owner engaged.",
      pay: "Steady plumbing shop.",
      intent: "Signed."
    },
    deal_value: 3900,
    next_action: "Phase-2 scoping when ready",
    next_action_due: null,
    discovered_at: iso(-7),
    updated_at: iso(-5),
    activities: [
      {
        id: aid(),
        channel: "system",
        direction: "out",
        outcome: "won",
        notes: "Signed phase 1.",
        created_at: iso(-5, 12)
      }
    ]
  },
  {
    place_id: "ld-lena-studio",
    stage: "lost",
    name: "Lena's Studio",
    category: "Solo studio",
    owner_name: "Lena Park",
    owner_role: "Owner",
    phone: null,
    email: "lena@lenastudio.example",
    website: null,
    platform: null,
    address: "Boulder, CO",
    rating: 4.8,
    review_count: 22,
    pain_signals: ["Stated budget $400", "Below $750 floor", "Solo operator"],
    description: "Solo studio owner replied to outreach but stated a $400 budget — below the $750 floor. Referred out, not discounted.",
    selling: "—",
    opener: "Lena — at $400 we'd do you a disservice. Here's a template route that fits the budget honestly.",
    fit_score: 54,
    need_score: 7,
    fit_dim_score: 6,
    reach_score: 6,
    pay_score: 2,
    intent_score: 6,
    score_evidence: {
      need: "Wants a basic site — real need.",
      fit: "Right vertical but solo/small.",
      reach: "Replied directly.",
      pay: "$400 stated — below the $750 floor.",
      intent: "Interested but budget-blocked."
    },
    decline_reason: "referred-elsewhere",
    deal_value: null,
    discovered_at: iso(-7),
    updated_at: iso(-2),
    activities: [
      {
        id: aid(),
        channel: "system",
        direction: "out",
        outcome: "referred",
        notes: "REFER — below the $750 floor. Drafted the warm referral, not a discount.",
        created_at: iso(-2, 11)
      }
    ]
  },
  {
    place_id: "ld-reyes-landscaping",
    stage: "lost",
    name: "Reyes Landscaping",
    category: "Landscaping",
    owner_name: null,
    owner_role: null,
    phone: "(720) 555-0490",
    email: "contact@reyesland.example",
    website: "reyesland.example",
    platform: "wix",
    address: "Thornton, CO",
    rating: 4.2,
    review_count: 44,
    pain_signals: ["Haggling pre-scope", "Vendor-mode behavior", "Declined"],
    description: "Inbound lead that opened by haggling on price before any scope or diagnostic — a hard walk-away flag. Declined.",
    selling: "—",
    opener: "Appreciate the interest — we scope before we price, so we're not the right fit for a cheapest-bid search. Best of luck.",
    fit_score: 41,
    need_score: 5,
    fit_dim_score: 6,
    reach_score: 5,
    pay_score: 4,
    intent_score: 3,
    score_evidence: {
      need: "Has a Wix site; need is moderate.",
      fit: "Right vertical but vendor-mode.",
      reach: "Reachable but anonymous.",
      pay: "Price-shopping signals low willingness.",
      intent: "Cheapest-bid hunting, not buying value."
    },
    modifiers: "DECLINE — hard walk-away flag (pricing pressure pre-scope).",
    decline_reason: "studio-declined",
    deal_value: null,
    discovered_at: iso(-7),
    updated_at: iso(-3),
    activities: [
      {
        id: aid(),
        channel: "system",
        direction: "out",
        outcome: "declined",
        notes: "DECLINE — vendor-mode haggling before scope. Drafted the warm decline.",
        created_at: iso(-3, 9)
      }
    ]
  }
];

function formatBody(lead) {
  const parts = [];
  parts.push(`# ${lead.name}`);
  parts.push(`**Vertical:** ${lead.category}`);
  parts.push(`**Grade:** ${lead.grade || "N/A"} (${lead.fit_score || "N/A"}/100)`);
  if (lead.deal_value) {
    parts.push(`**Deal Value:** $${lead.deal_value.toLocaleString()}`);
  }
  if (lead.next_action) {
    parts.push(`**Next Action:** ${lead.next_action}`);
  }
  
  parts.push(`\n## Description\n${lead.description}`);
  
  if (lead.pain_signals && lead.pain_signals.length > 0) {
    parts.push(`\n## Pain Signals\n` + lead.pain_signals.map(s => `- ${s}`).join("\n"));
  }
  
  if (lead.score_evidence) {
    parts.push(`\n## Score Evidence`);
    parts.push(`- **Need (${lead.need_score ?? "?"}):** ${lead.score_evidence.need}`);
    parts.push(`- **Fit (${lead.fit_dim_score ?? "?"}):** ${lead.score_evidence.fit}`);
    parts.push(`- **Reach (${lead.reach_score ?? "?"}):** ${lead.score_evidence.reach}`);
    parts.push(`- **Pay (${lead.pay_score ?? "?"}):** ${lead.score_evidence.pay}`);
    parts.push(`- **Intent (${lead.intent_score ?? "?"}):** ${lead.score_evidence.intent}`);
  }

  if (lead.activities && lead.activities.length > 0) {
    parts.push(`\n## Activity Timeline`);
    lead.activities.forEach(act => {
      parts.push(`- **${act.outcome}** (${act.channel} ${act.direction}): ${act.notes} *(${new Date(act.created_at).toLocaleString()})*`);
    });
  }

  return parts.join("\n");
}

async function writeLeads() {
  // Create directories
  await fs.mkdir(SCREENS_DIR, { recursive: true });
  for (const dir of Object.values(STAGE_DIRS)) {
    await fs.mkdir(path.join(SCREENS_DIR, dir), { recursive: true });
  }

  console.log("Seeding leads to screens folders...");
  for (const lead of leads) {
    const dir = STAGE_DIRS[lead.stage];
    const num = STAGE_NUM[lead.stage];
    const filepath = path.join(SCREENS_DIR, dir, `${lead.place_id}.md`);
    
    // Frontmatter fields
    const fm = {
      title: lead.name,
      type: "card",
      status: lead.stage === "won" ? "done" : (lead.stage === "lost" ? "blocked" : null),
      stage: num,
      place_id: lead.place_id,
      category: lead.category,
      owner_name: lead.owner_name,
      owner_role: lead.owner_role,
      phone: lead.phone,
      email: lead.email,
      website: lead.website,
      platform: lead.platform,
      address: lead.address,
      rating: lead.rating,
      review_count: lead.review_count,
      pain_signals: lead.pain_signals,
      description: lead.description,
      selling: lead.selling,
      opener: lead.opener,
      grade: lead.grade,
      fit_score: lead.fit_score,
      need_score: lead.need_score,
      fit_dim_score: lead.fit_dim_score,
      reach_score: lead.reach_score,
      pay_score: lead.pay_score,
      intent_score: lead.intent_score,
      score_evidence: lead.score_evidence,
      modifiers: lead.modifiers,
      deal_value: lead.deal_value,
      next_action: lead.next_action,
      next_action_due: lead.next_action_due,
      appointment_at: lead.appointment_at,
      appointment_status: lead.appointment_status,
      meeting_url: lead.meeting_url,
      demo_url: lead.demo_url,
      decline_reason: lead.decline_reason,
      updated_at: lead.updated_at,
      discovered_at: lead.discovered_at,
      activities: lead.activities
    };
    
    // Using string manipulation or gray-matter-style formatting
    const fmString = Object.entries(fm)
      .map(([k, v]) => {
        if (v === null || v === undefined) return `${k}: null`;
        if (Array.isArray(v) || typeof v === "object") return `${k}: ${JSON.stringify(v)}`;
        if (typeof v === "string") return `${k}: ${JSON.stringify(v)}`;
        return `${k}: ${v}`;
      })
      .join("\n");
    
    const content = `---\n${fmString}\n---\n\n${formatBody(lead)}`;
    await fs.writeFile(filepath, content, "utf8");
    console.log(`  Created ${filepath}`);
  }
}

writeLeads().then(() => {
  console.log("Seeding complete!");
}).catch(console.error);
