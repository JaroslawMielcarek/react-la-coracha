import { useState } from "react"
import "./PavilionsInput.css"
import { TextAreaInput } from "components/TextInput/TextAreaInput"
import withForm from "components/form/withForm"


type propTypes = {
  placeholder: string,
  name: string,
  value: string[],
  label: string,
  type: string,
  errors: string[],
  onChange: Function
}
export const PavilionsInput = (props: propTypes) => {
  const [ pavilions, setPavilions ] = useState<string[]>(props.value || [])

  const handleSubmit = () => {
    props.onChange( pavilions.filter(e => e !=="") )
  }
  
  const onChange = (val: string) => {
    (!val.length) ? setPavilions( [] ) : setPavilions( val.split("\n") )
  }
  const klass = props.errors.length ? "form-group dashed fit has-error" : "form-group dashed fit"

  return (
    <fieldset className={ klass } 
    onBlur={() => handleSubmit() }>
      <legend className="extra-message">{ props.label }</legend>
      <TextAreaInput 
        name="pavilions"
        value={ pavilions.length ? pavilions.join("\n") : "" }
        label="Lista de Pabellones"
        placeholder="Pabellon Pacheco, calle. Aragon 9, Malaga"
        errors={ props.errors }
        onChange={ onChange }
        rows={ 8 }
        cols={ 37 }
        />
    </fieldset>
  )
}

export const PavilionsInputForm = withForm(PavilionsInput)