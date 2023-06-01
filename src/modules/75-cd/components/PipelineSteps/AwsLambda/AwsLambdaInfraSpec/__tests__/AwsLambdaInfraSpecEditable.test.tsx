/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, getByText as getElementByText, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import type { AwsLambdaInfrastructure } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { awsConnectorListResponse } from '@connectors/components/ConnectorReferenceField/__tests__/mocks'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import type { StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { testConnectorRefChange, awsRegions } from './helper'
import { AwsLambdaInfraSpec } from '../AwsLambdaInfraSpec'
import { AwsLambdaInfraSpecEditable } from '../AwsLambdaInfraSpecEditable'

const fetchConnector = jest.fn().mockReturnValue({ data: awsConnectorListResponse.data?.content?.[1] })

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(awsConnectorListResponse)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: awsConnectorListResponse.data?.content?.[1] }, refetch: fetchConnector, loading: false }
  })
}))

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: awsRegions, loading: false }
  })
}))

const allowableTypes = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.RUNTIME,
  MultiTypeInputType.EXPRESSION
] as AllowedTypesWithRunTime[]

const existingInitialValues = {
  connectorRef: 'Aws_Connector_2',
  region: 'us-gov-east-1',
  allowSimultaneousDeployments: true
}

const existingInitialValuesRuntime = {
  connectorRef: RUNTIME_INPUT_VALUE,
  region: RUNTIME_INPUT_VALUE,
  allowSimultaneousDeployments: true
}

const TEST_PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })

const TEST_PATH_PARAMS: ModulePathParams & PipelinePathProps = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

const updateStage = jest.fn()
factory.registerStep(new AwsLambdaInfraSpec())

const doConfigureOptionsTesting = async (cogModal: HTMLElement): Promise<void> => {
  // Type regex and submit
  // check if field has desired value
  await waitFor(() => expect(getElementByText(cogModal, 'common.configureOptions.regex')).toBeInTheDocument())
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  userEvent.click(regexRadio)
  const regexTextArea = queryByNameAttribute('regExValues', cogModal) as HTMLInputElement
  act(() => {
    fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
  })
  await waitFor(() => expect(regexTextArea.value).toBe('<+input>.includes(/test/)'))
  const cogSubmit = getElementByText(cogModal, 'submit')
  userEvent.click(cogSubmit)
}

describe('AwsLambdaInfraSpecEditable tests', () => {
  beforeEach(() => {
    updateStage.mockReset()
  })

  test('check infra tab for existing initial values', async () => {
    const { container, getByTestId, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <AwsLambdaInfraSpecEditable
          initialValues={existingInitialValues}
          allowableTypes={allowableTypes}
          readonly={false}
          onUpdate={updateStage}
        />
      </TestWrapper>
    )

    // Region
    const regionInput = queryByNameAttribute('region', container) as HTMLInputElement
    expect(regionInput.value).toBe('GovCloud (US-East)')

    // Allow simultaneous deployments on the same infrastructure checkbox
    const allowSimultaneousDeploymentsCheckbox = queryByNameAttribute('allowSimultaneousDeployments', container)
    expect(allowSimultaneousDeploymentsCheckbox).toBeChecked()

    // connectorRef
    await waitFor(() => expect(getByText('Aws Connector 2')).toBeInTheDocument())
    const connnectorRefInput = getByTestId(/connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    userEvent.click(connnectorRefInput!)
    await testConnectorRefChange()

    expect(regionInput.value).toBe('GovCloud (US-East)')
  })

  test('check infra tab for all existing Runtime initial values ', async () => {
    const ref = React.createRef<StepFormikRef<AwsLambdaInfrastructure>>()
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <AwsLambdaInfraSpecEditable
          initialValues={existingInitialValuesRuntime}
          allowableTypes={allowableTypes}
          readonly={false}
          onUpdate={updateStage}
        />
      </TestWrapper>
    )

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    // connectorRef
    const connectorInput = queryByNameAttribute('connectorRef', container) as HTMLInputElement
    expect(connectorInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogConnectorRef = document.getElementById('configureOptions_connectorRef')
    userEvent.click(cogConnectorRef!)
    await waitFor(() => expect(modals.length).toBe(1))
    const regionCOGConnectorRef = modals[0] as HTMLElement
    await doConfigureOptionsTesting(regionCOGConnectorRef)
    // region
    const regionInput = queryByNameAttribute('region', container) as HTMLInputElement
    expect(regionInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogRegion = document.getElementById('configureOptions_region')
    userEvent.click(cogRegion!)
    await waitFor(() => expect(modals.length).toBe(1))
    const regionCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(regionCOGModal)
    // Allow simultaneous deployments on the same infrastructure checkbox
    const allowSimultaneousDeploymentsCheckbox = queryByNameAttribute('allowSimultaneousDeployments', container)
    expect(allowSimultaneousDeploymentsCheckbox).toBeChecked()
    // submit form and verify
    ref.current?.submitForm()
    await waitFor(() =>
      expect(updateStage).toHaveBeenCalledWith({
        connectorRef: '<+input>.regex(<+input>.includes(/test/))',
        region: '<+input>.regex(<+input>.includes(/test/))',
        allowSimultaneousDeployments: true
      })
    )
  })
})
