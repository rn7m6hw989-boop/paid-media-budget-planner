import React, { useState } from 'react';
import { useData } from '../../lib/DataContext.jsx';
import { Modal } from '../UI.jsx';

/**
 * CampaignEditModal — create or edit a campaign.
 *
 * Pool tag is a required field (brand or demand) — the campaign can
 * only draw from that pool within its region's envelope. If objectives,
 * priorities, or regions haven't been defined yet, a warning panel
 * surfaces at the top and the relevant dropdowns will be empty.
 *
 * On save: parent component dispatches ADD_CAMPAIGN or UPDATE_CAMPAIGN
 * and logs a change. Cancel-campaign deletes the existing campaign.
 */
export function CampaignEditModal({ campaign, onClose, onSave, onDelete }) {
  const { data } = useData();
  const [draft, setDraft] = useState({ pool: 'demand', ...campaign });
  const [rationale, setRationale] = useState('');
  const isNew = !campaign.id;

  const objectivesEmpty = data.objectives.length === 0;
  const prioritiesEmpty = data.businessPriorities.length === 0;
  const regionsEmpty = data.regions.length === 0;
  const anyEmpty = objectivesEmpty || prioritiesEmpty || regionsEmpty;

  return (
    <Modal
      title={isNew ? 'Add campaign' : 'Edit campaign'}
      onClose={onClose}
      footer={
        <>
          {!isNew && (
            <button className="btn danger" onClick={() => onDelete(rationale)}>
              Cancel campaign
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(draft, rationale)}>Save</button>
        </>
      }
    >
      <div className="col gap-md">
        {anyEmpty && (
          <div
            className="info-panel"
            style={{
              margin: 0,
              borderLeftColor: 'var(--accent)',
              background: 'var(--accent-soft)',
            }}
          >
            <strong>Heads up.</strong>{' '}
            {[
              objectivesEmpty && 'objectives',
              prioritiesEmpty && 'business priorities',
              regionsEmpty && 'regions',
            ]
              .filter(Boolean)
              .join(' / ')}{' '}
            haven't been defined yet. Add them in the Objectives &amp; Priorities and Regional
            Analysis tabs before saving this campaign — the dropdowns below will be empty until you
            do.
          </div>
        )}

        <div>
          <label className="field">Campaign name</label>
          <input
            type="text"
            className="input"
            value={draft.name || ''}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="e.g., Always-on demand-gen — US"
          />
        </div>

        <div className="row gap-md">
          <div style={{ flex: 1 }}>
            <label className="field">Pool</label>
            <select
              className="select"
              value={draft.pool || 'demand'}
              onChange={(e) => setDraft({ ...draft, pool: e.target.value })}
            >
              <option value="brand">Brand</option>
              <option value="demand">Demand</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="field">Region</label>
            <select
              className="select"
              value={draft.regionId || ''}
              onChange={(e) => setDraft({ ...draft, regionId: e.target.value })}
            >
              <option value="" disabled>Select region…</option>
              {data.regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row gap-md">
          <div style={{ flex: 1 }}>
            <label className="field">Objective</label>
            <select
              className="select"
              value={draft.objectiveId || ''}
              onChange={(e) => setDraft({ ...draft, objectiveId: e.target.value })}
            >
              <option value="" disabled>Select objective…</option>
              {data.objectives.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
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
              <option value="" disabled>Select priority…</option>
              {data.businessPriorities.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="field">Rationale for this change</label>
          <input
            type="text"
            className="input"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder={isNew ? 'Why is this campaign being added?' : 'Why is this changing?'}
          />
        </div>

        {isNew && !anyEmpty && (
          <div className="info-panel" style={{ margin: 0 }}>
            New campaigns enter their tagged pool and trigger rebalancing within that bucket (region
            × pool). Other campaigns in the same bucket will absorb the change proportionally.
          </div>
        )}
      </div>
    </Modal>
  );
}
