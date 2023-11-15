import React, { useState } from "react"
import { useError } from "utils/useErrors"
import withForm from "../form/withForm"

type propTypes = {
    placeholder: string,
    name: string,
    value: string,
    label: string,
    type: string,
    errors: string[],
    onChange: Function,
    step?: string
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
        step={ props.step }
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


type propTypesTime = {
  placeholder: string,
  name: string,
  value: string,
  label: string,
  errors: string[],
  onChange: Function,
  step?: string,
  min: string,
  max: string
}

export const TimeInput = (props: propTypesTime) => {
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value
  props.onChange(val)
}
const renderErrors = () => {
  if (!props.errors.length) return null
  return (
     <ul className="error-messages">
      { props.errors.map((errMsg: string, i: number) => (
        <li key={`slot-error-${i}`} className="error">
          {errMsg}
        </li>
      )) }
    </ul>
  )
  
}
const klass = props.errors.length ? "form-group has-error" : "form-group"

return (
  <div className={ klass }>
    <label>{ props.label} </label>
    <input
      name={ props.name }
      type="time"
      step={ props.step }
      className="form-control"
      placeholder={ props.placeholder }
      onChange={ onChange }
      value={ props.value }
    />
    { renderErrors() }
  </div>
)
}