/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { PipelineExecutionInfo } from 'services/dashboard-service'
import DeploymentOverviewPopover from '../DeploymentOverviewPopover'

const data = [
  {
    accountInfo: { accountIdentifier: 'dummyAccountId' },
    orgInfo: {
      orgIdentifier: 'dummyOrgIdentifier',
      orgName: 'dummyOrgName'
    },
    pipelineInfo: {
      pipelineIdentifier: 'dummyPipelineIdentifier',
      pipelineName: 'dummyPipelineName'
    },
    planExecutionId: 'dummyPlanExecutionId',
    projectInfo: {
      projectIdentifier: 'dummyProjectIdentifier',
      projectName: 'dummyProjectName'
    }
  }
] as PipelineExecutionInfo[]

const windowOpenMock = jest.fn()
window.open = windowOpenMock

describe('deployment overview popover', () => {
  test('render with no data', () => {
    const { queryByText } = render(
      <TestWrapper>
        <DeploymentOverviewPopover overview={[]} status={[]} />
      </TestWrapper>
    )
    expect(queryByText('DEPLOYMENTSTEXT')).toBeNull()
  })

  test('render with data', () => {
    const { queryByText } = render(
      <TestWrapper>
        <DeploymentOverviewPopover overview={data} status={[]} />
      </TestWrapper>
    )
    expect(queryByText('dummyProjectName')).not.toBeNull()
    expect(queryByText('Orgs: dummyOrgName')).not.toBeNull()
  })

  test('click on count', () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentOverviewPopover overview={data} status={[]} />
      </TestWrapper>
    )

    const countNode = container.querySelector(
      '[data-testid="projectCount - dummyAccountId-dummyOrgIdentifier-dummyProjectIdentifier"]'
    )
    fireEvent.click(countNode!)
    expect(windowOpenMock).toBeCalledWith(
      '#/account/dummyAccountId/cd/orgs/dummyOrgIdentifier/projects/dummyProjectIdentifier/deployments?'
    )
  })

  test('click on count without projectInfo', () => {
    const firstData = { ...data[0], projectInfo: undefined }

    const { queryByText } = render(
      <TestWrapper>
        <DeploymentOverviewPopover overview={[firstData]} status={[]} />
      </TestWrapper>
    )

    expect(queryByText('dummyProjectName')).toBeNull()
  })
})
