// Sample seed data for the budget planner.
// Mirrors a realistic B2B SaaS marketing structure.

// Schema version — bump this when the data shape changes incompatibly.
// DataContext checks this on load and resets to seed if the user's stored data
// has an older version (or no version at all).
export const SCHEMA_VERSION = 3;

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

  // Regions with both rubric scores
  regions: [
    {
      id: 'reg_us',
      name: 'United States',
      commercial: { tam: 5, mix_fit: 4, revenue: 5, whitespace: 2, comp_intensity: 3 },
      brand: { brand_preference: 4, trust: 5, owned_channel: 5 },
    },
    {
      id: 'reg_emea',
      name: 'EMEA',
      commercial: { tam: 4, mix_fit: 5, revenue: 4, whitespace: 3, comp_intensity: 4 },
      brand: { brand_preference: 3, trust: 4, owned_channel: 4 },
    },
    {
      id: 'reg_china',
      name: 'China',
      commercial: { tam: 5, mix_fit: 4, revenue: 4, whitespace: 3, comp_intensity: 5 },
      brand: { brand_preference: 2, trust: 3, owned_channel: 3 },
    },
    {
      id: 'reg_japan',
      name: 'Japan',
      commercial: { tam: 3, mix_fit: 5, revenue: 2, whitespace: 2, comp_intensity: 4 },
      brand: { brand_preference: 2, trust: 4, owned_channel: 3 },
    },
    {
      id: 'reg_india',
      name: 'India',
      commercial: { tam: 4, mix_fit: 4, revenue: 2, whitespace: 5, comp_intensity: 2 },
      brand: { brand_preference: 3, trust: 4, owned_channel: 4 },
    },
    {
      id: 'reg_roa',
      name: 'Rest of Asia',
      commercial: { tam: 3, mix_fit: 3, revenue: 3, whitespace: 3, comp_intensity: 3 },
      brand: { brand_preference: 3, trust: 4, owned_channel: 3 },
    },
    {
      id: 'reg_row',
      name: 'Rest of World',
      commercial: { tam: 2, mix_fit: 2, revenue: 1, whitespace: 4, comp_intensity: 2 },
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
          description: '3-year forward total addressable market in your served categories.',
          anchors: [
            { score: 5, definition: '>$15B forward TAM in your served categories' },
            { score: 4, definition: '$8–15B forward TAM' },
            { score: 3, definition: '$4–8B forward TAM' },
            { score: 2, definition: '$1.5–4B forward TAM' },
            { score: 1, definition: '<$1.5B forward TAM' },
          ],
          note: 'Calibrate thresholds against your current regional revenue mix. Largest revenue regions typically land 4–5; mid-size regions 3–4; smaller regions 1–2.',
        },
        {
          id: 'mix_fit',
          name: 'End-market mix fit',
          weight: 25,
          description: 'Share of regional TAM concentrated in your strategic priority end-markets, products, or customer segments.',
          anchors: [
            { score: 5, definition: '>70% of regional TAM is in your strategic priority segments; secondary segments are present but not dominant' },
            { score: 4, definition: '55–70% in strategic priority segments; balanced presence across your other priority segments' },
            { score: 3, definition: '40–55% in strategic priority segments; mix is roughly even across all segments you serve' },
            { score: 2, definition: '25–40% in strategic priority segments; region skews heavily toward non-priority segments' },
            { score: 1, definition: '<25% in strategic priority segments; region is dominated by segments outside your strategic focus' },
          ],
          note: 'Define your "strategic priority segments" before scoring — these should be the 2–4 end-markets, customer types, or industry verticals you are most focused on winning.',
        },
        {
          id: 'revenue',
          name: 'Revenue contribution',
          weight: 20,
          description: 'Region\'s share of company global revenue.',
          anchors: [
            { score: 5, definition: '>25% of global revenue (your largest single market)' },
            { score: 4, definition: '15–25% of global revenue (a major market)' },
            { score: 3, definition: '8–15% of global revenue (a meaningful market)' },
            { score: 2, definition: '3–8% of global revenue (a smaller market)' },
            { score: 1, definition: '<3% of global revenue (minor or emerging market)' },
          ],
          note: '',
        },
        {
          id: 'whitespace',
          name: 'Whitespace',
          weight: 15,
          description: 'Gap between your current regional share and your potential share given the region\'s TAM and end-market mix.',
          anchors: [
            { score: 5, definition: 'Share <10% in a region with strong end-market fit; large untapped pipeline; few entrenched competitors locking customers in' },
            { score: 4, definition: 'Share 10–18%; clear pockets of underpenetration in priority end-markets' },
            { score: 3, definition: 'Share roughly at fair-share (~19%); modest expansion opportunity in specific sub-segments' },
            { score: 2, definition: 'Share above fair-share; limited room to grow without taking from incumbents' },
            { score: 1, definition: 'At or near saturation; further share gains require disproportionate spend' },
          ],
          note: '"Fair-share" is roughly 100% ÷ number of credible competitors. Adjust your interpretation to your category structure.',
        },
        {
          id: 'comp_intensity',
          name: 'Competitive intensity',
          weight: 20,
          description: 'Share-loss risk from regional incumbents and fast-followers in your served categories.',
          anchors: [
            { score: 5, definition: 'Active regulatory or trade action against your company; local players gaining share with substitutable offerings at materially lower prices; >10% of regional revenue at substitution risk in next 24 months' },
            { score: 4, definition: 'Strong regional incumbent with structural advantages (home-market preference, government procurement bias, dominant local relationships); active share battles in priority end-markets' },
            { score: 3, definition: 'Established competitive set with no single dominant local incumbent; share movement is incremental and quarter-by-quarter; you compete on roughly even footing' },
            { score: 2, definition: 'Fragmented competition; you compete primarily on product breadth and reliability rather than fending off a specific named threat' },
            { score: 1, definition: 'Limited credible competition in your served categories; growth is constrained by demand, not competition' },
          ],
          note: '',
        },
      ],
    },
    brand: {
      factors: [
        {
          id: 'brand_preference',
          name: 'Brand preference',
          weight: 40,
          description: 'How buyers and evaluators in this region perceive your brand vs. competitors.',
          anchors: [
            { score: 5, definition: 'You are the unaided #1 choice across most product categories in the region; named first by buyers when asked who they would specify for a new project' },
            { score: 4, definition: 'You are in the top 2 across most product categories; clearly preferred in some, competitive in others; specific capabilities recognized as strengths' },
            { score: 3, definition: 'You are in the consideration set everywhere but rarely the first call; preference is roughly even with the leading regional competitor' },
            { score: 2, definition: 'You trail the dominant regional player in most product categories; buyers default to a competitor (regional incumbent or local leader) for first specification' },
            { score: 1, definition: 'You are rarely the first call in any product category; brand is known but not preferred; substitution to local or regional alternatives is the default behavior' },
          ],
          note: 'Consider relevant end-markets (Enterprise / SMB / vertical segments) and product categories your company sells into when scoring. This is a blended judgment across your full portfolio in the region.',
        },
        {
          id: 'trust',
          name: 'Trust / reliability',
          weight: 35,
          description: 'Buyer perception of supply dependability, documentation accuracy, longevity guarantees, and post-sale support quality. The moat against substitution.',
          anchors: [
            { score: 5, definition: 'You are unambiguously the trust benchmark; buyers cite long-term availability and accurate documentation as default assumptions; dependable capacity is a recognized differentiator' },
            { score: 4, definition: 'Strong trust position; you are the safe choice for mission-critical use cases but competitors are seen as acceptable for less-critical ones' },
            { score: 3, definition: 'You are trusted but not uniquely so; competitors are perceived as equivalent on reliability and support' },
            { score: 2, definition: 'Trust is eroding; buyers report willingness to substitute for cost or local-supply reasons; recent supply issues or support gaps are top of mind' },
            { score: 1, definition: 'You are no longer seen as the trust leader; substitution to local or regional alternatives is actively defended on quality grounds' },
          ],
          note: '',
        },
        {
          id: 'owned_channel',
          name: 'Owned-channel engagement',
          weight: 25,
          description: 'Active engagement with your owned ecosystem in the region — community, content, evaluations, free-tier signups, technical resources. Leading indicator of pipeline.',
          anchors: [
            { score: 5, definition: 'Region is in top tier for community activity, content engagement, and evaluation/trial signups; engagement growing year-over-year; technical content consumption strong across the portfolio' },
            { score: 4, definition: 'Healthy engagement across most channels; some product areas underperform but core engagement is solid; growing or stable trajectory' },
            { score: 3, definition: 'Moderate engagement; presence in your ecosystem exists but is not the buyer\'s first stop for technical answers' },
            { score: 2, definition: 'Low engagement relative to revenue contribution; buyers are using competitor ecosystems or third-party resources first; declining trend' },
            { score: 1, definition: 'Minimal engagement; your owned channels are largely invisible in the region; buyers go elsewhere by default' },
          ],
          note: '',
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
      regionId: 'reg_us',
      note: '12-month editorial + display program. Renewed Jan 2026.',
    },
    {
      id: 'hc_3',
      name: 'China product launch event',
      amount: 800000,
      objectiveId: 'obj_4',
      businessPriorityId: 'bp_1',
      regionId: 'reg_china',
      note: 'CEO directive — Acme Cloud Pro launch event in Shanghai.',
    },
  ],

  // Campaigns — discretionary allocations
  campaigns: [
    { id: 'cmp_1', name: 'Always-on demand-gen — US', objectiveId: 'obj_1', businessPriorityId: 'bp_1', regionId: 'reg_us', locked: false, manualAdjustment: null },
    { id: 'cmp_2', name: 'Always-on demand-gen — EMEA', objectiveId: 'obj_1', businessPriorityId: 'bp_1', regionId: 'reg_emea', locked: false, manualAdjustment: null },
    { id: 'cmp_3', name: 'China enterprise pipeline push', objectiveId: 'obj_1', businessPriorityId: 'bp_1', regionId: 'reg_china', locked: false, manualAdjustment: null },
    { id: 'cmp_4', name: 'SMB acquisition — US', objectiveId: 'obj_2', businessPriorityId: 'bp_2', regionId: 'reg_us', locked: false, manualAdjustment: null },
    { id: 'cmp_5', name: 'SMB acquisition — Rest of World', objectiveId: 'obj_2', businessPriorityId: 'bp_2', regionId: 'reg_row', locked: false, manualAdjustment: null },
    { id: 'cmp_6', name: 'Brand awareness — India growth', objectiveId: 'obj_3', businessPriorityId: 'bp_1', regionId: 'reg_india', locked: true, manualAdjustment: 1650000 },
    { id: 'cmp_7', name: 'Brand awareness — EMEA', objectiveId: 'obj_3', businessPriorityId: 'bp_1', regionId: 'reg_emea', locked: false, manualAdjustment: null },
    { id: 'cmp_8', name: 'Cloud Pro launch — global digital', objectiveId: 'obj_4', businessPriorityId: 'bp_1', regionId: 'reg_us', locked: false, manualAdjustment: null },
    { id: 'cmp_9', name: 'Cloud Pro launch — EMEA paid social', objectiveId: 'obj_4', businessPriorityId: 'bp_1', regionId: 'reg_emea', locked: false, manualAdjustment: null },
    { id: 'cmp_10', name: 'Healthcare vertical campaign — US', objectiveId: 'obj_1', businessPriorityId: 'bp_3', regionId: 'reg_us', locked: false, manualAdjustment: null },
    { id: 'cmp_11', name: 'FinServ retention — US', objectiveId: 'obj_5', businessPriorityId: 'bp_4', regionId: 'reg_us', locked: false, manualAdjustment: null },
    { id: 'cmp_12', name: 'Customer expansion — Japan', objectiveId: 'obj_5', businessPriorityId: 'bp_1', regionId: 'reg_japan', locked: false, manualAdjustment: null },
    { id: 'cmp_13', name: 'Brand build — Rest of Asia', objectiveId: 'obj_3', businessPriorityId: 'bp_1', regionId: 'reg_roa', locked: false, manualAdjustment: null },
  ],

  // Change log — initialized with a few historical entries
  changeLog: [
    {
      id: 'log_1',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      actor: 'Sample User',
      type: 'lock',
      target: 'cmp_6',
      targetName: 'Brand awareness — India growth',
      summary: 'Locked at $1,650,000 — protected from rebalancing',
      rationale: '',
    },
    {
      id: 'log_2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26 - 1000 * 60).toISOString(),
      actor: 'Sample User',
      type: 'adjust',
      target: 'cmp_6',
      targetName: 'Brand awareness — India growth',
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
      { id: 'tam', name: 'TAM (3-yr forward)', weight: 20, description: '3-year forward total addressable market in your served categories.', anchors: [], note: '' },
      { id: 'mix_fit', name: 'End-market mix fit', weight: 25, description: 'Share of regional TAM concentrated in your strategic priority end-markets, products, or customer segments.', anchors: [], note: '' },
      { id: 'revenue', name: 'Revenue contribution', weight: 20, description: 'Region\'s share of company global revenue.', anchors: [], note: '' },
      { id: 'whitespace', name: 'Whitespace', weight: 15, description: 'Gap between your current regional share and your potential share.', anchors: [], note: '' },
      { id: 'comp_intensity', name: 'Competitive intensity', weight: 20, description: 'Share-loss risk from regional incumbents and fast-followers.', anchors: [], note: '' },
    ] },
    brand: { factors: [
      { id: 'brand_preference', name: 'Brand preference', weight: 40, description: 'How buyers and evaluators in this region perceive your brand vs. competitors.', anchors: [], note: '' },
      { id: 'trust', name: 'Trust / reliability', weight: 35, description: 'Buyer perception of supply dependability, documentation accuracy, longevity, and support quality.', anchors: [], note: '' },
      { id: 'owned_channel', name: 'Owned-channel engagement', weight: 25, description: 'Active engagement with your owned ecosystem in the region.', anchors: [], note: '' },
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
