/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import EnableBanner from '../EnableBanner'

describe('Enable Banner', () => {
  test('clicking on setup button should navigate to setup page', async () => {
    const { getByTestId, getAllByText } = render(
      <TestWrapper pathParams={{ accountId: 'accountId' }}>
        <EnableBanner />
      </TestWrapper>
    )

    fireEvent.click(getAllByText('common.setup')[0])
    expect(getByTestId('location').innerHTML.indexOf('commitment-orchestration/setup')).toBeGreaterThan(-1)
  })
})
