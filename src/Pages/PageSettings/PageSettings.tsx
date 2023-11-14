import "./PageSettings.css"
import { LocationManagement } from "components/locations/LocationManagement"
import { Tab, Tabs } from "components/tabs/Tabs"
import { ClubsManagement } from "components/clubs/ClubsManagement"


export const PageSettings = () => {

  return (
    <section>
      <h1>Admin Panel</h1>
      <Tabs>
        <Tab label="Ubicacions" key={"Ubications"}>
          <p className="extra-message">Administrar ubications del club</p>
          <LocationManagement/>
        </Tab>
        <Tab label="Clubes" key={"Clubes"}>
          <p className="extra-message">Administrar clubes contrarios</p>
          <ClubsManagement/>
        </Tab>
      </Tabs>
    </section>
  )
}