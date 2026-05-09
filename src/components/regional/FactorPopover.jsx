import React, { useState } from 'react';

/**
 * FactorPopover — rich popover showing scoring anchors on hover.
 *
 * Wraps any element. On hover/focus, shows a popover with the
 * factor's name, description, all 5 anchor definitions, and an
 * optional calibration note. Used in both the factor importance
 * row and the scoring matrix table headers in Regional Analysis.
 *
 * If `children` is omitted, renders the factor name as the trigger.
 */
export function FactorPopover({ factor, children }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="factor-trigger"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {children || factor.name}
      {show && (
        <span className="anchor-popover" role="tooltip">
          <div className="anchor-popover-title">{factor.name}</div>
          <div className="anchor-popover-desc">{factor.description}</div>
          {factor.anchors && factor.anchors.length > 0
            ? [...factor.anchors]
                .sort((a, b) => b.score - a.score)
                .map((a) => (
                  <div key={a.score} className="anchor-row">
                    <span className="anchor-score">{a.score}</span>
                    <span className="anchor-def">{a.definition}</span>
                  </div>
                ))
            : null}
          {factor.note ? (
            <div className="anchor-popover-note">{factor.note}</div>
          ) : null}
        </span>
      )}
    </span>
  );
}
