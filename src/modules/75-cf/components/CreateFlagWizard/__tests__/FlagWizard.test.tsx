/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServiceMock from 'services/cf'
import { FlagTypeVariations } from '@cf/components/CreateFlagDialog/FlagDialogUtils'
import FlagWizard from '../FlagWizard'

jest.mock('@common/hooks', () => ({
  useQueryParams: () => jest.fn(),
  useDeepCompareEffect: () => jest.fn(),
  useLocalStorage: jest.fn().mockImplementation(() => [5, jest.fn()])
}))

const trackEventMock = jest.fn()
jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: trackEventMock })
}))

describe('FlagWizard', () => {
  test('it should fire telementary event when completed created flag', () => {
    jest.spyOn(cfServiceMock, 'useGetGitRepo').mockReturnValue({ loading: false, data: { repoSet: true } } as any)

    render(
      <TestWrapper
        path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <FlagWizard
          flagTypeView={FlagTypeVariations.booleanFlag}
          environmentIdentifier="nonProduction"
          toggleFlagType={jest.fn()}
          hideModal={jest.fn()}
          goBackToTypeSelections={jest.fn()}
        />
      </TestWrapper>
    )

    userEvent.type(screen.getByPlaceholderText('cf.creationModal.aboutFlag.ffNamePlaceholder'), 'TEST_FLAG')

    fireEvent.click(screen.getByText('next'))

    expect(trackEventMock).toHaveBeenCalled()
  })
})
