import "./Court.css"
import { TextInput, TimeInput } from "components/TextInput/TextInput"
import { TickButton } from "components/tickButton/TickButton"
import { useEffect, useState } from "react"
import { isTheSame } from "utils/object"
import { compareHoursMinutesStrings } from "utils/time"
import { SlotDetails } from "./Slot"
import Modal from "components/modal/Modal"
import withForm from "components/form/withForm"



export type TCourt = {
  name: string,
  week: TWeek
}
export type TWeek = {
  [key: string]: TDay | null
  // Monday: TDay | null,
  // Tuesday: TDay | null,
  // Wednesday: TDay | null,
  // Thursday: TDay | null,
  // Friday: TDay | null,
  // Saturday: TDay | null,
  // Sunday: TDay | null
}
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
// const initCourt = { name: "", week: weekDays.reduce( (cum, curr) => ( {...cum, [curr as keyof TWeek]: { openTime: "16:30", closeTime: "22:00", slots: [] } } ), {} as TWeek) }
const initCourt = {name: "", week: weekDays.reduce( (cum, curr) => ( {...cum, [curr as keyof TWeek]: null }), {} as TWeek )} 

const initDay = { openTime: "", closeTime: "", slots: []}
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
  
  return (
    <>
      { !selected && <button type="button" className="btn form-group" onClick={() => setSelected(initCourt)}>Add new Court</button> }
      <label className="extra-message">Pistas</label>
      { courts &&
        courts.map(c => (
          <div className="court" key={ c.name }>
            <button type="button" className="btn color" onClick={() => setSelected(c)}>Editar</button>
            <p>{c.name}</p>
            <button type="button" className="btn color red remove" onClick={() => handleRemoveCourt(c)}>x</button>
          </div>
        ))
      }
      { selected && <Details court={ selected } handleSubmit={ handleSubmit } hideDetails={() => setSelected(null)}/> }
    </>
  )
}
export const CourtsInputForm = withForm(CourtsInput)

const Details = ({court, handleSubmit, hideDetails}: {court: TCourt, handleSubmit: Function, hideDetails: Function}) => {
  const [data, setData] = useState<TCourt>(court)
  const [ errors, setErrors ] = useState<string[]>([])

  useEffect(()=> {
    const errors = []
    if (!data.name) errors.push("Provide name")
    setErrors(errors)
  },[data])

  const onSubmit = () => {
    if (!data) return null
    if (!errors.length) handleSubmit(data)
  }
  const handleTickDay = (name: string, val: boolean) => {
    if (!data) return null
    if (val) return handleUpdateDay(name, data.week[name as keyof TWeek] || initDay)
    const r = window.confirm(`Are you sure you want to make ${name} unavailable?! We will delete all slots on that day!`)
    if (r) handleUpdateDay(name, null)
  }
  const handleUpdateCourtName = ( val: string) => {
    if (!data) return null

    const errors = []
    if (!val) errors.push("Provide name")
    setErrors(errors)
    setData( { ...data, name: val })
  }
  const handleUpdateDay = ( name: string, val: TDay | null ) => {
    if (!data) return null
    setData( { ...data, week: { ...data.week, [name as keyof TWeek]: val } } )
  }
  const renderButtons = () => {
    if (!data) return null
    const result = Object.entries(data).every( ([key, value]) => isTheSame(value, court[key as keyof TCourt]))
    if ( data.name && !errors.length && !result  ) return <button type="button" className="btn" onClick={() => onSubmit()}>Update Court</button>
    return <button type="button" className="btn" onClick={() => hideDetails() }>Anular</button>
    
  }
  return (
    <fieldset id="courtDetails" className="solid fit">
      <TextInput name="name" placeholder="Exterior" value={ data.name } label="Nombre de la Pista" type="text" errors={ errors } onChange={ handleUpdateCourtName } />
      <p className="extra-message">Tick day if is generally availiable</p>
      <div id="week">
        { Object.entries(data.week).map( ([key, value]) => (
          <fieldset className="dashed fit" key={ key }>
            <legend>
              <TickButton className="" label={ key } value={ !!value } onChange={ (val: boolean) => handleTickDay(key, val) } />
            </legend>
            { value && <Day name={ key } day={ value } updateDay={ handleUpdateDay } key={ key + "day" }/>}
          </fieldset>
        ))}
      </div>
      <div className="buttons">
        { renderButtons() }
      </div>
    </fieldset> 
  )
}

export type TDay = {
  openTime: string,
  closeTime: string,
  slots: TSlot[]
}
export type TSlot = {
  start: string,
  end: string,
  takenBy?: string,
}

const Day = ({name, day, updateDay}: {name: string, day: TDay, updateDay: Function}) => {
  const [ selected, setSelected ] = useState<TSlot | null>(null)
  const [ data, setData ] = useState<TDay>(day)
  
  const handleUpdateDay = () => {
    updateDay( name, data)
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
  const handleRemove = (slot: TSlot) => {
    const r = window.confirm("Are you sure you want to delete this slot?!")
    if (r) setData( state => ( { ...state,  slots: data.slots.filter(s => ( s.start !== slot.start ) && ( s.end !== slot.end ) ) } ) )
  }

  const handleHoursChange = (name: string, time: string) => {
    setData( state => ( { ...state, [name]: time } ) )
  }
  const renderSlots = () => {
    if (!data.openTime || !data.closeTime) return null
    if (!data.slots.length) return (
      <div id="slotList">
        <button type="button" className="btn" onClick={() => setSelected( {start: data.openTime, end: "", takenBy: "" } )}>Add Slot</button>
      </div> 
    )
    return (
      <>
      { data.slots.map( (slot, index, array) => (
          <div id="slotList" key={index}>
            { (!array[index - 1] && ( compareHoursMinutesStrings(slot.start, data.openTime) > 0 ) ) && <button type="button" className="btn" onClick={() => setSelected( { start: data.openTime, end: slot.start, takenBy: "" } ) } >Add Slot</button> }
            { (array[index - 1] && ( compareHoursMinutesStrings(array[index - 1].end, slot.start) < 0 ) ) && <button type="button" className="btn" onClick={() => setSelected( { start: array[index - 1 ].end, end: slot.start, takenBy: "" } ) } >Add Slot</button> }
            <div className="btn slot" key={ slot.start }>
              <button type="button" className="btn color red remove" onClick={() => handleRemove(slot)}>x</button>
              <p onClick={ () => setSelected(slot) }>{ slot.start } - { slot.end }</p>
            </div>
            { (!array[index + 1] && ( compareHoursMinutesStrings(slot.end, data.closeTime) < 0 ) ) && <button type="button" className="btn" onClick={() => setSelected( { start: slot.end, end: data.closeTime, takenBy: "" } ) } >Add Slot</button>  }
          </div>
        ))
      }
      </>
    )
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
        <TimeInput name="openTime" placeholder="16:30" value={ data.openTime } label="Opens at" min="10:00" max={ data.closeTime } errors={ [] } onChange={(val: string) => handleHoursChange("openTime", val) } />
        { renderSlots() }
        <TimeInput name="closeTime" placeholder="22:00" value={ data.closeTime } label="Close at" min={ data.openTime } max="22:00" errors={ [] } onChange={(val: string) => handleHoursChange("closeTime", val) } />
      </div>
      { selected && <Modal onClose={ () => setSelected(null) }>
        <SlotDetails slot={ selected } openTime={ data.openTime } closeTime={ data.closeTime } existingSlots={ data.slots } addSlot={ handleSaveSlot }  handleCancel={ () => setSelected(null) }/>
      </Modal> }
    </div>
         
  )
}

