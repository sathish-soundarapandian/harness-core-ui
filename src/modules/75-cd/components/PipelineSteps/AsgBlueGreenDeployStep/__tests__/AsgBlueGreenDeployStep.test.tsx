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
import { AsgBlueGreenDeployStep } from '../AsgBlueGreenDeployStep'
import { elasticLoadBalancersResponse, listenerRulesList, listenersResponse } from './helpers/mocks'

const fetchListeners = jest.fn().mockReturnValue(listenersResponse)
const fetchLoadBalancers = jest.fn(_arg => Promise.resolve(elasticLoadBalancersResponse))
jest.mock('services/cd-ng', () => ({
  useElasticLoadBalancers: jest.fn().mockImplementation(arg => {
    return {
      data: elasticLoadBalancersResponse,
      error: null,
      loading: false,
      refetch: () => fetchLoadBalancers(arg)
    }
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

factory.registerStep(new AsgBlueGreenDeployStep())

const onUpdate = jest.fn()
const onChange = jest.fn()

describe('AsgBlueGreenDeploy tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
    fetchLoadBalancers.mockReset()
  })

  test('Edit view renders fine when Service / Env V2 FF is ON', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText, findByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: true } }}
        initialValues={{}}
        type={StepType.AsgBlueGreenDeploy}
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
    await userEvent.type(nameInput!, 'Step 1')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Step 1'))
    expect(getByText('Step_1')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    await userEvent.clear(timeoutInput!)
    await userEvent.type(timeoutInput!, '30m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('30m'))

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancer', container) as HTMLInputElement
    const loadBalancerDropdownIcon = dropdownIcons[0].parentElement
    await userEvent.click(loadBalancerDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(1))
    const loadBalancerOption1 = await findByText('Load_Balancer_1')
    expect(loadBalancerOption1).toBeInTheDocument()
    await userEvent.click(loadBalancerOption1)
    await waitFor(() => expect(loadBalancerSelect.value).toBe('Load_Balancer_1'))

    const prodListenerSelect = queryByNameAttribute('spec.prodListener', container) as HTMLInputElement
    const prodListenerDropdownIcon = dropdownIcons[1].parentElement
    await userEvent.click(prodListenerDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(2))
    const listenerOption1 = await findByText('HTTP 80')
    expect(listenerOption1).toBeInTheDocument()
    await userEvent.click(listenerOption1)
    await waitFor(() => expect(prodListenerSelect.value).toBe('HTTP 80'))

    const prodListenerRuleSelect = queryByNameAttribute('spec.prodListenerRuleArn', container) as HTMLInputElement
    const prodListenerRuleDropdownIcon = dropdownIcons[2].parentElement
    await userEvent.click(prodListenerRuleDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(3))
    const listenerRuleOption1 = await findByText('Listener_Rule_1')
    expect(listenerRuleOption1).toBeInTheDocument()
    await userEvent.click(listenerRuleOption1)
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe('Listener_Rule_1'))

    const stageListenerSelect = queryByNameAttribute('spec.stageListener', container) as HTMLInputElement
    const stageListenerDropdownIcon = dropdownIcons[3].parentElement
    await userEvent.click(stageListenerDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(4))
    const listenerOption2 = await findByText('HTTP 81')
    expect(listenerOption2).toBeInTheDocument()
    await userEvent.click(listenerOption2)
    await waitFor(() => expect(stageListenerSelect.value).toBe('HTTP 81'))

    const stageListenerRuleSelect = queryByNameAttribute('spec.stageListenerRuleArn', container) as HTMLInputElement
    const stageListenerRuleDropdownIcon = dropdownIcons[4].parentElement
    await userEvent.click(stageListenerRuleDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(5))
    const listenerRuleOption2 = await findByText('Listener_Rule_2')
    expect(listenerRuleOption2).toBeInTheDocument()
    await userEvent.click(listenerRuleOption2)
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
          useAlreadyRunningInstances: false,
          loadBalancer: 'Load_Balancer_1',
          prodListener: 'abc-def-ghi',
          prodListenerRuleArn: 'Listener_Rule_1',
          stageListener: 'abc-ghi-def',
          stageListenerRuleArn: 'Listener_Rule_2'
        },
        type: StepType.AsgBlueGreenDeploy
      })
    )
  })

  test('Edit view - validation errors should appear for required fields', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText, getAllByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: true } }}
        initialValues={{}}
        type={StepType.AsgBlueGreenDeploy}
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
    expect(nameInput).toBeInTheDocument()
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeInTheDocument()
    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancer', container) as HTMLInputElement
    expect(loadBalancerSelect).toBeInTheDocument()
    const prodListenerSelect = queryByNameAttribute('spec.prodListener', container) as HTMLInputElement
    expect(prodListenerSelect).toBeInTheDocument()
    const prodListenerRuleSelect = queryByNameAttribute('spec.prodListenerRuleArn', container) as HTMLInputElement
    expect(prodListenerRuleSelect).toBeInTheDocument()
    const stageListenerSelect = queryByNameAttribute('spec.stageListener', container) as HTMLInputElement
    expect(stageListenerSelect).toBeInTheDocument()
    const stageListenerRuleSelect = queryByNameAttribute('spec.stageListenerRuleArn', container) as HTMLInputElement
    expect(stageListenerRuleSelect).toBeInTheDocument()

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())

    expect(getByText('pipelineSteps.stepNameRequired')).toBeInTheDocument()
    expect(getAllByText('common.validation.fieldIsRequired')).toHaveLength(3)
  })

  test('DeploymentForm view renders fine when Service / Env V2 FF is OFF', async () => {
    const { container, getByText, findByText, debug } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: false } }}
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          spec: {
            loadBalancer: 'Load_Balancer_2',
            prodListener: 'abc-def-ghi',
            prodListenerRuleArn: '',
            stageListener: 'abc-ghi-def',
            stageListenerRuleArn: ''
          },
          type: StepType.AsgBlueGreenDeploy
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
          type: StepType.AsgBlueGreenDeploy
        }}
        type={StepType.AsgBlueGreenDeploy}
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

    await userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(onUpdate).not.toHaveBeenCalled()
    await userEvent.type(timeoutInput!, '20m')

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancer', container) as HTMLInputElement
    const loadBalancerDropdownIcon = dropdownIcons[0].parentElement
    await userEvent.click(loadBalancerDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(1))
    const loadBalancerOption1 = await findByText('Load_Balancer_1')
    expect(loadBalancerOption1).toBeInTheDocument()
    await userEvent.click(loadBalancerOption1)
    await waitFor(() => expect(loadBalancerSelect.value).toBe('Load_Balancer_1'))

    const prodListenerSelect = queryByNameAttribute('spec.prodListener', container) as HTMLInputElement
    const prodListenerRuleSelect = queryByNameAttribute('spec.prodListenerRuleArn', container) as HTMLInputElement
    const prodListenerDropdownIcon = dropdownIcons[1].parentElement
    await userEvent.click(prodListenerDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(2))
    const listenerOption1 = await findByText('HTTP 80')
    expect(listenerOption1).toBeInTheDocument()
    await userEvent.click(listenerOption1)
    await waitFor(() => expect(prodListenerSelect.value).toBe('HTTP 80'))
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe(''))

    const prodListenerRuleDropdownIcon = dropdownIcons[2].parentElement
    await userEvent.click(prodListenerRuleDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(3))
    const listenerRuleOption1 = await findByText('Listener_Rule_1')
    expect(listenerRuleOption1).toBeInTheDocument()
    await userEvent.click(listenerRuleOption1)
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe('Listener_Rule_1'))

    const stageListenerSelect = queryByNameAttribute('spec.stageListener', container) as HTMLInputElement
    const stageListenerRuleSelect = queryByNameAttribute('spec.stageListenerRuleArn', container) as HTMLInputElement
    const stageListenerDropdownIcon = dropdownIcons[3].parentElement
    await userEvent.click(stageListenerDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(4))
    const listenerOption2 = await findByText('HTTP 81')
    expect(listenerOption2).toBeInTheDocument()
    await userEvent.click(listenerOption2)
    await waitFor(() => expect(stageListenerSelect.value).toBe('HTTP 81'))
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe(''))

    const stageListenerRuleDropdownIcon = dropdownIcons[4].parentElement
    await userEvent.click(stageListenerRuleDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(5))
    const listenerRuleOption2 = await findByText('Listener_Rule_2')
    expect(listenerRuleOption2).toBeInTheDocument()
    await userEvent.click(listenerRuleOption2)
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe('Listener_Rule_2'))
    debug(stageListenerRuleSelect)

    await userEvent.click(submitBtn)
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
      type: StepType.AsgBlueGreenDeploy
    })
  })

  test('errors are set properly when stepViewType is DeploymentForm and Service / Env V2 FF is OFF', async () => {
    const { container, getByText, getAllByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: false } }}
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
          type: StepType.AsgBlueGreenDeploy
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
          type: StepType.AsgBlueGreenDeploy
        }}
        type={StepType.AsgBlueGreenDeploy}
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

    await userEvent.click(submitBtn)
    expect(onUpdate).not.toHaveBeenCalled()

    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(getAllByText('common.validation.fieldIsRequired')).toHaveLength(3)

    await userEvent.type(timeoutInput!, '20m')
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
            loadBalancer: 'Load_Balancer_2',
            prodListener: 'abc-ghi-def',
            prodListenerRuleArn: '',
            stageListener: 'abc-def-ghi',
            stageListenerRuleArn: ''
          },
          type: StepType.AsgBlueGreenDeploy
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
          type: StepType.AsgBlueGreenDeploy
        }}
        type={StepType.AsgBlueGreenDeploy}
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
    await userEvent.type(timeoutInput!, '20m')

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancer', container) as HTMLInputElement
    const loadBalancerDropdownIcon = dropdownIcons[0].parentElement
    await userEvent.click(loadBalancerDropdownIcon!)

    await waitFor(() => expect(fetchLoadBalancers).toHaveBeenCalledTimes(1))
    expect(fetchLoadBalancers).toHaveBeenCalledWith({
      debounce: 300,
      lazy: false,
      queryParams: {
        accountIdentifier: undefined,
        awsConnectorRef: undefined,
        envId: 'Env_1',
        infraDefinitionId: 'Infra_Def_1',
        orgIdentifier: undefined,
        projectIdentifier: undefined,
        region: undefined
      }
    })

    await waitFor(() => expect(portalDivs.length).toBe(1))
    const loadBalancerOption1 = await findByText('Load_Balancer_1')
    expect(loadBalancerOption1).toBeInTheDocument()
    await userEvent.click(loadBalancerOption1)
    await waitFor(() => expect(loadBalancerSelect.value).toBe('Load_Balancer_1'))

    const prodListenerSelect = queryByNameAttribute('spec.prodListener', container) as HTMLInputElement
    const prodListenerRuleSelect = queryByNameAttribute('spec.prodListenerRuleArn', container) as HTMLInputElement
    const prodListenerDropdownIcon = dropdownIcons[1].parentElement
    await userEvent.click(prodListenerDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(2))
    const listenerOption1 = await findByText('HTTP 80')
    expect(listenerOption1).toBeInTheDocument()
    await userEvent.click(listenerOption1)
    await waitFor(() => expect(prodListenerSelect.value).toBe('HTTP 80'))
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe(''))

    const prodListenerRuleDropdownIcon = dropdownIcons[2].parentElement
    await userEvent.click(prodListenerRuleDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(3))
    const listenerRuleOption1 = await findByText('Listener_Rule_1')
    expect(listenerRuleOption1).toBeInTheDocument()
    await userEvent.click(listenerRuleOption1)
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe('Listener_Rule_1'))

    const stageListenerSelect = queryByNameAttribute('spec.stageListener', container) as HTMLInputElement
    const stageListenerRuleSelect = queryByNameAttribute('spec.stageListenerRuleArn', container) as HTMLInputElement
    const stageListenerDropdownIcon = dropdownIcons[3].parentElement
    await userEvent.click(stageListenerDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(4))
    const listenerOption2 = await findByText('HTTP 81')
    expect(listenerOption2).toBeInTheDocument()
    await userEvent.click(listenerOption2)
    await waitFor(() => expect(stageListenerSelect.value).toBe('HTTP 81'))
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe(''))

    const stageListenerRuleDropdownIcon = dropdownIcons[4].parentElement
    await userEvent.click(stageListenerRuleDropdownIcon!)
    await waitFor(() => expect(portalDivs.length).toBe(5))
    const listenerRuleOption2 = await findByText('Listener_Rule_2')
    expect(listenerRuleOption2).toBeInTheDocument()
    await userEvent.click(listenerRuleOption2)
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe('Listener_Rule_2'))

    await userEvent.click(submitBtn)
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
      type: StepType.AsgBlueGreenDeploy
    })
  })

  test('InputSet view - validation errors should appear for required fields', async () => {
    const { container, getByText, getAllByText } = render(
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
          type: StepType.AsgBlueGreenDeploy
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
          type: StepType.AsgBlueGreenDeploy
        }}
        type={StepType.AsgBlueGreenDeploy}
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

    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeInTheDocument()
    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancer', container) as HTMLInputElement
    expect(loadBalancerSelect).toBeInTheDocument()
    const prodListenerSelect = queryByNameAttribute('spec.prodListener', container) as HTMLInputElement
    expect(prodListenerSelect).toBeInTheDocument()
    const prodListenerRuleSelect = queryByNameAttribute('spec.prodListenerRuleArn', container) as HTMLInputElement
    expect(prodListenerRuleSelect).toBeInTheDocument()
    const stageListenerSelect = queryByNameAttribute('spec.stageListener', container) as HTMLInputElement
    expect(stageListenerSelect).toBeInTheDocument()
    const stageListenerRuleSelect = queryByNameAttribute('spec.stageListenerRuleArn', container) as HTMLInputElement
    expect(stageListenerRuleSelect).toBeInTheDocument()

    const submitBtn = getByText('Submit')
    await userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(getAllByText('common.validation.fieldIsRequired')).toHaveLength(3)
  })

  test('it should make load balancers API call in runtime view when Env and Infra are marked as Runtime inputs in pipeline', async () => {
    const initialValues = {
      stages: [
        {
          stage: {
            identifier: 'Stage_1',
            name: 'Stage',
            spec: {
              service: {
                serviceRef: 'Service_1'
              },
              environment: {
                environmentRef: 'Asg_Env_1',
                infrastructureDefinitions: [{ identifier: 'Asg_Infra_1' }]
              },
              execution: {
                steps: [
                  {
                    step: {
                      identifier: 'Step_1',
                      name: 'Step 1',
                      timeout: '10m',
                      spec: {
                        useAlreadyRunningInstances: false,
                        loadBalancer: 'Load_Balancer_2',
                        prodListener: 'abc-ghi-def',
                        prodListenerRuleArn: '',
                        stageListener: 'abc-def-ghi',
                        stageListenerRuleArn: ''
                      },
                      type: StepType.AsgBlueGreenDeploy
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
    const { container, findByText } = render(
      <TestStepWidget
        testWrapperProps={{ defaultFeatureFlagValues: { NG_SVC_ENV_REDESIGN: true } }}
        initialValues={initialValues}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '10m',
          spec: {
            useAlreadyRunningInstances: RUNTIME_INPUT_VALUE,
            loadBalancer: RUNTIME_INPUT_VALUE,
            prodListener: RUNTIME_INPUT_VALUE,
            prodListenerRuleArn: RUNTIME_INPUT_VALUE,
            stageListener: RUNTIME_INPUT_VALUE,
            stageListenerRuleArn: RUNTIME_INPUT_VALUE
          },
          type: StepType.AsgBlueGreenDeploy
        }}
        type={StepType.AsgBlueGreenDeploy}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        customStepProps={{
          stageIdentifier: 'Stage_1',
          selectedStage: {
            stage: {
              spec: {
                environment: {
                  environmentRef: RUNTIME_INPUT_VALUE,
                  infrastructureDefinitions: [
                    {
                      identifier: RUNTIME_INPUT_VALUE
                    }
                  ]
                }
              }
            }
          }
        }}
      />
    )

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancer', container) as HTMLInputElement
    const loadBalancerDropdownIcon = dropdownIcons[0].parentElement
    await userEvent.click(loadBalancerDropdownIcon!)

    await waitFor(() => expect(fetchLoadBalancers).toHaveBeenCalledTimes(1))
    expect(fetchLoadBalancers).toHaveBeenCalledWith({
      debounce: 300,
      lazy: false,
      queryParams: {
        accountIdentifier: undefined,
        awsConnectorRef: undefined,
        envId: 'Asg_Env_1',
        infraDefinitionId: 'Asg_Infra_1',
        orgIdentifier: undefined,
        projectIdentifier: undefined,
        region: undefined
      }
    })

    await waitFor(() => expect(portalDivs.length).toBe(1))
    const loadBalancerOption1 = await findByText('Load_Balancer_1')
    expect(loadBalancerOption1).toBeInTheDocument()
    await userEvent.click(loadBalancerOption1)
    await waitFor(() => expect(loadBalancerSelect.value).toBe('Load_Balancer_1'))
  })
})
