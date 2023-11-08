import { useContext, useEffect } from "react"
import "./Notifications.css"
import { NotificationContext } from "./useNotificationState"


type notificationProps = {
  id?: string,
  title: string,
  msg: string,
  type?: string,
  isOpen?: boolean,
  delay?: number,
  duration?: number,
}

export default function Notifications() {
  const { notificationState } = useContext(NotificationContext)

  useEffect(()=>{
    console.log({notificationState})
  }, [notificationState])

  const ToastNotification = (props: notificationProps) => {
    let klass = "notification"
    if (props.type) klass += ' ' + props.type
    if (props?.isOpen) klass += ' open'
    return (
      <li className={ klass }>
        <h5 className="title">{ props.title }</h5>
        <p className="msg">{ props.msg }</p>
      </li>
    )
  }
  const renderNotifications = () => {
    if (!notificationState) return null
    
    return Object.entries(notificationState).map(([key, value]) => (
      <ToastNotification {...value} key={key.toString()}/>
    ))
  }
  return (
    <>
    <ul id="notifications">
      {renderNotifications()}
    </ul>
    </>
  )
}
