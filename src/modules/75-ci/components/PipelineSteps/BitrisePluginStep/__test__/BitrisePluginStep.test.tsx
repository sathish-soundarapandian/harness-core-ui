/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { BitrisePluginStep } from '../BitrisePluginStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Plugin Step', () => {
  beforeAll(() => {
    factory.registerStep(new BitrisePluginStep())
  })

  describe('Edit View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.BitrisePlugin} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('renders runtime inputs', async () => {
      const initialValues = {
        identifier: 'Bitrise_Plugin_Step',
        name: 'Bitrise Plugin Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          uses: RUNTIME_INPUT_VALUE,
          env: RUNTIME_INPUT_VALUE,
          with: RUNTIME_INPUT_VALUE,
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
          type={StepType.BitrisePlugin}
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
        identifier: 'Bitrise_Plugin_Step',
        name: 'Bitrise Plugin Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          uses: 'image',
          env: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
          with: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
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
          type={StepType.BitrisePlugin}
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
        <TestStepWidget initialValues={{}} type={StepType.BitrisePlugin} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const template = {
        type: StepType.BitrisePlugin,
        identifier: 'Bitrise_Plugin_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          uses: RUNTIME_INPUT_VALUE,
          env: RUNTIME_INPUT_VALUE,
          with: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          }
        }
      }

      const allValues = {
        type: StepType.BitrisePlugin,
        name: 'Test',
        identifier: 'Bitrise_Plugin_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          uses: RUNTIME_INPUT_VALUE,
          env: RUNTIME_INPUT_VALUE,
          with: RUNTIME_INPUT_VALUE,
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
          type={StepType.BitrisePlugin}
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
        type: StepType.BitrisePlugin,
        identifier: 'Bitrise_Plugin_Step'
      }

      const allValues = {
        type: StepType.BitrisePlugin,
        identifier: 'Bitrise_Plugin_Step',
        name: 'Bitrise Plugin Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          uses: 'image',
          env: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
          with: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
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
          type={StepType.BitrisePlugin}
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
            identifier: 'Test',
            name: 'Test',
            type: StepType.BitrisePlugin,
            description: 'Description',
            timeout: '10s',
            spec: {
              uses: 'image',
              env: {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3'
              },
              with: {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3'
              },
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
                  fqn: 'pipeline.stages.qaStage.execution.steps.plugin.name',
                  localName: 'step.plugin.name'
                }
              },
              'step-identifier': {
                yamlExtraProperties: {
                  properties: [
                    {
                      fqn: 'pipeline.stages.qaStage.execution.steps.plugin.identifier',
                      localName: 'step.plugin.identifier',
                      variableName: 'identifier'
                    }
                  ]
                }
              },
              'step-description': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.plugin.description',
                  localName: 'step.plugin.description'
                }
              },
              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.plugin.timeout',
                  localName: 'step.plugin.timeout'
                }
              },
              'step-uses': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.plugin.spec.uses',
                  localName: 'step.plugin.spec.uses'
                }
              },
              'step-env': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.plugin.spec.env',
                  localName: 'step.plugin.spec.env'
                }
              },
              'step-with': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.plugin.spec.with',
                  localName: 'step.plugin.spec.with'
                }
              },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.plugin.spec.resources.limits.memory',
                  localName: 'step.plugin.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.plugin.spec.resources.limits.cpu',
                  localName: 'step.plugin.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.BitrisePlugin,
              __uuid: 'step-identifier',
              identifier: 'plugin',
              name: 'step-name',
              description: 'step-description',
              timeout: 'step-timeout',
              spec: {
                uses: 'step-uses',
                env: 'step-env',
                with: 'step-with',
                resources: {
                  limits: {
                    memory: 'step-limitMemory',
                    cpu: 'step-limitCPU'
                  }
                }
              }
            }
          }}
          type={StepType.BitrisePlugin}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })
})
