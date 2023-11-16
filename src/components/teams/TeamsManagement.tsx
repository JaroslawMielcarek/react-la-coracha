import "./TeamsManagement.css"
import { useEffect, useContext, useState } from "react"
import { Table } from "components/table/Table"
import Modal from "components/modal/Modal"
import Form from "components/form/Form"
import { FormContext, useFormState } from "components/form/useFormState"
import { TextInputForm } from "components/TextInput/TextInput"
import { SelectInputForm } from "components/selectInput/SelectInput"
import { TextAreaInputForm } from "components/TextInput/TextAreaInput"
import { FileUploadWithForm, ImagePreviewWithForm } from "components/imageUploadWithPreview/ImageUpload"
import { requiredValidator } from "utils/validators"
import { useFetch } from "utils/useFetch"
import { isTheSame } from "utils/object"
import { UserContext } from "utils/useUser"
import { TTeam, TPlayer } from "shared/types"
import { sortedByPropName } from "utils/sort"

const MAX_NUMBER_OF_PLAYERS = 16

function ListFullness(list: TPlayer[], className: string) {
  const klass = list.length >= MAX_NUMBER_OF_PLAYERS - 2 ? className + " closeToLimit" : className
  return <p className={ klass }><b>{ list.length }</b>/ { MAX_NUMBER_OF_PLAYERS }</p>
} 
export const TeamsManagement = () => {
  const [ teams , sendData ] = useFetch<TTeam[]>({url: "moderator/getAllTeams", errorTitle: "Teams Manager" })
  const [ sortBy, setSortBy] = useState("name")
  const { isAdmin } = useContext(UserContext)
  const [ selectedTeam, setSelectedTeam ] = useState<TTeam | null>(null)

  const handleRemoveTeam = (team: TTeam) => {
    if (!window.confirm(`Are you sure! All information about: ${team.name.toUpperCase()} will be permanently lost!`)) return null
    sendData("moderator/deleteTeam", team)
  }
  const Team = (team: TTeam) => {
    return (
      <div className="table-row">
        <div className="column action">
          <button className="btn color" onClick={() => setSelectedTeam(team)}>Editar</button>
        </div>
        <p className="column name">{ team.name }</p>
        <p className="column">{ team.league }</p>
        <p className="column">{ team.gender }</p>
        <p className="column">{ team.logo? "Si" : "No" }</p>
        { team.players && ListFullness( team.players, "column" )}
        <div>
          <button className="btn color red" onClick={() => handleRemoveTeam(team)}>x</button>
        </div>
      </div>
    )
  }
  return (
    <div id="teamsManagement">
      { isAdmin() && <button id="newTeam" className="btn white" onClick={() => setSelectedTeam({name: '', gender: "Male", players: [], coach: ''}) }>Crear nuevo Equipo</button> }
      <Table>
        <div className="table-head">
          <p className="column action"></p>
          <p className="column name sort" onClick={ () => setSortBy("name") }>Nombre</p>
          <p className="column sort" onClick={ () => setSortBy("league") }>Liga</p>
          <p className="column sort" onClick={ () => setSortBy("gender") }>Género</p>
          <p className="column">Logo</p>
          <p className="column">Occ.</p>
          <p className="column"></p>
        </div>
        <ul>
        { teams && sortedByPropName(teams, sortBy).map( team => <Team { ...team } key={ team._id }/>) }
        </ul>
      </Table>
      { selectedTeam &&
        <Modal onClose={() => setSelectedTeam(null) }>
          <TeamDetails t={ selectedTeam }  sendData={ sendData } hideDetails={ () => setSelectedTeam(null)}/>
        </Modal>
      }
    </div>
  )
}

function sameGenderAsTeam(isFemale: boolean, selectedGender: string | undefined ) {
  if (!selectedGender) return false
  if ((selectedGender === "Male" && !isFemale) || (selectedGender === "Female" && isFemale) || selectedGender === "Mix") return true
  return false
}
const TeamDetails = ({t, sendData, hideDetails}: {t: TTeam, sendData: Function, hideDetails: Function}) => {
  const [ clubPlayers ] = useFetch<TPlayer[]>({url: "moderator/getAllPlayers", errorTitle: "Teams Manager Players download"})
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState(t)
  const [ teamPlayers, setTeamPlayers ] = useState<TPlayer[]>(t.players || [])
  const [ playersWitoutTeam, setPlayersWitoutTeam ] = useState<TPlayer[]>([])

  useEffect( () => {
    if(clubPlayers) setPlayersWitoutTeam( clubPlayers.filter(p => !p.team && sameGenderAsTeam(p.isFemale, formState.data?.gender?.toString()) ))
  }, [clubPlayers, formState.data.gender])
  
  const handleRemovePlayerFromTeam = (player: TPlayer) => {
    setTeamPlayers(teamPlayers.filter(p => p._id !== player._id))
    setPlayersWitoutTeam([...playersWitoutTeam, player])
  }
  const handleAddPlayerToTeam = (player: TPlayer) => {
    setTeamPlayers([...teamPlayers, player])
    setPlayersWitoutTeam(playersWitoutTeam?.filter(p => p._id !== player._id))
  }
  const handleSubmit = async () => {
    const data = formState.data as TTeam
    if (!data) return

    const coach = clubPlayers?.find(p => p.nick === data.coach)
    data.coach = coach ? coach._id : ''
    const assistant = clubPlayers?.find(p => p.nick === data.assistant)
    data.assistant = assistant ? assistant._id : ''

    const r = data._id ? await sendData("moderator/updateTeam", {...data, players: teamPlayers}) : await sendData("moderator/createTeam", {...data, players: teamPlayers})
    if (r) hideDetails()
  }
  const handleResetForm = () => {
    resetForm()
    if (t.players) setTeamPlayers(t.players)
    if (clubPlayers) setPlayersWitoutTeam( clubPlayers.filter(p => !p.team && sameGenderAsTeam(p.isFemale, formState.data?.gender?.toString())))
  }
  const renderFile = () => {
    return (formState.data.logo) ? <ImagePreviewWithForm name="logo" />
      : <FileUploadWithForm name="logo"/>
  }
  const renderButtons = () => {
    const result = Object.entries(formState.data).every( ([key, value]) => isTheSame(value, t[key as keyof TTeam]) )
    const difference = t.players?.filter( p => !teamPlayers.includes(p) ).concat(teamPlayers.filter(tp => !t.players?.includes(tp))).length
    const hasChanges =  !(result && !difference)
    if (!hasChanges) return <button className="btn full-width" type="button" onClick={ () => hideDetails() }>Anular</button>
    return (<>
        <button className="btn full-width color" type="submit">Guardar</button>
        <button className="btn color red" type="reset">Restablecer</button>
      </>)
  }
  return (
    <FormContext.Provider value={ { formState, validate, registerInput, setFieldValue, resetForm } }>
    <Form 
      id="teamDetails"
      className=""
      onSubmit={() => handleSubmit() }
      onReset={() => handleResetForm() }>
      <h4>Team { t.name }</h4>
      <TextInputForm name="name" label="Nombre" placeholder="Bees" validators={ [requiredValidator] }/>
      <TextInputForm name="league" label="Liga" placeholder="Afade" validators={ [] }/>
      <SelectInputForm name="gender" label="Género" options={["Female", "Male", "Mix"]} validators={ [requiredValidator] }/>
      <SelectInputForm name="coach" label="Entrenador" options={clubPlayers?.filter(p => p.nick).map(p => p.nick)} validators={ [requiredValidator] }/>
      <SelectInputForm name="assistant" label="Asistente" options={clubPlayers?.filter(p => p.nick).map(p => p.nick).concat("")} validators={ [] }/>
      <TextAreaInputForm name="description" label="Descripción" placeholder="Descripción del equipo" validators={ [] }/>
      { renderFile() }
      <fieldset className="dashed">
        <legend>Jugadores del equipo - { t.players && ListFullness(t.players, '') }</legend>
        <div className="playerList">
          { sortedByPropName(teamPlayers, "memberID").map(p => <PlayerButton player={ p } onClick={ handleRemovePlayerFromTeam } key={ p._id }/>) }
        </div>
      </fieldset>
      <div className="buttons">
        { renderButtons() }
      </div>
      <fieldset className="dashed">
        <legend>Jugadores sin equipo</legend>
        <div className="playerList">
          { sortedByPropName(playersWitoutTeam, "memberID").map(p => <PlayerButton player={ p } onClick= { handleAddPlayerToTeam } key={ p._id }/>) }
        </div>
      </fieldset>
    </Form>
    </FormContext.Provider>
  )
}

const PlayerButton = ({player, onClick}: {player: TPlayer, onClick: Function}) => {
  return (
    <div className="btn" onClick={ () => onClick(player) }>
      <p>{ player.memberID }</p>
      <p className="extra-message">{ player.nick }</p>
    </div>
  )
}
