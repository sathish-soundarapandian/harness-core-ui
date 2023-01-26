/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, pipelineModuleParams, projectPathProps } from '@common/utils/routeUtils'
import IACMSideNav from '..'

jest.mock('@projects-orgs/components/ProjectSelector/ProjectSelector', () => ({
  ProjectSelector: function ProjectSelectorComp(props: any) {
    return (
      <button
        onClick={() => props.onSelect({ identifier: 'project', orgIdentifier: 'org' })}
        data-testid="projectSelectorId"
      />
    )
  }
}))

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper
      path={routes.toIACMStacks({
        ...accountPathProps,
        ...orgPathProps,
        ...pipelineModuleParams,
        ...projectPathProps
      })}
      pathParams={{
        accountId: 'accountId',
        orgIdentifier: 'default',
        projectIdentifier: 'iacm',
        module: 'iacm'
      }}
    >
      <IACMSideNav />
    </TestWrapper>
  )

describe('Sidenav', () => {
  test('render', () => {
    const { getByText } = renderComponent()
    expect(getByText('iacm.stacks')).toBeVisible()
  })

  test('should go to dashboard when project is selected', async () => {
    const { getByTestId } = renderComponent()
    userEvent.click(getByTestId('projectSelectorId'))

    expect(getByTestId('location')).toHaveTextContent('/account/accountId/iacm/orgs/org/projects/project/dashboard')
  })
})
