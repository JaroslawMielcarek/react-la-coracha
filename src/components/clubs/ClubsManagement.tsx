import { useState } from "react"
import "./ClubsManagement.css"
import Modal from "components/modal/Modal"
import { FileUploadWithForm, ImagePreview, ImagePreviewWithForm } from "components/imageUploadWithPreview/ImageUpload"
import { FormContext, useFormState } from "components/form/useFormState"
import Form from "components/form/Form"
import { requiredValidator } from "utils/validators"
import { TextInputForm } from "components/TextInput/TextInput"
import { PavilionsInputForm } from "components/Pavilions/PavilionsInput"
import { TeamInputForm } from "components/TeamInput/TeamInput"
import { IImage } from "shared/types"
import { Table } from "components/table/Table"
import { isTheSame } from "utils/object"
import { useFetch } from "utils/useFetch"

type TClubTeam = { name: string, gender: string } 

type TClub = {
  name: string,
  logo?: File | IImage,
  teams?: TClubTeam[],
  pavilions?: string[],
  _id?: string
}


export const ClubsManagement = () => {
  const [ clubs, sendData ] = useFetch<TClub[]>({ url: "moderator/getAllClubs", errorTitle: "Clubs Manager"})
  const [ selected, setSelected ] = useState<TClub | null>(null)
  
  const handleRemove = (club: TClub) => {
    const r = window.confirm("Are you sure you want remove?")
    if (r) sendData("admin/deleteClub", club)
  }

  const Club = (club: TClub) => {
    return (
      <div className="table-row">
        <div className="column action">
          <button className="btn color" onClick={() => setSelected(club)}>Editar</button>
        </div>
        <p className="column">{ club.name }</p>
        <p className="column">{ club.logo ? <ImagePreview image={ club.logo }/> : "No" }</p>
        <p className="column">{ club.teams ? club.teams.length : "No" }</p>
        <p className="column locations">{ club.pavilions ? club.pavilions.length : "No" }</p>
        <div>
          <button className="btn color red" onClick={() => handleRemove(club)}>x</button>
        </div>
      </div>
    )
  }
  function renderElements (list: TClub[]) {
    if (!list.length) return <p className="no-data">No hay nada en periodo elegido</p>
    return list.map( ele => <Club { ...ele } key={ ele.name }/>)
  }
  return (
    <div id="clubsManagement">
      <button id="newClub" className="btn white" onClick={() => setSelected({name: ""})}>Crear nuevo Club</button>
      <Table>
        <div className="table-head">
          <p className="column action"></p>
          <p className="column name">Nombre</p>
          <p className="column logo">Logo</p>
          <p className="column teams">Equipos</p>
          <p className="column locations">Pabellones</p>
        </div>
        <ul>
          { renderElements(clubs || [])}
        </ul>
      </Table>
      { selected && <Modal onClose={() => setSelected(null)}>
          <Details club={ selected } sendData={ sendData } hideDetails={ () => setSelected(null) } />
      </Modal>
      }
    </div>
  )
}

const Details = ({club, sendData, hideDetails}: {club: TClub, sendData: Function, hideDetails: Function}) => {
  const initVal = {name: "", logo: undefined, teams: [], pavilions: []}
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState(club || initVal)
  
  const onSubmit = async() => {
    const data = formState.data
    if (!data) return null
    if ( (club._id) ? await sendData("admin/updateClub", data) : await sendData("admin/createClub", data) ) hideDetails()
  }

  const renderFile = () => {
    return (formState.data.logo) ? <ImagePreviewWithForm name="logo" />
      : <FileUploadWithForm name="logo"/>
  }
  const renderButtons = () => {
    const result = Object.entries(formState.data).every( ([key, value]) => isTheSame(value, club[key as keyof TClub]) )
    if (result) return <button type="button" className="btn full-width" onClick={() => hideDetails()}>Anular</button>
  
    return (<>
        <button type="submit" className="btn full-widtg color">{club._id ? "Modificar" : "Guardar"}</button> 
        <button type="button" className="btn color red" onClick={() => resetForm()}>Restablecer</button>
      </>)
  }
  return (
      <FormContext.Provider value={ { formState, validate, registerInput, setFieldValue, resetForm } }>
        <Form 
          id="clubDetails"
          className=""
          onSubmit={() => onSubmit() }
          onReset={() => resetForm() }>
          <TextInputForm name="name" placeholder="La Coracha" label="Nombre" validators={ [requiredValidator] } />
          { renderFile() }
          <TeamInputForm  name="teams" label="Equipos" validators={ [] }/>
          <PavilionsInputForm  name="pavilions" label="Pabellones" validators={ [] }/>
          <div className="buttons">
            { renderButtons() }
          </div>
        </Form>
      </FormContext.Provider>
    )
}