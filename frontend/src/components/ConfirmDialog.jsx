import { Button } from "./Button.jsx";

export function ConfirmDialog({ item, title = "Confirmar exclusão", message, onCancel, onConfirm }) {
  if (!item) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="confirm-modal">
        <h2>{title}</h2>
        <p>{message || "Essa ação não poderá ser desfeita."}</p>
        <div className="form-actions">
          <Button variant="soft" onClick={onCancel}>Cancelar</Button>
          <Button variant="dark" onClick={() => onConfirm(item)}>Excluir</Button>
        </div>
      </div>
    </div>
  );
}

