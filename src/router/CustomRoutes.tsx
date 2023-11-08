import { useContext, useEffect } from "react"
import { Routes, useLocation } from "react-router-dom"
import { UserContext } from "utils/useUser"

export const CustomRoutes = ({children}: {children: JSX.Element[]}) => {
  const location = useLocation()
  const { isExpired } = useContext(UserContext)

  useEffect(() => {
    isExpired()
  },[location, isExpired])

  return (
    <Routes>
      { children }
    </Routes>
  )
}