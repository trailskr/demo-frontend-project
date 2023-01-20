import IMask from 'imask'

export const dateBlocks = {
  YYYY: {
    mask: IMask.MaskedRange,
    from: 1970,
    to: 2130,
    autofix: true
  },
  MM: {
    mask: IMask.MaskedRange,
    from: 1,
    to: 12,
    autofix: 'pad'
  },
  DD: {
    mask: IMask.MaskedRange,
    from: 1,
    to: 31,
    autofix: 'pad'
  },
  HH: {
    mask: IMask.MaskedRange,
    from: 0,
    to: 23,
    autofix: 'pad'
  },
  hh: {
    mask: IMask.MaskedRange,
    from: 1,
    to: 12,
    autofix: 'pad'
  },
  mm: {
    mask: IMask.MaskedRange,
    from: 0,
    to: 59,
    autofix: 'pad'
  },
  A: {
    mask: IMask.MaskedEnum,
    enum: ['AM', 'PM']
  }
}

export const defaultTime = '12:00'
