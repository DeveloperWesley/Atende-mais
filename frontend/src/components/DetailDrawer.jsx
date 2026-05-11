import { X } from "lucide-react";

export function DetailDrawer({ item, title, fields, onClose }) {
  if (!item) return null;

  return (
    <div className="drawer-backdrop">
      <aside className="detail-drawer">
        <button className="drawer-close" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
        <h2>{title}</h2>
        <div className="drawer-fields">
          {fields.map((field) => (
            <div key={field.key}>
              <span>{field.label}</span>
              <strong>{item[field.key] || "-"}</strong>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
