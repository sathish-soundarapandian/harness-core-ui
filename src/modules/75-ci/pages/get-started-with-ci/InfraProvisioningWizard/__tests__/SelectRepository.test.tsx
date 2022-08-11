/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { GetDataError } from 'restful-react'
import { render, act, fireEvent } from '@testing-library/react'
import type { Failure } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { InfraProvisioningWizard } from '../InfraProvisioningWizard'
import { getFullRepoName, InfraProvisiongWizardStepId } from '../Constants'
import { repos } from '../mocks/repositories'

jest.mock('services/pipeline-ng', () => ({
  createPipelineV2Promise: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: {
        identifier: 'Default_Pipeline'
      }
    })
  ),
  useCreateTrigger: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS'
    })
  )
}))

const updateConnector = jest.fn()
const createConnector = jest.fn()
const cancelRepositoriesFetch = jest.fn()
let repoFetchError: GetDataError<Failure | Error> | null = null
jest.mock('services/cd-ng', () => ({
  useProvisionResourcesForCI: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS'
    })
  ),
  useCreateDefaultScmConnector: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS'
    })
  ),
  useGetListOfAllReposByRefConnector: jest.fn().mockImplementation(() => {
    return {
      data: { data: repos, status: 'SUCCESS' },
      refetch: jest.fn(),
      error: repoFetchError,
      loading: false,
      cancel: cancelRepositoriesFetch
    }
  }),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector }))
}))

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateGroupByIdentifier: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return {
      data: {
        resource: {
          activelyConnected: false
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

const pathParams = { accountId: 'accountId', orgIdentifier: 'orgId', projectIdentifier: 'projectId' }

describe('Test SelectRepository component', () => {
  test('Initial render', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectRepository} />
      </TestWrapper>
    )
    const createPipelineBtn = getByText('ci.getStartedWithCI.createPipeline')
    await act(async () => {
      fireEvent.click(createPipelineBtn)
    })
    // Schema validation error should show up for if Repository is not selected
    const repositoryValidationError = container.querySelector(
      'div[class*="FormError--errorDiv"][data-name="repository"]'
    )
    expect(repositoryValidationError).toBeInTheDocument()
    expect(getByText('common.getStarted.plsChoose')).toBeTruthy()
    const testRepoName = getFullRepoName(repos[1])
    const testRepository = getByText(testRepoName)
    expect(testRepository).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(testRepository)
    })
    expect(repositoryValidationError).not.toBeInTheDocument()

    const repositorySearch = container.querySelector(
      'input[placeholder="common.getStarted.searchRepo"]'
    ) as HTMLInputElement
    expect(repositorySearch).toBeTruthy()
    await act(async () => {
      fireEvent.change(repositorySearch!, { target: { value: testRepoName } })
    })
    expect(getByText(testRepoName)).toBeInTheDocument()
  })

  const routesToPipelineStudio = jest.spyOn(routes, 'toPipelineStudio')
  test('Should not create a pipeline if a repository is selected and user clicks on next without successful Test connection', async () => {
    const { getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectRepository} />
      </TestWrapper>
    )
    const testRepoName = getFullRepoName(repos[1])
    const testRepository = getByText(testRepoName)
    expect(testRepository).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(testRepository)
    })
    const createPipelineBtn = getByText('ci.getStartedWithCI.createPipeline')
    await act(async () => {
      fireEvent.click(createPipelineBtn)
    })
    expect(routesToPipelineStudio).not.toHaveBeenCalled()
  })

  test('Should show error for api failure', async () => {
    repoFetchError = {
      message: 'Failed to fetch',
      data: { responseMessages: [{ level: 'ERROR', message: 'Failed to fetch' }] } as any,
      status: 502
    }
    const { getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectRepository} />
      </TestWrapper>
    )
    expect(getByText('Failed to fetch')).toBeInTheDocument()
    expect(routesToPipelineStudio).not.toHaveBeenCalled()
  })

  test('Should show Clone codebase switch on by default', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.SelectRepository} />
      </TestWrapper>
    )

    const cloneCodebaseToggle = container.querySelector('input[data-id="enable-clone-codebase-switch"]') as HTMLElement
    expect(cloneCodebaseToggle).toBeChecked()
    fireEvent.click(cloneCodebaseToggle)
    expect(cloneCodebaseToggle).not.toBeChecked()
    expect(cancelRepositoriesFetch).toBeCalled()
    const calloutElement = getByText('ci.getStartedWithCI.createPipelineWithOtherOption')
    expect(calloutElement).toBeInTheDocument()
  })
})
