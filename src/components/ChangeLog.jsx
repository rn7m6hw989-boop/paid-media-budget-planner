import React, { useState, useMemo } from 'react';
import { useData } from '../lib/DataContext.jsx';
import { Tag, InfoPanel } from './UI.jsx';

const TYPE_LABELS = {
  'campaign-add': { label: 'Campaign added', variant: 'accent' },
  'campaign-edit': { label: 'Campaign edited', variant: 'info' },
  'campaign-delete': { label: 'Campaign cancelled', variant: 'danger' },
  'commit-add': { label: 'Hard commitment added', variant: 'default' },
  'commit-edit': { label: 'Hard commitment edited', variant: 'default' },
  'commit-delete': { label: 'Hard commitment removed', variant: 'danger' },
  adjust: { label: 'Manual adjustment', variant: 'default' },
  'adjust-clear': { label: 'Adjustment cleared', variant: 'default' },
  lock: { label: 'Locked', variant: 'default' },
  unlock: { label: 'Unlocked', variant: 'default' },
  rebalance: { label: 'Rebalance', variant: 'accent' },
  weight: { label: 'Weight changed', variant: 'info' },
  'region-score': { label: 'Region score changed', variant: 'info' },
  rubric: { label: 'Rubric weight changed', variant: 'info' },
  pool: { label: 'Pool change', variant: 'info' },
};

function formatDay(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';

  const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const FILTER_GROUPS = {
  all: () => true,
  campaigns: (e) => ['campaign-add', 'campaign-edit', 'campaign-delete', 'adjust', 'adjust-clear', 'lock', 'unlock', 'rebalance'].includes(e.type),
  commitments: (e) => ['commit-add', 'commit-edit', 'commit-delete'].includes(e.type),
  weights: (e) => ['weight', 'region-score', 'rubric'].includes(e.type),
  pool: (e) => e.type === 'pool',
};

export function ChangeLog() {
  const { data } = useData();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return data.changeLog.filter(FILTER_GROUPS[filter]);
  }, [data.changeLog, filter]);

  // Group by day
  const groups = useMemo(() => {
    const byDay = new Map();
    for (const e of filtered) {
      const day = formatDay(e.timestamp);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(e);
    }
    return Array.from(byDay.entries());
  }, [filtered]);

  const exportLog = () => {
    const text = data.changeLog
      .map(
        (e) =>
          `[${new Date(e.timestamp).toISOString()}] ${e.actor} — ${
            TYPE_LABELS[e.type]?.label || e.type
          }: ${e.targetName}\n  ${e.summary}\n  Rationale: ${e.rationale || '(none)'}\n`
      )
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `change-log-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <InfoPanel storageKey="changelog">
        <strong>The change log</strong> is an append-only record of every meaningful change to the budget plan.
        All dollar changes, weight changes, locks, adjustments, and pool changes are logged with timestamp,
        actor, and rationale. Cannot be edited or deleted. Export for audit purposes.
      </InfoPanel>

      <div className="section-card">
        <div className="section-header">
          <div className="row gap-sm wrap">
            {Object.keys(FILTER_GROUPS).map((key) => (
              <button
                key={key}
                className={`btn sm ${filter === key ? 'primary' : ''}`}
                onClick={() => setFilter(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn sm" onClick={exportLog}>↓ Export log</button>
        </div>

        <div className="section-body">
          {filtered.length === 0 ? (
            <div className="muted tiny">No events match this filter.</div>
          ) : (
            groups.map(([day, events]) => (
              <div key={day}>
                <div className="log-day-header">{day}</div>
                {events.map((e) => {
                  const meta = TYPE_LABELS[e.type] || { label: e.type, variant: 'default' };
                  return (
                    <div key={e.id} className="log-event">
                      <div>
                        <div className="log-time">{formatTime(e.timestamp)}</div>
                        <div className="log-actor">{e.actor}</div>
                      </div>
                      <div>
                        <div className="row gap-sm" style={{ marginBottom: '4px', flexWrap: 'wrap' }}>
                          <Tag variant={meta.variant}>{meta.label}</Tag>
                          <span style={{ fontWeight: 500 }}>{e.targetName}</span>
                        </div>
                        <div className="tiny muted">{e.summary}</div>
                        {e.rationale && (
                          <div className="log-rationale">"{e.rationale}"</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
