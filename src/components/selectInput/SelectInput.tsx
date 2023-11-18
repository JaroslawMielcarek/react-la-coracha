import withForm from "components/form/withForm"
import { useError } from "utils/useErrors"

type propTypes = {
  name: string,
  value: string,
  label: string,
  onChange: Function,
  // children: React.ReactNode,
  options: string[] 
  placeholder?: string,
  errors?: string[],
  disabled?: boolean
}

export const SelectInput = (props: propTypes) => {
  const { renderErrors, hasError } = useError({errors: [], name: props.name})

  if (!props.options) return <p className="no-data">Provide some options to select!</p>
  
  const options = props.options.map( (o, i) => (
    <option 
      value={o} 
      key={`${props.name}-input-${i}`}
    >
      {o}
    </option>
  ))
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    props.onChange(val)
  }
  const klass = hasError ? "form-group has-error" : "form-group"
  return (
    <div className={klass}>
      <label>{props.label}</label>
      <select
        name={props.name}
        value={props.value ? props.value : ""}
        onChange={onChange}
        aria-disabled={props.disabled}
      >
        <option value="" disabled>{props.label}</option>
        {options}
      </select>
      { renderErrors() }
    </div>
  )
}

export const SelectInputForm = withForm(SelectInput)