import { useContext, useEffect } from "react"
import { FormContext } from "./useFormState"

type WithFormPropsType = {
  name: string,
  validators: Function[],
  placeholder?: string,
  label?: string,
  type?: string,
  className?: string,
  onChange?: Function,
  children?: React.ReactNode,
  // Fields Related
  resetOnChange?: string[],
  compare?: {to: string, errMsg: string},
  // Select props
  options?: string[],
  // Toggle props
  value?: string | number,
  toggleValue?: string | number
  isActive?: boolean
}
export default function withForm(InputComponent: any) {
  const WrappedWithForm = (props: WithFormPropsType) => {
    const { formState, setFieldValue, registerInput } = useContext(FormContext)

    useEffect(() => {
      registerInput(props.name, props.validators)
    }, [props.name, props.validators, registerInput])

    function onChange <T>(val: T) {
      if (props.onChange) return props.onChange(props.name, val)
      setFieldValue(props.name, val, props.resetOnChange, props.compare)
    }
    const inputValue = formState.data[props.name]
    const inputErrors = formState.errors[props.name] || []

    return (
      <InputComponent
        {...props}
        errors={inputErrors}
        value={inputValue}
        onChange={onChange}
      >
        {props.children}
      </InputComponent>
    )
  }

  return WrappedWithForm;
}