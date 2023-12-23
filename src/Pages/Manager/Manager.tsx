import { EnrollmentManagement } from "components/enrollment/EnrollmentManagement"
import { PlayersManagement } from "components/players/PlayersManagement"
import { TeamsManagement } from "components/teams/TeamsManagement"
import { Tab, Tabs } from "components/tabs/Tabs"
import { CalendarManagement } from "components/calendar/CalendarManagement"
import { PracticeManagement } from "components/practice/PracticeManagement"
import { useContext, useEffect } from "react"
import { UserContext } from "utils/useUser"
import { useNavigate } from "react-router-dom"
import { LocationsCalendars } from "components/locations/LocationCalendar"


export const Manager = () => {
  const { isLogged } = useContext(UserContext)
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!isLogged()) return navigate("/login")
  },[isLogged])

  return (
    <section>
      <h1>Moderator panel</h1>
      <Tabs>
        <Tab label="Calendario" key={'Calendario'}>
          <p className="extra-message row">Administrar calendario del club</p>
          <CalendarManagement/>
        </Tab>
        <Tab label="Quedadas" key={'Quedadas'}>
          <p className="extra-message row">Administrar quedadas en el club</p>
          <PracticeManagement/>
        </Tab>
        <Tab label="Jugadores" key={'Jugadores'}>
          <p className="extra-message row">Administrar jugadores del club</p>
          <PlayersManagement/>
        </Tab>
        <Tab label="Equipos" key={'Equipos'}>
          <p className="extra-message row">Administrar equipos del club</p>
          <TeamsManagement/>
        </Tab>
        <Tab label="Inscriptiones" key={'Inscriptiones'}>
          <p className="extra-message row">Administrar inscripciones al club</p>
          <EnrollmentManagement/>
        </Tab>
        <Tab label="Pistas" key={'PistasDisponibles'}>
          <p className="extra-message row">Administrar pistas del club</p>
          <LocationsCalendars/>
        </Tab>
      </Tabs>
    </section>
  )
}