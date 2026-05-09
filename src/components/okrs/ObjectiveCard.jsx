import React, { useState } from 'react';
import { useData } from '../../lib/DataContext.jsx';
import { HelpIcon, Modal, EditableInput } from '../UI.jsx';
import { KeyResultRow } from './KeyResultRow.jsx';

const KR_HARD_CAP = 5; // Grove discipline

/**
 * ObjectiveCard — a marketing objective with collapsible details.
 *
 * Header (always visible) shows number, name, KR count, and the
 * strategic weight pill. Body (visible when expanded) lets the user
 * edit name, description, weight, and KRs.
 */
export function ObjectiveCard({ objective, index, onUpdate, onRemove, log }) {
  const { dispatch } = useData();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const krs = objective.keyResults || [];
  const krCapReached = krs.length >= KR_HARD_CAP;

  const updateWeight = (weight) => {
    const old = objective.weight;
    onUpdate({ weight });
    if (old !== weight) {
      log({
        type: 'weight',
        target: objective.id,
        targetName: `Objective: ${objective.name}`,
        summary: `Weight: ${Number(old) || 0}% → ${Number(weight) || 0}%`,
        rationale: '',
      });
    }
  };

  const addKR = () => {
    if (krCapReached) return;
    dispatch({ type: 'ADD_KEY_RESULT', objectiveId: objective.id });
    log({
      type: 'okr-kr-add',
      target: objective.id,
      targetName: `KR added to: ${objective.name}`,
      summary: 'New key result',
      rationale: '',
    });
  };

  const updateKR = (krId, changes) => {
    dispatch({ type: 'UPDATE_KEY_RESULT', objectiveId: objective.id, krId, changes });
  };

  const removeKR = (krId) => {
    dispatch({ type: 'REMOVE_KEY_RESULT', objectiveId: objective.id, krId });
    log({
      type: 'okr-kr-remove',
      target: objective.id,
      targetName: `KR removed from: ${objective.name}`,
      summary: 'Key result deleted',
      rationale: '',
    });
  };

  return (
    <div className={`okr-card ${expanded ? 'expanded' : ''}`}>
      <div
        className="okr-summary"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <div className="okr-number">{String(index + 1).padStart(2, '0')}</div>
        <div className="okr-name">
          {objective.name || (
            <span style={{ color: 'var(--ink-4)', fontStyle: 'italic' }}>Untitled objective</span>
          )}
        </div>
        <div className="okr-kr-count">
          {krs.length} KR{krs.length === 1 ? '' : 's'}
        </div>
        <div className="row gap-sm">
          <span className="okr-weight-pill">{Number(objective.weight) || 0}%</span>
          <span className="collapse-toggle" aria-label={expanded ? 'Collapse' : 'Expand'}>
            <span className={`collapse-icon ${expanded ? 'open' : ''}`}>›</span>
          </span>
        </div>
      </div>

      {expanded && (
        <div className="okr-body">
          <div className="col gap-lg">
            <div className="editable-row">
              <label className="field">
                Objective name
                <span className="editable-hint">click to edit</span>
              </label>
              <EditableInput
                value={objective.name}
                onChange={(v) => onUpdate({ name: v })}
                placeholder="What do you want to achieve?"
                style={{ fontWeight: 500 }}
              />
            </div>

            <div className="editable-row">
              <label className="field">
                Strategic context
                <span className="editable-hint">click to edit</span>
              </label>
              <EditableInput
                value={objective.description}
                onChange={(v) => onUpdate({ description: v })}
                placeholder="1–2 sentences explaining why this objective matters this year"
                multiline
              />
            </div>

            <div>
              <div className="row between" style={{ marginBottom: '6px' }}>
                <label className="field" style={{ marginBottom: 0 }}>
                  Strategic weight (%)
                  <HelpIcon definition="Each objective's share of strategic priority. All objectives' weights must sum to 100%. Combined with business priority weight to drive campaign budget within each pool." />
                </label>
                <span className="okr-weight-pill">{Number(objective.weight) || 0}%</span>
              </div>
              <input
                type="number"
                className="input numeric"
                min={0}
                max={100}
                step={1}
                value={objective.weight}
                onChange={(e) => updateWeight(Number(e.target.value) || 0)}
                style={{ maxWidth: '120px' }}
              />
            </div>

            <div>
              <div className="row between" style={{ marginBottom: '10px' }}>
                <div>
                  <label className="field" style={{ marginBottom: 0 }}>Key results</label>
                  <div className="tiny muted" style={{ marginTop: '2px' }}>
                    {krs.length} of {KR_HARD_CAP} (Grove discipline — keep to 2–5)
                  </div>
                </div>
                <button
                  className="btn sm"
                  onClick={addKR}
                  disabled={krCapReached}
                  title={
                    krCapReached
                      ? 'Hard cap reached. Grove recommended ≤5 KRs per objective.'
                      : 'Add a key result'
                  }
                >
                  + Add key result
                </button>
              </div>

              {krs.length === 0 ? (
                <div
                  className="tiny muted"
                  style={{
                    padding: '14px',
                    border: '1px dashed var(--border)',
                    textAlign: 'center',
                    background: 'white',
                  }}
                >
                  No key results yet. An objective without measurable KRs is just an aspiration.
                </div>
              ) : (
                krs.map((kr) => (
                  <KeyResultRow
                    key={kr.id}
                    kr={kr}
                    onUpdate={(changes) => updateKR(kr.id, changes)}
                    onRemove={() => removeKR(kr.id)}
                  />
                ))
              )}
            </div>

            <div
              className="row"
              style={{
                justifyContent: 'flex-end',
                borderTop: '1px solid var(--border)',
                paddingTop: '12px',
              }}
            >
              <button className="btn sm danger" onClick={() => setConfirmDelete(true)}>
                Remove objective
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <Modal
          title="Remove this objective?"
          onClose={() => setConfirmDelete(false)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button
                className="btn accent"
                onClick={() => {
                  onRemove();
                  setConfirmDelete(false);
                }}
              >
                Remove
              </button>
            </>
          }
        >
          <p style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: 1.6 }}>
            This will permanently delete{' '}
            <strong>{objective.name || 'this objective'}</strong> and all of its key results. Any
            campaigns currently tagged to this objective will need to be retagged.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--ink-2)', marginTop: '12px' }}>
            This action is logged and cannot be undone from the change log.
          </p>
        </Modal>
      )}
    </div>
  );
}
