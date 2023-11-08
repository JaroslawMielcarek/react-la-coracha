import { useCallback, useEffect, useState} from "react";
import { useFetch } from "./useFetch";
import { createContext } from "react";

interface TCredentials {
  username: string,
  password: string,
}
interface TSignupData {
  username: string,
  password: string,
  email: string,
  memberID: string
}

type UserType = {
  id: string,
  username: string,
  roles: string[],
  iat: number,
  exp: number,
  isFemale: boolean,
  accessToken: string
}

const getLocalStoreUser = () => {
  const ls = localStorage.getItem('user')
  return ls ? JSON.parse(ls) : null
}

export const useUser = () => {
  const [userP, sendData] = useFetch({ errorTitle: "User login" })

  const [user, setUser] = useState<UserType | null>(getLocalStoreUser())
  
  function linkUser() {
    console.log('localstorage change')
    const ls = localStorage.getItem('user')
    ls ? setUser(JSON.parse(ls)) : setUser(null)
  }
  
  useEffect(() => {
    window.addEventListener("storage", linkUser)
    return () => {
      window.removeEventListener("storage", linkUser)
    }
  },[])

  useEffect(() => {
    if (!userP) return

    const token = (userP as {token: string})?.token
    if (!token) return 

    const user = JSON.parse(atob(token.split('.')[1]))
    user.accessToken = token

    localStorage.setItem('user', JSON.stringify(user))
    window.dispatchEvent(new Event('storage'))

  }, [userP])

  const signup = async (data: TSignupData) => {
    const r = await sendData("auth/signup", data)
    return r
  }
  const login = (credentials: TCredentials) => {
    sendData("auth/signin", credentials)
  }

  const logout = () => {
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('storage'))
  }
  const isExpired = () => {
    if (user && user.exp < parseInt((Date.now()/1000).toFixed(0))) logout()
  }
  const isLogged = () => {
    return !!user && ( (user.exp * 1000) > Date.now() )
  }
  const isPlayer = () => {
    return !!user?.roles.includes('ROLE_PLAYER')
  }
  const isModerator = () => {
    return !!user?.roles.includes('ROLE_MODERATOR')
  }
  const isAdmin = () => {
    return !!user?.roles.includes('ROLE_ADMIN')
  }
  const isFemale = () => {
    return !!user?.isFemale
  }

  const accessToken = useCallback(() => {
    return user ? user.accessToken : null
  },[user])

  const username = () => {
    return user?.username || 'unIdentified'
  }

  return { signup, logout, login, isLogged, isPlayer, isModerator, isAdmin, isFemale, isExpired, accessToken, username }
}

// export const useToken = () => {
//   const [token, setTokenInternal] = useState(() => {
//     // Initialize from localStorage
//     const ls = localStorage.getItem('token')
//     return ls ? JSON.parse(ls) : null
//   })

//   useEffect(() => {
//     // Persist updated state to localStorage
//     localStorage.setItem('token', JSON.stringify(token)) // before was newToken
//   }, [token])

//   const setToken = (newToken: string) => {
//     setTokenInternal(newToken)
//   }

//   return [token, setToken]
// }
interface UserContextType {
  signup: ( data: TSignupData) => Promise<boolean>
  login: ( credentials: TCredentials ) => void,
  logout: () => void,
  isLogged: () => boolean,
  isPlayer: () => boolean,
  isModerator: () => boolean,
  isAdmin: () => boolean,
  isFemale: () => boolean,
  isExpired: () => void,
  accessToken: () => string | null,
  username: () => string
}

export const UserContext = createContext<UserContextType>({
  signup: () => {return Promise.resolve(true)},
  login: () => {},
  logout: () => {},
  isLogged: () => false,
  isPlayer: () => false,
  isModerator: () => false,
  isAdmin: () => false,
  isFemale: () => false,
  isExpired: () => {},
  accessToken: () => '',
  username: () => ''
})

export const UserProvider = ( { children }: any) => {
  const { signup, login, logout, isLogged, isPlayer, isModerator, isAdmin, isFemale, isExpired, accessToken, username } = useUser()

  return (
    <UserContext.Provider value={ { signup, login, logout, isLogged, isPlayer, isModerator, isAdmin, isFemale, isExpired, accessToken, username } }>
      {children}
    </UserContext.Provider>
  )
}