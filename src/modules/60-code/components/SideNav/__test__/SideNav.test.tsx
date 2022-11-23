/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import projects from '@projects-orgs/components/ProjectSelector/__test__/projects.json'
import SideNav from '../SideNav'

jest.mock('services/cd-ng', () => ({
  useGetProjectAggregateDTOList: jest.fn().mockImplementation(() => {
    return { data: projects, refetch: jest.fn(), error: null }
  }),
  useDeleteProject: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('Code Sidenav', () => {
  const Subject: React.FC<{ path?: string }> = ({
    path = '/account/:accountId/code/orgs/:orgIdentifier/projects/:projectIdentifier'
  }) => (
    <TestWrapper path={path} pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
      <SideNav />
    </TestWrapper>
  )

  test('Nav should render Repositories link', async () => {
    const { getByTestId, container, getByText } = render(<Subject />)
    expect(screen.queryByText('repositories')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(getByTestId('project-select-button'))
    })

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(getByText('Online Banking'))
    })

    expect(container).toMatchSnapshot()
  })
})
