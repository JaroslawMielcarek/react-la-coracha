import "./Join.css"
import Form from "components/form/Form"
import { TextInputForm } from "components/TextInput/TextInput"
import { nameValidator, phoneNumberValidator, requiredValidator } from "utils/validators"
import { FormContext, useFormState } from "components/form/useFormState"
import { SelectInputForm } from "components/selectInput/SelectInput"
import { ToggleButtonForm } from "components/toggleButton/ToggleButton"
import { useFetch } from "utils/useFetch"
import { useContext, useEffect } from "react"
import { TEnrollCategory } from "shared/types"
import { UserContext } from "utils/useUser"

const MIN_AGE = 10
const ADULT_AGE = 18
const CURR_YEAR = new Date().getFullYear()

const generatePermitedYears = (min: number, max: number) => {
  let years: string[] = []
  for (let i = CURR_YEAR - min; i > CURR_YEAR - max; i-- ){
    years.push(i.toString())
  }
  years.push( "antes de " + (CURR_YEAR - ADULT_AGE))
  return years
}
const getAgeByYear = (year: string) => {
  const y = RegExp(/^\d{4}$/).test(year.trim()) ? parseInt(year.trim()) : 18
  return CURR_YEAR - y
}

const getCategoryByYearAndGender = (categories: TEnrollCategory[] | undefined ,year: string, selectedGender: 'female' | 'male' | undefined) => {
  if (!categories || !selectedGender) return null
  return categories?.find(c => {
    const category = c[selectedGender]
    if (!category) return false
    const age = getAgeByYear(year)
    if (age < category.minAge) return false
    if (age > category.maxAge) return false
    return c
  })
}
const getEnglishGenderName = (genderInSpanish: string | undefined ): "female" | "male" | null => {
  if (!genderInSpanish) return null
  return genderInSpanish === "Femenino" ? "female" : 'male'
}
export default function Join()  {
  const [ categories, sendData ] = useFetch<TEnrollCategory[]>({ url: "public/getAllEnrollCategory", errorTitle: "Enroll Subscription" })
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState({})
  const selectedGender = getEnglishGenderName(formState.data.gender?.toString())
  const { isLogged } = useContext(UserContext)

  const handleSubmit = () => {
    if (!formState.data || !selectedGender) return null

    const data = {
      name: formState.data.first_name + ' ' + formState.data.last_name,
      phoneNumber: formState.data.phone_number?.toString(),
      category: getCategoryByYearAndGender(categories, formState.data.dateOfBirth as string, selectedGender)?.name,
      gender: getEnglishGenderName(formState.data.gender?.toString()),
      prefLocation: formState.data.prefLocation,
      wasWithUsBefore: isLogged()
    }
    sendData("public/sendJoinRequest", data)
    resetForm()
  }
  
  const renderBirthYears = () => {
    const klass = "category " + getEnglishGenderName(formState.data.gender?.toString()) 
    return (
      <div className="form-group">
        <label>Año de nacimiento</label>
        <div className={ klass }>
          { generatePermitedYears(MIN_AGE, ADULT_AGE).map(v => (
            <ToggleButtonForm
            name="dateOfBirth"
            label= { v }
            validators={ [requiredValidator] }
            isActive={ v === formState.data.dateOfBirth }
            key={ v }
            />
          )) }
        </div>
      </div>
    )
  }
  
  const renderAvailableCategory = () => {
    if (!selectedGender) return null
    const availableCategory = getCategoryByYearAndGender(categories, formState.data.dateOfBirth as string, selectedGender)

    if (!availableCategory || !availableCategory[selectedGender]) {
      return <h4 className="extra-message">No tenemos categoría relacionada con tu edad en este momento. Por favor, póngase en contacto con nosotros directamente para obtener más información.</h4>
    }

    const category = availableCategory[selectedGender]
    if (!category) return null

    if ( category?.currentEnrolled >= category?.maxPlaces) {
      const queueLength = category.currentEnrolled - category.maxPlaces + 1
      return  (
        <>
        <h4 className="extra-message">Ya <b>estamos llenos</b> de jugadores de tu edad y sexo. Si desea ser agregado a la <b>lista de espera</b> en la posición <b>{ queueLength }</b>, continúe..</h4>
        <div className="buttons">
          <button type="submit" className="btn color">Agrégame a la lista de espera</button>
          <button type="reset" className="btn text red">Restablecer</button>
        </div>
        </>
      )
    }

    const name = availableCategory.name
    const freeSpaces = category.maxPlaces - category.currentEnrolled
    return (
      <>
      <h4 className="extra-message">Tenemos espacio para ti en nuestra categoría <b>{ name.toUpperCase() }</b>. Solo <b>{ freeSpaces }</b> espacios restantes.</h4>
      <div className="buttons">
        <button type="submit" className="btn color">Suscribirse a {name.toUpperCase()}</button>
        <button type="reset" className="btn text red">Restablecer</button>
      </div>
      </>
    )
  }
  return (
    <div id="join-page">
      <section className="form-wrapper">
      <FormContext.Provider value={ {formState, validate, registerInput, setFieldValue, resetForm} }>
        <Form
          onSubmit={ () => handleSubmit() }
          // onReset={() => {}}
          className="form"
          id="join-form"
        >
          <h1>Consulta de nuevo jugador</h1>
          <TextInputForm
            name="first_name"
            label="Nombre"
            validators={[requiredValidator, nameValidator]}
            placeholder="Martina"
          />
          <TextInputForm
            name="last_name"
            label="Apellidos"
            validators={[requiredValidator, nameValidator]}
            placeholder="Garcia"
          />
          <TextInputForm
            name="phone_number"
            label="Numero de contacto"
            type="tel"
            validators={[requiredValidator, phoneNumberValidator]}
            placeholder="600500400"
          />
          <SelectInputForm 
            name="prefLocation"
            label="Ubicación preferida"
            validators={[requiredValidator]}
            options={["Divino Pastor", "Torre Atalaya", "Ave Maria", "Campanillas"]}
          />
          <SelectInputForm 
            name="gender"
            label="Género"
            className={ selectedGender || "" }
            validators={[requiredValidator]}
            options={["Femenino", "Masculino"]}
            resetOnChange={["dateOfBirth"]}
          />
          { formState.data.gender && renderBirthYears() }
          { formState.data.dateOfBirth && renderAvailableCategory() }
         
        </Form>
      </FormContext.Provider>
      </section>
    </div>
  )
}