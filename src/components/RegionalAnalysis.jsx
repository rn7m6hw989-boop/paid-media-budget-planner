import React from 'react';
import { InfoPanel } from './UI.jsx';
import { ScoringGuideExpandable } from './regional/ScoringGuideExpandable.jsx';
import { LabelLogicExpandable } from './regional/LabelLogicExpandable.jsx';
import { FactorImportanceRow, ScoringMatrix } from './regional/ScoringMatrix.jsx';
import { AllocatorPreview } from './regional/AllocatorPreview.jsx';

const SECTION_HEADING_STYLE = {
  fontSize: '20px',
  fontWeight: 500,
  marginBottom: '12px',
  letterSpacing: '-0.01em',
  color: 'var(--ink)',
};

/**
 * RegionalAnalysis — the page itself. Composes the rubric editors,
 * scoring tables, label explainers, and allocator preview.
 */
export function RegionalAnalysis() {
  return (
    <>
      <InfoPanel storageKey="regional-v2">
        <strong>Regional analysis</strong> evaluates each region across two rubrics:{' '}
        <em>commercial</em> (TAM, end-market mix fit, revenue contribution, whitespace, competitive
        intensity) and <em>brand</em> (brand preference, trust, owned-channel engagement). Each
        region also receives a strategic label — Defend, Grow, Build, or Maintain — derived from
        its commercial scores. The commercial weight flows into Budget Allocation.{' '}
        <span className="muted">
          Note: in v1, only the commercial weight is used in allocator math. The brand rubric is
          captured for future use.
        </span>
      </InfoPanel>

      <ScoringGuideExpandable />
      <LabelLogicExpandable />

      <h3 style={SECTION_HEADING_STYLE}>Commercial rubric</h3>
      <FactorImportanceRow rubricKey="commercial" rubricLabel="Commercial" />
      <ScoringMatrix
        rubricKey="commercial"
        rubricLabel="Commercial"
        weightKey="commercial"
        showLabel
        editable
      />

      <h3 style={{ ...SECTION_HEADING_STYLE, marginTop: '32px' }}>Brand rubric</h3>
      <FactorImportanceRow rubricKey="brand" rubricLabel="Brand" />
      <ScoringMatrix rubricKey="brand" rubricLabel="Brand" weightKey="brand" />

      <h3 style={{ ...SECTION_HEADING_STYLE, marginTop: '32px' }}>Output preview</h3>
      <AllocatorPreview />
    </>
  );
}
