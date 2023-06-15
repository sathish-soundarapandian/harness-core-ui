/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DelegateOverview } from '../DelegateOverview'
import DelegateGroupMock from './DelegateGroupMock'

const delegateProfile = {
  uuid: 'dsadassd2e23d',
  accountId: 'dsdddss',
  name: '',
  description: '',
  primary: false,
  approvalRequired: false,
  startupScript: '',
  scopingRules: [],
  selectors: [],
  createdAt: 3232,

  lastUpdatedAt: 231243423
}

describe('Delegates Overview Page', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateOverview
          delegate={DelegateGroupMock}
          delegateProfile={delegateProfile}
          showConnectivityStatus={true}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
