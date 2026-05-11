import { Button } from "./Button.jsx";

export function Filters({ filters, values, onChange, onClear }) {
  return (
    <div className="filters-bar">
      {filters.map((filter) => (
        <label key={filter.name}>
          <span>{filter.label}</span>
          {filter.type === "select" ? (
            <select value={values[filter.name] || ""} onChange={(event) => onChange(filter.name, event.target.value)}>
              <option value="">Todos</option>
              {filter.options.map((option) => <option key={option}>{option}</option>)}
            </select>
          ) : (
            <input
              type={filter.type || "text"}
              value={values[filter.name] || ""}
              placeholder={filter.placeholder}
              onChange={(event) => onChange(filter.name, event.target.value)}
            />
          )}
        </label>
      ))}
      <Button type="button" variant="soft" onClick={onClear}>Limpar filtros</Button>
    </div>
  );
}

