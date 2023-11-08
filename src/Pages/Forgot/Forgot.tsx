import { TextInputForm } from "components/TextInput/TextInput"
import { emailValidator, requiredValidator } from "utils/validators"
import { FormContext } from "components/form/useFormState"
import { useFormState } from "components/form/useFormState"
import Form from "components/form/Form"
import { useFetch } from "utils/useFetch"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import Modal from "components/modal/Modal"


export default function Forgot () {
  const navigate = useNavigate()
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState({})
  const [userData, sendData] = useFetch({url: "", errorTitle: "Forgot"})
  const [ loading, setLoading ] = useState(false)
  const [ showModal, setShowModal ] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const r = await sendData("auth/forgot", { email: formState.data.email?.toString() })
    setLoading(false)
    if (!r) return
    setShowModal(true)
  }
  const handleClose = () => {
    navigate("/")
  }
  const renderModal = () => {
    if (!showModal) return null
    return (
      <Modal onClose={ handleClose }>
        <div id="confirmationModal">
          <h1>Email enviado</h1>
          <p>Le enviamos un correo electrónico con instrucciones.</p>
          <div className="buttons">
            <button className="btn full-width color" onClick={ handleClose }>De acuerdo</button>
          </div>
        </div>
      </Modal>
    )
  }
  const renderSubmitButton = () => {
    const klass = loading ? "btn color full-width disabled"  : "btn color full-width"
    const text = loading ? "Cargando.." : "Enviar enlace"

    return <button type='submit' className={ klass }>{ text }</button>
  }
  return (
    <div id="login" className="page">
      <section className="form-wrapper">
      <FormContext.Provider value={ {formState, validate, registerInput, setFieldValue, resetForm} }>
      <Form
        className="form forgot-form"
        id="details"
        onSubmit={ handleSubmit }
      >
        <h4 className='title'>Recuperar contraseña</h4>
         <TextInputForm
          name="email"
          label="Correo electrónico"
          placeholder="example@gmail.com"
          type="email"
          validators={[requiredValidator, emailValidator]}
          resetOnChange={['email_confirmation']}
        />
        <TextInputForm
          name="email_confirmation"
          label="Confirmar correo electrónico"
          placeholder="example@gmail.com"
          type="email"
          validators={[requiredValidator, emailValidator]}
          compare={ { to:"email", errMsg: "Los correos electrónicos son diferentes!"} }
        />
        <div className="buttons">
          { renderSubmitButton() }
        </div>
      </Form>
      </FormContext.Provider>
      { renderModal() }
      </section>
    </div>
  )
}
