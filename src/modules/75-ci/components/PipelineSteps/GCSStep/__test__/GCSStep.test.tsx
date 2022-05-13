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
import { GCSStep } from '../GCSStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const runtimeValues = {
  identifier: 'My_GCS_Step',
  name: 'My GCS Step',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    connectorRef: RUNTIME_INPUT_VALUE,
    bucket: RUNTIME_INPUT_VALUE,
    sourcePath: RUNTIME_INPUT_VALUE,
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
  identifier: 'My_GCS_Step',
  name: 'My GCS Step',
  timeout: '10s',
  spec: {
    connectorRef: 'account.connectorRef',
    bucket: 'Bucket',
    sourcePath: 'Source Path',
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

describe('GCS Step', () => {
  beforeAll(() => {
    factory.registerStep(new GCSStep())
  })

  describe('Edit View', () => {
    test('should render edit view as new step', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.GCS} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('renders runtime inputs', async () => {
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={runtimeValues}
          type={StepType.GCS}
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
          type={StepType.GCS}
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
    describe('InputSet View', () => {
      test('should render properly', () => {
        const { container } = render(
          <TestStepWidget initialValues={{}} type={StepType.GCS} stepViewType={StepViewType.InputSet} />
        )

        expect(container).toMatchSnapshot()
      })

      test('should render all fields', async () => {
        const allValues = set(runtimeValues, 'type', StepType.GCS)
        const template = omit(allValues, 'name')

        const onUpdate = jest.fn()

        const { container } = render(
          <TestStepWidget
            initialValues={{}}
            type={StepType.GCS}
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
          type: StepType.GCS,
          identifier: 'My_S3_Step'
        }

        const allValues = set(fixedValues, 'type', StepType.GCS)

        const onUpdate = jest.fn()

        const { container } = render(
          <TestStepWidget
            initialValues={{}}
            type={StepType.GCS}
            template={template}
            allValues={allValues}
            stepViewType={StepViewType.InputSet}
            onUpdate={onUpdate}
          />
        )

        expect(container).toMatchSnapshot()
      })
    })
  })

  describe('InputVariable View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget
          initialValues={{
            identifier: 'Test_A',
            name: 'Test A',
            type: StepType.GCS,
            timeout: '10s',
            spec: {
              connectorRef: 'account.connectorRef',
              bucket: 'Bucket',
              sourcePath: 'Source Path',
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
                  fqn: 'pipeline.stages.qaStage.execution.steps.gcs.name',
                  localName: 'step.gcs.name'
                }
              },
              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gcs.timeout',
                  localName: 'step.gcs.timeout'
                }
              },
              'step-connectorRef': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gcs.spec.connectorRef',
                  localName: 'step.gcs.spec.connectorRef'
                }
              },
              'step-bucket': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gcs.spec.bucket',
                  localName: 'step.gcs.spec.bucket'
                }
              },
              'step-sourcePath': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gcs.spec.sourcePath',
                  localName: 'step.gcs.spec.sourcePath'
                }
              },
              'step-target': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gcs.spec.target',
                  localName: 'step.gcs.spec.target'
                }
              },
              // TODO: Right now we do not support Image Pull Policy but will do in the future
              // 'step-pull': {
              //   yamlProperties: {
              //     fqn: 'pipeline.stages.qaStage.execution.steps.gcs.spec.pull',
              //     localName: 'step.gcs.spec.pull'
              //   }
              // },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gcs.spec.resources.limits.memory',
                  localName: 'step.gcs.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.gcs.spec.resources.limits.cpu',
                  localName: 'step.gcs.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.GCS,
              identifier: 'gcs',
              name: 'step-name',
              timeout: 'step-timeout',
              spec: {
                connectorRef: 'step-connectorRef',
                bucket: 'step-bucket',
                sourcePath: 'step-sourcePath',
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
          type={StepType.GCS}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })
})
