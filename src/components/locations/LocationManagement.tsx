import "./LocationManagement.css"
import { TextInputForm } from "components/TextInput/TextInput"
import Form from "components/form/Form"
import { FormContext, useFormState } from "components/form/useFormState"
import { CourtsInputForm } from "components/slot/Court"
import { Table } from "components/table/Table"
import { useState } from "react"
import { isTheSame } from "utils/object"
import { requiredValidator } from "utils/validators"
import Modal from "components/modal/Modal"
import { TLocation } from "shared/types"
import { sortedByPropName } from "utils/sort"
import { useFetch } from "utils/useFetch"

export const LocationManagement = () => {
  const [ initList, sendData ] = useFetch<TLocation[]>({url: "admin/getAllLocations", errorTitle: "Page Settings Courts download"})
  const [ selected, setSelected ] = useState<TLocation | null>(null)
  
  const handleRemove = (location: TLocation) => {
    const r = window.confirm("Estás seguro de que quieres eliminar?")
    if (r) sendData("admin/deleteLocation", location)
  }

  const Location = (location: TLocation) => {
    return (
      <div className="table-row">
        <div className="column action">
          <button className="btn color" onClick={() => setSelected(location)}>Editar</button>
        </div>
        <p className="column">{ location.name }</p>
        <p className="column">{ location.address }</p>
        <p className="column">{ location.courts?.length }</p>
        <div>
          <button className="btn color red" onClick={() => handleRemove(location)}>x</button>
        </div>
      </div>
    )
  }

  function renderElements (list: TLocation[]) {
    if (!list.length) return <p className="no-data">No hay nada en periodo elegido</p>
    return list.map( loc => <Location { ...loc } key={ loc.name }/>)
  }
  return (
    <div id="locationManagement">
      <button id="newLocation" className="btn white" onClick={() => setSelected({name: "", address:""})}>Crear nueva Ubicacion</button>
      <Table>
        <div className="table-head">
          <p className="column action"></p>
          <p className="column name">Nombre</p>
          <p className="column location">Ubicación</p>
          <p className="column courts">No. Pistas</p>
        </div>
        <ul>
          { renderElements( sortedByPropName(initList || [], "name" ))}
        </ul>
      </Table>
      { selected ? <Modal onClose={() => setSelected(null)} >
        <Details location={ selected } sendData={ sendData } hideDetails={ () => setSelected(null) }/> 
      </Modal> : null }
    </div>
  )
}

const Details = ({location, sendData, hideDetails}: {location: TLocation, sendData: Function, hideDetails: Function}) => {
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState(location)
  
  const onSubmit = async () => {
    const data = formState.data
    if (!data) return null
    if ( (location._id) ? await sendData("admin/updateLocation", data) : await sendData("admin/createLocation", data) ) hideDetails()
  }
  const renderButtons = () => {
    const result = Object.entries(formState.data).every( ([key, value]) => isTheSame(value, location[key as keyof typeof location]) )
    if (result) return <button type="button" className="btn full-width" onClick={() => hideDetails()}>Anular</button>
  
    return (<>
        <button type="submit" className="btn full-widtg color">{location._id ? "Modificar" : "Guardar"}</button> 
        <button type="button" className="btn color red" onClick={() => resetForm()}>Restablecer</button>
      </>)
  }
  return (
      <FormContext.Provider value={ { formState, validate, registerInput, setFieldValue, resetForm } }>
        <Form 
          id="LocationDetails"
          className=""
          onSubmit={() => onSubmit() }
          onReset={() => resetForm() }>
          <TextInputForm name="name" placeholder="IES Campanillas" label="Nombre"  validators={ [requiredValidator] }/>
          <TextInputForm name="address" placeholder="Campanillas" label="Ubication" validators={ [requiredValidator] } />
          <CourtsInputForm name="courts" label="Pistas" validators={ [] }/>
          <div className="buttons">
            { renderButtons() }
          </div>
        </Form>
      </FormContext.Provider>
    )
}