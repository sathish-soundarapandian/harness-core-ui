/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as hooks from '@common/hooks/useFeatureFlag'
import SideNav from '../SideNav'

jest.mock('@projects-orgs/components/ProjectSelector/ProjectSelector.tsx', () => ({
  ...(jest.requireActual('@projects-orgs/components/ProjectSelector/ProjectSelector') as any),
  ProjectSelector: function P(props: any) {
    return (
      <Container>
        <button
          onClick={() => props.onSelect({ identifier: '1234_project', orgIdentifier: '1234_org' })}
          id="bt"
        ></button>
      </Container>
    )
  }
}))

describe('Sidenav', () => {
  test('render', async () => {
    const useFeatureFlags = jest.spyOn(hooks, 'useFeatureFlag')
    useFeatureFlags.mockReturnValue(true)
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/cv/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <SideNav />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="Layout"]')).not.toBeNull())
    expect(container).toMatchSnapshot()
    const button = container.querySelector('#bt')
    if (!button) {
      throw Error('Button was not rendered.')
    }
    await userEvent.click(button)
    const accountTab = container.querySelector('[data-tab-id="AccountTab"]')
    await userEvent.click(accountTab!)
    expect(getByText('/account/dummy/cv/slos')).toBeInTheDocument()
  })
})
