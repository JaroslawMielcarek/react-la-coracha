
export type TDateTime = {
  date: string,
  time: string
}

export interface  IImage {
  contentType: string,
  data: string
}
export interface IDateTime {
  dateTime: TDateTime
}

// MATCH

export type TMatchTeam = {
  clubName: string,
  teamName: string,
  teamGender: string,
  wonSets?: number
}
export type TMatch = {
  _id?: string
  homeTeam: TMatchTeam,
  guestTeam: TMatchTeam,
  dateTime: TDateTime,
  location: string,
  friendly: boolean,
  league: string
}


// ENROLL

export type TEnrolledPerson = {
  name: string,
  phoneNumber: string,
  category: string,
  gender: "feminino" | "masculino",
  prefLocation: string,
  wasWithUsBefore: boolean,
  dateOfEnrollment: Date,
  wasContacted: boolean,
  contactedBy: string,
  comments: string,
  _id?: string
}

export type TEnrollGender = {
  maxPlaces: number,
  currentEnrolled: number,
  currentWaiting: number,
  minAge: number,
  maxAge: number,
  list?: TEnrolledPerson[]
  waitingList?: TEnrolledPerson[]
}


export type TEnrollCategory = {
  _id?: string,
  name: string,
  deadline: Date,
  female?: TEnrollGender,
  male?: TEnrollGender
}

// TEAM 

export type TTeam = {
  _id?: string,
  name: string,
  gender: "Male" | "Female",
  league?: string,
  players?: TPlayer[],//string[],
  description?: string,
  logo?: IImage
}

// type TTeam = {
//   name: string,
//   description: string,
//   gender: string,
//   league: string,
//   players: TPlayer[],
// }


// PLAYER

export type TPlayer = {
  _id: string
  memberID: string,
  nick: string,
  number: string,
  position: string,
  height: string,
  weight: string,
  dominantHand: string,
  photo: File | IImage,
  inTeamPerformance: IvoleyStats,
  isFemale: boolean,
  team: string,
  practices: TPlayerPractice
}

export type TPropertyWithPermission = {
  value: string,
  permission: boolean
}
export type TPlayerPractice = {
  attended: number,
  strikes: {
    qty: number,
    lastStrike: string
  },
  positionsPlayed: { [key: string]: number }
}

// FINANCIAL

export type TMonthFinancial = {
  _id: string
  monthYear: string,
  payments: TPayment[],
}
export type TPayment = {
  _id?: string
  type: string,
  qty: number,
  isPaid: string,
}


export type TSponsor = {
  name: string,
  contribution?: number,
  isMain?: boolean,
  link?: string,
  logo?: IImage | null,
  _id?: string
}



// PRACTICE

export type TPractice = {
  _id?: string,
  dateTime: TDateTime,
  location: string,
  playersLimit: number,
  players: TPlayerSubscribed[],
  playersSubscribed?: number,
  percentOcupied: number,
  playersInQueue?: TPlayerSubscribed[],
  teams?: TPracticeTeam[]
}

export type TPlayerSubscribed = {
  _id: string,
  nick: string,
  preferedPositions: { choosen: string }[],
}

export type TPracticePlayer = {
  _id: string,
  memberID?: string,
  nick: { value: string },
  preferedPositions: { choosen: string }[],
  practices?: TPlayerPractice
}
export type TPracticeTeam = [
  {
    position: "EXT",
    subscribed: TPracticePlayer[],
    limit: 1 | 2
  },
  {
    position: "OP",
    subscribed: TPracticePlayer[],
    limit: 1
  },
  {
    position: "LIB",
    subscribed: TPracticePlayer[],
    limit: 1
  },
  {
    position: "CE",
    subscribed: TPracticePlayer[],
    limit: 1 | 2
  },
  {
    position: "CO",
    subscribed: TPracticePlayer[],
    limit: 1
  },
]


// DONUT
export interface Idata {
  key: string,
  value: Istat,
}


export interface Istat {
  good: number
  bad: number
  total: number
}
export interface IabititiStat {
  current: Istat
  prev: Istat
}
export interface IvoleyStats {
  attack: IabititiStat
  recieve: IabititiStat
  set: IabititiStat
  block: IabititiStat
  serve: IabititiStat
}

export interface IgraphElement {
  type: string
  key: string
  id: string
  stroke: string
  strokeWidth: number
  d?: string
  cx?: number
  cy?: number
  r?: number
}
export interface IgraphLegend {
  key: string
  value: {
    key: string,
    val: number,
    color?: string
  }[],
  id?: string
}