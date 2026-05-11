import { useEffect, useMemo, useState } from "react";
import { Button } from "./Button.jsx";
import { formatCpfCnpj, formatPhone } from "../utils/formatters.js";

export function QuickForm({ title, fields, submitLabel = "Salvar", onSubmit, editingItem, onCancelEdit }) {
  const initialValues = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.name, editingItem?.[field.name] ?? field.defaultValue ?? ""])),
    [fields, editingItem]
  );
  const [values, setValues] = useState(initialValues);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  function handleChange(fieldName, value) {
    const field = fields.find((item) => item.name === fieldName);
    let nextValue = value;

    if (field?.mask === "cpfCnpj") nextValue = formatCpfCnpj(value);
    if (field?.mask === "phone") nextValue = formatPhone(value);

    setValues((current) => ({ ...current, [fieldName]: nextValue }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    fields.forEach((field) => {
      if (field.required && !String(values[field.name] || "").trim()) {
        nextErrors[field.name] = "Campo obrigatório.";
      }
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSubmit?.({ ...values, id: editingItem?.id });
    setValues(initialValues);
    setSuccess(editingItem ? "Atualizado com sucesso." : "Salvo com sucesso.");
    window.setTimeout(() => setSuccess(""), 2200);
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <h3>{title}</h3>
      <div className="form-grid">
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            {field.type === "select" ? (
              <select
                required={field.required}
                value={values[field.name]}
                onChange={(event) => handleChange(field.name, event.target.value)}
              >
                <option value="">Selecione</option>
                {field.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || "text"}
                placeholder={field.placeholder}
                required={field.required}
                value={values[field.name]}
                onChange={(event) => handleChange(field.name, event.target.value)}
              />
            )}
            {field.help && <small className="field-help">{field.help}</small>}
            {errors[field.name] && <small className="field-error">{errors[field.name]}</small>}
          </label>
        ))}
      </div>
      {success && <p className="form-success">{success}</p>}
      <div className="form-actions">
        <Button type="submit">{editingItem ? "Atualizar" : submitLabel}</Button>
        {editingItem && <Button type="button" variant="soft" onClick={onCancelEdit}>Cancelar edição</Button>}
      </div>
    </form>
  );
}
