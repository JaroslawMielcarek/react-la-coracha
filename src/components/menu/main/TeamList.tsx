import './TeamList.css'
import { useEffect, useState } from "react"
import { TTeam } from 'shared/types'
import { Link } from 'react-router-dom'

function getLogo(object: TTeam){
  if (!object.logo || !object.logo.data || !object.logo.contentType) return require('assets/images/teams/la-coracha.png')
  return `data:${object.logo.contentType};base64,${object.logo.data}`
}

function logo (team: TTeam) {
  return (
    <img className='team__logo' src={ getLogo(team) } alt='logo of team'/>
  )
}

export default function TeamList ({teams, handleSelectedTeam}: {teams: TTeam[], handleSelectedTeam: Function}) {
 
  const [selected, setSelected] = useState<TTeam | null>(null)

  useEffect(()=> {
    // console.log({selected}) 
    // Navidate to selected team
    if (!selected) return
    handleSelectedTeam(selected)
    const t = setTimeout(() => {
      setSelected(null)
      clearTimeout(t)
    }, 4000)
  },[selected])

  function header () {
    return (
    <div className='teamsList__item first' style={ setHeight(null) }>
      <h2 className='header'>Equipos</h2>
    </div>
    )
  }

  if (!teams || !teams.length) {
    return (
      <>
        { header() }
        <div className='teamsList__item no-teams' style={ setHeight(null) }>
          <h4>No hay equipos! Intenta mas tarde.</h4>
        </div>
      </>
    )
  }

  function setHeight (current: string | null) {
    if (!teams || !teams.length) return { height: (window.innerHeight - 44) / 2 }
    if (!selected) return { height: ( (window.innerHeight - 44) / (teams.length + 1 ) ) + 'px' }
    if (current === selected.name) return { height: window.innerHeight + 'px' }
    return { height: 0 }
  }

  return (
    <>
      { header() }
        <>
          { teams.map(t => (
            <Link to={`team/${t.name}`} onClick={ () => setSelected(t) } className='teamsList__item' style={ setHeight(t.name) } key={t.name} >
              { logo(t) }
              <div className='team__details'>
                <h3 className='team__name'> { t.name } </h3>
                <p className={ 'team__gender' + ( t.gender === 'Female' ? ' feminino' : ' masculino' ) } > { t.gender } </p>
                <p className='team__league indended'> { t.league } </p>
              </div>
            </Link>
          ))}
        </>
    </>
  )
}