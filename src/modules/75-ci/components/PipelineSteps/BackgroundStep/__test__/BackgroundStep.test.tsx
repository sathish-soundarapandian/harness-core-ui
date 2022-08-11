/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { findPopoverContainer, UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { BackgroundStep } from '../BackgroundStep'

jest.mock('@common/components/MonacoEditor/MonacoEditor')
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

describe('Background Step', () => {
  beforeAll(() => {
    factory.registerStep(new BackgroundStep())
  })

  describe('Edit View', () => {
    test('should render properly', async () => {
      const { container, getByText } = render(
        <TestStepWidget initialValues={{}} type={StepType.Background} stepViewType={StepViewType.Edit} />
      )
      expect(container).toMatchSnapshot()

      expect(getByText('pipelineSteps.connectorLabel')).toBeTruthy()
      expect(getByText('imageLabel')).toBeTruthy()
      act(() => {
        fireEvent.click(getByText('pipeline.additionalConfiguration'))
      })
      expect(getByText('pipelineSteps.limitCPULabel')).toBeTruthy()
      expect(getByText('pipelineSteps.limitCPULabel')).toBeTruthy()
      expect(getByText('pipeline.buildInfra.privileged (Common Optional Label)')).toBeTruthy()
      expect(getByText('common.shell')).toBeTruthy()
      const shellOptionsDropdownSelect = container.querySelector('[data-id="spec.shell-4"] [icon="chevron-down"]')!
      expect(shellOptionsDropdownSelect).toBeTruthy()
      await waitFor(() => {
        fireEvent.click(shellOptionsDropdownSelect)
        const menuItemLabels = findPopoverContainer()?.querySelectorAll('[class*="menuItemLabel"]')
        expect(menuItemLabels?.length).toEqual(4)
        expect(menuItemLabels?.[0].innerHTML).toEqual('common.bash')
        expect(menuItemLabels?.[3].innerHTML).toEqual('common.sh')
      })
    })

    test('renders runtime inputs', async () => {
      const initialValues = {
        identifier: 'My_Background_Step',
        name: 'My Background Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          image: RUNTIME_INPUT_VALUE,
          command: RUNTIME_INPUT_VALUE,
          privileged: RUNTIME_INPUT_VALUE,
          reports: {
            type: 'JUnit',
            spec: {
              paths: RUNTIME_INPUT_VALUE
            }
          },
          envVariables: RUNTIME_INPUT_VALUE,
          entrypoint: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          },
          shell: 'Sh'
        }
      }

      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={initialValues}
          type={StepType.Background}
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
        identifier: 'My_Background_Step',
        name: 'My Background Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          connectorRef: 'account.connectorRef',
          image: 'image',
          shell: 'Bash',
          command: 'command',
          privileged: false,
          reports: {
            type: 'JUnit',
            spec: {
              paths: ['path1.xml', 'path2.xml', 'path3.xml', 'path4.xml', 'path5.xml']
            }
          },
          envVariables: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
          entrypoint: ['entrypoint1', 'entrypoint2', 'entrypoint3'],
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
          type={StepType.Background}
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
        <TestStepWidget initialValues={{}} type={StepType.Background} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const template = {
        type: StepType.Background,
        identifier: 'My_Background_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          image: RUNTIME_INPUT_VALUE,
          command: RUNTIME_INPUT_VALUE,
          privileged: RUNTIME_INPUT_VALUE,
          reports: {
            spec: {
              paths: RUNTIME_INPUT_VALUE
            }
          },
          envVariables: RUNTIME_INPUT_VALUE,
          entrypoint: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          }
        }
      }

      const allValues = {
        type: StepType.Background,
        name: 'Test A',
        identifier: 'My_Background_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          image: RUNTIME_INPUT_VALUE,
          command: RUNTIME_INPUT_VALUE,
          privileged: RUNTIME_INPUT_VALUE,
          reports: {
            spec: {
              paths: RUNTIME_INPUT_VALUE
            }
          },
          envVariables: RUNTIME_INPUT_VALUE,
          entrypoint: RUNTIME_INPUT_VALUE,
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
          type={StepType.Background}
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
        type: StepType.Background,
        identifier: 'My_Background_Step'
      }

      const allValues = {
        type: StepType.Background,
        identifier: 'My_Background_Step',
        name: 'My Background Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          connectorRef: 'account.connectorRef',
          image: 'image',
          command: 'command',
          privileged: false,
          reports: {
            type: 'JUnit',
            spec: {
              paths: ['path1.xml', 'path2.xml', 'path3.xml', 'path4.xml', 'path5.xml']
            }
          },
          envVariables: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
          entrypoint: ['entrypoint1', 'entrypoint2', 'entrypoint3'],
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
          type={StepType.Background}
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
            identifier: 'My_Background_Step',
            name: 'My Background Step',
            description: 'Description',
            timeout: '10s',
            spec: {
              connectorRef: 'account.connectorRef',
              image: 'image',
              command: 'command',
              privileged: false,
              reports: {
                type: 'JUnit',
                spec: {
                  paths: ['path1.xml', 'path2.xml', 'path3.xml', 'path4.xml', 'path5.xml']
                }
              },
              envVariables: {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3'
              },
              entrypoint: ['entrypoint1', 'entrypoint2', 'entrypoint3'],
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
                  fqn: 'pipeline.stages.qaStage.execution.steps.background.name',
                  localName: 'step.background.name'
                }
              },
              'step-description': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.background.description',
                  localName: 'step.background.description'
                }
              },
              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.background.timeout',
                  localName: 'step.background.timeout'
                }
              },
              'step-connectorRef': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.background.spec.connectorRef',
                  localName: 'step.background.spec.connectorRef'
                }
              },
              'step-image': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.background.spec.image',
                  localName: 'step.background.spec.image'
                }
              },
              'step-command': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.background.spec.command',
                  localName: 'step.background.spec.command'
                }
              },
              'step-privileged': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.background.spec.privileged',
                  localName: 'step.background.spec.privileged'
                }
              },
              'step-reportPaths': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.background.spec.reports.spec.paths',
                  localName: 'step.background.spec.reports.spec.paths'
                }
              },
              'step-envVariables': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.spec.background.envVariables',
                  localName: 'step.background.spec.envVariables'
                }
              },
              'step-entrypoint': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.background.spec.entrypoint',
                  localName: 'step.background.spec.entrypoint'
                }
              },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.background.spec.resources.limits.memory',
                  localName: 'step.background.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.background.spec.resources.limits.cpu',
                  localName: 'step.background.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.Background,
              identifier: 'background',
              name: 'step-name',
              description: 'step-description',
              timeout: 'step-timeout',
              spec: {
                connectorRef: 'step-connectorRef',
                image: 'step-image',
                command: 'step-command',
                privileged: 'step-privileged',
                reports: {
                  spec: {
                    paths: 'step-reportPaths'
                  }
                },
                envVariables: 'step-envVariables',
                entrypoint: 'step-entrypoint',
                resources: {
                  limits: {
                    memory: 'step-limitMemory',
                    cpu: 'step-limitCPU'
                  }
                }
              }
            }
          }}
          type={StepType.Background}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })
})
