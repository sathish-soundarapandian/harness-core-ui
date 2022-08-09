/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { Formik } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import * as cdNGService from 'services/cd-ng'
import LinkToLDAPProviderForm from '../views/LinkToLDAPProviderForm'
import type { LinkToLdapProviderFormData } from '../views/LinkToSSOProviderForm'

const TEST_PATH = routes.toUserGroups({
  ...accountPathProps
})

const mockSuccessSearchResponseNoResult = {
  status: 'SUCCESS',
  resource: [],
  metaData: {},
  correlationId: ''
}

const mockSuccessSearchResponse = {
  status: 'SUCCESS',
  resource: [
    {
      dn: 'cn=ldap_usergroup,ou=Users,o=611a119873e7186e37f75599,dc=jumpcloud,dc=com',
      name: 'ldap_usergroup',
      description: 'tagGroup',
      totalMembers: 3,
      selectable: true,
      message: '',
      users: []
    }
  ],
  metaData: {},
  correlationId: ''
}

const mockErrorSearchResponse = {
  status: 'ERROR',
  resource: undefined,
  metaData: undefined,
  correlationId: ''
}

const TEST_ID = 'TEST_ID'

describe('Create LinkToLDAPProviderModal', () => {
  test('should search for groups with no results found', async () => {
    jest.spyOn(cdNGService, 'useSearchLdapGroups').mockReturnValue({
      data: mockSuccessSearchResponseNoResult,
      loading: false,
      refetch: jest.fn().mockReturnValue(mockSuccessSearchResponseNoResult),
      error: null
    } as any)
    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={{ accountId: TEST_ID }}>
        <Formik<LinkToLdapProviderFormData>
          formName="test-form"
          initialValues={{ sso: '', groupName: '', selectedRadioValue: {} }}
          onSubmit={jest.fn()}
        >
          <LinkToLDAPProviderForm />
        </Formik>
      </TestWrapper>
    )

    await waitFor(() => getByText('rbac.userDetails.linkToSSOProviderModal.groupSearchLabel'))

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'groupSearch',
        value: 'dummy search'
      }
    ])

    const searchButton = container?.querySelector('button[data-testid="searchLdapGroup"]')

    await act(async () => {
      fireEvent.click(searchButton!)
    })

    await waitFor(() => expect(getByText('common.filters.noResultsFound')).not.toBeNull())

    expect(container).toMatchSnapshot()
  })

  test('should search the form for groups and render table', async () => {
    jest.spyOn(cdNGService, 'useSearchLdapGroups').mockReturnValue({
      data: mockSuccessSearchResponse,
      loading: false,
      refetch: jest.fn().mockReturnValue(mockSuccessSearchResponse),
      error: null
    } as any)
    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={{ accountId: TEST_ID }}>
        <Formik<LinkToLdapProviderFormData>
          formName="test-form"
          initialValues={{ sso: '', groupName: '', selectedRadioValue: {} }}
          onSubmit={jest.fn()}
        >
          <LinkToLDAPProviderForm />
        </Formik>
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('rbac.userDetails.linkToSSOProviderModal.groupSearchLabel')).not.toBeNull())

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'groupSearch',
        value: 'dummy search'
      }
    ])

    const searchButton = container?.querySelector('button[data-testid="searchLdapGroup"]')

    await act(async () => {
      fireEvent.click(searchButton!)
    })

    expect(container).toMatchSnapshot()

    const results = container.querySelector('[class*="wrapper"]')
    expect(results).toBeTruthy()

    const table = container.querySelector('[class*="TableV2--minimal"]')
    expect(table).toBeTruthy()

    const radioData = container.querySelector('[class*="Radio--radio"]')
    expect(radioData).toBeTruthy()

    expect(container).toMatchSnapshot()
  })

  test('should search the form for groups and render error', async () => {
    jest.spyOn(cdNGService, 'useSearchLdapGroups').mockReturnValue({
      data: mockErrorSearchResponse,
      loading: false,
      refetch: jest.fn().mockReturnValue(mockErrorSearchResponse),
      error: new Error('api call resulted in error')
    } as any)
    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={{ accountId: TEST_ID }}>
        <Formik<LinkToLdapProviderFormData>
          formName="test-form"
          initialValues={{ sso: '', groupName: '', selectedRadioValue: {} }}
          onSubmit={jest.fn()}
        >
          <LinkToLDAPProviderForm />
        </Formik>
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('rbac.userDetails.linkToSSOProviderModal.groupSearchLabel')).not.toBeNull())

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'groupSearch',
        value: 'dummy search'
      }
    ])

    const searchButton = container?.querySelector('button[data-testid="searchLdapGroup"]')

    await act(async () => {
      fireEvent.click(searchButton!)
    })

    expect(container).toMatchSnapshot()

    const results = container.querySelector('[class*="wrapper"]')
    expect(results).toBeNull

    const errorData = container.querySelector('[class*="bp3-icon-error"]')
    expect(errorData).toBeTruthy()

    expect(container).toMatchSnapshot()
  })
})
