/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, queryByText, getByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'
import { validateIpAddressAllowlistedOrNot } from '@harnessio/react-ng-manager-client'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { clickSubmit, fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { VIEWS } from '@auth-settings/pages/Configuration/Configuration'
import {
  mockValidateIpAddressAllowlistedOrNotSuccess,
  mockValidateIpAddressAllowlistedOrNotFailure
} from '@auth-settings/modals/__test__/mocks/ipAllowlistModals.mock'
import CheckIPForm from '../CheckIPModal/views/CheckIPForm'

jest.mock('@harnessio/react-ng-manager-client')

describe('Check IP Form tests', () => {
  let container: HTMLElement

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        queryParams={{ view: VIEWS.ALLOWLIST }}
        path={routes.toAuditTrail({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <CheckIPForm onClose={jest.fn()} />
      </TestWrapper>
    )
    container = renderObj.container
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('Should render CheckIPForm and check whether IP allowlisted: success case', async () => {
    const validateIpAddressAllowlistedOrNotMock = validateIpAddressAllowlistedOrNot as jest.MockedFunction<any>
    validateIpAddressAllowlistedOrNotMock.mockImplementation(() => {
      return { content: mockValidateIpAddressAllowlistedOrNotSuccess }
    })
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'testIP',
        value: '192.168.1.1'
      }
    ])
    await act(async () => {
      clickSubmit(container)
    })
    await waitFor(() => expect(validateIpAddressAllowlistedOrNotMock).toBeCalledTimes(1))
    const checkAnotherIPBtn = queryByText(container, 'authSettings.ipAddress.checkAnotherIP')
    await userEvent.click(checkAnotherIPBtn!)
  })

  test('Should render CheckIPForm and check whether IP allowlisted: failure case', async () => {
    const validateIpAddressAllowlistedOrNotMock = validateIpAddressAllowlistedOrNot as jest.MockedFunction<any>
    validateIpAddressAllowlistedOrNotMock.mockImplementation(() => {
      return { content: mockValidateIpAddressAllowlistedOrNotFailure }
    })
    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'testIP',
        value: '192.168.1.1'
      }
    ])
    await act(async () => {
      clickSubmit(container)
    })
    await waitFor(() => expect(validateIpAddressAllowlistedOrNotMock).toBeCalledTimes(1))
    expect(getByText(document.body, 'authSettings.ipAddress.notAPartOfAllowlist')).toBeInTheDocument()
  })
})
