import React, { useMemo } from 'react';
import { useData } from '../lib/DataContext.jsx';
import { computeRegionalWeights } from '../lib/calculations.js';
import { HelpIcon, InfoPanel } from './UI.jsx';
import { DEFINITIONS } from '../lib/definitions.js';

function FactorImportanceRow({ rubricKey, rubricLabel }) {
  const { data, dispatch, log } = useData();
  const factors = data.rubrics[rubricKey].factors;
  const total = factors.reduce((s, f) => s + Number(f.weight), 0);

  const updateWeight = (factorId, value) => {
    const old = factors.find(f => f.id === factorId)?.weight;
    dispatch({ type: 'UPDATE_FACTOR_WEIGHT', rubric: rubricKey, factorId, value: Number(value) });
    if (old !== Number(value)) {
      log({
        type: 'rubric',
        target: factorId,
        targetName: `${rubricLabel} factor: ${factors.find(f => f.id === factorId)?.name}`,
        summary: `Importance: ${old}% → ${value}%`,
        rationale: '',
      });
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <div className="section-title">{rubricLabel} factor importance</div>
          <div className="section-subtitle">
            Must sum to 100%. Currently: <span className="mono" style={{ color: total === 100 ? 'var(--accent)' : 'var(--warn)' }}>{total}%</span>
          </div>
        </div>
      </div>
      <div className="section-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
          {factors.map((f) => (
            <div key={f.id}>
              <div className="row between" style={{ marginBottom: '4px' }}>
                <span className="tiny" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {f.name} <HelpIcon definition={f.description} />
                </span>
                <span className="mono tiny" style={{ fontWeight: 500 }}>{f.weight}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={f.weight}
                onChange={(e) => updateWeight(f.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoringMatrix({ rubricKey, rubricLabel, weightKey }) {
  const { data, dispatch, log } = useData();
  const factors = data.rubrics[rubricKey].factors;
  const regionalWeights = useMemo(
    () => computeRegionalWeights(data.regions, data.rubrics),
    [data.regions, data.rubrics]
  );

  const updateScore = (regionId, factorId, value) => {
    const v = Math.max(1, Math.min(5, Number(value) || 0));
    const oldRegion = data.regions.find(r => r.id === regionId);
    const oldVal = oldRegion?.[rubricKey]?.[factorId];
    dispatch({ type: 'UPDATE_REGION_SCORE', id: regionId, rubric: rubricKey, factorId, value: v });
    if (oldVal !== v) {
      log({
        type: 'region-score',
        target: regionId,
        targetName: `${oldRegion?.name} — ${factors.find(f => f.id === factorId)?.name} (${rubricLabel})`,
        summary: `Score: ${oldVal} → ${v}`,
        rationale: '',
      });
    }
  };

  // Compute composite score for each region
  const totalImportance = factors.reduce((s, f) => s + Number(f.weight), 0) || 1;
  const composites = data.regions.map(r => {
    let sum = 0;
    for (const f of factors) {
      sum += (r[rubricKey]?.[f.id] ?? 0) * (f.weight / totalImportance);
    }
    return { id: r.id, score: sum };
  });

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <div className="section-title">{rubricLabel} region scores</div>
          <div className="section-subtitle">1–5 scale. Weight column shows resulting multiplier (1.0 = average).</div>
        </div>
      </div>
      <div className="section-body dense">
        <table className="t">
          <thead>
            <tr>
              <th>Region</th>
              {factors.map(f => <th key={f.id} className="center">{f.name}</th>)}
              <th className="num">Score</th>
              <th className="num">Weight</th>
            </tr>
          </thead>
          <tbody>
            {data.regions.map(r => {
              const composite = composites.find(c => c.id === r.id)?.score || 0;
              const weight = regionalWeights[r.id]?.[weightKey] ?? 1;
              return (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  {factors.map(f => (
                    <td key={f.id} className="center">
                      <input
                        type="number"
                        className="score-input"
                        min={1}
                        max={5}
                        value={r[rubricKey]?.[f.id] ?? 0}
                        onChange={(e) => updateScore(r.id, f.id, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="num">{composite.toFixed(2)}</td>
                  <td className="num" style={{ color: 'var(--accent)' }}>{weight.toFixed(2)}×</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RegionalAnalysis() {
  return (
    <>
      <InfoPanel storageKey="regional">
        <strong>Regional analysis</strong> evaluates each region across two rubrics: <em>commercial</em> (TAM,
        growth, revenue, strategic priority, whitespace, marketing efficiency) and <em>brand</em> (awareness,
        perception, consideration, brand investment thesis). The output is a regional weight that flows into
        the campaign allocator. {' '}
        <span className="muted">Note: in v1, only the commercial weight is used in allocator math. The brand
        rubric is captured for future use.</span>
      </InfoPanel>

      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 8 }}>Commercial rubric</h3>
      <FactorImportanceRow rubricKey="commercial" rubricLabel="Commercial" />
      <ScoringMatrix rubricKey="commercial" rubricLabel="Commercial" weightKey="commercial" />

      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 8, marginTop: 32 }}>Brand rubric</h3>
      <FactorImportanceRow rubricKey="brand" rubricLabel="Brand" />
      <ScoringMatrix rubricKey="brand" rubricLabel="Brand" weightKey="brand" />
    </>
  );
}
