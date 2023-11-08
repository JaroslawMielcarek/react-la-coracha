import { TextInputForm } from "components/TextInput/TextInput"
import { passwordValidator, requiredValidator } from "utils/validators"
import { FormContext } from "components/form/useFormState"
import { useFormState } from "components/form/useFormState"
import Form from "components/form/Form"
import { useFetch } from "utils/useFetch"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useState } from "react"


export default function Reset () {
  const navigate = useNavigate()
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState({})
  const [userData, sendData] = useFetch({url: "", errorTitle: "Reset"})
  const [ loading, setLoading ] = useState(false)
  const [ searchParams ] = useSearchParams()

  const handleSubmit = async () => {
    const token = searchParams.toString().split("=")[1]
    setLoading(true)
    const r = await sendData("auth/reset", { password: formState.data.password?.toString() }, { 'x-access-token': token })
    setLoading(false)
    if (!r) return
    navigate("/login")
  }
  
  const renderSubmitButton = () => {
    const klass = loading ? "btn color full-width disabled"  : "btn color full-width"
    const text = loading ? "Cargando.." : "Restablecer la contraseña"

    return <button type='submit' className={ klass }>{ text }</button>
  }
  return (
    <div id="login" className="page">
      <section className="form-wrapper">
      <FormContext.Provider value={ {formState, validate, registerInput, setFieldValue, resetForm} }>
      <Form
        className="form reset-form"
        id="details"
        onSubmit={ handleSubmit }
      >
        <h4 className='title'>Restablecer la contraseña</h4>
         <TextInputForm
          name="password"
          label="Nueva contraseña"
          type="password"
          validators={[requiredValidator, passwordValidator]}
          resetOnChange={['password_confirmation']}
        />
        <TextInputForm
          name="password_confirmation"
          label="Confirmar nueva contraseña"
          type="password"
          validators={[requiredValidator, passwordValidator]}
          compare={ { to:"password", errMsg: "Las contraseñas son diferentes!"} }
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
