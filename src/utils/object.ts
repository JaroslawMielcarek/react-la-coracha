import { IDateTime } from "shared/types"

export function isEmpty (obj: Object) {
  if (!obj) return true
  return !Object.keys(obj).length
}
export function isTheSame<T>(valA: T, valB: T): boolean {

  // console.log({valA, valB})
  // console.log(typeof valA !== typeof valB)
  if (typeof valA !== typeof valB) return false
  // console.log( (typeof valA === 'undefined') || (typeof valB === 'undefined') )
  if ( (typeof valA === 'undefined') || (typeof valB === 'undefined') ) return false

  // console.log( (valA === null) || (valB === null) )
  if ( (valA === null) || (valB === null) ) return false
  // JSON.stringify ignores orden
  // console.log(JSON.stringify(valA) === JSON.stringify(valB))
  if (Array.isArray(valA) && Array.isArray(valB)) return JSON.stringify(valA) === JSON.stringify(valB)
  if (typeof valA === 'object') {
    return Object.entries(valA as object).every( ([key, value]) => {
      const propName = key as keyof T
      // console.log(key, value)
      return (valB && ( typeof valB[propName] !== 'undefined') ) ? isTheSame( value, valB[propName] ) : false
    })
  }
  return valA === valB
}

export function getFilteredByTimePeriod<T extends IDateTime>(selectedFilter: string, original: T[] | undefined) {
  if (!original || !original.length) return [] as T[]

  switch(selectedFilter){
    case "Semana":
      return getByTimeRange(original, "week")
    case "Mes actual":
      return getByTimeRange(original, "month")
    case "Temporada":
      return getByTimeRange(original, "season")
    default:
      return original
  }
}

export function getByTimeRange<T extends IDateTime>(list: T[], range: string) {
  if (!list || !list.length) return list
  const currDay = new Date(new Date().setHours(0, 0, 0, 0))
  const currMonth = currDay.getMonth()
  const currYear = currDay.getFullYear()

  if (range === 'week') {
    const firstDayOfWeek = new Date(currDay.setDate(currDay.getDate() - currDay.getDay() + 1))
    const lastDayOfWeek = new Date(currDay.setDate(currDay.getDate() - currDay.getDay() + 8))
    return list.filter(e => firstDayOfWeek <= new Date(e.dateTime.date) && new Date(e.dateTime.date) <= lastDayOfWeek)
  }
  if (range === 'month') {
    return list.filter(e => (new Date(e.dateTime.date)).getMonth() === currMonth && new Date(e.dateTime.date).getFullYear() === currYear)
  }
  if (range === 'season') {
    let firstDayOfSeason = new Date()
    let lastDayOfSeason = new Date()
    if (currMonth < 6) {
      // its almost end of season
      // season starts on 1st September
      firstDayOfSeason = new Date(currYear - 1, 9, 1)
      // season ends on 30th June
      lastDayOfSeason = new Date(currYear, 7, 1)
    } else {
      // season will start or already started
      // season starts on 1st September
      firstDayOfSeason = new Date(currYear, 8, 1)
      // season ends on 30th June
      lastDayOfSeason = new Date(currYear + 1, 7, 1)
    }
    return list.filter(e => firstDayOfSeason <= new Date(e.dateTime.date) && new Date(e.dateTime.date) <= lastDayOfSeason)
  }
  return list
}

type tt = {[key: string]: string | number | boolean | object }
export const prepareFormState = (data: tt):tt => {
  return Object.entries(data).reduce((obj, [key, value]) => {
    return (
      typeof value !== 'object'
        ? { ...obj, [key]: value }
        : Object.entries(value).reduce( (nObj, [oKey, oValue]) => ( { ...nObj, [`${key}-${oKey}`]: oValue } ), {...obj})
    )
  },{})
}

type TFormState = { [key: string]: string | number | boolean | object | null }

export const prepareToSend = <T>(data: TFormState): T => {
  return Object.entries(data).reduce( (nObj, [key, value]) => {
    if (!key.includes("-")) return { ...nObj, [key]: value }

    const [oKey, oValue] = key.split("-")
    const d = oKey in nObj ? nObj[oKey] as object : {}
    return { ...nObj, [oKey]: { ...d, [oValue]: value } }
  }, {} as TFormState) as T
}

// export function sortListOfObjectsBy<T>(list: T[], property: string, descending = false, numeric = false) {
//   const objProp = property as keyof T
//   if (!property) return list
//   const newList = [...list]
//   newList.sort(
//     (a, b) => {
//       const valA = (typeof a[objProp] === 'object' && 'value' in a[objProp]) ? a[objProp].value : a[objProp]
//       const valB = (typeof b[objProp] === 'object' && 'value' in a[objProp]) ? b[objProp].value : b[objProp]
//       return valA.toString().localeCompare(valB.toString(), 'en', {numeric: numeric})
//     }
//   )
//   return descending ? newList.reverse() : newList
// }