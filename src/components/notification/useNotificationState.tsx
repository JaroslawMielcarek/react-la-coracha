import { useState, createContext, useCallback } from "react"

type notificationType = "confirmation" | "attention" | "dangerous"
export type notificationDataType = {
  title: string,
  msg: string,
  type?: notificationType
 }

type stateType = {
  [key: string]: notificationDataType
}

export const useNotificationState = () => {
  const [notificationState, setNotificationState] = useState<stateType | null>({})

  const removeNotification = useCallback((id: string) => {
    setNotificationState(state => {
      if (state) delete state[id]
      return ({...state})
    })
  },[])

  const setNotification = useCallback((id: string, title: string, msg: string, type?: notificationType ) => {
    setNotificationState(state => ({
      ...state,
      [id]: {
        title: title,
        msg: msg,
        type: type
      }
    }))
    const t = setTimeout(() => {
      removeNotification(id)
      clearTimeout(t)
    }, 8000)
  },[removeNotification])

  const resetNotifications = () => {
    setNotificationState({})
  }
  return { notificationState, setNotification, removeNotification, resetNotifications }
}

interface notificationContextType {
  notificationState?: stateType | null,
  setNotification: (id: string, title: string, msg: string, type?: notificationType) => void,
  resetNotifications?: () => void,
}

export const NotificationContext = createContext<notificationContextType>({
  setNotification: () => {},
})
export const NotificationProvider = ( { children }: any) => {
  const { notificationState, setNotification, resetNotifications } = useNotificationState()

  return (
    <NotificationContext.Provider value={ { notificationState, setNotification, resetNotifications } }>
      {children}
    </NotificationContext.Provider>
  )
}
