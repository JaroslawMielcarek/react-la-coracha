import "./LocationManagement.css"
import { DatePickerInput, TextInput, TextInputForm } from "components/TextInput/TextInput"
import Form from "components/form/Form"
import { FormContext, useFormState } from "components/form/useFormState"
import { CourtsInputForm } from "components/slot/Court"
import { Table } from "components/table/Table"
import { useState } from "react"
import { isTheSame } from "utils/object"
import { requiredValidator } from "utils/validators"
import { LocationsCalendars } from "./LocationCalendar"
import Modal from "components/modal/Modal"
import { TLocation } from "shared/types"
import { sortedByPropName } from "utils/sort"

const list = [{
  name: "IES Campanillas",
  address: "Algo de campanillas",
  courts: [
    {
      name: "Pista 1", 
      week: { 
        Monday: { openTime: "15:30", closeTime: "22:00", slots: [{ start: "16:30", end: "18:30", takenBy: ""}]},
        Tuesday: null, Wednesday: null, Thursday: null, Friday: null, Saturday: null, Sunday: null 
      }
    },
    {
      name: "Pista 2", 
      week: { 
        Monday: { openTime: "15:30", closeTime: "22:00", slots: [{ start: "16:30", end: "18:30", takenBy: ""}]},
        Tuesday: { openTime: "15:30", closeTime: "22:00", slots: [{ start: "16:30", end: "18:30", takenBy: ""}, { start: "18:30", end: "19:15", takenBy: "Angel"}, { start: "19:45", end: "21:11", takenBy: ""}]},
        Wednesday: null, Thursday: null, Friday: null, Saturday: null, Sunday: null 
      }
    }
  ]
},
{
  name: "IES Divino Pastor",
  address: "Algo de Malaga",
  courts: [{name: "Pista", week: { Monday: { openTime: "15:30", closeTime: "22:00", slots: [{ start: "16:30", end: "18:30", takenBy: "Bob"}, { start: "18:30", end: "20:30", takenBy: ""}]},
  Tuesday: null, Wednesday: null, Thursday: null, Friday: null, Saturday: null, Sunday: null }}]
}]
export const LocationManagement = () => {
  // const [ initList, sendData ] = useFetch<TLocation[]>({url: "admin/getAllCourts", errorTitle: "Page Settings Courts download"})
 const [initList, setInitList] = useState<TLocation[]>(list)
  const [ selected, setSelected ] = useState<TLocation | null>(null)
  
  const handleRemove = (location: TLocation) => {
    const r = window.confirm("Are you sure you want remove?")
    if (r) setInitList( initList.filter(l => l.name !== location.name ))
  }
  const handleSubmit = (location: TLocation) => {
    setInitList( [...initList.filter(l => l.name !== location.name), location ])
  }

  const Location = (location: TLocation) => {
    return (
      <div className="table-row">
        <div className="column action">
          <button className="btn color" onClick={() => setSelected(location)}>Editar</button>
        </div>
        <p className="column">{ location.name }</p>
        <p className="column">{ location.address }</p>
        <p className="column">{ location.courts?.length }</p>
        <div>
          <button className="btn color red" onClick={() => handleRemove(location)}>x</button>
        </div>
      </div>
    )
  }

  function renderElements (list: TLocation[]) {
    if (!list.length) return <p className="no-data">No hay nada en periodo elegido</p>
    return list.map( loc => <Location { ...loc } key={ loc.name }/>)
  }
  return (
    <div id="locationManagement">
      <button id="newLocation" className="btn white" onClick={() => setSelected({name: "", address:""})}>Crear nueva Ubicacion</button>
      <Table>
        <div className="table-head">
          <p className="column action"></p>
          <p className="column name">Nombre</p>
          <p className="column location">Ubicación</p>
          <p className="column courts">No. Pistas</p>
        </div>
        <ul>
          { renderElements( sortedByPropName(initList || [], "name" ))}
        </ul>
      </Table>
      { selected ? <Modal onClose={() => setSelected(null)} >
        <Details location={ selected } add={ handleSubmit } hideDetails={ () => setSelected(null) }/> 
      </Modal> : null }
      <h1>Disponibilidad de Pabellones</h1>
      <p className="extra-message">Visible para entrenadores</p>
      <LocationsCalendars locations={ initList }/>
    </div>
  )
}

const Details = ({location, add, hideDetails}: {location: TLocation, add: Function, hideDetails: Function}) => {
  const initVal = {name: "", address: "", courts: []}
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState(location || initVal)
  
  const onSubmit = () => {
    const data = formState.data
    if (!data) return null
    add(data)
    hideDetails()
  }
  const renderButtons = () => {
    const result = Object.entries(formState.data).every( ([key, value]) => isTheSame(value, location[key as keyof typeof location]) )
    if (result) return <button type="button" className="btn full-width" onClick={() => hideDetails()}>Anular</button>
  
    return (<>
        <button type="submit" className="btn full-widtg color">Update Location</button> 
        <button type="button" className="btn color red" onClick={() => resetForm()}>Restablecer</button>
      </>)
  }
  return (
      <FormContext.Provider value={ { formState, validate, registerInput, setFieldValue, resetForm } }>
        <Form 
          id="LocationDetails"
          className=""
          onSubmit={() => onSubmit() }
          onReset={() => resetForm() }>
          <TextInputForm name="name" label="Nombre"  validators={ [requiredValidator] }/>
          <TextInputForm name="address" label="Ubication" validators={ [requiredValidator] } />
          <CourtsInputForm name="courts" label="Pistas" validators={ [] }/>
          <div className="buttons">
            { renderButtons() }
          </div>
        </Form>
      </FormContext.Provider>
    )
}