import "./PlayersManagement.css"
import { Table } from "components/table/Table"
import { useFetch } from "utils/useFetch"
import { useState } from "react"
import Modal from "components/modal/Modal"
import { FormContext, useFormState } from "components/form/useFormState"
import Form from "components/form/Form"
import { TextInputForm } from "components/TextInput/TextInput"
import { checkRangeValidator, requiredValidator } from "utils/validators"
import { TickButtonForm } from "components/tickButton/TickButton"
import { FileUploadWithForm, ImagePreviewWithForm } from "components/imageUploadWithPreview/ImageUpload"
import { isTheSame, prepareFormState, prepareToSend } from "utils/object"
import { StrikeWithForm } from "components/strike/Strike"
import { TPlayer } from "shared/types"
import { sortedByPropName } from "utils/sort"


export const PlayersManagement = () => {
  const [ players, sendData ] = useFetch<TPlayer[]>({ url: "moderator/getAllPlayers", errorTitle: "Players Manager"})
  const [ selectedPlayer, setSelectedPlayer ] = useState<TPlayer | null>(null)
  const [ sortBy, setSortBy ] = useState("memberID")
  
  return (
    <section id="playersManagement">
      <Table>
        <div className="table-head">
          <p className="column action"></p>
          <p className='column sort' onClick={ () => setSortBy("memberID") }>ID</p>
          <p className='column sort' onClick={ () => setSortBy("nick") }>Nick</p>
          <p className='column'>No.</p>
          <p className='column'>Género</p>
          <p className='column sort' onClick={ () => setSortBy("underAge") }>Menor</p>
          <p className='column sort' onClick={ () => setSortBy("team") }>Equipo</p>
          <p className='column'></p>
        </div>
        <ul>
        { players && sortedByPropName(players, sortBy).map((player) => (
          <div className="table-row" key={player.memberID}>
            <div className="column action">
              <button className="btn color" onClick={() => setSelectedPlayer(player)}>Editar</button>
            </div>
            <p className="column">{ player.memberID }</p>
            <p className="column">{ player.nick }</p>
            <p className="column">{ player.number }</p>
            <p className="column">{ player.isFemale ? "Mujer" : "Hombre" }</p>
            <p className="column">{ player.underAge ? "Sí" : "No" }</p>
            <p className="column">{ player.team }</p>
            
          </div>
        )) }
        </ul>
      </Table>
      { selectedPlayer &&
          <Modal onClose={() => setSelectedPlayer(null) }>
            <PlayerDetails p={ selectedPlayer } sendData={ sendData } hideDetails={ () => setSelectedPlayer(null)}/>
          </Modal>
      }
    </section>
  )
}

const PlayerDetails = ({p, sendData, hideDetails}: {p: TPlayer, sendData: Function, hideDetails: Function}) => {
  const pf = prepareFormState(p)
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState(pf)

  const handleSubmit = async () => {
    const data = prepareToSend<TPlayer>(formState.data)
    if (await sendData("moderator/updateUser", data)) hideDetails()
  }
  const renderFile = () => {
    return (formState.data["photo-value"]) ? <ImagePreviewWithForm name="photo-value" label="Photo" />
      : <FileUploadWithForm name="photo-value" label="Photo" />
  }
  const renderButton = () => {
    const result = Object.entries(formState.data).every( ([key, value]) => isTheSame(value, pf[key as keyof typeof pf]) )
    if (result) return <button type="button" className="btn full-width" onClick={() => hideDetails()}>Anular</button>
    return (
      <div className="buttons">
        <button type="submit" className="btn full-width color">Guardar</button>
        <button type="reset" className="btn color red">Restablecer</button>
      </div>
    )
  }
  return (
    <FormContext.Provider value={ { formState, validate, registerInput, setFieldValue, resetForm } }>
    <Form 
      id="player-form"
      className="form"
      onSubmit={ () => handleSubmit() }
      >
        <div>
          <TextInputForm 
            name="memberID"
            label="MemberID"
            placeholder="123"
            validators={ [requiredValidator] }
            />
          <TickButtonForm
            name="underAge"
            label="Menor de edad"
            validators={ []}
            />
          <TextInputForm
            name="nick"
            label="Nick"
            placeholder="john"
            validators={ [] }
            />
          <TextInputForm
            name="number"
            label="Dorsal"
            placeholder="13"
            type="number"
            validators={ [checkRangeValidator( 1, 99, false )] }
            />
            <TextInputForm
            name="height"
            label="Altura (m)"
            placeholder="1.80"
            type="number"
            validators={ [checkRangeValidator( 1.5, 2.2, true )]}
            />
            <TextInputForm
            name="weight"
            label="Peso (kg)"
            placeholder="65"
            type="number"
            validators={ [checkRangeValidator( 30, 130, false )] }
            />
          <TickButtonForm
            name="isFemale"
            label="Mujer"
            validators={ []}
            />
          { renderFile() }
          <StrikeWithForm
            name="practices-strikes"
            label="Strikes"
            validators={ [] }
          />
        </div>
      { renderButton() }
    </Form>
    </FormContext.Provider>
  )
}