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
import { S3Step } from '../S3Step'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const runtimeValues = {
  identifier: 'My_S3_Step',
  name: 'My S3 Step',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    connectorRef: RUNTIME_INPUT_VALUE,
    region: RUNTIME_INPUT_VALUE,
    bucket: RUNTIME_INPUT_VALUE,
    sourcePath: RUNTIME_INPUT_VALUE,
    endpoint: RUNTIME_INPUT_VALUE,
    target: RUNTIME_INPUT_VALUE,
    // TODO: Right now we do not support Image Pull Policy but will do in the future
    // pull: RUNTIME_INPUT_VALUE,
    resources: {
      limits: {
        cpu: RUNTIME_INPUT_VALUE,
        memory: RUNTIME_INPUT_VALUE
      }
    }
  }
}
const fixedValues = {
  identifier: 'My_S3_Step',
  name: 'My S3 Step',
  timeout: '10s',
  spec: {
    connectorRef: 'account.connectorRef',
    region: 'Region',
    bucket: 'Bucket',
    sourcePath: 'Source Path',
    endpoint: 'Endpoint',
    target: 'Target',
    // TODO: Right now we do not support Image Pull Policy but will do in the future
    // pull: 'always',
    resources: {
      limits: {
        memory: '128Mi',
        cpu: '0.2'
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

describe('S3 Step', () => {
  beforeAll(() => {
    factory.registerStep(new S3Step())
  })
  describe('Edit View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.S3} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('renders runtime inputs', async () => {
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={runtimeValues}
          type={StepType.S3}
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
          type={StepType.S3}
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
        <TestStepWidget initialValues={{}} type={StepType.S3} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const allValues = set(runtimeValues, 'type', StepType.S3)
      const template = omit(allValues, 'name')

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.S3}
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
        type: StepType.S3,
        identifier: 'My_S3_Step'
      }

      const allValues = set(fixedValues, 'type', StepType.S3)

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.S3}
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
            type: StepType.S3,
            timeout: '10s',
            spec: {
              connectorRef: 'account.connectorRef',
              region: 'Region',
              bucket: 'Bucket',
              sourcePath: 'Source Path',
              endpoint: 'Endpoint',
              target: 'Target',
              // TODO: Right now we do not support Image Pull Policy but will do in the future
              // pull: 'always',
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
                  fqn: 'pipeline.stages.qaStage.execution.steps.s3.name',
                  localName: 'step.s3.name'
                }
              },
              'step-identifier': {
                yamlExtraProperties: {
                  properties: [
                    {
                      fqn: 'pipeline.stages.qaStage.execution.steps.s3.identifier',
                      localName: 'step.s3.identifier',
                      variableName: 'identifier'
                    }
                  ]
                }
              },
              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.s3.timeout',
                  localName: 'step.s3.timeout'
                }
              },
              'step-connectorRef': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.connectorRef',
                  localName: 'step.s3.spec.connectorRef'
                }
              },
              'step-region': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.region',
                  localName: 'step.s3.spec.region'
                }
              },
              'step-bucket': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.bucket',
                  localName: 'step.s3.spec.bucket'
                }
              },
              'step-sourcePath': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.sourcePath',
                  localName: 'step.s3.spec.sourcePath'
                }
              },
              'step-endpoint': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.endpoint',
                  localName: 'step.s3.spec.endpoint'
                }
              },
              'step-target': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.target',
                  localName: 'step.s3.spec.target'
                }
              },
              // TODO: Right now we do not support Image Pull Policy but will do in the future
              // 'step-pull': {
              //   yamlProperties: {
              //     fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.pull',
              //     localName: 'step.s3.spec.pull'
              //   }
              // },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.resources.limits.memory',
                  localName: 'step.s3.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.s3.spec.resources.limits.cpu',
                  localName: 'step.s3.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.S3,
              __uuid: 'step-identifier',
              identifier: 's3',
              name: 'step-name',
              timeout: 'step-timeout',
              spec: {
                connectorRef: 'step-connectorRef',
                region: 'step-region',
                bucket: 'step-bucket',
                sourcePath: 'step-sourcePath',
                endpoint: 'step-endpoint',
                target: 'step-target',
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
          type={StepType.S3}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })
})
