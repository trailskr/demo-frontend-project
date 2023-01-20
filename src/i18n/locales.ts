export type AllowedLocale = 'en'

export const localeTitles: {[K in AllowedLocale]: string} = {
  en: 'English'
}

export const detectAllowedLocale = (locale?: string): AllowedLocale => {
  return 'en'
}
