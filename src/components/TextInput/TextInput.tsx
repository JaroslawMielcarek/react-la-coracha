import React, { useState } from "react"
import { useError } from "utils/useErrors"
import withForm from "../form/withForm"
import { compareHoursMinutesStrings } from "utils/time"

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
// const { renderErrors, hasError } = useError({errors: props.errors, name: props.name})
const [ error, setError ] = useState<string | null>(null)
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value
  let err = ""
  if (!val) err = "Provide hour"
  if (compareHoursMinutesStrings(val, props.min) < 0) err = "Is too early"
  if (compareHoursMinutesStrings(val, props.max) > 0) err = "Is too late"
  setError(err)
  props.onChange(val)
}
const renderErrors = () => {
  if (!error && !props.errors.length) return null

  if (props.errors.length) return (
     <ul className="error-messages">
      { props.errors.map((errMsg: string, i: number) => (
        <li key={`slot-error-${i}`} className="error">
          {errMsg}
        </li>
      )) }
    </ul>
  )
  if (error) return (
    <ul className="error-messages">
      <li key={`slot-error`} className="error">
        { error }
      </li>
    </ul>
  )
  
}
const klass = props.errors.length || error ? "form-group has-error" : "form-group"

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
      value={ props.value || '' }
    />
    { renderErrors() }
  </div>
)
}