import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../lib/DataContext.jsx';
import { HelpIcon, InfoPanel, Modal } from './UI.jsx';
import { DEFINITIONS } from '../lib/definitions.js';

const OBJECTIVES_DEFAULT = 5;
const OBJECTIVES_HARD_CAP = 10;
const PRIORITIES_DEFAULT = 5;
const PRIORITIES_HARD_CAP = 10;
const KR_HARD_CAP = 5; // Grove discipline

/* ============================================================
   SumValidator — visible sum-check banner. Shown when items exist.
   Green when sum=100, red otherwise.
   ============================================================ */
function SumValidator({ total, label = 'Total' }) {
  const ok = total === 100;
  const off = total - 100;
  return (
    <div
      style={{
        background: ok ? 'var(--success-soft)' : 'var(--accent-soft)',
        border: `1px solid ${ok ? 'transparent' : 'var(--accent)'}`,
        borderLeft: `3px solid ${ok ? 'var(--success)' : 'var(--accent)'}`,
        padding: '8px 12px',
        marginBottom: '12px',
        fontSize: 'var(--text-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <span style={{ color: ok ? 'var(--success-ink)' : 'var(--accent-ink)' }}>
        {ok ? (
          <>{label}: <strong>100%</strong> — sums correctly.</>
        ) : (
          <>{label} sums to <strong>{total}%</strong>. {off > 0 ? `${off}% over` : `${Math.abs(off)}% under`}.</>
        )}
      </span>
    </div>
  );
}

/* ============================================================
   Inline editable text — directly bound to props/dispatch.
   No local state, no save buffer. Every keystroke saves.
   ============================================================ */
function EditableInput({ value, onChange, placeholder, className = '', style = {}, multiline = false, ...props }) {
  if (multiline) {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`editable-text ${className}`}
        style={{ resize: 'vertical', minHeight: '50px', width: '100%', ...style }}
        rows={2}
        {...props}
      />
    );
  }
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`editable-text ${className}`}
      style={{ width: '100%', ...style }}
      {...props}
    />
  );
}

/* ============================================================
   Key Result row — directly bound, no local state
   ============================================================ */
function KeyResultRow({ kr, onUpdate, onRemove }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        background: 'white',
        padding: '12px',
        marginBottom: '8px',
      }}
    >
      <div className="row between" style={{ alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <label className="field">Description</label>
          <EditableInput
            value={kr.description}
            onChange={(v) => onUpdate({ description: v })}
            placeholder="e.g., Generate $400M in qualified pipeline"
          />
        </div>
        <button
          className="btn icon-only ghost"
          onClick={onRemove}
          title="Remove key result"
          aria-label="Remove key result"
          style={{ marginLeft: '8px', marginTop: '20px' }}
        >
          ×
        </button>
      </div>

      <div className="row gap-md" style={{ alignItems: 'flex-end', marginBottom: '8px', flexWrap: 'wrap' }}>
        <div style={{ flexShrink: 0 }}>
          <label className="field">Type</label>
          <div className="row gap-sm">
            <button
              type="button"
              className={`btn sm ${kr.type === 'milestone' ? 'primary' : ''}`}
              onClick={() => onUpdate({ type: 'milestone', target: null, unit: '' })}
            >
              Milestone
            </button>
            <button
              type="button"
              className={`btn sm ${kr.type === 'measurable' ? 'primary' : ''}`}
              onClick={() => onUpdate({ type: 'measurable' })}
            >
              Measurable
            </button>
          </div>
        </div>

        {kr.type === 'measurable' && (
          <>
            <div style={{ width: '100px' }}>
              <label className="field">Target</label>
              <input
                type="number"
                className="input numeric"
                value={kr.target ?? ''}
                onChange={(e) =>
                  onUpdate({ target: e.target.value === '' ? null : Number(e.target.value) })
                }
                step={1}
              />
            </div>
            <div style={{ width: '100px' }}>
              <label className="field">Unit</label>
              <input
                type="text"
                className="input"
                value={kr.unit || ''}
                onChange={(e) => onUpdate({ unit: e.target.value })}
                placeholder="$, %, count"
              />
            </div>
          </>
        )}
      </div>

      <div>
        <label className="field">Notes (optional)</label>
        <EditableInput
          value={kr.notes}
          onChange={(v) => onUpdate({ notes: v })}
          placeholder="Owner, baseline, caveats"
        />
      </div>
    </div>
  );
}

/* ============================================================
   Objective card — collapsible, with hover-visible affordances
   ============================================================ */
function ObjectiveCard({ objective, index, onUpdate, onRemove, log }) {
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
        <div className="okr-name">{objective.name || <span style={{ color: 'var(--ink-4)', fontStyle: 'italic' }}>Untitled objective</span>}</div>
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

            <div className="row" style={{ justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
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
            This will permanently delete <strong>{objective.name || 'this objective'}</strong> and all of its key
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
   Business priority card — collapsible, matching ObjectiveCard pattern
   ============================================================ */
function BusinessPriorityCard({ priority, index, onUpdate, onRemove, log }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateWeight = (weight) => {
    const old = priority.weight;
    onUpdate({ weight });
    if (old !== weight) {
      log({
        type: 'weight',
        target: priority.id,
        targetName: `Business priority: ${priority.name}`,
        summary: `Weight: ${Number(old) || 0}% → ${Number(weight) || 0}%`,
        rationale: '',
      });
    }
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
          {priority.name || (
            <span style={{ color: 'var(--ink-4)', fontStyle: 'italic' }}>Untitled priority</span>
          )}
        </div>
        <div></div>
        <div className="row gap-sm">
          <span className="okr-weight-pill">{Number(priority.weight) || 0}%</span>
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
                Priority name
                <span className="editable-hint">click to edit</span>
              </label>
              <EditableInput
                value={priority.name}
                onChange={(v) => onUpdate({ name: v })}
                placeholder="Priority name"
                style={{ fontWeight: 500 }}
              />
            </div>

            <div className="editable-row">
              <label className="field">
                Description
                <span className="editable-hint">click to edit</span>
              </label>
              <EditableInput
                value={priority.description}
                onChange={(v) => onUpdate({ description: v })}
                placeholder="1–2 sentences describing this priority and why it exists"
                multiline
              />
            </div>

            <div>
              <div className="row between" style={{ marginBottom: '6px' }}>
                <label className="field" style={{ marginBottom: 0 }}>Strategic weight (%)</label>
                <span className="okr-weight-pill">{Number(priority.weight) || 0}%</span>
              </div>
              <input
                type="number"
                className="input numeric"
                min={0}
                max={100}
                step={1}
                value={priority.weight}
                onChange={(e) => updateWeight(Number(e.target.value) || 0)}
                style={{ maxWidth: '120px' }}
              />
            </div>

            <div className="row" style={{ justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <button className="btn sm danger" onClick={() => setConfirmDelete(true)}>
                Remove priority
              </button>
            </div>
          </div>
        </div>
      )}

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
            This will delete <strong>{priority.name || 'this priority'}</strong>. Campaigns tagged to it will need to be
            retagged.
          </p>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   Main component — two-column layout
   ============================================================ */
export function ObjectivesAndPriorities() {
  const { data, dispatch, log } = useData();

  const objectives = data.objectives || [];
  const priorities = data.businessPriorities || [];

  const objectivesAtCap = objectives.length >= OBJECTIVES_HARD_CAP;
  const objectivesAtRecommended = objectives.length >= OBJECTIVES_DEFAULT;
  const prioritiesAtCap = priorities.length >= PRIORITIES_HARD_CAP;

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
        be senior-team decisions, not day-to-day adjustments. Click any objective to expand its
        details. Edits save automatically as you type.
      </InfoPanel>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left column: Marketing objectives */}
        <div>
          <div className="row between" style={{ marginBottom: '14px', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.01em' }}>
              Marketing objectives
              <span className="muted" style={{ fontSize: '12px', fontWeight: 400, marginLeft: '10px' }}>
                {objectives.length} of {OBJECTIVES_DEFAULT} recommended
                {objectivesAtCap && ' (cap reached)'}
              </span>
            </h2>
            <button
              className="btn primary sm"
              onClick={addObjective}
              disabled={objectivesAtCap}
              title={objectivesAtCap ? 'Hard cap of 10 reached' : 'Add objective'}
            >
              + Add objective
            </button>
          </div>

          {objectivesAtRecommended && !objectivesAtCap && (
            <div className="info-panel" style={{ marginBottom: '14px', fontSize: '12px' }}>
              You've reached the recommended count of {OBJECTIVES_DEFAULT}. Adding more is allowed up
              to {OBJECTIVES_HARD_CAP}, but Grove's discipline favors fewer, sharper objectives.
            </div>
          )}

          {objectives.length > 0 && (
            <SumValidator
              total={objectives.reduce((s, o) => s + (Number(o.weight) || 0), 0)}
              label="Strategic weight"
            />
          )}

          {objectives.length === 0 ? (
            <div className="muted tiny" style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)' }}>
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
        </div>

        {/* Right column: Business priorities */}
        <div>
          <div className="row between" style={{ marginBottom: '14px', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.01em' }}>
              Business priorities
              <span className="muted" style={{ fontSize: '12px', fontWeight: 400, marginLeft: '10px' }}>
                {priorities.length} of {PRIORITIES_DEFAULT} rec.
                {prioritiesAtCap && ' (cap)'}
              </span>
            </h2>
            <button
              className="btn primary sm"
              onClick={addPriority}
              disabled={prioritiesAtCap}
              title={prioritiesAtCap ? 'Hard cap of 10 reached' : 'Add priority'}
            >
              + Add priority
            </button>
          </div>

          {priorities.length > 0 && (
            <SumValidator
              total={priorities.reduce((s, p) => s + (Number(p.weight) || 0), 0)}
              label="Strategic weight"
            />
          )}

          {priorities.length === 0 ? (
            <div className="muted tiny" style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)' }}>
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
        </div>
      </div>
    </>
  );
}
