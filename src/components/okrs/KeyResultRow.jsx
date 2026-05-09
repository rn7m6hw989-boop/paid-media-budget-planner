import React from 'react';
import { EditableInput } from '../UI.jsx';

/**
 * KeyResultRow — single key result inside an objective.
 *
 * Bound directly to props/dispatch; every keystroke saves. Toggling the
 * type between Milestone and Measurable adjusts which fields appear:
 * milestones have no target/unit, measurables do.
 */
export function KeyResultRow({ kr, onUpdate, onRemove }) {
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

      <div
        className="row gap-md"
        style={{ alignItems: 'flex-end', marginBottom: '8px', flexWrap: 'wrap' }}
      >
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
