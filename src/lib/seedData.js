// Sample seed data for the budget planner.
// Mirrors a realistic B2B SaaS marketing structure.

// Schema version — bump this when the data shape changes incompatibly.
// DataContext checks this on load and resets to seed if the user's stored data
// has an older version (or no version at all).
export const SCHEMA_VERSION = 2;

export const SEED_DATA = {
  schemaVersion: SCHEMA_VERSION,
  meta: {
    organization: 'Acme Corp',
    fiscalYear: 2026,
    createdAt: new Date().toISOString(),
  },

  pool: {
    annualGlobalBudget: 20000000,
    holdBackPercent: 12.5,
    testReservePercent: 5,
  },

  // Marketing objectives — Grove-style OKRs set strategically by leadership
  objectives: [
    {
      id: 'obj_1',
      name: 'Establish Acme as the leading platform for enterprise AI deployments',
      description: 'Pipeline is 22% behind target heading into H1. Enterprise AI is our highest-margin segment and where competitors are gaining ground. Aggressive recovery year.',
      weight: 2.0,
      keyResults: [
        { id: 'kr_1_1', description: 'Generate qualified pipeline in enterprise AI segment', type: 'measurable', target: 400, unit: 'M ($)', notes: 'Counted at SAL stage' },
        { id: 'kr_1_2', description: 'Close 25 net-new enterprise AI logos', type: 'measurable', target: 25, unit: 'count', notes: '' },
        { id: 'kr_1_3', description: 'Launch enterprise AI thought leadership program', type: 'milestone', target: null, unit: '', notes: 'CMO-led; minimum 4 owned research reports' },
      ],
    },
    {
      id: 'obj_2',
      name: 'Accelerate SMB customer acquisition with efficient growth',
      description: 'SMB has the strongest ROAS in our portfolio. Investment thesis: efficient acquisition fuels expansion revenue downstream.',
      weight: 1.4,
      keyResults: [
        { id: 'kr_2_1', description: 'Acquire new SMB customers', type: 'measurable', target: 8000, unit: 'count', notes: '' },
        { id: 'kr_2_2', description: 'Maintain blended SMB CAC payback period under target', type: 'measurable', target: 14, unit: 'months', notes: '' },
        { id: 'kr_2_3', description: 'Launch self-serve onboarding flow', type: 'milestone', target: null, unit: '', notes: 'Joint with Product' },
      ],
    },
    {
      id: 'obj_3',
      name: 'Build foundational brand presence in growth markets',
      description: 'APAC and LATAM brand health metrics lag NAM/EMEA significantly. Without brand investment now, future demand-gen efficiency suffers.',
      weight: 1.0,
      keyResults: [
        { id: 'kr_3_1', description: 'Increase aided brand awareness in APAC tier-1 markets', type: 'measurable', target: 35, unit: '%', notes: 'Baseline: 22%; measured via annual brand health study' },
        { id: 'kr_3_2', description: 'Launch always-on brand campaigns in 4 growth markets', type: 'milestone', target: null, unit: '', notes: 'India, Brazil, Singapore, Mexico' },
      ],
    },
    {
      id: 'obj_4',
      name: 'Successfully launch Acme Cloud Pro globally',
      description: 'Major Q2 product launch. Cross-functional bet — marketing must drive launch awareness, demand, and brand reinforcement simultaneously.',
      weight: 1.8,
      keyResults: [
        { id: 'kr_4_1', description: 'Drive Cloud Pro pipeline within 90 days of launch', type: 'measurable', target: 120, unit: 'M ($)', notes: '' },
        { id: 'kr_4_2', description: 'Achieve launch-day awareness among target ICP', type: 'measurable', target: 40, unit: '%', notes: 'Measured via post-launch survey' },
        { id: 'kr_4_3', description: 'Execute global launch event series', type: 'milestone', target: null, unit: '', notes: 'NAM, EMEA, APAC anchor events' },
      ],
    },
    {
      id: 'obj_5',
      name: 'Deepen customer expansion and retention motion',
      description: 'Net retention has slipped 4 points. Lighter paid investment, primarily lifecycle and partner co-marketing.',
      weight: 0.9,
      keyResults: [
        { id: 'kr_5_1', description: 'Improve net dollar retention', type: 'measurable', target: 118, unit: '%', notes: 'Current: 114%' },
        { id: 'kr_5_2', description: 'Launch customer advocacy program', type: 'milestone', target: null, unit: '', notes: '' },
      ],
    },
  ],

  // Business priorities — which BUs/verticals are funded
  businessPriorities: [
    { id: 'bp_1', name: 'Enterprise SaaS', weight: 2.0, description: '60% of company revenue and the primary growth engine. Highest investment priority — every other priority supports this directly or indirectly.' },
    { id: 'bp_2', name: 'SMB', weight: 1.3, description: 'Strongest unit economics in the portfolio with proven scale potential. Funding efficient acquisition to fuel future expansion revenue.' },
    { id: 'bp_3', name: 'Healthcare vertical', weight: 1.5, description: 'New strategic vertical play. Long sales cycles but high contract values. Marketing investment is a necessary precondition for sales pipeline.' },
    { id: 'bp_4', name: 'Financial services vertical', weight: 1.0, description: 'Mature segment where we hold a defensible position. Investment focused on share defense and incremental expansion rather than growth.' },
  ],

  // Regions with both rubric scores (new factor IDs)
  regions: [
    {
      id: 'reg_nam',
      name: 'NAM',
      commercial: { tam: 5, mix_fit: 4, revenue: 5, whitespace: 2, comp_intensity: 4 },
      brand: { brand_preference: 4, trust: 5, owned_channel: 4 },
    },
    {
      id: 'reg_emea',
      name: 'EMEA',
      commercial: { tam: 4, mix_fit: 4, revenue: 3, whitespace: 3, comp_intensity: 4 },
      brand: { brand_preference: 3, trust: 4, owned_channel: 3 },
    },
    {
      id: 'reg_apac',
      name: 'APAC',
      commercial: { tam: 5, mix_fit: 4, revenue: 2, whitespace: 5, comp_intensity: 3 },
      brand: { brand_preference: 2, trust: 3, owned_channel: 2 },
    },
    {
      id: 'reg_latam',
      name: 'LATAM',
      commercial: { tam: 3, mix_fit: 3, revenue: 2, whitespace: 4, comp_intensity: 2 },
      brand: { brand_preference: 2, trust: 3, owned_channel: 2 },
    },
  ],

  // Factor importance — must sum to 100 within each rubric
  rubrics: {
    commercial: {
      factors: [
        {
          id: 'tam',
          name: 'TAM (3-yr forward)',
          weight: 20,
          description: '3-year forward total addressable market in your served categories. Anchors: 5 = >$15B; 4 = $5–15B; 3 = $1.5–5B; 2 = $500M–1.5B; 1 = <$500M.',
        },
        {
          id: 'mix_fit',
          name: 'End-market mix fit',
          weight: 25,
          description: 'How well the regional buyer mix matches your strategic ICP and product fit. Anchors: 5 = >70% in priority segments; 4 = 50–70%; 3 = 30–50%; 2 = 15–30%; 1 = <15%.',
        },
        {
          id: 'revenue',
          name: 'Revenue contribution',
          weight: 20,
          description: 'Region\'s share of company revenue. Anchors: 5 = >25%; 4 = 15–25%; 3 = 8–15%; 2 = 3–8%; 1 = <3%.',
        },
        {
          id: 'whitespace',
          name: 'Whitespace',
          weight: 15,
          description: 'Gap between your current share and potential share. Anchors: 5 = <10% share with strong fit; 4 = under-penetrated; 3 = moderate room; 2 = mature; 1 = saturated.',
        },
        {
          id: 'comp_intensity',
          name: 'Competitive intensity',
          weight: 20,
          description: 'Share-loss risk from regional incumbents and fast-followers. Anchors: 5 = active well-funded threat with structural advantage; 4 = strong competitor pressure; 3 = balanced competition; 2 = limited credible competition; 1 = effectively uncontested.',
        },
      ],
    },
    brand: {
      factors: [
        {
          id: 'brand_preference',
          name: 'Brand preference',
          weight: 40,
          description: 'How the people who actually use or evaluate your product in this region perceive your brand vs. competitors. Consider relevant end-markets (Enterprise / SMB / vertical segments) and product categories your company sells into when scoring. Anchors: 5 = clearly preferred; 3 = competitive parity; 1 = trailing.',
        },
        {
          id: 'trust',
          name: 'Trust / reliability',
          weight: 35,
          description: 'Buyer perception of supply dependability, documentation accuracy, long-term availability, and post-sale support. The moat against substitution. Anchors: 5 = strong moat; 3 = adequate; 1 = at risk.',
        },
        {
          id: 'owned_channel',
          name: 'Owned-channel engagement',
          weight: 25,
          description: 'Activity on your owned channels — community, content engagement, evaluations, free-tier signups, technical content consumption. Leading indicator of pipeline. Anchors: 5 = highly engaged; 3 = moderate; 1 = low.',
        },
      ],
    },
  },

  // Hard commitments — always locked, line-itemed
  hardCommitments: [
    {
      id: 'hc_1',
      name: 'Cannes Lions sponsorship',
      amount: 1500000,
      objectiveId: 'obj_3',
      businessPriorityId: 'bp_1',
      regionId: 'reg_emea',
      note: 'Signed contract, June 2026. Brand presence at flagship industry event.',
    },
    {
      id: 'hc_2',
      name: 'Forbes annual contract',
      amount: 1200000,
      objectiveId: 'obj_1',
      businessPriorityId: 'bp_1',
      regionId: 'reg_nam',
      note: '12-month editorial + display program. Renewed Jan 2026.',
    },
    {
      id: 'hc_3',
      name: 'APAC product launch event',
      amount: 800000,
      objectiveId: 'obj_4',
      businessPriorityId: 'bp_1',
      regionId: 'reg_apac',
      note: 'CEO directive — Acme Cloud Pro launch event in Singapore.',
    },
  ],

  // Campaigns — discretionary allocations
  campaigns: [
    { id: 'cmp_1', name: 'Always-on demand-gen — NAM', objectiveId: 'obj_1', businessPriorityId: 'bp_1', regionId: 'reg_nam', locked: false, manualAdjustment: null },
    { id: 'cmp_2', name: 'Always-on demand-gen — EMEA', objectiveId: 'obj_1', businessPriorityId: 'bp_1', regionId: 'reg_emea', locked: false, manualAdjustment: null },
    { id: 'cmp_3', name: 'APAC enterprise pipeline push', objectiveId: 'obj_1', businessPriorityId: 'bp_1', regionId: 'reg_apac', locked: false, manualAdjustment: null },
    { id: 'cmp_4', name: 'SMB acquisition — NAM', objectiveId: 'obj_2', businessPriorityId: 'bp_2', regionId: 'reg_nam', locked: false, manualAdjustment: null },
    { id: 'cmp_5', name: 'SMB acquisition — LATAM', objectiveId: 'obj_2', businessPriorityId: 'bp_2', regionId: 'reg_latam', locked: false, manualAdjustment: null },
    { id: 'cmp_6', name: 'Brand awareness — APAC growth', objectiveId: 'obj_3', businessPriorityId: 'bp_1', regionId: 'reg_apac', locked: true, manualAdjustment: 1650000 },
    { id: 'cmp_7', name: 'Brand awareness — EMEA', objectiveId: 'obj_3', businessPriorityId: 'bp_1', regionId: 'reg_emea', locked: false, manualAdjustment: null },
    { id: 'cmp_8', name: 'Cloud Pro launch — global digital', objectiveId: 'obj_4', businessPriorityId: 'bp_1', regionId: 'reg_nam', locked: false, manualAdjustment: null },
    { id: 'cmp_9', name: 'Cloud Pro launch — EMEA paid social', objectiveId: 'obj_4', businessPriorityId: 'bp_1', regionId: 'reg_emea', locked: false, manualAdjustment: null },
    { id: 'cmp_10', name: 'Healthcare vertical campaign — NAM', objectiveId: 'obj_1', businessPriorityId: 'bp_3', regionId: 'reg_nam', locked: false, manualAdjustment: null },
    { id: 'cmp_11', name: 'FinServ retention — NAM', objectiveId: 'obj_5', businessPriorityId: 'bp_4', regionId: 'reg_nam', locked: false, manualAdjustment: null },
    { id: 'cmp_12', name: 'Customer expansion — global', objectiveId: 'obj_5', businessPriorityId: 'bp_1', regionId: 'reg_nam', locked: false, manualAdjustment: null },
  ],

  // Change log — initialized with a few historical entries
  changeLog: [
    {
      id: 'log_1',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      actor: 'Sample User',
      type: 'lock',
      target: 'cmp_6',
      targetName: 'Brand awareness — APAC growth',
      summary: 'Locked at $1,650,000 — protected from rebalancing',
      rationale: '',
    },
    {
      id: 'log_2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26 - 1000 * 60).toISOString(),
      actor: 'Sample User',
      type: 'adjust',
      target: 'cmp_6',
      targetName: 'Brand awareness — APAC growth',
      summary: 'Manual override applied: +18%',
      rationale: 'APAC brand health study showed lower-than-expected awareness in tier-2 cities. Need additional reach.',
    },
    {
      id: 'log_3',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      actor: 'Sample User',
      type: 'pool',
      target: 'pool',
      targetName: 'Hold-back reserve',
      summary: 'Hold-back: 10% → 12.5% of annual global budget',
      rationale: 'Increasing reserve given regional teams\' track record of mid-half campaign requests.',
    },
  ],

  settings: {
    rebalanceMode: 'manual',
    manualAdjustmentCapPct: 50,
    requireRationale: true,
  },
};

export const EMPTY_DATA = {
  schemaVersion: SCHEMA_VERSION,
  meta: { organization: '', fiscalYear: new Date().getFullYear(), createdAt: new Date().toISOString() },
  pool: { annualGlobalBudget: 0, holdBackPercent: 10, testReservePercent: 5 },
  objectives: [],
  businessPriorities: [],
  regions: [],
  rubrics: {
    commercial: { factors: [
      { id: 'tam', name: 'TAM (3-yr forward)', weight: 20, description: '3-year forward total addressable market in your served categories. Anchors: 5 = >$15B; 4 = $5–15B; 3 = $1.5–5B; 2 = $500M–1.5B; 1 = <$500M.' },
      { id: 'mix_fit', name: 'End-market mix fit', weight: 25, description: 'How well the regional buyer mix matches your strategic ICP and product fit. Anchors: 5 = >70% in priority segments; 4 = 50–70%; 3 = 30–50%; 2 = 15–30%; 1 = <15%.' },
      { id: 'revenue', name: 'Revenue contribution', weight: 20, description: 'Region\'s share of company revenue. Anchors: 5 = >25%; 4 = 15–25%; 3 = 8–15%; 2 = 3–8%; 1 = <3%.' },
      { id: 'whitespace', name: 'Whitespace', weight: 15, description: 'Gap between your current share and potential share. Anchors: 5 = <10% share with strong fit; 4 = under-penetrated; 3 = moderate room; 2 = mature; 1 = saturated.' },
      { id: 'comp_intensity', name: 'Competitive intensity', weight: 20, description: 'Share-loss risk from regional incumbents and fast-followers. Anchors: 5 = active well-funded threat with structural advantage; 4 = strong competitor pressure; 3 = balanced competition; 2 = limited credible competition; 1 = effectively uncontested.' },
    ] },
    brand: { factors: [
      { id: 'brand_preference', name: 'Brand preference', weight: 40, description: 'How the people who actually use or evaluate your product in this region perceive your brand vs. competitors. Consider relevant end-markets (Enterprise / SMB / vertical segments) and product categories your company sells into when scoring.' },
      { id: 'trust', name: 'Trust / reliability', weight: 35, description: 'Buyer perception of supply dependability, documentation accuracy, long-term availability, and post-sale support.' },
      { id: 'owned_channel', name: 'Owned-channel engagement', weight: 25, description: 'Activity on your owned channels — community, content engagement, evaluations, free-tier signups, technical content consumption.' },
    ] },
  },
  hardCommitments: [],
  campaigns: [],
  changeLog: [],
  settings: {
    rebalanceMode: 'manual',
    manualAdjustmentCapPct: 50,
    requireRationale: true,
  },
};
