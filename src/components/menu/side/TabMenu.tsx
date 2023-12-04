import { Link } from "react-router-dom"
import "./TabMenu.css"
import CustomToolTip from "components/ToolTip/CustomToolTip"
import { profileWoman, profileMan } from "assets/images/profile"
import { homeIcon, settingsIcon, profileIcon, calendarIcon, dolarIcon, permissionIcon, pageSettings } from "assets/icons/icons"
import { useEffect, useState } from "react"
import { TToolTipArguments } from "types"
import { useContext } from "react"
import { UserContext } from "utils/useUser"
import { useNavigate } from "react-router-dom"

type TabPropTypes = {
  to: string,
  icon: JSX.Element,
  onClick?: Function,
  toolTip?: null | TToolTipArguments 
  isVisible?: boolean,
  children?: React.ReactNode
}

function Tab (props: TabPropTypes) {
  const onClick = () => {
    if (props.onClick) props.onClick()
  }
  const tt = props.toolTip ? <CustomToolTip text={ props.toolTip?.text } direction={ props.toolTip?.direction } delay={ props.toolTip?.delay } /> : null
  return (
    <Link to={ props.to } className={"tab " + (props.isVisible ? 'visible' : '')} onClick={onClick}>
      { tt }
      <div className="avatar">
        { props.icon }
      </div>
    </Link>
  )
}
function LoginTab ({icon, isLogged, logout, isVisible = false}: {icon: JSX.Element, isLogged: boolean, logout: Function, isVisible: boolean}) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  // Auto-close after 2s
  useEffect(() => {
    if (!isOpen) return

    const t = setTimeout(() => {
      setIsOpen(false)
      clearTimeout(t)
    }, 2000);

  },[isOpen])

  if(!isLogged) {
    return (
      <div className = { 'login__banner tab ' + ( isOpen ? 'open ' : '') + (isVisible ? 'visible ' : '')} >
          <CustomToolTip text=' You can log in' direction='right'/>
          <div className = 'avatar' onClick={ () => setIsOpen(!isOpen) } >
              { icon }
          </div>
          <Link to='/login'><button className= 'btn color' onClick={() => navigate("/login")}> login </button></Link>
      </div>
    )
  }

  return (
    <div className = { 'login__banner tab logged ' + ( isOpen ? 'open ' : '') + (isVisible ? 'visible ' : '') } >
          <CustomToolTip text='You can log out' direction='right'/>
          <div className = 'avatar' onClick={ () => setIsOpen(!isOpen) } >
              { icon }
          </div>
          <Link to='/'><button className='btn white' onClick={() => logout()}> logout </button></Link>
      </div>
  )
}
type GroupTabPropTypes = {
  name: string
  onClick?: Function,
  isVisible?: boolean,
  children?: React.ReactNode
}
function GroupTab (props: GroupTabPropTypes) {
const klass = props.name + ' ' + (props.isVisible ? 'visible' : '')
  return (
    <div className={klass}>
      { props.children }
    </div>
  )
}

export default function TabMenu () {

  const { logout, isLogged, isModerator, isAdmin, isFemale } = useContext(UserContext)

  const [isHamburgerOpen, setIsHamburgerOpen] = useState(true)

  const loginTab = () => {
    const avatar = isLogged() && isFemale() ? profileWoman : profileMan
    return <LoginTab icon={ avatar } isLogged={ isLogged() } logout={ logout } isVisible={ isHamburgerOpen }/>
  }
  const userTabs = () => {
    if (!isLogged()) return null
    return(
      <GroupTab isVisible={ isHamburgerOpen } name="user__banner" >
        <Tab icon={ profileIcon } to='/profile' toolTip={ { text: "Revisa tu prefil", direction: "right", delay: 1500 } } onClick={toggleHabmurger}/>
        <Tab icon={ calendarIcon } to='/practice' toolTip={ { text: "Quedadas", direction: "right", delay: 2000 } } onClick={toggleHabmurger}/>
      </GroupTab>
    )
  }
  const moderatorTabs = () => {
    if (!isLogged() || !isModerator()) return null
    return (
      <GroupTab isVisible={ isHamburgerOpen } name="moderator__banner">
        <Tab icon={ settingsIcon } to='/moderator' toolTip={ { text: "Moderator poder", direction: "right", delay: 2500 } } onClick={toggleHabmurger}/>
      </GroupTab>
    )
  }
  const adminTabs = () => {
    if (!isLogged() || !isAdmin()) return null
    return (
      <GroupTab isVisible={ isHamburgerOpen } name="admin__banner">
        <Tab icon={ dolarIcon } to='/finances' toolTip={ { text: "Condiciones financieras", direction: "right", delay: 3000 } } onClick={toggleHabmurger}/>
        <Tab icon={ permissionIcon } to='/permissions' toolTip={ { text: "Permisos otorgados a los usuarios", direction: "right", delay: 3500 } } onClick={toggleHabmurger}/>
        <Tab icon={ pageSettings } to='/pageSettings' toolTip={ { text: "Establecer elementos utilizados en el sitio web.", direction: "right", delay: 4500 } } onClick={toggleHabmurger}/>
      </GroupTab>
    )
  }
  const toggleHabmurger = () => { setIsHamburgerOpen(!isHamburgerOpen) }

  return (
    <>
    <div className = 'tabMenu__wrapper'>
      <div className="hamburger__banner tab" onClick={ toggleHabmurger } >
        <div className={'hamburger' + ( isHamburgerOpen ? ' open': '' )}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <Tab icon={ homeIcon } to='/' isVisible={ isHamburgerOpen } onClick={ toggleHabmurger }/>
      { loginTab() }
      { userTabs() }
      { moderatorTabs() }
      { adminTabs() }
    </div>
    </>
  )
}