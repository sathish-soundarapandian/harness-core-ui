/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ECSBlueGreenCreateServiceStepEditRef } from '../ECSBlueGreenCreateServiceStepEdit'
import type {
  ECSBlueGreenCreateServiceCustomStepProps,
  ECSBlueGreenCreateServiceStepInitialValues
} from '../ECSBlueGreenCreateServiceStep'
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

const emptyInitialValues: ECSBlueGreenCreateServiceStepInitialValues = {
  identifier: '',
  name: '',
  timeout: '',
  type: StepType.EcsBlueGreenCreateService,
  spec: {
    loadBalancer: '',
    prodListener: '',
    prodListenerRuleArn: '',
    stageListener: '',
    stageListenerRuleArn: ''
  }
}
const existingInitialValues: ECSBlueGreenCreateServiceStepInitialValues = {
  identifier: 'Existing_Name',
  name: 'Existing Name',
  timeout: '30m',
  type: StepType.EcsBlueGreenCreateService,
  spec: {
    loadBalancer: 'Load_Balancer_3',
    prodListener: 'abc-ghi-def',
    prodListenerRuleArn: 'Listener_Rule_2',
    stageListener: 'abc-def-ghi',
    stageListenerRuleArn: 'Listener_Rule_3'
  }
}
const customStepProps: ECSBlueGreenCreateServiceCustomStepProps = {
  stageIdentifier: 'Stage_1',
  selectedStage: {
    stage: {
      identifier: 'Stage_1',
      name: 'Stage 1',
      spec: {
        infrastructure: {
          environmentRef: 'Env_1',
          infrastructureDefinition: {
            type: 'ECS',
            spec: {
              connectorRef: 'testConnRef',
              region: 'region1'
            }
          }
        },
        execution: {
          steps: []
        }
      }
    }
  },
  variablesData: existingInitialValues,
  metadataMap: {
    'Step 1': {
      yamlProperties: {
        fqn: 'pipeline.stages.Stage_1.execution.steps.EcsBlueGreenCreateService.name',
        localName: 'step.EcsBlueGreenCreateService.name'
      }
    },
    '20m': {
      yamlProperties: {
        fqn: 'pipeline.stages.Stage_1.execution.steps.EcsBlueGreenCreateService.timeout',
        localName: 'step.EcsBlueGreenCreateService.timeout'
      }
    }
  }
}
const onUpdate = jest.fn()
const onChange = jest.fn()
const formikRef = React.createRef<StepFormikRef<ECSBlueGreenCreateServiceStepInitialValues>>()

describe('GenericExecutionStepEdit tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test(`renders fine for empty values and values can be changed`, async () => {
    const { container, findByText } = render(
      <TestWrapper>
        <ECSBlueGreenCreateServiceStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
          customStepProps={customStepProps}
        />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).toBeInTheDocument()

    const nameInput = queryByNameAttribute('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('')
    act((): void => {
      fireEvent.change(nameInput, { target: { value: 'Test Name' } })
    })
    expect(nameInput.value).toBe('Test Name')
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        identifier: 'Test_Name',
        name: 'Test Name',
        timeout: '',
        type: StepType.EcsBlueGreenCreateService,
        spec: {
          loadBalancer: '',
          prodListener: '',
          prodListenerRuleArn: '',
          stageListener: '',
          stageListenerRuleArn: ''
        }
      })
    )

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    act(() => {
      fireEvent.change(timeoutInput, { target: { value: '20m' } })
    })
    expect(timeoutInput.value).toBe('20m')

    const dropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropdownIcons.length).toBe(5)

    const loadBalancerSelect = queryByNameAttribute('spec.loadBalancer') as HTMLInputElement
    const loadBalancerDropdownIcon = dropdownIcons[0].parentElement
    userEvent.click(loadBalancerDropdownIcon!)
    const loadBalancerOption1 = await findByText('Load_Balancer_1')
    expect(loadBalancerOption1).toBeInTheDocument()
    userEvent.click(loadBalancerOption1)
    await waitFor(() => expect(loadBalancerSelect.value).toBe('Load_Balancer_1'))

    const prodListenerSelect = queryByNameAttribute('spec.prodListener') as HTMLInputElement
    const prodListenerDropdownIcon = dropdownIcons[1].parentElement
    userEvent.click(prodListenerDropdownIcon!)
    const listenerOption1 = await findByText('HTTP 80')
    expect(listenerOption1).toBeInTheDocument()
    userEvent.click(listenerOption1)
    await waitFor(() => expect(prodListenerSelect.value).toBe('HTTP 80'))

    const prodListenerRuleSelect = queryByNameAttribute('spec.prodListenerRuleArn') as HTMLInputElement
    const prodListenerRuleDropdownIcon = dropdownIcons[2].parentElement
    userEvent.click(prodListenerRuleDropdownIcon!)
    const listenerRuleOption1 = await findByText('Listener_Rule_1')
    expect(listenerRuleOption1).toBeInTheDocument()
    userEvent.click(listenerRuleOption1)
    await waitFor(() => expect(prodListenerRuleSelect.value).toBe('Listener_Rule_1'))

    const stageListenerSelect = queryByNameAttribute('spec.stageListener') as HTMLInputElement
    const stageListenerDropdownIcon = dropdownIcons[3].parentElement
    userEvent.click(stageListenerDropdownIcon!)
    const listenerOption2 = await findByText('HTTP 81')
    expect(listenerOption2).toBeInTheDocument()
    userEvent.click(listenerOption2)
    await waitFor(() => expect(stageListenerSelect.value).toBe('HTTP 81'))

    const stageListenerRuleSelect = queryByNameAttribute('spec.stageListenerRuleArn') as HTMLInputElement
    const stageListenerRuleDropdownIcon = dropdownIcons[4].parentElement
    userEvent.click(stageListenerRuleDropdownIcon!)
    const listenerRuleOption2 = await findByText('Listener_Rule_2')
    expect(listenerRuleOption2).toBeInTheDocument()
    userEvent.click(listenerRuleOption2)
    await waitFor(() => expect(stageListenerRuleSelect.value).toBe('Listener_Rule_2'))

    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Test_Name',
        name: 'Test Name',
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
    )
  })

  test('identifier should not be editable when isNewStep is false', () => {
    const { container } = render(
      <TestWrapper>
        <ECSBlueGreenCreateServiceStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
          customStepProps={customStepProps}
        />
      </TestWrapper>
    )
    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()
  })

  test('onUpdate should not be called if it is not passed as prop', async () => {
    render(
      <TestWrapper>
        <ECSBlueGreenCreateServiceStepEditRef
          initialValues={existingInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onChange={onChange}
          ref={formikRef}
          customStepProps={customStepProps}
        />
      </TestWrapper>
    )
    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())
  })
})
