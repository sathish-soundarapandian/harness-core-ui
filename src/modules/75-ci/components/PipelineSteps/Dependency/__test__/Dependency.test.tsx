/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { Dependency } from '../Dependency'

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

describe('Dependency', () => {
  beforeAll(() => {
    factory.registerStep(new Dependency())
  })

  describe('Edit view', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.Dependency} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('renders runtime inputs', async () => {
      const initialValues = {
        identifier: 'My_Dependency_Step',
        name: 'My Dependency Step',
        description: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          image: RUNTIME_INPUT_VALUE,
          privileged: RUNTIME_INPUT_VALUE,
          envVariables: RUNTIME_INPUT_VALUE,
          entrypoint: RUNTIME_INPUT_VALUE,
          args: RUNTIME_INPUT_VALUE,
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
          type={StepType.Dependency}
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
        identifier: 'My_Dependency_Step',
        name: 'My Dependency Step',
        description: 'Description',
        spec: {
          connectorRef: 'account.connectorRef',
          image: 'image',
          privileged: false,
          envVariables: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
          entrypoint: ['entrypoint1', 'entrypoint2', 'entrypoint3'],
          args: ['arg1', 'arg2', 'arg3'],
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
          type={StepType.Dependency}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()
      await act(() => ref.current?.submitForm()!)
      expect(onUpdate).toHaveBeenCalledWith(initialValues)
    })

    test('edit mode works when memory present but cpu is not', async () => {
      const initialValues = {
        identifier: 'My_Dependency_Step',
        name: 'My Dependency Step',
        description: 'Description',
        spec: {
          connectorRef: 'account.connectorRef',
          image: 'image',
          privileged: false,
          envVariables: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
          entrypoint: ['entrypoint1', 'entrypoint2', 'entrypoint3'],
          args: ['arg1', 'arg2', 'arg3'],
          // TODO: Right now we do not support Image Pull Policy but will do in the future
          // pull: 'always',
          resources: {
            limits: {
              memory: '128Mi'
            }
          }
        }
      }
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={initialValues}
          type={StepType.Dependency}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()
      await act(() => ref.current?.submitForm()!)
      expect(onUpdate).toHaveBeenCalledWith(initialValues)
    })

    test('edit mode fails when cpu present but memory is not', async () => {
      const initialValues = {
        identifier: 'My_Dependency_Step',
        name: 'My Dependency Step',
        description: 'Description',
        spec: {
          connectorRef: 'account.connectorRef',
          image: 'image',
          privileged: false,
          envVariables: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
          entrypoint: ['entrypoint1', 'entrypoint2', 'entrypoint3'],
          args: ['arg1', 'arg2', 'arg3'],
          // TODO: Right now we do not support Image Pull Policy but will do in the future
          // pull: 'always',
          resources: {
            limits: {
              memory: '',
              cpu: '0.1'
            }
          }
        }
      }
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={initialValues}
          type={StepType.Dependency}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()
      await act(() => ref.current?.submitForm()!)
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  describe('InputSet View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.Dependency} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const template = {
        type: StepType.Dependency,
        identifier: 'My_Dependency_Step',
        description: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          image: RUNTIME_INPUT_VALUE,
          privileged: RUNTIME_INPUT_VALUE,
          envVariables: RUNTIME_INPUT_VALUE,
          entrypoint: RUNTIME_INPUT_VALUE,
          args: RUNTIME_INPUT_VALUE,
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
        type: StepType.Dependency,
        name: 'Test A',
        identifier: 'My_Dependency_Step',
        description: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          image: RUNTIME_INPUT_VALUE,
          privileged: RUNTIME_INPUT_VALUE,
          envVariables: RUNTIME_INPUT_VALUE,
          entrypoint: RUNTIME_INPUT_VALUE,
          args: RUNTIME_INPUT_VALUE,
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
          type={StepType.Dependency}
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
        type: StepType.Dependency,
        identifier: 'My_Dependency_Step'
      }

      const allValues = {
        type: StepType.Dependency,
        identifier: 'My_Dependency_Step',
        name: 'My Dependency Step',
        description: 'Description',
        spec: {
          connectorRef: 'account.connectorRef',
          image: 'image',
          privileged: false,
          envVariables: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
          entrypoint: ['entrypoint1', 'entrypoint2', 'entrypoint3'],
          args: ['arg1', 'arg2', 'arg3'],
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
          type={StepType.Dependency}
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
            type: StepType.Dependency,
            description: 'Description',
            spec: {
              connectorRef: 'account.connectorRef',
              image: 'image',
              privileged: false,
              envVariables: {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3'
              },
              entrypoint: ['entrypoint1', 'entrypoint2', 'entrypoint3'],
              args: ['arg1', 'arg2', 'arg3'],
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
                  fqn: 'pipeline.stages.qaStage.execution.steps.dependency.name',
                  localName: 'step.dependency.name'
                }
              },
              'step-description': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dependency.description',
                  localName: 'step.dependency.description'
                }
              },
              'step-connectorRef': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.connectorRef',
                  localName: 'step.dependency.spec.connectorRef'
                }
              },
              'step-image': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.image',
                  localName: 'step.dependency.spec.image'
                }
              },
              'step-privileged': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.privileged',
                  localName: 'step.dependency.spec.privileged'
                }
              },
              'step-envVariables': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.envVariables',
                  localName: 'step.dependency.spec.envVariables'
                }
              },
              'step-entrypoint': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.entrypoint',
                  localName: 'step.dependency.spec.entrypoint'
                }
              },
              'step-args': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.args',
                  localName: 'step.dependency.spec.args'
                }
              },
              // TODO: Right now we do not support Image Pull Policy but will do in the future
              // 'step-pull': {
              //   yamlProperties: {
              //     fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.pull',
              //     localName: 'step.dependency.spec.pull'
              //   }
              // },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.resources.limits.memory',
                  localName: 'step.dependency.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.dependency.spec.resources.limits.cpu',
                  localName: 'step.dependency.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.Dependency,
              identifier: 'dependency',
              name: 'step-name',
              description: 'step-description',
              spec: {
                connectorRef: 'step-connectorRef',
                image: 'step-image',
                privileged: 'step-privileged',
                envVariables: 'step-envVariables',
                entrypoint: 'step-entrypoint',
                args: 'step-args',
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
          type={StepType.Dependency}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })
})
