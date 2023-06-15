/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor, queryByText, queryAllByText } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { mockResponse } from '@auth-settings/pages/Configuration/__test__/mock'
import RestrictEmailDomains from '../RestrictEmailDomains'

jest.mock('services/cd-ng', () => ({
  useUpdateWhitelistedDomains: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  })
}))

const refetchAuthSettings = jest.fn()
const setUpdating = jest.fn()
const whitelistedDomains = ['harness.io']

describe('RestrictEmailDomains', () => {
  test('Disable email restrictions', async () => {
    const { container, getByTestId } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <RestrictEmailDomains
          whitelistedDomains={whitelistedDomains}
          refetchAuthSettings={refetchAuthSettings}
          canEdit
          setUpdating={setUpdating}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const toggleRestrictEmailDomains = getByTestId('toggle-restrict-email-domains')
    act(() => {
      fireEvent.click(toggleRestrictEmailDomains)
    })

    await waitFor(() => queryByText(document.body, 'authSettings.disableWhitelistedDomains'))
    const confirmForm = findDialogContainer()
    expect(confirmForm).toBeTruthy()

    const confirmButton = queryByText(confirmForm!, 'confirm')
    await act(async () => {
      fireEvent.click(confirmButton!)
    })

    expect(queryAllByText(document.body, 'authSettings.whitelistedDomainsDisabled')).toBeTruthy()
  }),
    test('Update email restrictions', async () => {
      const { container, getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <RestrictEmailDomains
            whitelistedDomains={whitelistedDomains}
            refetchAuthSettings={refetchAuthSettings}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()

      const updateRestrictEmailDomains = getByTestId('update-restrict-email-domains')
      act(() => {
        fireEvent.click(updateRestrictEmailDomains)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.allowLoginFromTheseDomains'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      expect(container).toMatchSnapshot()
      const saveButton = queryByText(form!, 'save')
      await act(async () => {
        fireEvent.click(saveButton!)
      })

      expect(queryAllByText(document.body, 'authSettings.WhitelistedDomainsUpdated')).toBeTruthy()
    })
})
