import { useEffect, useMemo, useState } from "react";
import { Button } from "./Button.jsx";
import { formatCpfCnpj, formatPhone, onlyDigits } from "../utils/formatters.js";

export function QuickForm({ title, fields, submitLabel = "Salvar", onSubmit, editingItem, onCancelEdit }) {
  const dataFields = useMemo(() => fields.filter((field) => field.name), [fields]);
  const initialValues = useMemo(
    () => Object.fromEntries(dataFields.map((field) => [field.name, editingItem?.[field.name] ?? field.defaultValue ?? (field.type === "checkbox" ? false : "")])),
    [dataFields, editingItem]
  );
  const [values, setValues] = useState(initialValues);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  function isFieldHidden(field) {
    return typeof field.hiddenWhen === "function" ? field.hiddenWhen(values) : field.hiddenWhen;
  }

  function isFieldDisabled(field) {
    return typeof field.disabledWhen === "function" ? field.disabledWhen(values) : field.disabled;
  }

  function isFieldRequired(field) {
    return typeof field.required === "function" ? field.required(values) : field.required;
  }

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

    dataFields.filter((field) => !isFieldHidden(field)).forEach((field) => {
      const value = values[field.name];

      if (isFieldRequired(field) && !String(value || "").trim()) {
        nextErrors[field.name] = "Campo obrigatório.";
      }

      if (field.digits && value) {
        const digitCount = onlyDigits(value).length;
        const allowed = Array.isArray(field.digits) ? field.digits : [field.digits];
        if (!allowed.includes(digitCount)) {
          nextErrors[field.name] = `Informe ${allowed.join(" ou ")} dígitos.`;
        }
      }

      if (field.validate) {
        const message = field.validate(value, values);
        if (message) nextErrors[field.name] = message;
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
        {fields.map((field) => {
          if (field.type === "section") {
            return <div className="form-section" key={field.label}>{field.label}</div>;
          }

          if (isFieldHidden(field)) return null;

          const disabled = isFieldDisabled(field);
          const required = isFieldRequired(field);
          const className = [
            field.span === "full" ? "field-full" : "",
            field.type === "checkbox" ? "checkbox-field" : ""
          ].filter(Boolean).join(" ");

          return (
          <label className={className} key={field.name}>
            {field.type === "checkbox" ? (
              <span className="checkbox-control">
                <input
                  type="checkbox"
                  checked={Boolean(values[field.name])}
                  disabled={disabled}
                  onChange={(event) => handleChange(field.name, event.target.checked)}
                />
                <span>{field.label}</span>
              </span>
            ) : (
              <span>{field.label}{required ? " *" : ""}</span>
            )}
            {field.type === "select" ? (
              <select
                required={required}
                disabled={disabled}
                value={values[field.name]}
                onChange={(event) => handleChange(field.name, event.target.value)}
              >
                <option value="">{field.placeholder || "Selecione"}</option>
                {field.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                placeholder={field.placeholder}
                required={required}
                disabled={disabled}
                rows={field.rows || 4}
                value={values[field.name]}
                onChange={(event) => handleChange(field.name, event.target.value)}
              />
            ) : field.type !== "checkbox" ? (
              <input
                type={field.type || "text"}
                placeholder={field.placeholder}
                required={required}
                disabled={disabled}
                value={values[field.name]}
                onChange={(event) => handleChange(field.name, event.target.value)}
              />
            ) : (
              null
            )}
            {field.help && <small className="field-help">{field.help}</small>}
            {errors[field.name] && <small className="field-error">{errors[field.name]}</small>}
          </label>
        );})}
      </div>
      {success && <p className="form-success">{success}</p>}
      <div className="form-actions">
        <Button type="submit">{editingItem ? "Atualizar" : submitLabel}</Button>
        {editingItem && <Button type="button" variant="soft" onClick={onCancelEdit}>Cancelar edição</Button>}
      </div>
    </form>
  );
}
