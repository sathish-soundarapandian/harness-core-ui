/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import FlagDialog from '../FlagDialog'

jest.mock('@common/hooks', () => ({
  useQueryParams: () => jest.fn(),
  useDeepCompareEffect: () => jest.fn(),
  useLocalStorage: jest.fn().mockImplementation(() => [5, jest.fn()])
}))

const trackEventMock = jest.fn()
jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: trackEventMock })
}))

describe('FlagDialog', () => {
  test('it should fire telemetary event when Create Flag Dialog opened', () => {
    render(
      <TestWrapper
        path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <FlagDialog disabled={false} environment="nonProduction" />
      </TestWrapper>
    )

    const createFlagButton = screen.getByText('cf.featureFlags.newFlag')
    expect(createFlagButton).toBeInTheDocument()

    fireEvent.click(createFlagButton)

    expect(trackEventMock).toHaveBeenCalled()
  })
})
