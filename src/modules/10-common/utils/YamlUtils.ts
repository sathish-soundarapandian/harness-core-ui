/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
<<<<<<< HEAD
import * as yamlLanguageService from '@harness/monaco-yaml/lib/esm/languageservice/yamlLanguageService'
=======
>>>>>>> 48fc1f4a1918 (chore: [PL-28682]: Monaco editor upgrade)
import { isEmpty } from 'lodash-es'
import { TextDocument, Diagnostic } from 'vscode-languageserver-types'
import { parse } from 'yaml'
import { yamlStringify } from '@common/utils/YamlHelperMethods'

const DEFAULT_YAML_PATH = 'DEFAULT_YAML_PATH'

/**
 * @description Find json path(s) of a given node in json from it's nearest parent
 * @param jsonObj json equivalent of yaml
 * @param leafNode leaf node whose path(s) from the nearest parent needs to be known
 * @param delimiter delimiter to be used in node path(s) from parent
 * @returns exactly matching json path in the tree
 */
const findLeafToParentPath = (jsonObj: Record<string, any>, leafNode: string, delimiter = '.'): string | undefined => {
  // to remove all leading non-characters
  const leaf = leafNode.replace(/^[^a-zA-Z]+/, '')
  const matchingPath: string[] = []
  function findPath(currJSONObj: Record<string, any>, currentDepth: number, previous?: string): void {
    Object.keys(currJSONObj).forEach((key: string) => {
      const value = currJSONObj[key]
      const type = Object.prototype.toString.call(value)
      const isObject = type === '[object Object]' || type === '[object Array]'
      const newKey = previous ? previous + delimiter + key : key
      if (isObject && Object.keys(value).length) {
        if (key.match(leaf)) {
          matchingPath.push(newKey)
        }
        return findPath(value, currentDepth + 1, newKey)
      }
      if (newKey.match(leaf)) {
        matchingPath.push(newKey)
      }
    })
  }
  findPath(jsonObj, 1)
  return matchingPath.length > 0 ? matchingPath.slice(-1).pop() : 'DEFAULT_YAML_PATH'
}

/**
 * @description Validate yaml syntactically (syntax correctness)
 *
 * @param {yaml} yaml to validate
 * @returns Promise of list of syntax errors, if any
 *
 */
const validateYAML = (yaml: string): Promise<Diagnostic[]> => {
  /* istanbul ignore next */
  if (!yaml) {
    return Promise.reject('Invalid or empty yaml')
  }
  const textDocument = TextDocument.create('', 'yaml', 0, yaml)
  return yamlLanguageService.getLanguageService()?.doValidation(textDocument, false)
}

/**
 * @description Validate yaml semantically (adherence to a schema)
 *
 * @param {yaml} yamlString to validate
 * @param {schema} schema to validate yaml against
 * @returns Promise of list of semantic errors, if any
 *
 */

const validateYAMLWithSchema = (yamlString: string, schema: Record<string, any>): Promise<Diagnostic[]> => {
  if (!yamlString) {
    return Promise.reject('Invalid or empty yaml.')
  }
  if (isEmpty(schema)) {
    return Promise.reject('Invalid or empty schema.')
  }
  const textDocument = TextDocument.create('', 'yaml', 0, yamlString)
  const languageService = setUpLanguageService(schema)
  return languageService?.doValidation(textDocument, false)
}

const getPartialYAML = (tokens: string[], endingIndex: number): string => {
  if (isEmpty(tokens) || endingIndex + 1 > tokens.length) {
    return ''
  }
  return tokens.slice(0, endingIndex + 1).join('\n')
}

/**
 * @description Validate a JSON against a schema
 *
 * @param jsonObj json to be validated
 * @param schema schema against which json is to be validated
 * @returns Map of json path to list of errors at that path
 */
async function validateJSONWithSchema(
  jsonObj: Record<string, any>,
  schema: Record<string, any>
): Promise<Map<string, string[]>> {
  const errorMap = new Map<string, string[]>()

  if (isEmpty(jsonObj) || isEmpty(schema)) {
    return errorMap
  }

  try {
    const yamlEqOfJSON = yamlStringify(jsonObj)
    const lineContents = yamlEqOfJSON.split(/\r?\n/)
    const validationErrors = await validateYAMLWithSchema(yamlEqOfJSON, getSchemaWithLanguageSettings(schema))
    validationErrors.map(error => {
      const idx = error.range.end.line
      if (idx <= lineContents.length) {
        const key = lineContents[idx]?.split(':')?.[0]?.trim()
        const partialYAML = getPartialYAML(lineContents, idx)
        const partialJSONEqofYAML = parse(partialYAML)
        if (key && !isEmpty(partialJSONEqofYAML)) {
          const jsonPathOfKey = findLeafToParentPath(partialJSONEqofYAML, key)
          if (jsonPathOfKey) {
            if (errorMap.has(jsonPathOfKey)) {
              const existingErrors = errorMap.get(jsonPathOfKey) || []
              existingErrors.push(error.message)
              errorMap.set(jsonPathOfKey, existingErrors)
            } else {
              errorMap.set(jsonPathOfKey, [error.message])
            }
          }
        }
      }
    })

    return errorMap
  } catch (err) {
    return errorMap
  }
}

const setUpLanguageService = (schema: Record<string, any>) => {
  const languageService = yamlLanguageService.getLanguageService()
  languageService?.configure(schema)
  return languageService
}

const getSchemaWithLanguageSettings = (schema: Record<string, any>): Record<string, any> => {
  return {
    validate: true,
    enableSchemaRequest: true,
    hover: true,
    completion: true,
    schemas: [
      {
        fileMatch: ['*'],
        schema
      }
    ]
  }
}

export {
  validateYAML,
  validateYAMLWithSchema,
  validateJSONWithSchema,
  getSchemaWithLanguageSettings,
  DEFAULT_YAML_PATH,
  findLeafToParentPath
}
