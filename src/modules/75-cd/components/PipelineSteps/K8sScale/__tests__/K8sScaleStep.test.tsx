/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { InstanceTypes } from '@common/constants/InstanceTypes'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { K8sScaleStep } from '../K8sScaleStep'

// eslint-disable-next-line react/display-name
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sBlueGreenDeployStep', () => {
  beforeEach(() => {
    factory.registerStep(new K8sScaleStep())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sScale} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view as edit step with all runtime inputs', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sScale',
          name: 'Test A',
          identifier: 'Test_A',
          spec: {
            timeout: RUNTIME_INPUT_VALUE,
            workload: RUNTIME_INPUT_VALUE,
            skipSteadyStateCheck: RUNTIME_INPUT_VALUE,
            instanceSelection: { type: 'Count', spec: { count: RUNTIME_INPUT_VALUE } }
          }
        }}
        type={StepType.K8sScale}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Test_A',
          type: 'K8sScale',
          spec: {
            workload: 'test',
            timeout: '10m',
            skipSteadyStateCheck: false,
            instanceSelection: { type: 'Count', spec: { count: 10 } }
          }
        }}
        template={{
          identifier: 'Test_A',
          type: 'K8sScale',
          spec: {
            timeout: RUNTIME_INPUT_VALUE,
            workload: RUNTIME_INPUT_VALUE,
            skipSteadyStateCheck: RUNTIME_INPUT_VALUE,
            instanceSelection: { type: 'Count', spec: { count: RUNTIME_INPUT_VALUE } }
          }
        }}
        allValues={{
          type: 'K8sScale',
          name: 'Test A',
          identifier: 'Test_A',
          spec: {
            timeout: RUNTIME_INPUT_VALUE,
            workload: RUNTIME_INPUT_VALUE,
            skipSteadyStateCheck: RUNTIME_INPUT_VALUE,
            instanceSelection: { type: 'Count', spec: { count: RUNTIME_INPUT_VALUE } }
          }
        }}
        type={StepType.K8sScale}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ identifier: 'Test_A', type: 'K8sScale', spec: { skipSteadyStateCheck: false } }}
        template={{ identifier: 'Test_A', type: 'K8sScale', spec: { skipSteadyStateCheck: RUNTIME_INPUT_VALUE } }}
        allValues={{
          type: 'K8sScale',
          name: 'Test A',
          identifier: 'Test_A',
          spec: {
            timeout: '10m',
            workload: 'test',
            skipSteadyStateCheck: false,
            instanceSelection: { type: 'Count', spec: { count: 10 } }
          }
        }}
        type={StepType.K8sScale}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should throw validation error without instances', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Test_A',
          type: 'K8sScale',
          skipSteadyStateCheck: false,
          spec: { skipSteadyStateCheck: false, workload: 'test' }
        }}
        type={StepType.K8sScale}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    await ref.current?.submitForm()

    await waitFor(() => Promise.resolve())
    await waitFor(() => Promise.resolve())
    expect(container).toMatchSnapshot()
    expect(onUpdate).not.toBeCalled()
  })

  test('should submit with valid payload for instance type count', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Test_A',
          type: 'K8sScale',
          spec: {
            workload: 'test',
            skipSteadyStateCheck: true,
            instanceSelection: { type: 'Count', spec: { count: 10 } }
          },
          name: 'Test A',
          timeout: '10m'
        }}
        type={StepType.K8sScale}
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
          skipSteadyStateCheck: true,
          workload: 'test'
        },
        timeout: '10m',
        type: 'K8sScale'
      })
    )
    expect(container).toMatchSnapshot()
    // expect(onUpdate).toBeCalled()
  })

  test('should submit with valid payload for instance type percentage', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Test_A',
          type: 'K8sScale',
          spec: {
            workload: 'test',
            instanceSelection: {
              spec: {
                percentage: 10
              },
              type: InstanceTypes.Percentage
            }
          },
          timeout: '10m',
          name: 'Test A'
        }}
        type={StepType.K8sScale}
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
          skipSteadyStateCheck: false,
          workload: 'test'
        },
        timeout: '10m',
        type: 'K8sScale'
      })
    )
    expect(container).toMatchSnapshot()
  })

  test('should submit with valid payload for instance type instances', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Test_A',
          type: 'K8sScale',
          spec: {
            workload: 'test',
            instanceSelection: {
              spec: {
                count: 10,
                percentage: 1
              },
              type: InstanceTypes.Instances
            }
          },
          timeout: '10m',
          name: 'Test A'
        }}
        type={StepType.K8sScale}
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
            type: InstanceTypes.Instances
          },
          skipSteadyStateCheck: false,
          workload: 'test'
        },
        timeout: '10m',
        type: 'K8sScale'
      })
    )
    expect(container).toMatchSnapshot()
  })

  test('on Edit view for instance type percentage', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()

    render(
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
            skipSteadyStateCheck: false,
            workload: 'test'
          },
          timeout: '10m',
          type: 'K8sScale'
        }}
        type={StepType.K8sScale}
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
          skipSteadyStateCheck: false,
          workload: 'test'
        },
        timeout: '10m',
        type: 'K8sScale'
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
          spec: {
            instanceSelection: {
              spec: {
                count: 10
              },
              type: 'Count'
            },
            workload: 'test'
          },
          timeout: '10m',
          type: 'K8sScale'
        }}
        type={StepType.K8sScale}
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
          skipSteadyStateCheck: false,
          workload: 'test'
        },
        timeout: '10m',
        type: 'K8sScale'
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
                count: 10
              },
              type: 'Count'
            },
            timeout: '10m',
            workload: 'test'
          },
          type: 'K8sScale'
        }}
        type={StepType.K8sScale}
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
                  count: 10
                },
                type: 'Count'
              },
              timeout: 'step-timeout',
              workload: 'test'
            },
            type: 'K8sScale'
          }
        }}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render inputSet view and test validation', async () => {
    const onUpdate = jest.fn()
    const template = {
      identifier: 'Test_A',
      name: 'Test A',
      spec: {
        instanceSelection: {
          spec: {
            percentage: '<+input>'
          },
          type: 'Percentage'
        },
        workload: 'test'
      },
      timeout: '<+input>',
      type: 'K8sScale'
    }
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        path={'/abc'}
        allValues={{
          identifier: 'Test_A',
          name: 'Test A',
          spec: {
            instanceSelection: {
              spec: {
                percentage: '<+input>'
              },
              type: 'Percentage'
            },
            workload: 'test'
          },

          timeout: '<+input>',
          type: 'K8sScale'
        }}
        template={template}
        type={StepType.K8sScale}
        onUpdate={onUpdate}
        stepViewType={StepViewType.InputSet}
      />
    )
    await act(async () => {
      fireEvent.click(getByText('Submit'))
    })

    expect(container).toMatchSnapshot()
  })

  test('Minimum time cannot be less than 10s', () => {
    const response = new K8sScaleStep().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: 'K8sScale',
        spec: {
          instanceSelection: {
            spec: {
              count: 10
            },
            type: 'Count'
          },
          skipSteadyStateCheck: false,
          workload: 'test'
        }
      },
      template: {
        name: 'Test_A',
        identifier: 'Test_A',
        type: 'K8sScale',
        spec: {
          timeout: RUNTIME_INPUT_VALUE,
          workload: RUNTIME_INPUT_VALUE,
          skipSteadyStateCheck: false,
          instanceSelection: { type: 'Count', spec: { count: RUNTIME_INPUT_VALUE } }
        }
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot()
  })
  test('should render null for StepviewType.template', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sScale} stepViewType={StepViewType.Template} />
    )
    expect(container).toMatchSnapshot()
  })
})
