"use client";

export function Sheet({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="dismiss" aria-label="ปิด" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-grip" />
        <div className="sheet-title">{title}</div>
        {description ? <div className="sheet-desc">{description}</div> : null}
        {children}
      </div>
    </div>
  );
}

export function SheetActions({
  onCancel,
  onConfirm,
  confirmLabel,
  confirmDisabled,
  cancelLabel = "ยกเลิก",
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmDisabled?: boolean;
  cancelLabel?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
      <button type="button" className="btn btn-outline" style={{ flex: 1, fontSize: 12.5 }} onClick={onCancel}>
        {cancelLabel}
      </button>
      <button
        type="button"
        className="btn btn-primary"
        style={{ flex: 1.3, fontSize: 12.5 }}
        disabled={confirmDisabled}
        onClick={onConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
