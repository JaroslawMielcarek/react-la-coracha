import "./TickButton.css"
import { useError } from "utils/useErrors"
import withForm, { withExtraProps } from "components/form/withForm"
import { useEffect } from "react"

type propTypes = {
  name?: string,
  value: string | boolean,
  onChange: Function,
  className?: string,
  toggleValue?: string | boolean,
  label?: string,
  errors?: string[]
}
export const TickButton = (props: propTypes) => {
  const { renderErrors, hasError, setErrors } = useError({errors: props.errors, name: props.name || "tick"})

  useEffect( () => {
    if(props.errors) setErrors(props.errors)
  },[props.errors])

  const onClick = () => {
    if (props.toggleValue) return props.onChange(props.value ? "" : props.toggleValue)
    return props.onChange(!props.value)
  }
  let klass = hasError ? "form-group tickButton has-error" : "form-group tickButton"
  if (props.className) klass += " " + props.className
  if (!!props.value) klass += " checked"
  return (
    <div className={klass} >
      {props.label && <label>{props.label}</label> }
      <div onClick={onClick}>
        <svg viewBox="0 0 44 44">
          <path d="M14,24 L21,31 L39.7428882,11.5937758 C35.2809627,6.53125861 30.0333333,4 24,4 C12.95,4 4,12.95 4,24 C4,35.05 12.95,44 24,44 C35.05,44 44,35.05 44,24 C44,19.3 42.5809627,15.1645919 39.7428882,11.5937758" transform="translate(-2.000000, -2.000000)"></path>
        </svg>
      </div>
      { renderErrors() }
    </div>
  )
}

export const TickButtonForm = withExtraProps(withForm(TickButton))

