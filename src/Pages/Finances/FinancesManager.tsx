import { Table } from "components/table/Table"
import "./FinancesManager.css"
import { useState, useContext, useEffect, createContext } from "react"
import { useFetch } from "utils/useFetch"
import { compareYearMonth } from "utils/time"
import { checkRangeValidator, requiredValidator } from "utils/validators"
import { isTheSame } from "utils/object"
import * as XLSX from 'xlsx'
import Modal from "components/modal/Modal"
import Form from "components/form/Form"
import { FormContext, useFormState } from "components/form/useFormState"
import { FileUploadWithForm, ImagePreviewWithForm } from "components/imageUploadWithPreview/ImageUpload"
import { TextInput, TextInputForm } from "components/TextInput/TextInput"
import { TickButton, TickButtonForm } from "components/tickButton/TickButton"
import { SelectInput } from "components/selectInput/SelectInput"
import { UserContext } from "utils/useUser"
import { useNavigate } from "react-router-dom"
import { TMonthFinancial, TPayment, TSponsor, TPlayer } from "shared/types"
import { sortedByPropName } from "utils/sort"

export const FinanceManager = () => {
  const { isLogged } = useContext(UserContext)
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!isLogged()) return navigate("/login")
  },[isLogged])

  return (
    <section>
      <h1>Área de Finanzas</h1>
      <p className="extra-message">Aquí están los ajustes de finanzas. Haga clic sobre (ID o Nick o Equipo o Saldo) para ordenar por esos valores</p>
      <div id="multiplePanels">
        <PlayersFinanceDownloader/>
        <AddMembershipFeeToTeamMembers/>
        <AutomaticActions/>
      </div>
      <PlayersPayments/>
      <SponsorManagement/>
    </section>
  )
}

type TDownloadPeriod = {
  start: string
  end: string
}
const DownloadReport = (downloadPeriod: TDownloadPeriod, list: TPlayerWithPaymentsBalance[]) => {
  const start = downloadPeriod.start
  const end = downloadPeriod.end
  const yearStart = parseInt(start.split('-')[0])
  if (isNaN(yearStart)) return 

  const monthStart = parseInt(start.split('-')[1])
  if (isNaN(monthStart)) return 

  const yearStop = parseInt(end.split('-')[0])
  if (isNaN(yearStop)) return 

  const monthStop = parseInt(end.split('-')[1])
  if (isNaN(monthStop)) return 

  const generateMonthsList = () => {
    const order = compareYearMonth(start, end)
    const listOfM = new Map<string, number>()

    for ( let year = yearStart; order ? year <= yearStop : year >= yearStop; order ? year++ : year-- ) {
      const mStart = (year === yearStart) ? monthStart : ( order ? 1 : 12 )
      const mStop = (year === yearStop) ? monthStop : ( order ? 12 : 1 )
      for (let month = mStart; order ? month <= mStop : month >= mStop; order ? month++ : month--) {
        listOfM.set(`${year}-${/^\d$/.test(month.toString()) ? '0' + month : month}`, 0)
      }
    }
    return listOfM
  }
  const GetUsefullData = (list: TPlayerWithPaymentsBalance[]) => {
    const start = new Date(downloadPeriod.start)
    const end = new Date(downloadPeriod.end)
    const listOfM = generateMonthsList()
    if (!listOfM) return //return Notification
    return list.map( e => {
  
      const eachMonthBalance = e.payments.reduce( (cumulator, curr) => {
        const monthYear = curr.monthYear
        const currDate = new Date(monthYear)
        if (currDate < start || currDate > end) return cumulator

        const monthBalance = curr.payments.reduce( (cumulator, curr) => curr.isPaid === "no" ? cumulator - curr.qty : cumulator, 0)
        return cumulator.set(monthYear, monthBalance)
      }, new Map<string, number>())

      const p: {[key: string]: string | number } = { ID: e.memberID, balance: e.balance }
      listOfM.forEach( (defaultValue, key) => {
        const playerMonthBalance = eachMonthBalance.get(key)
        p[key] = playerMonthBalance ? playerMonthBalance : defaultValue
      })
      return p
    })
  }

  return GetUsefullData(list)
}

const PlayersFinanceDownloader = () => {
  const [players] = useFetch<TPlayerWithPaymentsBalance[]>({ url: "admin/getAllUsersBalance", errorTitle: "Players Finance Downloader"})
  const regex = new RegExp(/^(20\d{2}|0(?!0)\d|[1-9]\d)-(1[0-2]|0[1-9])$/)
  const currentMonth = new Date().getMonth() + 1
  const currentYearMonth = ( new Date().getFullYear() ) + "-" + ( currentMonth < 10 ? `0${currentMonth}` : currentMonth )
  const [downloadPeriod, setDownloadPeriod] = useState<TDownloadPeriod>({start: currentYearMonth, end: currentYearMonth})

  const handleDownloadRaport = async () => {
    if (!players) return alert("There is no data to download!")
    const p = DownloadReport(downloadPeriod, players)
    if (!p) return // Set notification dates are incorrect
    const ws = XLSX.utils.json_to_sheet(p)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Players")
    XLSX.writeFile(wb, `reportOf_${downloadPeriod.start}_${downloadPeriod.end}.xlsx`)
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const propName = e.target.name
    setDownloadPeriod(state => ({
      ...state,
      [propName]: val
    }))
  }
  const renderButton = () => {
    if (regex.test(downloadPeriod.start) && regex.test(downloadPeriod.end)) return <button className="btn color" onClick={ handleDownloadRaport }>Descargar</button>
    return null
  }
  return (
    <fieldset className="dashed fit" id="downloadPeriod">
      <legend className="extra-message">Aquí puede elegir el período económico para descargar en formato de excel</legend>
      <input className="monthPicker" name="start" type="month" min="2023-09" max={ currentYearMonth } placeholder="YYYY-MM" pattern="^(20\d{2}|0(?!0)\d|[1-9]\d)-(1[0-2]|0[1-9])$" value={downloadPeriod.start || ''} onChange={handleChange}/>
      -
      <input className="monthPicker" name="end" type="month" min={ downloadPeriod.start || currentYearMonth } max={ currentYearMonth } placeholder="YYYY-MM" pattern="^(20\d{2}|0(?!0)\d|[1-9]\d)-(1[0-2]|0[1-9])$" value={downloadPeriod.end || ''} onChange={handleChange}/>
      { renderButton() }
    </fieldset>
  )
}

type TPlayerWithPaymentsBalance = TPlayer & { balance: string, payments: TMonthFinancial[], feeRedemption: boolean }


type PaymentContextType = {
  selectedPlayer?: TPlayerWithPaymentsBalance,
  sendData: (sendDataUrl: string, payload: any, headers?: { [key: string]: string;} | undefined) => Promise<boolean>
}
const PaymentContext = createContext<PaymentContextType>({
  selectedPlayer: undefined,
  sendData: function send() { return Promise.resolve(true) }
})

const PlayersPayments = () => {
  const [ players, sendData ] = useFetch<TPlayerWithPaymentsBalance[]>({ url: "admin/getAllUsersBalance", errorTitle: "Finance Manager"})
  const [ selectedFilter, setSelectedFilter ] = useState("Todos")
  const [ selectedPlayer, setSelectedPlayer ] = useState<TPlayerWithPaymentsBalance | null>(null)
  const [ sortBy, setSortBy ] = useState("memberID")
  const [ showNewMonth, setShowNewMonth ] = useState(false)

  const filterAndSort = (list: TPlayerWithPaymentsBalance[] | undefined, sortBy: string) => {
    if (!list) return []

    switch(selectedFilter){
      case "Deudores": 
        return sortedByPropName(list.filter(p => parseFloat(p.balance) < 0 ), sortBy)
      case "Sobrepagos":
        return sortedByPropName(list.filter(p => parseFloat(p.balance) > 0), sortBy)
      default:
        return sortedByPropName(list, sortBy)
    }
  }
  useEffect(() => {
    if (!selectedPlayer) return
    const updatedPlayer = players?.find(p => p._id === selectedPlayer?._id )
    updatedPlayer ? setSelectedPlayer(updatedPlayer) : setSelectedPlayer(null)
  }, [players])
  
  const handleSetFeeRedemption = async (feeRedemption: boolean) => {
    await sendData("admin/setUserFeeRedemption", { memberID: selectedPlayer?.memberID, feeRedemption: feeRedemption })
  }

  return (<>
    <h3>Jugadores</h3>
    <Table id="financesManager">
      <SelectInput name="sortBy" label="Mostrar" value={ selectedFilter } onChange={(val: string) => setSelectedFilter(val) } options={["Todos","Deudores", "Sobrepagos"]}/>
      <div className="table-head">
        <p className="column"></p>
        <p className="column sort" onClick={() => setSortBy("memberID") }>ID</p>
        <p className="column sort" onClick={() => setSortBy("nick") }>Nick</p>
        <p className="column gender">Género</p>
        <p className="column sort" onClick={() => setSortBy("underAge") }>Menor</p>
        <p className="column team sort" onClick={() => setSortBy("team") }>Equipo</p>
        <p className="column sort" onClick={() => setSortBy("feeRedemption") }>Redencion</p>
        <p className="column sort" onClick={() => setSortBy("balance") }>€ Balance</p>
      </div>
      <div className="table-body">
        { filterAndSort(players, sortBy).map( (p, index) => (
          <div className="table-row" key={ p.memberID }>
            <button className="action column btn color" onClick={ () => setSelectedPlayer(p) }>Editar</button>
            <p className="column">{ p.memberID }</p>
            <p className="column">{ p.nick }</p>
            <p className="column gender">{ p.isFemale ? "Mujer" : "Hombre" }</p>
            <p className="column">{  !!p.underAge ? "Sí" : "No" }</p>
            <p className="column team">{ p.team }</p>
            <p className="column">{  !!p.feeRedemption ? "Sí" : "No" }</p>
            <p className="column">{ p.balance }</p>
          </div>
        )) }
      </div>
    </Table>
    { selectedPlayer ?
        <PaymentContext.Provider value={ {sendData, selectedPlayer} }>
          <Modal onClose={() => setSelectedPlayer(null) }>
          <div id="paymentsDetails">
            <h5>Miembro: { selectedPlayer.memberID } {selectedPlayer.nick ? `(${selectedPlayer.nick})` : null}</h5>
            <div id="options">
              <TickButton label="Redención de cuota de miembro" value={ selectedPlayer.feeRedemption } onChange={(val: boolean) => handleSetFeeRedemption(val)} className="" />
              { showNewMonth 
                ? <NewMonthPicker setShowNewMonth={ setShowNewMonth }/>
                : <button className="btn" onClick={ () => setShowNewMonth(true) }>Nuevo mes</button> }
            </div>
            <MonthScroll months={ sortedByPropName(selectedPlayer.payments, "monthYear", true) } />
          </div>
          </Modal>
        </PaymentContext.Provider> 
      : null }
  </>)
}
const NewMonthPicker = ({ setShowNewMonth }: {setShowNewMonth: Function }) => {
  const [monthYear, setMonthYear] = useState('')
  const regex = new RegExp(/^(20\d{2}|0(?!0)\d|[1-9]\d)-(1[0-2]|0[1-9])$/)
  const { sendData, selectedPlayer } = useContext(PaymentContext)
  const currentMonth = new Date().getMonth() + 1
  const currentYearMonth = ( new Date().getFullYear() ) + "-" + ( currentMonth < 10 ? `0${currentMonth}` : currentMonth )
  
  const handleNewMonth = async (monthYear: string) => {
    await sendData("admin/createUserFinancialMonth", { memberID: selectedPlayer?.memberID, monthYear: monthYear })
    setShowNewMonth(false)
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setMonthYear(e.target.value)
  
  const renderButton = () => {
    return (!regex.test(monthYear)) 
      ? <button className="btn" onClick={ () => setShowNewMonth(false) } >Anular</button>
      : <button className="btn color" onClick={ () => handleNewMonth(monthYear) } >Agregar</button>
  }
  return (
    <div className="month">
      <input className="monthPicker date" name="start" type="month" min="2023-09" max={ currentYearMonth } placeholder="YYYY-MM" pattern="^(20\d{2}|0(?!0)\d|[1-9]\d)-(1[0-2]|0[1-9])$" onChange={ handleChange }/>
      { renderButton() }
    </div>
  )
}

const MonthScroll = ({months}: {months: TMonthFinancial[]}) => {
  const [ monthIndex, setMonthIndex ] = useState(0)
  const { sendData, selectedPlayer } = useContext(PaymentContext)
  
  const handleNewPayment = async (monthID: string, payment: TPayment) => {
    const { type, qty, isPaid } = payment
    await sendData("admin/createUserPayment", { memberID: selectedPlayer?.memberID, month: { _id: monthID }, payment: { type: type, qty: qty, isPaid: isPaid }})
  }
  const renderPrevButton = () => {
    if (monthIndex > 0) return <span className="prev year" onClick={ () => setMonthIndex(state => state - 1) }>&lt;</span>
  }
  const renderNextButton = () => {
    if (monthIndex < months.length - 1) return <span className="next year" onClick={ () =>  setMonthIndex(state => state + 1) }>&gt;</span>
  }
  return (
    <div>
      <div id="monthHeader">
        {renderPrevButton()}
        <h3 className="year">{ months[monthIndex].monthYear }</h3>
        {renderNextButton()}
      </div>
      <div className="month">
        <div id="payments">
          { months[monthIndex].payments.map( payment => <Payment payment={ payment }  key={ payment._id }/> ) }
        <button className="btn full-width" onClick={() => handleNewPayment(months[monthIndex]._id, {type: "afiliación", qty: 0, isPaid: "no"}) }>Agregar Nuevo Pago</button>
        </div>
      </div>
    </div>
  )
}

const Payment = ({payment}: {payment: TPayment}) => {
  const [ editing, setEditing ] = useState<TPayment | null>(null)
  const { sendData, selectedPlayer } = useContext(PaymentContext)

  const handleUpdatePayment = async () => {
    if (!editing) return null
    await sendData("admin/updateUserPayment", { memberID: selectedPlayer?.memberID, payment: editing })
    setEditing(null)
  }
  const handleRemovePayment = async () => {
    await sendData("admin/deleteUserPayment", { memberID: selectedPlayer?.memberID, payment: payment })
  }

  const handleSelectChange = (propName: string, val: string) => editing ? setEditing({ ...editing, [propName]: val }) : null
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const propName = e.target.name
    const num = parseInt(val)
    if (isNaN(num) || !propName ) return null
    if (editing) setEditing({ ...editing, [propName]: num })
  }

  const renderButtons = () => {
    if (!editing) return <button className="btn color" onClick={() => setEditing(payment)}>Editar</button> 
    const result = Object.entries(editing).every( ([key, value]) => isTheSame(value, payment[key as keyof TPayment]) )
    if (result) return <button className="btn" onClick={() => setEditing(null)}>Anular</button>
    return <button className="btn color" onClick={() => handleUpdatePayment()}>Guardar</button>
  }
  const renderEditable = () => {
    if (editing) return (<>
      <SelectInput name="type" label="Tipo de pago" value={ editing.type } options={ ["afiliación", "equipación", "licencia", "otros"] } onChange={ (val: string) => handleSelectChange("type", val) } /> 
      <div className="form-group">
        <label>Importe</label>
        <input type="number" min={ 0 } max={ 9999 } className="qty" name="qty" placeholder="cantidad" value={ editing.qty } pattern="^\d{4}$" onChange={ handleInputChange }/>
      </div>
      <SelectInput name="isPaid" label="Pagado" value={ editing.isPaid } options={ ["no", "efectivo", "transferencia"] } onChange={ (val: string) => handleSelectChange("isPaid", val) } />
      <button className="btn color red" onClick={() => setEditing(payment)}>Prev</button>
    </>)
    return (<>
      <span>{ payment.type }</span>
      <span className="qty">{ payment.qty }</span>
      <span>{ payment.isPaid }</span>
      <button className="btn color red" onClick={() => handleRemovePayment()}>x</button>
    </>)
  }
  return (
    <div className="payment">
      <div className="editable">
        { renderButtons() }
        { renderEditable() }
      </div>
      <div className="userReading extra-message">
        <span>Información de pago:</span>
        <span>{ payment.transferDate }</span>
        <span>{ payment.transferID }</span>
      </div>
    </div>
  )
}

type TStatusMonthlyPayments = {
  status: boolean
}

const AutomaticActions = () => {
  const [monthlyPaymentStatus, setStatus] = useFetch<TStatusMonthlyPayments>({ url:"admin/statusMonthlyPayment", errorTitle: "Monthly Payments" })
  const handleMonthlyPaymentsToggle = (val: boolean) => setStatus("admin/setMonthlyPayment", { automaticMonthlyPayment: val })
  
  return (
    <fieldset className="dashed fit" id="automaticActions">
      <legend className="extra-message">Acciones automaticos</legend>
      <TickButton className="toggle" label="Cuota de membresía automática:" value={ monthlyPaymentStatus?.status || false } onChange={ handleMonthlyPaymentsToggle }/>
    </fieldset>
  )
}

const AddMembershipFeeToTeamMembers = () => {
  const [ , sendData] = useFetch({ url:"", errorTitle: "Monthly Payments" })
  const [ membershipFee, setMembershipFee ] = useState(30)
  
  const handleAddMensualidadToTeamMembers = () => {
    if (membershipFee) sendData("admin/addMensualidadToPlayersWithTeam", {membershipFee: membershipFee})
  }

  return (
    <fieldset className="dashed fit" id="manualMembershipFee">
      <legend className="extra-message">Añadir mensualidad a todos los miembros con equipo</legend>
      <TextInput 
        name="menusalidad"
        type="number"
        label=""
        placeholder="30"
        value={ membershipFee.toString() }
        onChange={(val: number) => setMembershipFee(val)}
        errors={[]}
      />
      <button className="btn color" onClick={() => handleAddMensualidadToTeamMembers()}>Añadir mensualidad</button>
    </fieldset>
  )
}

type SponsorContextType = {
  handleNewSponsor: (sponsor: TSponsor) => void,
  handleUpdateSponsor: (sponsor: TSponsor) => void,
}
const SponsorContext = createContext<SponsorContextType>({
  handleNewSponsor: () => {},
  handleUpdateSponsor: () => {},
})
const SponsorManagement = () => {
  const [sponsors, sendData, fetchData] = useFetch<TSponsor[]>({ url: "admin/getAllSponsors", errorTitle: "Sponsors Manager"})
  const [list, setList] = useState<TSponsor[]>(sponsors || [])
  const [selectedSponsor, setSelectedSponsor] = useState<TSponsor | null>(null)

  useEffect(() => {
    setList(sponsors || [])
  },[sponsors])

  const handleRemove = (p: TSponsor) => {
    const r = window.confirm("Are you sure? Sponsor will be removed permanently!!")
    if (r) sendData("admin/deleteSponsor", {_id: p._id})
  }
  const handleSortSelection = (val: "name" | "contribution") => {
    const newList = [...list]
    newList.sort( (a: TSponsor, b: TSponsor) => {
      const valA = a[val]
      const valB = b[val]
      if (!valA || !valB) return 0
      return valA.toString().localeCompare(valB.toString(),'en') 
    }
    )
    setList(newList)
  }
  const handleCloseModal = () => {
    setSelectedSponsor(null)
    fetchData("admin/getAllSponsors")
  }
  const handleNewSponsor = (s: TSponsor) => {
    setSelectedSponsor(null)
    sendData("admin/createSponsor", s)
  }
  const handleUpdateSponsor = (s: TSponsor) => {
    setSelectedSponsor(null)
    sendData("admin/updateSponsor", s)
  }
  const renderSponsors = () => {
    if (!list || !list.length) return <p className="no-data">No hay ningun patrocinador disponible en este momento</p>
    
    return list.map( p => (
      <div className="table-row" key={ p._id }>
        <div className="action column">
          <button className="btn color" onClick={ () => setSelectedSponsor(p) }>Editar</button>
        </div>
        <p className="column">{ p.name }</p>
        <p className="column">{ p.contribution }</p>
        <p className="column">{ p.isMain ? "Sí" : "No" }</p>
        <p className="column link">{ p.link }</p>
        <p className="column">{ p.logo ? "Sí" : "No" }</p>
        <div className="action column">
          <button className="btn color red" onClick={() => handleRemove(p) }>x</button>
        </div>
      </div>
    ))
  }
  
  return (
    <>
      <h3>Patrocinadores</h3>
      { !selectedSponsor && <button className="btn" onClick={() => setSelectedSponsor({ name: '' })}>Agregar nuevo patrocinador</button> }
      { selectedSponsor && 
          <SponsorContext.Provider value={ { handleNewSponsor, handleUpdateSponsor} }>
            <Modal onClose={ handleCloseModal }>
              <Details s={ selectedSponsor } hideNewSponsor={ setSelectedSponsor } />
            </Modal>
          </SponsorContext.Provider> 
      }
      <Table id="sponsorsManager">
        <div className="table-head">
          <p className="column"></p>
          <p className="column sort" onClick={() => handleSortSelection("name") }>Nombre</p>
          <p className="column sort" onClick={() => handleSortSelection("contribution") }>€</p>
          <p className="column">Principal</p>
          <p className="column link">Link</p>
          <p className="column">Logo</p>
          <p className="column"></p>
        </div>
        <div className="table-body">
          { renderSponsors() }
        </div>
      </Table>
      
    </>
  )
}

const Details = ({s, hideNewSponsor}: {s: TSponsor, hideNewSponsor: Function}) => {
  const { handleNewSponsor, handleUpdateSponsor } = useContext(SponsorContext)
  const [hasChanges, setHasChanges] = useState(false)
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState(s)

  useEffect( () => {
    const result = Object.entries(formState.data).every( ([key, value]) => isTheSame(value, s[key as keyof TSponsor]) )
    result ? setHasChanges(false) : setHasChanges(true)
  },[formState, s])

  const handleSubmit = () => {
    const data = formState.data as TSponsor
    (s._id) ? handleUpdateSponsor(data) : handleNewSponsor(data) 
  }
  const renderFile = () => {
    return (formState.data.logo) ? <ImagePreviewWithForm name="logo" />
      : <FileUploadWithForm name="logo"/>
  }
  return (
    <FormContext.Provider value={ { formState, validate, registerInput, setFieldValue, resetForm } }>
    <Form
      id="details"
      className="sponsor"
      onSubmit={ handleSubmit }
      onReset={ () => hideNewSponsor(null) }
    >

      <h4>Detalles de partrocinador</h4>
      <TextInputForm
        name="name"
        label="Nombre"
        placeholder="AlgoNuevo"
        type="text"
        validators={ [requiredValidator] }
      />
      <TextInputForm
        name="contribution"
        label="Contribution"
        placeholder="300"
        type="number"
        validators={ [checkRangeValidator( 1, 9999, false )] }
      />
      <TickButtonForm 
        name="isMain" 
        label="Principal" 
        validators={ [] }
      />
      <TextInputForm
        name="link"
        label="Link"
        placeholder="ejemplo.es"
        type="text"
        validators={[]}
      />
      { renderFile() }
      { (!hasChanges) 
          ? <button type="reset" className="btn full-width">Anular</button>
          : <button type="submit" className="btn color  full-width">Guardar</button> }
    </Form>
    </FormContext.Provider>
  )
}
