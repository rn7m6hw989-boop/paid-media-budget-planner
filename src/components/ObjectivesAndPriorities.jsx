import React from 'react';
import { useData } from '../lib/DataContext.jsx';
import { InfoPanel, SumValidator } from './UI.jsx';
import { ObjectiveCard } from './okrs/ObjectiveCard.jsx';
import { BusinessPriorityCard } from './okrs/BusinessPriorityCard.jsx';

const OBJECTIVES_DEFAULT = 5;
const OBJECTIVES_HARD_CAP = 10;
const PRIORITIES_DEFAULT = 5;
const PRIORITIES_HARD_CAP = 10;

const COLUMN_HEADING_STYLE = {
  fontSize: '20px',
  fontWeight: 500,
  letterSpacing: '-0.01em',
};

const COLUMN_COUNT_STYLE = {
  fontSize: '12px',
  fontWeight: 400,
  marginLeft: '10px',
};

/**
 * ObjectivesAndPriorities — strategic layer page.
 *
 * Two columns: marketing objectives (Grove-style OKRs, with KRs) and
 * business priorities. Both lists have sum validators above them
 * (weights must sum to 100%).
 *
 * Card display logic lives in okrs/ObjectiveCard, okrs/BusinessPriorityCard.
 * KR row logic lives in okrs/KeyResultRow.
 */
export function ObjectivesAndPriorities() {
  const { data, dispatch, log } = useData();

  const objectives = data.objectives || [];
  const priorities = data.businessPriorities || [];

  const objectivesAtCap = objectives.length >= OBJECTIVES_HARD_CAP;
  const objectivesAtRecommended = objectives.length >= OBJECTIVES_DEFAULT;
  const prioritiesAtCap = priorities.length >= PRIORITIES_HARD_CAP;

  /* ---------- Objective handlers ---------- */

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

  /* ---------- Priority handlers ---------- */

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

  /* ---------- Render ---------- */

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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'flex-start',
        }}
      >
        {/* Left: Marketing objectives */}
        <div>
          <div className="row between" style={{ marginBottom: '14px', alignItems: 'baseline' }}>
            <h2 style={COLUMN_HEADING_STYLE}>
              Marketing objectives
              <span className="muted" style={COLUMN_COUNT_STYLE}>
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
              You've reached the recommended count of {OBJECTIVES_DEFAULT}. Adding more is allowed
              up to {OBJECTIVES_HARD_CAP}, but Grove's discipline favors fewer, sharper objectives.
            </div>
          )}

          {objectives.length > 0 && (
            <SumValidator
              total={objectives.reduce((s, o) => s + (Number(o.weight) || 0), 0)}
              label="Strategic weight"
            />
          )}

          {objectives.length === 0 ? (
            <div
              className="muted tiny"
              style={{
                padding: '20px',
                textAlign: 'center',
                border: '1px dashed var(--border)',
              }}
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
        </div>

        {/* Right: Business priorities */}
        <div>
          <div className="row between" style={{ marginBottom: '14px', alignItems: 'baseline' }}>
            <h2 style={COLUMN_HEADING_STYLE}>
              Business priorities
              <span className="muted" style={COLUMN_COUNT_STYLE}>
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
            <div
              className="muted tiny"
              style={{
                padding: '20px',
                textAlign: 'center',
                border: '1px dashed var(--border)',
              }}
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
        </div>
      </div>
    </>
  );
}
