/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RenderResult, getByText, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import routes from '@common/RouteDefinitions'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import * as cdng from 'services/cd-ng'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import { successRollbackValidation, successfullRollabackTrigger, invalidRollbackValidation } from './mocks'
import PostProdRollbackBtn, { PostProdRollbackBtnProps } from '../PostProdRollbackButton'

export const findDrawerContainer = (): HTMLElement | null => document.querySelector('.bp3-drawer')

const getModuleParams = (module = 'cd') => ({
  accountId: 'accountId',
  orgIdentifier: 'orgIdentifier',
  projectIdentifier: 'projectIdentifier',
  module
})

const TEST_PATH = routes.toDeployments({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

jest.mock('services/cd-ng', () => ({
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

const postProdRollbackBtnProps: PostProdRollbackBtnProps = {
  artifactName: 'testartifact',
  infraName: 'testInfra',
  count: 2,
  infrastructureMappingId: 'testinframappingid',
  instanceKey: 'testinstancekey',
  lastDeployedAt: 1682526891980,
  pipelineId: 'testpipelineId',
  planExecutionId: 'testplanexecid',
  rollbackStatus: 'NOT_STARTED',
  stageNodeExecutionId: 'testStageNodeId',
  stageSetupId: 'teststageid'
}

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
const matchListOfTextOnDocument = (container: HTMLElement, listOfText: string[]): void => {
  listOfText.forEach(text => expect(getByText(container, text)).toBeInTheDocument())
}

const renderPPRollbackBtn = (propOverride?: Partial<PostProdRollbackBtnProps>): RenderResult =>
  render(
    <TestWrapper path={TEST_PATH} pathParams={getModuleParams()}>
      <PostProdRollbackBtn {...postProdRollbackBtnProps} {...propOverride} />
    </TestWrapper>
  )

const rollbackDisableStatuses: PostProdRollbackBtnProps['rollbackStatus'][] = [
  'FAILURE',
  'STARTED',
  'SUCCESS',
  undefined
]

describe('PostProdRollbackBtn tests - ', () => {
  configurations()
  test('should validate if the button is enabled and validate content on confirmation dailog', async () => {
    const { container } = renderPPRollbackBtn()
    userEvent.click(container.querySelector('button[id="rollbackBtn"]') as HTMLButtonElement)
    const confirmationDialog = findDialogContainer()

    //match dailog content
    const dialogContent = [
      'cd.serviceDashboard.postProdRollback.rollbackConfirmationTitle',
      'cd.serviceDashboard.postProdRollback.rollbackConfirmationText',
      'testInfra',
      '(testartifact)'
    ]

    matchListOfTextOnDocument(confirmationDialog!, dialogContent)
    userEvent.click(getByText(confirmationDialog!, 'cancel'))

    //confirmationDialog closed
    await waitFor(() => expect(screen.queryByText('(testartifact)')).not.toBeInTheDocument())
  })

  test('should trigger a valid rollback and validate new tab navigation to rollback execution', async () => {
    window.open = jest.fn()
    const { container } = renderPPRollbackBtn()
    userEvent.click(container.querySelector('button[id="rollbackBtn"]') as HTMLButtonElement)
    const confirmationDialog = findDialogContainer()
    expect(confirmationDialog).toBeTruthy()

    userEvent.click(getByText(confirmationDialog!, 'confirm'))
    await waitFor(() => expect(cdng.checkIfInstanceCanBeRolledBackPromise).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(cdng.triggerRollbackPromise).toHaveBeenCalledTimes(1))

    //once rollback is triggered it will take us to rollback execution in a new tab
    expect(window.open).toHaveBeenCalledTimes(1)
    expect(window.open).toHaveBeenCalledWith(
      'http://localhost/#/account/accountId/cd/orgs/orgIdentifier/projects/projectIdentifier/pipelines/testpipelineId/deployments/k8sTestPipeline_envGroup/pipeline'
    )
  })

  test('test that rollback trigger should not happen if validation fails', async () => {
    jest.spyOn(cdng, 'checkIfInstanceCanBeRolledBackPromise').mockImplementation(() => {
      return new Promise(resolve => {
        resolve({ data: invalidRollbackValidation.data })
      })
    })
    const { container } = renderPPRollbackBtn({ rollbackStatus: 'UNAVAILABLE' })
    userEvent.click(container.querySelector('button[id="rollbackBtn"]') as HTMLButtonElement)
    const confirmationDialog = findDialogContainer()
    expect(confirmationDialog).toBeTruthy()

    userEvent.click(getByText(confirmationDialog!, 'confirm'))
    await waitFor(() => expect(cdng.checkIfInstanceCanBeRolledBackPromise).toHaveBeenCalledTimes(1))

    //test that its not triggering rollback after the invalid validation
    await waitFor(() => expect(cdng.triggerRollbackPromise).toHaveBeenCalledTimes(0))
  })

  //check if rollback button is disabled
  rollbackDisableStatuses.forEach(status =>
    test(`check if pp rollback button is disabled for rollback status as ${status}`, () => {
      const { container } = renderPPRollbackBtn({ rollbackStatus: status })
      expect(container.querySelector('button[id="rollbackBtn"]') as HTMLButtonElement).toBeDisabled()
    })
  )
})
