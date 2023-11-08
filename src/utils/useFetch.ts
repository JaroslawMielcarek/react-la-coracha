import { useContext, useEffect, useReducer, useCallback } from "react"
import axios, { AxiosError } from "axios";
import { NotificationContext } from "components/notification/useNotificationState";


const API_URL = `https://lacoracha-backend.azurewebsites.net/api/`

interface State<T> {
  data?: T
  error?: AxiosError
}
type TUseFetchProps = {
  url?: string,
  options?: RequestInit,
  initialPayload?: any,
  errorTitle?: string
}
type Action<T> =
  | { type: 'loading' }
  | { type: 'fetched'; payload: T }
  | { type: 'error'; payload: AxiosError }

export function useFetch<T>({url, initialPayload, options, errorTitle}: TUseFetchProps) {

  const initialState: State<T> = {
    error: undefined,
    data: undefined,
  }

  const fetchReducer = (fetchState: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case 'loading':
        return { ...initialState }
      case 'fetched':
        return { ...initialState, data: action.payload }
      case 'error':
        return { ...fetchState, error: action.payload }
        // return { ...initialState, error: action.payload }
      default:
        return fetchState
    }
  }

  const [fetchState, dispatch] = useReducer(fetchReducer, initialState)
  const {setNotification} = useContext(NotificationContext)

  useEffect(() => {
    console.log(url, {fetchState})
  },[fetchState, url])

  useEffect(() => {
    if (fetchState.error) {
      let errMessage = [fetchState.error.message]
      if (fetchState.error.response) {
        const response = fetchState.error.response.data as { message: string[] }
        if (response.message && Array.isArray(response.message) && response.message.length) errMessage = [...errMessage, ...response.message]
    }
      errMessage.map(msg => setNotification(`Get ${errorTitle}`, `Could't ${errorTitle}`, msg || "Something went wrong", "dangerous"))
    }
  },[fetchState.error, errorTitle, setNotification])

  const handleError = (error: AxiosError) => {
    console.log({error})
    switch (error.code) {
      case 'ERR_NETWORK': 
        error.message = "We could't connect to server. Try again in a while.."
        break
      case 'ECONNABORTED': 
        error.message = "Connection took too long.. try again.."
        break
      case 'ERR_BAD_RESPONSE': 
        error.message = "Server responded Badly"
        break
      case 'ERR_BAD_REQUEST': 
        const status = error?.response?.status || null
        if (status) return dispatch({ type: 'error', payload: handleBadRequest(error)})
        break
    }
    return dispatch({ type: 'error', payload: error})
  }

  const fetchData = useCallback(async (url: string | undefined, payload?: any) => {
    if (!url) return null
    return axios.post(API_URL + url, payload || {}, { headers: authHeader(), timeout: 5000 })
    .then( response => {
      const data = response.data as T
      dispatch({ type: 'fetched', payload: data })
    })
    .catch( (error: AxiosError) => handleError(error))
  }, [])

  useEffect(() => {
    fetchData(url, initialPayload)
  },[url, fetchData, initialPayload])

  const sendData = (sendDataUrl: string, payload: any, headers?: { [key: string]: string }) => {
    return axios.post(API_URL + sendDataUrl, payload, { headers: headers || authHeader(), timeout: 5000 })
      .then( response => {
        console.log({response})
        if (response.data) {
          if (response.data.message) {
            if (url) fetchData(url, initialPayload)
            setNotification('Send Data successfull', errorTitle || "not specified TITLE", response.data.message, "confirmation")
            return true
          }
          dispatch({ type: 'fetched', payload: response.data })
          return true
        }
        return true
      })
      .catch( (error: AxiosError) => {
        handleError(error)
        return false
      })
  }

  return [ fetchState.data, sendData, fetchData ] as const
}

const handleBadRequest = (error: AxiosError) => {
  const status = error?.response?.status
  if (!status) return error

  switch (status) {
    case 403: 
      error.message = "You not allowed to download that. Please login first"
      break
    case 404: 
      error.message = "We could not find what you wanted to do."
      break
    case 429:
      error.message = "You did too many request! Please, stop. Check what is wrong and come back later."
      break
    default:
  }
  return error
}

function authHeader () {
  const ls = localStorage.getItem("user")
  if (!ls) return ({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  })

  const user = JSON.parse(ls)

  if (user.accessToken) return { 'x-access-token': user.accessToken }

  return {}
}


// import { useCallback, useContext, useEffect, useReducer } from "react"
// import axios, { AxiosError } from "axios";
// import { NotificationContext } from "components/notification/useNotificationState";


// const API_URL = 'http://192.168.100.8:8080/api/' //`https://lacoracha-backend.azurewebsites.net/api/`

// interface State<T> {
//   data?: T
//   error?: AxiosError
// }

// type Action<T> =
//   | { type: 'loading' }
//   | { type: 'fetched'; payload: T }
//   | { type: 'error'; payload: AxiosError }

// export function useFetch<T = unknown>({url, options, errorTitle}: {
//     url?: string,
//     options?: RequestInit,
//     errorTitle?: string
//   }
// ) {
//   // const [data, setData] = useState({})
//   // const [errors, setErrors] = useState({})
//   // const [status, setStatus] = useState()


//   const initialState: State<T> = {
//     error: undefined,
//     data: undefined,
//   }

//   // Keep state logic separated
//   const fetchReducer = (fetchState: State<T>, action: Action<T>): State<T> => {
//     switch (action.type) {
//       case 'loading':
//         return { ...initialState }
//       case 'fetched':
//         return { ...initialState, data: action.payload }
//       case 'error':
//         return { ...initialState, error: action.payload }
//       default:
//         return fetchState
//     }
//   }

//   const [fetchState, dispatch] = useReducer(fetchReducer, initialState)
//   const {setNotification} = useContext(NotificationContext)
  
//   useEffect(() => {
//     if (fetchState.error) {
//       let errMessage = [fetchState.error.message]
  
//       const response = fetchState.error?.response?.data as { message: string[] }
//       if (Array.isArray(response?.message) && response?.message.length) errMessage = [...errMessage, ...response.message]
      
//       errMessage.map(msg => setNotification(`Get ${errorTitle}`, `Could't ${errorTitle}`, msg || "Something went wrong", "dangerous"))
//     }
//   },[fetchState.error, errorTitle, setNotification])

//   const fetchData = useCallback( (url: string, payload: any, headers: any, timeout = 2000) => {
//     axios.post(API_URL + url, payload, {headers: headers || authHeader(), timeout: timeout})
//     .then( response => {
//       const data = response.data as T
//       dispatch({ type: 'fetched', payload: data })
//     })
//     .catch( (error: AxiosError) => {
//       console.log({error})
//       switch (error.code) {
//         case 'ERR_NETWORK': 
//           error.message = "We could't connect to server. Try again in a while.."
//           break
//         case 'ECONNABORTED': 
//           error.message = "Connection took too long.. try again.."
//           break
//         case 'ERR_BAD_REQUEST': 
//           const status = error?.response?.status || null
//           if (status) return dispatch({ type: 'error', payload: handleBadRequest(error)})
//           break
//         default: 
//       }
//       return dispatch({ type: 'error', payload: error})
//     })
//   },[])

//   const sendData = useCallback(async (url: string, payload: any, headers: any, title: string, timeout = 2000) => {
//     return axios.post(API_URL + url, payload, {headers: headers || authHeader(), timeout: timeout})
//     .then( response => {
//       console.log({response})
//       setNotification('Send Data successfull', title, response.data.message, "confirmation")
//       return true
//       // const data = response.data as T
//       // dispatch({ type: 'fetched', payload: data })
//     })
//     .catch( (error: AxiosError) => {
//       console.log({error})
//       switch (error.code) {
//         case 'ERR_NETWORK': 
//           error.message = "We could't connect to server. Try again in a while.."
//           break
//         case 'ECONNABORTED': 
//           error.message = "Connection took too long.. try again.."
//           break
//         case 'ERR_BAD_REQUEST': 
//           const status = error?.response?.status || null
//           if (status) return dispatch({ type: 'error', payload: handleBadRequest(error)})
//           break
//         default: 
//       }
//       return dispatch({ type: 'error', payload: error})
//     })
//   },[setNotification])

//   const handleBadRequest = (error: AxiosError) => {
//     const status = error?.response?.status
//     if (!status) return error

//     switch (status) {
//       case 403: 
//         error.message = "You not allowed to download that. Please login first"
//         break
//       case 404: 
//         error.message = "We could not find what you wanted to do."
//         break
//       case 429:
//         error.message = "You did too many request! Please, stop. Check what is wrong and come back later."
//         break
//       default:
//     }
//     return error

//   }

//   return { fetchState, fetchData, sendData }
// }

// function authHeader () {
//   const ls = localStorage.getItem("user")
//   if (!ls) return ({
//     'Accept': 'application/json',
//     'Content-Type': 'application/json',
//   })

//   const user = JSON.parse(ls)

//   if (user.accessToken) return { 'x-access-token': user.accessToken }

//   return {}
// }