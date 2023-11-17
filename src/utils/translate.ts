import { TEnglishDayName } from "shared/types"

const ENGLISH_TO_SPANISH_WEEK_DAYS = { "Monday": "Lunes" , "Tuesday": "Martes", "Wednesday": "Miercoles", "Thursday": "Jueves", "Friday": "Viernes", "Saturday": "Sabado", "Sunday": "Domingo" }
const SPANISH_SHORT_WEEK_DAYS = { 1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S", 0: "D"}
const ENGLISH_WEEK_DAYS = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 0: "Sunday"}
const SPASNISH_MONTHS = { 0: "Enero", 1: "Febrero", 2: "Marzo", 3: "Abril", 4: "Mayo", 5: "Junio", 6: "Julio", 7: "Agosto", 8: "Septiembre", 9: "Octubre", 10: "Noviembre", 11: "Diciembre" }

export function translateDayOfWeek(day: TEnglishDayName ): string {
  return ENGLISH_TO_SPANISH_WEEK_DAYS[day]
}
export function getWeekShortName(number: number): string {
  return SPANISH_SHORT_WEEK_DAYS[number as keyof typeof SPANISH_SHORT_WEEK_DAYS]
}
export function getEnglishWeekDayName(number: number): string {
  return ENGLISH_WEEK_DAYS[number as keyof typeof ENGLISH_WEEK_DAYS]
}
export function getMonthName(number: number): string {
  return SPASNISH_MONTHS[number as keyof typeof SPASNISH_MONTHS]
}