/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { set } from 'lodash-es'
import { parse } from 'yaml'

import { yamlStringify } from '@common/utils/YamlHelperMethods'

import environmentsYaml from './environments.yaml'

function flattenUtil(data: any): any {
  const finalObject = {}

  data.values.forEach((item: any, index: number) => {
    set(finalObject, `environments.${index}`, item.environmentRef)
    set(finalObject, `environmentInputs.${item.environmentRef}`, item.environmentInputs)
    set(finalObject, `serviceOverrideInputs.${item.environmentRef}`, item.serviceOverrideInputs)
    if (Array.isArray(item.infrastructureDefinitions)) {
      item.infrastructureDefinitions.forEach((secondItem: any, secondIndex: number) => {
        set(
          finalObject,
          `infrastructureDefinitions.${item.environmentRef}.infrastructures.${secondIndex}`,
          secondItem.identifier
        )
        set(
          finalObject,
          `infrastructureDefinitions.${item.environmentRef}.inputs.${secondItem.identifier}`,
          secondItem.inputs
        )
      })
    }
  })

  return {
    parallelEnvs: data.metadata.parallel,
    ...finalObject
  }
}

function extractUtil(data: any): any {
  const finalObject = {}

  set(finalObject, 'metadata.parallel', data.parallelEnvs)

  data.environments.forEach((environment: any, index: number) => {
    set(finalObject, `values.${index}.environmentRef`, environment)
    set(finalObject, `values.${index}.environmentInputs`, data.environmentInputs[environment])
    set(finalObject, `values.${index}.serviceOverrideInputs`, data.serviceOverrideInputs[environment])
    if (data.infrastructureDefinitions[environment]) {
      set(finalObject, `values.${index}.deployToAll`, false)

      data.infrastructureDefinitions[environment].infrastructures.forEach(
        (infrastructure: any, secondIndex: number) => {
          set(finalObject, `values.${index}.infrastructureDefinitions.${secondIndex}.identifier`, infrastructure)
          set(
            finalObject,
            `values.${index}.infrastructureDefinitions.${secondIndex}.inputs`,
            data.infrastructureDefinitions[environment].inputs[infrastructure]
          )
        }
      )
    } else {
      set(finalObject, `values.${index}.deployToAll`, true)
    }
  })

  return finalObject
}

describe('environments transformation util', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('environments is flattened correctly', () => {
    expect(flattenUtil(parse(yamlStringify(environmentsYaml)).environments)).toEqual({
      parallelEnvs: true,
      environments: ['Env_1', 'Env_2'],
      environmentInputs: {
        Env_1: {
          variables: [
            {
              name: 'var1',
              type: 'String',
              value: 'test1'
            }
          ]
        },
        Env_2: {
          variables: [
            {
              name: 'var3',
              type: 'String',
              value: 'test3'
            }
          ]
        }
      },
      serviceOverrideInputs: {
        Env_1: {
          variables: [
            {
              name: 'var2',
              type: 'String',
              value: 'test2'
            }
          ]
        },
        Env_2: {
          variables: [
            {
              name: 'var4',
              type: 'String',
              value: 'test4'
            }
          ]
        }
      },
      infrastructureDefinitions: {
        Env_2: {
          infrastructures: ['Infra_1'],
          inputs: {
            Infra_1: {
              connectorRef: 'connector_1',
              namespace: 'default',
              releaseName: '<+input>'
            }
          }
        }
      }
    })
  })

  test('environments is extracted correctly', () => {
    expect(extractUtil(flattenUtil(parse(yamlStringify(environmentsYaml)).environments))).toEqual(
      parse(yamlStringify(environmentsYaml)).environments
    )
  })
})
