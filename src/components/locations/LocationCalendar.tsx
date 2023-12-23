import "./LocationCalendar.css"
import { useContext, useState } from "react"
import Modal from "components/modal/Modal"
import { SlotDisplay } from "components/slot/Slot"
import { TLocation, TSlot } from "shared/types"
import { getMonthName, getWeekShortName } from "utils/translate"
import { sortedByPropName } from "utils/sort"
import { useFetch } from "utils/useFetch"
import { UserContext } from "utils/useUser"

type TCalendarCourt = {
  _id?: string,
  name: string,
  slots?: {
    date: Date,
    slots?: TSlot[],
  }[],
  unAvailableDates?: Date[]
}
type TCalendarDay = {
  date: Date,
  courts?: TCalendarCourt[]
}

export const LocationsCalendars = () => {
  const [ initList, sendData ] = useFetch<TLocation[]>({url: "moderator/getAllLocations", errorTitle: "Page Settings Courts download"})
  
  if (!initList) return (<p className="no-data">There is no Locations to display</p>)
  return (
    <div id="locationsCalendars">
    { sortedByPropName(initList, "name").map( location => <LocationCalendar location={ location} sendData={ sendData} key={ location.name }/> )}
    </div>
  )
}

const daysInMonth = (month: number, year: number): number => new Date(year, month + 1, 0).getDate()

function generateMonth(date: Date, location: TLocation) {
  const currMonth = date.getMonth()
  const currYear = date.getFullYear()
  const endDay = new Date(currYear, currMonth, daysInMonth(currMonth, currYear))

  const daysList = []
  let loop = new Date(currYear, currMonth, 1)
  while (loop <= endDay) {
    daysList.push(createCalendarDay(loop, location))
    loop = new Date(currYear, currMonth, loop.getDate() + 1 )
  }
  return daysList
}
function createCalendarDay(date: Date, location: TLocation) {
  const { courts } = location
  const newDay: TCalendarDay = { date: date }

  if (!courts || !courts.length) return newDay

  const courtsAvailable = courts.reduce( (cumu, curr) => {
    if (!curr.slots || !curr.slots.length) return cumu
    const hasDay =  curr.slots.find(s => new Date(s.date).toDateString() === date.toDateString() )
    if (hasDay && hasDay.slots?.length) return [...cumu, { _id: curr._id, name: curr.name, slots: [hasDay] }]
    return cumu
  },[] as TCalendarCourt[])
  
  if (courtsAvailable.length) newDay.courts = courtsAvailable
  return newDay
}

export const LocationCalendar = ({location, sendData}: {location: TLocation, sendData: Function}) => {
  const { username } = useContext(UserContext)
  const [ date, setDate ] = useState(new Date())
  const [ selected, setSelected ] = useState<TCalendarDay | null>(null)

  const controlDate = (direction: string) => {
    if (direction === "prev") return setDate(new Date( date.setMonth( date.getMonth() - 1, 1) ) )
    if (direction === "next") return setDate(new Date( date.setMonth( date.getMonth() + 1, 1) ) )
  }

  const Day = ({day}: {day: TCalendarDay}) => {
    let klass = "prevent-selection day " + getWeekShortName(day.date.getDay())

    if (day.courts?.filter(c => c.slots?.length).length) return <button className={ klass + " btn" } onClick={() => setSelected(day)}>{ day.date.getDate() }</button>
    return <span className={ klass }>{ day.date.getDate() }</span>
  }
  
  const Court = ({date, court}: {date: Date, court: TCalendarCourt}) => {
    let klass = "court dashed fit"
    if (!court.slots?.length) klass += " disabled"

    return (
      <fieldset className={ klass }>
        <legend>{ court.name }</legend>
        <div id="slotList" >
          { court.slots ? court.slots.map(slot => slot.slots?.map(slot => <SlotDisplay slot={ slot } handleSlotToggle={() => handleToggleSlot(date, court, slot)} key={ slot.start }/>) )  : null }
        </div>
      </fieldset>
    )
  }
  const handleToggleSlot = (date: Date, court: TCalendarCourt, slot: TSlot) => {
    const data = { courtID: court._id, slotID: slot._id }
    if (date.getTime() < new Date().getTime()) return alert("You can't change past")
    if (slot.takenBy && slot.takenBy !== username() ) return alert("No puedes alternar las franjas horarias de otros")
    sendData("moderator/toggleSlot", data)
    setSelected(null)
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
        { generateMonth(date, location).map((d, index) => <Day day={ d } key={ index } /> )}
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