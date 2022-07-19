/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DelegateTokenDetails } from 'services/portal'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateTokens from '../DelegateTokens'

const mockTokens: DelegateTokenDetails[] = [
  {
    accountId: 'dsaddefrfr',
    createdAt: 4342354343553,
    createdBy: { name: 'Admin' },
    ownerIdentifier: 'dsfevrwv',
    name: 'Token 1',
    status: 'ACTIVE',
    uuid: 'debterbteb',
    value: 'fjon2kjh3rl4'
  }
]

const createToken = jest.fn().mockResolvedValue({
  resource: mockTokens[0]
})

jest.mock('services/cd-ng', () => ({
  useCreateDelegateToken: jest.fn().mockImplementation(() => ({
    mutate: createToken
  })),
  useGetDelegateTokens: jest.fn().mockImplementation(() => ({
    data: {
      resource: mockTokens
    },
    refetch: jest.fn()
  })),
  useGetDelegateGroupsUsingToken: jest.fn().mockImplementation(() => ({
    data: {
      resource: []
    },
    loading: false
  })),
  revokeDelegateTokenPromise: jest.fn().mockImplementation(() => undefined)
}))

describe('Delegate Tokens page', () => {
  test('render delegate tokens', async () => {
    const { queryByText } = render(
      <TestWrapper>
        <DelegateTokens />
      </TestWrapper>
    )
    expect(queryByText('Token 1')).toBeInTheDocument()
  })

  test('Open create token modal', async () => {
    const { getByRole } = render(
      <TestWrapper>
        <DelegateTokens />
      </TestWrapper>
    )
    const createTokenBtn = getByRole('button', { name: /rbac.token.createLabel/ })
    userEvent.click(createTokenBtn!)
    await waitFor(() => {
      expect(document.body.innerHTML).toContain('apply')
    })

    const newTokenNameInput = document.body.querySelectorAll('input')[2]

    await act(async () => {
      fireEvent.change(newTokenNameInput!, {
        target: { value: 'newTokenName' }
      })
    })

    const applyTokenBtn = getByRole('button', { name: /apply/ })
    userEvent.click(applyTokenBtn!)

    await waitFor(() => {
      expect(document.body.innerHTML).not.toContain('delegates.tokens.generatedValuePlaceholder')
    })
  })

  test('Open token details modal', async () => {
    const { getByText } = render(
      <TestWrapper>
        <DelegateTokens />
      </TestWrapper>
    )

    let tokenNameElement: HTMLElement

    await waitFor(() => {
      tokenNameElement = getByText('Token 1')
    })
    userEvent.click(tokenNameElement!)
    await waitFor(() => {
      expect(document.body.innerHTML).toContain('moreInfoTitle')
    })
  })

  test('Open token revoke modal', async () => {
    const { getByText } = render(
      <TestWrapper>
        <DelegateTokens />
      </TestWrapper>
    )

    let tokenNameElement: HTMLElement

    await waitFor(() => {
      tokenNameElement = getByText('delegates.tokens.revoke')
    })
    userEvent.click(tokenNameElement!)
    await waitFor(() => {
      expect(getByText('delegates.tokens.revokeToken')).toBeInTheDocument()
    })
  })

  test('Completely revoke token', async () => {
    const { getByText, getAllByText } = render(
      <TestWrapper>
        <DelegateTokens />
      </TestWrapper>
    )

    let tokenNameElement: HTMLElement[] = []

    await waitFor(() => {
      tokenNameElement = getAllByText('delegates.tokens.revoke')
    })
    userEvent.click(tokenNameElement[0]!)
    await waitFor(() => {
      expect(getByText('delegates.tokens.revokeTokenSubtitle')).toBeInTheDocument()
    })

    await waitFor(() => {
      tokenNameElement = getAllByText('delegates.tokens.revoke')
    })
    const revokeBtnOnModal = tokenNameElement[1]
    userEvent.click(revokeBtnOnModal!)
  })

  test('Create new token', async () => {
    const { getByText, getAllByText } = render(
      <TestWrapper>
        <DelegateTokens />
      </TestWrapper>
    )

    let tokenCreateBtn: HTMLElement[] = []

    await waitFor(() => {
      tokenCreateBtn = getAllByText('rbac.token.createLabel')
    })
    userEvent.click(tokenCreateBtn[0]!)
    expect(getByText('common.apply')).toBeInTheDocument()

    let tokenApplyBtn: HTMLElement
    await waitFor(() => {
      const allApplyElements = getAllByText('common.apply')
      tokenApplyBtn = allApplyElements[0]
    })
    userEvent.click(tokenApplyBtn!)
    await waitFor(() => {
      expect(document.body.innerHTML).toContain(mockTokens[0].name)
    })
  })
})
