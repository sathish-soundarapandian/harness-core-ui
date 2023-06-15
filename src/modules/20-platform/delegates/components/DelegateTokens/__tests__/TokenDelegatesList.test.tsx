/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import TokenDelegatesList from '../modals/TokenDelegatesList'
import { delegateGroupsMock } from '../../../pages/delegates/__tests__/DelegateGroupsMock'

jest.mock('services/cd-ng', () => ({
  useGetDelegateGroupsUsingToken: jest.fn().mockImplementation(() => ({
    data: {
      resource: {
        delegateGroupDetails: delegateGroupsMock
      }
    }
  }))
}))

describe('Token delegates component', () => {
  test('render Token delegates', async () => {
    const { queryByText } = render(
      <TestWrapper>
        <TokenDelegatesList tokenName="token1" />
      </TestWrapper>
    )
    expect(queryByText('delegates.tokens.tokenNotUsedByDelegates')).not.toBeInTheDocument()
  })
  test('Open troubleshoot', async () => {
    const { getByRole, queryAllByText } = render(
      <TestWrapper>
        <TokenDelegatesList tokenName="token1" />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(getByRole('button', { name: 'delegates.troubleshootOption' })).toBeInTheDocument()
    })
    userEvent.click(getByRole('button', { name: 'delegates.troubleshootOption' }))
    expect(queryAllByText('delegates.delegateNotInstalled.tabs.commonProblems.troubleshoot')[0]).toBeInTheDocument()
  })
})
