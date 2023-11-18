import "./Court.css"
import { DatesPicker, TextInput, TimeInput } from "components/TextInput/TextInput"
import { TickButton } from "components/tickButton/TickButton"
import { useState } from "react"
import { isTheSame } from "utils/object"
import { compareHoursMinutesStrings } from "utils/time"
import { SlotDetails } from "./Slot"
import Modal from "components/modal/Modal"
import withForm from "components/form/withForm"
import { TEnglishDayName, TSlot, TCourt, TWeek, TDay } from "shared/types"
import { translateDayOfWeek } from "utils/translate"
import { sortedByPropName } from "utils/sort"


const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const initCourt = {name: "", week: weekDays.reduce( (cum, curr) => ( {...cum, [curr as keyof TWeek]: null }), {} as TWeek )} 

type propsTypes = {
  name: string,
  value: TCourt[],
  label: string,
  errors: string[],
  onChange: Function

}
export const CourtsInput = (props: propsTypes) => {
  const [ selected, setSelected ] = useState<TCourt | null>(null)
  const courts = props.value

  const handleSubmit = (court: TCourt) => {
    if (!courts) return props.onChange([court])
    props.onChange( [...courts.filter(c => c.name !== court.name), court])
    setSelected(null)
  }
  
  const handleRemoveCourt = (court: TCourt) => {
    const r = window.confirm(`Are you sure you want to remove ${court.name} court?! All information about it will be removed!`)
    if (r) props.onChange( courts.filter(c => c.name !== court.name))
  }
  
  return (<>
      { !selected ? <button type="button" className="btn form-group" onClick={() => setSelected(initCourt)}>Add new Court</button> : null }
      <label className="extra-message">Pistas</label>
      { courts ?
        sortedByPropName(courts, "name").map(c => (
          <div className="court" key={ c.name }>
            <button type="button" className="btn color" onClick={() => setSelected(c)}>Editar</button>
            <p>{c.name}</p>
            <button type="button" className="btn color red remove" onClick={() => handleRemoveCourt(c)}>x</button>
          </div>
        )) : null }
      { selected ? <Modal onClose={() => setSelected(null)}>
          <Details court={ selected } handleSubmit={ handleSubmit } hideDetails={() => setSelected(null)}/> 
        </Modal> : null }
    </>)
}
export const CourtsInputForm = withForm(CourtsInput)

const Details = ({court, handleSubmit, hideDetails}: {court: TCourt, handleSubmit: Function, hideDetails: Function}) => {
  const [data, setData] = useState<TCourt>(court)

  const onSubmit = () => handleSubmit(data)
  const handleTickDay = (name: string, isAvailable: boolean) => {
    if (isAvailable) return handleUpdateDay(name, court.week[name as keyof TWeek] || { openTime: "", closeTime: "", slots: []})

    if ( allAvailableDaysHasTimeRange(data.week)) {
      if ( ! window.confirm(`Are you sure you want to make ${name} unavailable?! We will delete all slots on that day!`) ) return null
    }
    handleUpdateDay(name, null)
  }
  const handleUpdateCourtName = ( val: string) => setData( { ...data, name: val })
  const handleUpdateDay = ( name: string, val: TDay | null ) => setData( { ...data, week: { ...data.week, [name as keyof TWeek]: val } } )
  
  const renderButtons = () => {
    if (!data) return null
    if ( data.name && allAvailableDaysHasTimeRange(data.week) && !allDataIsTheSame(data, court) ) return <button type="button" className="btn full-width color" onClick={() => onSubmit()}>Update Court</button>
    return <button type="button" className="btn full-width" onClick={() => hideDetails() }>Anular</button>
  }

  return (
    <div id="courtDetails">
      <TextInput name="name" placeholder="Exterior" value={ data.name } label="Nombre de la Pista" errors={ data.name ? [] : ["Provide name"] } onChange={ handleUpdateCourtName } />
      <p className="extra-message">Tick day if is generally availiable</p>
      <div id="week" className="form-group">
        { data.week ? Object.entries(data.week).map( ([key, value]) => (
          <fieldset className="dashed fit" key={ key }>
            <legend>
              <TickButton className="" label={ translateDayOfWeek(key as TEnglishDayName) } value={ !!value } onChange={ (val: boolean) => handleTickDay(key, val) } />
            </legend>
            { value ? <Day name={ key } day={ value } updateDay={ handleUpdateDay } key={ key + "day" }/> : null }
          </fieldset>
        )) : null }
      </div>
        <DatesPicker name="unAvailableDates" label="Fechas prohibidas" value={data.unAvailableDates ? data.unAvailableDates : []} onChange={(dates: Date[]) => setData(state => ({...state, unAvailableDates: dates})) }/>
      <div className="buttons">
        { renderButtons() }
        <button type="button" className="btn color red" onClick={() => setData(court)}>Restablece</button>
      </div>
    </div> 
  )
}
function allAvailableDaysHasTimeRange(week: TWeek) {
  return Object.values(week).filter( value => value ).every( value => !!value && value.openTime && value.closeTime )
}
function allDataIsTheSame <T extends {}>(data: T, initData: T) {
  return Object.entries(data).every( ([key, value]) => isTheSame(value, initData[key as keyof typeof initData]))
}

const Day = ({name, day, updateDay}: {name: string, day: TDay, updateDay: Function}) => {
  const [ selected, setSelected ] = useState<TSlot | null>(null)
  const [ errors, setErrors ] = useState({openTime: day.openTime ? [] : ["Provide Time"], closeTime: day.closeTime ? [] : ["Provide Time"] })
  const [ data, setData ] = useState<TDay>(day)
  
  const handleUpdateDay = () => {
    if (!errors.openTime.length && !errors.closeTime.length) updateDay( name, data)
  }
  const handleSaveSlot = (updated: TSlot, old: TSlot) => {
    const existIndex = data.slots.findIndex(s => (s.start === old.start ) && (s.end === old.end) )
    // Add new slot otherwise update
    if (existIndex < 0) return setData( state => ( { 
        ...state, 
        slots: [...data.slots, updated].sort((a: TSlot, b: TSlot) => compareHoursMinutesStrings(a.start, b.start))
      }) )
    
    const n = [...data.slots]
    n[existIndex] = updated
    setData( state => ({ ...state, slots: n.sort((a: TSlot, b: TSlot) => compareHoursMinutesStrings(a.start, b.start)) }) )
  }
  const handleRemoveSlot = (slot: TSlot) => {
    const r = window.confirm("Are you sure you want to delete this slot?!")
    if (r) setData( state => ( { ...state,  slots: data.slots.filter(s => ( s.start !== slot.start ) && ( s.end !== slot.end ) ) } ) )
  }

  const handleHoursChange = (name: string, time: string, min?: string, max?: string) => {
    const error: string[] = []
    if (!time) error.push("Provide Time")
    if ( min && compareHoursMinutesStrings(time, min) < 0) error.push("Is too early")
    if ( max && compareHoursMinutesStrings(time, max) > 0) error.push("Is too late")
    setErrors( state => ( { ...state, [name]: error } ) )
    setData( state => ( { ...state, [name]: time } ) )
  }
  const renderSlots = () => {
    if ( errors.openTime.length || errors.closeTime.length ) return null
    if (!data.slots.length) return (
      <div id="slotList">
        <button type="button" className="btn" onClick={() => setSelected( {start: data.openTime, end: "", takenBy: "" } )}>Add Slot</button>
      </div> 
    )
    return (<>
      { data.slots.map( (slot, index, array) => (
          <div id="slotList" key={index}>
            { (!array[index - 1] && ( compareHoursMinutesStrings(slot.start, data.openTime) > 0 ) ) && <button type="button" className="btn" onClick={() => setSelected( { start: data.openTime, end: slot.start, takenBy: "" } ) } >Add Slot</button> }
            { (array[index - 1] && ( compareHoursMinutesStrings(array[index - 1].end, slot.start) < 0 ) ) && <button type="button" className="btn" onClick={() => setSelected( { start: array[index - 1 ].end, end: slot.start, takenBy: "" } ) } >Add Slot</button> }
            <div className="btn slot" key={ slot.start }>
              <button type="button" className="btn color red remove" onClick={() => handleRemoveSlot(slot)}>x</button>
              <p onClick={ () => setSelected(slot) }>{ slot.start } - { slot.end }</p>
            </div>
            { (!array[index + 1] && ( compareHoursMinutesStrings(slot.end, data.closeTime) < 0 ) ) && <button type="button" className="btn" onClick={() => setSelected( { start: slot.end, end: data.closeTime, takenBy: "" } ) } >Add Slot</button>  }
          </div>
        ))
      }
      </>)
  }

  const renderButtons = () => {
    const result = Object.entries(data).every( ([key, value]) => isTheSame(value, day[key as keyof typeof day]))
    if (!result) return <button type="button" className="btn color" onClick={ handleUpdateDay }>Actualizar</button>
    return null
  }
  return (
    <div className="day">
      { renderButtons() }
      <div>
        <TimeInput name="openTime" placeholder="16:30" value={ data.openTime } label="Opens at" min="10:00" max={ data.closeTime } errors={ errors.openTime } onChange={(val: string) => handleHoursChange("openTime", val, "10:00", data.closeTime) } />
        { renderSlots() }
        <TimeInput name="closeTime" placeholder="22:00" value={ data.closeTime } label="Close at" min={ data.openTime } max="22:00" errors={ errors.closeTime } onChange={(val: string) => handleHoursChange("closeTime", val, data.openTime, "22:00") } />
      </div>
      { selected && <Modal onClose={ () => setSelected(null) }>
        <SlotDetails slot={ selected } openTime={ data.openTime } closeTime={ data.closeTime } existingSlots={ data.slots } addSlot={ handleSaveSlot }  handleCancel={ () => setSelected(null) }/>
      </Modal> }
    </div>
         
  )
}

