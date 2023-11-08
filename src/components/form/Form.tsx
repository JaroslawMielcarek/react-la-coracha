import React, { useContext } from "react"
import { FormContext } from "./useFormState"
import "./Form.css"

type PropTypes = {
  onSubmit?: Function,
  onReset?: Function,
  className: string,
  id: string,
  children: React.ReactNode
}

export default function Form (props: PropTypes) {
  const { formState, validate, resetForm } = useContext(FormContext)
  
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // console.log(validate())
    if (validate() && props.onSubmit) props.onSubmit(formState)
  }
  const onReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (props.onReset) return props.onReset();
    resetForm()
  }
  
  return (
      <form
        onSubmit={onSubmit}
        onReset={onReset}
        className={props.className}
        id={props.id}
        >
        {props.children}
      </form>
  )
}