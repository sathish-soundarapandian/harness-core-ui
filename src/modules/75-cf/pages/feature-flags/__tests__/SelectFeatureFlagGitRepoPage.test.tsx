/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SelectFlagGitRepoPage from '../SelectFlagGitRepoPage'

jest.mock('services/cd-ng', () => ({
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn() }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn() }
  })
}))

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <SelectFlagGitRepoPage gitRepoRefetch={jest.fn()} />
    </TestWrapper>
  )
}
describe('SelectFeatureFlagGitRepoPage', () => {
  test('it should render component', async () => {
    const { container } = renderComponent()
    expect(container).toMatchSnapshot()
  })

  test('it should render buttons correctly', async () => {
    renderComponent()

    expect(screen.getByText('cf.selectFlagRepo.useExistingRepo')).toBeInTheDocument()
    expect(screen.getByText('cf.selectFlagRepo.newRepo')).toBeInTheDocument()
  })
})
