import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

import dotenvFlow from 'dotenv-flow'
import yaml from 'yaml'

import { generateApi } from './generateApi'

const apiCallsNameMappingPath = resolve(__dirname, 'apiCallsNameMapping.yaml')
const apiTypeNameMappingPath = resolve(__dirname, 'apiTypeNameMapping.yaml')

const apiCallsNameMapping = yaml.parse(readFileSync(apiCallsNameMappingPath, 'utf8').toString()) ?? {}
const apiTypeNameMapping = yaml.parse(readFileSync(apiTypeNameMappingPath, 'utf8').toString()) ?? {}

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
dotenvFlow.config()

if (!process.env.API_DESCRIPTION_URL) {
  console.error('API_DESCRIPTION_URL is not provided')
  process.exit(1)
}

const sortObjectKeys = (obj: Record<string, unknown>): Record<string, unknown> => {
  const sortedObj: Record<string, unknown> = {}
  Object.keys(obj).sort().forEach((key) => {
    sortedObj[key] = obj[key]
  })
  return sortedObj
}

generateApi(process.env.API_DESCRIPTION_URL, { apiCallsNameMapping, apiTypeNameMapping, onlyUsedPaths: false })
  .then(({ apiCallsNameMapping: apiCallsNameMappingFull, apiTypeNameMapping: apiTypeNameMappingFull }) => {
    if (Object.keys(apiCallsNameMappingFull).length > 0) {
      writeFileSync(apiCallsNameMappingPath, yaml.stringify(sortObjectKeys(apiCallsNameMappingFull)), 'utf8')
    }
    if (Object.keys(apiTypeNameMappingFull).length > 0) {
      writeFileSync(apiTypeNameMappingPath, yaml.stringify(sortObjectKeys(apiTypeNameMappingFull)), 'utf8')
    }
  })
