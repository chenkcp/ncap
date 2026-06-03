import './RadioGroup.css'

function RadioGroup({
  name,
  options,
  value,
  onChange,
  layout = 'horizontal',
}) {
  return (
    <div className={`radio-group ${layout}`}>
      {options.map(option => (
        <label key={option.value} className="radio-item">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
          />
          <span className="radio-label">{option.label}</span>
        </label>
      ))}
    </div>
  )
}

export default RadioGroup
