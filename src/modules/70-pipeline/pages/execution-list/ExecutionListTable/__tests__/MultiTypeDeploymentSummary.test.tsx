/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { MultiTypeDeploymentSummary } from '../MultiTypeDeploymentSummary'
import { GITOPS_STAGE, ENVIRONMENT_GROUP_STAGE } from './MultiTypeDeploymentSummaryHelper'

export const accountId = 'accountId'
export const projectIdentifier = 'project1'
export const orgIdentifier = 'default'

describe('MultiTypeDeploymentSummary', () => {
  test('render service, env and gitops applications', () => {
    const { container } = render(
      <TestWrapper
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', applicationId: 'applicationId' }}
      >
        <MultiTypeDeploymentSummary
          stage={GITOPS_STAGE}
          onToggleClick={jest.fn()}
          isStagesExpanded={true}
          pipelineIdentifier={'-1'}
          link
          executionIdentifier={'-1'}
          source={'deployments'}
          connectorRef={'dummy'}
          repoName={'dummy'}
          branch={'dummy'}
          storeType={'INLINE'}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('render environmentGroup in getEnvironmentsTextAndTooltip', () => {
    const { container } = render(
      <TestWrapper
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', applicationId: 'applicationId' }}
      >
        <MultiTypeDeploymentSummary
          stage={ENVIRONMENT_GROUP_STAGE}
          onToggleClick={jest.fn()}
          isStagesExpanded={true}
          pipelineIdentifier={'-1'}
          link
          executionIdentifier={'-1'}
          source={'deployments'}
          connectorRef={'dummy'}
          repoName={'dummy'}
          branch={'dummy'}
          storeType={'INLINE'}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
