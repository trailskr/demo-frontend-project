// Short part sample from prev project (not match this demo)

// import { faker } from '@faker-js/faker'

import { InterceptorRequestOptions, QueryParameterOrArray, QueryParameters } from '@/utils/createApi'
import { isArray, isString } from '@/utils/typecheck'
import { createIntegerIdCounter, fullTextDeepSearch } from '@/utils/utils'

import { api } from './api'
// import { RoleInfo, ContactInfo, ContactGroupInfo, UserInfo } from './apiTypes'

const faker: any = 0
type RoleInfo = any
type ContactInfo = any
type ContactGroupInfo = any
type UserInfo = any

const mulberry32 = (a: number) => {
  return () => {
    let t = a += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

const random = mulberry32(0)

// const randomFloat = (from: number, to: number) => random() * (to - from) + from
const randomInteger = (from: number, to: number) => Math.floor(random() * (to - from + 1) + from)

const randomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(random() * arr.length)]
}

const byId = <T extends {id: number | string}>(list: T[], id: number | string) => {
  return list.find((item) => item.id.toString() === id.toString())
}

const randomItems = <T>(arr: T[], countFrom = 5, countTo = countFrom): T[] => {
  const pick: T[] = []
  const count = randomInteger(countFrom, countTo)
  for (let i = 0; i < count; i++) {
    pick.push(randomItem(arr))
  }
  return pick
}

const createList = <T>(createItem: (index: number, count: number) => T, countFrom = 10, countTo = countFrom) => {
  const count = randomInteger(countFrom, countTo)
  return [...new Array(count)].map((_, index) => createItem(index, count))
}

const getQueryParmater = <T>(val?: QueryParameterOrArray): T => {
  return (isArray(val) ? val[0] : val) as unknown as T
}

const getPage = <T>(list: T[], query: QueryParameters = {}) => {
  const count = getQueryParmater<number>(query.count)
  const page = getQueryParmater<number>(query.page)
  const offset = (page - 1) * count
  return {
    page,
    count,
    total: list.length,
    pages: Math.ceil(list.length / count),
    data: list.slice(offset, offset + count)
  }
}

const filterList = <T>(list: T[], query: QueryParameters = {}) => {
  const q = getQueryParmater<string>(query.query)?.trim()
  if (!q) return list
  return list.map((item) => ({
    result: fullTextDeepSearch(item, q),
    item
  }))
    .filter((item) => item.result)
    .sort((a, b) => a.result - b.result)
    .map((item) => item.item)
}

type FilterStructure = {
  <T, Key extends string | number | symbol = keyof T>(list: T[], fieldsDefaultAvailability: Record<Key, boolean>, query?: QueryParameters): T[]
  <T, Key extends string | number | symbol = keyof T>(item: T, fieldsDefaultAvailability: Record<Key, boolean>, query?: QueryParameters): T
}

const filterStructure: FilterStructure = <T, Key extends string | number | symbol = keyof T>(listOrItem: T[] | T, fieldsDefaultAvailability: Record<Key, boolean>, query: QueryParameters = {}): T[] | T => {
  const list = isArray(listOrItem) ? listOrItem : [listOrItem]
  const filtered = list.map((item) => {
    const copy: any = { ...item }
    Object.entries(fieldsDefaultAvailability).forEach(([key, defaultAvailable]) => {
      const q = getQueryParmater<boolean>(query[key])
      const available = q ?? defaultAvailable
      if (!available) copy[key] = null
    })
    return copy
  })
  return isArray(listOrItem) ? filtered : filtered[0]
}

const manyToManyBackPort = <TTo, TFrom>(listTo: TTo[], listFrom: TFrom[], keyTo: keyof TTo, keyFrom: keyof TFrom): void => {
  listTo.forEach((itemTo: any) => {
    itemTo[keyTo] = listFrom
      .filter((itemFrom) => (itemFrom[keyFrom] as any)?.includes(itemTo))
      .map((itemFrom) => ({ ...itemFrom, [keyFrom]: null })) // remove back recursive link
  })
}

const upperFirst = (str: string): string => str.length > 0 ? str[0].toUpperCase() + str.slice(1) : str

interface MockItem {
    url: string | RegExp
    method?: string
    disabled?: boolean
    status?: number
    delay?: number
    response?: (options: InterceptorRequestOptions, params: Record<string, any>) => any
}

const getMocks = (): MockItem[] => {
  const userId = createIntegerIdCounter()
  const contactGroupId = createIntegerIdCounter()
  const contactId = createIntegerIdCounter()

  const roles: RoleInfo[] = [
    'Administrator',
    'User'
  ]

  const users = createList<UserInfo>(() => ({
    id: userId(),
    role: 'user',
    name: faker.name.firstName(),
    surname: faker.name.lastName(),
    email: faker.internet.email(),
    emailVerified: faker.datatype.boolean(),
    phone: faker.phone.number('+1 ### ### ## ##'),
    photoUrl: faker.image.avatar()
  }))

  const contacts = createList<ContactInfo>(() => ({
    id: contactId(),
    editable: true,
    name: faker.name.firstName(),
    surname: faker.name.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number('+1 ### ### ## ##'),
    created: {
      date: faker.date.recent(30).toISOString(),
      user: randomItem(users)
    },
    groups: []
  }), 55)

  const contactsGroups = createList<ContactGroupInfo>(() => ({
    id: contactGroupId(),
    name: upperFirst(faker.word.noun()),
    editable: true,
    items: randomItems(contacts, 2, 8).map((contact) => ({
      contact,
      role: randomItem(roles)
    })),
    created: {
      date: faker.date.recent(30).toISOString(),
      user: randomItem(users)
    }
  }), 13)

  manyToManyBackPort(contacts, contactsGroups, 'groups', 'items')

  const contactStructureFilter = { groups: false }
  const contactGroupStructureFilter = { contacts: false }

  return [
    {
      url: '/contacts',
      disabled: true,
      response: ({ query }) => getPage(filterStructure(filterList(contacts, query), contactStructureFilter, query), query)
    },
    {
      url: '/contacts/:id',
      disabled: true,
      response: ({ query }, { id }) => filterStructure(byId(contacts, id), contactStructureFilter, query)
    },
    {
      url: '/groups',
      disabled: true,
      response: ({ query }) => getPage(filterStructure(filterList(contactsGroups, query), contactGroupStructureFilter, query), query)
    },
    {
      url: '/groups/:id',
      disabled: true,
      response: ({ query }, { id }) => filterStructure(byId(contactsGroups, id), contactGroupStructureFilter, query)
    },
    {
      url: '/users/me',
      disabled: true,
      response: (): UserInfo => ({
        id: 1,
        role: 'user',
        name: 'Jane',
        surname: 'Doe',
        email: 'john@doe.com',
        emailVerified: true,
        phone: ('+1 999 999 99 99'),
        photoUrl: '/mock/user.png'
      })
    }
  ]
}

const createUrlRegExp = (url: string): RegExp => {
  return new RegExp('^' + url.replace(/:([\w\d]+)/g, '(?<$1>\\w+)') + '$')
}

const matchUrl = (url: string, urlPattern: string | RegExp): RegExpMatchArray | null => {
  const re = isString(urlPattern) ? createUrlRegExp(urlPattern) : urlPattern
  return url.match(re)
}

export const mockApi = () => {
  const mocks = getMocks().filter((mock) => !mock.disabled)

  api.addRequestInterceptor((options) => {
    if (options.headers?.['No-Mock']) return options
    for (const mock of mocks) {
      const method = mock.method ?? 'GET'
      const m = matchUrl(options.url, mock.url)
      if (!m || method !== options.method) continue
      return Promise.resolve(mock?.response?.(options, m.groups ?? {})).then((data) => {
        const blob = data ? new Blob([JSON.stringify(data)]) : new Blob()
        const response = new Response(blob, { status: mock.status ?? 200, headers: data ? { 'Content-Type': 'application/json' } : {} })
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log('mocked response for: ', options, data)
            resolve(response)
          }, mock.delay ?? 500)
        })
      }) as Promise<Response>
    }
    return options
  })
}
