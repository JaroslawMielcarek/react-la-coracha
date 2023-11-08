import "./Practices.css"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useFetch } from "utils/useFetch"
import { UserContext } from "utils/useUser"
import { TPractice, TPlayerPractice, TPracticePlayer } from "shared/types"
import Modal from "components/modal/Modal"
import { getMonthNameByNumber, isBeforeToday, MONTH_NAMES, WEEK_DAYS_SHORT } from "utils/time"


export const Practices = () => {
  const [ userData ] = useFetch<TPracticePlayer>({url: "user/getOwnPracticeData", errorTitle: "Get practice data"})
  const { isLogged } = useContext(UserContext)
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!isLogged()) return navigate("/login")
  },[isLogged])

  return (
    <section >
      <h1>Quedadas</h1>
      <p className="extra-message">Aquí encontrarás quedadas este mes y tus estadísticas</p>
      <div id="practice">
        <PositionStatistics practice={userData?.practices} preferedPositions={ userData?.preferedPositions } />
        <Calendar user={ userData }/>
      </div>
    </section>
  )
}

const PositionStatistics = ({practice, preferedPositions}: {practice: TPlayerPractice | undefined, preferedPositions: { choosen: string }[] | undefined }) => {

  const renderPreferedPositions = () => {
    if (!preferedPositions || !preferedPositions.length) return <p className="extra-message red">No pudimos encontrar sus preferencias de posición. Por favor, configúrelos primero; de lo contrario, siempre se le agregará a la cola.</p>

    return (
      <div className="prefList">
        { preferedPositions && preferedPositions.map(p => <span className="position" key={ p.choosen }>{ p.choosen }</span>) }
      </div>  
    )
  }
  return (
    <div id="practice-statistics">
      <fieldset className="dashed">
        <legend className="small color">Preferencia de posición GUARDADA</legend>
        { renderPreferedPositions() }
      </fieldset>
      <fieldset className="dashed">
        <legend className="small color">Estadísticas</legend>
        <p>Asististe: <span className="value">{ practice?.attended }</span></p>
        <div className="practice-stats">
        { practice?.positionsPlayed && Object.entries(practice?.positionsPlayed).map( ([key, value]) => (
          <div className="position" key={ key }>
            <p className="value">{ value }</p>
            <p>{ key }</p>
          </div>
        ))}
        </div>
      </fieldset>
    </div>
  )
}

type TCalendarDay = {
  _id: string
  date: Date
  isToday: boolean
  practice?: TPractice,
}

const generateWeeks = (dates: TCalendarDay[]) => {
  const daysInWeek = 7
  const tempArray = []
  for (let i = 0; i < dates.length; i += daysInWeek) {
    tempArray.push(dates.slice(i, i + daysInWeek))
  }
  return tempArray
}


function areEqualDates (firstDate: Date, secondDate: Date) {
  const first = firstDate.toDateString()
  const second = secondDate.toDateString()
  return (first < second || first > second) ? false : true
}

function generateDates() {
  const oneDay = 24 * 60 * 60 * 1000
  const oneWeek = 7 * oneDay
  const currDay = new Date()
  const firstDayOfCurrentWeek = new Date().setDate(currDay.getDate() - currDay.getDay() + 1)
  const lastDayOfCurrentWeek = new Date().setDate(currDay.getDate() + (7 - currDay.getDay()))
  const startDay = new Date( firstDayOfCurrentWeek - ( 2 * oneWeek ) )
  const endDay = new Date( lastDayOfCurrentWeek + ( 2 * oneWeek ) - oneDay )

  const list: TCalendarDay[] = []
  let loop = new Date(startDay)
  while (loop < endDay) {
    list.push({
      _id: loop.toDateString(),
      date: new Date(loop),
      isToday: areEqualDates(currDay, loop),
    })
    loop = new Date(loop.setDate(loop.getDate() + 1))
  }
  return list
}

const dates: TCalendarDay[] = generateDates()

const Calendar = ({user}: {user: TPracticePlayer | undefined}) => {
  const [practices, sendData] = useFetch<TPractice[]>({url: "user/getAllPractices", errorTitle: "Get practice data"})
  const [ selected, setSelected ] = useState<TPractice | null>(null)
  const month = new Date().getMonth()
  const practiceMap = new Map(practices?.map(day => [day.dateTime.date, day]))


  const handleToggleSubscription = (practice: TPractice) => {
    const player = { ...user, nick: user?.nick.value }
    sendData("user/subscribePractice", {_id: practice._id, player: player})
    setSelected(null)
  }
  const hasPractice = (date: Date) => {
    return practiceMap.get(date.toISOString().split("T")[0])
  }

  const isSubscribed = (practice: TPractice | undefined) => {
    if (!user || !practice) return false
    return practice.players.find(p => p._id === user._id)
  }

  const getPracticeElement = (date: Date) => {
    const practice = hasPractice(date)
    if (!practice) return 

    return (
      <>
        <span className='practiceTime'>{ practice.dateTime.time }</span>
        <span className='ocupationPercent' style={ {top: ( 100 - practice.percentOcupied || 0 ) + '%' } } key={ practice.percentOcupied }/>
      </>
    )
  }
  
  const generateDates = (day: TCalendarDay) => {
    let klass = "day"
    if (day.isToday) klass += " today"
    if (day.date.getMonth() !== new Date().getMonth()) klass += " otherMonth"
    if (hasPractice(day.date)) klass += " practice"
    if (isSubscribed(hasPractice(day.date))) klass += " subscribed"
    return (
    <div className={ klass } key={ day._id } onClick={ () => handlePracticeClick(day.date) }>
      <p>{ day.date.getDate() }</p>
      { getPracticeElement(day.date) }
    </div>
    )
  }

  function handlePracticeClick( practiceDate: Date) {
    if (!practiceDate) return 

    const practice = hasPractice(practiceDate)
    if(!practice) return
    setSelected(practice)
  }
  
  return (
    <div id="practiceCalendar">
      <h3 className="monthName">{ MONTH_NAMES[month] }</h3>
      <div id="header-days">
        { WEEK_DAYS_SHORT.map(d => <span className="" key={ d }>{ d }</span>)}
      </div>
      <div id="body-days">
        { generateWeeks(dates).map( (week, index) => (
          <div className='week' key={ index }>
            { week.map( w => generateDates(w) ) }
          </div>
        )) 
        }
      </div>
      { selected && <Details practice={ selected } user={ user } subscribe={ handleToggleSubscription } hideDetails={ () => setSelected(null) } />}
      <div id="legend-days">
        <p className='legend'>Free</p>
        <p className='legend full'>Complete</p>
        <p className='legend subscribed'>Subscribed</p>
        <p className='legend current-day'>Today</p>
      </div>
    </div>
  )
}

const Details = ({practice, user, subscribe, hideDetails}: {practice: TPractice, user: TPracticePlayer | undefined, subscribe: Function, hideDetails: Function}) => {
  const date = practice.dateTime.date.split("-")
  const day = date[2]
  const month = getMonthNameByNumber(date[1])
  const isSubscribed = user ? !!practice.players.find(p => p._id === user._id) : false
  const renderQueue = () => {
    if (!practice.playersInQueue?.length) return null

    return (
      <div id="queuePlayers">
        <p className="extra-message red">Jugadores en cola</p>
        { practice.playersInQueue.map(player => (
          <div className="player" key={ player._id }>
            <span className="name">{ player.nick }:</span>
            <div className="prefList">
              { player.preferedPositions && player.preferedPositions.map(position => <span className="position">{ position.choosen }</span>) }
            </div>
            </div>
        )) }
      </div>
      
    )
  }
  const renderButton = () => {
    let klass = "btn full-width color"
    if (isBeforeToday(practice.dateTime.date)) klass += " disabled"

    if(isSubscribed) return <button className={ klass + " red" } onClick={() => subscribe(practice) }>unSubscribe</button>
    return <button className={ klass } onClick={() => subscribe(practice) }>Subscribe</button>
  }
  return (
    <Modal
      onClose={ () => hideDetails() }
    >
      <div id="details">
        <div>
          <h3 className="date"><span className="small">{ day }</span> { month } <span className="small">at { practice.dateTime.time }</span></h3>
          <p>{ practice.location }</p>
        </div>
        { renderQueue() }
        { practice.teams && practice.teams.map((team, index) => (
          <fieldset className="team dashed" key={ index }>
            <legend className="small">Equipo {index + 1}</legend>
            { team.map(ele => (
              <div className="position" key={ ele.position }>
                <span className="name">{ele.position}:</span>
                { ele.subscribed.length > 0 && ele.subscribed.map(player => <span className="player" key={ player._id }>{ player.nick.toString() }</span>) }
              </div>
            ))}
          </fieldset>
        ))}
        { renderButton() }
      </div>
    </Modal>
  )
}