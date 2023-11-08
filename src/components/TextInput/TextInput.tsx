import React from "react"
import { useError } from "utils/useErrors"
import withForm from "../form/withForm"

type propTypes = {
    placeholder: string,
    name: string,
    value: string,
    label: string,
    type: string,
    errors: string[],
    onChange: Function
  }

export const TextInput = (props: propTypes) => {
  const { renderErrors, hasError } = useError({errors: props.errors, name: props.name})

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (props.type && props.type === "number") {
      const v = parseFloat(val)
      if (isNaN(v)) return props.onChange(0)
      return props.onChange(v)
    }
    props.onChange(val)
  }

  const klass = hasError ? "form-group has-error" : "form-group"

  return (
    <div className={klass}>
      <label>{props.label}</label>
      <input
        name={props.name}
        type={props.type}
        className="form-control"
        placeholder={props.placeholder}
        onChange={onChange}
        value={props.value || ''}
      />
      {renderErrors()}
    </div>
  )
}

export const TextInputForm = withForm(TextInput)
