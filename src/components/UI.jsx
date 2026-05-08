import React, { useState } from 'react';

export function HelpIcon({ definition }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="help-icon"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      role="button"
      aria-label="Help"
    >
      ?
      {show && (
        <span className="tooltip" style={{ display: 'block' }}>
          {definition}
        </span>
      )}
    </span>
  );
}

export function InfoPanel({ children, storageKey }) {
  const [dismissed, setDismissed] = useState(() => {
    if (storageKey) {
      try {
        return localStorage.getItem(`info-dismissed-${storageKey}`) === '1';
      } catch {
        return false;
      }
    }
    return false;
  });

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    if (storageKey) {
      try {
        localStorage.setItem(`info-dismissed-${storageKey}`, '1');
      } catch {}
    }
  };

  return (
    <div className="info-panel">
      {children}
      <button className="dismiss" onClick={dismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

export function Modal({ title, children, onClose, footer }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Tag({ children, variant = 'default' }) {
  const cls = variant === 'default' ? 'tag' : `tag ${variant}`;
  return <span className={cls}>{children}</span>;
}
