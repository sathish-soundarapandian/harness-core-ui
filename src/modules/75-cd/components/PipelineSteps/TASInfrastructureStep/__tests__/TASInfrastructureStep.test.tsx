/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByText, render, waitFor } from '@testing-library/react'
import { MultiTypeInputType, MultiTypeInputValue, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { TanzuApplicationServiceInfrastructure } from 'services/cd-ng'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { TASInfrastructureSpec } from '../TASInfrastructureStep'
import { connectorsResponse, connectorResponse, organizationsResponse, spacesResponse } from './mocks'

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
                          type: TAS
                          spec:
                              connectorRef: account.connectorRef
                              organization: organization
                              space: space
                              `

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => connectorResponse),
  useGetTasOrganizations: jest.fn(() => organizationsResponse),
  useGetTasSpaces: jest.fn(() => spacesResponse),

  getConnectorListV2Promise: jest.fn(() => Promise.resolve(connectorsResponse.data)),

  getTasOrganizationsPromise: jest.fn(() => Promise.resolve(organizationsResponse.data)),
  getTasSpacesPromise: jest.fn(() => Promise.resolve(spacesResponse.data)),
  useGetTasSpacesV2: jest.fn(() => Promise.resolve(spacesResponse.data))
}))

const getInitialValues = (): TanzuApplicationServiceInfrastructure => ({
  connectorRef: 'connectorRef',
  organization: 'organization',
  space: 'space'
})

const getRuntimeInputsValues = (): TanzuApplicationServiceInfrastructure => ({
  connectorRef: RUNTIME_INPUT_VALUE,
  organization: RUNTIME_INPUT_VALUE,
  space: RUNTIME_INPUT_VALUE
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
const organizationPath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.organization'
const spacePath = 'pipeline.stages.0.stage.spec.infrastructure.infrastructureDefinition.spec.space'

describe('Test TAS WebApp Infrastructure Spec snapshot', () => {
  beforeEach(() => {
    factory.registerStep(new TASInfrastructureSpec())
  })

  test('Should render edit view with empty initial values', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.TasInfra} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render edit view with values', () => {
    const { container } = render(
      <TestStepWidget initialValues={getInitialValues()} type={StepType.TasInfra} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('Should render edit view with runtime values', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getRuntimeInputsValues()}
        type={StepType.TasInfra}
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
        type={StepType.TasInfra}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()

    const organizationInput = getByPlaceholderText('cd.steps.tasInfra.organizationPlaceholder') as HTMLElement
    organizationInput.focus()
    await waitFor(() => expect(organizationsResponse.refetch).toHaveBeenCalled())

    const spaceInput = getByPlaceholderText('cd.steps.tasInfra.spacePlaceholder') as HTMLElement
    spaceInput.focus()
    await waitFor(() => expect(spacesResponse.refetch).toHaveBeenCalled())
  })

  test('Should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.TasInfra}
        stepViewType={StepViewType.InputVariable}
      />
    )

    expect(container).toMatchSnapshot()
  })
})

describe('Test TAS Infrastructure Spec behavior', () => {
  beforeEach(() => {
    factory.registerStep(new TASInfrastructureSpec())
  })

  test('Should call onUpdate if valid values entered - inputset', async () => {
    const onUpdateHandler = jest.fn()
    const { container, findByText } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getRuntimeInputsValues()}
        allValues={getInitialValues()}
        type={StepType.TasInfra}
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
        type={StepType.TasInfra}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdateHandler}
        ref={ref}
      />
    )

    const organizationInput = getByPlaceholderText('cd.steps.tasInfra.organizationPlaceholder') as HTMLElement
    expect(organizationInput).not.toBeDisabled()
    fireEvent.change(organizationInput!, { target: { label: 'system', value: 'system' } })
    const spaceInput = getByPlaceholderText('cd.steps.tasInfra.spacePlaceholder') as HTMLElement
    fireEvent.change(spaceInput!, { target: { value: 'system' } })

    await waitFor(() => expect(onUpdateHandler).toHaveBeenCalled())
  })
})

describe('Test TAS Infrastructure Spec autocomplete', () => {
  test('Test connector autocomplete', async () => {
    const step = new TASInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getConnectorsListForYaml(connectorRefPath, getYaml(), getParams())
    expect(list).toHaveLength(1)
    expect(list[0].insertText).toBe('TAS_Connector_Test')

    list = await step.getConnectorsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    list = await step.getConnectorsListForYaml(connectorRefPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })

  test('Test organization names autocomplete', async () => {
    const step = new TASInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getOrganisationListForYaml(organizationPath, getYaml(), getParams())
    expect(list).toHaveLength(3)
    expect(list[0].insertText).toBe('system')

    list = await step.getOrganisationListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    list = await step.getOrganisationListForYaml(organizationPath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })

  test('Test resource groups names autocomplete', async () => {
    const step = new TASInfrastructureSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getSpaceGroupListForYaml(spacePath, getYaml(), getParams())
    expect(list).toHaveLength(4)
    expect(list[0].insertText).toBe('system')

    list = await step.getSpaceGroupListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    list = await step.getSpaceGroupListForYaml(spacePath, getInvalidYaml(), getParams())
    expect(list).toHaveLength(0)
  })
})
