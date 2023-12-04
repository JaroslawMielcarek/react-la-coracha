import React, { useEffect } from "react"
import { useError } from "utils/useErrors"
import withForm, { withExtraProps } from "../form/withForm"

type propTypes = {
    name: string,
    value: string,
    label?: string,
    errors: string[],
    onChange: Function,
    rows?: number,
    cols?: number,
    placeholder: string,
  }

export const TextAreaInput = (props: propTypes) => {
  const { renderErrors, hasError, setErrors } = useError({errors: props.errors, name: props.name})

  useEffect( () => {
    if (props.errors) setErrors(props.errors)
  },[props.errors])

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    props.onChange(val)
  }

  const klass = hasError ? "form-group has-error" : "form-group"

  return (
    <div className={ klass }>
      { props.label ? <label>{ props.label }</label> : null }
      <textarea
        name={ props.name }
        className="form-control"
        placeholder={ props.placeholder }
        onChange={ onChange }
        value={ props.value || '' }
        rows={ props.rows }
        cols={ props.cols }
      />
      { renderErrors() }
    </div>
  )
}

export const TextAreaInputForm = withExtraProps(withForm(TextAreaInput))
