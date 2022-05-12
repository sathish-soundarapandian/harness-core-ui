/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { SideNavProvider, useSideNavContext } from '../SideNavContext'

describe('Test SideNavContext', () => {
  test('Should update flag properly', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toProjects({ accountId: 'accountId' })}
        pathParams={{ accountId: 'accountId' }}
        defaultAppStoreValues={{}}
      >
        <SideNavProvider>{children}</SideNavProvider>
      </TestWrapper>
    )

    const { result } = renderHook(() => useSideNavContext(), { wrapper })
    expect(result.current).toBeTruthy()
    const { showGetStartedTab, setShowGetStartedTab } = result.current
    expect(showGetStartedTab).toBe(false)
    await act(async () => {
      setShowGetStartedTab(true)
    })
    expect(showGetStartedTab).toBe(false)
  })
})
