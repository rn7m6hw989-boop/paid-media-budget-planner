import React, { useState, useMemo } from 'react';
import { useData } from '../../lib/DataContext.jsx';
import {
  computeRegionalWeights,
  computeStrategicLabel,
  LABEL_META,
} from '../../lib/calculations.js';
import { Modal, Tag } from '../UI.jsx';
import { FactorPopover } from './FactorPopover.jsx';

/**
 * FactorImportanceRow — slider grid that controls each factor's weight
 * within a rubric. Weights must sum to 100; the header shows the live
 * total (green = 100%, red otherwise).
 */
export function FactorImportanceRow({ rubricKey, rubricLabel }) {
  const { data, dispatch, log } = useData();
  const factors = data.rubrics[rubricKey].factors;
  const total = factors.reduce((s, f) => s + Number(f.weight), 0);

  const updateWeight = (factorId, value) => {
    const old = factors.find((f) => f.id === factorId)?.weight;
    dispatch({ type: 'UPDATE_FACTOR_WEIGHT', rubric: rubricKey, factorId, value: Number(value) });
    if (old !== Number(value)) {
      log({
        type: 'rubric',
        target: factorId,
        targetName: `${rubricLabel} factor: ${factors.find((f) => f.id === factorId)?.name}`,
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
            Must sum to 100%. Currently:{' '}
            <span
              className="mono"
              style={{
                color: total === 100 ? 'var(--success)' : 'var(--accent)',
                fontWeight: 500,
              }}
            >
              {total}%
            </span>
          </div>
        </div>
      </div>
      <div className="section-body">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {factors.map((f) => (
            <div key={f.id}>
              <div className="row between" style={{ marginBottom: '6px' }}>
                <span className="tiny">
                  <FactorPopover factor={f} />
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

/**
 * ScoringMatrix — table of regions × factors with score inputs (1–5).
 *
 * The commercial table (`editable`) owns inline name editing, the
 * "+ Add region" button, and per-row delete with a reference-block
 * guard. The brand table renders names read-only and has no add or
 * delete UI — names are managed in one place to avoid confusion.
 *
 * Setting `showLabel` adds the auto-derived strategic label column
 * (Defend / Grow / Build / Maintain) and hides it on the brand table.
 */
export function ScoringMatrix({
  rubricKey,
  rubricLabel,
  weightKey,
  showLabel = false,
  editable = false,
}) {
  const { data, dispatch, log } = useData();
  const factors = data.rubrics[rubricKey].factors;
  const regionalWeights = useMemo(
    () => computeRegionalWeights(data.regions, data.rubrics),
    [data.regions, data.rubrics]
  );
  const [confirmDelete, setConfirmDelete] = useState(null);

  const updateScore = (regionId, factorId, value) => {
    const v = Math.max(1, Math.min(5, Number(value) || 0));
    const oldRegion = data.regions.find((r) => r.id === regionId);
    const oldVal = oldRegion?.[rubricKey]?.[factorId];
    dispatch({ type: 'UPDATE_REGION_SCORE', id: regionId, rubric: rubricKey, factorId, value: v });
    if (oldVal !== v) {
      log({
        type: 'region-score',
        target: regionId,
        targetName: `${oldRegion?.name} — ${factors.find((f) => f.id === factorId)?.name} (${rubricLabel})`,
        summary: `Score: ${oldVal} → ${v}`,
        rationale: '',
      });
    }
  };

  const updateName = (regionId, name) => {
    dispatch({ type: 'UPDATE_REGION_NAME', id: regionId, name });
  };

  const addRegion = () => {
    dispatch({ type: 'ADD_REGION', name: 'New region' });
    log({
      type: 'region-add',
      target: 'region',
      targetName: 'New region',
      summary: 'Region added with default scores (3 across all factors)',
      rationale: '',
    });
  };

  const countRefs = (regionId) => {
    const camp = data.campaigns.filter((c) => c.regionId === regionId).length;
    const hc = data.hardCommitments.filter((h) => h.regionId === regionId).length;
    return { camp, hc, total: camp + hc };
  };

  const removeRegion = (region) => {
    dispatch({ type: 'REMOVE_REGION', id: region.id });
    log({
      type: 'region-remove',
      target: region.id,
      targetName: region.name,
      summary: 'Region removed',
      rationale: '',
    });
  };

  // Composite weighted score per region
  const totalImportance = factors.reduce((s, f) => s + Number(f.weight), 0) || 1;
  const composites = data.regions.map((r) => {
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
          <div className="section-subtitle">
            1–5 scale per input.
            {showLabel
              ? ' Score column is the weighted average. Label is auto-derived from revenue, whitespace, competitive intensity, TAM, and mix fit.'
              : ' Score column is the weighted average. Weight is normalized so 1.0 = average region.'}
          </div>
        </div>
        {editable && (
          <button className="btn primary sm" onClick={addRegion}>
            + Add region
          </button>
        )}
      </div>
      <div className="section-body dense">
        {data.regions.length === 0 ? (
          <div
            className="muted tiny"
            style={{
              padding: '32px',
              textAlign: 'center',
              border: '1px dashed var(--border)',
              borderTop: 'none',
              background: 'white',
            }}
          >
            {editable
              ? 'No regions yet. Click "+ Add region" above to begin scoring.'
              : 'No regions yet. Add regions in the commercial rubric above.'}
          </div>
        ) : (
          <table className="t">
            <thead>
              <tr>
                <th>Region</th>
                {factors.map((f) => (
                  <th key={f.id} className="center">
                    <FactorPopover factor={f}>
                      <span
                        style={{
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          fontSize: '10px',
                        }}
                      >
                        {f.name}
                      </span>
                    </FactorPopover>
                  </th>
                ))}
                <th className="num">Score</th>
                {showLabel && <th className="center">Label</th>}
                <th className="num">Weight</th>
                {editable && <th style={{ width: '36px' }}></th>}
              </tr>
            </thead>
            <tbody>
              {data.regions.map((r) => {
                const composite = composites.find((c) => c.id === r.id)?.score || 0;
                const weight = regionalWeights[r.id]?.[weightKey] ?? 1;
                const labelKey = showLabel ? computeStrategicLabel(r.commercial) : null;
                const labelMeta = labelKey ? LABEL_META[labelKey] : null;
                const refs = editable ? countRefs(r.id) : null;

                return (
                  <tr key={r.id}>
                    <td>
                      {editable ? (
                        <input
                          type="text"
                          value={r.name}
                          onChange={(e) => updateName(r.id, e.target.value)}
                          className="editable-text"
                          style={{
                            fontWeight: 500,
                            fontSize: '14px',
                            width: '100%',
                            minWidth: '120px',
                          }}
                          placeholder="Region name"
                        />
                      ) : (
                        <span style={{ fontWeight: 500 }}>{r.name}</span>
                      )}
                    </td>
                    {factors.map((f) => (
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
                    {showLabel && labelMeta && (
                      <td className="center">
                        <Tag variant={labelMeta.tone}>{labelMeta.label}</Tag>
                      </td>
                    )}
                    <td className="num" style={{ color: 'var(--accent)', fontWeight: 500 }}>
                      {weight.toFixed(2)}×
                    </td>
                    {editable && (
                      <td className="center">
                        <button
                          className="btn icon-only ghost"
                          onClick={() => setConfirmDelete(r)}
                          aria-label={`Remove ${r.name}`}
                          title={
                            refs.total > 0
                              ? `Cannot remove — ${refs.total} reference${refs.total === 1 ? '' : 's'}`
                              : 'Remove region'
                          }
                        >
                          ×
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {confirmDelete && (() => {
        const refs = countRefs(confirmDelete.id);
        const blocked = refs.total > 0;
        return (
          <Modal
            title={blocked ? 'Cannot remove region' : 'Remove this region?'}
            onClose={() => setConfirmDelete(null)}
            footer={
              <>
                <button className="btn ghost" onClick={() => setConfirmDelete(null)}>
                  {blocked ? 'Got it' : 'Cancel'}
                </button>
                {!blocked && (
                  <button
                    className="btn accent"
                    onClick={() => {
                      removeRegion(confirmDelete);
                      setConfirmDelete(null);
                    }}
                  >
                    Remove
                  </button>
                )}
              </>
            }
          >
            <p style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: 1.6 }}>
              {blocked ? (
                <>
                  <strong>{confirmDelete.name}</strong> cannot be removed because it is referenced
                  by{' '}
                  {refs.camp > 0 && (
                    <>
                      <strong>
                        {refs.camp} campaign{refs.camp === 1 ? '' : 's'}
                      </strong>
                      {refs.hc > 0 && ' and '}
                    </>
                  )}
                  {refs.hc > 0 && (
                    <strong>
                      {refs.hc} hard commitment{refs.hc === 1 ? '' : 's'}
                    </strong>
                  )}
                  . Reassign or remove these references in the Budget Allocation tab first.
                </>
              ) : (
                <>
                  This will permanently remove <strong>{confirmDelete.name}</strong> and its scores
                  from both rubrics.
                </>
              )}
            </p>
          </Modal>
        );
      })()}
    </div>
  );
}
