import './MainMenu.css'
import { facebookIcon, instagramIcon, whatsappIcon, teamIcon, googlePinIcon } from 'assets/icons/icons'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import TeamList from './TeamList'
import CustomToolTip from 'components/ToolTip/CustomToolTip'
import { useFetch } from 'utils/useFetch'
import { TTeam } from 'shared/types'

export default function MainMenu () {
  const [isListOpen, setIsListOpen] = useState(false)
  const [teams] = useFetch({ url: "public/getAllTeams", errorTitle: "Menu Teams List" })

  const hangleSelectedTeam = (selected: TTeam) => {
    if (selected) {
      const t = setTimeout(() => {
        setIsListOpen(false)
        clearTimeout(t)
      },2000)
    }
  }

  return (
    <>
    <div className="menu-bar">
      <div id='teamsList' className={ isListOpen ? 'open': '' } >
        <TeamList teams={teams ? teams as TTeam[] : []} handleSelectedTeam={ hangleSelectedTeam }/>
      </div>
      <div className="buttons buttons--left">
        <a className="icon facebook" href='https://m.facebook.com/people/La-Coracha-Perfil/100013615204865/'>
          { facebookIcon }
        </a>
        <a className="icon instagram" href='https://www.instagram.com/cd.lacoracha/'>
          { instagramIcon }
        </a>
      </div>
      <div className="buttons buttons--center">
        <CustomToolTip text='¡Mira nuestros equipos!' direction='bottom' delay={ 3000 } />
        <span className="icon teams" onClick={() => setIsListOpen(!isListOpen)}>
            { teamIcon }
        </span> 
      </div>
      <div className="buttons buttons--right">
        <Link className="icon location" to="/locations">
          { googlePinIcon }
        </Link>
          <a className="icon contact" href='https://wa.me/393497492300'>
            { whatsappIcon }
          </a>
      </div>
    </div>
    </>
  )
}