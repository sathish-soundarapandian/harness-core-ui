/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Module } from 'framework/types/ModuleName'
import { TestWrapper } from '@common/utils/testUtils'
import { Editions } from '@common/constants/SubscriptionTypes'
import ChoosePlan from '../ChoosePlan'

jest.mock('services/cd-ng', () => {
  return {
    useGetAccountLicenses: jest.fn().mockImplementation(() => {
      return {
        data: {
          correlationId: '40d39b08-857d-4bd2-9418-af1aafc42d20',
          data: {
            accountId: 'HlORRJY8SH2IlwpAGWwkmg',
            moduleLicenses: {}
          },
          metaData: null,
          status: 'SUCCESS'
        }
      }
    })
  }
})
describe('ChoosePlan', () => {
  const setPlanMock = jest.fn()
  const props = {
    plan: Editions.ENTERPRISE,
    setPlan: setPlanMock,
    module: 'cf' as Module,
    allLicenses: {}
  }

  test('render', async () => {
    const { container } = render(
      <TestWrapper>
        <ChoosePlan {...props} />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(container).toMatchSnapshot()
    })
  })

  test('setPlan', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ChoosePlan {...props} />
      </TestWrapper>
    )
    userEvent.click(getByText('Team'))
    await waitFor(() => {
      expect(setPlanMock).toHaveBeenCalledWith('TEAM')
    })
  })
})
