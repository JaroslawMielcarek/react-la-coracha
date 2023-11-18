
interface IGender {
  female?: { maxAge: number }
  male?: { maxAge: number }
}

export  function sortEnrollCategoryListByMaxAge<T extends IGender>(list: T[]){
  return [...list].sort( (a, b) => {

  const valA = a.female?.maxAge || a.male?.maxAge || 0
  const valB = b.female?.maxAge || b.male?.maxAge || 0
  return valA - valB
  })
}

export function sortedByPropName<T>(list: T[], val: string, desc = false): T[] {
  const propName = val as keyof T
  if (!list || !list.length) return []
  return [...list].sort( (a, b) => {
    const valA = a[propName]
    const valB = b[propName]
    if (!valA ) return desc ? -1 : 1
    if (!valB ) return desc ? 1 : -1
    return valA.toString().localeCompare(valB.toString(),'en',) * (desc ? -1 : 1)
  })
}