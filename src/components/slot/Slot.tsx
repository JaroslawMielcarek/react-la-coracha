import { useEffect, useState } from "react"
import { compareHoursMinutesStrings } from "utils/time"

type TSlot = {
  start: string,
  end: string,
  takenBy?: string,
}

export const SlotDetails = ({slot, openTime, existingSlots, closeTime, addSlot, handleCancel}: {slot: TSlot, existingSlots: TSlot[], openTime: string, closeTime: string, addSlot: Function, handleCancel: Function}) => {
  const [data, setData ] = useState(slot)
  const [ errors, setErrors ] = useState<{[key: string]: string[]}>({})

  useEffect(() => {
    console.log({data, openTime, closeTime})
  },[data])

  const handleSubmit = () => {
    addSlot( data, slot )
    handleCancel()
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const name = e.target.name

    const err = timeValidator(val, name)
    setData( state => ({ ...state, [name]: val }) )
    setErrors( state => ({ ...state, [name]: err }) )
  }
  const timeValidator = (val: string, name: string) => {
    if (!val) return ["Provide hours"]
    const errors = []
    if ( compareHoursMinutesStrings( val , openTime ) < 0 ) errors.push("Need to be after Opening hours of Pavilion")
    if ( compareHoursMinutesStrings( val , closeTime ) > 0 ) errors.push("Need to be before Closing hours of Pavilion")

    if ( name === "end" && data.start && compareHoursMinutesStrings( val, data.start) <= 0 ) errors.push("Need to end after Start time")
    if ( name === "start" && data.end && compareHoursMinutesStrings( val, data.end) >= 0 ) errors.push("Need to start before End Time")
    
    const startColidesWithIndex = existingSlots.findIndex(s => {
     const startColide = (name === "start") && ( compareHoursMinutesStrings(s.end, val) > 0 ) && ( compareHoursMinutesStrings(s.start, val) <= 0 )
     const endColide = (name === "end") && ( compareHoursMinutesStrings(s.start, val) < 0 ) && ( compareHoursMinutesStrings(s.end, val) >= 0 )
     const slotBetweenExist = ( compareHoursMinutesStrings(s.start, name === "start" ? val : data.start) > 0 ) && ( compareHoursMinutesStrings(s.end, name ==="end" ? val : data.end) < 0 )
    //  console.log({startColide, endColide, slotBetweenExist}, s.end, val, data.start, data.end)
     return startColide || endColide || slotBetweenExist ? true : false
    })

    if (startColidesWithIndex >= 0) errors.push("Colides with other slot")
    
    return errors
  }
  const renderErrors = (name: string) => {
    if (!errors[name]?.length) return null

    return <ul className="error-messages">{
      errors[name].map((errMsg: string, i: number) => (
        <li key={`slot-error-${i}`} className="error">
          {errMsg}
        </li>
      ))
    }</ul>
  }
  const renderButtons = () => {
    const hasErrors = errors.start?.length || errors.end?.length
    return (
      <>
      { data.start && data.end && !hasErrors && <button className="btn color" onClick={ handleSubmit }>update</button> }
      <button className="btn" onClick={() => handleCancel() }>Anular</button>
      </>
    )
  }
  return (
      <div className="slotDetails">
        <div className={ errors.start?.length ? "form-group has-error" : "form-group" }>
          <label>Start at</label>
          <input type="time" step="300" name="start" value={ data.start } min={ openTime } max={ closeTime } onChange={ onChange }/>
          { renderErrors("start") }
        </div>
        <div className={ errors.end?.length ? "form-group has-error" : "form-group" }>
          <label>End at</label>
          <input type="time" step="300" name="end" value={ data.end } min={ openTime } max={ closeTime } onChange={ onChange }/>
          { renderErrors("end") }
        </div>
        <div className="buttons">
          { renderButtons() }
        </div>
      </div>
  )
}