import React, { useContext, useEffect, useState } from "react"
import { useError } from "utils/useErrors"
import withForm from "../form/withForm"
import { FormContext } from "components/form/useFormState"
import { compareDateStrings, compareHoursMinutesStrings } from "utils/time"

// type propTypes = {
//     placeholder: string,
//     name: string,
//     value: string,
//     label: string,
//     type: string,
//     errors: string[],
//     onChange: Function,
//     step?: string
//   }

// export const TextInput = (props: propTypes) => {
//   const { renderErrors, hasError } = useError({errors: props.errors, name: props.name})

//   const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let val = e.target.value
//     if (props.type && props.type === "number") {
//       const v = parseFloat(val)
//       if (isNaN(v)) return props.onChange(0)
//       return props.onChange(v)
//     }
//     props.onChange(val)
//   }

//   const klass = hasError ? "form-group has-error" : "form-group"

//   return (
//     <div className={klass}>
//       <label>{props.label}</label>
//       <input
//         name={props.name}
//         type={props.type}
//         step={ props.step }
//         className="form-control"
//         placeholder={props.placeholder}
//         onChange={onChange}
//         value={props.value || ''}
//       />
//       {renderErrors()}
//     </div>
//   )
// }

// export const TextInputForm = withForm(TextInput)


// type propTypesTime = {
//   placeholder: string,
//   name: string,
//   value: string,
//   label: string,
//   errors: string[],
//   onChange: Function,
//   step?: string,
//   min: string,
//   max: string
// }

// export const TimeInput = (props: propTypesTime) => {
//   const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value
//     props.onChange(val)
//   }
//   const renderErrors = () => {
//     if (!props.errors.length) return null
//     return (
//       <ul className="error-messages">
//         { props.errors.map((errMsg: string, i: number) => (
//           <li key={`slot-error-${i}`} className="error">
//             {errMsg}
//           </li>
//         )) }
//       </ul>
//     )
    
//   }
//   const klass = props.errors.length ? "form-group has-error" : "form-group"

//   return (
//     <div className={ klass }>
//       <label>{ props.label} </label>
//       <input
//         name={ props.name }
//         type="time"
//         step={ props.step }
//         className="form-control"
//         placeholder={ props.placeholder }
//         onChange={ onChange }
//         value={ props.value }
//       />
//       { renderErrors() }
//     </div>
//   )
// }

// type propTypesDate = {
//   name: string,
//   value: string,
//   label: string,
//   errors: string[],
//   onChange: Function,
//   min?: string,
//   max?: string
// }
// export const DatePickerInput = (props: propTypesDate) => {
//   const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value
//     if (val) props.onChange(val)
//   }

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     return e.preventDefault()
//   }

//   const renderErrors = () => {
//     if (!props.errors.length) return null
//     return (
//        <ul className="error-messages">
//         { props.errors.map((errMsg: string, i: number) => (
//           <li key={`slot-error-${i}`} className="error">
//             {errMsg}
//           </li>
//         )) }
//       </ul>
//     )
//   }
//   const klass = props.errors.length ? "form-group has-error" : "form-group"
  
//   return (
//     <div className={ klass }>
//       <label>{ props.label} </label>
//       <input
//         name={ props.name }
//         type="date"
//         className="form-control"
//         value={ props.value || Date.now().toLocaleString() }
//         onChange={ onChange }
//         onKeyDown={ handleKeyDown }
//         onKeyDownCapture={ handleKeyDown }
//         min={ props.min }
//         max={ props.max }
//       />
//       { renderErrors() }
//     </div>
//   )
// }
// type DatePickerInputPropsType = {
//   name: string,
//   validators: Function[],
//   label?: string,
//   onChange?: Function,
//   children?: React.ReactNode,
//   min?: string,
//   max?: string
// }
// export const DatePickerInputForm  = (props: DatePickerInputPropsType) => {
//   const { formState, setFieldValue, registerInput } = useContext(FormContext)

//   useEffect(() => {
//     registerInput(props.name, props.validators)
//   }, [])

//   function onChange <T>(val: T) {
//     if (props.onChange) return props.onChange(props.name, val)
//     setFieldValue(props.name, val)
//   }
//   const inputValue = formState.data[props.name]?.toString() || ""
//   const inputErrors = formState.errors[props.name] || []

//   return (
//     <DatePickerInput
//       {... props }
//       label={ props.label || "Elige la fecha"}
//       errors={inputErrors}
//       value={inputValue}
//       onChange={onChange}
//     />
//   )
// }

  // type propTypesDatePicker = {
  //   name: string,
  //   value: Date[],
  //   label: string,
  //   onChange: Function,
  // }
  // export const DatesPicker = (props: propTypesDatePicker) => {
  //   const [ errors, setErrors ] = useState<string[]>([])
    
  //   const handleRemoveDate = (date: Date) => {
  //     props.onChange(props.value.filter(d => d !== date))
  //   }
  //   const onChange = (val: string) => {
  //     const date = new Date(val)

  //     const exist = props.value.find(d => d.toLocaleDateString() === date.toLocaleDateString() )
      
  //     if (exist) return setErrors( ["Date exist"])
  //     setErrors([])
  //     props.onChange( [...props.value, date] )
      
      
  //   }
  //   return (
  //     <fieldset className="form-group fit">
  //       <legend className="extra-message">{ props.label }</legend>
  //       <div id="datesList">
  //       { props.value.length ? props.value.map(date => (
  //         <div key={ date.toDateString() }>
  //           <button className="btn" onClick={() => handleRemoveDate(date)}>{ date.toLocaleDateString() }</button>
  //         </div>
  //       )): <p className="no-data">No hay ningua fecha prohibida</p>}
  //       </div>
  //       <fieldset className="solid fit form-group">
  //         <DatePickerInput name="date" value={"yyyy-mm-dd"} label="Choose date" errors={ errors } onChange={(val: string) => onChange(val)}/>
  //       </fieldset>
  //     </fieldset>
  //   )
  // }
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
  const { renderErrors, hasError } = useError({errors: props.errors, name: props.name})

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    props.onChange(val)
  }

  const klass = hasError ? "form-group has-error" : "form-group"

  return (
    <div className={ klass }>
      <label>{ props.label }</label>
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

type TextInputFormPropsType = {
  name: string,
  validators: Function[],
  type?: string,
  label?: string,
  placeholder: string,
  className?: string,
  onChange?: Function,
  // Fields Related
  resetOnChange?: string[],
  compare?: {to: string, errMsg: string},
}

export const TextInputForm = (props: TextInputFormPropsType) => {
  const { formState, setFieldValue, registerInput } = useContext(FormContext)

  useEffect(() => {
    registerInput(props.name, props.validators)
  }, [])

  function onChange (val: string) {
    if (props.onChange) return props.onChange(props.name, val)
    setFieldValue(props.name, val, props.resetOnChange, props.compare)
  }
  const inputValue = formState.data[props.name]?.toString() || ""
  const inputErrors = formState.errors[props.name] || []

  return (
    <TextInput
      {...props}
      errors={ inputErrors }
      value={ inputValue }
      onChange={ onChange }
    />
  )
}

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
    <label>{ props.label }</label>
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

type NumberInputFormPropsType = {
  name: string,
  validators: Function[],
  min?: number,
  max?: number,
  step?: number,
  label?: string,
  placeholder: string,
  className?: string,
  onChange?: Function,
  // Fields Related
  resetOnChange?: string[],
  compare?: {to: string, errMsg: string},
}

export const NumberInputForm = (props: NumberInputFormPropsType) => {
  const { formState, setFieldValue, registerInput } = useContext(FormContext)

  useEffect(() => {
    registerInput(props.name, props.validators)
  }, [])

  function onChange (val: string) {
    if (props.onChange) return props.onChange(props.name, val)
    setFieldValue(props.name, val, props.resetOnChange, props.compare)
  }
  const inputValue = formState.data[props.name]?.toString() || ""
  const inputErrors = formState.errors[props.name] || []

  return (
    <NumberInput
      {...props}
      errors={ inputErrors }
      value={ inputValue }
      onChange={ onChange }
    />
  )
}

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
    if (props.min && compareHoursMinutesStrings(val, props.min) === -1 ) {
      setErrors(state => [...state, "To early!"])
      return props.onChange(val)
    }
    if (props.max && compareHoursMinutesStrings(val, props.max) === 1) {
      setErrors(state => [...state, "To late!"])
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
      <label>{ props.label }</label>
      <input
        name={ props.name }
        type="time"
        className="form-control"
        placeholder={ props.placeholder }
        value={ props.value || "09:00" }
        step={ props.step || 120 }
        min={ props.min }
        max={ props.max }
        onChange={ onChange }
      />
      { renderErrors() }
    </div>
  )
}

type TimeInputFormPropsType = {
  name: string,
  validators: Function[],
  min?: string,
  max?: string,
  step?: number,
  label?: string,
  placeholder: string,
  className?: string,
  onChange?: Function,
  // Fields Related
  resetOnChange?: string[],
  compare?: {to: string, errMsg: string},
}

export const TimeInputForm = (props: TimeInputFormPropsType) => {
  const { formState, setFieldValue, registerInput } = useContext(FormContext)

  useEffect(() => {
    registerInput(props.name, props.validators)
  }, [])

  function onChange (val: string) {
    if (props.onChange) return props.onChange(props.name, val)
    setFieldValue(props.name, val, props.resetOnChange, props.compare)
  }
  const inputValue = formState.data[props.name]?.toString() || ""
  const inputErrors = formState.errors[props.name] || []

  return (
    <TimeInput
      {...props}
      errors={ inputErrors }
      value={ inputValue }
      onChange={ onChange }
    />
  )
}


// Date

type DateInputPropTypes = {
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
      <label>{ props.label }</label>
      <input
        name={ props.name }
        type="date"
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

type DateInputFormPropsType = {
  name: string,
  validators: Function[],
  min?: string,
  max?: string,
  step?: number,
  label?: string,
  placeholder: string,
  className?: string,
  onChange?: Function,
  // Fields Related
  resetOnChange?: string[],
  compare?: {to: string, errMsg: string},
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
        <DateInput name="date" value={ new Date().toISOString().split("T")[0] } placeholder={ new Date().toISOString().split("T")[0] } label="Choose date" errors={ errors } onChange={(val: string) => onChange(val)}/>
      </fieldset>
    </fieldset>
  )
}