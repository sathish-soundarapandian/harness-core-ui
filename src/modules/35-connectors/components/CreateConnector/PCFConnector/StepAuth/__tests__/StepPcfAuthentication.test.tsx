/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import StepPcfAuthentication from '../StepPcfAuthentication'
import { commonProps, connectorInfoMock, mockSecret, mockSecretList } from '../../__tests__/mocks'

jest.mock('services/cd-ng', () => ({
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecretList)),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret))
}))

describe('<StepPcfAuthentication />', () => {
  test('nextStep coverage and called with inputs', async () => {
    const nextStep = jest.fn()
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <StepPcfAuthentication
          {...commonProps}
          name={'credentials'}
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
          isEditMode={false}
          connectorInfo={connectorInfoMock}
          nextStep={nextStep}
        />
      </TestWrapper>
    )

    // Change Master URL
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="endpointUrl"]')!, {
        target: { value: 'http://sample_url_pcf.com/' }
      })
    })

    // Change username
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="usernametextField"]')!, {
        target: { value: 'AdminUser' }
      })
    })

    // Change token
    act(() => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    await waitFor(() => getByText('common.entityReferenceTitle'))

    act(() => {
      fireEvent.click(getByText('PcfToken')!)
    })

    act(() => {
      fireEvent.click(getByText('entityReference.apply')!)
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(getByText('secrets.secret.configureSecret')).toBeInTheDocument()
    expect(getByText('<PcfToken>')).toBeInTheDocument()

    expect(nextStep).toBeCalledWith({
      passwordRef: {
        identifier: 'PcfToken',
        name: 'PcfToken',
        referenceString: 'account.PcfToken',
        type: 'SecretText'
      },
      description: 'test description',
      endpointUrl: 'http://sample_url_pcf.com/',
      identifier: 'pcfConnector',
      name: 'pcfConnector',
      orgIdentifier: 'default',
      projectIdentifier: 'defaultproject',
      spec: {
        credential: {
          spec: {
            endpointUrl: 'http://sample_url.com/',
            passwordRef: 'pcfToken',
            username: 'admin',
            usernameRef: null
          },
          type: 'ManualConfig'
        },
        delegateSelectors: ['account-delegate-1668077546'],
        executeOnDelegate: true
      },
      tags: { tag1: '', tag2: '', tag3: '' },
      type: 'Pcf',
      username: { type: 'TEXT', value: 'AdminUser' },
      usernamefieldType: 'TEXT',
      usernametextField: 'AdminUser'
    })
  })
})
