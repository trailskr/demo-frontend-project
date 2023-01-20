import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js'

export const validatePhone = (formattedPhone?: string | null): boolean => {
  return formattedPhone ? isValidPhoneNumber(formattedPhone, 'US') : true
}

export const serializePhone = (formattedPhone?: string | null) => {
  if (!validatePhone(formattedPhone)) return undefined
  const parsed = parsePhoneNumberFromString(formattedPhone || '', { defaultCountry: 'US' })
  if (!parsed) return undefined
  return parsed.number
}
