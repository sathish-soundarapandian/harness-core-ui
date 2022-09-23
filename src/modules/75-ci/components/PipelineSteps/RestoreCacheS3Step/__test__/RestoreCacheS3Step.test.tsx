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
import { RestoreCacheS3Step } from '../RestoreCacheS3Step'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const fixedValues = {
  identifier: 'My_Restore_Cache_S3_Step',
  name: 'My Restore Cache S3 Step',
  timeout: '10s',
  spec: {
    connectorRef: 'account.connectorRef',
    bucket: 'Bucket',
    region: 'us-east-1',
    key: 'Key',
    endpoint: 'Endpoint',
    archiveFormat: 'Tar',
    pathStyle: true,
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
  identifier: 'My_Restore_Cache_S3_Step',
  name: 'My Restore Cache S3 Step',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    connectorRef: RUNTIME_INPUT_VALUE,
    region: RUNTIME_INPUT_VALUE,
    bucket: RUNTIME_INPUT_VALUE,
    endpoint: RUNTIME_INPUT_VALUE,
    key: RUNTIME_INPUT_VALUE,
    archiveFormat: RUNTIME_INPUT_VALUE,
    pathStyle: RUNTIME_INPUT_VALUE,
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

describe('Restore Cache S3 Step', () => {
  beforeAll(() => {
    factory.registerStep(new RestoreCacheS3Step())
  })

  describe('Edit View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.RestoreCacheS3} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('renders runtime inputs', async () => {
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={runtimeValues}
          type={StepType.RestoreCacheS3}
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
          type={StepType.RestoreCacheS3}
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
        <TestStepWidget initialValues={{}} type={StepType.RestoreCacheS3} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const allValues = set(runtimeValues, 'type', StepType.RestoreCacheS3)
      const template = omit(allValues, 'name')

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.RestoreCacheS3}
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
        type: StepType.RestoreCacheS3,
        identifier: 'My_Restore_Cache_S3_Step'
      }

      const allValues = set(fixedValues, 'type', StepType.RestoreCacheS3)

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.RestoreCacheS3}
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
            type: StepType.RestoreCacheS3,
            timeout: '10s',
            spec: {
              connectorRef: 'account.connectorRef',
              bucket: 'Bucket',
              region: 'us-east-1',
              key: 'Key',
              endpoint: 'Endpoint',
              archiveFormat: 'Tar',
              pathStyle: true,
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
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.name',
                  localName: 'step.restoreCacheS3.name'
                }
              },
              'step-identifier': {
                yamlExtraProperties: {
                  properties: [
                    {
                      fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.identifier',
                      localName: 'step.restoreCacheS3.identifier',
                      variableName: 'identifier'
                    }
                  ]
                }
              },
              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.timeout',
                  localName: 'step.restoreCacheS3.timeout'
                }
              },
              'step-connectorRef': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.spec.connectorRef',
                  localName: 'step.restoreCacheS3.spec.connectorRef'
                }
              },
              'step-bucket': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.spec.bucket',
                  localName: 'step.restoreCacheS3.spec.bucket'
                }
              },
              'step-region': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.spec.region',
                  localName: 'step.restoreCacheS3.spec.region'
                }
              },
              'step-key': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.spec.key',
                  localName: 'step.restoreCacheS3.spec.key'
                }
              },
              'step-endpoint': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.spec.endpoint',
                  localName: 'step.restoreCacheS3.spec.endpoint'
                }
              },
              'step-archiveFormat': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.spec.archiveFormat',
                  localName: 'step.restoreCacheS3.spec.archiveFormat'
                }
              },
              'step-pathStyle': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.spec.pathStyle',
                  localName: 'step.restoreCacheS3.spec.pathStyle'
                }
              },
              'step-failIfKeyNotFound': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.spec.failIfKeyNotFound',
                  localName: 'step.restoreCacheS3.spec.failIfKeyNotFound'
                }
              },
              // TODO: Right now we do not support Image Pull Policy but will do in the future
              // 'step-pull': {
              //   yamlProperties: {
              //     fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.spec.pull',
              //     localName: 'step.restoreCacheS3.spec.pull'
              //   }
              // },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.spec.resources.limits.memory',
                  localName: 'step.restoreCacheS3.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.restoreCacheS3.spec.resources.limits.cpu',
                  localName: 'step.restoreCacheS3.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.RestoreCacheS3,
              __uuid: 'step-identifier',
              identifier: 'restoreCacheS3',
              name: 'step-name',
              timeout: 'step-timeout',
              spec: {
                connectorRef: 'step-connectorRef',
                bucket: 'step-bucket',
                region: 'step-region',
                key: 'step-key',
                endpoint: 'step-endpoint',
                archiveFormat: 'step-archiveFormat',
                pathStyle: 'step-pathStyle',
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
          type={StepType.RestoreCacheS3}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })
})
