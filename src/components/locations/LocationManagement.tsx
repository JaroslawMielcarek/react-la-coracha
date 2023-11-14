import "./LocationManagement.css"
import { TextInputForm } from "components/TextInput/TextInput"
import Form from "components/form/Form"
import { FormContext, useFormState } from "components/form/useFormState"
import { CourtsInputForm, TCourt, TDay, TSlot } from "components/slot/Court"
import { Table } from "components/table/Table"
import { useState } from "react"
import { isTheSame } from "utils/object"
import { requiredValidator } from "utils/validators"

type TLocation = {
  _id?: string,
  name: string,
  address: string,
  courts?: TCourt[]
}
const list = [{
  name: "IES Campanillas",
  address: "Algo de campanillas",
  courts: [
    {
      name: "Pabellon 1", 
      week: { 
        Monday: { openTime: "15:30", closeTime: "22:00", slots: [{ start: "16:30", end: "18:30", takenBy: ""}]},
        Tuesday: null, Wednesday: null, Thursday: null, Friday: null, Saturday: null, Sunday: null 
      }
    },
    {
      name: "Pabellon 2", 
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
  courts: [{name: "Pabellon", week: { Monday: { openTime: "15:30", closeTime: "22:00", slots: [{ start: "16:30", end: "18:30", takenBy: "Bob"}, { start: "18:30", end: "20:30", takenBy: ""}]},
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
          <p className="column location">Ubication</p>
          <p className="column courts">No. Pistas</p>
        </div>
        <ul>
          { renderElements(initList || [])}
        </ul>
      </Table>
      { selected && 
        <Details location={ selected } add={ handleSubmit } hideDetails={ () => setSelected(null) } />
      }
      { initList && !selected && <LocationDisplay locations={ initList }/> }
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
  
    return (
      <>
        <button type="submit" className="btn full-widtg color">Update Location</button> 
        <button type="button" className="btn color red" onClick={() => resetForm()}>Restablecer</button>
      </>
    )
  }
  return (
    <div>
      <fieldset className="dashed fit">
        <legend>Location details</legend>
      <FormContext.Provider value={ { formState, validate, registerInput, setFieldValue, resetForm } }>
        <Form 
          id="LocationDetails"
          className=""
          onSubmit={() => onSubmit() }
          onReset={() => resetForm() }>
          <div className="buttons">
            { renderButtons() }
          </div>
          <TextInputForm name="name" label="Nombre"  validators={ [requiredValidator] }/>
          <TextInputForm name="address" label="Ubication" validators={ [requiredValidator] } />
          <CourtsInputForm name="courts" label="Pistas" validators={ [] }/>
        </Form>
      </FormContext.Provider>
      </fieldset>
    </div>
    )
}




const LocationDisplay = ({locations}: {locations: TLocation[]}) => {
  const [ selected, setSelected ] = useState<TLocation | null>(null)

  return (
    <div id="locationDisplay">
      <h1>Gestión del entrenamientos</h1>
      <p>Lista de Pabellones</p>
      { !selected && <div>
        {locations.map(l => (
          <button className="btn" onClick={() => setSelected(l)} key={ l.name }>
              <p>{ l.name }</p>
          </button>
        ))}
      </div> }
      { selected && <button type="button" className="btn" onClick={() => setSelected(null)}>Ocultar detalles</button>}
      { selected && <DisplayDetails location={ selected } /> }
    </div>
  )
}

const DisplayDetails = ({location}: {location: TLocation}) => {

  const renderSlots = (day: TDay) => {
    if (!day.slots || !day.slots.length) return <p>No Slots availiable</p>
    return (<>
      { day.slots.map(s => <SlotDisplay slot={ s } key={ s.start }/> )}
    </>)
  }

  const renderWeek = (c: TCourt) => {
    // At the moment will always show week. When we create court we add each day with Null
    if (!c.week) return <p>No Week</p>
    return (<>
      { Object.entries(c.week).map( ([key, value]) => {
        if (!value) return null
        return (
        <fieldset className="day dashed fit" id="slotList" key={ key }>
          <legend>{ key }</legend>
          { value?.openTime && <p>Open at: { value.openTime }</p> }
          { value && renderSlots(value) }
          { value?.closeTime && <p>Close at: { value.closeTime }</p> }
        </fieldset>
        ) 
      } ) }
    </>)
  }

  const renderCourts = (loc: TLocation) => {
    if (!loc.courts || !loc.courts.length) return <p className="no-data">No hay ninguna pista disponible!</p>
    return ( <>
      { loc.courts.map(c => (
        <fieldset className="court solid fit" id="week" key={ c.name }>
          <legend className="extra-message">{ c.name }</legend>
          { renderWeek(c) }
        </fieldset>
      ))}
    </> )
  }
  return (
    <div>
      <h2>{ location.name }</h2>
      <div id="courtDetails">
        { renderCourts(location) }
      </div>
    </div>
  )
}

const currentUser = "CurrUser"
const SlotDisplay = ({slot}: {slot: TSlot}) => {
  const [ data, setData ] = useState<TSlot>(slot)

  const handleToggle = (name: string) => {
    if (!data.takenBy) return setData(state => ({...state, takenBy: name}))
    if (data.takenBy && data.takenBy === currentUser) return setData(state => ({...state, takenBy: "" }))
    return null
  }

  let klass = "btn slot"
  if (data.takenBy) klass += " color"
  return (
    <button type="button" className={ klass } onClick={() => handleToggle(currentUser)}>
      <p>{ data.start } - { data.end }</p>
      <p>{ data.takenBy ? data.takenBy : "Free" }</p>
    </button>
  )
}