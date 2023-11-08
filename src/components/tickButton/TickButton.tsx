import "./TickButton.css"
import withForm from "components/form/withForm"

type propTypes = {
  value: string | boolean,
  onChange: Function,
  className: string,
  toggleValue?: string | boolean,
  label?: string,
}

export const TickButton = (props: propTypes) => {
  const onClick = () => {
    if (props.toggleValue) return props.onChange(props.value ? "" : props.toggleValue)
    return props.onChange(!props.value)
  }
  let klass = "form-group tickButton"
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
    </div>
  )
}

type WithCustomToggleValueType = {
  toggleValue: string | number
}

const withCustomValue = (InputComponent: any) => {
  const WrappedWithCustomValue = (props: WithCustomToggleValueType) => {

    return (
      <InputComponent
        {...props}
        toggleValue={props.toggleValue}
      />
    )
  }
  return WrappedWithCustomValue
}

export const TickCustomValueForm = withForm(withCustomValue(TickButton))
export const TickCustomValue = withCustomValue(TickButton)
export const TickButtonForm = withForm(TickButton)
