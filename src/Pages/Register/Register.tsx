import Form from "components/form/Form"
import { TextInputForm } from "components/TextInput/TextInput"
import { emailValidator, memberIDValidator, passwordValidator, requiredValidator, usernameValidator } from "utils/validators"
import { FormContext } from "components/form/useFormState"
import { useFormState } from "components/form/useFormState"
import { UserContext } from "utils/useUser"
import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"


export default function Register () {
  const navigate = useNavigate()
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState({})
  const { signup } = useContext(UserContext)
  const [ loading, setLoading ] = useState(false)


  const handleSignup = async () => {
    const { username, password, email, memberID } = formState.data
    if (!username || !password || !email || !memberID) return
    const data = { username: username.toString(), password: password.toString(), email: email.toString(), memberID: parseInt(memberID.toString()).toString()}
    setLoading(true)
    const resp = await signup(data)
    setLoading(false)
    if (!resp) return null
    navigate("/login")
  }
  const renderSubmitButton = () => {
    const klass = loading ? "btn color full-width disabled"  : "btn color full-width"
    const text = loading ? "Cargando.." : "Crear Cuenta"

    return <button type='submit' className={ klass }>{ text }</button>
  }
  return (
    <div id="signup" className="page">
      <section className="form-wrapper">
      <FormContext.Provider value={ {formState, validate, registerInput, setFieldValue, resetForm} }>
      <Form
        className="form signup-form"
        id="details"
        onSubmit={ handleSignup }
      >
        <h4 className='title'>Registrarse</h4>
        <div className='extra-message'>
          <p className='text_small'>Primero debe tener un Numero de Socio para poder registrarse.</p>
          <p className='text_small'>Póngase en contacto con <a href="https://wa.me/393497492300">nosotros</a> para obtener uno.</p>
        </div>
        <TextInputForm
          name="username"
          label="Usuario"
          placeholder="Usuario123"
          type="text"
          validators={[requiredValidator, usernameValidator]}
        />
        <TextInputForm
          name="password"
          label="Contraseña"
          placeholder="********"
          type="password"
          validators={[requiredValidator, passwordValidator]}
        />
         <TextInputForm
          name="email"
          label="E-mail"
          placeholder="example@gmail.com"
          type="email"
          validators={[requiredValidator, emailValidator]}
        />
        <TextInputForm
          name="memberID"
          label="Numero de socio"
          placeholder="XXXX"
          type="phone"
          validators={[requiredValidator, memberIDValidator]}
        />
        <div className="buttons">
          { renderSubmitButton() }
        </div>
      </Form>
      </FormContext.Provider>
      </section>
    </div>
  )
}
