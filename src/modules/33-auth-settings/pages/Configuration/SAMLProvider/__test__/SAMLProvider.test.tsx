/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor, queryByText, getByText } from '@testing-library/react'
import { TestWrapper, findDialogContainer, findPopoverContainer } from '@common/utils/testUtils'
import { setFieldValue, InputTypes } from '@common/utils/JestFormHelper'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { authSettings, mockResponse, permissionRequest } from '@auth-settings/pages/Configuration/__test__/mock'
import { AuthenticationMechanisms } from '@rbac/utils/utils'
import { getSamlEndpoint } from '@auth-settings/constants/utils'
import SAMLProvider from '../SAMLProvider'

jest.mock('services/cd-ng', () => ({
  useUploadSamlMetaData: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useUpdateSamlMetaData: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useGetSamlLoginTest: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse), refetch: () => Promise.resolve(mockResponse) }
  }),
  useDeleteSamlMetaData: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useUpdateAuthMechanism: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  })
}))

const refetchAuthSettings = jest.fn()
const setUpdating = jest.fn()

const samlSettings = {
  ...authSettings,
  ngAuthSettings: [
    {
      origin: 'harness.onelogin.com',
      logoutUrl: null,
      groupMembershipAttr: 'One Login Group',
      displayName: 'One Login',
      authorizationEnabled: true,
      settingsType: AuthenticationMechanisms.SAML
    }
  ],
  authenticationMechanism: AuthenticationMechanisms.SAML
}

const disabledSamlSettings = {
  ...samlSettings,
  authenticationMechanism: AuthenticationMechanisms.USER_PASSWORD
}

describe('SAML Provider', () => {
  test('Add SAML Provider', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <SAMLProvider
          authSettings={authSettings}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          canEdit
          setUpdating={setUpdating}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const addSAMLProvider = queryByText(document.body, 'authSettings.plusSAMLProvider')
    expect(addSAMLProvider).toBeTruthy()
    act(() => {
      fireEvent.click(addSAMLProvider!)
    })

    await waitFor(() => queryByText(document.body, 'authSettings.addSAMLProvider'))
    const form = findDialogContainer()
    expect(form).toBeTruthy()

    const azure = queryByText(form!, 'authSettings.azure')
    expect(azure).toBeTruthy()
    fireEvent.click(azure!)

    await waitFor(() => queryByText(form!, 'authSettings.enterSAMLEndPoint'))

    setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'displayName', value: 'Display name' })

    setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'groupMembershipAttr', value: 'MyGroup' })

    const addButton = queryByText(form!, 'add')
    await act(async () => {
      fireEvent.click(addButton!)
    })

    expect(queryByText(document.body, 'common.validation.fileIsRequired')).toBeTruthy()
  }),
    test('Edit SAML Provider', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <SAMLProvider
            authSettings={samlSettings}
            refetchAuthSettings={refetchAuthSettings}
            permissionRequest={permissionRequest}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const popoverButton = getByTestId('provider-button')
      fireEvent.click(popoverButton!)

      const popover = findPopoverContainer()

      const editSAMLProvider = getByText(popover!, 'edit')
      act(() => {
        fireEvent.click(editSAMLProvider)
      })

      await waitFor(() => getByText(document.body, 'authSettings.editSAMLProvider'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const saveButton = queryByText(form!, 'save')
      await act(async () => {
        fireEvent.click(saveButton!)
      })

      expect(queryByText(document.body, 'authSettings.samlProviderUpdatedSuccessfully')).toBeTruthy()
    }),
    test('Delete SAML Provider', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <SAMLProvider
            authSettings={samlSettings}
            refetchAuthSettings={refetchAuthSettings}
            permissionRequest={permissionRequest}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const popoverButton = getByTestId('provider-button')
      fireEvent.click(popoverButton!)

      const popover = findPopoverContainer()

      const deleteSAMLProvider = getByText(popover!, 'delete')
      act(() => {
        fireEvent.click(deleteSAMLProvider)
      })

      await waitFor(() => getByText(document.body, 'authSettings.deleteSamlProvider'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const confirmBtn = queryByText(form!, 'confirm')
      await act(async () => {
        fireEvent.click(confirmBtn!)
      })

      expect(queryByText(document.body, 'authSettings.samlProviderDeleted')).toBeTruthy()
    }),
    test('Cancel SAML provider modal', async () => {
      render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <SAMLProvider
            authSettings={authSettings}
            refetchAuthSettings={refetchAuthSettings}
            permissionRequest={permissionRequest}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const addSAMLProvider = queryByText(document.body, 'authSettings.plusSAMLProvider')
      expect(addSAMLProvider).toBeTruthy()
      act(() => {
        fireEvent.click(addSAMLProvider!)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.addSAMLProvider'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const cancelButton = queryByText(form!, 'cancel')
      expect(cancelButton).toBeTruthy()
      await act(async () => {
        fireEvent.click(cancelButton!)
      })

      const removedForm = findDialogContainer()
      expect(removedForm).toBeFalsy()
    }),
    test('Enable SAML provider', async () => {
      const { container } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <SAMLProvider
            authSettings={disabledSamlSettings}
            refetchAuthSettings={refetchAuthSettings}
            permissionRequest={permissionRequest}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const radioButton = queryByText(container, 'authSettings.loginViaSAML')
      expect(radioButton).toBeTruthy()
      act(() => {
        fireEvent.click(radioButton!)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.enableSamlProvider'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const confirmButton = queryByText(form!, 'confirm')
      expect(confirmButton).toBeTruthy()
      await act(async () => {
        fireEvent.click(confirmButton!)
      })

      expect(queryByText(document.body, 'authSettings.samlLoginEnabled')).toBeTruthy()
    }),
    test('Cancel enabling SAML provider', async () => {
      const { container } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <SAMLProvider
            authSettings={disabledSamlSettings}
            refetchAuthSettings={refetchAuthSettings}
            permissionRequest={permissionRequest}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const radioButton = queryByText(container, 'authSettings.loginViaSAML')
      expect(radioButton).toBeTruthy()
      act(() => {
        fireEvent.click(radioButton!)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.enableSamlProvider'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const cancelButton = queryByText(form!, 'cancel')
      expect(cancelButton).toBeTruthy()
      await act(async () => {
        fireEvent.click(cancelButton!)
      })

      const removedForm = findDialogContainer()
      expect(removedForm).toBeFalsy()
    })
})

describe('getSamlEndpoint cases', () => {
  let mockWindow: jest.MockedFunction<any>

  beforeEach(() => {
    mockWindow = jest.spyOn(window, 'window', 'get')
  })

  afterEach(() => {
    mockWindow.mockRestore()
  })

  test('apiUrl as undefined', () => {
    mockWindow.mockImplementation(() => ({
      location: {
        href: 'https://qa.harness.io/ng/#/account/123/home/setup/authentication/configuration'
      }
    }))
    expect(getSamlEndpoint('123')).toEqual('https://qa.harness.io/api/users/saml-login?accountId=123')
  }),
    test('apiUrl as /gateway', () => {
      mockWindow.mockImplementation(() => ({
        apiUrl: '/gateway',
        location: {
          href: 'https://qa.harness.io/ng/#/account/123/home/setup/authentication/configuration'
        }
      }))
      expect(getSamlEndpoint('123')).toEqual('https://qa.harness.io/gateway/api/users/saml-login?accountId=123')
    }),
    test('apiUrl as https://qa.harness.io/gateway', () => {
      mockWindow.mockImplementation(() => ({
        apiUrl: 'https://qa.harness.io/gateway',
        location: {
          href: 'https://qa.harness.io/ng/#/account/123/home/setup/authentication/configuration'
        }
      }))
      expect(getSamlEndpoint('123')).toEqual('https://qa.harness.io/gateway/api/users/saml-login?accountId=123')
    }),
    test('apiUrl as http://localhost:9090', () => {
      mockWindow.mockImplementation(() => ({
        apiUrl: 'http://localhost:9090',
        location: {
          href: 'https://qa.harness.io/ng/#/account/123/home/setup/authentication/configuration'
        }
      }))
      expect(getSamlEndpoint('123')).toEqual('http://localhost:9090/api/users/saml-login?accountId=123')
    })
})
