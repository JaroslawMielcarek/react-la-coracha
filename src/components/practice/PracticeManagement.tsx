import "./PracticeManagement.css"
import { useState } from "react"
import { Table } from "components/table/Table"
import Modal from "components/modal/Modal"
import Form from "components/form/Form"
import { FormContext, useFormState } from "components/form/useFormState"
import { TextInputForm } from "components/TextInput/TextInput"
import { checkRangeValidator, requiredValidator } from "utils/validators"
import { useFetch } from "utils/useFetch"
import { getByTimeRange, isTheSame, prepareFormState, prepareToSend } from "utils/object"
import { getDayOfWeek } from "utils/time"
import { SelectInput } from "components/selectInput/SelectInput"
import { TDateTime ,TPlayerPractice, TPlayerSubscribed, TPractice, TPracticePlayer } from "shared/types"
import { sortedByPropName } from "utils/sort"


const ListFullness = (list: TPlayerSubscribed[], limit: number, className: string) => {
  const klass = list.length >= limit - 2 ? className + " closeToLimit" : className
  return <p className={ klass }><b>{ list.length }</b>/ { limit }</p>
} 

export const PracticeManagement = () => {
  const [ practices , sendData ] = useFetch<TPractice[]>({url: "user/getAllPractices", errorTitle: "Teams Manager" })
  const [ sortBy, setSortBy ] = useState("name")
  const [ selectedFilter, setSelectedFilter ] = useState("Todo")
  const [ selected, setSelected ] = useState<TPractice | null>(null)
 
  const handleRemove = (practice: TPractice) => {
    if (!window.confirm(`Are you sure! All information about practice on: ${practice.dateTime.date} at ${practice.dateTime.time}  will be permanently lost!`)) return null
    sendData("moderator/deletePractice", practice)
  }
  const handleFilterSelection = (val: string) => {
    if (val) setSelectedFilter(val)
  }

  const sortListBy = (val: string): TPractice[] => {
    const propName = val as keyof TDateTime
    if (!practices || !practices.length) return []
    let list = [...practices]
    switch(selectedFilter){
      case "Semana":
        list = getByTimeRange(practices, "week")
        break
      case "Mes actual":
        list = getByTimeRange(practices, "month")
        break
      case "Temporada":
        list = getByTimeRange(practices, "season")
        break
    }
    return list.sort( (a: TPractice, b: TPractice) => {
      const valA = a.dateTime[propName]
      const valB = b.dateTime[propName]
      if (!valA || !valB) return 0
      return valA.toString().localeCompare(valB.toString(),"en" )
    })
  }

  const Practice = (practice: TPractice) => {
    const practiceDate = new Date(practice.dateTime.date).toLocaleDateString().split("/")
    return (
      <div className="table-row">
        <div className="column action">
          <button className="btn color" onClick={() => setSelected(practice)}>Editar</button>
        </div>
        <p className="column dayName">{ getDayOfWeek(practice.dateTime.date) }</p>
        <div className="column">
          <div className="date">
            <p className="day">{ practiceDate[0] }</p>
            <p className="month">{ practiceDate[1] }</p>
            <p className="year">{ practiceDate[2] }</p>
            </div>
        </div>
        <p className="column">{ practice.dateTime.time }</p>
        <p className="column">{ practice.location }</p>
        { ListFullness( practice.players, practice.playersLimit, "column" )}
        <div>
          <button className="btn color red" onClick={() => handleRemove(practice)}>x</button>
        </div>
      </div>
    )
  }
  function renderElements (list: TPractice[]) {
    if (!list.length) return <p className="no-data">No hay nada en periodo elegido</p>
    return list.map( practice => <Practice { ...practice } key={ practice._id}/>)
  }
  return (
    <div id="practiceManagement">
      <button id="newTeam" className="btn white" onClick={() => setSelected( { dateTime: {date: "", time: ""}, location: "IES Campanillas", players: [], playersLimit: 0, percentOcupied: 0 } ) }>Crear nueva Quedada</button>
      <Table>
        <SelectInput name="sortBy" label="Mostrar" value={ selectedFilter } onChange={handleFilterSelection} options={["Todo","Semana","Mes actual",'Temporada']}/>
        <div className="table-head">
          <p className="column action"></p>
          <p className="column dayName">Dia</p>
          <p className="column sort" onClick={ () => setSortBy("date") }>Fecha</p>
          <p className="column sort" onClick={ () => setSortBy("time") }>Hora</p>
          <p className="column">Ubication</p>
          <p className="column">Occ.</p>
          <p className="column"></p>
        </div>
        <ul>
        { renderElements(sortListBy(sortBy)) }
        </ul>
      </Table>
      { selected &&
          <Modal onClose={() => setSelected(null) }>
            <Details initVal={ selected } sendData={ sendData } hideDetails={ () => setSelected(null)}/>
          </Modal>
      }
    </div>
  )
}

const Details = ({initVal, sendData, hideDetails}: {initVal: TPractice, sendData: Function, hideDetails: Function}) => {
  const [ clubPlayers ] = useFetch<TPracticePlayer[]>({url: "moderator/getAllPlayersForPractice", errorTitle: "Teams Manager Players download"})
  const [ players, setPlayers ] = useState<TPlayerSubscribed[]>(initVal?.players || [])
  const dataForState = prepareFormState(initVal)
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState(dataForState)

  const handleTogglePlayer = (player: TPracticePlayer) => {
    const p = {_id: player._id, nick: player.nick.value, preferedPositions: player.preferedPositions}
    const exist = players.find(p => p._id === player._id)
    exist ? setPlayers(players.filter(p => p._id !== player._id)) : setPlayers([...players, p])
  }
  const handleSubmit = async () => {
    const data = prepareToSend<TPractice>(formState.data)
    if (!data) return null
    data.players = players
    const r = data._id ? await sendData("moderator/updatePractice", data) : await sendData("moderator/createPractice", data)
    if (r) hideDetails() 
  }
  const handleResetForm = () => {
    resetForm()
    if (initVal.players) setPlayers(initVal.players)
  }
  const checkIfSubscribed = (player: TPracticePlayer) => {
    return !!players.find(p => p._id === player._id)
  }
  const renderButtons = () => {
    const allSame = Object.entries(formState.data).every( ([key, value]) => isTheSame(value, dataForState[key as keyof typeof dataForState]) )
    const difference = initVal.players?.filter( p => !players.find(pf => pf._id === p._id) ).concat(players.filter(tp => !initVal.players?.find(ip => ip._id === tp._id))).length
    if ( allSame && !difference ) return <button className="btn full-width" type="button" onClick={ () => hideDetails() }>Anular</button>
    return (
      <>
        <button className="btn full-width color" type="submit">Guardar</button>
        <button className="btn color red" type="reset">Restablecer</button>
      </>
    )
  }
  return (
    <FormContext.Provider value={ { formState, validate, registerInput, setFieldValue, resetForm } }>
    <Form 
      id="details"
      className=""
      onSubmit={() => handleSubmit() }
      onReset={() => handleResetForm() }>
      <h4>Detalles de la quedada</h4>
      <TextInputForm name="dateTime-date" type="date" label="Fecha" validators={ [requiredValidator]}/>
      <TextInputForm name="dateTime-time" type="time" label="Hora" validators={ [requiredValidator]}/>
      <TextInputForm name="location" label="Ubication" type="text" validators={ [requiredValidator] }/>
      <TextInputForm name="playersLimit" label="Limite de Jugadores" type="number" validators={ [requiredValidator, checkRangeValidator(6, 24, false)] }/>
      <fieldset className="dashed">
        <legend>Jugadores - disponibles</legend>
        <p className="extra-message">Toggle para agregar a la práctica</p>
        <div className="playerList">
          { clubPlayers && sortedByPropName(clubPlayers, "memberID").map(p => <PlayerButton player={ p } isSubscribed={ checkIfSubscribed(p) } onClick= {() => handleTogglePlayer(p) } key={ p._id }/>) }
        </div>
      </fieldset>
      <div className="buttons">
        { renderButtons() }
      </div>
    </Form>
    </FormContext.Provider>
  )
}

const renderPreferedPositions = (player: TPracticePlayer) => {
 if (!player.preferedPositions.length) return null
 return (
  <div className='prefPosition'>
    <p>Preferencia</p>
    <div className="prefList">
    { player.preferedPositions.map(position => <span className="extra-message" key={ position.choosen }>{ position.choosen }</span> )}
    </div>
  </div>
 )
}
const renderPracticeStats = (player: TPracticePlayer) => {
  if (!player || !player.practices || !player.practices.attended) return null
  return (
    <>
      <p>Estatisticas</p>
      <div className='practice-stats'>
        { Object.entries(player.practices.positionsPlayed).map(([position, value]) => 
          <div key={ position.toString() }>
            <span className="position-bar" style={ {height: calcHeight(value, player.practices?.attended) + 'px'} }/>
            <p>{ position.toString() }</p>
          </div>
        )}
      </div>
    </>
  )
}
const PlayerButton = ({player, isSubscribed,  onClick}: {player: TPracticePlayer, isSubscribed: boolean, onClick: Function}) => {
  let klass = "btn playerButton " + checkStrikes(player.practices)
  if (isSubscribed) klass += " checked"
  return (
    <div className={ klass } onClick={ () => onClick(player) }>
      <p>{ player.memberID }</p>
      <p className="extra-message">{ player.nick?.value }</p>
      { renderPreferedPositions(player) }
      { renderPracticeStats(player) }
    </div>
  )
}

function calcHeight (value: number, total: number | undefined): number {
  if (!total) return 0 
  const percent = ((value * 100) / total).toFixed(0)
  return parseFloat(percent) * 0.01 * 20 // 20 is max-height of 20px
}

function checkStrikes (practices: TPlayerPractice | undefined) {
  if (practices && practices.strikes) {
    if (practices.strikes.qty === 1) return 'single-strike'
    if (practices.strikes.qty === 2) return 'double-strike'
    if (practices.strikes.qty === 3) return 'tripple-strike'
  }
  return ''
}