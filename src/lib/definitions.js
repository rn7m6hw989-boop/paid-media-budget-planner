// Single source of truth for term definitions, used in tooltips and the Settings tab.

export const DEFINITIONS = {
  annualGlobalBudget: {
    term: 'Annual global budget',
    short: 'The total paid media budget for the fiscal year.',
    governance:
      'Set by leadership at the start of the fiscal year. Changes mid-year are rare and require executive approval. Any change triggers a confirmation dialog showing impact.',
  },
  hardCommitments: {
    term: 'Hard commitments',
    short:
      'Locked, non-discretionary spend tied to signed contracts, sponsorships, or executive mandates.',
    governance:
      'Always locked from rebalancing. Always editable when contracts change. Each line item should reference its source (contract, executive directive, etc.) for audit purposes. Changes are logged.',
  },
  testReserve: {
    term: 'Test reserve',
    short: 'Budget set aside for experiments, learning agendas, and trying new channels or tactics.',
    governance:
      'Configured as a % of annual global budget. Not allocated to specific campaigns; drawn down as experiments are approved. Optional sub-tracking for which tests consumed budget.',
  },
  holdBackReserve: {
    term: 'Hold-back reserve',
    short:
      'Budget set aside for mid-cycle campaigns that emerge after planning. Funds new ad-hoc campaigns and absorbs cancellations.',
    governance:
      'Configured as a % of annual global budget at planning time. New campaigns draw from hold-back; cancelled campaigns return their dollars to hold-back. Can be redistributed via manual rebalance.',
  },
  campaigns: {
    term: 'Campaigns',
    short: 'Discretionary, model-driven allocations across known marketing campaigns.',
    governance:
      'Calculated using weighted scoring across Marketing Objective, Business Priority, and Region. Subject to manual adjustment within ±50% cap. Can be locked individually to protect from rebalancing.',
  },
  marketingObjective: {
    term: 'Marketing objective',
    short: 'A strategic goal for the year that paid media contributes to.',
    governance:
      'Set by leadership during strategic planning. Each campaign must be tagged to one objective. Weights reflect strategic priority — higher weight = more share of the pool.',
  },
  businessPriority: {
    term: 'Business priority',
    short:
      'A business unit, vertical, or product line being funded. Reflects which areas of the business marketing is supporting.',
    governance:
      'Set by leadership. Should approximately reflect P&L contribution and strategic investment focus. Each campaign tagged to one business priority.',
  },
  region: {
    term: 'Region',
    short: 'Geographic area where spend is deployed.',
    governance:
      'Regional weights are derived from the Regional Analysis module, not set directly. Update region scores there to influence campaign allocations.',
  },
  weight: {
    term: 'Weight (multiplier)',
    short:
      'A multiplier (e.g., 2.0×) that determines how much budget a campaign receives relative to baseline.',
    governance:
      'Multiplicative across dimensions. A campaign tagged to a 2.0× objective and 1.5× region gets a 3.0× composite score. Higher score = larger share of the pool.',
  },
  manualAdjustment: {
    term: 'Manual adjustment',
    short: 'A campaign-level override of the model-recommended allocation.',
    governance:
      'Bounded by ±50% cap from the model recommendation. Adjusted campaigns show a badge. Difference is redistributed across other unlocked campaigns on next rebalance.',
  },
  lockedCampaign: {
    term: 'Locked campaign',
    short:
      'A campaign whose dollar allocation is frozen and protected from rebalancing.',
    governance:
      'Locked campaigns hold their current value during rebalances. They are still editable directly. If too many campaigns are locked (>50% of pool), the model becomes cosmetic.',
  },
  rebalance: {
    term: 'Rebalance',
    short:
      'An explicit action to redistribute budget across all unlocked campaigns based on current weights.',
    governance:
      'Manual only — never automatic. Triggered by user action with preview before commit. New campaigns and cancellations flow through hold-back reserve until a rebalance is run.',
  },
  regionalAnalysis: {
    term: 'Regional analysis',
    short:
      'A weighted scoring rubric for evaluating each region across commercial and brand dimensions.',
    governance:
      'Updated annually or when material market shifts occur. Outputs regional weights that flow into campaign allocations. Both rubrics are captured; v1 uses commercial weight only in allocator math.',
  },
  changeLog: {
    term: 'Change log',
    short: 'Append-only record of every meaningful change to the budget plan.',
    governance:
      'All dollar changes, weight changes, locks, adjustments, and pool changes are logged with timestamp, actor, and rationale. Exportable for audit. Cannot be edited or deleted.',
  },
};

export function getDef(key) {
  return DEFINITIONS[key]?.short || '';
}
