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
import StepTerraformCloudAuthentication from '../StepTerraformCloudAuthentication'
import { commonProps, connectorInfoMock, mockSecret, mockSecretList } from '../../__tests__/mock'

jest.mock('services/cd-ng', () => ({
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecretList)),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret))
}))

describe('<StepTerraformCloudAuthentication />', () => {
  test('nextStep coverage and called with inputs', async () => {
    const nextStep = jest.fn()
    const { getByText, container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <StepTerraformCloudAuthentication
          {...commonProps}
          name={'credentials'}
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
          isEditMode={false}
          connectorInfo={connectorInfoMock}
          nextStep={nextStep}
        />
      </TestWrapper>
    )

    // Change terraform URL
    fireEvent.change(container.querySelector('input[name="terraformCloudUrl"]')!, {
      target: { value: 'http://sample_url_terraform.com/' }
    })

    // Change token
    fireEvent.click(getByText('createOrSelectSecret'))

    await waitFor(() => getByText('common.entityReferenceTitle'))

    fireEvent.click(getByText('TerraformToken')!)

    fireEvent.click(getByText('entityReference.apply')!)

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(getByText('secrets.secret.configureSecret')).toBeInTheDocument()
    expect(getByText('<TerraformToken>')).toBeInTheDocument()

    expect(nextStep).toBeCalledWith({
      apiToken: {
        identifier: 'TerraformToken',
        name: 'TerraformToken',
        referenceString: 'account.TerraformToken',
        type: 'SecretText'
      },
      credentialType: 'ApiToken',
      description: 'test description',
      terraformCloudUrl: 'http://sample_url_terraform.com/',
      identifier: 'TerraformConnector',
      name: 'TerraformConnector',
      orgIdentifier: 'default',
      projectIdentifier: 'defaultproject',
      spec: {
        terraformCloudUrl: 'http://sample_url_terraform.com/',
        credential: {
          spec: {
            apiToken: 'TerraformToken'
          },
          type: 'ApiToken'
        },
        delegateSelectors: ['account-delegate-1668077546'],
        executeOnDelegate: true
      },
      tags: { tag1: '', tag2: '', tag3: '' },
      type: 'TerraformCloud'
    })
  })
})
