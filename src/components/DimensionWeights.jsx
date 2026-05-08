import React from 'react';
import { useData } from '../lib/DataContext.jsx';
import { HelpIcon } from './UI.jsx';
import { DEFINITIONS } from '../lib/definitions.js';

function WeightSlider({ name, weight, onChange, max = 3 }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div className="row between" style={{ marginBottom: '3px' }}>
        <span style={{ fontSize: 'var(--text-sm)' }}>{name}</span>
        <span className="mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
          {Number(weight).toFixed(1)}×
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={0.1}
        value={weight}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

export function DimensionWeights() {
  const { data, dispatch, log } = useData();

  const updateObjective = (id, weight) => {
    const obj = data.objectives.find(o => o.id === id);
    const old = obj?.weight;
    dispatch({ type: 'UPDATE_OBJECTIVE', id, changes: { weight } });
    if (old !== weight) {
      log({
        type: 'weight',
        target: id,
        targetName: `Objective: ${obj?.name}`,
        summary: `Weight: ${Number(old).toFixed(1)}× → ${Number(weight).toFixed(1)}×`,
        rationale: '',
      });
    }
  };

  const updateBP = (id, weight) => {
    const bp = data.businessPriorities.find(b => b.id === id);
    const old = bp?.weight;
    dispatch({ type: 'UPDATE_BUSINESS_PRIORITY', id, changes: { weight } });
    if (old !== weight) {
      log({
        type: 'weight',
        target: id,
        targetName: `Business priority: ${bp?.name}`,
        summary: `Weight: ${Number(old).toFixed(1)}× → ${Number(weight).toFixed(1)}×`,
        rationale: '',
      });
    }
  };

  return (
    <div className="section-card" style={{ marginBottom: 0 }}>
      <div className="section-header">
        <div>
          <div className="section-title">Dimension weights</div>
          <div className="section-subtitle">Multiplicative scoring</div>
        </div>
        <HelpIcon definition={DEFINITIONS.weight.short} />
      </div>

      <div className="section-body">
        <div className="col gap-md">
          <div>
            <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Marketing objectives
              <HelpIcon definition={DEFINITIONS.marketingObjective.short} />
            </label>
            {data.objectives.map((o) => (
              <WeightSlider
                key={o.id}
                name={o.name}
                weight={o.weight}
                onChange={(w) => updateObjective(o.id, w)}
              />
            ))}
          </div>

          <div>
            <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Business priorities
              <HelpIcon definition={DEFINITIONS.businessPriority.short} />
            </label>
            {data.businessPriorities.map((b) => (
              <WeightSlider
                key={b.id}
                name={b.name}
                weight={b.weight}
                onChange={(w) => updateBP(b.id, w)}
              />
            ))}
          </div>

          <div>
            <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Region
              <HelpIcon definition={DEFINITIONS.region.short} />
            </label>
            <div className="tiny muted" style={{ lineHeight: 1.5 }}>
              Regional weights are derived from the Regional Analysis tab. Edit there to influence
              campaign allocations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
