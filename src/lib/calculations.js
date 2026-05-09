/**
 * Compute regional weights from rubric scores.
 * Each region's composite score = weighted sum of factor scores (1-5)
 * weighted by factor importance (must sum to 100).
 *
 * The composite score is then normalized so the average region = 1.0×.
 *
 * Returns: { regionId: { commercial: number, brand: number } }
 */
export function computeRegionalWeights(regions, rubrics) {
  if (!regions || regions.length === 0) return {};

  const compute = (rubricKey) => {
    const factors = rubrics[rubricKey].factors;
    const totalImportance = factors.reduce((s, f) => s + f.weight, 0) || 1;

    const scores = {};
    for (const r of regions) {
      const region = r[rubricKey] || {};
      let composite = 0;
      for (const f of factors) {
        const score = region[f.id] ?? 0;
        composite += score * (f.weight / totalImportance);
      }
      scores[r.id] = composite;
    }

    // Normalize so the average region = 1.0
    const vals = Object.values(scores);
    const avg = vals.reduce((s, v) => s + v, 0) / (vals.length || 1) || 1;
    const normalized = {};
    for (const id in scores) {
      normalized[id] = avg > 0 ? scores[id] / avg : 1;
    }
    return normalized;
  };

  const commercial = compute('commercial');
  const brand = compute('brand');

  const result = {};
  for (const r of regions) {
    result[r.id] = {
      commercial: commercial[r.id] ?? 1,
      brand: brand[r.id] ?? 1,
    };
  }
  return result;
}

/**
 * Compute the budget pool breakdown.
 * Returns:
 *   annualGlobalBudget, hardCommitmentsTotal, testReserve, holdBackReserve, campaignsPool
 */
export function computePoolBreakdown(data) {
  const annualGlobalBudget = Number(data.pool.annualGlobalBudget) || 0;
  const hardCommitmentsTotal = (data.hardCommitments || []).reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0
  );
  const testReserve = Math.round(annualGlobalBudget * (data.pool.testReservePercent / 100));
  const holdBackReserve = Math.round(annualGlobalBudget * (data.pool.holdBackPercent / 100));
  const campaignsPool = Math.max(
    0,
    annualGlobalBudget - hardCommitmentsTotal - testReserve - holdBackReserve
  );

  return {
    annualGlobalBudget,
    hardCommitmentsTotal,
    testReserve,
    holdBackReserve,
    campaignsPool,
  };
}

/**
 * Compute a campaign's raw weighted score.
 * Multiplicative across the three dimensions.
 */
export function computeCampaignScore(campaign, data, regionalWeights) {
  const obj = data.objectives.find((o) => o.id === campaign.objectiveId);
  const bp = data.businessPriorities.find((b) => b.id === campaign.businessPriorityId);
  const regWeight = regionalWeights[campaign.regionId]?.commercial ?? 1;

  const objWeight = obj ? Number(obj.weight) || 0 : 0;
  const bpWeight = bp ? Number(bp.weight) || 0 : 0;

  return objWeight * bpWeight * regWeight;
}

/**
 * Compute model-recommended allocation for each campaign.
 * Locked campaigns retain their current value (manualAdjustment).
 * Unlocked campaigns share the remaining pool by their weighted scores.
 *
 * Returns: { campaignId: { recommended: number, current: number, score: number } }
 */
export function computeAllocations(data, regionalWeights) {
  const pool = computePoolBreakdown(data);
  const result = {};

  // Step 1: locked campaigns hold their current value
  let lockedTotal = 0;
  for (const c of data.campaigns) {
    if (c.locked) {
      const current = c.manualAdjustment ?? 0;
      lockedTotal += current;
      result[c.id] = { recommended: current, current, score: 0, isLocked: true };
    }
  }

  // Step 2: unlocked pool = campaignsPool - locked
  const unlockedPool = Math.max(0, pool.campaignsPool - lockedTotal);

  // Step 3: compute scores for unlocked campaigns
  const unlocked = data.campaigns.filter((c) => !c.locked);
  let totalScore = 0;
  const scores = {};
  for (const c of unlocked) {
    const s = computeCampaignScore(c, data, regionalWeights);
    scores[c.id] = s;
    totalScore += s;
  }

  // Step 4: assign weighted allocations
  for (const c of unlocked) {
    const recommended = totalScore > 0 ? Math.round((scores[c.id] / totalScore) * unlockedPool) : 0;
    const current = c.manualAdjustment ?? recommended;
    result[c.id] = { recommended, current, score: scores[c.id], isLocked: false };
  }

  return result;
}

/**
 * Compute breakdowns by dimension for visualization.
 * If includeHardCommitments = true, hard commitments are added to their tagged dimensions.
 */
export function computeBreakdowns(data, allocations, includeHardCommitments = true) {
  const byObjective = {};
  const byBusinessPriority = {};
  const byRegion = {};

  // Initialize all known buckets
  for (const o of data.objectives) byObjective[o.id] = { id: o.id, name: o.name, value: 0 };
  for (const b of data.businessPriorities)
    byBusinessPriority[b.id] = { id: b.id, name: b.name, value: 0 };
  for (const r of data.regions) byRegion[r.id] = { id: r.id, name: r.name, value: 0 };

  // Add campaigns
  for (const c of data.campaigns) {
    const amt = allocations[c.id]?.current ?? 0;
    if (byObjective[c.objectiveId]) byObjective[c.objectiveId].value += amt;
    if (byBusinessPriority[c.businessPriorityId])
      byBusinessPriority[c.businessPriorityId].value += amt;
    if (byRegion[c.regionId]) byRegion[c.regionId].value += amt;
  }

  // Add hard commitments
  if (includeHardCommitments) {
    for (const hc of data.hardCommitments) {
      const amt = Number(hc.amount) || 0;
      if (byObjective[hc.objectiveId]) byObjective[hc.objectiveId].value += amt;
      if (byBusinessPriority[hc.businessPriorityId])
        byBusinessPriority[hc.businessPriorityId].value += amt;
      if (byRegion[hc.regionId]) byRegion[hc.regionId].value += amt;
    }
  }

  return {
    byObjective: Object.values(byObjective),
    byBusinessPriority: Object.values(byBusinessPriority),
    byRegion: Object.values(byRegion),
  };
}

export function formatCurrency(amount) {
  if (amount == null) return '—';
  const n = Number(amount);
  if (Math.abs(n) >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatCurrencyFull(amount) {
  if (amount == null) return '—';
  return `$${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatPercent(value, total) {
  if (!total || total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

/**
 * Compute the strategic label for a region based on its commercial scores.
 *
 * Logic (evaluated in order; first match wins):
 *
 * Defend:    revenue >= 4 AND (
 *              comp_intensity == 5
 *              OR (comp_intensity == 4 AND whitespace <= 2)
 *            )
 *
 * Grow:      revenue >= 3 AND whitespace >= 3 AND mix_fit >= 3
 *            AND comp_intensity <= 3
 *            AND (revenue >= 4 OR whitespace >= 4 OR mix_fit >= 4)
 *
 * Build:     tam >= 4 AND mix_fit >= 3 AND revenue <= 3
 *            AND comp_intensity <= 3
 *
 * Maintain:  default
 *
 * Returns: 'defend' | 'grow' | 'build' | 'maintain'
 */
export function computeStrategicLabel(commercialScores) {
  if (!commercialScores) return 'maintain';

  const revenue = Number(commercialScores.revenue) || 0;
  const compIntensity = Number(commercialScores.comp_intensity) || 0;
  const whitespace = Number(commercialScores.whitespace) || 0;
  const tam = Number(commercialScores.tam) || 0;
  const mixFit = Number(commercialScores.mix_fit) || 0;

  // Step 1: Defend
  if (revenue >= 4) {
    if (compIntensity === 5) return 'defend';
    if (compIntensity === 4 && whitespace <= 2) return 'defend';
  }

  // Step 2: Grow
  if (
    revenue >= 3 &&
    whitespace >= 3 &&
    mixFit >= 3 &&
    compIntensity <= 3 &&
    (revenue >= 4 || whitespace >= 4 || mixFit >= 4)
  ) {
    return 'grow';
  }

  // Step 3: Build
  if (tam >= 4 && mixFit >= 3 && revenue <= 3 && compIntensity <= 3) {
    return 'build';
  }

  // Step 4: Maintain (default)
  return 'maintain';
}

export const LABEL_META = {
  defend: { label: 'Defend', tone: 'label-defend', description: 'Protect a meaningful base from active competitive threat.' },
  grow: { label: 'Grow', tone: 'label-grow', description: 'Lean in offensively from an existing position with real headroom.' },
  build: { label: 'Build', tone: 'label-build', description: 'Establish presence in a strategically valuable long-term opportunity.' },
  maintain: { label: 'Maintain', tone: 'label-maintain', description: 'Stable, lower-priority — no meaningful base or distinguishing opportunity.' },
};
