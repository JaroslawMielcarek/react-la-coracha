import { FormContext } from "components/form/useFormState"
import withForm, { WithFormPropsType, withExtraProps } from "components/form/withForm"
import { useContext, useEffect } from "react"
import { useError } from "utils/useErrors"

type propTypes = {
  name?: string,
  value: string,
  label?: string,
  onChange: Function,
  options: string[]
  errors?: string[],
  disabled?: boolean,
  displayProp?: string
}

export const SelectInput = (props: propTypes) => {
  const { renderErrors, hasError, setErrors } = useError({errors: [], name: props.name || "select"})

  useEffect( () => {
    if (props.errors) setErrors(props.errors)
  },[props.errors])

  if (!props.options) return <p className="no-data">Provide some options to select!</p>
  
  const options = props.options.map( (ele, i) => (
      <option value={ ele } key={ `${props.name}-input-${i}` }>
        { ele }
      </option>
    ) )
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    props.onChange(val)
  }
  const klass = hasError ? "form-group has-error" : "form-group"
  return (
    <div className={klass}>
      { props.label ? <label>{ props.label }</label> : null }
      <select
        name={ props.name }
        value={ props.value ? props.value : "" }
        onChange={ onChange }
        aria-disabled={ props.disabled }
      >
        <option value="" disabled>{ props.label }</option>
        { options }
      </select>
      { renderErrors() }
    </div>
  )
}

export const SelectInputForm = withExtraProps(withForm(SelectInput))


type SelectObjectInputFormPropsType = WithFormPropsType & {
  displayProp?: string,
  options: any[]
}

export const SelectObjectInputForm = (props: SelectObjectInputFormPropsType) => {
  const { formState, setFieldValue, registerInput } = useContext(FormContext)

  const propName = props.displayProp

  useEffect(() => {
    registerInput(props.name, props.validators)
  }, [])

  function onChange (val: string) {
    const value = propName ? props.options.find(ele => ele[propName] === val) : val
    if (props.onChange) return props.onChange(props.name, value, props.resetOnChange, props.compare)
    setFieldValue(props.name, value)
  }
  const getListOfKeys = () => {
    const arr = props.options
    if (!arr.length) return ["invalid List"]
    if (!propName) return arr as string[]
    return arr.map((e) => e[propName])
  }
  
  const inputValue = formState.data[props.name]?.toString() || ""
  const inputErrors = formState.errors[props.name] || []

  return (
    <SelectInput
      {...props}
      errors={ inputErrors }
      value={ inputValue }
      options={ getListOfKeys() }
      onChange={ onChange }
    />
  )
}