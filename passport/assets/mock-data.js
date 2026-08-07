/* ELISENCE Relationships Passport — SAMPLE / DEMO DATA ONLY
   Not connected to production Phase 8 / SES / consent ledger. */
window.ElisencePassportMock = (function () {
  "use strict";

  var overview = {
    totalRelationships: 1284,
    confirmed: 1106,
    pendingConfirmation: 91,
    unsubscribed: 63,
    suppressedBounced: 24,
    newThisMonth: 184,
    confirmationRate: 86.1,
    topInterests: [
      { name: "Investment", count: 412 },
      { name: "Strategic Partnership", count: 369 },
      { name: "Healthcare Systems", count: 281 },
      { name: "Technology & AI", count: 503 },
      { name: "Research", count: 176 },
      { name: "Events", count: 621 },
      { name: "General Updates", count: 744 }
    ],
    topSources: [
      { name: "Sam Digital Card", count: 322 },
      { name: "Shiva Digital Card", count: 211 },
      { name: "Web Summit", count: 286 },
      { name: "ELISENCE Connect", count: 197 },
      { name: "Other Events", count: 268 }
    ],
    funnel: [
      { label: "Discovered", value: 1480 },
      { label: "Submitted", value: 1284 },
      { label: "Confirmed", value: 1106 },
      { label: "Engaged 30d", value: 742 }
    ],
    recentActivity: [
      { when: "07 Aug 2026", text: "Sam Jones confirmed Stay Connected consent" },
      { when: "07 Aug 2026", text: "Welcome message delivered to Web Summit cohort (sample)" },
      { when: "06 Aug 2026", text: "Strategic Partnership segment refreshed (+18)" },
      { when: "05 Aug 2026", text: "Campaign draft created: September Partnership Update" }
    ],
    growth: [
      { month: "Apr", value: 820 },
      { month: "May", value: 910 },
      { month: "Jun", value: 1024 },
      { month: "Jul", value: 1100 },
      { month: "Aug", value: 1284 }
    ]
  };

  var relationships = [
    {
      id: "rel-sam-jones",
      name: "Sam Jones",
      role: "Director",
      organisation: "ABC Health",
      status: "Confirmed",
      source: "Sam Digital Card",
      met: "Web Summit",
      interests: ["Investment", "Strategic Partnership", "Events"],
      consentConfirmed: "07 Aug 2026",
      lastCommunication: "Web Summit Follow-up — Delivered",
      engagement: "High"
    },
    {
      id: "rel-amina-okeke",
      name: "Amina Okeke",
      role: "Chief Digital Officer",
      organisation: "Northbridge Care System",
      status: "Confirmed",
      source: "Shiva Digital Card",
      met: "HealthTech Event",
      interests: ["Healthcare Systems", "Technology & AI"],
      consentConfirmed: "02 Aug 2026",
      lastCommunication: "ELISENCE introduction — Opened",
      engagement: "High"
    },
    {
      id: "rel-james-liu",
      name: "James Liu",
      role: "Partner",
      organisation: "Horizon Ventures",
      status: "Pending Confirmation",
      source: "Web Summit",
      met: "Web Summit",
      interests: ["Investment", "Technology & AI"],
      consentConfirmed: "—",
      lastCommunication: "Confirmation email sent",
      engagement: "Pending"
    },
    {
      id: "rel-elena-vass",
      name: "Elena Vass",
      role: "Research Lead",
      organisation: "Civic Health Lab",
      status: "Confirmed",
      source: "ELISENCE Connect",
      met: "Online",
      interests: ["Research", "General Updates"],
      consentConfirmed: "28 Jul 2026",
      lastCommunication: "Meaningful progress draft preview — Not sent",
      engagement: "Medium"
    },
    {
      id: "rel-omar-hassan",
      name: "Omar Hassan",
      role: "Strategy Advisor",
      organisation: "Gulf Health Alliance",
      status: "Unsubscribed",
      source: "Other Events",
      met: "Founder Event",
      interests: ["Strategic Partnership"],
      consentConfirmed: "12 Jun 2026",
      lastCommunication: "Unsubscribe processed",
      engagement: "Inactive"
    },
    {
      id: "rel-priya-nair",
      name: "Priya Nair",
      role: "Programme Director",
      organisation: "National Pathways Trust",
      status: "Suppressed",
      source: "Sam Digital Card",
      met: "Referred",
      interests: ["Healthcare Systems", "Events"],
      consentConfirmed: "03 May 2026",
      lastCommunication: "Delivery suppressed (bounce)",
      engagement: "Blocked"
    }
  ];

  var timelines = {
    "rel-sam-jones": [
      { date: "07 Aug", title: "QR card opened", meta: "Sam Digital Card" },
      { date: "07 Aug", title: "Stay Connected submitted", meta: "Consent wording v1" },
      { date: "07 Aug", title: "Confirmation email sent", meta: "Double opt-in" },
      { date: "07 Aug", title: "Consent confirmed", meta: "Status → Confirmed" },
      { date: "10 Aug", title: "Welcome message sent", meta: "Delivered" },
      { date: "28 Aug", title: "ELISENCE Web Summit update sent", meta: "Delivered · Opened" },
      { date: "12 Sep", title: "Strategic Partnership update sent", meta: "Delivered · Clicked" }
    ]
  };

  var segments = [
    { id: "seg-investment", name: "Investment", type: "Base", description: "Contacts who selected Investment interest.", count: 412, rules: "interest = investment · status = confirmed", status: "Active", updated: "07 Aug 2026" },
    { id: "seg-partnership", name: "Strategic Partnership", type: "Base", description: "Partnership-oriented confirmed relationships.", count: 369, rules: "interest = strategic_partnership · status = confirmed", status: "Active", updated: "07 Aug 2026" },
    { id: "seg-healthcare", name: "Healthcare Systems", type: "Base", description: "Health-system operators and programmes.", count: 281, rules: "interest = healthcare_systems", status: "Active", updated: "06 Aug 2026" },
    { id: "seg-tech", name: "Technology & AI", type: "Base", description: "Technology and AI exploration contacts.", count: 503, rules: "interest = technology_ai", status: "Active", updated: "06 Aug 2026" },
    { id: "seg-research", name: "Research", type: "Base", description: "Research and evidence stakeholders.", count: 176, rules: "interest = research", status: "Active", updated: "05 Aug 2026" },
    { id: "seg-events", name: "Events", type: "Base", description: "Event-oriented subscribers.", count: 621, rules: "interest = events", status: "Active", updated: "07 Aug 2026" },
    { id: "seg-general", name: "General ELISENCE Updates", type: "Base", description: "Broad ELISENCE update audience.", count: 744, rules: "interest = general_updates", status: "Active", updated: "07 Aug 2026" },
    { id: "seg-inv-health", name: "Investment + Healthcare Systems", type: "Composite", description: "Investors engaging healthcare systems themes.", count: 94, rules: "investment ∩ healthcare_systems · confirmed", status: "Active", updated: "07 Aug 2026" },
    { id: "seg-uae", name: "Strategic Partnership + UAE", type: "Composite", description: "Partnership contacts tagged UAE region (sample).", count: 41, rules: "strategic_partnership ∩ region=UAE", status: "Draft", updated: "04 Aug 2026" },
    { id: "seg-websummit", name: "Web Summit contacts", type: "Composite", description: "Contacts attributed to Web Summit.", count: 286, rules: "source/meeting includes web_summit", status: "Active", updated: "07 Aug 2026" },
    { id: "seg-exec", name: "Healthcare executives", type: "Composite", description: "Director+ roles in healthcare organisations.", count: 158, rules: "role seniority ≥ director · healthcare org", status: "Active", updated: "03 Aug 2026" },
    { id: "seg-recent", name: "Recently connected", type: "Composite", description: "Confirmed within last 30 days.", count: 184, rules: "confirmed_at ≥ now-30d", status: "Active", updated: "07 Aug 2026" },
    { id: "seg-engaged", name: "Highly engaged", type: "Composite", description: "Opened or clicked within 30 days.", count: 312, rules: "opens/clicks ≥ 1 in 30d", status: "Active", updated: "07 Aug 2026" },
    { id: "seg-inactive", name: "Inactive > 90 days", type: "Composite", description: "No marketing engagement in 90 days.", count: 97, rules: "last_engaged_at < now-90d", status: "Watch", updated: "01 Aug 2026" }
  ];

  var campaign = {
    id: "cmp-sep-partnership",
    name: "ELISENCE September Partnership Update",
    audience: "Strategic Partnership",
    stage: "Analytics",
    lifecycle: ["Draft", "Audience", "Preview", "Governance Check", "Approval", "Queue", "SES", "Delivery Events", "Analytics"],
    eligible: 369,
    excluded: { unsubscribed: 12, suppressed: 3, bounced: 2, cadenceRestricted: 21 },
    finalRecipients: 331,
    analytics: { queued: 331, sent: 331, delivered: 326, bounced: 5, opened: 188, clicked: 64, unsubscribed: 2 }
  };

  var campaigns = [
    campaign,
    {
      id: "cmp-websummit-followup",
      name: "Web Summit Follow-up",
      audience: "Web Summit contacts",
      stage: "Queue",
      eligible: 286,
      finalRecipients: 241,
      analytics: { queued: 241, sent: 0, delivered: 0, bounced: 0, opened: 0, clicked: 0, unsubscribed: 0 }
    }
  ];

  var analytics = {
    deliverySummary: { sent: 2140, delivered: 2088, bounced: 52, opened: 1194, clicked: 402, unsubscribed: 18 },
    bounceRate: 2.4,
    topSegments: [
      { name: "Technology & AI", engagement: 61 },
      { name: "Events", engagement: 57 },
      { name: "Strategic Partnership", engagement: 54 }
    ],
    topCampaigns: [
      { name: "September Partnership Update", score: 58 },
      { name: "Web Summit Follow-up", score: 49 },
      { name: "Welcome sequence", score: 72 }
    ]
  };

  var consentBuckets = [
    { name: "Confirmed Consent", count: 1106, tone: "ok" },
    { name: "Pending Confirmation", count: 91, tone: "pending" },
    { name: "Unsubscribed", count: 63, tone: "muted" },
    { name: "Suppressed", count: 14, tone: "danger" },
    { name: "Bounced", count: 10, tone: "danger" },
    { name: "Complaints", count: 0, tone: "muted" }
  ];

  var consentMeta = {
    consentVersion: "elisence-connect-consent-v1",
    privacyNoticeVersion: "privacy-connect-v1-2026-08"
  };

  var audit = [
    {
      when: "12 Sep 2026 14:22",
      what: "Campaign approved",
      who: "Sam Asi",
      campaign: "September Partnership Update",
      audience: "Strategic Partnership",
      previous: "Governance Check",
      next: "Queue",
      note: "Final recipients: 331"
    },
    {
      when: "07 Aug 2026 11:00",
      what: "Consent confirmed",
      who: "System · double opt-in",
      campaign: "—",
      audience: "Sam Jones",
      previous: "PENDING_CONFIRMATION",
      next: "ACTIVE",
      note: "Sample ledger event"
    },
    {
      when: "05 Aug 2026 09:41",
      what: "Segment refreshed",
      who: "Operator · demo",
      campaign: "—",
      audience: "Recently connected",
      previous: "166",
      next: "184",
      note: "Count recalculation (sample)"
    }
  ];

  return {
    dataMode: "SAMPLE_DEMO_ONLY",
    overview: overview,
    relationships: relationships,
    timelines: timelines,
    segments: segments,
    campaign: campaign,
    campaigns: campaigns,
    analytics: analytics,
    consentBuckets: consentBuckets,
    consentMeta: consentMeta,
    audit: audit,
    getRelationship: function (id) {
      return relationships.filter(function (r) { return r.id === id; })[0] || relationships[0];
    },
    getTimeline: function (id) {
      return timelines[id] || timelines["rel-sam-jones"];
    },
    getSegment: function (id) {
      return segments.filter(function (s) { return s.id === id; })[0] || segments[0];
    }
  };
})();
