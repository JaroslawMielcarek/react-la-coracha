export type TTeam = {
  name: string,
  gender: 'Female' | 'Male' | 'Mix',
  league?: string,
  logo?: any
}

export type TToolTipArguments = {
  text: string,
  duration?: number,
  delay?: number,
  direction: 'top' | 'right' | 'bottom' | 'left'
}