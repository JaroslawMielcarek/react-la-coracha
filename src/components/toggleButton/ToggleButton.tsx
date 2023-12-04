import React from "react"
import withForm, { withExtraProps } from "../form/withForm"

type propTypes = {
    name: string,
    value: string,
    label?: string,
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
      { props.label ? <label>{ props.label }</label> : null }
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

export const ToggleButtonForm = withExtraProps(withForm(ToggleButton))