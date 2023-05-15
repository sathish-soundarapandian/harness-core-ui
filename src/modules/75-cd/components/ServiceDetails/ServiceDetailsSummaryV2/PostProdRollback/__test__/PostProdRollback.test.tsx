/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getAllByText, getByText, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import routes from '@common/RouteDefinitions'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import * as cdng from 'services/cd-ng'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import PostProdRollbackDrawer from '../ServiceDetailPostProdRollback'
import {
  envGroupResponse,
  singleEnvResponse,
  successRollbackValidation,
  successfullRollabackTrigger,
  invalidRollbackValidation
} from './mocks'

export const findDrawerContainer = (): HTMLElement | null => document.querySelector('.bp3-drawer')

const getModuleParams = (module = 'cd') => ({
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module
})

const TEST_PATH = routes.toDeployments({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

const envId = 'TestEnv'
const envGroup = 'TestEnvGroup'
const setDrawerOpen = jest.fn()

jest.mock('services/cd-ng', () => ({
  useGetActiveInstanceGroupedByEnvironment: jest.fn().mockImplementation(() => {
    return { data: singleEnvResponse, refetch: jest.fn(), loading: false, error: false }
  }),
  checkIfInstanceCanBeRolledBackPromise: jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      resolve({ data: successRollbackValidation.data, refetch: jest.fn(), error: null, loading: false })
    })
  }),
  triggerRollbackPromise: jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      resolve({ data: successfullRollabackTrigger.data, refetch: jest.fn(), error: null, loading: false })
    })
  })
}))

const configurations = (): void => {
  beforeEach(() => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDC_SERVICE_DASHBOARD_REVAMP_NG: true,
      POST_PROD_ROLLBACK: true
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  beforeAll(() => {
    jest.spyOn(global.Date, 'now').mockReturnValue(1603645966706)
  })
  afterAll(() => {
    jest.spyOn(global.Date, 'now').mockReset()
  })
}

const renderPostProdDrawer = (entityId: string, isEnvGroup: boolean): HTMLElement | null => {
  render(
    <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
      <PostProdRollbackDrawer
        drawerOpen={true}
        entityId={entityId}
        isEnvGroup={isEnvGroup}
        setDrawerOpen={setDrawerOpen}
        entityName={entityId}
      />
    </TestWrapper>
  )

  return findDrawerContainer()
}

const matchListOfTextOnDocument = (container: HTMLElement, listOfText: string[]): void => {
  listOfText.forEach(text => expect(getByText(container, text)).toBeInTheDocument())
}

describe('PostProdRollback - ', () => {
  configurations()
  test('should match content on single env and verify content on confirmation dialog', async () => {
    const postProdRollbackDrawer = renderPostProdDrawer(envId, false)

    const textToMatch = [
      'environment: TestEnv', //Drawer header
      //column headers
      'cd.infra',
      'cd.serviceDashboard.artifact',
      'cd.serviceDashboard.headers.instances',
      'executionsText',
      'cd.serviceDashboard.headers.rollbackStatus',
      'cd.serviceDashboard.lastDeployment',
      //table content
      'infra',
      'artifactTestPerl',
      'pipeline.executionStatus.NotStarted',
      'k8sTestPipeline_multi',
      //rolback warning text
      'cd.serviceDashboard.postProdRollback.rollbackWarningText'
    ]

    matchListOfTextOnDocument(postProdRollbackDrawer!, textToMatch)

    const rollbackBtn = postProdRollbackDrawer?.querySelector('#rollbackBtn')
    expect(rollbackBtn).toHaveAttribute('disabled')
    expect(postProdRollbackDrawer?.querySelector('#cancelBtn')).toBeTruthy()
    expect(postProdRollbackDrawer?.querySelectorAll('.TableV2--body [role="row"]').length).toBe(3)

    await userEvent.click(postProdRollbackDrawer?.querySelectorAll('.TableV2--body [role="row"]')[0]!)
    expect(rollbackBtn).not.toHaveAttribute('disabled')

    //should open confirmation dialog
    await userEvent.click(rollbackBtn!)
    const confirmationDialog = findDialogContainer()

    //match dailog content
    const dialogContent = [
      'cd.serviceDashboard.postProdRollback.rollbackConfirmationTitle',
      'cd.serviceDashboard.postProdRollback.rollbackConfirmationText',
      'infra',
      '(artifactTestPerl)'
    ]

    matchListOfTextOnDocument(confirmationDialog!, dialogContent)
    await userEvent.click(getByText(confirmationDialog!, 'cancel'))

    await userEvent.click(postProdRollbackDrawer?.querySelector('span[icon="cross"]')!)
  })

  test('should match content on env group and trigger a valid rollback', async () => {
    jest.spyOn(cdng, 'useGetActiveInstanceGroupedByEnvironment').mockImplementation(() => {
      return { data: envGroupResponse, refetch: jest.fn(), loading: false, error: false } as any
    })

    const postProdRollbackDrawer = renderPostProdDrawer(envGroup, true)

    const textToMatch = ['common.environmentGroup.label: TestEnvGroup', 'TestEnvGroup', 'testArtifactslim']
    expect(getAllByText(postProdRollbackDrawer!, 'pipeline.executionStatus.Started').length).toBe(2)

    matchListOfTextOnDocument(postProdRollbackDrawer!, textToMatch)

    const rollbackBtn = postProdRollbackDrawer?.querySelector('#rollbackBtn')
    const cancelBtn = postProdRollbackDrawer?.querySelector('#cancelBtn')
    expect(rollbackBtn).toHaveAttribute('disabled')
    expect(postProdRollbackDrawer?.querySelectorAll('.TableV2--body [role="row"]').length).toBe(2)

    //try row select-deselect
    await userEvent.click(postProdRollbackDrawer?.querySelectorAll('.TableV2--body [role="row"]')[0]!)
    expect(rollbackBtn).not.toHaveAttribute('disabled')
    await userEvent.click(postProdRollbackDrawer?.querySelectorAll('.TableV2--body [role="row"]')[0]!)
    expect(rollbackBtn).toHaveAttribute('disabled')
    await userEvent.click(postProdRollbackDrawer?.querySelectorAll('.TableV2--body [role="row"]')[0]!)
    expect(rollbackBtn).not.toHaveAttribute('disabled')

    //should open confirmation dialog
    await userEvent.click(rollbackBtn!)
    const confirmationDialog = findDialogContainer()
    expect(confirmationDialog).toBeTruthy()

    await userEvent.click(getByText(confirmationDialog!, 'confirm'))
    await waitFor(() => expect(cdng.checkIfInstanceCanBeRolledBackPromise).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(cdng.triggerRollbackPromise).toHaveBeenCalledTimes(1))

    await userEvent.click(cancelBtn!)
  })

  test('test that rollback trigger should not happen if validation fails', async () => {
    jest.spyOn(cdng, 'checkIfInstanceCanBeRolledBackPromise').mockImplementation(() => {
      return new Promise(resolve => {
        resolve({ data: invalidRollbackValidation.data })
      })
    })
    const postProdRollbackDrawer = renderPostProdDrawer(envGroup, true)

    const rollbackBtn = postProdRollbackDrawer?.querySelector('#rollbackBtn')
    await userEvent.click(postProdRollbackDrawer?.querySelectorAll('.TableV2--body [role="row"]')[0]!)

    //should open confirmation dialog
    await userEvent.click(rollbackBtn!)
    const confirmationDialog = findDialogContainer()
    expect(confirmationDialog).toBeTruthy()

    await userEvent.click(getByText(confirmationDialog!, 'confirm'))
    await waitFor(() => expect(cdng.checkIfInstanceCanBeRolledBackPromise).toHaveBeenCalledTimes(1))

    //test that its not triggering rollback after the invalid validation
    await waitFor(() => expect(cdng.triggerRollbackPromise).not.toHaveBeenCalledTimes(1))
  })

  test('test navigation to pipline execution with or without stage info', async () => {
    window.open = jest.fn()
    jest.spyOn(cdng, 'checkIfInstanceCanBeRolledBackPromise').mockImplementation(() => {
      return new Promise(resolve => {
        resolve({ data: invalidRollbackValidation.data })
      })
    })
    const postProdRollbackDrawer = renderPostProdDrawer(envGroup, true)

    //pipeline execution click navigation with stageId and stageExecId present
    await userEvent.click(getByText(postProdRollbackDrawer!, 'k8sTestPipeline_envGroup'))
    expect(window.open).toHaveBeenCalledTimes(1)
    expect(window.open).toHaveBeenCalledWith(
      'http://localhost/#/account/accountId/cd/orgs/orgIdentifier/projects/projectIdentifier/pipelines/k8sTestPipeline_envGroup/deployments/testplanexec/pipeline?stage=teststageid&stageExecId=teststagenoe'
    )

    //pipeline execution click navigation without stageId and stageExecId present
    await userEvent.click(getByText(postProdRollbackDrawer!, 'k8sTestPipeline_Group'))
    expect(window.open).toHaveBeenCalledWith(
      'http://localhost/#/account/accountId/cd/orgs/orgIdentifier/projects/projectIdentifier/pipelines/k8sTestPipeline_Group/deployments/testplan/pipeline'
    )
  })
})

describe('PostProdRollback - empty, loading, error states - ', () => {
  configurations()
  test('should render empty state', async () => {
    jest.spyOn(cdng, 'useGetActiveInstanceGroupedByEnvironment').mockImplementation(() => {
      return { data: [], refetch: jest.fn(), loading: false, error: false } as any
    })

    const postProdRollbackDrawer = renderPostProdDrawer(envGroup, true)

    const emptyStateTextMatch = [
      'cd.serviceDashboard.postProdRollback.rollbackTitle',
      'common.environmentGroup.label: TestEnvGroup',
      'cd.serviceDashboard.postProdRollback.emptyStateMsg'
    ]

    matchListOfTextOnDocument(postProdRollbackDrawer!, emptyStateTextMatch)

    const refreshIcon = postProdRollbackDrawer?.querySelector('[data-icon="refresh"]')
    expect(refreshIcon).toBeTruthy()
    await userEvent.click(refreshIcon!)

    matchListOfTextOnDocument(postProdRollbackDrawer!, emptyStateTextMatch)
  })
  test('should render error state', async () => {
    jest.spyOn(cdng, 'useGetActiveInstanceGroupedByEnvironment').mockImplementation(() => {
      return {
        data: [],
        refetch: jest.fn(),
        loading: false,
        error: {
          message: 'failed to fetch'
        }
      } as any
    })

    const postProdRollbackDrawer = renderPostProdDrawer(envGroup, true)

    const errorStateText = [
      'cd.serviceDashboard.postProdRollback.rollbackTitle',
      'common.environmentGroup.label: TestEnvGroup',
      'failed to fetch'
    ]

    matchListOfTextOnDocument(postProdRollbackDrawer!, errorStateText)

    const retry = postProdRollbackDrawer?.querySelector('button[aria-label="Retry"]')
    expect(retry).toBeTruthy()
    await userEvent.click(retry!)

    matchListOfTextOnDocument(postProdRollbackDrawer!, errorStateText)
  })
  test('should render loading state', () => {
    jest.spyOn(cdng, 'useGetActiveInstanceGroupedByEnvironment').mockImplementation(() => {
      return { data: [], refetch: jest.fn(), loading: true, error: null } as any
    })

    const postProdRollbackDrawer = renderPostProdDrawer(envGroup, true)
    expect(postProdRollbackDrawer?.querySelector('[data-icon="spinner"]')).toBeTruthy()
  })
})
