/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText as getElementByText, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import routes from '@common/RouteDefinitions'
import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import type { StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { testConnectorRefChangeForGcp } from './helper'
import { GoogleCloudFunctionInfraSpecEditable } from '../GoogleCloudFunctionInfraSpecEditable'
import { gcfTypeRegions, gcpConnectorListResponse, gcpProjectListResponse } from './mocks'
import { GoogleCloudFunctionInfraSpec, GoogleCloudFunctionInfrastructure } from '../GoogleCloudFunctionInfraSpec'

const fetchConnector = jest.fn().mockReturnValue({ data: gcpConnectorListResponse.data?.content?.[1] })

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: () => Promise.resolve(gcpConnectorListResponse),
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(gcpConnectorListResponse)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: gcpConnectorListResponse.data?.content?.[1] }, refetch: fetchConnector, loading: false }
  }),
  useGetRegionsForGoogleArtifactRegistry: jest.fn().mockImplementation(() => {
    return { data: gcfTypeRegions, loading: false }
  }),
  useGetProjects: jest.fn().mockImplementation(() => {
    return {
      loading: false,
      mutate: jest.fn().mockImplementation(() => {
        return Promise.resolve(gcpProjectListResponse)
      })
    }
  })
}))

const allowableTypes = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.RUNTIME,
  MultiTypeInputType.EXPRESSION
] as AllowedTypesWithRunTime[]

const existingInitialValues = {
  project: 'qa-target',
  connectorRef: 'gcpConnector2',
  region: 'asia-south2',
  allowSimultaneousDeployments: true
}

const existingInitialValuesRuntime = {
  connectorRef: RUNTIME_INPUT_VALUE,
  project: RUNTIME_INPUT_VALUE,
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
factory.registerStep(new GoogleCloudFunctionInfraSpec())

const doConfigureOptionsTesting = async (cogModal: HTMLElement): Promise<void> => {
  // Type regex and submit
  // check if field has desired value
  await waitFor(() => expect(getElementByText(cogModal, 'common.configureOptions.regex')).toBeInTheDocument())
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  userEvent.click(regexRadio)
  const regexTextArea = queryByNameAttribute('regExValues', cogModal) as HTMLInputElement
  fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
  await waitFor(() => expect(regexTextArea.value).toBe('<+input>.includes(/test/)'))
  const cogSubmit = getElementByText(cogModal, 'submit')
  userEvent.click(cogSubmit)
}

describe('GoogleCloudFunctionInfraSpecEditable tests', () => {
  beforeEach(() => {
    updateStage.mockReset()
  })

  test('check infra tab for existing initial values', async () => {
    const { container, getByTestId, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <GoogleCloudFunctionInfraSpecEditable
          initialValues={existingInitialValues}
          allowableTypes={allowableTypes}
          readonly={false}
          onUpdate={updateStage}
        />
      </TestWrapper>
    )

    // Region
    const regionInput = queryByNameAttribute('region', container) as HTMLInputElement
    expect(regionInput.value).toBe('asia-south2')

    // Project
    const projectInput = queryByNameAttribute('project', container) as HTMLInputElement
    expect(projectInput.value).toBe('qa-target')

    // Allow simultaneous deployments on the same infrastructure checkbox
    const allowSimultaneousDeploymentsCheckbox = queryByNameAttribute('allowSimultaneousDeployments', container)
    expect(allowSimultaneousDeploymentsCheckbox).toBeChecked()

    // connectorRef
    await waitFor(() => expect(getByText('gcpConnector2')).toBeInTheDocument())
    const connnectorRefInput = getByTestId(/connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    userEvent.click(connnectorRefInput!)
    await testConnectorRefChangeForGcp()

    expect(regionInput.value).toBe('asia-south2')
    // Project resets after connector change
    expect(projectInput.value).toBe('')
  })

  test('check infra tab for all existing Runtime initial values ', async () => {
    const ref = React.createRef<StepFormikRef<GoogleCloudFunctionInfrastructure>>()
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS as unknown as Record<string, string>}>
        <GoogleCloudFunctionInfraSpecEditable
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

    // project
    const projectInput = queryByNameAttribute('project', container) as HTMLInputElement
    expect(projectInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogProject = document.getElementById('configureOptions_project')
    userEvent.click(cogProject!)
    await waitFor(() => expect(modals.length).toBe(1))
    const projectCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(projectCOGModal)

    // Allow simultaneous deployments on the same infrastructure checkbox
    const allowSimultaneousDeploymentsCheckbox = queryByNameAttribute('allowSimultaneousDeployments', container)
    expect(allowSimultaneousDeploymentsCheckbox).toBeChecked()

    // submit form and verify
    ref.current?.submitForm()
    await waitFor(() =>
      expect(updateStage).toHaveBeenCalledWith({
        connectorRef: '<+input>.regex(<+input>.includes(/test/))',
        region: '<+input>.regex(<+input>.includes(/test/))',
        project: '<+input>.regex(<+input>.includes(/test/))',
        allowSimultaneousDeployments: true
      })
    )
  })
})
