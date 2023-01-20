import { ByteSizeUnit, byteSizeUnit } from '@/utils/utils'

export const useByteSizeText = () => {
  const { t } = useI18n()

  return (size: number | undefined) => {
    const s = unref(size)
    if (s == null) return ''
    const [value, unit] = byteSizeUnit(s)
    switch (unit) {
      case ByteSizeUnit.Byte: return `${value} ${t('size.b')}`
      case ByteSizeUnit.Kilobyte: return `${value} ${t('size.kb')}`
      case ByteSizeUnit.Magabyte: return `${value} ${t('size.mb')}`
      case ByteSizeUnit.Gigabyte: return `${value} ${t('size.gb')}`
      case ByteSizeUnit.Terabyte: return `${value} ${t('size.tb')}`
    }
  }
}
