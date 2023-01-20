import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import objectSupport from 'dayjs/plugin/objectSupport'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
// import duration from 'dayjs/plugin/duration'

dayjs.extend(localizedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(objectSupport)
dayjs.extend(utc)
dayjs.extend(relativeTime)
// dayjs.extend(duration)
