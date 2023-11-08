import { SelectInput } from "components/selectInput/SelectInput"
import "./Table.css"

type propTypes = {
  id?: string,
  className?: string,
  filters?: string[],
  filterSelected?: string,
  onFilterSelect?: Function,
  children?: JSX.Element | JSX.Element[]
}

export const Table = ({filters, onFilterSelect, filterSelected, children, className, id}: propTypes) => {

  const renderFilters = () => {
    if (!filters || !filters.length) return null

    const handleOnChange = (val: string) => {
      if (onFilterSelect) {
        return onFilterSelect(val)
      }
    }
    
    return (
      <div className="filter-panel">
        <label>Mostrar:</label>
        <SelectInput options={filters} name="table-filter" label="Selectiona" value={filterSelected || ''} onChange={handleOnChange}/>
      </div>
    )
  }

  const klass = className? `${className} table` : "table"
  return (
    <div className={ klass } id={ id }>
      { renderFilters() }
      { children }
    </div>

  )
}