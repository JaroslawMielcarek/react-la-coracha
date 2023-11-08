import React from "react"
import { useError } from "utils/useErrors"
import withForm from "../form/withForm"

type propTypes = {
    placeholder: string,
    name: string,
    value: string,
    label: string,
    errors: string[],
    onChange: Function
  }

export const TextAreaInput = (props: propTypes) => {
  const { renderErrors, hasError } = useError({errors: props.errors, name: props.name})

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value
    props.onChange(val)
  }

  const klass = hasError ? "form-group has-error" : "form-group"

  return (
    <div className={klass}>
      <label>{props.label}</label>
      <textarea
        name={ props.name }
        className="form-control"
        placeholder={ props.placeholder }
        onChange={ onChange }
        value={ props.value || '' }
      />
      {renderErrors()}
    </div>
  )
}

export const TextAreaInputForm = withForm(TextAreaInput)
