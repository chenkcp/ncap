import './Checkbox.css'

function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
}) {
  return (
    <label className={`checkbox-wrapper ${disabled ? 'disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  )
}

export default Checkbox
