import React, { useState, useMemo } from 'react';
import { useData } from '../lib/DataContext.jsx';
import {
  computeAllocations,
  computeBreakdowns,
  formatCurrency,
  formatCurrencyFull,
} from '../lib/calculations.js';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// Chart palette: Science Blue accent leads, then maturity-grayscale gradient
// matching the strategic label progression. Quiet, analytical, no candy.
const CHART_COLORS = [
  '#0251D6', // Science Blue (brand)
  '#1F2937', // dark slate (Defend equivalent)
  '#475569', // mid slate
  '#64748B', // mid-light slate
  '#94A3B8', // light slate (Maintain equivalent)
  '#CBD5E1', // pale slate
  '#E2E8F0', // very light slate (Build equivalent)
  '#F1F5F9', // almost white
];

function ChartTile({ title, children }) {
  return (
    <div className="chart-tile">
      <div className="chart-title">{title}</div>
      {children}
    </div>
  );
}

export function Breakdowns() {
  const { data } = useData();
  const [includeHardCommits, setIncludeHardCommits] = useState(true);

  const allocations = useMemo(() => computeAllocations(data), [data]);
  const breakdowns = useMemo(
    () => computeBreakdowns(data, allocations, includeHardCommits),
    [data, allocations, includeHardCommits]
  );

  const total =
    breakdowns.byRegion.reduce((s, r) => s + r.value, 0) || 1;

  return (
    <div className="section-card" style={{ marginBottom: 0 }}>
      <div className="section-header">
        <div className="section-title">Live breakdowns</div>
      </div>

      <div className="section-body">
        <div className="row gap-sm" style={{ marginBottom: '12px' }}>
          <button
            className={`btn sm ${includeHardCommits ? 'primary' : ''}`}
            onClick={() => setIncludeHardCommits(true)}
          >
            All spend
          </button>
          <button
            className={`btn sm ${!includeHardCommits ? 'primary' : ''}`}
            onClick={() => setIncludeHardCommits(false)}
          >
            Campaigns only
          </button>
        </div>

        <ChartTile title="By region">
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdowns.byRegion}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={36}
                  outerRadius={64}
                  paddingAngle={1}
                >
                  {breakdowns.byRegion.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrencyFull(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="col" style={{ gap: '4px', marginTop: '8px' }}>
            {breakdowns.byRegion.map((r, i) => (
              <div key={r.id} className="row between tiny">
                <div className="row gap-sm">
                  <span
                    className="tag-dot"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span>{r.name}</span>
                </div>
                <span className="mono">
                  {formatCurrency(r.value)} · {((r.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </ChartTile>

        <ChartTile title="By pool">
          {breakdowns.byPool && breakdowns.byPool.some((p) => p.value > 0) ? (
            <div className="col gap-sm">
              {breakdowns.byPool.map((p, i) => {
                const pct = total > 0 ? (p.value / total) * 100 : 0;
                const color = p.id === 'brand' ? '#0251D6' : '#475569';
                return (
                  <div key={p.id}>
                    <div className="row between tiny" style={{ marginBottom: '3px' }}>
                      <span>{p.name}</span>
                      <span className="mono">
                        {formatCurrency(p.value)} · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 3 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="tiny muted">No allocations yet.</div>
          )}
        </ChartTile>

        <ChartTile title="By marketing objective">
          <div className="col gap-sm">
            {breakdowns.byObjective
              .sort((a, b) => b.value - a.value)
              .map((o, i) => {
                const pct = total > 0 ? (o.value / total) * 100 : 0;
                return (
                  <div key={o.id}>
                    <div className="row between tiny" style={{ marginBottom: '3px' }}>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</span>
                      <span className="mono">{formatCurrency(o.value)}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 3 }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: CHART_COLORS[i % CHART_COLORS.length],
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </ChartTile>

        <ChartTile title="By business priority">
          <div className="col gap-sm">
            {breakdowns.byBusinessPriority
              .sort((a, b) => b.value - a.value)
              .map((b, i) => {
                const pct = total > 0 ? (b.value / total) * 100 : 0;
                return (
                  <div key={b.id}>
                    <div className="row between tiny" style={{ marginBottom: '3px' }}>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
                      <span className="mono">{formatCurrency(b.value)}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 3 }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: CHART_COLORS[(i + 2) % CHART_COLORS.length],
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </ChartTile>
      </div>
    </div>
  );
}
