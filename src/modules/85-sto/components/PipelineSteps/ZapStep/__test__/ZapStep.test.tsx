/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this instance, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { StringKeys } from 'framework/strings'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ZapStep, ZapStepData } from '../ZapStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Zap Step', () => {
  beforeAll(() => {
    factory.registerStep(new ZapStep())
  })

  describe('Edit View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.Zap} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('renders runtime inputs - Ingestion Instance', async () => {
      const initialValues = {
        identifier: 'My_Zap_Step',
        name: 'My Zap Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          privileged: RUNTIME_INPUT_VALUE,
          target: {
            type: 'instance',
            name: RUNTIME_INPUT_VALUE,
            variant: RUNTIME_INPUT_VALUE
          },
          ingestion: {
            file: RUNTIME_INPUT_VALUE
          },
          mode: 'ingestion',
          config: 'default',
          settings: RUNTIME_INPUT_VALUE,
          instance: {
            domain: 'auth domain',
            protocol: 'token',
            path: 'true',
            port: 8080
          },
          advanced: {
            fail_on_severity: RUNTIME_INPUT_VALUE,
            log: {
              level: RUNTIME_INPUT_VALUE,
              serializer: RUNTIME_INPUT_VALUE
            }
          },
          // Right now we do not support Image Pull Policy but will do in the future
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
          type={StepType.Zap}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()

      await act(() => ref.current?.submitForm()!)

      expect(onUpdate).toHaveBeenCalledWith(initialValues)
    })

    test('renders runtime inputs - Orchestration instance', async () => {
      const initialValues = {
        identifier: 'My_Zap_Step',
        name: 'My Zap Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          privileged: RUNTIME_INPUT_VALUE,
          target: {
            type: 'instance',
            name: RUNTIME_INPUT_VALUE,
            variant: RUNTIME_INPUT_VALUE,
            workspace: RUNTIME_INPUT_VALUE
          },
          instance: {
            domain: RUNTIME_INPUT_VALUE,
            protocol: RUNTIME_INPUT_VALUE,
            path: RUNTIME_INPUT_VALUE,
            port: RUNTIME_INPUT_VALUE
          },
          mode: 'orchestration',
          config: 'default',
          settings: RUNTIME_INPUT_VALUE,
          tool: {
            port: RUNTIME_INPUT_VALUE
          },
          advanced: {
            args: {
              cli: RUNTIME_INPUT_VALUE
            },
            fail_on_severity: RUNTIME_INPUT_VALUE,
            log: {
              level: RUNTIME_INPUT_VALUE,
              serializer: RUNTIME_INPUT_VALUE
            }
          },
          // Right now we do not support Image Pull Policy but will do in the future
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
          type={StepType.Zap}
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
        identifier: 'My_Zap_Stp',
        name: 'My Zap Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          privileged: true,
          target: {
            type: 'instance',
            name: 'Zap Test',
            variant: 'variant',
            workspace: '~/workspace'
          },
          instance: {
            domain: 'auth domain',
            protocol: 'token',
            path: true,
            port: 8080
          },
          config: 'default',
          mode: 'orchestration',
          settings: {
            setting_1: 'settings test value 1',
            setting_2: 'settings test value 1'
          },
          tool: {
            context: 'tool context',
            port: 'tool port'
          },
          advanced: {
            log: {
              level: 'debug',
              serializer: 'simple_onprem'
            },
            args: {
              cli: 'additional cli args'
            }
          },
          // Right now we do not support Image Pull Policy but will do in the future
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
          type={StepType.Zap}
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
        <TestStepWidget initialValues={{}} type={StepType.Zap} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const template = {
        type: StepType.Zap,
        identifier: 'My_Zap_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          privileged: RUNTIME_INPUT_VALUE,
          settings: RUNTIME_INPUT_VALUE,
          target: {
            type: 'instance',
            name: RUNTIME_INPUT_VALUE,
            variant: RUNTIME_INPUT_VALUE,
            workspace: RUNTIME_INPUT_VALUE
          },
          instance: {
            domain: RUNTIME_INPUT_VALUE,
            protocol: RUNTIME_INPUT_VALUE,
            path: RUNTIME_INPUT_VALUE,
            port: RUNTIME_INPUT_VALUE
          },
          config: RUNTIME_INPUT_VALUE,
          mode: RUNTIME_INPUT_VALUE,
          tool: {
            context: RUNTIME_INPUT_VALUE,
            port: RUNTIME_INPUT_VALUE
          },
          advanced: {
            log: {
              level: RUNTIME_INPUT_VALUE,
              serializer: RUNTIME_INPUT_VALUE // Remove From UI
            }
          },
          // Right now we do not support Image Pull Policy but will do in the future
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
        type: StepType.Zap,
        name: 'Test A',
        identifier: 'My_Zap_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          privileged: RUNTIME_INPUT_VALUE,
          settings: RUNTIME_INPUT_VALUE,
          target: {
            type: 'instance',
            name: RUNTIME_INPUT_VALUE,
            variant: RUNTIME_INPUT_VALUE,
            workspace: RUNTIME_INPUT_VALUE
          },
          instance: {
            domain: RUNTIME_INPUT_VALUE,
            protocol: RUNTIME_INPUT_VALUE,
            path: RUNTIME_INPUT_VALUE,
            port: RUNTIME_INPUT_VALUE
          },
          config: RUNTIME_INPUT_VALUE,
          mode: RUNTIME_INPUT_VALUE,
          tool: {
            context: RUNTIME_INPUT_VALUE,
            port: RUNTIME_INPUT_VALUE
          },
          advanced: {
            log: {
              level: RUNTIME_INPUT_VALUE,
              serializer: RUNTIME_INPUT_VALUE // Remove From UI
            }
          },
          // Right now we do not support Image Pull Policy but will do in the future
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
          type={StepType.Zap}
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
        type: StepType.Zap,
        identifier: 'My_Zap_Step'
      }

      const allValues = {
        type: StepType.Zap,
        identifier: 'My_Zap_Step',
        name: 'My Zap Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          mode: 'orchestration',
          privileged: false,
          settings: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
          // Right now we do not support Image Pull Policy but will do in the future
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
          type={StepType.Zap}
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
            type: StepType.Zap,
            description: 'Description',
            timeout: '10s',
            spec: {
              privileged: false,
              settings: {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3'
              },
              // Right now we do not support Image Pull Policy but will do in the future
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
                  fqn: 'pipeline.stages.qaStage.execution.steps.bandit.name',
                  localName: 'step.bandit.name'
                }
              },
              'step-identifier': {
                yamlExtraProperties: {
                  properties: [
                    {
                      fqn: 'pipeline.stages.qaStage.execution.steps.bandit.identifier',
                      localName: 'step.bandit.identifier',
                      variableName: 'identifier'
                    }
                  ]
                }
              },
              'step-description': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.bandit.description',
                  localName: 'step.bandit.description'
                }
              },
              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.bandit.timeout',
                  localName: 'step.bandit.timeout'
                }
              },
              'step-settings': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.bandit.spec.settings',
                  localName: 'step.bandit.spec.settings'
                }
              },
              // Right now we do not support Image Pull Policy but will do in the future
              // 'step-pull': {
              //   yamlProperties: {
              //     fqn: 'pipeline.stages.qaStage.execution.steps.bandit.spec.pull',
              //     localName: 'step.bandit.spec.pull'
              //   }
              // },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.bandit.spec.resources.limits.memory',
                  localName: 'step.bandit.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.bandit.spec.resources.limits.cpu',
                  localName: 'step.bandit.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.Zap,
              __uuid: 'step-identifier',
              identifier: 'Zap',
              name: 'step-name',
              description: 'step-description',
              timeout: 'step-timeout',
              spec: {
                privileged: 'step-privileged',
                settings: 'step-settings',
                // Right now we do not support Image Pull Policy but will do in the future
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
          type={StepType.Zap}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })

  test('validates input set correctly', () => {
    const data: ZapStepData = {
      identifier: 'id',
      name: 'name',
      description: 'desc',
      type: StepType.Zap,
      timeout: '1h',
      spec: {
        target: {
          type: 'instance',
          name: 'target name',
          variant: 'target variant',
          workspace: 'target workspace'
        },
        tool: {
          context: 'tool context',
          port: 8010
        },
        instance: {
          domain: 'auth domain',
          protocol: 'token',
          path: 'true',
          port: 8080
        },
        advanced: {
          include_raw: false
        },
        config: 'default',
        mode: 'orchestration',
        privileged: true,
        settings: {
          policy_type: 'orchestratedScan',
          scan_type: 'instance',
          product_name: 'x',
          product_config_name: 'y'
        },
        imagePullPolicy: 'Always',
        runAsUser: 'user',
        resources: {
          limits: {
            memory: '1Gi',
            cpu: '1000m'
          }
        }
      }
    }

    const result = new ZapStep().validateInputSet({
      data,
      template: data,
      getString: (key: StringKeys, _vars?: Record<string, any>) => key as string,
      viewType: StepViewType.DeploymentForm
    })

    expect(result).toMatchSnapshot()
  })
})
