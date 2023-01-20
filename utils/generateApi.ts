import fs from 'fs'
import https from 'https'
import { resolve as pathResolve, relative } from 'path'

import { ESLint } from 'eslint'
import fetch from 'node-fetch'
import prettier from 'prettier'
import yaml from 'yaml'

const httpsAgent = new https.Agent({ rejectUnauthorized: false })

const eslint = new ESLint({ fix: true })

const resolvePath = (pathToResolve: string) => pathResolve(process.cwd(), pathToResolve)

const forEachFileInDirectoryRecursively = (dirAbsolutePath: string, extensionsRe: RegExp, onFile: (fileName: string) => void) => {
  const list: string[] = fs.readdirSync(dirAbsolutePath)
  list.forEach((fileName) => {
    const filePath = pathResolve(dirAbsolutePath, fileName)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      forEachFileInDirectoryRecursively(filePath, extensionsRe, onFile)
    } else if (extensionsRe.test(fileName)) {
      onFile(filePath)
    }
  })
}

interface UsedPaths {
  [url: string]: Set<string> // method 'get' | 'put' | 'post' | 'delete'
}

const getUsedPaths = (): UsedPaths => {
  const requestRe = /\.(get|put|post|delete)(?:<.*?>)?\(['"`](.*?)['"`]/

  const paths: UsedPaths = {}

  forEachFileInDirectoryRecursively(resolvePath('./src'), /\.(ts|vue)$/, (filePath) => {
    const lines: string[] = fs.readFileSync(filePath).toString().split(/\r?\n/g)
    return lines.forEach((line) => {
      const match = line.match(requestRe)
      if (!match) return undefined
      const method = match[1]
      const path = match[2].split('?')[0].replace(/\${.*?}/g, '{param}')
      paths[path] = paths[path] ?? new Set()
      paths[path].add(method)
    })
  })

  return paths
}

const lastItem = <T> (arr: T[]): T => arr[arr.length - 1]

// eslint-disable-next-line no-use-before-define
type UnknownType = BasicType | StringEnum | ArrayType | RefType | OneOfType | AnyOfType | AllOfType | ObjectType | UndefinedType

interface BasicType {
  type: string
}

interface StringEnum {
  type: 'string'
  enum: string[]
}

interface ObjectType {
  type: 'object'
  required?: string[]
  properties: Record<string, UnknownType>
}

interface ArrayType {
  type: 'array'
  items: UnknownType
}

interface RefType {
  $ref: string
}

type UndefinedType = Record<string, never>

interface OneOfType {
  oneOf: UnknownType[]
}

interface AnyOfType {
  anyOf: UnknownType[]
}

interface AllOfType {
  allOf: UnknownType[]
}

const isObjectType = (type: UnknownType): type is ObjectType => 'type' in type && type.type === 'object'
const isStringEnumType = (type: UnknownType): type is StringEnum => 'type' in type && type.type === 'string' && 'enum' in type
const isArrayType = (type: UnknownType): type is ArrayType => 'type' in type && type.type === 'array'
const isRefType = (type: UnknownType): type is RefType => '$ref' in type
const isOneOfType = (type: UnknownType): type is OneOfType => 'oneOf' in type
const isAnyOfType = (type: UnknownType): type is AnyOfType => 'anyOf' in type
const isAllOfType = (type: UnknownType): type is AllOfType => 'allOf' in type
const isUndefinedType = (type: UnknownType): type is UndefinedType => Object.keys(type).length === 0

const mapBasicType = (type: string): string => {
  switch (type) {
    case 'integer':
      return 'number'
    default:
      return type
  }
}

interface OpenApiInfo {
  title: string
  version: string
  description: string
}

interface ResponseContent {
  [contentType: string]: {schema: UnknownType}
}

interface ApiResponse {
  description: string
  content: ResponseContent
}

interface ApiResponses {
  [responseCode: string]: ApiResponse
}

interface ApiMethodParameter {
  name: string
  in: 'path' | 'query'
  required: boolean
  schema: BasicType
}

interface RequestBody {
  content: ResponseContent
  required: boolean
}

const apiNameSymbol = Symbol('pathNameSymbol')

interface ApiMethod {
  [apiNameSymbol]: string // custom field for api name
  tags: string[]
  description: string
  operationId: string
  responses: ApiResponses
  requestBody?: RequestBody
  parameters?: ApiMethodParameter[]
}

interface ApiPath {
  [methodName: string]: ApiMethod
}

interface ApiPaths {
  [path: string]: ApiPath
}

interface Schemas {
  [typeName: string]: OneOfType | AllOfType | ObjectType
}

interface Api {
  openapi: string // version
  info: OpenApiInfo
  paths: ApiPaths
  components: {schemas: Schemas}
}

interface Interface {
  code: string
  level: number
  type: OneOfType | AllOfType | ObjectType
}

const formatCode = (code: string): string => prettier.format(code, {
  printWidth: 200,
  semi: false,
  parser: 'typescript',
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none'
})

const fixParameterName = (name: string): string => name.replace(/-(\w)(\w*)/g, (_, $1: string, $2: string) => $1.toUpperCase() + $2)
const upperFirstLetter = (callName: string): string => `${callName[0].toUpperCase()}${callName.slice(1)}`
const getParametersInterfaceName = (callName: string): string => `${upperFirstLetter(callName)}Parameters`

const getResponses = (responses: ApiResponses, from: number, to: number) => {
  return Object.entries(responses)
    .map(([key, value]) => ([Number(key), value] as [number, ApiResponse]))
    .filter(([key]) => key >= from && key < to)
}

export interface ApiGenerationOptions {
  apiCallsNameMapping?: Record<string, string>
  apiTypeNameMapping?: Record<string, string>
  onlyUsedPaths?: boolean
}
export interface ApiGenerationResult {
  apiCallsNameMapping: Record<string, string>
  apiTypeNameMapping: Record<string, string>
}

const schemaTypesFromUpper = (schemas: Schemas): Schemas => {
  const mappedSchemas: Schemas = {}
  Object.entries(schemas).forEach(([typeName, typeDef]) => {
    mappedSchemas[upperFirstLetter(typeName)] = typeDef
  })
  return mappedSchemas
}

export const generateApi = (swaggerUrl: string, options: ApiGenerationOptions = {}): Promise<ApiGenerationResult> => {
  const { apiCallsNameMapping = {}, apiTypeNameMapping = {}, onlyUsedPaths = true } = options
  const usedCallsNames = new Set<string>()
  const usedTypeNames = new Set<string>()
  const usedPaths = onlyUsedPaths ? getUsedPaths() : undefined
  const apiNames = new Set<string>()
  const interfaces = new Map<string, Interface>()
  const apiCalls: string[] = []

  const swaggerUrls: Record<string, string> = swaggerUrl.startsWith('{')
    ? JSON.parse(swaggerUrl)
    : { api: swaggerUrl }

  const apiPromises = Object.entries(swaggerUrls).map(([apiName, apiUrlOrFilePath]) => {
    const isJson = apiUrlOrFilePath.endsWith('json')
    const fetchUrl = (url: string) => fetch(apiUrlOrFilePath, {
      headers: { 'Content-Type': isJson ? 'application/json' : 'text/yaml' },
      agent: httpsAgent
    }).then((res) => {
      if (res.status >= 300 || res.status < 200) throw new Error('404')
      return isJson
        ? res.json() as Promise<Api>
        : res.text().then((text) => yaml.parse(text)) as Promise<Api>
    })
    const loadFile = (filePath: string) => new Promise<Api>((resolve, reject) => {
      fs.readFile(pathResolve(process.cwd(), filePath), { encoding: 'utf-8' }, (err, text) => {
        if (err) return reject(err)
        resolve(
          isJson
            ? JSON.parse(text) as Promise<Api>
            : yaml.parse(text) as Promise<Api>
        )
      })
    })
    const isUrl = apiUrlOrFilePath.startsWith('http')
    const getSpec = isUrl ? fetchUrl : loadFile
    return getSpec(apiUrlOrFilePath).then((api) => {
      if (api.paths) {
        Object.values(api.paths).forEach((pathDef) => {
          Object.values(pathDef).forEach((method) => {
            method[apiNameSymbol] = apiName
          })
        })
      }
      return api
    })
  })
  return Promise.all(apiPromises).then((apiList) => {
    return apiList.reduce((res, api) => {
      const paths: ApiPaths = { ...res.paths }
      Object.entries(api.paths).forEach(([path, pathDef]) => {
        paths[path] = {
          ...paths[path],
          ...pathDef
        }
      })
      return {
        openapi: api.openapi, // take last
        info: api.info, // take last
        paths,
        components: {
          // merge types
          schemas: {
            ...res.components?.schemas,
            ...schemaTypesFromUpper(api.components?.schemas)
          }
        }
      }
    }, {} as Api)
  }).then((api) => {
    const mapCallerName = (name: string) => {
      usedCallsNames.add(name)
      if (!apiCallsNameMapping[name]) apiCallsNameMapping[name] = name
      return apiCallsNameMapping[name] ?? name
    }

    const getRef = (path: string): {name: string, type: OneOfType | AllOfType | ObjectType} => {
      const schemaName = upperFirstLetter(lastItem(path.split(/\//)))
      const name = schemaName.replace(/_(\w)/, (_, letter: string) => letter.toUpperCase())
      return { name, type: api.components.schemas[schemaName] }
    }

    const getInterface = (intName: string, type: OneOfType | AllOfType | ObjectType, level: number, nullAsOptional: boolean): string => {
      usedTypeNames.add(intName)
      const name = apiTypeNameMapping[intName] ?? intName
      if (!apiTypeNameMapping[intName]) apiTypeNameMapping[intName] = intName
      let int = interfaces.get(name)
      if (int) {
        int.level = Math.min(level, int.level)
        return name
      }
      int = { type, code: '', level }
      interfaces.set(name, int) // Setting before type diving to avoid recursiong
      int.code = getTypeCode(type, level, nullAsOptional)
      return name
    }

    const getFields = (obj: ObjectType, level: number, nullAsOptional = false, flattenBaseKey = ''): string => {
      if (!obj.properties || Object.keys(obj.properties).length === 0) return '[key: string]: unknown'
      return Object.entries(obj.properties).map(([key, val]) => {
        const addNull = obj.required?.includes(key) ? '' : ' | null'
        return `${flattenBaseKey + key}${nullAsOptional && addNull ? '?' : ''}: ${getTypeCode(val, level + 1)}${addNull}`
      }).join('\n')
    }

    const getTypeCode = (type: UnknownType, level: number, nullAsOptional = true): string => {
      if (isObjectType(type)) {
        return `\
{
${getFields(type, level, nullAsOptional)}
}\
`
      } else if (isStringEnumType(type)) {
        return type.enum.map((str) => `'${str}'`).join(' | ')
      } else if (isArrayType(type)) {
        return `${getTypeCode(type.items, level, nullAsOptional)}[]` // Do not increase the level for arrays
      } else if (isRefType(type)) {
        const { name, type: refType } = getRef(type.$ref)
        return getInterface(name, refType, level, nullAsOptional)
      } else if (isOneOfType(type)) {
        return type.oneOf.map((t) => getTypeCode(t, level, nullAsOptional)).join(' | ')
      } else if (isAnyOfType(type)) {
        return type.anyOf.map((t) => getTypeCode(t, level, nullAsOptional)).join(' | ')
      } else if (isAllOfType(type)) {
        return type.allOf.map((t) => getTypeCode(t, level, nullAsOptional)).join(' & ')
      } else if (isUndefinedType(type)) {
        return 'unknown'
      }
      return mapBasicType(type.type)
    }

    const callerNames = new Set<string>()

    Object.entries(api.paths).forEach(([apiPath, pathDef]) => {
      for (const [method, apiMethod] of Object.entries(pathDef)) {
        const apiPathUrl = apiPath.replace(/{.*?}/g, '{param}')
        if (usedPaths) {
          const pathMethods = usedPaths[apiPathUrl]
          if (!pathMethods || !pathMethods.has(method)) continue
        }
        const apiName = apiMethod[apiNameSymbol]
        apiNames.add(apiName)
        const responsesSuccess = getResponses(apiMethod.responses, 200, 300)
        const responsesError = getResponses(apiMethod.responses, 400, 600)
        responsesError.forEach(([_status, response]) => {
          const errorSchema = response.content?.['application/json']?.schema
          if (errorSchema) getTypeCode(errorSchema, 0)
        })
        if (!responsesSuccess.length) return
        const responseSuccess = responsesSuccess[0][1]
        const responseSchema = responseSuccess.content?.['application/json']?.schema
        const responseType = responseSchema ? getTypeCode(responseSchema, 0) : 'void'
        const params = (apiMethod.parameters ?? [])
        const pathParameters = params.filter((p) => p.in === 'path')
        const queryParameters = params.filter((p) => p.in === 'query')
        const url = pathParameters.length > 0
          ? '`' + pathParameters.reduce((curPath, p) => {
            return curPath.replace(`{${p.name}}`, '${' + fixParameterName(p.name) + '}')
          }, apiPath) + '`'
          : `'${apiPath}'`
        const data = apiMethod.requestBody?.content?.['application/json']?.schema
        const dataType = data ? getTypeCode(data, 0, true) : undefined
        const dataParameter = dataType ? `data: ${dataType}` : ''
        const dataArgument = dataType ? 'data' : ''
        const additionalOptionsParameter = 'options?: CallerOptions'
        const additionalOptionsArgument = '...options'

        const parametersInterfaceFields = params.map((p) => {
          const required = p.required ? '' : ' | null'
          return `${fixParameterName(p.name)}${p.required ? '' : '?'}: ${getTypeCode(p.schema, 0, true)}${required}`
        }).join(', ')

        const simpleCallerName = fixParameterName(apiMethod.operationId as string)

        const callerName = callerNames.has(simpleCallerName)
          ? pathParameters.reduce((name, p, index) => {
            const pName = upperFirstLetter(fixParameterName(p.name))
            return name.replace(new RegExp(pName, 'i'), '') + (index === 0 ? `By${pName}` : `And${pName}`)
          }, simpleCallerName)
          : simpleCallerName

        callerNames.add(callerName)
        const mappedCallerName = mapCallerName(callerName)

        const paramsInterfaceName = getParametersInterfaceName(mappedCallerName)
        const paramsInterface = params.length > 0 ? `interface ${paramsInterfaceName} {${parametersInterfaceFields}}` : ''
        const paramsParameter = paramsInterface ? `params: ${paramsInterfaceName}` : ''

        const queryArgument = queryParameters.length > 0
          ? `query: {${queryParameters.map((p) => fixParameterName(p.name)).join(', ')}}`
          : ''

        const paramsDestructure = params.length > 0
          ? `const {${params.map((p) => fixParameterName(p.name)).join(', ')}} = params\n`
          : ''

        const parameters = [paramsParameter, dataParameter, additionalOptionsParameter].filter((p) => !!p)

        const optionsArguments = [queryArgument, dataArgument, additionalOptionsArgument].filter((arg) => !!arg)
        const optionsArgument = optionsArguments.length > 0 ? `, {${optionsArguments.join(', ')}}` : ''

        const apiTemplateParameters = [responseType]
        if (dataType) apiTemplateParameters.push(dataType)

        apiCalls.push(`
export ${paramsInterface}
export const ${mappedCallerName} = (${parameters.join(', ')}): Promise<${responseType}> => {
${paramsDestructure}return ${apiName}.${method}<${apiTemplateParameters.join(', ')}>(${url}${optionsArgument}).then(getData)
}
`)
      }
    })

    const currentFilePath = relative(process.cwd(), __filename).replace(/\\/g, '/')

    const generatedAlert = `\
/**
 * file is autogenerated by ${currentFilePath}, do not edit
 */
`

    const typesCode = `\
${generatedAlert}
/* eslint-disable camelcase, no-use-before-define, @typescript-eslint/no-unused-vars */

${[...interfaces.entries()].map(([name, { code, type }]) => {
      if (isObjectType(type)) return `export interface ${name} ${code}`
      return `export type ${name} = ${code}`
    }).join('\n\n')}`

    const [apiTypesFileName, apiCallsFileName] = ['apiTypes', 'apiCalls']
    const [apiTypesFilePath, apiCallsFilePath] = [apiTypesFileName, apiCallsFileName].map((name) => resolvePath(`./src/api/${name}.ts`))

    fs.writeFileSync(apiTypesFilePath, formatCode(typesCode))

    const apiCallsCode = `\
${generatedAlert}
import {CallerOptions, ResponseWithData} from '@/utils/createApi'

import {${[...apiNames.values()].join(', ')}} from './api'
import {${[...interfaces.entries()].filter(([_, { level }]) => level === 0).map(([name]) => name).join(', ')}} from './${apiTypesFileName}'

const getData = <T>(res: ResponseWithData<T>): T => res.data

${apiCalls.join('\n\n')}`

    fs.writeFileSync(apiCallsFilePath, formatCode(apiCallsCode))

    eslint.lintFiles([apiTypesFilePath, apiCallsFilePath]).then((eslintResults) => {
      ESLint.outputFixes(eslintResults)
    })
    Object.keys(apiCallsNameMapping).forEach((name) => {
      if (!usedCallsNames.has(name)) delete apiCallsNameMapping[name]
    })
    Object.keys(apiTypeNameMapping).forEach((name) => {
      if (!usedTypeNames.has(name)) delete apiTypeNameMapping[name]
    })
    return { apiCallsNameMapping, apiTypeNameMapping }
  }).catch((error: any) => {
    console.log(error)
    throw error
  })
}
