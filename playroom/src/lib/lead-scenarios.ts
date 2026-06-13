/**
 * Lead scenarios — leads used to show Generic AI vs The Pipeline Operator side
 * by side. The "generic" response is canned (it costs nothing and reliably
 * demonstrates the failure mode: kicks the decision back, dumps options,
 * flatters, never commits). The operator side streams live from the folder.
 *
 * Businesses are fictional stand-ins. Any resemblance is coincidental.
 */

export type GenericSegment = {
  text: string;
  flaw?: "kickback" | "vague" | "flattery" | "optionsdump";
};

export type LeadScenario = {
  id: string;
  business: string;
  segment: string; // one-line descriptor
  expected: string; // the disposition the operator should land on (UI hint chip)
  prompt: string; // the lead described, sent to the operator (mode: duel)
  /** The canned generic-AI response — split into segments so flaws can be marked. */
  generic: GenericSegment[];
};

export const LEAD_SCENARIOS: LeadScenario[] = [
  {
    id: "summit-roofing",
    business: "Summit Roofing",
    segment: "No website · 47 reviews (4.7★) · owner Dave listed · hiring now",
    expected: "ADVANCE → call (A)",
    prompt:
      "New lead: Summit Roofing. No website at all — just a Google Business profile. 47 reviews, 4.7 stars. Owner 'Dave' is listed with a phone number. Their profile says they're currently hiring two crews. Denver metro. Gate it, grade it, tell me what to do with it.",
    generic: [
      { text: "Summit Roofing looks like a great opportunity! ", flaw: "flattery" },
      { text: "They have strong reviews and seem to be growing. " },
      {
        text: "Since they don't have a website, there are a few directions you could take: you could pitch a full website build, offer a landing page, set up their Google profile further, or propose an AI booking tool. ",
        flaw: "optionsdump",
      },
      {
        text: "Which of these would you like to pursue? I'm happy to draft an outreach message once you decide on the angle. ",
        flaw: "kickback",
      },
    ],
  },
  {
    id: "apex-hvac",
    business: "Apex HVAC",
    segment: "Decent site · 220 reviews (4.8★) · phone listed · owner not named",
    expected: "ADVANCE → call, Angle 3 (B)",
    prompt:
      "New lead: Apex HVAC. They already have a decent website. 220 reviews, 4.8 stars. Phone is listed but the owner isn't named. Denver metro, established. Gate it, grade it, and tell me how to work it.",
    generic: [
      { text: "Apex HVAC is a solid, well-reviewed local business — a strong prospect. ", flaw: "flattery" },
      { text: "They already have a website, so the obvious web work is covered. " },
      {
        text: "You could reach out about a redesign, pitch ongoing SEO, offer social media management, or just add them to a nurture list for later. ",
        flaw: "optionsdump",
      },
      {
        text: "What would you like to do here? Let me know the direction and I can put something together. ",
        flaw: "kickback",
      },
    ],
  },
  {
    id: "brightline-franchise",
    business: "Brightline Home Services",
    segment: "8-location franchise · $30K+ budget · multi-market rollout",
    expected: "ESCALATE → diagnostic + flag",
    prompt:
      "New lead came in through the form: Brightline Home Services, an 8-location home-services franchise doing a multi-market rollout. They put their budget band at '$30K+' and want a unified web presence plus booking across all locations. This is way bigger than our usual jobs. What do I do with it?",
    generic: [
      { text: "Brightline sounds like an exciting, high-value lead! ", flaw: "flattery" },
      {
        text: "That said, an 8-location franchise with a $30K+ budget is likely outside your studio's normal $750–$12.5K range, ",
        flaw: "vague",
      },
      {
        text: "so you may want to either decline it politely, refer it to a bigger agency, or try to scope it down to something you can handle. ",
        flaw: "optionsdump",
      },
      {
        text: "How would you like to handle a lead this size? Just tell me which way to go. ",
        flaw: "kickback",
      },
    ],
  },
  {
    id: "budget-400",
    business: "Lena's Studio (inbound reply)",
    segment: "Wants a site · stated budget $400 · solo operator",
    expected: "REFER → below floor",
    prompt:
      "A lead replied to my outreach: \"Sounds interesting but honestly I can only spend like $400 on this right now.\" She runs a small solo studio and wants a basic website. How should I respond?",
    generic: [
      { text: "She seems genuinely interested, which is great! ", flaw: "flattery" },
      {
        text: "$400 is a bit low, but you might be able to make it work depending on scope. ",
        flaw: "vague",
      },
      {
        text: "You could offer a stripped-down package, propose a payment plan, ask if she has more budget than she thinks, or counter at a higher number. ",
        flaw: "optionsdump",
      },
      {
        text: "Want me to draft a reply? Just let me know how flexible you want to be on price. ",
        flaw: "kickback",
      },
    ],
  },
  {
    id: "haggler",
    business: "Reyes Landscaping (inbound)",
    segment: "Haggling on price before scope is set",
    expected: "DECLINE → pricing-pressure",
    prompt:
      "An inbound lead, Reyes Landscaping, messaged before we've even talked scope: \"What's your cheapest price? Can you do better than other guys? I don't want to overpay.\" We haven't run a diagnostic or set any scope yet. How do I handle this?",
    generic: [
      { text: "It's great that they reached out directly! ", flaw: "flattery" },
      {
        text: "Price-sensitive leads can still convert, so it's worth engaging. ",
        flaw: "vague",
      },
      {
        text: "You could share a starting price, offer a small discount to win the deal, explain your value to justify the cost, or ask what their budget is. ",
        flaw: "optionsdump",
      },
      {
        text: "Which approach do you prefer? I can write the reply once you decide. ",
        flaw: "kickback",
      },
    ],
  },
];
