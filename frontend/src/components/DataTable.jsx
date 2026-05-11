import { Edit3, Eye, Trash2 } from "lucide-react";

export function DataTable({ columns, rows, onEdit, onDelete, onView }) {
  return (
    <div className="records-list">
      {rows.length === 0 ? (
        <div className="empty-list">
          <strong>Nenhum registro cadastrado ainda.</strong>
          <span>Use o formulário acima para adicionar o primeiro item.</span>
        </div>
      ) : rows.map((row) => (
        <article className="record-card" key={row.id}>
          <div className="record-main">
            {columns.map((column) => (
              <div className={column.primary ? "record-field record-primary" : "record-field"} key={column.key}>
                <span>{column.label}</span>
                <strong>{row[column.key] || "-"}</strong>
              </div>
            ))}
          </div>
          {(onView || onEdit || onDelete) && (
            <div className="record-actions">
              {onView && <button title="Visualizar" onClick={() => onView(row)}><Eye size={16} /></button>}
              {onEdit && <button title="Editar" onClick={() => onEdit(row)}><Edit3 size={16} /></button>}
              {onDelete && <button title="Excluir" onClick={() => onDelete(row)}><Trash2 size={16} /></button>}
            </div>
          )}
        </article>
      ))}
      <div className="table-wrap compact-table">
        <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {(onView || onEdit || onDelete) && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>{row[column.key]}</td>
              ))}
              {(onView || onEdit || onDelete) && (
                <td>
                  <div className="table-actions">
                    {onView && <button title="Visualizar" onClick={() => onView(row)}><Eye size={15} /></button>}
                    {onEdit && <button title="Editar" onClick={() => onEdit(row)}><Edit3 size={15} /></button>}
                    {onDelete && <button title="Excluir" onClick={() => onDelete(row)}><Trash2 size={15} /></button>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
