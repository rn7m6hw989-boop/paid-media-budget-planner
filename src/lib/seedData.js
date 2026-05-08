// Sample seed data for the budget planner.
// Mirrors a realistic B2B SaaS marketing structure.

export const SEED_DATA = {
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

  // Regions with both rubric scores
  regions: [
    {
      id: 'reg_nam',
      name: 'NAM',
      commercial: { tam: 5, growth: 3, revenue: 5, strategic: 4, whitespace: 2, efficiency: 4 },
      brand: { awareness: 5, perception: 4, consideration: 4, investment: 3 },
    },
    {
      id: 'reg_emea',
      name: 'EMEA',
      commercial: { tam: 4, growth: 3, revenue: 3, strategic: 3, whitespace: 3, efficiency: 3 },
      brand: { awareness: 3, perception: 3, consideration: 3, investment: 4 },
    },
    {
      id: 'reg_apac',
      name: 'APAC',
      commercial: { tam: 5, growth: 5, revenue: 2, strategic: 5, whitespace: 5, efficiency: 2 },
      brand: { awareness: 2, perception: 3, consideration: 2, investment: 5 },
    },
    {
      id: 'reg_latam',
      name: 'LATAM',
      commercial: { tam: 3, growth: 4, revenue: 2, strategic: 2, whitespace: 4, efficiency: 3 },
      brand: { awareness: 2, perception: 3, consideration: 2, investment: 2 },
    },
  ],

  // Factor importance — must sum to 100 within each rubric
  rubrics: {
    commercial: {
      factors: [
        { id: 'tam', name: 'TAM size', weight: 20, description: 'Total addressable market in the region.' },
        { id: 'growth', name: 'Growth rate', weight: 15, description: 'Year-over-year market growth rate.' },
        { id: 'revenue', name: 'Revenue contribution', weight: 20, description: 'Region\'s share of company revenue.' },
        { id: 'strategic', name: 'Strategic priority', weight: 25, description: 'Leadership-defined strategic focus.' },
        { id: 'whitespace', name: 'Whitespace', weight: 10, description: 'Untapped opportunity, competitive gap.' },
        { id: 'efficiency', name: 'Marketing efficiency', weight: 10, description: 'Historical cost-per-result performance.' },
      ],
    },
    brand: {
      factors: [
        { id: 'awareness', name: 'Brand awareness', weight: 30, description: 'Aided/unaided brand recall in the region.' },
        { id: 'perception', name: 'Brand perception', weight: 25, description: 'Favorability among aware audiences.' },
        { id: 'consideration', name: 'Brand consideration', weight: 25, description: 'Likelihood to consider in next purchase.' },
        { id: 'investment', name: 'Brand investment thesis', weight: 20, description: 'Strategic intent to build brand here.' },
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
  meta: { organization: '', fiscalYear: new Date().getFullYear(), createdAt: new Date().toISOString() },
  pool: { annualGlobalBudget: 0, holdBackPercent: 10, testReservePercent: 5 },
  objectives: [],
  businessPriorities: [],
  regions: [],
  rubrics: {
    commercial: { factors: [
      { id: 'tam', name: 'TAM size', weight: 20, description: 'Total addressable market in the region.' },
      { id: 'growth', name: 'Growth rate', weight: 15, description: 'Year-over-year market growth rate.' },
      { id: 'revenue', name: 'Revenue contribution', weight: 20, description: 'Region\'s share of company revenue.' },
      { id: 'strategic', name: 'Strategic priority', weight: 25, description: 'Leadership-defined strategic focus.' },
      { id: 'whitespace', name: 'Whitespace', weight: 10, description: 'Untapped opportunity, competitive gap.' },
      { id: 'efficiency', name: 'Marketing efficiency', weight: 10, description: 'Historical cost-per-result performance.' },
    ] },
    brand: { factors: [
      { id: 'awareness', name: 'Brand awareness', weight: 30, description: 'Aided/unaided brand recall in the region.' },
      { id: 'perception', name: 'Brand perception', weight: 25, description: 'Favorability among aware audiences.' },
      { id: 'consideration', name: 'Brand consideration', weight: 25, description: 'Likelihood to consider in next purchase.' },
      { id: 'investment', name: 'Brand investment thesis', weight: 20, description: 'Strategic intent to build brand here.' },
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
