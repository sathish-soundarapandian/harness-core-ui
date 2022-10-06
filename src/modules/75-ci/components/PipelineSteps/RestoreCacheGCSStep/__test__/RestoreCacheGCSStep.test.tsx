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
import { RestoreCacheGCSStep } from '../RestoreCacheGCSStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const fixedValues = {
  identifier: 'My_Restore_Cache_GCS_Step',
  name: 'My Restore Cache GCS Step',
  timeout: '10s',
  spec: {
    connectorRef: 'account.connectorRef',
    bucket: 'Bucket',
    key: 'Key',
    archiveFormat: 'Tar',
    failIfKeyNotFound: true,
    resources: {
      limits: {
        memory: '128Mi',
        cpu: '0.2'
      }
    }
  }
}

const runtimeValues = {
  identifier: 'My_Restore_Cache_GCS_Step',
  name: 'My Restore Cache GCS Step',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    connectorRef: RUNTIME_INPUT_VALUE,
    bucket: RUNTIME_INPUT_VALUE,
    key: RUNTIME_INPUT_VALUE,
    archiveFormat: RUNTIME_INPUT_VALUE,
    failIfKeyNotFound: RUNTIME_INPUT_VALUE,
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

describe('Restore Cache GCS Step', () => {
  beforeAll(() => {
    factory.registerStep(new RestoreCacheGCSStep())
  })

  describe('Edit View', () => {
    test('should render edit view as new step', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.RestoreCacheGCS} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('renders runtime inputs', async () => {
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={fixedValues}
          type={StepType.RestoreCacheGCS}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()

      await act(() => ref.current?.submitForm()!)
      expect(onUpdate).toHaveBeenCalledWith(fixedValues)
    })

    test('edit mode works', async () => {
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={fixedValues}
          type={StepType.RestoreCacheGCS}
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
        <TestStepWidget initialValues={{}} type={StepType.RestoreCacheGCS} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const allValues = set(runtimeValues, 'type', StepType.RestoreCacheGCS)
      const template = omit(allValues, 'name')

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.RestoreCacheGCS}
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
        type: StepType.RestoreCacheGCS,
        identifier: 'My_Restore_Cache_GCS_Step'
      }

      const allValues = set(fixedValues, 'type', StepType.RestoreCacheGCS)

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.RestoreCacheGCS}
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
            type: StepType.RestoreCacheGCS,
            timeout: '10s',
            spec: {
              connectorRef: 'account.connectorRef',
              bucket: 'Bucket',
              key: 'Key',
              archiveFormat: 'Tar',
              failIfKeyNotFound: true,
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
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.name',
                  localName: 'step.restoreCacheGCS.name'
                }
              },
              'step-identifier': {
                yamlExtraProperties: {
                  properties: [
                    {
                      fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.identifier',
                      localName: 'step.restoreCacheGCS.identifier',
                      variableName: 'identifier'
                    }
                  ]
                }
              },
              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.timeout',
                  localName: 'step.restoreCacheGCS.timeout'
                }
              },
              'step-connectorRef': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.connectorRef',
                  localName: 'step.restoreCacheGCS.spec.connectorRef'
                }
              },
              'step-bucket': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.bucket',
                  localName: 'step.restoreCacheGCS.spec.bucket'
                }
              },
              'step-key': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.key',
                  localName: 'step.restoreCacheGCS.spec.key'
                }
              },
              'step-archiveFormat': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.archiveFormat',
                  localName: 'step.restoreCacheGCS.spec.archiveFormat'
                }
              },
              'step-failIfKeyNotFound': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.failIfKeyNotFound',
                  localName: 'step.restoreCacheGCS.spec.failIfKeyNotFound'
                }
              },
              // TODO: Right now we do not support Image Pull Policy but will do in the future
              // 'step-pull': {
              //   yamlProperties: {
              //     fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.pull',
              //     localName: 'step.restoreCacheGCS.spec.pull'
              //   }
              // },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.resources.limits.memory',
                  localName: 'step.restoreCacheGCS.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheGCS.spec.resources.limits.cpu',
                  localName: 'step.restoreCacheGCS.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.RestoreCacheGCS,
              __uuid: 'step-identifier',
              identifier: 'restoreCacheGCS',
              name: 'step-name',
              timeout: 'step-timeout',
              spec: {
                connectorRef: 'step-connectorRef',
                bucket: 'step-bucket',
                key: 'step-key',
                archiveFormat: 'step-archiveFormat',
                failIfKeyNotFound: 'step-failIfKeyNotFound',
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
          type={StepType.RestoreCacheGCS}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })
})
