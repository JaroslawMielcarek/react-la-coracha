import "./PageSettings.css"
import { LocationManagement } from "components/locations/LocationManagement"
import { Tab, Tabs } from "components/tabs/Tabs"
import { ClubsManagement } from "components/clubs/ClubsManagement"


export const PageSettings = () => {

  return (
    <section>
      <h1>Admin Panel</h1>
      <Tabs>
        <Tab label="Ubicaciones" key={"Ubicaciones"}>
          <p className="extra-message">Administrar Ubicaciones del club</p>
          <LocationManagement/>
        </Tab>
        <Tab label="Clubs" key={"Clubs"}>
          <p className="extra-message">Administrar Clubs contrarios</p>
          <ClubsManagement/>
        </Tab>
      </Tabs>
    </section>
  )
}