import "./Login.css"
import Form from "components/form/Form"
import { TextInputForm } from "components/TextInput/TextInput"
import { FormContext } from "components/form/useFormState"
import { useFormState } from "components/form/useFormState"
import { passwordValidator, requiredValidator, usernameValidator } from "utils/validators"
import { UserContext } from "utils/useUser"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


export default function Login () {
  const navigate = useNavigate()
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState({})
  const { login, isLogged } = useContext(UserContext)
  const [ loading, setLoading ] = useState(false)

  useEffect(() => {
    setLoading(false)
    if (isLogged()) return navigate("/")

  },[isLogged])

  const renderSubmitButton = () => {
    const klass = loading ? "btn color full-width disabled"  : "btn color full-width"
    const text = loading ? "Cargando.." : "INICIA SESIÓN"

    return <button type='submit' className={klass}>{text}</button>
  }
  const onSubmit = async () => {
    const { username, password } = formState.data
    if (!username || !password) return 
    const credentials = { username: username.toString(), password: password.toString() }
    setLoading(true)
    login(credentials)
  }

  return (
    <div id="login" className="page">
      <section className="form-wrapper">
      <FormContext.Provider value={ { formState, validate, registerInput, setFieldValue, resetForm } }>
      <Form
        className="form login-form"
        id="details"
        onSubmit={ onSubmit }
      >
        <h4 className='title'>Inicia Sesión</h4>
        <TextInputForm
          name="username"
          label="Usuario"
          placeholder="Usuario123"
          validators={ [requiredValidator, usernameValidator] }
        />
        <TextInputForm
          name="password"
          label="Contraseña"
          placeholder="Contraseña"
          type="password"
          validators={ [requiredValidator, passwordValidator] }
        />
        <div className="buttons">
          { renderSubmitButton() }
          <a href='/signup' className='btn'>
            Regístrate
          </a>
        </div>
        <a href='/forgot' className='small forgot'>
          ¿Has olvidado tu contraseña?
        </a>
      </Form>
      </FormContext.Provider>
      </section>
    </div>
  )
}
