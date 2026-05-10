import React, { useState } from 'react';
import { useData } from '../lib/DataContext.jsx';
import { formatCurrencyFull } from '../lib/calculations.js';
import { HelpIcon, Modal, Tag } from './UI.jsx';
import { DEFINITIONS } from '../lib/definitions.js';

function CommitmentEditModal({ commitment, onClose, onSave, onDelete }) {
  const { data } = useData();
  const [draft, setDraft] = useState({ ...commitment });
  const [rationale, setRationale] = useState('');

  const isNew = !commitment.id;

  return (
    <Modal
      title={isNew ? 'Add hard commitment' : 'Edit hard commitment'}
      onClose={onClose}
      footer={
        <>
          {!isNew && (
            <button className="btn danger" onClick={() => onDelete(rationale)}>
              Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(draft, rationale)}>Save</button>
        </>
      }
    >
      <div className="col gap-md">
        <div>
          <label className="field">Name</label>
          <input
            type="text"
            className="input"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>

        <div>
          <label className="field">Amount</label>
          <input
            type="number"
            className="input numeric"
            value={draft.amount}
            onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
            step={10000}
            min={0}
          />
        </div>

        <div className="row gap-md">
          <div style={{ flex: 1 }}>
            <label className="field">Marketing objective</label>
            <select
              className="select"
              value={draft.objectiveId || ''}
              onChange={(e) => setDraft({ ...draft, objectiveId: e.target.value })}
            >
              {data.objectives.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="field">Business priority</label>
            <select
              className="select"
              value={draft.businessPriorityId || ''}
              onChange={(e) => setDraft({ ...draft, businessPriorityId: e.target.value })}
            >
              {data.businessPriorities.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="field">Region</label>
            <select
              className="select"
              value={draft.regionId || ''}
              onChange={(e) => setDraft({ ...draft, regionId: e.target.value })}
            >
              {data.regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="field">Note (audit reference)</label>
          <input
            type="text"
            className="input"
            value={draft.note || ''}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            placeholder="e.g., Signed contract, executive directive, renewal date"
          />
        </div>

        <div>
          <label className="field">Rationale for this change</label>
          <input
            type="text"
            className="input"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Why are you adding/changing this commitment?"
          />
        </div>
      </div>
    </Modal>
  );
}

export function HardCommitments() {
  const { data, dispatch, log } = useData();
  const [editing, setEditing] = useState(null);

  const total = data.hardCommitments.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  const onAdd = () => setEditing({});

  const onSave = (commitment, rationale) => {
    const isNew = !commitment.id;
    if (isNew) {
      dispatch({ type: 'ADD_HARD_COMMITMENT', changes: commitment });
      log({
        type: 'commit-add',
        target: 'commitment',
        targetName: commitment.name,
        summary: `Added: ${formatCurrencyFull(commitment.amount)}`,
        rationale,
      });
    } else {
      const old = data.hardCommitments.find((c) => c.id === commitment.id);
      dispatch({ type: 'UPDATE_HARD_COMMITMENT', id: commitment.id, changes: commitment });
      log({
        type: 'commit-edit',
        target: commitment.id,
        targetName: commitment.name,
        summary: `Updated: ${formatCurrencyFull(old.amount)} → ${formatCurrencyFull(commitment.amount)}`,
        rationale,
      });
    }
    setEditing(null);
  };

  const onDelete = (rationale) => {
    const c = editing;
    dispatch({ type: 'REMOVE_HARD_COMMITMENT', id: c.id });
    log({
      type: 'commit-delete',
      target: c.id,
      targetName: c.name,
      summary: `Deleted: ${formatCurrencyFull(c.amount)}`,
      rationale,
    });
    setEditing(null);
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <div className="row gap-sm" style={{ alignItems: 'baseline' }}>
            <span className="section-title">Hard commitments</span>
            <HelpIcon definition={DEFINITIONS.hardCommitments.short} />
            <span className="section-subtitle">
              {formatCurrencyFull(total)} across {data.hardCommitments.length} item{data.hardCommitments.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <button className="btn sm" onClick={onAdd}>+ Add commitment</button>
      </div>

      <div className="section-body">
        {data.hardCommitments.length === 0 ? (
          <div className="muted tiny">No hard commitments yet.</div>
        ) : (
          data.hardCommitments.map((c) => {
            const obj = data.objectives.find((o) => o.id === c.objectiveId);
            const bp = data.businessPriorities.find((b) => b.id === c.businessPriorityId);
            const reg = data.regions.find((r) => r.id === c.regionId);
            return (
              <div key={c.id} className="commitment-row">
                <div>
                  <div className="cm-name">{c.name}</div>
                  <div className="cm-meta">
                    {[obj?.name, bp?.name, reg?.name].filter(Boolean).join(' · ')}
                    {c.note ? ` — ${c.note}` : ''}
                  </div>
                </div>
                <div className="cm-amount">{formatCurrencyFull(c.amount)}</div>
                <button className="btn icon-only ghost" onClick={() => setEditing(c)} aria-label="Edit">✎</button>
                <Tag>🔒 Locked</Tag>
              </div>
            );
          })
        )}
      </div>

      {editing && (
        <CommitmentEditModal
          commitment={editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
