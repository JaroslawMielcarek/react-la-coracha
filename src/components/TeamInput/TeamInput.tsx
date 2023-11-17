import "./TeamInput.css"
import { useState } from "react"
import withForm from "components/form/withForm"

type TClubTeam = { name: string, gender: string }

function checkIfTeamExist(list: TClubTeam[]) {
  const witouthClone = new Set()
  const exist = list.filter(e => {
    if (witouthClone.has(e.name.toLowerCase() + e.gender)) return true
    witouthClone.add(e.name.toLowerCase() + e.gender)
    return false
  })
  if (!exist.length) return []
  return ["Team with this name and gender already exist!"]
}

type propTypes = {
  name: string,
  value: TClubTeam[],
  label: string,
  errors: string[],
  onChange: Function
}
const TeamInput = (props: propTypes) => {
  const [ errors, setErrors ] = useState<string[]>(props.errors)
  const [ team, setTeam] = useState<TClubTeam>({name: "", gender: ""})
  const teams = props.value

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value
    const name = e.target.name

    setTeam( state => ({ ...state, [name]: val }) )
    setErrors([])
  }
  const handleRemoveTeam = (team: TClubTeam) => {
    props.onChange( teams.filter(t => !(t.name === team.name && t.gender === team.gender) ))
  }
  const handleSubmit = () => {
    setErrors([])

    if (!teams) { 
      props.onChange( [team] )
    }else {
      const error = checkIfTeamExist( [...teams, team] )
      if (error.length) return setErrors(error)
      props.onChange( [...teams, team] )
    }
    setTeam({name: "", gender: ""})
  }
  const renderErrors = () => {
    if (!errors.length) return null

    return <ul className="error-messages">{
      errors.map((errMsg: string, i: number) => (
        <li key={`${props.name}-error-${i}`} className="error">
          {errMsg}
        </li>
      ))
    }</ul>
  }
  const renderButton = () => {
    const klass = (team.name !== "" && team.gender !== "") ? "btn" : "btn hidden"
    return <button type="button" className={ klass } onClick={() => handleSubmit() }>+</button>
  }

  const klass = errors.length ? "form-group solid fit has-error" : "form-group solid fit"

  return (

    <fieldset className={ klass }>
      <legend className="extra-message">{props.label}</legend>
      <div className="group">
        <input
          name="name"
          type="text"
          className="form-control"
          placeholder="Blasters"
          value={ team?.name || "" }
          onChange={ onChange }/>
        <select
          name="gender"
          className="form-control"
          value={ team?.gender || "" }
          onChange={ onChange }>
          <option value="" disabled>Genero</option>
          <option value="Female">Femenino</option>
          <option value="Male">Masculino</option>
          <option value="Mix">Mixto</option>
        </select>
        { renderButton() }
      </div>
      { renderErrors() }
      <div className="teamsList">
        { teams && teams.length && teams.map((t, index) => <span className={ t.gender.toLowerCase() } onClick={() => handleRemoveTeam(t)} key={index}>{ t.name }</span>) }
      </div>
    </fieldset>
  )
}

export const TeamInputForm = withForm(TeamInput)