/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'

import ProjectsSideNav from './ProjectsSideNav'

jest.mock('@projects-orgs/components/ProjectSelector/ProjectSelector', () => {
  return {
    ...jest.requireActual('@projects-orgs/components/ProjectSelector/ProjectSelector'),
    ProjectSelector: (props: any) => {
      return (
        <div>
          projectSelector
          <button
            data-testid="selectProject"
            onClick={props.onSelect({ identifier: 'dummyproject', name: 'projectname', orgIdentifier: 'org' })}
          ></button>
        </div>
      )
    }
  }
})

const mockHistoryPush = jest.fn()
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush
  })
}))

describe('Projects Side Nav', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toProjectDetails(projectPathProps)}
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <ProjectsSideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when project is selected', () => {
    const { queryByText } = render(
      <TestWrapper
        path={routes.toProjectDetails(projectPathProps)}
        defaultAppStoreValues={{
          selectedProject: {
            name: 'dummyProjectName',
            identifier: 'dummyProjectIdentifier',
            orgIdentifier: 'dummyOrgIdentifier'
          }
        }}
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <ProjectsSideNav />
      </TestWrapper>
    )
    expect(queryByText('projectSelector')).not.toBeNull()
  })

  test('on project select', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toProjectDetails(projectPathProps)}
        defaultAppStoreValues={{
          selectedProject: {
            name: 'dummyProjectName',
            identifier: 'dummyProjectIdentifier',
            orgIdentifier: 'dummyOrgIdentifier'
          }
        }}
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <ProjectsSideNav />
      </TestWrapper>
    )
    const selectProjectButton = container.querySelector('[data-testid="selectProject"]')
    fireEvent.click(selectProjectButton!)

    expect(mockHistoryPush).toBeCalledWith('/account/account/home/orgs/org/projects/dummyproject/details')
  })
})
