import React, { useState, useRef, useEffect } from 'react';

/* ============================================================
   HelpIcon — small ? icon with hover tooltip
   ============================================================ */
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

/* ============================================================
   InfoPanel — dismissable explainer at the top of a tab
   ============================================================ */
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

/* ============================================================
   Modal — backdrop + body + footer
   ============================================================ */
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

/* ============================================================
   Tag — colored pill for status, labels, etc.
   ============================================================ */
export function Tag({ children, variant = 'default' }) {
  const cls = variant === 'default' ? 'tag' : `tag ${variant}`;
  return <span className={cls}>{children}</span>;
}

/* ============================================================
   ConfirmDeleteModal — generic destructive-action modal.
   Optional `blockedReason` makes it a "cannot delete" modal
   instead of an "are you sure" one.
   ============================================================ */
export function ConfirmDeleteModal({
  title = 'Are you sure?',
  blockedTitle = 'Cannot remove',
  blockedReason = null,
  message,
  confirmLabel = 'Remove',
  onClose,
  onConfirm,
}) {
  const blocked = !!blockedReason;
  return (
    <Modal
      title={blocked ? blockedTitle : title}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>
            {blocked ? 'Got it' : 'Cancel'}
          </button>
          {!blocked && (
            <button
              className="btn accent"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmLabel}
            </button>
          )}
        </>
      }
    >
      <p style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: 1.6 }}>
        {blocked ? blockedReason : message}
      </p>
    </Modal>
  );
}

/* ============================================================
   SumValidator — green/red banner that shows whether a set of
   percentage weights sums to 100. Used above objective and
   priority lists.
   ============================================================ */
export function SumValidator({ total, label = 'Total' }) {
  const ok = total === 100;
  const off = total - 100;
  return (
    <div
      className={`sum-validator ${ok ? 'ok' : 'off'}`}
      style={{
        background: ok ? 'var(--success-soft)' : 'var(--accent-soft)',
        border: `1px solid ${ok ? 'transparent' : 'var(--accent)'}`,
        borderLeft: `3px solid ${ok ? 'var(--success)' : 'var(--accent)'}`,
        padding: '8px 12px',
        marginBottom: '12px',
        fontSize: 'var(--text-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <span style={{ color: ok ? 'var(--success-ink)' : 'var(--accent-ink)' }}>
        {ok ? (
          <>{label}: <strong>100%</strong> — sums correctly.</>
        ) : (
          <>{label} sums to <strong>{total}%</strong>. {off > 0 ? `${off}% over` : `${Math.abs(off)}% under`}.</>
        )}
      </span>
    </div>
  );
}

/* ============================================================
   EditableInput — inline editable text bound directly to its
   value. No local state, no save buffer; every keystroke
   dispatches via onChange. Hover and focus affordances make
   the editability obvious.
   ============================================================ */
export function EditableInput({
  value,
  onChange,
  placeholder,
  className = '',
  style = {},
  multiline = false,
  ...props
}) {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (multiline && ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value, multiline]);

  const Tag = multiline ? 'textarea' : 'input';
  return (
    <Tag
      ref={ref}
      className={`editable-text ${className} ${focused ? 'focused' : ''}`}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      style={style}
      rows={multiline ? 1 : undefined}
      {...props}
    />
  );
}

/* ============================================================
   CollapsibleCard — base for objective/priority cards.
   Header is always visible (clickable to expand/collapse);
   body renders only when expanded.
   ============================================================ */
export function CollapsibleCard({
  expanded,
  onToggleExpand,
  header,
  children,
  className = '',
}) {
  return (
    <div className={`okr-card ${expanded ? 'expanded' : ''} ${className}`}>
      <div
        className="okr-summary"
        onClick={onToggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
          }
        }}
      >
        {header}
      </div>
      {expanded && <div className="okr-body">{children}</div>}
    </div>
  );
}

/* ============================================================
   EmptyState — placeholder for empty lists/tables.
   ============================================================ */
export function EmptyState({ children, dashed = true }) {
  return (
    <div
      className="muted tiny"
      style={{
        padding: '20px',
        textAlign: 'center',
        border: dashed ? '1px dashed var(--border)' : '1px solid var(--border)',
        background: 'white',
      }}
    >
      {children}
    </div>
  );
}
