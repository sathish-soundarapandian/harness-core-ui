/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper, UseGetMockData } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { environmentPathProps, modulePathProps, projectPathProps } from '@common/utils/routeUtils'
import EntityUsage from '@common/pages/entityUsage/EntityUsage'
import type { ResponsePageEntitySetupUsageDTO } from 'services/cd-ng'
import environmentReferencedByData from './__mocks__/mockReferencedByData.json'
import environmentReferencedByDataWithGit from './__mocks__/mockReferencedByDataWithGit.json'

const renderComponent = (
  mockReferencedByData: UseGetMockData<ResponsePageEntitySetupUsageDTO>,
  gitSyncEnabled = false
): RenderResult => {
  return render(
    <TestWrapper
      path={routes.toEnvironmentDetails({
        ...projectPathProps,
        ...modulePathProps,
        ...environmentPathProps
      })}
      pathParams={{
        accountId: 'dummy',
        orgIdentifier: 'dummy',
        projectIdentifier: 'dummy',
        module: 'cd',
        environmentIdentifier: 'Env_1'
      }}
      queryParams={{ sectionId: 'REFERENCED_BY' }}
      defaultAppStoreValues={{ isGitSyncEnabled: gitSyncEnabled }}
    >
      <EntityUsage mockData={mockReferencedByData} entityIdentifier="Env_1" entityType="Environment" />
    </TestWrapper>
  )
}

describe('Referenced_By Tab Test', () => {
  test('render for no data', async () => {
    const { container } = renderComponent({
      data: {} as any,
      loading: false
    })
    const noRefElement = await screen.findByText('common.noRefData')
    expect(noRefElement).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('render for data', async () => {
    const { container } = renderComponent({
      data: environmentReferencedByData as any,
      loading: false
    })

    expect(container).toMatchSnapshot()
  })

  test('render data with gitSync', async () => {
    const { container } = renderComponent(
      {
        data: environmentReferencedByDataWithGit as any,
        loading: false
      },
      true
    )

    expect(container).toMatchSnapshot()
  })
})
