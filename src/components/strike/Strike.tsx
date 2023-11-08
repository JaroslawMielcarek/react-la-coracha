import { TextInput } from "components/TextInput/TextInput"
import { FormContext } from "components/form/useFormState"
import { SelectInput } from "components/selectInput/SelectInput"
import { useContext, useEffect } from "react"


type TStrike = {
  qty: number,
  lastStrike: string
}

export function StrikeDisplay ({strike}: {strike: TStrike | undefined}) {
  if (!strike) return <p>No pudimos procesar los datos de tu strikes.</p>

  return (
    <div className="strikeDisplay">
      <p>Tienes <b className="closeToLimit">{ strike?.qty }</b>/3 strikes.</p>
      <p>Último strike obtenido en: <b className="closeToLimit">{ strike.lastStrike }</b></p>
    </div>
  )
}

type TStrikeInputProps = {
  strike: TStrike,
  onChange: Function
}

export const StrikeQtyInput = ({strike, onChange}: TStrikeInputProps ) => {

  const handleChange = (val: string) => {
    if (val === "0") return onChange({qty: 0, lastStrike: "" })
    onChange( {qty: parseInt(val), lastStrike: new Date().toISOString().split("T")[0]} )
  }
  return (
    <div>
      <SelectInput 
        name="qty"
        value={ strike.qty.toString() }
        onChange={ handleChange }
        label="Qty"
        options={ ["0", "1", "2", "3"]}
        />
    </div>
  )
}

export const StrikeDateInput = ({strike, onChange}: TStrikeInputProps ) => {

  const handleChange = (val: string) => {
    onChange( {...strike, lastStrike: val} )
  }
  return (
    <div>
      <TextInput 
        name="date"
        value={ strike.lastStrike.toString() }
        onChange={ handleChange }
        label="Last Strike"
        type="date"
        placeholder="01/08/2020"
        errors={ [] }
        />
    </div>
  )
}

type TStrikeWithFormProps = {
  name: string,
  label?: string,
  onClick?: Function,
  validators?: Function[]
}
export const StrikeWithForm = (props: TStrikeWithFormProps) => {
  const { formState, setFieldValue, registerInput } = useContext(FormContext)

  useEffect(() => {
    if (props.validators) registerInput(props.name, props.validators)
  },[props.validators, props.name, registerInput])

  const handleChange = (val: TStrike) => {
    if (props.onClick) return props.onClick(props.name, val)
    setFieldValue(props.name, val)
  }
  const inputValue = formState.data[props.name] as TStrike

  return (
    <fieldset className="form-group dashed">
      { props.label && <legend>{props.label}</legend> }
      <StrikeQtyInput strike={ inputValue } onChange={ handleChange }/>
      { inputValue.qty > 0 && <StrikeDateInput strike={ inputValue } onChange={ handleChange }/> }
    </fieldset>
  )
}