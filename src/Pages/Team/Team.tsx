import "./Team.css"
import { useFetch } from "utils/useFetch"
import { useContext, useEffect, useState } from "react"
import { field } from "assets/images/field"
import { profileWoman, profileMan } from "assets/images/profile"
import Modal from "components/modal/Modal"
import PerformanceDonutGraph from "components/performanceDonutGraph/PerformanceDonutGraph"
import { useParams } from "react-router-dom"
import { UserContext } from "utils/useUser"
import { isEmpty } from "utils/object"
import { TTeam, TPlayer } from "shared/types"


export const Team = () => {
  const teamName = useParams().teamName
  const { isPlayer, isModerator } = useContext( UserContext )
  const hasPermision = isPlayer() || isModerator()
  const [ teamData , fetchData ] = useFetch<TTeam>({ url: hasPermision ? "user/getTeam" : "public/getTeam", initialPayload: { name: teamName }, errorTitle: "Teams Manager" })
  const { reserves, mainPlayers } = rankPlayers(teamData?.players)

  useEffect(() => {
    hasPermision ? fetchData("user/getTeam", { name: teamName }) : fetchData("public/getTeam", { name: teamName } )
  }, [teamName, fetchData, hasPermision])

  
  const renderPlayers = () => {

    return (
      <>
        { Object.entries(mainPlayers).map( ([key, value]) => (
          value.map( (p, index) => <PlayerCard player={ p.player } index={ index } key={ key}/> )
        ) )}
        <div id="reserves">
          { reserves.map( (player, index) => <PlayerCard player={ player } index={ index } key={ player._id }/> )}
      
        </div>
      </>
    )
  }
  return (
    <section>
      <h3>{ teamName }</h3>
      <p className="extra-message">{ teamData?.description }</p>
      <div id="alignment">
        <h5>La alineación</h5>
        <div id="playersList">
          { field }
          { renderPlayers() }
        </div>
      </div>
    </section>
  )
}

type TRanked = {
  player: TPlayer,
  score: number
}
function rankPlayers (list: TPlayer[] | undefined) {
  if (!list) return { reserves: [], mainPlayers: [] } 
  const divided = {
    Exterior: [] as TRanked[],
    Central: [] as TRanked[],
    Libero: [] as TRanked[],
    Colocador: [] as TRanked[],
    Opuesto: [] as TRanked[]
  }
  const reserves: TPlayer[] = []

  for (const index in list) {
    const player = list[index]
    const playerScore = calculatePlayerScore(player)
    const playerPosition = player.position

    if (!playerPosition) {
      reserves.push(player)// WE NEED TO DO SOMETHING
    }else {
      const propName = playerPosition as keyof typeof divided

      if (!divided[propName]) divided[propName] = []

      if (!divided[propName].length) divided[propName].push({ player: player, score: playerScore })
      else {
        divided[propName].push({ player: player, score: playerScore })
        divided[propName] = [...divided[propName]].sort( (a, b) => a.score - b.score )
      }
    }
  }

  return {
    reserves: reserves,
    mainPlayers: {
      Exterior: divided.Exterior ? divided.Exterior.splice(0, 2) : [],
      Central: divided.Central ? divided.Central.splice(0, 1) : [],
      Libero: divided.Libero ? divided.Libero.splice(0, 1) : [],
      Colocador: divided.Colocador ? divided.Colocador.splice(0, 1) : [],
      Opuesto: divided.Opuesto ? divided.Opuesto.splice(0, 1) : []
    }
  }
}

function calculatePlayerScore (player: TPlayer) {
  const position = player.position
  const performance = player.inTeamPerformance
  if (!performance || !position) return 0

  const SCORE_WEIGHTS = {
    Exterior: { attack: 4, recieve: 5, set: 1, block: 2, serve: 3 },
    Colocador: { attack: 1, recieve: 3, set: 5, block: 2, serve: 4 },
    Central: { attack: 4, recieve: 2, set: 1, block: 5, serve: 3 },
    Libero: { attack: 2, recieve: 5, set: 4, block: 1, serve: 3 },
    Opuesto: { attack: 5, recieve: 2, set: 1, block: 4, serve: 3 },
  }
  const propName = position as keyof typeof SCORE_WEIGHTS
  const score = Object.entries(performance).reduce( (total, [key, value]) => {
    const percent = parseInt(((value.current.good / value.current.total) * 100).toFixed(0))
    if (!percent) return total
    const weight = SCORE_WEIGHTS[propName]
    if (!weight) return total
    return total + (percent * weight[key as keyof typeof weight])
  }, 0)
  const result = Math.round( (score + Number.EPSILON) * 100) / 100
  return result
}

const PlayerCard = ({player, index}: { player: TPlayer, index: number }) => {
  const [ showDetails, setShowDetails ] = useState(false)
  const pos = !index ? player.position : `${player.position}-${index}`


  const renderPlayerAvatar = () => (player.isFemale) ? profileWoman : profileMan

  return (
    <div className="player" data-position={ pos }>
      <div className="player-card" onClick={() => setShowDetails(true)}>
        <div className="player-avatar">
          { renderPlayerAvatar() }
        </div>
        <p className="player-position">{ player.position }</p>
      </div>
      {showDetails && (
        <Modal onClose={ () => setShowDetails(false) }>
          <Details player={ player } />
        </Modal>
      )}
    </div>
  )
}

const Details = ({player}: { player: TPlayer}) => {

  const renderPhoto = () => {
    if ( !player.photo ) return (player.isFemale) ? profileWoman : profileMan
    if ( player.photo instanceof File ) return <img className="sponsor-logo" src={ URL.createObjectURL(player.photo) } alt="team logo"/>
    if ( !player.photo.contentType || !player.photo.data ) return (player.isFemale) ? profileWoman : profileMan
    return <img className="sponsor-logo" src={ `data:${player.photo.contentType || ""};base64,${player.photo.data || ""}`} alt="team logo"/>
  }
  return (
    <div className="player-details">
      <div className="player-image">
        { renderPhoto() }
      </div>
      <div className="details">
        <h4 className="player-name">{ player.nick || "-" }</h4>
        <p className="player-position">Posicion: <span>{ player.position || "-" }</span></p>
        <p className="player-position">Numero: <span>{ player.number || "-" }</span></p>
        <p className="player-position">Altura: <span>{ player.height || "-" }</span></p>
        <p className="player-position">Peso: <span>{ player.weight || "-" }</span></p>
        <p className="player-position">ManoDominante: <span>{ player.dominantHand || "-" }</span></p>
      </div>
      { player.inTeamPerformance && !isEmpty(player.inTeamPerformance) && <PerformanceDonutGraph stats={ player.inTeamPerformance }/> }
    </div>
  )
}