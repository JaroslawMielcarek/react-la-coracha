import "./PageSettings.css"
import { TextInputForm } from "components/TextInput/TextInput"
import Form from "components/form/Form"
import { FormContext, useFormState } from "components/form/useFormState"
import { FileUploadWithForm, ImagePreview, ImagePreviewWithForm } from "components/imageUploadWithPreview/ImageUpload"
import { useState } from "react"
import { requiredValidator } from "utils/validators"


export const PageSettings = () => {

  return (
    <div>
      <CourtList/>
      <ClubsList/>
    </div>
  )
}

type TCourt = {
  name: string,
  address: string
}
const CourtList = () => {
  const initVal = {name: '', address: ''}
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState(initVal)
  const [ list, setList ] = useState<TCourt[]>([])
  const handleSubmit = () => {
    setList(state => ([...state, formState.data as TCourt]))
    resetForm()
  }
  const handleRemoveFromList = (c: TCourt) => {
    setList(list.filter(e => e.name !== c.name))
  }
  const renderList = () => {
    return list.map(c => (
      <div className="btn element" onClick={() => handleRemoveFromList(c)}>
        <p>{ c.name }</p>
        <p className="address">{ c.address }</p>
      </div>
    ))
  }
  return (
    <div>
      <div id="courtList">
        <h4>Court List:</h4>
        { renderList() }
      </div>
      <fieldset className="dashed fit">
        <legend>Add new Court</legend>
      <FormContext.Provider value={ { formState, validate, registerInput, setFieldValue, resetForm } }>
      <Form 
        id="CourtList"
        className=""
        onSubmit={() => handleSubmit() }
        onReset={() => resetForm() }>
        <TextInputForm name="name" label="Nombre"  validators={ [requiredValidator] }/>
        <TextInputForm name="address" label="Ubication" validators={ [requiredValidator] } />
        <button type="submit" className="btn color">Add</button>
      </Form>
      </FormContext.Provider>
      </fieldset>
      </div>
    )
}
type TClub = {
  name: string,
  logo: File
}
const ClubsList = () => {
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState({})
  const [ list, setList ] = useState<TClub[]>([])
  
  const handleSubmit = () => {
    if (!formState.data) return
    setList(state => ([
      ...state,
      {
        name: formState.data.name as string,
        logo: formState.data.logo as File
      }
    ]))
  }
  const handleRemove = (c: TClub) => {
    setList(list.filter(e => e.name !== c.name))
  }

  const renderList = () => {
    return list.map(c => (
      <div className="btn element" onClick={() => handleRemove(c)}>
        <p>{ c.name }</p>
        <ImagePreview image={ c.logo } onClick={() => {}}/>
      </div>
    ))
  }
  const renderFile = () => {
    return (formState.data.logo) ? <ImagePreviewWithForm name="logo" />
      : <FileUploadWithForm name="logo"/>
  }
  return (
    <div>
      <div id="clubList">
        <h4>Club List:</h4>
        { renderList() }
      </div>
      <fieldset className="dashed fit">
        <legend>Add new Club</legend>
        <FormContext.Provider value={ { formState, validate, registerInput, setFieldValue, resetForm } }>
        <Form
          id="ClubList"
          className=""
          onSubmit={() => handleSubmit() }
          onReset={() => resetForm() }>
          <TextInputForm name="name" label="Nombre" validators={ [requiredValidator] } />
          { renderFile() }
          <button className="btn color">Add</button>
          </Form>
        </FormContext.Provider>
      </fieldset>
    </div>
  )
}