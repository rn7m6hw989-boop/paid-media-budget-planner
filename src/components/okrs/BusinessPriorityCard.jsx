import React, { useState } from 'react';
import { Modal, EditableInput } from '../UI.jsx';

/**
 * BusinessPriorityCard — a business priority with collapsible details.
 *
 * Mirrors ObjectiveCard's pattern but simpler — priorities are name +
 * description + weight; no key results.
 */
export function BusinessPriorityCard({ priority, index, onUpdate, onRemove, log }) {
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
                <label className="field" style={{ marginBottom: 0 }}>
                  Strategic weight (%)
                </label>
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

            <div
              className="row"
              style={{
                justifyContent: 'flex-end',
                borderTop: '1px solid var(--border)',
                paddingTop: '12px',
              }}
            >
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
            This will delete <strong>{priority.name || 'this priority'}</strong>. Campaigns tagged
            to it will need to be retagged.
          </p>
        </Modal>
      )}
    </div>
  );
}
