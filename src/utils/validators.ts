export const requiredValidator = (val: string | number ) => {
  if (!val || !val.toString().trim()) {
    return ["Este campo es obligatorio."]
  }
  return []
}
export const nameValidator = (val: string | number) => {
  if (val && val.toString().trim().length < 3) {
    return ["Demasiado corto."]
  }
  if (val && val.toString().trim().length > 26) {
    return ["Demasiado largo."]
  }
  return []
}
export const phoneNumberValidator = (val: string | number ) => {
  if (val && typeof val === 'string') {
    if ( isNaN(parseInt(val)) ) return ["Sólo se permiten dígitos."]

    const re = new RegExp("^\\d{9}$") // 9 digit phone number
    if (!re.test(val)) return ["Numero incorrecto."]
  }
  return []
}

export const usernameValidator = (val: string) => {
  return universalValidator(val, "^[A-Za-z][A-Za-z0-9_]{6,29}$", "Alfabeto, números y guiones bajos permitidos. min 6 caracteres.")
}
export const passwordValidator = (val: string) => {
  return universalValidator(val, "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", "Mayúscula, letra, número, carácter especial y min 8 caracteres.")
}

export const emailValidator = (val: string) => {
  return universalValidator(val, "^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$", "No parece correo electrónico.")
}
export const memberIDValidator = (val: string) => {
  return universalValidator(val, "^[0-9]{4}$", "Dígitos de numero de socio en club.")
}

export const universalValidator = (val: string, regex: string, errorMsg: string) => {
  const re = new RegExp(regex)
  if (val && !re.test(val)) return [errorMsg]
  return []
}

export const checkRangeValidator = (min = 1, max = 99, floatPermited = false) => <T>(value: T) => {
  if (!value ) return []

  if (typeof value !== "number") {
    const val = value as string
    if (!floatPermited && !RegExp("^\\d+$").test(val)) return ["Incorrect value!"]
    if (floatPermited && (val.split(".")[1]?.length > 2)) return ["To many decimals!"]
  }
  const val = value as number
  // const val = floatPermited ? parseFloat(value) : parseInt(value)
  
  // check float case
  if (Number.isNaN(val)) return ["Is not a number!"]

  if (val < min || val > max) return ["Incorrect Number!", `Range allowed ${min} - ${max}.`]

  return []
}