import { useEffect, useState } from "react"
import { isEmpty } from "./object"

type propsType = {
  errors: string[] | undefined,
  name: string
}

// export const useError = (props: propsType) => {
//   const hasError = !isEmpty(props.errors)

//   const renderErrors = () => {
//     if (!hasError) {
//       return null
//     }

//     const errors = props.errors.map((errMsg: string, i: number) => (
//       <li key={`${props.name}-error-${i}`} className="error">
//         {errMsg}
//       </li>
//     ))

//     return <ul className="error-messages">{errors}</ul>
//   }

//   return { renderErrors, hasError }
// }

export const useError = (props: propsType) => {
  const [ errors, setErrors ] = useState<string[]>(props.errors || [])

  // useEffect(() => {
  //   if (props.errors.length) setErrors(props.errors)
  // }, [props.errors])
  const hasError = errors.length

  const renderErrors = () => {
    if (!hasError) return null

    return <ul className="error-messages">{ 
      errors.map((errMsg: string, i: number) => (
      <li key={`${props.name}-error-${i}`} className="error">
        {errMsg}
      </li>
    ))
    }</ul>
  }

  return { renderErrors, hasError, setErrors }
}