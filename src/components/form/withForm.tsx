import { useContext, useEffect } from "react"
import { FormContext } from "./useFormState"

export type WithFormPropsType = {
  name: string,
  validators: Function[],
  onChange?: Function,
  label?: string,
  // Fields Related
  resetOnChange?: string[],
  compare?: {to: string, errMsg: string},
  // Children
  children?: React.ReactNode,
}

export const withExtraProps = (Comp: any) => <T,>(props: T) => <Comp {...props}/>
export default function withForm(InputComponent: any) {
  const WrappedWithForm = (props: WithFormPropsType) => {
    const { formState, setFieldValue, registerInput } = useContext(FormContext)

    useEffect(() => {
      registerInput(props.name, props.validators)
    }, [])

    function onChange <T>(val: T) {
      if (props.onChange) return props.onChange(props.name, val)
      setFieldValue(props.name, val, props.resetOnChange, props.compare)
    }
    const inputValue = formState.data[props.name]
    const inputErrors = formState.errors[props.name] || []

    return (
      <InputComponent
        { ...props }
        errors={ inputErrors }
        value={ inputValue }
        onChange={ onChange }
      >
        { props.children }
      </InputComponent>
    )
  }

  return WrappedWithForm;
}