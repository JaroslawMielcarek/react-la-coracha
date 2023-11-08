import axios, { AxiosError } from 'axios'

const API_URL = 'http://192.168.1.59:8080/api/' //`https://lacoracha-backend.azurewebsites.net/api/`

export default function axio (url: string, data: any, headers = undefined) {
  return axios
    .post(API_URL + url, data, { headers: headers || authHeader(), timeout: 2 })
    .then(response => {
      console.log(response)
      // if (response.message) return response.message
      return response.data
    })
    .catch((error: AxiosError) => {
      console.log({error})
      if (error.code === 'ERR_NETWORK') throw new Error("We could't connect to server. Try again in a while..")
      
    })
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
// axios.interceptors.response.use(response => {
//     // Not logged in or session expired
//     if (response.data.code === '401') {
//       console.log('data.code 401')
//       // Redirect to login page
//       store.dispatch('logout')
//       router.replace({
//         path: '/login',
//         query: { redirect: router.currentRoute.fullPath }
//       })
//     }
//     return response
//   }, async error => {
//     if (error.response && error.response.status === 403) {
//       // Redirect to login page
//       console.log('error code 403')
//       store.dispatch('logout')
//       router.replace({
//         path: '/login',
//         query: { redirect: router.currentRoute.fullPath }
//       })
//     }
//     if (error.response && error.response.status === 429){
//       console.log('error code 429')
//       setNotification(
//         {
//           name: 'request error',
//           text: 'Hiciste demasiadas solicitudes, por favor espera un poco!',
//           typeOfNotification: 'danger'
//         }
//       )
//       return Promise.reject('Demasiadas solicitudes!')
//     }
//     if (error.response && error.response.status === 401){
//       store.dispatch('logout')
//       router.replace({
//         path: '/login',
//         query: { redirect: router.currentRoute.fullPath }
//       })
//     }
//     return Promise.reject(error)
//   })
