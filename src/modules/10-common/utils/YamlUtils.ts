/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as yamlLanguageService from '@harness/monaco-yaml/lib/esm/languageservice/yamlLanguageService'
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

const payload = {
  pipeline: {
    name: 'test324',
    identifier: 'test324',
    projectIdentifier: 'CI_Sanity',
    orgIdentifier: 'default',
    tags: {},
    description: 'update',
    stages: [
      {
        stage: {
          name: 'stage1',
          identifier: 'stage1',
          type: 'CI',
          spec: {
            cloneCodebase: false,
            infrastructure: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: 'cidelplay',
                namespace: 'ci-prod-delegate',
                initTimeout: '30m',
                automountServiceAccountToken: true,
                nodeSelector: {},
                os: 'Linux'
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'Run',
                    name: 'run_step',
                    identifier: 'blah',
                    spec: {
                      connectorRef: 'account.harnessImage',
                      image: 'maven:3.8-jdk-11',
                      shell: 'Sh',
                      command:
                        'touch harnessDockerfile\necho "FROM bewithaman/minio:trial" >> Dockerfile\ncat Dockerfile\npwd'
                    },
                    timeout: '5m'
                  }
                },
                {
                  step: {
                    type: 'BuildAndPushDockerRegistry',
                    name: 'docker_step',
                    identifier: 'ewf',
                    spec: {
                      connectorRef: 'testaman',
                      repo: 'bewithaman/minio',
                      tags: ['local']
                    },
                    when: {
                      stageStatus: 'Failure'
                    },
                    failureStrategies: []
                  }
                }
              ]
            }
          }
        }
      },
      {
        stage: {
          name: 'stage2',
          identifier: 'stage2',
          type: 'CI',
          spec: {
            cloneCodebase: false,
            infrastructure: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: 'cidelplay',
                namespace: 'ci-prod-delegate',
                initTimeout: '30m',
                automountServiceAccountToken: true,
                nodeSelector: {},
                os: 'Linux'
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'Run',
                    name: 'run_step',
                    identifier: 'blah',
                    spec: {
                      connectorRef: 'account.harnessImage',
                      image: 'maven:3.8-jdk-11',
                      shell: 'Sh',
                      command:
                        'touch harnessDockerfile\necho "FROM bewithaman/minio:trial" >> Dockerfile\ncat Dockerfile\npwd'
                    },
                    timeout: '5m'
                  }
                },
                {
                  step: {
                    type: 'BuildAndPushDockerRegistry',
                    name: 'docker_step',
                    identifier: 'ewf',
                    spec: {
                      connectorRef: 'testaman',
                      repo: 'bewithaman/minio',
                      tags: ['local']
                    },
                    when: {
                      stageStatus: 'Failure'
                    },
                    failureStrategies: []
                  }
                }
              ]
            }
          },
          variables: [
            {
              name: 'PLUGIN_CONFIG',
              type: 'Secret',
              description: 'true',
              value: 'amandockerccfg'
            },
            {
              name: 'PLUGIN_USERNAME__',
              type: 'String',
              description: '',
              value: 'bewithaman'
            },
            {
              name: 'PLUGIN_PASSWORD__',
              type: 'String',
              description: '',
              value: 'aman.3291'
            }
          ]
        }
      }
    ]
  }
}

const findAllValuesAtJSONPath = (jsonPath: string): string | string[] => {
  const tokens: string[] = jsonPath.split('.')
  let value: string
  for (let i = 0; i < tokens.length; i++) {
    const currentToken = tokens[i]
    //'*' wildcard match could endup with multiple matches in the json
    if (currentToken === '*' && Array.isArray(value)) {
      const matchingValues: string[] = []
      for (let j = 0; j < value.length; j++) {
        matchingValues.push(findAllValuesAtJSONPath(`pipeline.stages.${j}.stage.spec.execution`) as string)
      }
      return matchingValues
    } else {
      if (i === 0) {
        value = payload[currentToken]
      } else {
        value = value[currentToken]
      }
      if (!value) {
        break
      }
    }
  }
  return value
}

export {
  validateYAML,
  validateYAMLWithSchema,
  validateJSONWithSchema,
  getSchemaWithLanguageSettings,
  DEFAULT_YAML_PATH,
  findLeafToParentPath,
  findAllValuesAtJSONPath
}
