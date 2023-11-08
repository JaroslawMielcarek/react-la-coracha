import { Table } from "components/table/Table"
import "./Permissions.css"
import { useState, useEffect, useContext } from "react"
import { useFetch } from "utils/useFetch"
import { SelectInput } from "components/selectInput/SelectInput"
import { useNavigate } from "react-router-dom"
import { UserContext } from "utils/useUser"
import { TPropertyWithPermission } from "shared/types"

type TRole = {
  name: string
}
type TPlayer = {
  memberID: string,
  nick: TPropertyWithPermission,
  isFemale: boolean,
  team: string,
  roles: TRole[]
}
export const Permissions = () => {
  const [playersPermisions, updatePermision] = useFetch({url: "admin/getAllUserPermissions", errorTitle: "Permission Manager"})
  const [memberIDList, sendData] = useFetch({url: "admin/getAllMembersIDs", errorTitle: "Member Manager"})
  const { isLogged } = useContext(UserContext)
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!isLogged()) return navigate("/login")
  },[isLogged])

 return (
    <section>
      <h1>Área de Permisos</h1>
      <PlayersPermissionManager players={ playersPermisions as TPlayer[] } updatePermision={ updatePermision } />
      <MemberIDManager memberIDList={ memberIDList as TMemberID[] } sendData={ sendData } />
    </section>
  )
}

const topPermision = (p: TPlayer) => { 
  const userPermissions = p.roles.map(r => r.name)
  if (userPermissions.includes('admin')) return 'admin'
  if (userPermissions.includes('moderator')) return 'moderator'
  if (userPermissions.includes('player')) return 'player'
  return 'user'
}

const PlayersPermissionManager = ({players, updatePermision}: {players: TPlayer[] | undefined, updatePermision: Function}) => {
  const [list, setList] = useState<TPlayer[]>(players || [])
  
  useEffect(() => {
    setList(players || [])
  }, [players])

  const handleSortSelection = (val: string) => {
    const propName = val as keyof TPlayer
    setList([...list].sort( (a: TPlayer, b: TPlayer) => {
      const valA = val === "name" ? a.nick.value : val === "permission" ? topPermision(a) : a[propName]
      const valB = val === "name" ? b.nick.value : val === "permission" ? topPermision(b) : b[propName]
      return valA.toString().localeCompare(valB.toString(),'en' )
    }) )
  }
  const handlePermissionChange = (memberID: string, value: TRole[]) => {
    updatePermision("admin/updateUserPermissions", {roles: value.map(r => r.name), memberID: memberID }, "Update user permission")
  }
  
  return (
    <Table id="permissionsManager">
      <div className="table-head">
          <p className="column"></p>
          <p className="column sort" onClick={ () => handleSortSelection("memberID")}>MemberID</p>
          <p className="column sort" onClick={ () => handleSortSelection("name")}>Nick</p>
          <p className="column gender">Género</p>
          <p className="column team sort" onClick={ () => handleSortSelection("team")}>Equipo</p>
          <p className="column sort" onClick={ () => handleSortSelection("permission")}>Permiso</p>
      </div>
      <div className="table-body">
        { list && list.map( (p, index) => <Player p={ p } handlePermissionChange={ handlePermissionChange} key={ p.memberID }/>) }
      </div>
    </Table>
  )
}

const Player = ({p, handlePermissionChange}: {p: TPlayer, handlePermissionChange: Function}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [person, setPerson] = useState<TPlayer>(p)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(()=> {
    (person.roles.length !== p.roles.length) ? setHasChanges(true) : setHasChanges(false)
  },[person, p])

  const handleChange = () => {
    handlePermissionChange(person.memberID, person.roles)
    setIsEditing(false)
  }
  const handleInputChange = (val: string) => {
    const rolesList = [{name: "user"}]
    if (val === "player") return alert("Si desea establecer permiso como 'player', agregue usuario a cualquier equipo!")
    if (val === "moderator") rolesList.push({name: "moderator"})
    if (val === "admin") rolesList.push(...[{name: "moderator"}, {name: "admin"}])
    setPerson(state => ({
      ...state,
      roles: rolesList
    }))
  }

  const renderActionButton = () => {
    if (!isEditing) return <button className='btn color' onClick={ () => setIsEditing(true) }>Editar</button>
    if (!hasChanges) return <button className='btn white' onClick={ () => setIsEditing(false) }>Anular</button>
    return <button className='btn color red' onClick={ handleChange }>Guardar</button>
  }

  const renderRoles = () => {
    if (isEditing) return <SelectInput name="roles" label="" value={ topPermision(person)} options={["user", "player", "moderator", "admin"]} onChange={handleInputChange} />
    return <p className="column">{ topPermision(person) }</p>
  }

  return (
    <div className="table-row">
      <div className="action column">
        { renderActionButton() }
      </div>
      <p className="column">{ p.memberID }</p>
      <p className="column">{ p.nick.value }</p>
      <p className="column gender">{ p.isFemale ? "Mujer" : "Hombre" }</p>
      <p className="column team">{ p.team }</p>
      { renderRoles() }
      </div>
  )
}

type TMemberID = {
  memberID: string,
  memberAssigned: boolean,
  isAvailable: boolean
}
const MemberIDManager = ({memberIDList, sendData}: {memberIDList: TMemberID[] | [], sendData: Function}) => {
  const [list, setList] = useState<TMemberID[]>(memberIDList || [])
  const [memberID, setMemberID] = useState<number | null>(null)

  useEffect(() => {
    setList(memberIDList? memberIDList.sort((a,b) => a.memberID.localeCompare(b.memberID, 'en')) : [])
  }, [memberIDList])

  const handleSetAvailability = (id: string, val: boolean) => {
    sendData("admin/updateMemberID", { memberID: id, isAvailable: val })
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const num = parseInt(val)
    // if (isNaN(num)) return
    setMemberID(num)
  }
  const handleOptionClick = (e: string) => {
    if (e === "remove" && window.confirm("¿Está seguro de que desea eliminar este ID de miembro? ¡El jugador con esta ID de miembro también será eliminado!")) {
      return sendData("admin/deleteMemberID", { memberID: memberID })
    }
    return sendData("admin/createMemberID", { memberID: memberID })
  }
  
  const renderOptions = () => {
    return (
      <div className="multiplePanels">
        <fieldset>
          <legend className="extra-message">Agregar / Eliminar</legend>
          <input type="number" value={ memberID || '' } min={ 1 } max={ 9999 } placeholder="1234" onChange={ handleChange }/>
          { !!memberID && (
            <>
              <button className="btn color" onClick={ () => handleOptionClick("add") }>Aagregar</button>
              <button className="btn text red" onClick={ () => handleOptionClick("remove") }>Eliminar</button>
            </>
          )}
        </fieldset>
      </div>
    )
  }
  const renderLegend = () => {
    return (
      <div className="legendContainer">
        <p className="legend">Disponible</p>
        <p className="legend blocked">Bloqueado</p>
        <p className="legend assigned">Asignado</p>
      </div>
    )
  }
  const renderIDs = () => {
    if (!list) return <p className="no-data">No hay ningun ID disponible</p>
    return (
      <div className="idsList">
        { list.map( m => <MemberButton m={ m } onClick={ handleSetAvailability } key={ m.memberID }/> )}
      </div>
    )
  }
  return (
    <div id="memberIDManager">
      <h3>Member IDs</h3>
      { renderOptions() }
      { renderLegend() }
      { renderIDs() }
    </div>
  )
}

const MemberButton = ({ m, onClick }: { m: TMemberID, onClick: Function }) => {
  let klass = "btn"
  if (m.memberAssigned) klass += " assigned"
  if (!m.isAvailable) klass += " blocked"
  return  <button className={ klass } onClick={ () => onClick(m.memberID, !m.isAvailable) }>{ m.memberID } { m.isAvailable }</button>
}