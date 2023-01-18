/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { InstanceTypes } from '@common/constants/InstanceTypes'
import type { ElastigroupDeployStepInfo } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ElastigroupDeploy } from '../ElastigroupDeploy'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const onUpdate = jest.fn()
const onChange = jest.fn()

const initialValuesRuntime: ElastigroupDeployStepInfo = {
  type: 'ElastigroupDeploy',
  name: 'Elastigroup Deploy2',
  identifier: 'Elastigroup_Deploy',
  spec: {
    newService: {
      type: 'Percentage',
      spec: {
        percentage: RUNTIME_INPUT_VALUE
      }
    },
    oldService: {
      spec: {
        count: RUNTIME_INPUT_VALUE
      },
      type: 'Count'
    }
  },
  timeout: RUNTIME_INPUT_VALUE
}

const initialValuesEdit: ElastigroupDeployStepInfo = {
  type: 'ElastigroupDeploy',
  name: 'Elastigroup Deploy2',
  identifier: 'Elastigroup_Deploy',
  spec: {
    newService: {
      type: 'Percentage',
      spec: {
        percentage: '100%'
      }
    },
    oldService: {
      spec: {
        count: '1'
      },
      type: 'Count'
    }
  },
  timeout: '10m'
}

describe('Test Elastigroup Deploy Step', () => {
  beforeEach(() => {
    factory.registerStep(new ElastigroupDeploy())
  })

  test('should render edit view as new step - empty values', () => {
    const { container, getByText, getAllByText } = render(
      <TestStepWidget initialValues={{}} type={StepType.ElastigroupDeploy} stepViewType={StepViewType.Edit} />
    )

    const instanceField = container.querySelector('input[placeholder="instanceFieldOptions.instanceHolder"]')
    const optionalConfigAccordion = getByText('common.optionalConfig')
    userEvent.click(optionalConfigAccordion)

    //initial empty form
    expect(container.querySelector('input[placeholder="pipeline.stepNamePlaceholder"]')).toBeTruthy()

    //default type should be count
    expect(getAllByText('instanceFieldOptions.instanceText')).toBeTruthy()

    //default value === 1 for New instances and min=1
    expect(instanceField).toHaveValue(1)
    expect(container.querySelector('input[min="1"]'))

    //default empty for oldInstances and min=0
    expect(container.querySelector('input[min="0"]'))
  })

  test('should render edit view as new step - with initial values', () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={initialValuesEdit}
        type={StepType.ElastigroupDeploy}
        stepViewType={StepViewType.Edit}
      />
    )

    const optionalConfigAccordion = getByText('common.optionalConfig')
    userEvent.click(optionalConfigAccordion)

    expect(container).toMatchSnapshot()
  })

  test('should submit with valid inputs', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const initialValues = {
      ...initialValuesEdit,
      spec: {
        ...initialValuesEdit.spec,
        oldService: {
          type: 'Percentage',
          spec: {
            percentage: ''
          }
        }
      }
    }
    render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.ElastigroupDeploy}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
        onChange={onChange}
      />
    )

    await act(() => ref.current?.submitForm()!)

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Elastigroup_Deploy',
        name: 'Elastigroup Deploy2',
        spec: {
          newService: {
            spec: {
              percentage: '100%'
            },
            type: 'Percentage'
          }
        },
        timeout: '10m',
        type: 'ElastigroupDeploy'
      })
    )
  })

  test('should submit with runtime inputs', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    render(
      <TestStepWidget
        initialValues={initialValuesRuntime}
        type={StepType.ElastigroupDeploy}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
        onChange={onChange}
      />
    )

    await act(() => ref.current?.submitForm()!)

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Elastigroup_Deploy',
        name: 'Elastigroup Deploy2',
        spec: {
          newService: {
            spec: {
              percentage: '<+input>'
            },
            type: 'Percentage'
          },
          oldService: {
            spec: {
              count: '<+input>'
            },
            type: 'Count'
          }
        },
        timeout: '<+input>',
        type: 'ElastigroupDeploy'
      })
    )
  })

  test('should render variable view', () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={initialValuesEdit}
        type={StepType.ElastigroupDeploy}
        stepViewType={StepViewType.InputVariable}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.ElastigroupDeploy.name',
                localName: 'step.ElastigroupDeploy.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.ElastigroupDeploy.timeout',
                localName: 'step.ElastigroupDeploy.timeout'
              }
            }
          },
          variablesData: {
            identifier: 'ElastigroupDeployp',
            name: 'step-name',
            spec: {
              newService: {
                spec: {
                  percentage: 10
                },
                type: InstanceTypes.Percentage
              },
              oldService: {
                spec: {
                  percentage: 10
                },
                type: InstanceTypes.Percentage
              }
            },
            timeout: 'step-timeout',
            type: 'ElastigroupDeploy'
          }
        }}
      />
    )

    expect(getByText('Elastigroup Deploy2')).toBeTruthy()
    expect(getByText('10m')).toBeTruthy()
  })

  test('should render inputSet form', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={initialValuesRuntime}
        type={StepType.ElastigroupDeploy}
        stepViewType={StepViewType.InputSet}
        template={initialValuesRuntime}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render inputSet form - count as Instance Type', () => {
    const initialValues = { ...initialValuesRuntime }
    initialValues.timeout = '10m'
    initialValues.spec = {
      newService: {
        type: 'Count',
        spec: {
          count: RUNTIME_INPUT_VALUE
        }
      },
      oldService: {
        spec: {
          percentage: RUNTIME_INPUT_VALUE
        },
        type: 'Percentage'
      }
    }
    const { getAllByText } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.ElastigroupDeploy}
        stepViewType={StepViewType.InputSet}
        template={initialValues}
        path={'test'}
      />
    )

    expect(getAllByText('instanceFieldOptions.instanceText')).toHaveLength(2)
    expect(getAllByText('common.instanceLabel')).toHaveLength(2)
  })

  test('validate input set', () => {
    const data = {
      data: {
        ...initialValuesEdit,
        timeout: '1s',
        spec: {
          newService: {
            type: 'Percentage',
            spec: {
              percentage: ''
            }
          },
          oldService: {
            spec: {
              percentage: ''
            },
            type: 'Percentage'
          }
        }
      },
      template: {
        ...initialValuesRuntime,
        spec: {
          newService: {
            spec: {
              percentage: RUNTIME_INPUT_VALUE
            },
            type: 'Percentage'
          },
          oldService: {
            spec: {
              percentage: RUNTIME_INPUT_VALUE
            },
            type: 'Percentage'
          }
        }
      },
      viewType: StepViewType.TriggerForm
    }
    const validateResponse = new ElastigroupDeploy().validateInputSet(data)
    expect(validateResponse).toStrictEqual({ timeout: 'Value must be greater than or equal to "10s"' })
  })
})

test('test processFormData function', () => {
  const values = {
    type: 'ElastigroupDeploy',
    name: 'Elastigroup Deploy2',
    identifier: 'Elastigroup_Deploy',
    spec: {
      newService: {
        type: 'Count',
        spec: {
          count: '1',
          percentage: '100%'
        }
      },
      oldService: {
        spec: {
          count: '1',
          percentage: '100%'
        },
        type: 'Count'
      }
    },
    timeout: '10m'
  }
  const processFormResponse = new ElastigroupDeploy().processFormData(values)
  expect(processFormResponse).toStrictEqual({
    type: 'ElastigroupDeploy',
    name: 'Elastigroup Deploy2',
    identifier: 'Elastigroup_Deploy',
    spec: {
      newService: {
        type: 'Count',
        spec: {
          count: '1'
        }
      },
      oldService: {
        spec: {
          count: '1'
        },
        type: 'Count'
      }
    },
    timeout: '10m'
  })

  const otherValue = {
    type: 'ElastigroupDeploy',
    name: 'Elastigroup Deploy2',
    identifier: 'Elastigroup_Deploy',
    spec: {
      newService: {
        type: 'Count',
        spec: {
          count: '1',
          percentage: '100%'
        }
      },
      oldService: {
        spec: {
          count: '1',
          percentage: '100%'
        },
        type: 'Percentage'
      }
    },
    timeout: '10m'
  }

  const processFormResult = new ElastigroupDeploy().processFormData(otherValue)
  expect(processFormResult).toStrictEqual({
    type: 'ElastigroupDeploy',
    name: 'Elastigroup Deploy2',
    identifier: 'Elastigroup_Deploy',
    spec: {
      newService: {
        type: 'Count',
        spec: {
          count: '1'
        }
      },
      oldService: {
        spec: {
          percentage: '100%'
        },
        type: 'Percentage'
      }
    },
    timeout: '10m'
  })
})
