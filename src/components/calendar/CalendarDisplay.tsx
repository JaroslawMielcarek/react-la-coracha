import { useState, Suspense } from "react"
import { useFetch } from "utils/useFetch"
import "./CalendarDisplay.css"
import { Table } from "components/table/Table"
import { SelectInput } from "components/selectInput/SelectInput"
import { getMinutesHoursTimeFormat, isoDateToDayMonthYear } from "utils/time"
import { defaultTeam } from "assets/images/teams/default"
import ClubsLogos from "assets/images/teams/list"
import { getFilteredByTimePeriod } from "utils/object"
import { TMatch, TMatchTeam } from "shared/types"


export const CalendarDisplay = () => {
  const [players] = useFetch<TMatch[]>({ url: "public/getAllMatches", errorTitle: "Calendar Display"})
  const [selectedFilter, setSelectedFilter] = useState("Semana")

  const renderFilterPanel = () => {
    const handleFilterSelection = (val: string) => {
      if (val) setSelectedFilter(val)
    }
    return (
      <div className="filter-row">
        <SelectInput name="sortBy" label="Mostrar" value={ selectedFilter } onChange={handleFilterSelection} options={["Todo","Semana","Mes actual",'Temporada']}/>
      </div>
    )
  }
  const renderMatches = () => {
    const list = getFilteredByTimePeriod<TMatch>(selectedFilter, players)
    if (!list || !list.length) return <p className="no-data">No hay ningun partido en este momento</p>

    return list.map( (m, index) => {
      const isFinished = (new Date(m.dateTime.date).getTime() - new Date().getTime()) < 0
      let klass = "match"
      if ( m.friendly ) klass += " friendly"
      if ( isFinished ) klass += " past"

      const renderResults = (name: string) => {
        if (!isFinished) return null
        const team = m[`${name}Team` as keyof TMatch] as TMatchTeam
        return <p className="result-sets">{ !team.wonSets ? '-' : team.wonSets }</p>
      }

      const getClubLogo = (name: string) =>  {
        const team = m[`${name}Team` as keyof TMatch] as TMatchTeam
        if (!team.clubName) return defaultTeam
      
        const fileName = team.clubName.toLowerCase().trim().replaceAll(" ", "") as keyof typeof ClubsLogos
        return ClubsLogos[fileName] ? ClubsLogos[fileName] : defaultTeam
      }
      return (
        <li className={ klass } key={ index }>
          <div className="team home-team">
            <img className="club-logo" src={ getClubLogo("home")} alt={ m.homeTeam.clubName }/>
            <h4 className="club-name">{ m.homeTeam.clubName }</h4>
            <p className="team-name">{ m.homeTeam.teamName }</p>
            { renderResults("home") }
          </div>
          <div className="match-info">
            <p className="league">{ m.league }</p>
            <span className="versus">VS</span>
            <p className="date">{ isoDateToDayMonthYear(m.dateTime.date) }</p>
            <p className="location">{ m.location }</p>
            <p className="time">{ getMinutesHoursTimeFormat(m.dateTime.time) }</p>
            { m.friendly && <p className="friendly">Amistoso</p> }
          </div>
          <div className="team guest-team">
            <img className="club-logo" src={ getClubLogo("guest")} alt={ m.guestTeam.clubName }/>
            <h4 className="club-name">{ m.guestTeam.clubName }</h4>
            <p className="team-name">{ m.guestTeam.teamName }</p>
            { renderResults("guest") }
          </div>
        </li>
      )
    })
  }
  return (
    <>
      { renderFilterPanel() }
      <Table>
        <ul>
          <Suspense fallback={<p>Loading..</p>}>
            { renderMatches() }
          </Suspense>
        </ul>
      </Table>
      <div className="legendContainer">
        <p className="legend">Futuro</p>
        <p className="legend friendly">Amistoso</p>
        <p className="legend disputed">Disputado</p>
      </div>
    </>
  )
}