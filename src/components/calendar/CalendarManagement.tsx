import "./CalendarManagement.css"
import { useState } from "react"
import { requiredValidator } from "utils/validators"
import { getMonthNameByNumber } from "utils/time"
import { getFilteredByTimePeriod, isTheSame, prepareFormState, prepareToSend } from "utils/object"
import { useFetch } from "utils/useFetch"
import Modal from "components/modal/Modal"
import Form from "components/form/Form"
import { Table } from "components/table/Table"
import { SelectInput, SelectInputForm } from "components/selectInput/SelectInput"
import { DateInputForm, NumberInputForm, TextInputForm, TimeInputForm } from "components/TextInput/TextInput"
import { FormContext, useFormState } from "components/form/useFormState"
import { TMatch } from "shared/types"


const DEFAULT_MATCH = {
  homeTeam: { clubName: '', teamName: '', teamGender: 'Male'},
  guestTeam: { clubName: '', teamName: '', teamGender: 'Male'},
  dateTime: { date: '', time: '' },
  location: '',
  friendly: false,
  league: ''
}

export const CalendarManagement = () => {
  const [ matches, sendData ] = useFetch<TMatch[]>({ url: "public/getAllMatches", errorTitle: "Calendar Manager" })
  const [ selectedFilter, setSelectedFilter ] = useState("Todo")
  const [ selectedMatch, setSelectedMatch ] = useState<TMatch | null>(null)
  const list = getFilteredByTimePeriod<TMatch>(selectedFilter, matches)

  const handleRemoveMatch = (match: TMatch) => { 
    const r = window.confirm("Are you sure? Match will be removed permanently!!")
    if (r) sendData("moderator/deleteMatch", { _id: match._id } )}

  const handleFilterSelection = (val: string) => {
    if (val) setSelectedFilter(val)
  }
  
  return (
    <div id="matchManagement" className="manager">
      { !selectedMatch && <button id="newMatch" className="btn white" onClick={() => setSelectedMatch(DEFAULT_MATCH) }>Crear nuevo Partido</button> }
      { selectedMatch &&
          <Modal onClose={ () => setSelectedMatch(null) }>
            <Details 
              m={ selectedMatch } 
              hideDetails={() => setSelectedMatch(null) } 
              sendData={ sendData }
            />
          </Modal>
      }
      <Table>
        <SelectInput name="sortBy" label="Mostrar" value={ selectedFilter } onChange={handleFilterSelection} options={["Todo","Semana","Mes actual",'Temporada']}/>
        <div className="table-head">
          <p className="column action"></p>
          <p className="column">Local</p>
          <p className="column">Visitor</p>
          <p className="column">Fecha</p>
          <p className="column location">Ubicación</p>
          <p className="column">Tipo</p>
          <p className="column action"></p>
        </div>

        <div className="table-body">
        { list.map((match, index) => (
          <div className="table-row" key={ index }>
            <div className="column action">
              <button className="btn color" onClick={() => setSelectedMatch(match)}>Editar</button>
            </div>
            <div className="column blocks">
              <p className="club">{ match.homeTeam?.clubName }</p>
              <p className="team">{ match.homeTeam?.teamName }</p>
              <p className="gender">{ match.homeTeam?.teamGender }</p>
            </div>
            <div className="column blocks">
              <p className="club">{ match.guestTeam?.clubName }</p>
              <p className="team">{ match.guestTeam?.teamName }</p>
              <p className="gender">{ match.guestTeam?.teamGender }</p>
            </div>
            <div className="column blocks">
              <div className="date">
                <p className="day">{ new Date(match.dateTime.date).getDate() }</p>
                <p className="month">{ getMonthNameByNumber(match.dateTime.date).substring(0,3)}</p>
                <p className="year">{ new Date(match.dateTime.date).getFullYear()  }</p>
              </div>
              <p className="time">{ match.dateTime.time }</p>
            </div>
            <p className="column location">{ match.location }</p>
            <p className="column type">{ match.friendly? "friendly" : match.league }</p>
            <div className="column action">
              <button className="btn color red" onClick={() => handleRemoveMatch(match)}>x</button>
            </div>
          </div>
        ) ) }
        </div>
      </Table>
    </div>
  )
}

type DetailsPropsType = {
  m: TMatch,
  sendData: Function,
  hideDetails: Function,
}

const Details = ({m, sendData, hideDetails}: DetailsPropsType) => {
  const dataForState = prepareFormState(m)
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState(dataForState)
  const handleSubmit = async () => {
    const r = ( m._id) ? await sendData("moderator/updateMatch", prepareToSend(formState.data)) : await sendData("moderator/createMatch", prepareToSend(formState.data))
    if (r) hideDetails()
  }
  const renderButtons = () => {
    const allSame = Object.entries(formState.data).every( ([key, value]) => isTheSame(value, dataForState[key as keyof typeof dataForState]) )
    // const difference = initVal.players?.filter( p => !players.find(pf => pf._id === p._id) ).concat(players.filter(tp => !initVal.players?.find(ip => ip._id === tp._id))).length
    if ( allSame ) return <button className="btn full-width" type="button" onClick={ () => hideDetails() }>Anular</button>
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
        className="form"
        onSubmit={ handleSubmit}
        onReset={ () => resetForm() }
        >
        <h4>Detalles del partido</h4>
        <div className="flex-group">
          <fieldset className="form-group dashed">
            <legend>Local</legend>
            <TextInputForm name="homeTeam-clubName" placeholder="La Coracha" label="Nombre del club" validators={ [requiredValidator] }/>
            <TextInputForm name="homeTeam-teamName" placeholder="La Coracha" label="Nombre del equipo" validators={ [requiredValidator] }/>
            <SelectInputForm name="homeTeam-teamGender" label="Género" validators={ [requiredValidator] } options={["Female", "Male", "Mix"]}/>
            <NumberInputForm name="homeTeam-wonSets" placeholder="0" label="Sets ganados" min={ 0 } max={ 3 } validators={ [] }/>
          </fieldset>
          <fieldset className="form-group dashed">
            <legend>Visitor</legend>
            <TextInputForm name="guestTeam-clubName" placeholder="La Coracha" label="Nombre del club" validators={ [requiredValidator] }/>
            <TextInputForm name="guestTeam-teamName" placeholder="La Coracha" label="Nombre del equipo" validators={ [requiredValidator] }/>
            <SelectInputForm name="guestTeam-teamGender" label="Género" validators={ [requiredValidator] } options={["Female", "Male", "Mix"]}/>
            <NumberInputForm name="guestTeam-wonSets" placeholder="0" label="Sets ganados" min={ 0 } max={ 3 } validators={ [] }/>
          </fieldset>
        </div>
        <fieldset className="form-group">
          <DateInputForm name="dateTime-date" placeholder={ new Date().toISOString().split("T")[0] } label="Fecha" validators={ [requiredValidator]} />
          <TimeInputForm name="dateTime-time" placeholder={ new Date().getHours() + ":" + new Date().getMinutes() } label="Hora" validators={ [requiredValidator]} />
          <TextInputForm name="location" placeholder="Campanillas" label="Ubicatión" validators={ [requiredValidator] }/>
          <TextInputForm name="league" placeholder="AFADE" label="Liga" validators={ [] }/>
        </fieldset>
        <div className="buttons">
          { renderButtons() }
        </div>
      </Form>
    </FormContext.Provider>
  )
}