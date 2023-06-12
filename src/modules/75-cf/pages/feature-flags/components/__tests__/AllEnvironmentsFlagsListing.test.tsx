/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getAllByRole, getAllByTestId, getByRole, render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cfServices from 'services/cf'
import { CurrentLocation, TestWrapper } from '@common/utils/testUtils'
import mockAllEnvsFlags from './mockGetAllEnvsFlags'
import mockEnvironments from './mockEnvironments'
import { AllEnvironmentsFlagsListing, AllEnvironmentsFlagsListingProps } from '../AllEnvironmentsFlagsListing'

const renderComponent = (props?: Partial<AllEnvironmentsFlagsListingProps>): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      defaultFeatureFlagValues={{ FFM_6683_ALL_ENVIRONMENTS_FLAGS: true }}
    >
      <AllEnvironmentsFlagsListing
        environments={mockEnvironments.data.content as any}
        projectFlags={mockAllEnvsFlags}
        refetchFlags={jest.fn()}
        deleteFlag={jest.fn()}
        queryParams={{
          projectIdentifier: 'dummy',
          accountIdentifier: 'dummy',
          orgIdentifier: 'dummy'
        }}
        {...props}
      />
      <CurrentLocation />
    </TestWrapper>
  )

describe('AllEnvironmentsFlagsListing', () => {
  beforeAll(() => {
    jest.spyOn(cfServices, 'useGetProjectFlags').mockReturnValue({
      loading: false,
      data: mockAllEnvsFlags,
      refetch: jest.fn(),
      error: null
    } as any)
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  test('it should render one row per flag', async () => {
    renderComponent()

    expect(screen.getAllByRole('row')).toHaveLength(mockAllEnvsFlags.flags.length + 1)
  })

  test('it should correctly render the Feature Flag details', async () => {
    renderComponent()

    const rows = screen.getAllByRole('row')

    // Feature Flag 1st row
    const flag1Columns = getAllByRole(rows[1], 'cell')

    expect(flag1Columns[0]).toHaveTextContent('Great New Feature')
    expect(flag1Columns[0]).toHaveTextContent('Great_New_Feature')
    expect(flag1Columns[0]).toHaveTextContent('Toggle the new feature on/off')
    expect(flag1Columns[1]).toHaveTextContent('createdApr 24, 2021')
  })

  test('it should render the Feature Flag environments', async () => {
    renderComponent()

    const rows = screen.getAllByRole('row')

    // Feature Flag 1st row
    const flag1Columns = getAllByRole(rows[1], 'cell')
    const envTypeContainers = getAllByTestId(flag1Columns[2], 'environmentTypeContainer')
    const nonProdEnvironments = getAllByTestId(envTypeContainers[0], 'flagEnvironmentStatus')
    const prodEnvironments = getAllByTestId(envTypeContainers[1], 'flagEnvironmentStatus')

    // PreProduction environments
    expect(envTypeContainers[0]).toHaveTextContent('cf.environments.nonProd')
    expect(nonProdEnvironments).toHaveLength(4)
    expect(nonProdEnvironments[0]).toHaveTextContent('QA1ENABLEDLABEL')
    expect(nonProdEnvironments[1]).toHaveTextContent('QA2COMMON.DISABLED')

    // Production environments
    expect(envTypeContainers[1]).toHaveTextContent('cf.environments.prod')
    expect(prodEnvironments).toHaveLength(6)
    expect(prodEnvironments[0]).toHaveTextContent('Env Prod1COMMON.DISABLED')
    expect(prodEnvironments[1]).toHaveTextContent('Env Prod3ENABLEDLABEL')
  })

  test('it should render a menu button', async () => {
    renderComponent()

    const rows = screen.getAllByRole('row')
    const flag1Columns = getAllByRole(rows[1], 'cell')
    const menuButton = getByRole(flag1Columns[3], 'button')

    userEvent.click(menuButton)

    const menuItems = screen.getAllByRole('listitem')

    expect(menuItems).toHaveLength(1)
    expect(menuItems[0]).toHaveTextContent('delete')
  })
})
