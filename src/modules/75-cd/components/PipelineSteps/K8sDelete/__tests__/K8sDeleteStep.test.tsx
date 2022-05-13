/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'

import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { K8sDeleteStep } from '../K8sDeleteStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sDeleteStep', () => {
  beforeEach(() => {
    factory.registerStep(new K8sDeleteStep())
  })
  test('should render edit view as new step', async () => {
    const { container, getByText } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sDelete} stepViewType={StepViewType.Edit} />
    )
    // change radio group
    fireEvent.click(getByText('pipelineSteps.releaseNameLabel'))
    fireEvent.click(getByText('pipelineSteps.deleteNamespace'))

    // change radio group
    fireEvent.click(getByText('auditTrail.resourceNameLabel'))
    fireEvent.click(container.querySelector('[data-icon="main-trash"]') as HTMLElement)
    await fireEvent.click(getByText('plusAdd'))

    // change radio group again
    fireEvent.click(getByText('pipelineSteps.manifestPathLabel'))

    fireEvent.change(
      container.querySelector('input[name="spec.deleteResources.spec.manifestPaths[0].value"]') as HTMLElement,
      { target: { value: 'test' } }
    )

    //now delete this
    fireEvent.click(container.querySelector('[data-icon="main-trash"]') as HTMLElement)

    //Add new
    await fireEvent.click(getByText('addFileText'))
    fireEvent.change(
      container.querySelector('input[name="spec.deleteResources.spec.manifestPaths[0].value"]') as HTMLElement,
      { target: { value: 'test2' } }
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view -with ManifestPaths selected', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResources: {
              type: 'ManifestPath',

              spec: {
                manifestPaths: ['testA', 'testB']
              }
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view -with ReleaseName selected', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResources: {
              type: 'ReleaseName',

              spec: {
                deleteNamespace: true
              }
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
    const warningMessage = container.querySelector('#warning-deletenamespace')
    expect(warningMessage).toBeTruthy()
  })

  test('should render edit view -with ResourceName selected', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResources: {
              type: 'ResourceName',
              spec: {
                resourceNames: ['testABC', 'test123']
              }
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('validate input set in deployment form - only timeout is runtime', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '',
          spec: {}
        }}
        template={{
          timeout: '<+input>'
        }}
        inputSetData={{
          path: '/abc',
          template: {
            timeout: '<+input>',
            spec: {}
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.DeploymentForm}
      />
    )
    fireEvent.click(getByText('Submit'))
    await waitFor(() => getByText('Errors'))
    expect(container).toMatchSnapshot('K8 delete step error in deploymentform if timeout not present')
  })

  test('form produces correct data for fixed inputs', async () => {
    const onUpdate = jest.fn()
    // (JSX attribute) RefAttributes<Pick<FormikProps<unknown>, "errors" | "submitForm">>.ref?: ((instance: Pick<FormikProps<unknown>, "errors" | "submitForm"> | null) => void) | React.RefObject<Pick<FormikProps<unknown>, "errors" | "submitForm">> | null | undefined
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, queryByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResources: {
              type: 'ReleaseName'
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Test_A',
      name: 'Test A',
      timeout: '12m',
      type: 'K8sDelete',
      spec: {
        deleteResources: {
          type: 'ReleaseName',
          spec: {
            deleteNamespace: false
          }
        }
      }
    })

    //timeout validation on submit
    fireEvent.change(container.querySelector('input[value="12m"]') as HTMLElement, { target: { value: '' } })

    await act(() => ref.current?.submitForm()!)
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResources: {
              type: 'ResourceName',
              spec: {
                resourceNames: ['testABC', 'test123']
              }
            }
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.K8sDelete.name',
                localName: 'step.K8sDelete.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.K8sDelete.timeout',
                localName: 'step.K8sDelete.timeout'
              }
            }
          },
          variablesData: {
            type: 'K8sDelete',
            name: 'step-name',
            identifier: 'Test_A',
            timeout: 'step-timeout',
            spec: {
              deleteResources: {
                type: 'ResourceName',
                spec: {
                  resourceNames: ['testABC', 'test123']
                }
              }
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('Validate timeout is min 10s with resourceNames', () => {
    const data = {
      data: {
        identifier: 'K8sDeleteStepID',
        name: 'K8sDeleteStep',
        spec: {
          deleteResources: {
            type: 'ResourceName',
            spec: {
              resourceNames: ['test1', 'test2']
            }
          }
        },
        type: 'K8sDelete',
        timeout: '1s'
      },
      template: {
        identifier: 'K8sDeleteStepID',
        name: 'K8sDeleteStep',
        type: 'K8sDelete',
        timeout: '1s',
        spec: {
          deleteResources: {
            type: 'ResourceName',
            spec: {
              resourceNames: ['test1', 'test2']
            }
          }
        }
      },
      viewType: StepViewType.DeploymentForm
    }
    const response = new K8sDeleteStep().validateInputSet(data)
    const processFormResponse = new K8sDeleteStep().processFormData(data.data)
    expect(processFormResponse).toMatchSnapshot()
    expect(response).toMatchSnapshot()
  })
  test('Validate timeout is min 10s with manifestPaths', () => {
    const data = {
      data: {
        identifier: 'K8sDeleteStepID',
        name: 'K8sDeleteStep',
        spec: {
          deleteResources: {
            type: 'ManifestPath',
            spec: {
              manifestPaths: ['test1', 'test2']
            }
          }
        },
        type: 'K8sDelete',
        timeout: '1s'
      },
      template: {
        identifier: 'K8sDeleteStepID',
        name: 'K8sDeleteStep',
        type: 'K8sDelete',
        timeout: '1s',
        spec: {
          deleteResources: {
            type: 'ManifestPath',
            spec: {
              manifestPaths: ['test1', 'test2']
            }
          }
        }
      },
      viewType: StepViewType.DeploymentForm
    }
    const response = new K8sDeleteStep().validateInputSet(data)
    const processFormResponse = new K8sDeleteStep().processFormData(data.data)
    expect(processFormResponse).toMatchSnapshot()
    expect(response).toMatchSnapshot()
  })
  test('Validate timeout is min 10s with manifestPaths runtime', () => {
    const data = {
      data: {
        identifier: 'K8sDeleteStepID',
        name: 'K8sDeleteStep',
        spec: {
          deleteResources: {
            type: 'ManifestPath',
            spec: {
              manifestPaths: null
            }
          }
        },
        type: StepType.K8sDelete,
        timeout: '5s'
      },
      template: {
        identifier: 'K8sDeleteStepID',
        name: 'K8sDeleteStep',
        type: StepType.K8sDelete,
        timeout: '<+input>',
        spec: {
          deleteResources: {
            type: 'ManifestPath',
            spec: {
              manifestPaths: '<+input>' as unknown as string[]
            }
          }
        }
      },
      viewType: StepViewType.DeploymentForm
    } as any
    const response = new K8sDeleteStep().validateInputSet(data)
    const processFormResponse = new K8sDeleteStep().processFormData(data.template)
    expect(processFormResponse).toMatchSnapshot()
    expect(response).toMatchSnapshot()
  })
  test('Validate timeout is min 10s with resourceNames as runtime', () => {
    const data = {
      data: {
        identifier: 'K8sDeleteStepID',
        name: 'K8sDeleteStep',
        spec: {
          deleteResources: {
            type: 'ResourceName',
            spec: {
              resourceNames: null
            }
          }
        },
        type: 'K8sDelete',
        timeout: '5s'
      },
      template: {
        identifier: 'K8sDeleteStepID',
        name: 'K8sDeleteStep',
        type: 'K8sDelete',
        timeout: '<+input>',
        spec: {
          deleteResources: {
            type: 'ResourceName',
            spec: {
              resourceNames: '<+input>' as unknown as string[],
              skipDryRun: false
            }
          }
        }
      },
      viewType: StepViewType.TriggerForm
    } as any
    const response = new K8sDeleteStep().validateInputSet(data)
    const processFormResponse = new K8sDeleteStep().processFormData(data.template)
    expect(processFormResponse).toMatchSnapshot()
    expect(response).toMatchSnapshot()
  })
  test('should render null for StepviewType.template', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sDelete} stepViewType={StepViewType.Template} />
    )
    expect(container).toMatchSnapshot()
  })
})
