import React, { useState } from 'react';
import { useData } from '../lib/DataContext.jsx';
import { HelpIcon, InfoPanel, Modal } from './UI.jsx';
import { DEFINITIONS } from '../lib/definitions.js';

const OBJECTIVES_DEFAULT = 5;
const OBJECTIVES_HARD_CAP = 10;
const PRIORITIES_DEFAULT = 5;
const PRIORITIES_HARD_CAP = 10;
const KR_HARD_CAP = 5; // Grove discipline

/* ============================================================
   Key Result row
   ============================================================ */
function KeyResultRow({ objectiveId, kr, onUpdate, onRemove }) {
  const [draft, setDraft] = useState(kr);

  const commit = (changes) => {
    setDraft({ ...draft, ...changes });
    onUpdate(changes);
  };

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        background: 'var(--surface-2)',
        padding: '12px 14px',
        marginBottom: '8px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '12px',
      }}
    >
      <div className="col gap-md" style={{ flex: 1 }}>
        <div>
          <label className="field">Description</label>
          <input
            type="text"
            className="input"
            value={draft.description || ''}
            onChange={(e) => commit({ description: e.target.value })}
            placeholder="e.g., Generate $400M in qualified pipeline"
          />
        </div>

        <div className="row gap-md" style={{ alignItems: 'flex-end' }}>
          <div style={{ flexShrink: 0 }}>
            <label className="field">Type</label>
            <div className="row gap-sm">
              <button
                type="button"
                className={`btn sm ${draft.type === 'milestone' ? 'primary' : ''}`}
                onClick={() => commit({ type: 'milestone', target: null, unit: '' })}
              >
                Milestone
              </button>
              <button
                type="button"
                className={`btn sm ${draft.type === 'measurable' ? 'primary' : ''}`}
                onClick={() => commit({ type: 'measurable' })}
              >
                Measurable
              </button>
            </div>
          </div>

          {draft.type === 'measurable' && (
            <>
              <div style={{ width: '120px' }}>
                <label className="field">Target</label>
                <input
                  type="number"
                  className="input numeric"
                  value={draft.target ?? ''}
                  onChange={(e) =>
                    commit({ target: e.target.value === '' ? null : Number(e.target.value) })
                  }
                  step={1}
                />
              </div>
              <div style={{ width: '120px' }}>
                <label className="field">Unit</label>
                <input
                  type="text"
                  className="input"
                  value={draft.unit || ''}
                  onChange={(e) => commit({ unit: e.target.value })}
                  placeholder="$, %, count"
                />
              </div>
            </>
          )}
        </div>

        <div>
          <label className="field">Notes (optional)</label>
          <input
            type="text"
            className="input"
            value={draft.notes || ''}
            onChange={(e) => commit({ notes: e.target.value })}
            placeholder="Owner, baseline, caveats"
          />
        </div>
      </div>

      <button className="btn icon-only ghost" onClick={onRemove} title="Remove key result" aria-label="Remove">
        ×
      </button>
    </div>
  );
}

/* ============================================================
   Objective card
   ============================================================ */
function ObjectiveCard({ objective, index, onUpdate, onRemove, log }) {
  const { dispatch } = useData();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const krs = objective.keyResults || [];
  const krCapReached = krs.length >= KR_HARD_CAP;

  const updateField = (changes) => {
    onUpdate(changes);
  };

  const updateWeight = (weight) => {
    const old = objective.weight;
    onUpdate({ weight });
    if (old !== weight) {
      log({
        type: 'weight',
        target: objective.id,
        targetName: `Objective: ${objective.name}`,
        summary: `Weight: ${Number(old).toFixed(1)}× → ${Number(weight).toFixed(1)}×`,
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
    <div className="section-card" style={{ marginBottom: '20px' }}>
      <div className="section-header">
        <div className="row gap-md" style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: '24px',
              fontWeight: 300,
              color: 'var(--accent)',
              letterSpacing: '-0.02em',
              minWidth: '32px',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={objective.name}
              onChange={(e) => updateField({ name: e.target.value })}
              className="input"
              style={{
                fontWeight: 500,
                fontSize: '15px',
                border: 'none',
                background: 'transparent',
                padding: '4px 0',
              }}
              placeholder="Objective name"
            />
          </div>
        </div>
        <button className="btn sm danger" onClick={() => setConfirmDelete(true)}>
          Remove
        </button>
      </div>

      <div className="section-body">
        <div className="col gap-lg">
          <div>
            <label className="field">Strategic context</label>
            <textarea
              className="textarea"
              value={objective.description || ''}
              onChange={(e) => updateField({ description: e.target.value })}
              placeholder="1–2 sentences explaining why this objective matters this year"
              rows={2}
              style={{ resize: 'vertical', minHeight: '50px' }}
            />
          </div>

          <div>
            <div className="row between" style={{ marginBottom: '6px' }}>
              <label className="field" style={{ marginBottom: 0 }}>
                Budget weight
                <HelpIcon definition={DEFINITIONS.weight.short} />
              </label>
              <span
                className="mono"
                style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent)' }}
              >
                {Number(objective.weight).toFixed(1)}×
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={0.1}
              value={objective.weight}
              onChange={(e) => updateWeight(parseFloat(e.target.value))}
            />
          </div>

          <div>
            <div className="row between" style={{ marginBottom: '10px' }}>
              <div>
                <label className="field" style={{ marginBottom: 0 }}>
                  Key results
                </label>
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
                }}
              >
                No key results yet. An objective without measurable KRs is just an aspiration.
              </div>
            ) : (
              krs.map((kr) => (
                <KeyResultRow
                  key={kr.id}
                  objectiveId={objective.id}
                  kr={kr}
                  onUpdate={(changes) => updateKR(kr.id, changes)}
                  onRemove={() => removeKR(kr.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

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
            This will permanently delete <strong>{objective.name}</strong> and all of its key
            results. Any campaigns currently tagged to this objective will need to be retagged.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--ink-2)', marginTop: '12px' }}>
            This action is logged and cannot be undone from the change log.
          </p>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   Business priority card
   ============================================================ */
function BusinessPriorityCard({ priority, index, onUpdate, onRemove, log }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateWeight = (weight) => {
    const old = priority.weight;
    onUpdate({ weight });
    if (old !== weight) {
      log({
        type: 'weight',
        target: priority.id,
        targetName: `Business priority: ${priority.name}`,
        summary: `Weight: ${Number(old).toFixed(1)}× → ${Number(weight).toFixed(1)}×`,
        rationale: '',
      });
    }
  };

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '16px 18px',
        marginBottom: '12px',
        borderLeft: '3px solid var(--accent)',
      }}
    >
      <div className="row between" style={{ marginBottom: '10px' }}>
        <div className="row gap-md" style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: '18px',
              fontWeight: 300,
              color: 'var(--accent)',
              minWidth: '24px',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
          <input
            type="text"
            value={priority.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="input"
            style={{
              fontWeight: 500,
              fontSize: '14px',
              border: 'none',
              background: 'transparent',
              padding: '4px 0',
              flex: 1,
            }}
            placeholder="Priority name"
          />
        </div>
        <button className="btn sm ghost" onClick={() => setConfirmDelete(true)} aria-label="Remove">
          ×
        </button>
      </div>

      <div className="col gap-md">
        <div>
          <label className="field">Description</label>
          <textarea
            className="textarea"
            value={priority.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="1–2 sentences describing this priority and why it exists"
            rows={2}
            style={{ resize: 'vertical', minHeight: '45px' }}
          />
        </div>

        <div>
          <div className="row between" style={{ marginBottom: '6px' }}>
            <label className="field" style={{ marginBottom: 0 }}>Budget weight</label>
            <span
              className="mono"
              style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent)' }}
            >
              {Number(priority.weight).toFixed(1)}×
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={3}
            step={0.1}
            value={priority.weight}
            onChange={(e) => updateWeight(parseFloat(e.target.value))}
          />
        </div>
      </div>

      {confirmDelete && (
        <Modal
          title="Remove this priority?"
          onClose={() => setConfirmDelete(false)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
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
            This will delete <strong>{priority.name}</strong>. Campaigns tagged to it will need to be
            retagged.
          </p>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   Main component
   ============================================================ */
export function ObjectivesAndPriorities() {
  const { data, dispatch, log } = useData();

  const objectives = data.objectives || [];
  const priorities = data.businessPriorities || [];

  const objectivesAtCap = objectives.length >= OBJECTIVES_HARD_CAP;
  const objectivesAtRecommended = objectives.length >= OBJECTIVES_DEFAULT;
  const prioritiesAtCap = priorities.length >= PRIORITIES_HARD_CAP;
  const prioritiesAtRecommended = priorities.length >= PRIORITIES_DEFAULT;

  const addObjective = () => {
    if (objectivesAtCap) return;
    dispatch({ type: 'ADD_OBJECTIVE' });
    log({
      type: 'okr-add',
      target: 'objective',
      targetName: 'New objective',
      summary: 'Marketing objective added',
      rationale: '',
    });
  };

  const updateObjective = (id, changes) => {
    dispatch({ type: 'UPDATE_OBJECTIVE', id, changes });
  };

  const removeObjective = (id, name) => {
    dispatch({ type: 'REMOVE_OBJECTIVE', id });
    log({
      type: 'okr-remove',
      target: id,
      targetName: name,
      summary: 'Marketing objective removed',
      rationale: '',
    });
  };

  const addPriority = () => {
    if (prioritiesAtCap) return;
    dispatch({ type: 'ADD_BUSINESS_PRIORITY' });
    log({
      type: 'priority-add',
      target: 'priority',
      targetName: 'New priority',
      summary: 'Business priority added',
      rationale: '',
    });
  };

  const updatePriority = (id, changes) => {
    dispatch({ type: 'UPDATE_BUSINESS_PRIORITY', id, changes });
  };

  const removePriority = (id, name) => {
    dispatch({ type: 'REMOVE_BUSINESS_PRIORITY', id });
    log({
      type: 'priority-remove',
      target: id,
      targetName: name,
      summary: 'Business priority removed',
      rationale: '',
    });
  };

  return (
    <>
      <InfoPanel storageKey="okrs">
        <strong>Objectives & priorities</strong> is the strategic layer that drives budget
        allocation. Marketing objectives use the Grove OKR framework — qualitative direction with
        2–5 measurable key results. Business priorities reflect which BUs and verticals are funded.
        Weights set here flow directly into how campaigns get budget. Changes are logged and should
        be senior-team decisions, not day-to-day adjustments.
      </InfoPanel>

      {/* OKRs */}
      <div className="row between" style={{ marginBottom: '14px', alignItems: 'baseline' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.01em' }}>
          Marketing objectives
          <span
            className="muted"
            style={{ fontSize: '13px', fontWeight: 400, marginLeft: '12px' }}
          >
            {objectives.length} of {OBJECTIVES_DEFAULT} recommended
            {objectivesAtCap && ' (cap reached)'}
          </span>
        </h2>
        <button
          className="btn primary"
          onClick={addObjective}
          disabled={objectivesAtCap}
          title={
            objectivesAtCap
              ? 'Hard cap of 10 reached'
              : objectivesAtRecommended
                ? 'Above recommended count of 5 — add only if essential'
                : 'Add objective'
          }
        >
          + Add objective
        </button>
      </div>

      {objectivesAtRecommended && !objectivesAtCap && (
        <div className="info-panel" style={{ marginBottom: '14px' }}>
          You've reached the recommended count of {OBJECTIVES_DEFAULT} objectives. Adding more is
          allowed up to {OBJECTIVES_HARD_CAP}, but Grove's discipline favors fewer, sharper
          objectives.
        </div>
      )}

      {objectives.length === 0 ? (
        <div
          className="muted tiny"
          style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--border)' }}
        >
          No objectives yet. Click "Add objective" to begin.
        </div>
      ) : (
        objectives.map((o, i) => (
          <ObjectiveCard
            key={o.id}
            objective={o}
            index={i}
            onUpdate={(changes) => updateObjective(o.id, changes)}
            onRemove={() => removeObjective(o.id, o.name)}
            log={log}
          />
        ))
      )}

      {/* Business priorities */}
      <div
        className="row between"
        style={{ marginTop: '40px', marginBottom: '14px', alignItems: 'baseline' }}
      >
        <h2 style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.01em' }}>
          Business priorities
          <span
            className="muted"
            style={{ fontSize: '13px', fontWeight: 400, marginLeft: '12px' }}
          >
            {priorities.length} of {PRIORITIES_DEFAULT} recommended
            {prioritiesAtCap && ' (cap reached)'}
          </span>
        </h2>
        <button
          className="btn primary"
          onClick={addPriority}
          disabled={prioritiesAtCap}
          title={prioritiesAtCap ? 'Hard cap of 10 reached' : 'Add priority'}
        >
          + Add priority
        </button>
      </div>

      {priorities.length === 0 ? (
        <div
          className="muted tiny"
          style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--border)' }}
        >
          No business priorities yet. Click "Add priority" to begin.
        </div>
      ) : (
        priorities.map((p, i) => (
          <BusinessPriorityCard
            key={p.id}
            priority={p}
            index={i}
            onUpdate={(changes) => updatePriority(p.id, changes)}
            onRemove={() => removePriority(p.id, p.name)}
            log={log}
          />
        ))
      )}
    </>
  );
}
