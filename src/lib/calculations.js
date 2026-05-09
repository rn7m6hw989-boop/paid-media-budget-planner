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
 * Compute each region's *share* of the total budget (sums to 1.0).
 * Uses the commercial composite score as the basis, then normalizes
 * so all regional shares sum to exactly 1.0.
 *
 * This is what feeds into the regional envelope calculation.
 *
 * Returns: { regionId: shareOfTotal }   // values sum to 1.0
 */
export function computeRegionalShares(regions, rubrics) {
  if (!regions || regions.length === 0) return {};

  const factors = rubrics.commercial.factors;
  const totalImportance = factors.reduce((s, f) => s + Number(f.weight), 0) || 1;

  // Compute composite scores
  const scores = {};
  for (const r of regions) {
    const region = r.commercial || {};
    let composite = 0;
    for (const f of factors) {
      const score = Number(region[f.id]) || 0;
      composite += score * (f.weight / totalImportance);
    }
    scores[r.id] = composite;
  }

  // Normalize to shares summing to 1.0
  const totalScore = Object.values(scores).reduce((s, v) => s + v, 0);
  const shares = {};
  for (const id in scores) {
    shares[id] = totalScore > 0 ? scores[id] / totalScore : 1 / regions.length;
  }
  return shares;
}

/**
 * Compute the budget pool breakdown.
 *
 * New model (envelope-based):
 *   annualGlobalBudget
 *   - hardCommitmentsTotal (locked, off the top)
 *   - testReserve (% of annual, off the top)
 *   - holdBackReserve (% of annual, off the top)
 *   = discretionaryPool — gets sliced into regional envelopes
 *
 * Each region's envelope = discretionaryPool × regionalShare
 * Each envelope splits into brand pool + demand pool by the org-level brand/demand ratio.
 *
 * Returns the same top-level keys as before (for backward compatibility) PLUS
 * the per-region envelope breakdown.
 */
export function computePoolBreakdown(data) {
  const annualGlobalBudget = Number(data.pool.annualGlobalBudget) || 0;
  const hardCommitmentsTotal = (data.hardCommitments || []).reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0
  );
  const testReserve = Math.round(annualGlobalBudget * (data.pool.testReservePercent / 100));
  const holdBackReserve = Math.round(annualGlobalBudget * (data.pool.holdBackPercent / 100));
  const discretionaryPool = Math.max(
    0,
    annualGlobalBudget - hardCommitmentsTotal - testReserve - holdBackReserve
  );

  // Brand/demand ratio (default 55/45 if missing)
  const brandPct = Number(data.pool.brandDemandRatio?.brand) || 55;
  const demandPct = 100 - brandPct;

  // Regional shares (sum to 1.0). If regions/rubrics are missing, fall back to equal share.
  const shares = data.regions && data.rubrics
    ? computeRegionalShares(data.regions, data.rubrics)
    : {};

  // Build envelope per region
  const envelopes = {};
  let assignedTotal = 0;
  const regionList = data.regions || [];
  for (const r of regionList) {
    const share = shares[r.id] ?? 0;
    const envelope = Math.round(discretionaryPool * share);
    const brandPool = Math.round(envelope * (brandPct / 100));
    const demandPool = envelope - brandPool; // ensures sum equals envelope exactly
    envelopes[r.id] = {
      regionId: r.id,
      regionName: r.name,
      share,
      envelope,
      brandPool,
      demandPool,
    };
    assignedTotal += envelope;
  }

  return {
    annualGlobalBudget,
    hardCommitmentsTotal,
    testReserve,
    holdBackReserve,
    discretionaryPool,
    // Backward-compatible alias for code that still references `campaignsPool`
    campaignsPool: discretionaryPool,
    brandPct,
    demandPct,
    envelopes,
    // Diagnostic — should be ~= discretionaryPool, off by at most a few cents from rounding
    envelopesAssignedTotal: assignedTotal,
  };
}

/**
 * Compute a campaign's combined weight inside its pool.
 *
 * In the envelope model, the regional dimension is already factored in
 * via the envelope (campaigns can only draw from their region's pool),
 * so the campaign-level combined weight is just priority × objective.
 *
 * Both priority and objective weights are now percentages summing to 100.
 * They get treated as fractions (0–1) here.
 */
export function computeCampaignCombinedWeight(campaign, data) {
  const obj = data.objectives.find((o) => o.id === campaign.objectiveId);
  const bp = data.businessPriorities.find((b) => b.id === campaign.businessPriorityId);

  const objWeight = obj ? (Number(obj.weight) || 0) / 100 : 0;
  const bpWeight = bp ? (Number(bp.weight) || 0) / 100 : 0;

  return objWeight * bpWeight;
}

/**
 * Compute model-recommended allocation for each campaign using the envelope model.
 *
 * Process:
 *   1. Determine the pool breakdown (annual budget → envelopes → brand/demand pools)
 *   2. Group campaigns by (regionId, pool)
 *   3. Within each bucket:
 *      a. Locked campaigns retain their current value
 *      b. Remaining budget in the bucket is normalized across unlocked campaigns
 *         by their combined weight (priority × objective)
 *   4. Money never crosses bucket boundaries.
 *
 * Returns: { campaignId: { recommended, current, weight, isLocked, bucketId } }
 */
export function computeAllocations(data) {
  const pool = computePoolBreakdown(data);
  const result = {};

  // Group campaigns by (regionId, pool)
  // Pool is 'brand' or 'demand'; campaigns missing pool tag default to 'demand'
  const buckets = {};
  for (const c of data.campaigns) {
    const poolTag = c.pool || 'demand';
    const bucketId = `${c.regionId}::${poolTag}`;
    if (!buckets[bucketId]) {
      buckets[bucketId] = {
        regionId: c.regionId,
        pool: poolTag,
        campaigns: [],
      };
    }
    buckets[bucketId].campaigns.push(c);
  }

  // For each bucket, compute allocations
  for (const bucketId in buckets) {
    const { regionId, pool: poolTag, campaigns } = buckets[bucketId];
    const envelope = pool.envelopes[regionId];
    const bucketSize = envelope ? envelope[`${poolTag}Pool`] : 0;

    // Locked campaigns hold their current value
    let lockedTotal = 0;
    const unlocked = [];
    for (const c of campaigns) {
      if (c.locked) {
        const current = c.manualAdjustment ?? 0;
        lockedTotal += current;
        result[c.id] = {
          recommended: current,
          current,
          weight: 0,
          isLocked: true,
          bucketId,
        };
      } else {
        unlocked.push(c);
      }
    }

    // Available budget for unlocked campaigns
    const availableForUnlocked = Math.max(0, bucketSize - lockedTotal);

    // Compute combined weights for unlocked campaigns
    let totalWeight = 0;
    const weights = {};
    for (const c of unlocked) {
      const w = computeCampaignCombinedWeight(c, data);
      weights[c.id] = w;
      totalWeight += w;
    }

    // Normalize: each unlocked campaign gets (weight / totalWeight) × availableBudget
    for (const c of unlocked) {
      const recommended =
        totalWeight > 0 ? Math.round((weights[c.id] / totalWeight) * availableForUnlocked) : 0;
      const current = c.manualAdjustment ?? recommended;
      result[c.id] = {
        recommended,
        current,
        weight: weights[c.id],
        isLocked: false,
        bucketId,
      };
    }
  }

  return result;
}

/**
 * Compute breakdowns by dimension for visualization.
 * If includeHardCommitments = true, hard commitments are added to their tagged dimensions.
 *
 * Returns: { byObjective, byBusinessPriority, byRegion, byPool }
 */
export function computeBreakdowns(data, allocations, includeHardCommitments = true) {
  const byObjective = {};
  const byBusinessPriority = {};
  const byRegion = {};
  const byPool = { brand: { id: 'brand', name: 'Brand', value: 0 }, demand: { id: 'demand', name: 'Demand', value: 0 } };

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
    const poolKey = c.pool || 'demand';
    if (byPool[poolKey]) byPool[poolKey].value += amt;
  }

  // Add hard commitments
  if (includeHardCommitments) {
    for (const hc of data.hardCommitments) {
      const amt = Number(hc.amount) || 0;
      if (byObjective[hc.objectiveId]) byObjective[hc.objectiveId].value += amt;
      if (byBusinessPriority[hc.businessPriorityId])
        byBusinessPriority[hc.businessPriorityId].value += amt;
      if (byRegion[hc.regionId]) byRegion[hc.regionId].value += amt;
      const poolKey = hc.pool || 'brand'; // hard commitments default to brand if untagged
      if (byPool[poolKey]) byPool[poolKey].value += amt;
    }
  }

  return {
    byObjective: Object.values(byObjective),
    byBusinessPriority: Object.values(byBusinessPriority),
    byRegion: Object.values(byRegion),
    byPool: Object.values(byPool),
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
