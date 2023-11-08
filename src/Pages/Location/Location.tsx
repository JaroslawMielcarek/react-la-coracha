import { car, map } from "assets/icons/icons";
import "./Location.css"

const locations = [
  {
  id: 'Campanillas',
  name: 'IES Campanillas',
  address: 'C. Fausto, 45, 29590 Málaga',
  link: 'https://goo.gl/maps/peLVBN1YdeHmEX1Z8'
  },
  {
  id: 'TorreAtalaya',
  name: 'IES Torre Atalaya',
  address: 'C. Fausto, 45, 29590 Málaga',
  link: 'https://goo.gl/maps/hKpYgZAhq9g9qsaDA'
  },
  {
  id: 'DivinoPastor',
  name: `Colegion Privado El Divino Pastor`,
  address: 'C. Gaucín, S/N, 29003 Málaga',
  link: 'https://goo.gl/maps/2cChBe7AFmzhfAP1A'
  },
  {
  id: 'AveMaria',
  name: `Colegion Ave Maria`,
  address: 'C. Gaucín, S/N, 29003 Málaga',
  link: 'https://goo.gl/maps/2tGBtKjgNC6HEbK39'
  }
]
export default function Location () {

  const renderLocations = () => {

    const locationList = locations.map(l => (
      <div className="location-wrapper">
        <div className="location">
          <p className="name">{l.name}</p>
          <p className="address">{l.address}</p>
        </div>
        <a className="car" id={ l.id } href={l.link}>{car}</a>
      </div>
    ))

    return (
      <div className="tabs">
        { locationList }
      </div>
    )
  }
  return (

    <div id="Location" className="page">
      <h1 className='header'>Ubicaciones</h1>
      <div id="location-list">
        {renderLocations()}
      </div>
      <div id="map">
      { map }
      </div>
    </div>
  )
} 