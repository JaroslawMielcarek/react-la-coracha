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

type propTypesDate = {
  placeholder: string,
  name: string,
  value: string,
  label: string,
  errors: string[],
  onChange: Function,
}
export const DatePickerInput = (props: propTypesDate) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val) props.onChange(val)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    return e.preventDefault()
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
        type="date"
        className="form-control"
        value={ props.value }
        onChange={ onChange }
        onKeyDown={ handleKeyDown }
        onKeyDownCapture={ handleKeyDown }
      />
      { renderErrors() }
    </div>
  )
  }
  type propTypesDatePicker = {
    name: string,
    value: Date[],
    label: string,
    onChange: Function,
  }
  export const DatesPicker = (props: propTypesDatePicker) => {
    const [ errors, setErrors ] = useState<string[]>([])
    
    const handleRemoveDate = (date: Date) => {
      props.onChange(props.value.filter(d => d !== date))
    }
    const onChange = (val: string) => {
      const date = new Date(val)

      const exist = props.value.find(d => d.toLocaleDateString() === date.toLocaleDateString() )
      
      if (exist) return setErrors( ["Date exist"])
      setErrors([])
      props.onChange( [...props.value, date] )
      
      
    }
    return (
      <fieldset className="form-group fit">
        <legend className="extra-message">{ props.label }</legend>
        <div id="datesList">
        { props.value.length ? props.value.map(date => (
          <div key={ date.toDateString() }>
            <button className="btn" onClick={() => handleRemoveDate(date)}>{ date.toLocaleDateString() }</button>
          </div>
        )): <p className="no-data">No hay ningua fecha prohibida</p>}
        </div>
        <fieldset className="solid fit form-group">
          <DatePickerInput placeholder="24/01/2023" name="date" value={"yyyy-mm-dd"} label="Choose date" errors={ errors } onChange={(val: string) => onChange(val)}/>
        </fieldset>
      </fieldset>
    )
  }