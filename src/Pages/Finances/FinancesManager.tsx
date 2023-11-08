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
import { TMonthFinancial, TPayment, TPropertyWithPermission, TSponsor } from "shared/types"

export const FinanceManager = () => {
  const { isLogged } = useContext(UserContext)
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!isLogged()) return navigate("/login")
  },[isLogged, navigate])

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
const DownloadReport = (downloadPeriod: TDownloadPeriod, list: TPlayer[]) => {
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
  const GetUsefullData = (list: TPlayer[]) => {
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
  const [players] = useFetch<TPlayer[]>({ url: "admin/getAllUsersBalance", errorTitle: "Players Finance Downloader"})
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

type TPlayer = {
  memberID: string,
  nick: TPropertyWithPermission,
  isFemale: boolean,
  team: string,
  balance: string
  payments: TMonthFinancial[]
}


type PaymentContextType = {
  handleNewMonth: (monthYear: string) => void,
  handleNewPayment: (monthYear: string, payment: TPayment) => void,
  handleUpdatePayment: (payment: TPayment) => void,
  handleRemovePayment: (payment: TPayment) => void,
}
const PaymentContext = createContext<PaymentContextType>({
  handleNewMonth: () => {},
  handleNewPayment: () => {},
  handleUpdatePayment: () => {},
  handleRemovePayment: () => {},
})

const PlayersPayments = () => {
  const [players, sendData] = useFetch<TPlayer[]>({ url: "admin/getAllUsersBalance", errorTitle: "Finance Manager"})
  const [list, setList] = useState<TPlayer[]>(players || [])
  const [selectedFilter, setSelectedFilter] = useState("Todos")
  const [selectedPlayer, setSelectedPlayer] = useState<TPlayer | null>(null)
  const [showNewMonth, setShowNewMonth] = useState(false)

  useEffect(() => {
    if (!players) return 

    if (selectedPlayer) {
      const updatedPlayer = players?.find(p => p.memberID === selectedPlayer?.memberID)
      if (updatedPlayer) setSelectedPlayer(updatedPlayer)
    }
    switch(selectedFilter){
      case "Deudores": 
        return setList(players.filter(p => parseFloat(p.balance) < 0 ))
      case "Sobrepagos":
        return setList(players.filter(p => parseFloat(p.balance) > 0))
      default:
        return setList(players)
    }
  },[selectedFilter, players, selectedPlayer])

  const handleEdit = (player: TPlayer) => setSelectedPlayer(player)
  
  const handleSortSelection = (val: string) => {
    const propName = val as keyof TPlayer
    setList( [...list].sort( (a: TPlayer, b: TPlayer) => {
      const valA = val === "name" ? a.nick.value : a[propName] ? a[propName] : '0'
      const valB = val === "name" ? b.nick.value : b[propName] ? b[propName] : '0'
      return valA.toString().localeCompare(valB.toString(),'en', { numeric: (val === "name" || val ==="gender") ? false : true } )
    }) )
  }
  const handleNewMonth = (monthYear: string) => {
    if (selectedPlayer) sendData("admin/createUserFinancialMonth", { memberID: selectedPlayer.memberID, monthYear: monthYear })
  }
  const handleNewPayment = (monthID: string, payment: TPayment) => {
    const { type, qty, isPaid } = payment
    if (selectedPlayer) sendData("admin/createUserPayment", { memberID: selectedPlayer.memberID, month: { _id: monthID }, payment: { type: type, qty: qty, isPaid: isPaid }})
  }
  const handleUpdatePayment = (payment: TPayment) => {
    if (selectedPlayer) sendData("admin/updateUserPayment", { memberID: selectedPlayer.memberID, payment: payment })
  }
  const handleRemovePayment = (payment: TPayment) => {
    if (selectedPlayer) sendData("admin/deleteUserPayment", { memberID: selectedPlayer.memberID, payment: payment })
  }
  const handleFilterSelection = (val: string) => {
    if (val) setSelectedFilter(val)
  }

  return (
    <>
      <h3>Jugadores</h3>
      <Table id="financesManager">
        <SelectInput name="sortBy" label="Mostrar" value={ selectedFilter } onChange={ handleFilterSelection } options={["Todos","Deudores", "Sobrepagos"]}/>
        <div className="table-head">
          <p className="column"></p>
          <p className="column sort" onClick={() => handleSortSelection("memberID") }>ID</p>
          <p className="column sort" onClick={() => handleSortSelection("name") }>Nick</p>
          <p className="column">Género</p>
          <p className="column sort" onClick={() => handleSortSelection("team") }>Equipo</p>
          <p className="column sort" onClick={() => handleSortSelection("balance") }>€ Balance</p>
        </div>
        <div className="table-body">
          { list.map( (p, index) => (
            <div className="table-row" key={ p.memberID }>
              <div className="action column">
                <button className="btn color" onClick={ () => handleEdit(p) }>Editar</button>
              </div>
              <p className="column">{ p.memberID }</p>
              <p className="column">{ p.nick.value }</p>
              <p className="column">{ p.isFemale ? "Mujer" : "Hombre" }</p>
              <p className="column">{ p.team }</p>
              <p className="column">{ p.balance }</p>
            </div>
          )) }
        </div>
      </Table>
      { selectedPlayer && 
          <PaymentContext.Provider value={ { handleNewMonth, handleNewPayment, handleUpdatePayment, handleRemovePayment } }>
            <Modal onClose={() => setSelectedPlayer(null) }>
              <div id="paymentsDetails">
                <h5>Miembro: { selectedPlayer.memberID }</h5>
                { showNewMonth 
                  ? <NewMonthPicker setShowNewMonth={ setShowNewMonth }/>
                  : <button className="btn color addMonth" onClick={ () => setShowNewMonth(true) }>Nuevo mes</button> }
                <ul className="months">
                  { selectedPlayer.payments && selectedPlayer.payments.map( m => <Month month={ m } key={ m._id } />) }
                </ul>
              </div>
            </Modal>
          </PaymentContext.Provider> 
      }
    </>
  )
}
const NewMonthPicker = ({ setShowNewMonth }: {setShowNewMonth: Function }) => {
  const [monthYear, setMonthYear] = useState('')
  const regex = new RegExp(/^(20\d{2}|0(?!0)\d|[1-9]\d)-(1[0-2]|0[1-9])$/)
  const { handleNewMonth } = useContext(PaymentContext)
  const currentMonth = new Date().getMonth() + 1
  const currentYearMonth = ( new Date().getFullYear() ) + "-" + ( currentMonth < 10 ? `0${currentMonth}` : currentMonth )
  
  const handleAddNewMonth = (monthYear: string) => {
    setShowNewMonth(false)
    handleNewMonth(monthYear)
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setMonthYear(e.target.value)
  
  const renderButton = () => {
    return (!regex.test(monthYear)) 
      ? <button className="btn" onClick={ () => setShowNewMonth(false) } >Anular</button>
      : <button className="btn color" onClick={ () => handleAddNewMonth(monthYear) } >Agregar</button>
  }
  return (
    <div className="month">
      <input className="monthPicker date" name="start" type="month" min="2023-09" max={ currentYearMonth } placeholder="YYYY-MM" pattern="^(20\d{2}|0(?!0)\d|[1-9]\d)-(1[0-2]|0[1-9])$" onChange={ handleChange }/>
      { renderButton() }
    </div>
  )
}

const Month = ({month}: {month: TMonthFinancial}) => {
  const [showNewPayment, setShowNewPayment] = useState(false)

  return (
    <li className="month">
      <p className="date">{ month.monthYear }</p>
      <ul className="payments">
        { month.payments.map( p => <Payment p={ p } key={ p._id }/> ) }
        { showNewPayment && 
            <Payment 
              p={ { type: "otros", qty: 0 , isPaid: "no" } }
              monthID={ month._id }
              hideNewPayment = { setShowNewPayment }
            />
        }
      </ul>
      { !showNewPayment && <button className="btn full-width" onClick={() => setShowNewPayment(true) }>Agregar Nuevo Pago</button> }
    </li>
  )
}

const Payment = ({p, monthID, hideNewPayment}: {p: TPayment, monthID?: string, hideNewPayment?: Function}) => {
  const { handleNewPayment, handleUpdatePayment, handleRemovePayment } = useContext(PaymentContext)
  const [isEditing, setIsEditing] = useState(monthID ? true : false)
  const [hasChanges, setHasChanges] = useState(false)
  const [payment, setPayment] = useState(p)
  
  useEffect( () => {
    const result = Object.entries(payment).every( ([key, value]) => isTheSame(value, p[key as keyof TPayment]) )
    result ? setHasChanges(false) : setHasChanges(true)
  },[payment, p])

  const handleSubmitClick = () => {
    setIsEditing(false)
    if (monthID && hideNewPayment) {
      hideNewPayment(false)
      return handleNewPayment(monthID, payment)
    }
    return handleUpdatePayment(payment)
  }
  const handleRemoveClick = () => handleRemovePayment(payment)

  const handleSelectChange = (propName: string, val: string) => setPayment(state => ({ ...state, [propName]: val }))
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const propName = e.target.name
    const num = parseInt(val)
    if (isNaN(num)) return
    setPayment(state => ({ ...state, [propName]: num }))
  }

  const klass = monthID ? "new payment" : "payment"
  if (!isEditing) {
    return (
      <li className={ klass }>
        <button className="btn color" onClick={() => setIsEditing(true)}>Editar</button>
        <span>{ payment.type}</span>
        <span className="qty">{ payment.qty }</span>
        <span>{ payment.isPaid}</span>
        <button className="btn color red" onClick={ () => handleRemoveClick() }>x</button> 
      </li>
    )
  }
  return (
    <li className={ klass }>
      { hasChanges 
          ? <button className="btn color" onClick={ () => handleSubmitClick() }>Guardar</button>
          : <button className="btn" onClick={() => { hideNewPayment ? hideNewPayment(false) : setIsEditing(false) } }>Anular</button>
      }
      <SelectInput name="type" label="Tipo de pago" value={ payment.type } options={ ["afiliación", "equipación", "licencia", "otros"] } onChange={ (val: string) => handleSelectChange("type", val) } />
      <input type="number" min={ 0 } max={ 9999 } className="qty" name="qty" placeholder="cantidad" value={ payment.qty } pattern="^\d{4}$" onChange={ handleInputChange }/>
      <SelectInput name="isPaid" label="Forma de pago" value={ payment.isPaid } options={ ["no", "efectivo", "transferencia"] } onChange={ (val: string) => handleSelectChange("isPaid", val) } />
      { hasChanges && <button className="btn color red" onClick={ () => setPayment(p)}>Prev</button> }
    </li>
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
  const [ monthly, sendData] = useFetch({ url:"", errorTitle: "Monthly Payments" })
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
