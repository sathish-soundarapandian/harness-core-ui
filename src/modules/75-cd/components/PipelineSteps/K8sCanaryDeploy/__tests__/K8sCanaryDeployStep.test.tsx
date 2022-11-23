/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { InstanceTypes } from '@common/constants/InstanceTypes'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { K8sCanaryDeployStep } from '../K8sCanaryDeployStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sCanaryDeployStep', () => {
  beforeEach(() => {
    factory.registerStep(new K8sCanaryDeployStep())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sCanaryDeploy} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view as edit step with all runtime inputs', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sCanaryDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: {
            skipDryRun: RUNTIME_INPUT_VALUE,
            timeout: RUNTIME_INPUT_VALUE,
            instanceSelection: {
              spec: {
                count: RUNTIME_INPUT_VALUE
              },
              type: 'Count'
            }
          }
        }}
        type={StepType.K8sCanaryDeploy}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render input set view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ identifier: 'Test_A', type: 'K8sCanaryDeploy', spec: { skipDryRun: false } }}
        template={{
          identifier: 'Test_A',
          type: 'K8sCanaryDeploy',
          spec: {
            skipDryRun: RUNTIME_INPUT_VALUE,
            timeout: RUNTIME_INPUT_VALUE,
            instanceSelection: {
              spec: {
                count: RUNTIME_INPUT_VALUE
              },
              type: 'Count'
            }
          }
        }}
        allValues={{
          type: 'K8sCanaryDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: {
            skipDryRun: RUNTIME_INPUT_VALUE,
            timeout: RUNTIME_INPUT_VALUE,
            instanceSelection: {
              spec: {
                count: RUNTIME_INPUT_VALUE
              },
              type: 'Count'
            }
          }
        }}
        type={StepType.K8sCanaryDeploy}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Test_A',
          type: 'K8sCanaryDeploy',
          spec: { skipDryRun: false, timeout: '10m', instanceSelection: { type: 'Count', spec: { count: 20 } } }
        }}
        type={StepType.K8sCanaryDeploy}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test('should throw validation error without instances', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Test_A',
          type: 'K8sCanaryDeploy',
          spec: { skipDryRun: false }
        }}
        type={StepType.K8sCanaryDeploy}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    await ref.current?.submitForm()

    expect(container).toMatchSnapshot()
  })

  test('should submit with valid paylod for instace type count', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Test_A',
          type: 'K8sCanaryDeploy',
          timeout: '10m',
          spec: { skipDryRun: false, instanceSelection: { type: 'Count', spec: { count: 20 } } },
          name: 'Test A'
        }}
        type={StepType.K8sCanaryDeploy}
        ref={ref}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
      />
    )

    await ref.current?.submitForm()

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Test_A',
        name: 'Test A',
        spec: {
          instanceSelection: {
            spec: {
              count: 20
            },
            type: 'Count'
          },
          skipDryRun: false
        },
        timeout: '10m',
        type: 'K8sCanaryDeploy'
      })
    )
    expect(container).toMatchSnapshot()
  })

  test('should submit with valid payload for instance type percentage', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Test_A',
          type: 'K8sCanaryDeploy',
          timeout: '10m',
          spec: {
            skipDryRun: false,

            instanceSelection: {
              spec: {
                percentage: 20
              },
              type: InstanceTypes.Percentage
            }
          },
          name: 'Test A'
        }}
        type={StepType.K8sCanaryDeploy}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    await ref.current?.submitForm()

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Test_A',
        name: 'Test A',
        spec: {
          instanceSelection: {
            spec: {
              percentage: 20
            },
            type: 'Percentage'
          },
          skipDryRun: false
        },
        timeout: '10m',
        type: 'K8sCanaryDeploy'
      })
    )
    expect(container).toMatchSnapshot()
    // expect(onUpdate).toBeCalled()
  })

  test('on Edit view for instance type percentage', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()

    render(
      <TestStepWidget
        initialValues={{
          identifier: 'Test_A',
          name: 'Test A',
          timeout: '10m',
          spec: {
            instanceSelection: {
              spec: {
                percentage: 10
              },
              type: 'Percentage'
            },
            skipDryRun: false
          },
          type: 'K8sCanaryDeploy'
        }}
        type={StepType.K8sCanaryDeploy}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )
    await ref.current?.submitForm()

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Test_A',
        name: 'Test A',
        spec: {
          instanceSelection: {
            spec: {
              percentage: 10
            },
            type: 'Percentage'
          },
          skipDryRun: false
        },
        timeout: '10m',
        type: 'K8sCanaryDeploy'
      })
    )
  })

  test('on Edit view for instance type count', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()

    render(
      <TestStepWidget
        initialValues={{
          identifier: 'Test_A',
          name: 'Test A',
          timeout: '10m',
          spec: {
            instanceSelection: {
              spec: {
                count: 10
              },
              type: 'Count'
            },
            skipDryRun: false
          },
          type: 'K8sCanaryDeploy'
        }}
        type={StepType.K8sCanaryDeploy}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )
    await ref.current?.submitForm()

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Test_A',
        name: 'Test A',
        spec: {
          instanceSelection: {
            spec: {
              count: 10
            },
            type: 'Count'
          },
          skipDryRun: false
        },
        timeout: '10m',
        type: 'K8sCanaryDeploy'
      })
    )
  })

  test('should render variable view', () => {
    const onUpdate = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Test_A',
          name: 'Test A',
          spec: {
            instanceSelection: {
              spec: {
                percentage: 10
              },
              type: 'Percentage'
            },
            skipDryRun: false,
            timeout: '10m'
          },
          type: 'K8sCanaryDeploy'
        }}
        type={StepType.K8sCanaryDeploy}
        onUpdate={onUpdate}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.k8sCanaryDeploy.name',
                localName: 'step.k8sCanaryDeploy.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.k8sCanaryDeploy.timeout',
                localName: 'step.k8sCanaryDeploy.timeout'
              }
            }
          },
          variablesData: {
            identifier: 'Test_A',
            name: 'step-name',
            spec: {
              instanceSelection: {
                spec: {
                  percentage: 10
                },
                type: 'Percentage'
              },
              skipDryRun: false,
              timeout: 'step-timeout'
            },
            type: 'K8sCanaryDeploy'
          }
        }}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Minimum time cannot be less than 10s', () => {
    const response = new K8sCanaryDeployStep().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: 'K8sCanaryDeploy',
        spec: {
          instanceSelection: {
            spec: {
              count: 10
            },
            type: 'Count'
          },
          skipDryRun: false
        }
      },
      template: {
        name: 'Test_A',
        identifier: 'Test_A',
        type: 'K8sCanaryDeploy',
        spec: {
          skipDryRun: false,
          timeout: RUNTIME_INPUT_VALUE,
          instanceSelection: {
            spec: {
              count: RUNTIME_INPUT_VALUE
            },
            type: 'Count'
          }
        }
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot()
  })
  test('should render null for StepviewType.template', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sCanaryDeploy} stepViewType={StepViewType.Template} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render input set with percentage and timeout runtime', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        path={'/abc'}
        template={{
          identifier: 'Test_A',
          type: 'K8sCanaryDeploy',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            skipDryRun: RUNTIME_INPUT_VALUE,
            instanceSelection: {
              spec: {
                percentage: RUNTIME_INPUT_VALUE
              },
              type: 'Percentage'
            }
          }
        }}
        type={StepType.K8sCanaryDeploy}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('validate time to not be less than 10s', () => {
    const response = new K8sCanaryDeployStep().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: 'K8sCanaryDeploy',
        spec: {
          instanceSelection: {
            spec: {
              percentage: 10
            },
            type: 'Percentage'
          },
          skipDryRun: false
        }
      },
      template: {
        name: 'Test_A',
        identifier: 'Test_A',
        type: 'K8sCanaryDeploy',
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          skipDryRun: false,
          instanceSelection: {
            spec: {
              percentage: RUNTIME_INPUT_VALUE
            },
            type: 'Percentage'
          }
        }
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot()
  })
  test('validate time to not be less than 10s with percentage as runtime', () => {
    const data = {
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: 'K8sCanaryDeploy',
        spec: {}
      },
      template: {
        name: 'Test_A',
        identifier: 'Test_A',
        type: 'K8sCanaryDeploy',
        spec: {
          skipDryRun: false,
          timeout: '1s',
          instanceSelection: {
            spec: {
              percentage: RUNTIME_INPUT_VALUE
            },
            type: 'Count'
          }
        }
      },
      viewType: StepViewType.TriggerForm
    }
    const response = new K8sCanaryDeployStep().validateInputSet(data)
    const processForm = new K8sCanaryDeployStep().processFormData(data.template)
    expect(processForm).toMatchSnapshot()
    expect(response).toMatchSnapshot()
  })
})
