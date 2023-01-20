import dayjs, { Dayjs } from 'dayjs'

const formats = Object.assign({}, dayjs.Ls.en.formats, dayjs.Ls[dayjs.locale()].formats) as Record<string, string>
Object.keys(formats).forEach((key) => {
  // replacing variable lenght numbers with fixed length
  formats[key] = formats[key]
    .replace(/\bh\b/, 'hh')
    .replace(/\bH\b/, 'HH')
    .replace(/\bD\b/, 'DD')
    .replace(/\bM\b/, 'MM')
    .replace(/\bm\b/, 'mm')
    .replace(/\bs\b/, 'ss')
    .replace(/\bYY\b/, 'YYYY')
})

// parse - parse displayed local string to dayjs in utc mode
// format - format dayjs date in utc mode to displayed local date string
// deserialize - parse model utc string to dayjs date in utc mode
// serialize - serialize dayjs date to model utc string
// simple format type - format and deserialize
// un simple format type - parse and serialize

// ================ DATE ==================
export const dateLocalFormat = formats.L

// date is always in utc absolute mode without any conversions
export const dateParse = (v?: string | null) => {
  const d = dayjs.utc(v, dateLocalFormat, true)
  return d.isValid() ? d : undefined
}

export const dateFormat = (d?: Dayjs | null) => {
  return d ? d.format(dateLocalFormat) : undefined
}

export const dateDeserialize = (v?: string | null) => {
  const d = dayjs.utc(v, 'YYYY-MM-DD', true)
  return d.isValid() ? d : undefined
}

export const dateSerialize = (d?: Dayjs | null) => {
  return d ? d.format('YYYY-MM-DD') : undefined
}

export const dateDeserializeAndFormat = (v?: string | null) => {
  return dateFormat(dateDeserialize(v))
}

export const dateParseAndSerialize = (v?: string | null) => {
  return dateSerialize(dateParse(v))
}

// ================ TIME ==================
export const timeLocalFormat = formats.LT

export const timeParse = (v?: string | null) => {
  const d = dayjs(v, timeLocalFormat, true).utc()
  return d.isValid() ? d : undefined
}

export const timeFormat = (d?: Dayjs | null) => {
  return d ? d.local().format(timeLocalFormat) : undefined
}

export const timeDeserialize = (v?: string | null) => {
  const d = dayjs.utc(v, v && v.length === 5 ? 'HH:mm' : 'HH:mm:ss', true)
  return d.isValid() ? d : undefined
}

export const timeSerialize = (d?: Dayjs | null) => {
  return d ? d.format('HH:mm') : undefined
}

export const timeDeserializeAndFormat = (v?: string | null) => {
  return timeFormat(timeDeserialize(v))
}

export const timeParseAndSerialize = (v?: string | null) => {
  return timeSerialize(timeParse(v))
}

// ================ DATETIME ==================
export const dateTimeLocalFormat = `${formats.L} ${formats.LT}`

export const dateTimeParse = (v?: string | null) => {
  const d = dayjs(v, dateTimeLocalFormat, true).utc()
  return d.isValid() ? d : undefined
}

export const dateTimeFormat = (d?: Dayjs | null) => {
  return d ? d.local().format(dateTimeLocalFormat) : undefined
}

export const dateTimeDeserialize = (v?: string | null) => {
  const d = dayjs.utc(v)
  return d.isValid() ? d : undefined
}

export const dateTimeSerialize = (d?: Dayjs | null) => {
  return d ? d.utc().format('YYYY-MM-DDTHH:mm:00[Z]') : undefined
}

export const dateTimeDeserializeAndFormat = (v?: string | null) => {
  return dateTimeFormat(dateTimeDeserialize(v))
}

export const dateTimeParseAndSerialize = (v?: string | null) => {
  return dateTimeSerialize(dateTimeParse(v))
}

// ================ DATETIME+SECONDS ==================
export const dateTimeSecondsLocalFormat = `${formats.L} ${formats.LTS}`

export const dateTimeSecondsParse = (v?: string | null) => {
  const d = dayjs(v, dateTimeSecondsLocalFormat, true).utc()
  return d.isValid() ? d : undefined
}

export const dateTimeSecondsFormat = (d?: Dayjs | null) => {
  return d ? d.local().format(dateTimeSecondsLocalFormat) : undefined
}

export const dateTimeSecondsDeserialize = (v?: string | null) => {
  const d = dayjs.utc(v)
  return d.isValid() ? d : undefined
}

export const dateTimeSecondsSerialize = (d?: Dayjs | null) => {
  return d ? d.format('YYYY-MM-DDTHH:mm:ss[Z]') : undefined
}

export const dateTimeSecondsDeserializeAndFormat = (v?: string | null) => {
  return dateTimeSecondsFormat(dateTimeSecondsDeserialize(v))
}

export const dateTimeSecondsParseAndSerialize = (v?: string | null) => {
  return dateTimeSecondsSerialize(dateTimeSecondsParse(v))
}
