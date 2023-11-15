import "./LocationCalendar.css"
import { useState } from "react"
import Modal from "components/modal/Modal"
import { SlotDisplay } from "components/slot/Slot"
import { TLocation, TSlot, TEnglishDayName } from "shared/types"
import { getEnglishWeekDayName, getMonthName, getWeekShortName } from "utils/translate"
import { sortedByPropName } from "utils/sort"

type TCalendarCourt = {
  name: string,
  slots: TSlot[] | undefined,
  unAvailableDates?: Date[]
}
type TCalendarDay = {
  date: Date,
  courts?: TCalendarCourt[]
}

export const LocationsCalendars = ({locations}: {locations: TLocation[]}) => {
  return (
    <div id="locationsCalendars">
      { sortedByPropName(locations,"name").map( location => <LocationCalendar location={ location} key={ location.name }/> )}
    </div>
  )
}

function daysInMonth (month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate()
}
function generateMonth(date: Date) {
  const currMonth = date.getMonth()
  const currYear = date.getFullYear()
  const endDay = new Date(currYear, currMonth, daysInMonth(currMonth, currYear))

  const daysList = []
  let loop = new Date(currYear, currMonth, 1)
  while (loop <= endDay) {
    daysList.push({ date: loop })
    loop = new Date(currYear, currMonth, loop.getDate() + 1 )
  }
  return daysList
}
function addSlotsToMonth(monthDays: { date: Date }[], location: TLocation ): TCalendarDay[] {
  const { courts } = location
  if (!courts || !courts.length) return monthDays.map(d => ({ date: d.date }) )
  const daysWithSlots = monthDays.map(day => {
    const dayOfWeek = getEnglishWeekDayName(day.date.getDay())
    const courtsAvailable = courts.filter(c => c.week[dayOfWeek as TEnglishDayName]).map(c => ({ name: c.name, slots: c.week[dayOfWeek as TEnglishDayName]?.slots, unAvailableDates: c.unAvailableDates }) )
    const newDay: TCalendarDay = { date: day.date }
    if (courtsAvailable.length) newDay.courts = courtsAvailable
    return newDay
  })
  return daysWithSlots
}

export const LocationCalendar = ({location}: {location: TLocation}) => {
  const [ date, setDate ] = useState(new Date())
  const [ selected, setSelected ] = useState<TCalendarDay | null>(null)

  const controlDate = (direction: string) => {
    if (direction === "prev") return setDate(new Date( date.setMonth( date.getMonth() - 1, 1) ) )
    if (direction === "next") return setDate(new Date( date.setMonth( date.getMonth() + 1, 1) ) )
  }

  const Day = ({day}: {day: TCalendarDay}) => {
    let klass = "prevent-selection day " + getWeekShortName(day.date.getDay())

    
    if (day.courts) return <button className={ klass + " btn" } onClick={() => setSelected(day)}>{ day.date.getDate() }</button>
    return <span className={ klass }>{ day.date.getDate() }</span>
  }
  
  const Court = ({date, court}: {date: Date, court: TCalendarCourt}) => {

    let klass = "court dashed fit"
    const isUnAvailable =  court.unAvailableDates?.find(d => d.toLocaleDateString() === date.toLocaleDateString())

    console.log(date,  isUnAvailable )
    if (isUnAvailable) klass += " disabled"

    return (
      <fieldset className={ klass }>
        <legend>{ court.name }</legend>
        <div id="slotList" >
          { court.slots ? court.slots.map(slot => <SlotDisplay slot={ slot } handleSlotToggle={() => {}} key={ slot.start }/>) : null }
        </div>
      </fieldset>
    )
  }
  const handleToggleSlot = (slot: TSlot) => {

  }
  return (
    <div id="locationCalendar">
      <h2 id="locationName">{ location.name }</h2>
      <div id="controls">
        <span className="prev prevent-selection" onClick={() => controlDate("prev")}>{ "<" }</span>
        <span className="date prevent-selection">{ getMonthName(date.getMonth()) } { date.getFullYear() }</span>
        <span className="next prevent-selection" onClick={() => controlDate("next")}>{ ">" }</span>
      </div>
      <div id="head">
        <span className="prevent-selection">L</span>
        <span className="prevent-selection">M</span>
        <span className="prevent-selection">X</span>
        <span className="prevent-selection">J</span>
        <span className="prevent-selection">V</span>
        <span className="prevent-selection S">S</span>
        <span className="prevent-selection D">D</span>
      </div>
      <div id="body">
        { addSlotsToMonth(generateMonth(date), location).map((d, index) => <Day day={ d } key={ index } /> )}
      </div>
      { selected ? <Modal onClose={() => setSelected(null)}>
        <div>
          <div id="courtList">
            { selected.courts ? sortedByPropName(selected.courts, "name").map( c => <Court court={ c } date={ selected.date } key={ c.name }/> ) : null}
          </div>
          <div className="buttons">
            <button type="button" className="btn full-width" onClick={() => setSelected(null)}>Cerrar</button>
          </div>
        </div>
      </Modal> : null }
    </div>
  )
}