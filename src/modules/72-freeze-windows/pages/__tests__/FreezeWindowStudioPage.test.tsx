/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import serviceData from '@common/modals/HarnessServiceModal/__tests__/serviceMock'
import { getOrganizationAggregateDTOListMockData } from '@projects-orgs/pages/organizations/__tests__/OrganizationsMockData'
import FreezeWindowStudioPage from '../FreezeWindowStudioPage'

export const accountId = 'accountId'
export const projectIdentifier = 'project1'
export const orgIdentifier = 'default'

jest.mock('services/cd-ng', () => ({
  useGetOrganizationAggregateDTOList: jest.fn().mockImplementation(() => {
    return { ...getOrganizationAggregateDTOListMockData, refetch: jest.fn(), error: null }
  }),
  useGetFreeze: jest.fn().mockImplementation(() => ({})),
  useCreateFreeze: jest.fn().mockImplementation(() => ({})),
  useUpdateFreeze: jest.fn().mockImplementation(() => ({})),
  useGetProjectList: jest.fn().mockImplementation(() => ({})),
  useGetServiceList: jest.fn().mockImplementation(() => ({ loading: false, data: serviceData, refetch: jest.fn() }))
}))

describe('Freeze Window Studio Wrapper', () => {
  test('it should render FreezeWindow Studio in a wrapper', () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeWindowStudioPage />
      </TestWrapper>
    )

    // header assertion
    expect(document.getElementsByClassName('Breadcrumbs--breadcrumb').length).toBe(2)
    expect(document.getElementsByClassName('freezeToggler')[0]).toBeDefined()
    expect(document.getElementsByClassName('visualYamlToggle')[0]).toBeDefined()

    // Should have tab list, and have 3 tabs
    expect(document.getElementsByClassName('bp3-tab-list')[0]).toBeDefined()
    expect(document.getElementsByClassName('bp3-tab').length).toBeDefined()

    // Overview section should be rendered by default
    expect(getByText('overview')).toBeDefined()
    expect(getByText('freezeWindows.freezeStudio.freezeConfiguration')).toBeDefined()
    expect(getByText('common.schedule')).toBeDefined()
    expect(getByText('freezeWindows.freezeStudio.freezeOverview')).toBeDefined()

    // Notifications
    expect(getByText('notifications.pipelineName')).toBeDefined()
    expect(container).toMatchSnapshot('Freeze Studio Wrapper Snapshot')
  })
})
