import { VariantObject } from 'unocss'

const parentModifiersMap: Record<string, string> = {
  first: 'first-child',
  last: 'last-child',
  odd: 'odd',
  even: 'even',
  visited: 'visited',
  checked: 'checked',
  hover: 'hover',
  'focus-within': 'focus-within',
  'focus-visible': 'focus-visible',
  focus: 'focus',
  active: 'active',
  link: 'link',
  target: 'target',
  'not-checked': 'not(:checked)',
  default: 'default',
  enabled: 'enabled',
  indeterminate: 'indeterminate',
  invalid: 'invalid',
  valid: 'valid',
  optional: 'optional',
  required: 'required',
  'placeholder-shown': 'placeholder-shown',
  'read-only': 'read-only',
  'read-write': 'read-write',
  'not-disabled': 'not(:disabled)',
  'first-of-type': 'first-of-type',
  'not-first-of-type': 'not(:first-of-type)',
  'last-of-type': 'last-of-type',
  'not-last-of-type': 'not(:last-of-type)',
  'not-first': 'not(:first-child)',
  'not-last': 'not(:last-child)',
  'only-child': 'only-child',
  'not-only-child': 'not(:only-child)',
  'only-of-type': 'only-of-type',
  'not-only-of-type': 'not(:only-of-type)',
  'even-of-type': 'nth-of-type(even)',
  'odd-of-type': 'nth-of-type(odd)',
  root: 'root',
  empty: 'empty'
}

const parentModifiersMapStr = Object.keys(parentModifiersMap).join('|')

const parentModifierRegExp = new RegExp(`^group_(?<groupName>\\w+?)(?:-(?<groupModifier>${parentModifiersMapStr}))?:`)

export const parentNamedGroupStatusModifier: VariantObject = {
  match: (matcher) => {
    const m = matcher.match(parentModifierRegExp)
    if (!m || !m.groups) return
    const { groupName, groupModifier } = m.groups
    return {
      matcher: matcher.slice(m[0].length),
      selector: (s) => groupModifier
        ? `.group_${groupName}:${parentModifiersMap[groupModifier]} ${s}`
        : `.group_${groupName} ${s}`
    }
  },
  multiPass: true
}
