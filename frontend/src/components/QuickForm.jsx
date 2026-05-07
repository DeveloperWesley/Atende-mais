import { useState } from "react";
import { Button } from "./Button.jsx";

export function QuickForm({ title, fields, submitLabel = "Salvar", onSubmit }) {
  const initialValues = Object.fromEntries(fields.map((field) => [field.name, field.defaultValue || ""]));
  const [values, setValues] = useState(initialValues);
  const [success, setSuccess] = useState("");

  function handleChange(fieldName, value) {
    setValues((current) => ({ ...current, [fieldName]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.(values);
    setValues(initialValues);
    setSuccess("Salvo com sucesso.");
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
          </label>
        ))}
      </div>
      {success && <p className="form-success">{success}</p>}
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
