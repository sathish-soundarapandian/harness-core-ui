/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { omit, set } from 'lodash-es'
import { render, act } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { SaveCacheGCSStep } from '../SaveCacheGCSStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const fixedValues = {
  identifier: 'My_Save_Cache_GCS_Step',
  name: 'My Save Cache GCS Step',
  timeout: '10s',
  spec: {
    connectorRef: 'account.connectorRef',
    bucket: 'Bucket',
    key: 'Key',
    sourcePaths: ['some/path'],
    archiveFormat: 'Tar',
    override: true,
    resources: {
      limits: {
        memory: '128Mi',
        cpu: '0.2'
      }
    }
  }
}

const runtimeValues = {
  identifier: 'My_Save_Cache_GCS_Step',
  name: 'My Save Cache GCS Step',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    connectorRef: RUNTIME_INPUT_VALUE,
    bucket: RUNTIME_INPUT_VALUE,
    key: RUNTIME_INPUT_VALUE,
    sourcePaths: RUNTIME_INPUT_VALUE,
    archiveFormat: RUNTIME_INPUT_VALUE,
    override: RUNTIME_INPUT_VALUE,
    resources: {
      limits: {
        cpu: RUNTIME_INPUT_VALUE,
        memory: RUNTIME_INPUT_VALUE
      }
    }
  }
}

export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'connectorRef',
        identifier: 'connectorRef',
        description: '',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse)
}))

describe('Save Cache GCS Step', () => {
  beforeAll(() => {
    factory.registerStep(new SaveCacheGCSStep())
  })

  describe('Edit View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.SaveCacheGCS} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('renders runtime inputs', async () => {
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={runtimeValues}
          type={StepType.SaveCacheGCS}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()

      await act(() => ref.current?.submitForm()!)
      expect(onUpdate).toHaveBeenCalledWith(runtimeValues)
    })

    test('edit mode works', async () => {
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={fixedValues}
          type={StepType.SaveCacheGCS}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()

      await act(() => ref.current?.submitForm()!)
      expect(onUpdate).toHaveBeenCalledWith(fixedValues)
    })
  })
  describe('InputSet View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.SaveCacheGCS} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const allValues = set(runtimeValues, 'type', StepType.SaveCacheGCS)
      const template = omit(allValues, 'name')

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.SaveCacheGCS}
          template={template}
          allValues={allValues}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdate}
        />
      )

      expect(container).toMatchSnapshot()
    })

    test('should not render any fields', async () => {
      const template = {
        type: StepType.SaveCacheGCS,
        identifier: 'My_Save_Cache_GCS_Step'
      }

      const allValues = set(fixedValues, 'type', StepType.SaveCacheGCS)

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.SaveCacheGCS}
          template={template}
          allValues={allValues}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdate}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('InputVariable View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget
          initialValues={{
            identifier: 'Test_A',
            name: 'Test A',
            type: StepType.SaveCacheGCS,
            timeout: '10s',
            spec: {
              connectorRef: 'account.connectorRef',
              bucket: 'Bucket',
              key: 'Key',
              sourcePaths: ['some/path'],
              archiveFormat: 'Tar',
              override: true,
              resources: {
                limits: {
                  memory: '128Mi',
                  cpu: '0.2'
                }
              }
            }
          }}
          customStepProps={{
            stageIdentifier: 'qaStage',
            metadataMap: {
              'step-name': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.name',
                  localName: 'step.saveCacheGCS.name'
                }
              },
              'step-identifier': {
                yamlExtraProperties: {
                  properties: [
                    {
                      fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.identifier',
                      localName: 'step.saveCacheGCS.identifier',
                      variableName: 'identifier'
                    }
                  ]
                }
              },
              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.timeout',
                  localName: 'step.saveCacheGCS.timeout'
                }
              },
              'step-connectorRef': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.connectorRef',
                  localName: 'step.saveCacheGCS.spec.connectorRef'
                }
              },
              'step-bucket': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.bucket',
                  localName: 'step.saveCacheGCS.spec.bucket'
                }
              },
              'step-key': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.key',
                  localName: 'step.saveCacheGCS.spec.key'
                }
              },
              'step-sourcePaths': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.sourcePaths',
                  localName: 'step.saveCacheGCS.spec.sourcePaths'
                }
              },
              'step-archiveFormat': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.archiveFormat',
                  localName: 'step.saveCacheGCS.spec.archiveFormat'
                }
              },
              'step-override': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.override',
                  localName: 'step.saveCacheGCS.spec.override'
                }
              },
              // TODO: Right now we do not support Image Pull Policy but will do in the future
              // 'step-pull': {
              //   yamlProperties: {
              //     fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.pull',
              //     localName: 'step.saveCacheGCS.spec.pull'
              //   }
              // },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.resources.limits.memory',
                  localName: 'step.saveCacheGCS.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.saveCacheGCS.spec.resources.limits.cpu',
                  localName: 'step.saveCacheGCS.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.SaveCacheGCS,
              __uuid: 'step-identifier',
              identifier: 'saveCacheGCS',
              name: 'step-name',
              timeout: 'step-timeout',
              spec: {
                connectorRef: 'step-connectorRef',
                bucket: 'step-bucket',
                key: 'step-key',
                sourcePaths: 'step-sourcePaths',
                archiveFormat: 'step-archiveFormat',
                override: 'step-override',
                // TODO: Right now we do not support Image Pull Policy but will do in the future
                // pull: 'step-pull',
                resources: {
                  limits: {
                    memory: 'step-limitMemory',
                    cpu: 'step-limitCPU'
                  }
                }
              }
            }
          }}
          type={StepType.SaveCacheGCS}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })
})
