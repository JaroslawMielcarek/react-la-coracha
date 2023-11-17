import React, { useContext, useEffect, useState } from "react"
import { useError } from "utils/useErrors"
import withForm from "../form/withForm"
import { FormContext } from "components/form/useFormState"

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
  name: string,
  value: string,
  label: string,
  errors: string[],
  onChange: Function,
  min?: string,
  max?: string
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
        value={ props.value || Date.now().toLocaleString() }
        onChange={ onChange }
        onKeyDown={ handleKeyDown }
        onKeyDownCapture={ handleKeyDown }
        min={ props.min }
        max={ props.max }
      />
      { renderErrors() }
    </div>
  )
}
type DatePickerInputPropsType = {
  name: string,
  validators: Function[],
  label?: string,
  onChange?: Function,
  children?: React.ReactNode,
  min?: string,
  max?: string
}
export const DatePickerInputForm  = (props: DatePickerInputPropsType) => {
  const { formState, setFieldValue, registerInput } = useContext(FormContext)

  useEffect(() => {
    registerInput(props.name, props.validators)
  }, [])

  function onChange <T>(val: T) {
    if (props.onChange) return props.onChange(props.name, val)
    setFieldValue(props.name, val)
  }
  const inputValue = formState.data[props.name]?.toString() || ""
  const inputErrors = formState.errors[props.name] || []

  return (
    <DatePickerInput
      {... props }
      label={ props.label || "Elige la fecha"}
      errors={inputErrors}
      value={inputValue}
      onChange={onChange}
    />
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
          <DatePickerInput name="date" value={"yyyy-mm-dd"} label="Choose date" errors={ errors } onChange={(val: string) => onChange(val)}/>
        </fieldset>
      </fieldset>
    )
  }