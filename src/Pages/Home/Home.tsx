import './Home.css'
import { joinIcon } from 'assets/icons/icons'
import { EnrollmentDisplay } from 'components/enrollment/EnrollmentDisplay'
import { CalendarDisplay } from 'components/calendar/CalendarDisplay'
import { useFetch } from 'utils/useFetch'
import { TSponsor } from 'shared/types'

const logo = require('assets/images/teams/la-coracha.png')

export default function Home () {
  return (
    <div id="home" className='page'>
      <section id="hero">
          <img className="logo" src={logo} alt="laCoracha-logo"/>
          <h1 className="hero__header">Pasión Voleibol convertida en Club</h1>
          <p className="hero__description">no se requieren habilidades, te enseñaremos todo</p>
          <a href='/join' className="join_link btn color"> { joinIcon } Unirse </a>
      </section>
      <section>
        <div className='sectionHeader'>
          <h1 className='header'>Bienvenidos</h1>
        </div>
        <div className='sectionBody'>
          <p>Somos un club nacido en Málaga y con ganas de fomentar este pequeño y gran deporte en la capital. Llevamos tiempo con la necesidad de que Málaga Capital fundase un motor que diese alas al voleibol.</p>
          <p>Este club nace de una idea entre uno/as amigo/as enamorados de este deporte que queremos que perdure en el tiempo, y, aunque somos pequeños, deseamos que crezca para que llegue a cada persona que quiera disfrutar del voleibol en Málaga.</p>
          <p>Y sobretodo: APRENDER, JUGAR, Y LO MÁS IMPORTANTE, DIVERTIRSE!!!</p>
          <p>Nuestro logo es un homenaje a nuestra ciudad: Málaga.</p>
          <p>Somos La Coracha, algo que forma parte del ADN de esta ciudad, la muralla que une nuestra Alcazaba con el Castillo de Gibralfaro y que formaba el mayor conjunto defensivo de Al-Andalus. Estos elementos distintivos aparecen, por tanto, en nuestro logo.</p>
          <p>También hemos querido brindar un homenaje al nombre de nuestra ciudad, de casi 3.000 años de historia, y añadir las letras del nombre fenicio MALAKA</p>
          <p>El sol, que se transforma en balón para cualquier deporte, y el azul intenso de nuestro Mar Mediterráneo.</p>
        </div>
      </section>
      <section id="calendar">
        <div className='sectionHeader'>
          <h1 className='header'>Calendario</h1>
        </div>
        <div className='sectionBody'>
          <CalendarDisplay />
        </div>
      </section>
      <section>
        <div className='sectionHeader'>
          <h1 className='header'>Inscripción</h1>
        </div>
        <div className='sectionBody'>
          <p className="extra-message">Aquí está la lista de las categorías que ofrecemos y la disponibilidad. Pulsa <a href='/join' className="join_link">aqui</a> si estás interesado en unirte.</p>
          <EnrollmentDisplay/>
        </div>
      </section>
      <section>
        <div className='sectionHeader'>
          <h1 className='header'>Patrocinadores</h1>
        </div>
        <SponsorsDisplay/>
      </section>
      <section id="footer">
        <div>
          Copyright © { new Date().getFullYear() } La Coracha. All rights reserved.
        </div>
        <div>
          Privacy Policy
        </div>
        <div>
          Terms of Use
        </div>
      </section>
    </div>
  )
}

function getLogo(object: TSponsor | undefined){
  if (!object) return null
  if (!object.logo || !object.logo.data || !object.logo.contentType) return require('assets/images/teams/default.svg')
  return `data:${object.logo.contentType};base64,${object.logo.data}`
}

const SponsorsDisplay = () => {
  const [ sponsors ] = useFetch<TSponsor[]>({ url: "public/getAllSponsors", errorTitle: "Sponsors"})
  
  const renderMainSponsor = () => {
    if (!sponsors || !sponsors.length) return null
    const mainSponsor = sponsors.find(s => s.isMain)

    if (!mainSponsor) return null
    return (
      <div id="mainSponsors">
        <Sponsor sponsor={ mainSponsor } />
      </div>
    )
  }
  const renderSubSponsors = () =>{
    if (!sponsors || !sponsors.length) return null
    const subSponsors = sponsors.filter(s => !s.isMain)

    if (!subSponsors || !subSponsors.length) return null
    return (
      <div id="subSponsors">
        { subSponsors.map(sponsor => <Sponsor sponsor={ sponsor }  key={ sponsor._id }/>) }
      </div>
    )
  }
  return (
    <div id="sponsorsDisplay">
      { renderMainSponsor() }
      { renderSubSponsors() }
    </div>
  )
}

const Sponsor = ({sponsor}: {sponsor: TSponsor}) => {

  const klass = (sponsor.isMain) ? "sponsor main" : "sponsor"
  return (
    <a className={ klass } href={ `https://${sponsor?.link}` }>
      <img src={ getLogo(sponsor) } alt={ sponsor.name } />
      <p className="link">{ sponsor.link }</p>
    </a>
  )
}