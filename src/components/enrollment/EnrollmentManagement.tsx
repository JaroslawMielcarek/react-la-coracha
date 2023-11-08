import { createContext, useContext, useState } from "react"
import "./EnrollmentManagement.css"
import * as XLSX from 'xlsx'
import { useFetch } from "utils/useFetch"
import { Table } from "components/table/Table"
import { TickButton } from "components/tickButton/TickButton"
import { isTheSame, prepareFormState, prepareToSend } from "utils/object"
import { FormContext, useFormState } from "components/form/useFormState"
import Form from "components/form/Form"
import { TextInputForm } from "components/TextInput/TextInput"
import { checkRangeValidator, requiredValidator } from "utils/validators"
import { UserContext } from "utils/useUser"
import { sortEnrollCategoryListByMaxAge, sortedByPropName } from "utils/sort"
import { TEnrollCategory, TEnrollGender, TEnrolledPerson } from "shared/types"


type EnrolledContextType = {
  sendData: <T>(url: string, s: T) => Promise<boolean>,
}

const EnrollmentContext = createContext<EnrolledContextType>({
  sendData: () => Promise.resolve(true),
})

export const EnrollmentManagement = () => {
  const [enrolled, sendData] = useFetch<TEnrollCategory[]>({ url: "moderator/getAllEnrollCategory", errorTitle: "Enrolled Manager"})
  const [newCategory, setNewCategory] = useState<TEnrollCategory | null>(null)
  const { isAdmin } = useContext(UserContext)

  const renderCategories = () => {
    if (!enrolled || !enrolled.length) return <p className="no-data">There is no data at the moment</p>
    return  sortEnrollCategoryListByMaxAge(enrolled).map( (c, index) => <Category c={ c } key={ index }/> )
  }

  const renderButton = () => {
    if (!newCategory) return <button id="newCategory" className="btn white" onClick={() => setNewCategory({name: '', deadline: new Date()}) }>Crear nueva categoría</button>
    return <button id="newCategory" className="btn white" onClick={() => setNewCategory(null) }>Cancelar creación</button>
  }

  return (
    <div id="enrollmentManagement">
      { isAdmin() && <EnrolledDownloader enrolledList={ enrolled }/>}
      { renderButton() }
      <EnrollmentContext.Provider value= { { sendData } }>
        { newCategory && <CategoryDetails c={ newCategory } hideDetails={() => setNewCategory(null)}/> }
        { renderCategories() }
      </EnrollmentContext.Provider>
    </div>
  )
}

const CategoryDetails = ({c, hideDetails}: {c: TEnrollCategory, hideDetails: Function}) => {
  const { sendData } = useContext(EnrollmentContext)
  const p = prepareFormState(c)
  const { formState, validate, registerInput, setFieldValue, resetForm } = useFormState(p)
  const [hasFemaleCat, setHasFemaleCat] = useState(!!c.female)
  const [hasMaleCat, setHasMaleCat] = useState(!!c.male)

  const handleSubmit = async () => {
    if (!formState.data) return
    const data = prepareToSend<TEnrollCategory>(formState.data)
    if (!hasFemaleCat) {
      if (!!c.female && !window.confirm("Are you sure? All information of enrolled FEMALE players in this category will be lost permanently!") ) return null
      delete data.female
    }
    if (!hasMaleCat) {
      if (!!c.male && !window.confirm("Are you sure? All information of enrolled MALE players in this category will be lost permanently!") ) return null
      delete data.male
    }
    if ( (!data._id) ? await sendData("moderator/createEnrollCategory", data) : await sendData("moderator/updateEnrollCategory", data) ) hideDetails(null)
  }

  const handleRemove = async () => {
    if (!window.confirm("Are you sure!? All information about candidates inscritos will be lost permanently!")) return null
    if ( await sendData("moderator/deleteEnrollCategory", c) ) hideDetails()
  }

  const renderGender = (gender: 'female' | 'male') => {
    return (
      <>
        <TextInputForm name={ `${gender}-maxPlaces`} label="No. de limite" type="number" validators={ [requiredValidator, checkRangeValidator(1, 30, false)] }/>
        <TextInputForm name={ `${gender}-minAge`} label="Edad minima" type="number" validators={ [requiredValidator, checkRangeValidator(1, 70, false)] }/>
        <TextInputForm name={ `${gender}-maxAge`} label="Edad maxima" type="number" validators={ [requiredValidator, checkRangeValidator(1, 70, false)] }/>
      </>
      )
  }
  const renderButton = () => {
    const res = !(hasFemaleCat === !!c.female) || !(hasMaleCat === !!c.male) 
    const result = Object.entries(formState.data).every( ([key, value]) => isTheSame(value, p[key as keyof typeof p]) )
    if (!(res || !result)) return null
    return <button className="btn full-width color" type="submit">Guardar</button>
  }
  return (
    <FormContext.Provider value={ { formState, validate, registerInput, setFieldValue, resetForm } }>
      <Form
        id="details"
        className="form"
        onSubmit={() => handleSubmit()}
        onReset={() => {}}
      >
        <div>
          <TextInputForm name="name" label="Nombre" validators={ [requiredValidator] } />
          <TextInputForm name="deadline" type="date" label="Deadline" validators={ [requiredValidator] }/>
          { renderButton()}
          { !c._id && 
            <fieldset className="remove dashed">
              <legend>Acción peligrosa</legend>
              <button className="btn full-width color red" type="button" onClick={ () => handleRemove() }>Eliminar</button>
            </fieldset>
          }
        </div>
        <div className="flex-group">
          <fieldset className="female dashed">
            <legend>
              <TickButton className="" label="Femenino" value={hasFemaleCat} onChange={(val: boolean) => setHasFemaleCat(val)} />
            </legend>
            { hasFemaleCat && renderGender("female") }
          </fieldset>
          <fieldset className="male dashed">
            <legend>
              <TickButton className="" label="Masculino" value={hasMaleCat} onChange={(val: boolean) => setHasMaleCat(val)} />
            </legend>
            { hasMaleCat && renderGender("male") }
          </fieldset>
        </div>
      </Form>
    </FormContext.Provider>
  )
}

const renderGenderTables = (c: TEnrollCategory) => {
  const { female , male} = c
  const genders = [] as [string, TEnrollGender][]
  if (female) genders.push(["Feminino", female])
  if (male) genders.push(["Masculino", male])
  return genders.map( ([key, value]) =>  <GenderTable label={ key } genderObject={ value } key={key}/> )
}

const Category = ({c}: {c: TEnrollCategory}) => {
  const [showDetails, setShowDetails] = useState<TEnrollCategory | null>(null)

  return (
    <fieldset className="dashed" key={c.name}>
      <legend className="category-name extra-message">
        <span>{ c.name }</span>
        { showDetails 
          ? <button className="btn" onClick={() => setShowDetails(null) }>Anular modificacion</button>
          : <button className="btn" onClick={() => setShowDetails(c) }>Modificar</button>
        }
      </legend>
      { showDetails && <CategoryDetails c={ c } hideDetails={() => setShowDetails(null) }/>}
      { renderGenderTables(c) }
    </fieldset>
  )
}



const GenderTable = ({label, genderObject}: {label: string, genderObject: TEnrollGender}) => {
  const klass = ( genderObject.currentEnrolled <= (genderObject.maxPlaces - 2) ) ? "current" : "current closeToLimit"
  const [sortBy, setSortBy] = useState("name")

  const renderTable = (list: TEnrolledPerson[] | undefined, sortBy: string) => {
    if (!list || !list.length) return <p className="no-data extra-message">No one enrolled yet</p>
    return (
      <>
      { sortedByPropName(list, sortBy).map( person => <Person p={ person } key={ person._id }/>) }
      </>
    )
  }
  return (
    <Table>
      <div className="table-head">
        <div className="column gender-type">
          <p>{ label }</p>
          <p className={ klass }><b>{ genderObject.currentEnrolled }</b> / { genderObject.maxPlaces }</p>
        </div>
        <p className="column sort" onClick={ () => setSortBy("name") }>Name</p>
        <p className="column location sort" onClick={ () => setSortBy("prefLocation")}>Prefered Loc.</p>
        <p className="column">Was contacted</p>
        <p className="column sort" onClick={ () => setSortBy("phoneNumber") }>No. de tel.</p>
        <p className="column">Was before</p>
        <p className="column comments">Comentarios</p>
        <p className="column sort" onClick={ () => setSortBy("dateOfEnrollment") }>Date</p>
        <p className="column contactedBy sort" onClick={ () => setSortBy("contactedBy") }>Contacted by</p>
        <p className="column"></p>
      </div>
      <ul className="">
        { renderTable(genderObject.list, sortBy) }
      </ul>
      <>
        { !!genderObject.waitingList?.length && 
          <ul className="waitingList">
            {  sortedByPropName(genderObject.waitingList, sortBy).map( person => <Person p={ person } key={ person._id }/>) }
          </ul>
        }
      </>
    </Table>

  )
}

const Person = ({p}: {p: TEnrolledPerson}) => {
  const { sendData } = useContext(EnrollmentContext)
  const { username } = useContext(UserContext)
  const [isEditing, setIsEditing] = useState(false)
  const [person, setPerson] = useState(p)
  const klass = person.wasContacted ? "table-row" : "table-row new"
  const [date, time] = new Date(person.dateOfEnrollment).toLocaleString().split(",")
  const [day, month, year] = date.split("/")

  
  const handleSubmitChange = async () => {
    if ( await sendData("moderator/updateCandidate", person) ) setIsEditing(false)
  }
  const handleRemoveClick = () => {
    if (!window.confirm(`Are you sure! All information about candidate: ${person.name.toUpperCase()} will be permanently lost!`)) return null
    sendData("moderator/deleteCandidate", person)
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setPerson(state => ({
      ...state,
      comments: val
    }))
  }

  const handleToggle = (propName: string, val: boolean) => {
    if (!isEditing) return null
    if (propName === "wasContacted") {
      return setPerson(state => ({
        ...state,
        [propName]: val,
        contactedBy: val ? username() : ""
      }))
    }
    setPerson(state => ({
      ...state,
      [propName]: val
    }))
  }
  const renderActionButton = () => {
    if (!isEditing) return <button className='btn color' onClick={ () => setIsEditing(true) }>Editar</button>
    const hasChanges = !Object.entries(person).every(([key, value]) => isTheSame(value, p[key as keyof TEnrolledPerson]))
    if (!hasChanges) return <button className='btn' onClick={ () => setIsEditing(false) }>Anular</button>
    return <button className='btn color' onClick={ () => handleSubmitChange() }>Guardar</button>
  }
  return (
    <li className={ klass }>
      <div className='action column'>
        { renderActionButton() }
      </div>
      <p className="column">{ person.name }</p>
      <p className="column location">{ person.prefLocation }</p>
      <TickButton className="column" value={ person.wasContacted } onChange={ (val: boolean) => handleToggle("wasContacted", val) } />
      <p className="column">{ person.phoneNumber }</p>
      <TickButton className="column member-previous" value={ person.wasWithUsBefore } onChange={ (val: boolean) => handleToggle("wasWithUsBefore", val) } />
      <textarea className="column comments" disabled={ !isEditing } value={ person.comments } onChange={ handleInputChange }></textarea>
      <div className="column">
        <div className="date">
          <p className="day">{ day }</p>
          <p className="month">{ month }</p>
          <p className="year">{ year }</p>
          <p className="time">{ time }</p>
        </div>
      </div>
      <p className="column contactedBy">{ person.contactedBy }</p>
      <div className="action column">
        <button className="btn danger" onClick={ () => handleRemoveClick() }>x</button>
      </div>
    </li>
  )
}

type TEnrolledPersonForXLSX = TEnrolledPerson & {
  category: string,
  isInWaitingList: boolean
}
const prepareReport = (list: TEnrollCategory[] | undefined) => {
  if (!list) return []

  return list.reduce( (listOfAll, category) => {
    listOfAll.push(...Object.entries(category).reduce( (playerList, [key, value]) => {
      if (key === "male" || key === "female") {
        const v = value as TEnrollGender
        
        if ( v.list ) playerList.push( ...v.list.map(e => {
          const { _id, ...person} = e
          return { ...person, category: category.name, isInWaitingList: false }
        }) )

        if ( v.waitingList ) playerList.push( ...v.waitingList.map(e => {
          const { _id, ...person} = e
          return { ...person, category: category.name, isInWaitingList: true }
        }) )
      }
      return playerList
    }, [] as TEnrolledPersonForXLSX[] ) )
    return listOfAll
  }, [] as TEnrolledPersonForXLSX[] )
}
const EnrolledDownloader = ({enrolledList}: {enrolledList: TEnrollCategory[] | undefined}) => {

  const handleDownloadRaport = (list: TEnrollCategory[]| undefined) => {
    if (!list) return alert("There is no data to download!")
    const p = prepareReport(list)
    const ws = XLSX.utils.json_to_sheet(p)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Players")
    XLSX.writeFile(wb, `reportOf_Enrolled_Till_${ new Date().toLocaleDateString()}.xlsx`)
  }
 
  return (
    <fieldset className="dashed fit">
      <legend className="extra-message">Aquí puede descargar todos los matriculados en formato de excel</legend>
      <button className="btn color" onClick={() => handleDownloadRaport(enrolledList) }>Descargar todos matriculados</button>
    </fieldset>
  )
}