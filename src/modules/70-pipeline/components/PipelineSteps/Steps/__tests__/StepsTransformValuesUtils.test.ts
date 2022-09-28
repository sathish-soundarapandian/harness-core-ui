/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  removeEmptyKeys,
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat,
  Types
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'id'),
  v5: jest.fn(() => 'id')
}))

const fields = [
  {
    name: 'identifier',
    type: Types.Text
  },
  {
    name: 'name',
    type: Types.Text
  },
  {
    name: 'description',
    type: Types.Text
  },
  {
    name: 'timeout',
    type: Types.Text
  },
  {
    name: 'spec.connectorRef',
    type: Types.ConnectorRef
  },
  {
    name: 'spec.image',
    type: Types.Text
  },
  {
    name: 'spec.command',
    type: Types.Text
  },
  {
    name: 'spec.paths',
    type: Types.List
  },
  {
    name: 'spec.envVariables',
    type: Types.Map
  },
  {
    name: 'spec.outputVariables',
    type: Types.OutputVariables
  },
  {
    name: 'spec.pull',
    type: Types.Pull
  },
  {
    name: 'spec.limitMemory',
    type: Types.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: Types.LimitCPU
  }
]

const pullOptions = [
  { label: 'option1', value: 'value1' },
  { label: 'option2', value: 'value2' },
  { label: 'option3', value: 'value3' }
]

const formValues = {
  identifier: 'identifier',
  name: 'name',
  description: 'description',
  timeout: '10s',
  spec: {
    connectorRef: 'connectorRef',
    image: 'image',
    command: 'command',
    paths: ['value1', 'value2'],
    envVariables: {
      envVariable1: 'value1',
      envVariable2: 'value2'
    },
    outputVariables: [
      {
        name: 'value1'
      },
      {
        name: 'value2'
      }
    ],
    pull: 'value2',
    resources: {
      limits: {
        memory: '128Mi',
        cpu: 1
      }
    }
  },
  strategy: {
    matrix: {
      browser: ['chrome', 'safari'],
      os: ['macos', 'windows', 'linux']
    },
    maxConcurrency: 2
  }
}

const initialValues = {
  identifier: 'identifier',
  name: 'name',
  description: 'description',
  timeout: '10s',
  spec: {
    connectorRef: 'connectorRef',
    image: 'image',
    command: 'command',
    paths: [
      {
        id: 'id',
        value: 'value1'
      },
      {
        id: 'id',
        value: 'value2'
      }
    ],
    envVariables: [
      {
        id: 'id',
        key: 'envVariable1',
        value: 'value1'
      },
      {
        id: 'id',
        key: 'envVariable2',
        value: 'value2'
      }
    ],
    outputVariables: [
      {
        id: 'id',
        value: 'value1'
      },
      {
        id: 'id',
        value: 'value2'
      }
    ],
    pull: pullOptions[1],
    limitMemory: '128Mi',
    limitCPU: 1
  },
  strategy: {
    matrix: {
      browser: ['chrome', 'safari'],
      os: ['macos', 'windows', 'linux']
    },
    maxConcurrency: 2
  }
}

describe('StepsTransformValuesUtils', () => {
  describe('removeEmptyKeys', () => {
    test('should return expected value', () => {
      const result = removeEmptyKeys({
        identifier: 'identifier',
        name: '',
        timeout: '10s',
        spec: {
          connectorRef: '',
          image: undefined,
          command: null,
          envVariables: {},
          outputVariables: [],
          resources: {
            limits: {
              cpu: 1
            }
          }
        }
      })

      expect(result).toEqual({
        identifier: 'identifier',
        timeout: '10s',
        spec: {
          resources: {
            limits: {
              cpu: 1
            }
          }
        }
      })
    })
  })

  describe('getInitialValuesInCorrectFormat', () => {
    test('should return expected value', () => {
      const result = getInitialValuesInCorrectFormat(formValues, fields, { pullOptions })
      expect(result).toEqual(initialValues)
    })
  })

  describe('getFormValuesInCorrectFormat', () => {
    test('should return expected value', () => {
      const result = getFormValuesInCorrectFormat(initialValues, fields)
      expect(result).toEqual(formValues)
    })
  })
})
