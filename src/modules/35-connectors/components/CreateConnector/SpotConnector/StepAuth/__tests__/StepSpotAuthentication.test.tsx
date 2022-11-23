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
import StepSpotAuthentication from '../StepSpotAuthentication'
import { commonProps, connectorInfoMock, mockSecret, mockSecretList } from '../../__tests__/mocks'

jest.mock('services/cd-ng', () => ({
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecretList)),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret))
}))

describe('<StepSpotAuthentication />', () => {
  test('nextStep coverage', async () => {
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <StepSpotAuthentication
          {...commonProps}
          name={'credentials'}
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
          isEditMode={false}
          connectorInfo={connectorInfoMock}
        />
      </TestWrapper>
    )

    // Change account id
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="spotAccountIdtextField"]')!, {
        target: { value: 'Dummy Acc Id' }
      })
    })

    // Change token
    act(() => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    await waitFor(() => getByText('common.entityReferenceTitle'))

    act(() => {
      fireEvent.click(getByText('SpotSecretToken')!)
    })

    act(() => {
      fireEvent.click(getByText('entityReference.apply')!)
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(getByText('secrets.secret.configureSecret')).toBeInTheDocument()
    expect(getByText('<SpotSecretToken>')).toBeInTheDocument()
  })

  test('nextStep is called with form input', async () => {
    const nextStep = jest.fn()
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <StepSpotAuthentication
          {...commonProps}
          name={'credentials'}
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
          isEditMode={false}
          connectorInfo={connectorInfoMock}
          nextStep={nextStep}
        />
      </TestWrapper>
    )

    // Change account id
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="spotAccountIdtextField"]')!, {
        target: { value: 'Dummy Acc Id' }
      })
    })

    // Change token
    act(() => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    await waitFor(() => getByText('common.entityReferenceTitle'))

    act(() => {
      fireEvent.click(getByText('SpotSecretToken')!)
    })

    act(() => {
      fireEvent.click(getByText('entityReference.apply')!)
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(getByText('secrets.secret.configureSecret')).toBeInTheDocument()
    expect(getByText('<SpotSecretToken>')).toBeInTheDocument()

    expect(nextStep).toBeCalledWith({
      spotAccountId: {
        type: 'TEXT',
        value: 'Dummy Acc Id'
      },
      spotAccountIdfieldType: 'TEXT',
      spotAccountIdtextField: 'Dummy Acc Id',
      apiTokenRef: {
        identifier: 'SpotSecretToken',
        name: 'SpotSecretToken',
        referenceString: 'account.SpotSecretToken',
        type: 'SecretText'
      },
      description: 'test description',
      identifier: 'testSpotId',
      name: 'testSpotId',
      orgIdentifier: 'default',
      projectIdentifier: 'Depanshu_spot',
      spec: {
        credential: {
          spec: {
            spotAccountId: null,
            spotAccountIdRef: 'testAccountRef',
            apiTokenRef: 'testTokenRef'
          },
          type: 'PermanentTokenConfig'
        },
        delegateSelectors: ['account-delegate-1666016649', 'organization-delegate-1666016649'],
        executeOnDelegate: true
      },
      tags: {
        tag1: '',
        tag2: '',
        tag3: ''
      },
      type: 'Spot'
    })
  })
})
