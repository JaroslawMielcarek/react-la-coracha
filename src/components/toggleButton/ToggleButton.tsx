import React from "react"
import withForm from "../form/withForm"
import withOptions from "./withOptions"

type propTypes = {
    placeholder: string,
    name: string,
    value: string,
    label?: string,
    type?: string,
    errors?: string[],
    onChange: Function,
    children?: React.ReactNode
    isActive?: boolean
    className?: string
  }

export const ToggleButton = (props: propTypes) => {

  const onClick = () => {
    props.onChange(props.label)
  }

  let klass = "option btn"
  if (props.isActive) klass += " active"
  if (props.className) klass += " " + props.className

  return (
    <div className={ klass } onClick={onClick}>
      <label>{ props.label }</label>
      { props.children }
      <input
        name={ props.name }
        type="radio"
        className="form-control"
        value={ props.label }
      />
    </div>
  )
}

export const ToggleButtonForm = withForm(ToggleButton)
export const ToggleButtonWithOptionsForm = withForm(withOptions(ToggleButton))
