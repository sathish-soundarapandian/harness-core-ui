/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { DockerHubStep } from '../DockerHubStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

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

describe('DockerHub Step', () => {
  beforeAll(() => {
    factory.registerStep(new DockerHubStep())
  })

  describe('Edit View', () => {
    test('should render properly', () => {
      const { container, getByText } = render(
        <TestStepWidget initialValues={{}} type={StepType.DockerHub} stepViewType={StepViewType.Edit} />
      )
      act(() => {
        fireEvent.click(getByText('common.optionalConfig'))
      })
      expect(getByText('ci.remoteCacheRepository.label')).toBeTruthy()
      expect(container).toMatchSnapshot()
    })

    test('renders runtime inputs', async () => {
      const initialValues = {
        identifier: 'My_DockerHub_Step',
        name: 'My DockerHub Step',
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          repo: RUNTIME_INPUT_VALUE,
          tags: RUNTIME_INPUT_VALUE,
          dockerfile: RUNTIME_INPUT_VALUE,
          context: RUNTIME_INPUT_VALUE,
          labels: RUNTIME_INPUT_VALUE,
          buildArgs: RUNTIME_INPUT_VALUE,
          optimize: RUNTIME_INPUT_VALUE,
          target: RUNTIME_INPUT_VALUE,
          remoteCacheRepo: RUNTIME_INPUT_VALUE,
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
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={initialValues}
          type={StepType.DockerHub}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()

      await act(() => ref.current?.submitForm()!)
      expect(onUpdate).toHaveBeenCalledWith(initialValues)
    })

    test('edit mode works', async () => {
      const initialValues = {
        identifier: 'My_DockerHub_Step',
        name: 'My DockerHub Step',
        timeout: '10s',
        spec: {
          connectorRef: 'account.connectorRef',
          repo: 'Repository',
          tags: ['tag1', 'tag2', 'tag3'],
          dockerfile: 'Dockerfile',
          context: 'Context',
          labels: {
            label1: 'value1',
            label2: 'value2',
            label3: 'value3'
          },
          buildArgs: {
            buildArg1: 'value1',
            buildArg2: 'value2',
            buildArg3: 'value3'
          },
          optimize: true,
          target: 'Target',
          remoteCacheRepo: 'myImage-cache',
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
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={initialValues}
          type={StepType.DockerHub}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()
      await act(() => ref.current?.submitForm()!)
      expect(onUpdate).toHaveBeenCalledWith(initialValues)
    })
  })

  describe('InputSet View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.DockerHub} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const template = {
        type: StepType.DockerHub,
        identifier: 'My_DockerHub_Step',
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          repo: RUNTIME_INPUT_VALUE,
          tags: RUNTIME_INPUT_VALUE,
          dockerfile: RUNTIME_INPUT_VALUE,
          context: RUNTIME_INPUT_VALUE,
          labels: RUNTIME_INPUT_VALUE,
          buildArgs: RUNTIME_INPUT_VALUE,
          optimize: RUNTIME_INPUT_VALUE,
          target: RUNTIME_INPUT_VALUE,
          remoteCacheRepo: RUNTIME_INPUT_VALUE,
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

      const allValues = {
        type: StepType.DockerHub,
        name: 'Test A',
        identifier: 'My_DockerHub_Step',
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          repo: RUNTIME_INPUT_VALUE,
          tags: RUNTIME_INPUT_VALUE,
          dockerfile: RUNTIME_INPUT_VALUE,
          context: RUNTIME_INPUT_VALUE,
          labels: RUNTIME_INPUT_VALUE,
          buildArgs: RUNTIME_INPUT_VALUE,
          optimize: RUNTIME_INPUT_VALUE,
          target: RUNTIME_INPUT_VALUE,
          remoteCacheRepo: RUNTIME_INPUT_VALUE,
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

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.DockerHub}
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
        type: StepType.DockerHub,
        identifier: 'My_DockerHub_Step'
      }

      const allValues = {
        type: StepType.DockerHub,
        identifier: 'My_DockerHub_Step',
        name: 'My DockerHub Step',
        timeout: '10s',
        spec: {
          connectorRef: 'account.connectorRef',
          repo: 'Repository',
          tags: ['tag1', 'tag2', 'tag3'],
          dockerfile: 'Dockerfile',
          context: 'Context',
          labels: {
            label1: 'value1',
            label2: 'value2',
            label3: 'value3'
          },
          buildArgs: {
            buildArg1: 'value1',
            buildArg2: 'value2',
            buildArg3: 'value3'
          },
          optimize: true,
          target: 'Target',
          remoteCacheRepo: 'myImage-cache',
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

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.DockerHub}
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
            type: StepType.DockerHub,
            timeout: '10s',
            spec: {
              connectorRef: 'account.connectorRef',
              repo: 'Repository',
              tags: ['tag1', 'tag2', 'tag3'],
              dockerfile: 'Dockerfile',
              context: 'Context',
              labels: {
                label1: 'value1',
                label2: 'value2',
                label3: 'value3'
              },
              buildArgs: {
                buildArg1: 'value1',
                buildArg2: 'value2',
                buildArg3: 'value3'
              },
              optimize: true,
              target: 'Target',
              remoteCacheRepo: 'myImage-cache',
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
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.name',
                  localName: 'step.dockerHub.name'
                }
              },
              'step-identifier': {
                yamlExtraProperties: {
                  properties: [
                    {
                      fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.identifier',
                      localName: 'step.dockerHub.identifier',
                      variableName: 'identifier'
                    }
                  ]
                }
              },
              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.timeout',
                  localName: 'step.dockerHub.timeout'
                }
              },
              'step-connectorRef': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.connectorRef',
                  localName: 'step.dockerHub.spec.connectorRef'
                }
              },
              'step-repo': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.repo',
                  localName: 'step.dockerHub.spec.repo'
                }
              },
              'step-tags': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.tags',
                  localName: 'step.dockerHub.spec.tags'
                }
              },
              'step-dockerfile': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.dockerfile',
                  localName: 'step.dockerHub.spec.dockerfile'
                }
              },
              'step-context': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.context',
                  localName: 'step.dockerHub.spec.context'
                }
              },
              'step-labels': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.labels',
                  localName: 'step.dockerHub.spec.labels'
                }
              },
              'step-buildArgs': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.buildArgs',
                  localName: 'step.dockerHub.spec.buildArgs'
                }
              },
              'step-optimize': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.optimize',
                  localName: 'step.dockerHub.spec.optimize'
                }
              },
              'step-target': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.target',
                  localName: 'step.dockerHub.spec.target'
                }
              },
              'step-remoteCacheRepo': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.remoteCacheRepo',
                  localName: 'step.dockerHub.spec.remoteCacheRepo'
                }
              },
              // TODO: Right now we do not support Image Pull Policy but will do in the future
              // 'step-pull': {
              //   yamlProperties: {
              //     fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.pull',
              //     localName: 'step.dockerHub.spec.pull'
              //   }
              // },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.resources.limits.memory',
                  localName: 'step.dockerHub.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dockerHub.spec.resources.limits.cpu',
                  localName: 'step.dockerHub.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.DockerHub,
              __uuid: 'step-identifier',
              identifier: 'dockerHub',
              name: 'step-name',
              timeout: 'step-timeout',
              spec: {
                connectorRef: 'step-connectorRef',
                repo: 'step-repo',
                tags: 'step-tags',
                dockerfile: 'step-dockerfile',
                context: 'step-context',
                labels: 'step-labels',
                buildArgs: 'step-buildArgs',
                optimize: 'step-optimize',
                target: 'step-target',
                remoteCacheRepo: 'step-remoteCacheRepo',
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
          type={StepType.DockerHub}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })
})
