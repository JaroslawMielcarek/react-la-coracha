import { useFetch } from "utils/useFetch"
import "./EnrollmentDisplay.css"
import { TEnrollCategory, TEnrollGender } from "shared/types"
import { sortEnrollCategoryListByMaxAge } from "utils/sort"

export const EnrollmentDisplay = () => {
  const [enrolled] = useFetch<TEnrollCategory[]>({ url: "public/getAllEnrollCategory", errorTitle: " Enrolled Display"})
  
  if (!enrolled || !enrolled.length) return <p className="no-data">No hay ninguna categoría de inscripción disponible en este momento</p>
  
  return (
    <>
    { sortEnrollCategoryListByMaxAge<TEnrollCategory>(enrolled).map( (c, index) => <EnrollmentCategory category={ c } key={ index } />) }
    </>
  )
}

const EnrollmentCategory = ({ category }: { category: TEnrollCategory }) => {
  const { female , male } = category
  const genders = [] as ["Feminino" | "Masculino", TEnrollGender][]
  if (female) genders.push(["Feminino", female])
  if (male) genders.push(["Masculino", male])

  return (
    <ul>
      <h4 className="category-name">{ category.name }</h4>
        { genders.map( ([key,value], index) => <EnrollmentCategoryGender gender={ key } value={ value } key={ index } /> ) }
    </ul>
  )

}

const EnrollmentCategoryGender = ({gender, value}: { gender: "Feminino" | "Masculino", value: TEnrollGender}) => {
  return (
    <li>
      <h5 className={ "category-gender " + gender }>{ gender } ( { value.minAge } - { value.maxAge } Años )</h5>
      <progress className={ "progress-bar " + gender } max={ value.maxPlaces } value={ value.currentEnrolled }/>
    </li>
  )
}