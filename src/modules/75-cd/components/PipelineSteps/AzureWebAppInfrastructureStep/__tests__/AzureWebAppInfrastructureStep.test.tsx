/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, render, waitFor } from '@testing-library/react'
import { MultiTypeInputType, MultiTypeInputValue, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { AzureWebAppInfrastructure } from 'services/cd-ng'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { AzureWebAppInfrastructureSpec } from '../AzureWebAppInfrastructureStep'
import { connectorsResponse, connectorResponse, subscriptionsResponse, resourceGroupsResponse } from './mocks'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const getInvalidYaml = (): string => `p ipe<>line:
sta ges:
   - st<>[]age:
              s pe<> c: <> sad-~`

const getYaml = (): string => `pipeline:
    stages:
        - stage:
              spec:
                  infrastructure:
                      infrastructureDefinition:
                          type: AzureWebApp
                          spec:
                              connectorRef: account.connectorRef
                              subscriptionId: subscriptionId
                              resourceGroup: resourceGroup
                              `

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => connectorResponse),
  useGetAzureSubscriptions: jest.fn(() => subscriptionsResponse),
  useGetAzureResourceGroupsBySubscription: jest.fn(() => resourceGroupsResponse),
  getConnectorListV2Promise: jest.fn(() => Promise.resolve(connectorsResponse.data)),
  getAzureSubscriptionsPromise: jest.fn(() => Promise.resolve(subscriptionsResponse.data)),
  getAzureResourceGroupsBySubscriptionPromise: jest.fn(() => Promise.resolve(resourceGroupsResponse.data)),
  useGetAzureResourceGroupsV2: jest.fn(() => Promise.resolve(resourceGroupsResponse.data))
}))

const getInitialValues = (): AzureWebAppInfrastructure => ({
  connectorRef: 'connectorRef',
  subscriptionId: 'subscriptionId',
  resourceGroup: 'resourceGroup'
})

const getRuntimeInputsValues = (): AzureWebAppInfrastructure => ({
  connectorRef: RUNTIME_INPUT_VALUE,
  subscriptionId: RUNTIME_INPUT_VALUE,
  resourceGroup: RUNTIME_INPUT_VALUE
})

const getParams = () => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})
jest.mock('@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField', () => ({
  ...(jest.requireActual('@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField') as any),
  // eslint-disable-next-line react/display-name
  FormMultiTypeConnectorField: (props: any) => {
    return (
      <div>
        <button
          name={'changeFormMultiTypeConnectorField'}
          onClick={() => {
            props.onChange('value', MultiTypeInputValue.STRING, MultiTypeInputType.RUNTIME)
          }}
        >
          Form Multi Type Connector Field button
        </button>
      </div>
    )
  }
}))

const connectorRefPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.connectorRef'
const subscriptionPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.subscriptionId'
const resourceGroupPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.resourceGroup'

describe('Test Azure WebApp Infrastructure Spec snapshot', () => {
  beforeEach(() => {
    factory.registerStep(new AzureWebAppInfrastructureSpec())
  })

  test('Should render edit view with empty initial values', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.AzureWebApp} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render edit view with values', () => {
    const { container } = render(
      <TestStepWidget initialValues={getInitialValues()} type={StepType.AzureWebApp} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('Should render edit view with runtime values', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getRuntimeInputsValues()}
        type={StepType.AzureWebApp}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('Should render edit view for inputset view and fetch dropdowns on focus', async () => {
    const { container, getByPlaceholderText } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.AzureWebApp}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()

    const subscriptionInput = getByPlaceholderText('cd.steps.azureInfraStep.subscriptionPlaceholder') as HTMLElement
    subscriptionInput.focus()
    await waitFor(() => expect(subscriptionsResponse.refetch).toHaveBeenCalled())

    const resourceGroupInput = getByPlaceholderText('cd.steps.azureInfraStep.resourceGroupPlaceholder') as HTMLElement
    resourceGroupInput.focus()
    await waitFor(() => expect(resourceGroupsResponse.refetch).toHaveBeenCalled())
  })

  test('Should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.AzureWebApp}
        stepViewType={StepViewType.InputVariable}
      />
    )

    expect(container).toMatchSnapshot()
  })
})

describe('Test Azure Infrastructure Spec behavior', () => {
  beforeEach(() => {
    factory.registerStep(new AzureWebAppInfrastructureSpec())
  })

  test('Should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container, findByText } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.AzureWebApp}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdateHandler}
      />
    )

    const button = await waitFor(() => findByText('Form Multi Type Connector Field button'))
    act(() => {
      fireEvent.click(button)
    })

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })
    expect(onUpdateHandler).toHaveBeenCalledWith(getInitialValues())
  })
  test('Should call onUpdate if valid values entered - edit view', async () => {
    const onUpdateHandler = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { getByPlaceholderText } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getInitialValues()}
        allValues={getInitialValues()}
        type={StepType.AzureWebApp}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdateHandler}
        ref={ref}
      />
    )

    const subscriptionInput = getByPlaceholderText('cd.steps.azureInfraStep.subscriptionPlaceholder') as HTMLElement
    expect(subscriptionInput).not.toBeDisabled()
    fireEvent.change(subscriptionInput!, { target: { label: 's1', value: 'subscription1' } })
    const resourceGroupInput = getByPlaceholderText('cd.steps.azureInfraStep.resourceGroupPlaceholder') as HTMLElement
    fireEvent.change(resourceGroupInput!, { target: { value: 'rg1' } })

    await waitFor(() => expect(onUpdateHandler).toHaveBeenCalled())
  })
})

describe('Test Azure Infrastructure Spec autocomplete', () => {
  test('Test connector autocomplete', async () => {
    const step = new AzureWebAppInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getConnectorsListForYaml(connectorRefPath, getYaml(), getParams())
    expect(list).toHaveLength(1)
    expect(list[0].insertText).toBe('azuretestconnector')

    list = await step.getConnectorsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    list = await step.getConnectorsListForYaml(connectorRefPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })

  test('Test subscription names autocomplete', async () => {
    const step = new AzureWebAppInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getSubscriptionListForYaml(subscriptionPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('12d2db62-5aa9-471d-84bb-faa489b3e319')

    list = await step.getSubscriptionListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    list = await step.getSubscriptionListForYaml(subscriptionPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })

  test('Test resource groups names autocomplete', async () => {
    const step = new AzureWebAppInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getResourceGroupListForYaml(resourceGroupPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('NetworkWatcherRG')

    list = await step.getResourceGroupListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    list = await step.getResourceGroupListForYaml(resourceGroupPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })
})
