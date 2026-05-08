import React, { useState, useMemo } from 'react';
import { useData } from '../lib/DataContext.jsx';
import {
  computeRegionalWeights,
  computeAllocations,
  computeBreakdowns,
  formatCurrency,
  formatCurrencyFull,
} from '../lib/calculations.js';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const CHART_COLORS = [
  '#2D5F4A', // accent green
  '#8B5A1F', // warm amber
  '#2D5380', // muted blue
  '#6B4226', // brown
  '#7A4D6E', // mauve
  '#3F5A4A', // dark sage
  '#A06545', // terracotta
  '#5D6B73', // slate
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

  const regionalWeights = useMemo(
    () => computeRegionalWeights(data.regions, data.rubrics),
    [data.regions, data.rubrics]
  );
  const allocations = useMemo(
    () => computeAllocations(data, regionalWeights),
    [data, regionalWeights]
  );
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
