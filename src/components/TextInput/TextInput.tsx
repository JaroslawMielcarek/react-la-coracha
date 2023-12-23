import React, { useContext, useEffect, useState } from "react"
import { useError } from "utils/useErrors"
import { FormContext } from "components/form/useFormState"
import { compareDateStrings, compareHoursMinutesStrings } from "utils/time"
import withForm, { WithFormPropsType, withExtraProps } from "components/form/withForm"

// NUEVA VERSION

type TextInputPropTypes = {
  name: string,
  value: string,
  type?: string,
  label?: string,
  placeholder: string,
  errors: string[],
  onChange: Function,
}

export const TextInput = (props: TextInputPropTypes) => {
  const { renderErrors, hasError, setErrors } = useError({errors: props.errors, name: props.name})

  useEffect( () => {
    if (props.errors) setErrors(props.errors)
  },[props.errors])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    props.onChange(val)
  }

  const klass = hasError ? "form-group has-error" : "form-group"

  return (
    <div className={ klass }>
      { props.label ? <label>{ props.label }</label> : null }
      <input
        name={ props.name }
        type={ props.type || "text" }
        className="form-control"
        placeholder={ props.placeholder }
        onChange={ onChange }
        value={ props.value || '' }
      />
      { renderErrors() }
    </div>
  )
}

export const TextInputForm = withExtraProps(withForm(TextInput))

// NUMBER

type NumberInputPropTypes = {
  name: string,
  value: string,
  min?: number,
  max?: number,
  step?: number,
  label?: string,
  placeholder: string,
  errors?: string[],
  onChange: Function,
}

export const NumberInput = (props: NumberInputPropTypes) => {
const { renderErrors, hasError, setErrors } = useError({errors: props.errors, name: props.name})


const validateNumber = (val: number) => {
  if (props.min && val < props.min) {
    setErrors(["Number too small!"])
    return props.onChange(val)
  }
  if (props.max && val > props.max) {
    setErrors(["Number too big!"])
    return props.onChange(val)
  }
  setErrors([])
  props.onChange(val)
}
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let val = e.target.value
  if (!val) { 
    setErrors(["Provide number"])
    return props.onChange(val)
  }

  const num = Number.isInteger(props.step || 1 ) ? parseInt(val) : parseFloat(val)
  if (isNaN(num)) {
    setErrors(["Provide number"])
    return props.onChange(val)
  }
  validateNumber(num)
}

const klass = hasError ? "form-group has-error" : "form-group"

return (
  <div className={ klass }>
    { props.label ? <label>{ props.label }</label> : null }
    <input
      name={ props.name }
      type="number"
      className="form-control"
      placeholder={ props.placeholder }
      value={ props.value }
      step={ props.step || 1 }
      min={ props.min }
      max={ props.max }
      onChange={ onChange }
    />
    { renderErrors() }
  </div>
)
}

export const NumberInputForm = withExtraProps(withForm(NumberInput))

// TIME

type TimeInputPropTypes = {
  name: string,
  value: string,
  min?: string,
  max?: string,
  step?: number,
  label?: string,
  placeholder: string,
  errors: string[],
  onChange: Function,
}

export const TimeInput = (props: TimeInputPropTypes) => {
  const { renderErrors, hasError, setErrors } = useError({errors: props.errors, name: props.name})

  const validateTime = (val: string) => {
    if (props.min && ( compareHoursMinutesStrings(val, props.min) === -1) ) {
      setErrors(["To early!"])
      return props.onChange(val)
    }
    if (props.max && ( compareHoursMinutesStrings(val, props.max) === 1) ) {
      setErrors(["To late!"])
      return props.onChange(val)
    }
    setErrors([])
    props.onChange(val)
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (!val) setErrors(state => [...state, "Provide time!"])
    validateTime(val)
  }

  const klass = hasError ? "form-group has-error" : "form-group"

  return (
    <div className={ klass }>
      { props.label ? <label>{ props.label }</label> : null }
      <input
        name={ props.name }
        type="time"
        className="form-control"
        placeholder={ props.placeholder }
        value={ props.value }
        step={ props.step || 120 }
        min={ props.min }
        max={ props.max }
        onChange={ onChange }
      />
      { renderErrors() }
    </div>
  )
}

export const TimeInputForm = withExtraProps(withForm(TimeInput))

// Date

type DateInputPropTypes = {
  name: string,
  value: string,
  min?: string,
  max?: string,
  step?: number,
  label?: string,
  type?: string,
  placeholder: string,
  errors: string[],
  onChange: Function,
}

export const DateInput = (props: DateInputPropTypes) => {
  const { renderErrors, hasError, setErrors } = useError({errors: props.errors, name: props.name})

  const validateDate = (val: string) => {
    if (props.min && compareDateStrings(val, props.min) === -1 ) {
      setErrors(state => [...state, "To early!"])
      return props.onChange(props.min)
    }
    if (props.max && compareDateStrings(val, props.max) === 1) {
      setErrors(state => [...state, "To late!"])
      return props.onChange(props.max)
    }

    setErrors([])
    props.onChange(val)
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (!val) setErrors(state => [...state, "Provide time!"])
    validateDate(val)
  }

  const klass = hasError ? "form-group has-error" : "form-group"

  return (
    <div className={ klass }>
      { props.label ? <label>{ props.label }</label> : null }
      <input
        name={ props.name }
        type={ props.type || "date" }
        className="form-control"
        placeholder={ props.placeholder }
        value={ props.value || new Date().toISOString().split("T")[0] }
        step={ props.step || 1 }
        min={ props.min }
        max={ props.max }
        onChange={ onChange }
      />
      { renderErrors() }
    </div>
  )
}

type DateInputFormPropsType = WithFormPropsType & {
  min?: string,
  max?: string,
  step?: number,
  type?: string,
  placeholder: string,
}

export const DateInputForm = (props: DateInputFormPropsType) => {
  const { formState, setFieldValue, registerInput } = useContext(FormContext)

  useEffect(() => {
    registerInput(props.name, props.validators)
  }, [])

  function onChange (val: string) {
    if (props.onChange) return props.onChange(props.name, val)
    setFieldValue(props.name, val, props.resetOnChange, props.compare)
  }
  const inputValue = formState.data[props.name]?.toString() || new Date().toISOString().split("T")[0]
  const inputErrors = formState.errors[props.name] || []

  return (
    <DateInput
      {...props}
      errors={ inputErrors }
      value={ inputValue }
      onChange={ onChange }
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
    props.onChange(props.value.filter(d => new Date(d).toLocaleDateString() !== new Date(date).toLocaleDateString()))
  }
  const onChange = (val: string) => {
    const date = new Date(val)

    const exist = props.value.find(d => new Date(d).toDateString() === new Date(date).toDateString() )
    
    if (exist) return setErrors( ["Date exist"])
    setErrors([])
    props.onChange( [...props.value, val] )
    
    
  }
  return (
    <fieldset className="form-group fit">
      <legend className="extra-message">{ props.label }</legend>
      <div id="datesList">
      { props.value.length ? props.value.sort( (a,b) => new Date(a).getTime() - new Date(b).getTime()).map(date => (
        <button className="btn" onClick={() => handleRemoveDate(date)} key={ date.toString() }>{ new Date(date).toLocaleDateString() }</button>
      )): <p className="no-data">No hay ningua fecha prohibida</p>}
      </div>
      <fieldset className="solid fit form-group">
        <DateInput name="date" value={ new Date().toISOString().split("T")[0] } placeholder={ new Date().toISOString().split("T")[0] } label="Choose date" errors={ errors } onChange={(val: string) => onChange(val)}/>
      </fieldset>
    </fieldset>
  )
}