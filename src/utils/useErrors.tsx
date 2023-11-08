import { isEmpty } from "./object"

type propsType = {
  errors: string[],
  name: string
}

export const useError = (props: propsType) => {
  const hasError = !isEmpty(props.errors)

  const renderErrors = () => {
    if (!hasError) {
      return null
    }

    const errors = props.errors.map((errMsg: string, i: number) => (
      <li key={`${props.name}-error-${i}`} className="error">
        {errMsg}
      </li>
    ))

    return <ul className="error-messages">{errors}</ul>
  }

  return { renderErrors, hasError }
}