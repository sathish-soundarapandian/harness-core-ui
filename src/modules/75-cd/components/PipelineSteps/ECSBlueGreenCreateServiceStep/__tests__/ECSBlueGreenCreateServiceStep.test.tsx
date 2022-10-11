/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { queryByNameAttribute } from '@common/utils/testUtils'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ECSBlueGreenCreateServiceStep } from '../ECSBlueGreenCreateServiceStep'
import { elasticLoadBalancersResponse, listenerRulesList, listenersResponse } from './helpers/mocks'

const fetchListeners = jest.fn().mockReturnValue(listenersResponse)
jest.mock('services/cd-ng', () => ({
  useElasticLoadBalancers: jest.fn().mockImplementation(() => {
    return { data: elasticLoadBalancersResponse, error: null, loading: false }
  }),
  useListeners: jest.fn().mockImplementation(() => {
    return { data: listenersResponse, refetch: fetchListeners, error: null, loading: false }
  }),
  listenerRulesPromise: jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      resolve({ data: listenerRulesList, error: null, loading: false })
    })
  })
}))

factory.registerStep(new ECSBlueGreenCreateServiceStep())

const existingInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  timeout: '20m',
  type: StepType.EcsBlueGreenCreateService
}
const onUpdate = jest.fn()
const onChange = jest.fn()

describe('ECSRollingDeployStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })

  test('Edit view renders fine when Service / Env V2 FF is OFF', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText, findByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.EcsBlueGreenCreateService}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
        customStepProps={{
          selectedStage: {
            stage: {
              spec: {
                infrastructure: {
                  environmentRef: 'Env_1',
                  infrastructureDefinition: {
                    spec: {
                      connectorRef: 'testConnRef',
                      region: 'region1'
                    }
                  }
                }
              }
            }
          }
        }}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    userEvent.type(nameInput!, 'Step 1')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Step 1'))
    expect(getByText('Step_1')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '30m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('30m'))

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)

    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancer', container) as HTMLInputElement
    const loadBalancerDropdownIcon = dropdownIcons[0].parentElement
    userEvent.click(loadBalancerDropdownIcon!)
    const loadBalancerOption1 = await findByText('Load_Balancer_1')
    expect(loadBalancerOption1).toBeInTheDocument()
    userEvent.click(loadBalancerOption1)
    await waitFor(() => expect(loadBalancerSelect.value).toBe('Load_Balancer_1'))

    const prodListenerSelect = queryByNameAttribute('spec.prodListener', container) as HTMLInputElement
    const prodListenerDropdownIcon = dropdownIcons[1].parentElement
    userEvent.click(prodListenerDropdownIcon!)
    const listenerOption1 = await findByText('HTTP 80')
    expect(listenerOption1).toBeInTheDocument()
    userEvent.click(listenerOption1)
    await waitFor(() => expect(prodListenerSelect.value).toBe('HTTP 80'))

    const prodListenerRuleSelect = queryByNameAttribute('spec.prodListenerRuleArn', container) as HTMLInputElement
    const prodListenerRuleDropdownIcon = dropdownIcons[2].parentElement
    userEvent.click(prodListenerRuleDropdownIcon!)
    const listenerRuleOption1 = await findByText('Listener_Rule_1')
    expect(listenerRuleOption1).toBeInTheDocument()
    userEvent.click(listenerRuleOption1)
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe('Listener_Rule_1'))

    const stageListenerSelect = queryByNameAttribute('spec.stageListener', container) as HTMLInputElement
    const stageListenerDropdownIcon = dropdownIcons[3].parentElement
    userEvent.click(stageListenerDropdownIcon!)
    const listenerOption2 = await findByText('HTTP 81')
    expect(listenerOption2).toBeInTheDocument()
    userEvent.click(listenerOption2)
    await waitFor(() => expect(stageListenerSelect.value).toBe('HTTP 81'))

    const stageListenerRuleSelect = queryByNameAttribute('spec.stageListenerRuleArn', container) as HTMLInputElement
    const stageListenerRuleDropdownIcon = dropdownIcons[4].parentElement
    userEvent.click(stageListenerRuleDropdownIcon!)
    const listenerRuleOption2 = await findByText('Listener_Rule_2')
    expect(listenerRuleOption2).toBeInTheDocument()
    userEvent.click(listenerRuleOption2)
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe('Listener_Rule_2'))

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '30m',
        spec: {
          loadBalancer: 'Load_Balancer_1',
          prodListener: 'abc-def-ghi',
          prodListenerRuleArn: 'Listener_Rule_1',
          stageListener: 'abc-ghi-def',
          stageListenerRuleArn: 'Listener_Rule_2'
        },
        type: StepType.EcsBlueGreenCreateService
      })
    )
  })

  test('Edit view renders fine when Service / Env V2 FF is ON', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText, findByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.EcsBlueGreenCreateService}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
        customStepProps={{
          selectedStage: {
            stage: {
              spec: {
                environment: {
                  environmentRef: 'Env_1',
                  infrastructureDefinitions: [
                    {
                      identifier: 'Infra_Def_1'
                    }
                  ]
                }
              }
            }
          }
        }}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    userEvent.type(nameInput!, 'Step 1')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Step 1'))
    expect(getByText('Step_1')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '30m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('30m'))

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)

    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancer', container) as HTMLInputElement
    const loadBalancerDropdownIcon = dropdownIcons[0].parentElement
    userEvent.click(loadBalancerDropdownIcon!)
    const loadBalancerOption1 = await findByText('Load_Balancer_1')
    expect(loadBalancerOption1).toBeInTheDocument()
    userEvent.click(loadBalancerOption1)
    await waitFor(() => expect(loadBalancerSelect.value).toBe('Load_Balancer_1'))

    const prodListenerSelect = queryByNameAttribute('spec.prodListener', container) as HTMLInputElement
    const prodListenerDropdownIcon = dropdownIcons[1].parentElement
    userEvent.click(prodListenerDropdownIcon!)
    const listenerOption1 = await findByText('HTTP 80')
    expect(listenerOption1).toBeInTheDocument()
    userEvent.click(listenerOption1)
    await waitFor(() => expect(prodListenerSelect.value).toBe('HTTP 80'))

    const prodListenerRuleSelect = queryByNameAttribute('spec.prodListenerRuleArn', container) as HTMLInputElement
    const prodListenerRuleDropdownIcon = dropdownIcons[2].parentElement
    userEvent.click(prodListenerRuleDropdownIcon!)
    const listenerRuleOption1 = await findByText('Listener_Rule_1')
    expect(listenerRuleOption1).toBeInTheDocument()
    userEvent.click(listenerRuleOption1)
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe('Listener_Rule_1'))

    const stageListenerSelect = queryByNameAttribute('spec.stageListener', container) as HTMLInputElement
    const stageListenerDropdownIcon = dropdownIcons[3].parentElement
    userEvent.click(stageListenerDropdownIcon!)
    const listenerOption2 = await findByText('HTTP 81')
    expect(listenerOption2).toBeInTheDocument()
    userEvent.click(listenerOption2)
    await waitFor(() => expect(stageListenerSelect.value).toBe('HTTP 81'))

    const stageListenerRuleSelect = queryByNameAttribute('spec.stageListenerRuleArn', container) as HTMLInputElement
    const stageListenerRuleDropdownIcon = dropdownIcons[4].parentElement
    userEvent.click(stageListenerRuleDropdownIcon!)
    const listenerRuleOption2 = await findByText('Listener_Rule_2')
    expect(listenerRuleOption2).toBeInTheDocument()
    userEvent.click(listenerRuleOption2)
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe('Listener_Rule_2'))

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '30m',
        spec: {
          loadBalancer: 'Load_Balancer_1',
          prodListener: 'abc-def-ghi',
          prodListenerRuleArn: 'Listener_Rule_1',
          stageListener: 'abc-ghi-def',
          stageListenerRuleArn: 'Listener_Rule_2'
        },
        type: StepType.EcsBlueGreenCreateService
      })
    )
  })

  test('DeploymentForm view renders fine when Service / Env V2 FF is OFF', async () => {
    const { container, getByText, findByText, debug } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          spec: {
            loadBalancer: '',
            prodListener: '',
            prodListenerRuleArn: '',
            stageListener: '',
            stageListenerRuleArn: ''
          },
          type: StepType.EcsBlueGreenCreateService
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            loadBalancer: RUNTIME_INPUT_VALUE,
            prodListener: RUNTIME_INPUT_VALUE,
            prodListenerRuleArn: RUNTIME_INPUT_VALUE,
            stageListener: RUNTIME_INPUT_VALUE,
            stageListenerRuleArn: RUNTIME_INPUT_VALUE
          },
          type: StepType.EcsBlueGreenCreateService
        }}
        type={StepType.EcsBlueGreenCreateService}
        stepViewType={StepViewType.DeploymentForm}
        onUpdate={onUpdate}
        customStepProps={{
          selectedStage: {
            stage: {
              spec: {
                infrastructure: {
                  environmentRef: 'Env_1',
                  infrastructureDefinition: {
                    spec: {
                      connectorRef: 'testConnRef',
                      region: 'region1'
                    }
                  }
                }
              }
            }
          }
        }}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()

    userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(onUpdate).not.toHaveBeenCalled()
    userEvent.type(timeoutInput!, '20m')

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)

    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancer', container) as HTMLInputElement
    const loadBalancerDropdownIcon = dropdownIcons[0].parentElement
    userEvent.click(loadBalancerDropdownIcon!)
    const loadBalancerOption1 = await findByText('Load_Balancer_1')
    expect(loadBalancerOption1).toBeInTheDocument()
    userEvent.click(loadBalancerOption1)
    await waitFor(() => expect(loadBalancerSelect.value).toBe('Load_Balancer_1'))

    const prodListenerSelect = queryByNameAttribute('spec.prodListener', container) as HTMLInputElement
    const prodListenerRuleSelect = queryByNameAttribute('spec.prodListenerRuleArn', container) as HTMLInputElement
    const prodListenerDropdownIcon = dropdownIcons[1].parentElement
    userEvent.click(prodListenerDropdownIcon!)
    const listenerOption1 = await findByText('HTTP 80')
    expect(listenerOption1).toBeInTheDocument()
    userEvent.click(listenerOption1)
    await waitFor(() => expect(prodListenerSelect.value).toBe('HTTP 80'))
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe(''))

    const prodListenerRuleDropdownIcon = dropdownIcons[2].parentElement
    userEvent.click(prodListenerRuleDropdownIcon!)
    const listenerRuleOption1 = await findByText('Listener_Rule_1')
    expect(listenerRuleOption1).toBeInTheDocument()
    userEvent.click(listenerRuleOption1)
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe('Listener_Rule_1'))

    const stageListenerSelect = queryByNameAttribute('spec.stageListener', container) as HTMLInputElement
    const stageListenerRuleSelect = queryByNameAttribute('spec.stageListenerRuleArn', container) as HTMLInputElement
    const stageListenerDropdownIcon = dropdownIcons[3].parentElement
    userEvent.click(stageListenerDropdownIcon!)
    const listenerOption2 = await findByText('HTTP 81')
    expect(listenerOption2).toBeInTheDocument()
    userEvent.click(listenerOption2)
    await waitFor(() => expect(stageListenerSelect.value).toBe('HTTP 81'))
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe(''))

    const stageListenerRuleDropdownIcon = dropdownIcons[4].parentElement
    userEvent.click(stageListenerRuleDropdownIcon!)
    const listenerRuleOption2 = await findByText('Listener_Rule_2')
    expect(listenerRuleOption2).toBeInTheDocument()
    userEvent.click(listenerRuleOption2)
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe('Listener_Rule_2'))
    debug(stageListenerRuleSelect)

    userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_1',
      name: 'Step 1',
      timeout: '20m',
      spec: {
        loadBalancer: 'Load_Balancer_1',
        prodListener: 'abc-def-ghi',
        prodListenerRuleArn: 'Listener_Rule_1',
        stageListener: 'abc-ghi-def',
        stageListenerRuleArn: 'Listener_Rule_2'
      },
      type: StepType.EcsBlueGreenCreateService
    })
  })

  test('InputSet view renders fine when Service / Env V2 FF is ON', async () => {
    const { container, getByText, findByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: true } }}
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          spec: {
            loadBalancer: '',
            prodListener: '',
            prodListenerRuleArn: '',
            stageListener: '',
            stageListenerRuleArn: ''
          },
          type: StepType.EcsBlueGreenCreateService
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            loadBalancer: RUNTIME_INPUT_VALUE,
            prodListener: RUNTIME_INPUT_VALUE,
            prodListenerRuleArn: RUNTIME_INPUT_VALUE,
            stageListener: RUNTIME_INPUT_VALUE,
            stageListenerRuleArn: RUNTIME_INPUT_VALUE
          },
          type: StepType.EcsBlueGreenCreateService
        }}
        type={StepType.EcsBlueGreenCreateService}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        customStepProps={{
          selectedStage: {
            stage: {
              spec: {
                environment: {
                  environmentRef: 'Env_1',
                  infrastructureDefinitions: [
                    {
                      identifier: 'Infra_Def_1'
                    }
                  ]
                }
              }
            }
          }
        }}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    userEvent.type(timeoutInput!, '20m')

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)

    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancer', container) as HTMLInputElement
    const loadBalancerDropdownIcon = dropdownIcons[0].parentElement
    userEvent.click(loadBalancerDropdownIcon!)
    const loadBalancerOption1 = await findByText('Load_Balancer_1')
    expect(loadBalancerOption1).toBeInTheDocument()
    userEvent.click(loadBalancerOption1)
    await waitFor(() => expect(loadBalancerSelect.value).toBe('Load_Balancer_1'))

    const prodListenerSelect = queryByNameAttribute('spec.prodListener', container) as HTMLInputElement
    const prodListenerRuleSelect = queryByNameAttribute('spec.prodListenerRuleArn', container) as HTMLInputElement
    const prodListenerDropdownIcon = dropdownIcons[1].parentElement
    userEvent.click(prodListenerDropdownIcon!)
    const listenerOption1 = await findByText('HTTP 80')
    expect(listenerOption1).toBeInTheDocument()
    userEvent.click(listenerOption1)
    await waitFor(() => expect(prodListenerSelect.value).toBe('HTTP 80'))
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe(''))

    const prodListenerRuleDropdownIcon = dropdownIcons[2].parentElement
    userEvent.click(prodListenerRuleDropdownIcon!)
    const listenerRuleOption1 = await findByText('Listener_Rule_1')
    expect(listenerRuleOption1).toBeInTheDocument()
    userEvent.click(listenerRuleOption1)
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe('Listener_Rule_1'))

    const stageListenerSelect = queryByNameAttribute('spec.stageListener', container) as HTMLInputElement
    const stageListenerRuleSelect = queryByNameAttribute('spec.stageListenerRuleArn', container) as HTMLInputElement
    const stageListenerDropdownIcon = dropdownIcons[3].parentElement
    userEvent.click(stageListenerDropdownIcon!)
    const listenerOption2 = await findByText('HTTP 81')
    expect(listenerOption2).toBeInTheDocument()
    userEvent.click(listenerOption2)
    await waitFor(() => expect(stageListenerSelect.value).toBe('HTTP 81'))
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe(''))

    const stageListenerRuleDropdownIcon = dropdownIcons[4].parentElement
    userEvent.click(stageListenerRuleDropdownIcon!)
    const listenerRuleOption2 = await findByText('Listener_Rule_2')
    expect(listenerRuleOption2).toBeInTheDocument()
    userEvent.click(listenerRuleOption2)
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe('Listener_Rule_2'))

    userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_1',
      name: 'Step 1',

      timeout: '20m',
      spec: {
        loadBalancer: 'Load_Balancer_1',
        prodListener: 'abc-def-ghi',
        prodListenerRuleArn: 'Listener_Rule_1',
        stageListener: 'abc-ghi-def',
        stageListenerRuleArn: 'Listener_Rule_2'
      },
      type: StepType.EcsBlueGreenCreateService
    })
  })

  test('Variables view renders fine', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.EcsBlueGreenCreateService}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'Step 1': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.EcsBlueGreenCreateService.name',
                localName: 'step.EcsBlueGreenCreateService.name'
              }
            },
            '20m': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.EcsBlueGreenCreateService.timeout',
                localName: 'step.EcsBlueGreenCreateService.timeout'
              }
            }
          }
        }}
      />
    )

    expect(getByText('name')).toBeVisible()
    expect(getByText('timeout')).toBeVisible()
    expect(getByText('Step 1')).toBeVisible()
    expect(getByText('20m')).toBeVisible()
  })
})
