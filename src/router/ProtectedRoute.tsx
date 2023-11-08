import { UserContext } from "utils/useUser"
import { useContext } from "react"
import { Navigate } from "react-router-dom"

export const ProtectedRoute = ( {role = "user", children}: {role: string, children: JSX.Element[]}) => {
  const { isLogged, isModerator, isAdmin} = useContext(UserContext)

  switch (role){
    case 'moderator':
      if (!isModerator()) return <Navigate to="/login"/>
      break
    case 'admin': 
      if (!isAdmin()) return <Navigate to="/login"/>
      break
    default: 
      if (!isLogged()) return <Navigate to="/login"/>
      break
  }
  return children
  
} 