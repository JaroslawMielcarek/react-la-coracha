export const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const WEEK_DAYS = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
export const WEEK_DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function generateHoursArray (hour, maxHour, slot) {
  const arr = []
  while (hour <= maxHour) {
    const hh = hour.getHours() < 10 ? `0${hour.getHours()}` : hour.getHours()
    const mm = hour.getMinutes() < 10 ? `0${hour.getMinutes()}` : hour.getMinutes()
    arr.push(`${hh}:${mm}`)
    hour = new Date(hour.setMinutes(hour.getMinutes() + slot))
  }
  return arr
}
export function getMinutesHoursTimeFormat (time) {
  const t = time.split(':')
  const hours = parseInt(t[0])
  const minutes = parseInt(t[1])
  return (hours === 0 && minutes === 0) ? '- - : - -' : time
}
export function isoDateToDayMonthYear (date) {
  const d = checkIfValidDate(date)
  return (isNaN(d)) ? '--/--/----' : `${ d.getDate() }/${ d.getMonth() + 1 }/${ d.getFullYear() }` 
}
export function getDayOfWeek (date) {
  const d = checkIfValidDate(date)
  return (isNaN(d)) ? 'Invalid date' : WEEK_DAYS[d.getDay()]
}
export function getMonthNameByNumber (date) {
  const d = checkIfValidDate(date)
  return (isNaN(d)) ? 'Invalid date' :  MONTH_NAMES[d.getMonth()]
}
export function areEqualDates (firstDate, secondDate) {
  const first = new Date(firstDate)
  const second = new Date(secondDate)

  if (first < second || first > second) return false
  return true
}
export function isBeforeToday (date) {
  return new Date(date) < new Date()
}
export function getAllMonths () {
  return [...MONTH_NAMES]
}
export function getAllWeekDays () {
  return [...WEEK_DAYS]
}

export const getMonthNameFromMonthYear = (monthYear) => {
  const month = parseInt(monthYear.split("-")[1])
  return MONTH_NAMES[month - 1]
}
export function checkIfValidDate(date) {
  if (!date) return 'not specified'
  let d = new Date(date)
  if ( /^(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4}$/.test(date)) {
    console.log(date)
    const dateParts = date.split("/")
    d = new Date(dateParts[2], dateParts[1], dateParts[0])
  }

  return isNaN(d) ? 'not specified' : d
}

export function getCurrentYearMonth() { 
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1

  return `${year}-${/^\d$/.test(month) ? '0' + month : month}`
}

export function compareYearMonth(first, second) {
  const firstYear = first.split('-')[0]
  const firstMonth = first.split('-')[1]
  const secondYear = second.split('-')[0]
  const secondMonth = second.split('-')[1]

  const d1 = new Date(firstYear, firstMonth)
  const d2 = new Date(secondYear, secondMonth)
  return d1 < d2
}