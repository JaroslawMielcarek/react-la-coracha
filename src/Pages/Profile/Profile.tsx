import "./Profile.css"
import Form from "components/form/Form"
import { TextInputForm } from "components/TextInput/TextInput"
import { FormContext } from "components/form/useFormState"
import { useFormState } from "components/form/useFormState"
import { TickCustomValueForm } from "components/tickButton/TickButton"
import { SelectInputForm } from "components/selectInput/SelectInput"
import { FileUploadWithForm, ImagePreviewWithForm } from "components/imageUploadWithPreview/ImageUpload"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { checkRangeValidator, requiredValidator } from "utils/validators"
import { isTheSame, prepareFormState, prepareToSend } from "utils/object"
import { UserContext } from "utils/useUser"
import { useFetch } from "utils/useFetch"
import { getMonthNameFromMonthYear } from "utils/time"
import { TMonthFinancial, TPropertyWithPermission } from "shared/types"

type TPlayer = {
  _id: string,
  nick: TPropertyWithPermission,
  number: TPropertyWithPermission,
  height: TPropertyWithPermission,
  weight: TPropertyWithPermission,
  dominantHand: TPropertyWithPermission,
  photo: { value: {data: string, }, permisionGranted: boolean }
  team: string,
  payments: TMonthFinancial[],
  preferedPositions: { choosen: string }[],
  balance?: number
}

export default function Profile () {
  const [userData, sendData] = useFetch<TPlayer>({url: "user/getOwnData", errorTitle: "Get own data"})
  const { isLogged } = useContext(UserContext)
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!isLogged()) return navigate("/login")
  },[isLogged])

  const renderBalance = () => {
    const klass = userData && userData?.balance && userData?.balance < 0 ? "amount under" : "amount"
    return <p className="balance">Saldo actual: <span className={ klass }>{ userData?.balance }</span> </p>
  }
  return (
    <div id="profil" className="page">
      <section className="card">
        <h3>Información básica</h3>
        <p className="extra-message">Muestra tu información en la tarjeta de jugador (si marcas el botón Mostrar)</p>
        { userData && <BasicInfo p={ userData } sendData={ sendData }/> }
      </section>
      <section id="paymentsCalendar" className="card">
        <h3>Calendario de pagos</h3>
        { renderBalance() }
        <PaymentCalendar payments={ userData?.payments }/>
      </section>
      <section id="positionPreference" className="card">
        <PositionPreference player={ userData } sendData={ sendData }/>
      </section>
    </div>
  )
}

const PositionPreference = ({player, sendData}: {player: TPlayer | undefined, sendData: Function }) => {
  const DEFAULT_POSITIONS = ["EXT","OP","CO","CE","LIB"]
  const [ hasChanges, setHasChanges] = useState(false)
  const [state, setState] = useState<{choosen: string}[]>(player?.preferedPositions || [])


  useEffect( () => {
    const result = isTheSame(player?.preferedPositions, state)
    result ? setHasChanges(false) : setHasChanges(true)
  },[state, player])

  useEffect(() =>{
    if (player?.preferedPositions?.length) setState(player.preferedPositions)
  },[player])

  const handleSubmit = () => {
    sendData("user/updateOwnBasicData", { preferedPositions: state })
  }
  const handleReset = () => {
    if (player) setState(player.preferedPositions)
  }
  const updateChoosen = (value: string, index: number) => {
    setState(state => [...state.slice(0, index), { choosen: value }])
  }

  const isInList = (ele: string, index: number) => {
    if (!state || !state.length || !state[index]) return false
    return state[index].choosen === ele
  }
  const generateRow = () => {
    const list = [...state]

    const l = list.reduce((cumulator, current, index) => {
      const left = cumulator[index].filter(e => e !== current.choosen)
      if (!left.length) return cumulator
      return [...cumulator, left]
    },[[...DEFAULT_POSITIONS]])
    
    return l.map((e, index) => (
      <li key={ index }>
        <label>{ index + 1 }</label>
        <div className="radio-group">
          { e.length && e.map(ele => (
            <input
              type="radio"
              value={ ele }
              name={ "choise-" + index }
              onChange={ () => updateChoosen(ele, index) }
              checked={ isInList(ele, index) }
              key={ ele }
            />
          )) }
        </div>
      </li>
    ))
  }
  return (
    <>
      <h3>Elija preferencia de posición</h3>
      <p className="extra-message">Seleccione de mayor deseo a menor</p>
      <ul>
        {generateRow()}
      </ul>
      { hasChanges && (
        <div className="buttons">
          <button className="btn color" onClick={ () => handleSubmit() }>Guardar</button>
          <button className="btn color red" onClick={ () => handleReset() }>Restablecer</button>
        </div>
      ) }
    </>
  )
}


const PaymentCalendar = ({payments}: {payments: TMonthFinancial[] | undefined}) => {
  const currYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currYear)

  const renderCalendar = () => {
    const yearPayments = payments?.filter(m => parseInt(m.monthYear.split("-")[0]) === selectedYear )

    if (!yearPayments || !yearPayments.length) return <p className="no-data">¡No hay historial de pagos en este período!</p>
  
    return (
      <div className="payments">
        { yearPayments.map(m => (
          <div className="month" key={m.monthYear}>
            <h5 className="name">{ getMonthNameFromMonthYear(m.monthYear) }</h5>
              { m.payments.map(payment => (
                <div className={ payment.isPaid !== "no" ? "payment paid" : "payment" } key={ payment.type }>
                  <p className="type">{ payment.type[0].toUpperCase() + payment.type.slice(1) }:</p>
                  <p className="qty">{ payment.qty }</p>
                </div>
              )) }
          </div>
        ) )}
      </div>
    )
  }
  const renderPrevButton = () => {
    if (selectedYear > currYear - 5) return <span className="prev year" onClick={ () => setSelectedYear(selectedYear - 1) }>&lt;</span>
  }
  const renderNextButton = () => {
    if (selectedYear < currYear + 5) return <span className="next year" onClick={ () =>  setSelectedYear(selectedYear + 1) }>&gt;</span>
  }

  return (
    <>
      <div className="yearHeader">
        {renderPrevButton()}
        <h3 className="year">{ selectedYear }</h3>
        {renderNextButton()}
      </div>
      {renderCalendar()}
    </>
  )
}

const BasicInfo = ({p, sendData}: {p: TPlayer, sendData: Function}) => {

  const pf = prepareFormState(p)
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState(pf)

  const handleSubmit = () => {
    const { preferedPositions, payments, ...data} = prepareToSend(formState.data) as TPlayer
    sendData("user/updateOwnBasicData", data)
  }
  const renderFile = () => {
    return (formState.data["photo-value"]) ? <ImagePreviewWithForm name="photo-value" label="Photo" />
      : <FileUploadWithForm name="photo-value" label="Photo" sizeLimit={ 500000 }/>
  }
  const renderButtons = () => {
    if (Object.entries(formState.data).every( ([key, value]) => isTheSame(value, pf[key as keyof typeof pf]) )) return null

    return (
      <div className="buttons">
        <button type="submit" className="btn full-width color">Guardar</button>
        <button type="reset" className="btn color red">Restablecer</button>
      </div>
    )
  }
  return (
    <FormContext.Provider value={ {formState, validate, registerInput, setFieldValue, resetForm} }>
    <Form
      className="basicInfo"
      id="basicInfoForm"
      onSubmit={() => handleSubmit() }
    >
      <div className="form-inline-elements">
        <TextInputForm
          name="nick-value"
          label="Nick en quedadas"
          validators={[requiredValidator]}
          placeholder="yarek"
        />
        <TickCustomValueForm
          name='nick-permisionGranted'
          label="Mostrar"
          validators={[]}
        />
      </div>
      <div className="form-inline-elements">
        <TextInputForm
          name="number-value"
          label="Dorsal"
          type="number"
          validators={ [checkRangeValidator( 1, 99, false )] }
          placeholder="10"
        />
        <TickCustomValueForm
          name="number-permisionGranted"
          label="Mostrar"
          validators={[]}
        />
      </div>
      <div className="form-inline-elements">
        <TextInputForm
          name="height-value"
          label="Altura (m)"
          type="number"
          validators={ [checkRangeValidator( 1.5, 2.2, true )] }
          placeholder="1.80"
        />
        <TickCustomValueForm
          name='height-permisionGranted'
          label="Mostrar"
          validators={[]}
        />
      </div>
      <div className="form-inline-elements">
        <TextInputForm
          name="weight-value"
          label="Peso (kg)"
          // type="number"
          validators={ [checkRangeValidator( 30, 130, false )] }
          placeholder="65"
        />
        <TickCustomValueForm
          name='weight-permisionGranted'
          label="Mostrar"
          validators={[]}
        />
      </div>
      <div className="form-inline-elements">
        <SelectInputForm
          name="dominantHand-value"
          label="Mano dominante"
          validators={[]}
          options={['Derecha', 'Izquierda', 'Amobos']}
        />
        <TickCustomValueForm
          name='dominantHand-permisionGranted'
          label="Mostrar"
          validators={[]}
        />
      </div>
      { renderFile() }
      { renderButtons() }
    </Form>
    </FormContext.Provider>
  )
}