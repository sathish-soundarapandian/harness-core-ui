/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { StringKeys } from 'framework/strings'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ProwlerStep, ProwlerStepData } from '../ProwlerStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Prowler Step', () => {
  beforeAll(() => {
    factory.registerStep(new ProwlerStep())
  })

  describe('Edit View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.Prowler} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('renders runtime inputs - Ingestion Configuration', async () => {
      const initialValues = {
        identifier: 'My_Prowler_Step',
        name: 'My Prowler Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          privileged: RUNTIME_INPUT_VALUE,
          target: {
            type: 'configuration',
            name: RUNTIME_INPUT_VALUE,
            variant: RUNTIME_INPUT_VALUE
          },
          ingestion: {
            file: 'ingestion filename'
          },
          mode: 'ingestion',
          config: 'default',
          settings: RUNTIME_INPUT_VALUE,
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
          type={StepType.Prowler}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()

      await act(() => ref.current?.submitForm()!)

      expect(onUpdate).toHaveBeenCalledWith(initialValues)
    })

    test('renders runtime inputs - Orchestration Configuration', async () => {
      const initialValues = {
        identifier: 'My_Prowler_Step',
        name: 'My Prowler Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          privileged: RUNTIME_INPUT_VALUE,
          target: {
            type: 'configuration',
            name: RUNTIME_INPUT_VALUE,
            variant: RUNTIME_INPUT_VALUE,
            workspace: RUNTIME_INPUT_VALUE
          },
          auth: {
            access_id: RUNTIME_INPUT_VALUE,
            region: RUNTIME_INPUT_VALUE,
            access_token: RUNTIME_INPUT_VALUE,
            type: 'aws'
          },
          mode: 'orchestration',
          config: 'default',
          settings: RUNTIME_INPUT_VALUE,
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
          type={StepType.Prowler}
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
        identifier: 'My_Prowler_Stp',
        name: 'My Prowler Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          privileged: true,
          target: {
            type: 'configuration',
            name: 'Prowler Test',
            variant: 'variant',
            workspace: '~/workspace'
          },
          auth: {
            type: 'aws',
            access_id: 'access id',
            region: 'auth region',
            access_token: 'token'
          },
          config: 'default',
          mode: 'orchestration',
          settings: {
            setting_1: 'settings test value 1',
            setting_2: 'settings test value 1'
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
          type={StepType.Prowler}
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
        <TestStepWidget initialValues={{}} type={StepType.Prowler} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const template = {
        type: StepType.Prowler,
        identifier: 'My_Prowler_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          privileged: RUNTIME_INPUT_VALUE,
          settings: RUNTIME_INPUT_VALUE,
          target: {
            type: 'configuration',
            name: RUNTIME_INPUT_VALUE,
            variant: RUNTIME_INPUT_VALUE,
            workspace: RUNTIME_INPUT_VALUE
          },
          auth: {
            region: RUNTIME_INPUT_VALUE,
            access_token: RUNTIME_INPUT_VALUE
          },
          config: RUNTIME_INPUT_VALUE,
          mode: RUNTIME_INPUT_VALUE,
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
        type: StepType.Prowler,
        name: 'Test A',
        identifier: 'My_Prowler_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          privileged: RUNTIME_INPUT_VALUE,
          settings: RUNTIME_INPUT_VALUE,
          target: {
            type: 'configuration',
            name: RUNTIME_INPUT_VALUE,
            variant: RUNTIME_INPUT_VALUE,
            workspace: RUNTIME_INPUT_VALUE
          },
          auth: {
            region: RUNTIME_INPUT_VALUE,
            access_token: RUNTIME_INPUT_VALUE
          },
          config: RUNTIME_INPUT_VALUE,
          mode: RUNTIME_INPUT_VALUE,
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
          type={StepType.Prowler}
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
        type: StepType.Prowler,
        identifier: 'My_Prowler_Step'
      }

      const allValues = {
        type: StepType.Prowler,
        identifier: 'My_Prowler_Step',
        name: 'My Prowler Step',
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
      }

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.Prowler}
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
            type: StepType.Prowler,
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
              type: StepType.Prowler,
              __uuid: 'step-identifier',
              identifier: 'Prowler',
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
          type={StepType.Prowler}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })

  test('validates input set correctly', () => {
    const data: ProwlerStepData = {
      identifier: 'id',
      name: 'name',
      description: 'desc',
      type: StepType.Prowler,
      timeout: '1h',
      spec: {
        target: {
          type: 'configuration',
          name: 'target name',
          variant: 'target variant',
          workspace: 'target workspace'
        },
        advanced: {
          include_raw: false
        },
        config: 'default',
        mode: 'orchestration',
        privileged: true,
        settings: {
          policy_type: 'orchestratedScan',
          setting: 'setting',
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

    const result = new ProwlerStep().validateInputSet({
      data,
      template: data,
      getString: (key: StringKeys, _vars?: Record<string, any>) => key as string,
      viewType: StepViewType.DeploymentForm
    })

    expect(result).toMatchSnapshot()
  })
})
