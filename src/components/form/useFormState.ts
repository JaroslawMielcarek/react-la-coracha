import { useState, createContext } from "react"
import { isEmpty } from "utils/object"

type imageType = { data: string, contentType: string }

type formDataType = { [key: string]: string | number | boolean | File | imageType | object | [] | null  }

type stateType = {
  data: formDataType,
  validators: { [key: string]: Function[] },
  errors: { [key: string]: string[] }
}
const initState = {
  data: {},
  validators: {},
  errors: {}
}
  
export const useFormState = (initialValues: formDataType) => {
  const state = isEmpty(initialValues) ? initState : { ...initState, data: initialValues }
  const [formState, setFormState] = useState<stateType>(state)

  const resetForm = () => {
    setFormState(state => ({
      ...state,
      data: initialValues,
      errors: {}
    }))
  }
  const validate = () => {
    const { validators } = formState
    if (isEmpty(validators)) return true
    
    setFormState(state => ({
      ...state,
      errors: {}
    }))

    const formErrors = (Object.entries(validators)).reduce( (errors, [name, validators]) => {
      const { data } = formState
      const messages = validators.reduce( (messages , validator) => {
        const value = data[name]
        const err = validator(value, data)
        return [...messages, ...err]
      }, [] as string[])

      if (messages.length > 0) errors[name] = messages

      return errors

    }, {} as {[key: string]: string[]} )

    if (isEmpty(formErrors)) return true

    setFormState(state => ({
      ...state,
      errors: formErrors
    }))

    return false
  }
  const validateField = <T>(name: string, value?: T, compare?: {to: string, errMsg: string}) => {
    const { validators } = formState
    if (isEmpty(validators) || typeof validators[name] === 'undefined' || !validators[name].length ) return true

    setFormState(state => {
      delete state.errors[name]
      return ({
        ...state,
        errors: {
          ...state.errors
        }
      })
    })

    let messages = validators[name].reduce( (messages , validator) => {
      const err = validator(value)
      return [...messages, ...err]
    }, [] as string[])


    if (compare && !checkIfSame(value, compare.to) ) {
      messages = [...messages, compare.errMsg]
    }

    if (!messages.length) return true

    setFormState(state => ({
      ...state,
      errors: {
        ...state.errors,
        [name]: messages
      }
    }))

    return false
  }
  const registerInput = (name: string, validators: Function[]) => {
    if (name in formState.validators) return null

    setFormState(state => ({
      ...state,
      validators: {
        ...state.validators,
        [name]: validators || []
      }
    }))
  }

  // NEED TO BE CHECKED as is not proper comparation
  const checkIfSame = <T>(value: T, propertyName: string) => {
    if (! (propertyName in formState.data) ) return false
    const val2 = formState.data[propertyName]
    return value === val2
  }

  const setFieldValue = <T>(name: string, value: T, resetOnChange?: string[], compare?: {to: string, errMsg: string}) => {
    validateField(name, value, compare)

    let resetFields = {}
    if (resetOnChange && resetOnChange.length) {
      resetFields = resetOnChange.reduce((base, dep) => ( { ...base, [dep]: "" } ), {})
    }
    setFormState(state => ({
      ...state,
      data: {
        ...state.data,
        ...resetFields,
        [name]: value
      }
    }))
  }
  
  return { formState , validate, registerInput, setFieldValue, resetForm }
  
  }

type contextType = {
  formState: stateType,
  registerInput: Function,
  setFieldValue: Function,
  resetForm: Function,
  validate: Function
}
export const FormContext = createContext<contextType>({
  formState: initState,
  registerInput: () => {},
  setFieldValue: () => {},
  resetForm: () => {},
  validate: () => {}
})