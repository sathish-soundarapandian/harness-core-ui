/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, findByText, getByText as getElementByText, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import routes from '@common/RouteDefinitions'
import { queryByNameAttribute } from '@common/utils/testUtils'
import { accountPathProps, inputSetFormPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import type { InputSetPathProps, ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { GoogleCloudFunctionInfraSpec } from '../GoogleCloudFunctionInfraSpec'
import { gcfTypeRegions, gcpConnectorListResponse, gcpProjectListResponse } from './mocks'

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

const existingInitialValues = {
  connectorRef: 'gcpConnector2',
  project: 'qa-target',
  region: 'asia-south2'
}

const template = {
  connectorRef: RUNTIME_INPUT_VALUE,
  region: RUNTIME_INPUT_VALUE,
  project: RUNTIME_INPUT_VALUE
}

const TEST_PATH = routes.toInputSetForm({ ...accountPathProps, ...inputSetFormPathProps, ...pipelineModuleParams })

const TEST_PATH_PARAMS: ModulePathParams & PipelinePathProps & InputSetPathProps = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd',
  inputSetIdentifier: 'testInputSet'
}

const onUpdate = jest.fn()
factory.registerStep(new GoogleCloudFunctionInfraSpec())

describe('GoogleCloudFunctionInfraSpecInputForm tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
  })

  test('use existing values to render infra fields and change values', async () => {
    const { getByTestId, container, getByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={existingInitialValues}
        allValues={existingInitialValues}
        readonly={false}
        onUpdate={onUpdate}
        type={StepType.GoogleCloudFunctionsInfra}
        stepViewType={StepViewType.InputSet}
        template={template}
        customStepProps={{
          environmentRef: 'Env_1',
          infrastructureRef: 'Infra_Def_1'
        }}
      />
    )

    const submitBtn = getByText('Submit')
    const allDropDownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    // Check initial existing values
    const regionInput = queryByNameAttribute('region', container) as HTMLInputElement
    expect(regionInput.value).toBe('asia-south2')

    // Choose connectorRef
    const connnectorRefInput = getByTestId(/connectorRef/)
    expect(connnectorRefInput).toBeTruthy()
    act(() => {
      userEvent.click(connnectorRefInput!)
    })
    const dialogs = document.getElementsByClassName('bp3-dialog')
    await waitFor(() => expect(dialogs).toHaveLength(1))
    const connectorSelectorDialog = dialogs[0] as HTMLElement

    const gcpConnector1 = await findByText(connectorSelectorDialog, 'gcpConnector2')
    await waitFor(() => expect(gcpConnector1).toBeInTheDocument())
    const awgcpConnector2 = await findByText(connectorSelectorDialog, 'gcpConnector')
    expect(awgcpConnector2).toBeTruthy()
    userEvent.click(awgcpConnector2)
    const applySelected = getElementByText(connectorSelectorDialog, 'entityReference.apply')
    userEvent.click(applySelected)

    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))

    // Choose project
    const regionDropdownIcon = allDropDownIcons[1]
    await userEvent.click(regionDropdownIcon!)
    expect(portalDivs.length).toBe(2)
    const projectDropdownPortalDiv = portalDivs[1]
    const projectSelectListMenu = projectDropdownPortalDiv.querySelector('.bp3-menu')
    const projectOption = await findByText(projectSelectListMenu as HTMLElement, 'qa-target')
    expect(projectOption).not.toBeNull()
    userEvent.click(projectOption)

    const propjectInput = queryByNameAttribute('project', container)
    expect(propjectInput).toBeVisible()

    // Choose region
    const projectDropdownIcon = allDropDownIcons[2]
    await userEvent.click(projectDropdownIcon!)
    expect(portalDivs.length).toBe(3)
    const regionDropdownPortalDiv = portalDivs[2]
    const regionSelectListMenu = regionDropdownPortalDiv.querySelector('.bp3-menu')
    const regionOption = await findByText(regionSelectListMenu as HTMLElement, 'asia-south2')
    expect(regionOption).not.toBeNull()
    userEvent.click(regionOption)

    // submit form and verify
    userEvent.click(submitBtn)
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        connectorRef: 'gcpConnector',
        project: 'qa-target',
        region: 'asia-south2'
      })
    )
  })

  test('when path prop is passed', async () => {
    const { container } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={existingInitialValues}
        allValues={existingInitialValues}
        readonly={false}
        onUpdate={onUpdate}
        type={StepType.GoogleCloudFunctionsInfra}
        stepViewType={StepViewType.InputSet}
        template={template}
        path={'stage.spec.infrastructure.infraDefinition.spec'}
        customStepProps={{
          environmentRef: 'Env_1',
          infrastructureRef: 'Infra_Def_1'
        }}
      />
    )

    const regionInput = queryByNameAttribute('stage.spec.infrastructure.infraDefinition.spec.region', container)
    expect(regionInput).toBeInTheDocument()
  })

  test('click on submit without filling values and check if errors appear under each field', async () => {
    const initialValues = {
      connectorRef: '',
      project: '',
      region: ''
    }
    const { container, getByText, getAllByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initialValues}
        allValues={initialValues}
        readonly={false}
        onUpdate={onUpdate}
        type={StepType.GoogleCloudFunctionsInfra}
        stepViewType={StepViewType.InputSet}
        template={template}
        customStepProps={{
          environmentRef: 'Env_1',
          infrastructureRef: 'Infra_Def_1'
        }}
      />
    )

    const submitBtn = getByText('Submit')

    const regionInput = queryByNameAttribute('region', container)
    expect(regionInput).toBeInTheDocument()
    const projectInput = queryByNameAttribute('project', container)
    expect(projectInput).toBeInTheDocument()
    userEvent.click(submitBtn)
    await waitFor(() => expect(getAllByText('fieldRequired')).toHaveLength(2))
  })

  test('when template prop is not passed, no fields should be rendered and no errors should appear on Submit', async () => {
    const initialValues = {
      connectorRef: '',
      region: ''
    }
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initialValues}
        allValues={initialValues}
        readonly={false}
        onUpdate={onUpdate}
        type={StepType.GoogleCloudFunctionsInfra}
        stepViewType={StepViewType.InputSet}
        customStepProps={{
          environmentRef: 'Env_1',
          infrastructureRef: 'Infra_Def_1'
        }}
      />
    )

    const submitBtn = getByText('Submit')

    const regionInput = queryByNameAttribute('region', container)
    expect(regionInput).not.toBeInTheDocument()

    const projectInput = queryByNameAttribute('project', container)
    expect(projectInput).not.toBeInTheDocument()
    userEvent.click(submitBtn)

    expect(queryByText('fieldRequired')).toBeNull()
    expect(queryByText('common.validation.fieldIsRequired')).toBeNull()
  })
})
