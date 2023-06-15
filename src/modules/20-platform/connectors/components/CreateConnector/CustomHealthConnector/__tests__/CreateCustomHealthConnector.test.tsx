/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

// tells jest we intent to mock CVConnectorHOC and use mock in __mocks__
jest.mock('../../CommonCVConnector/CVConnectorHOC')
// file that imports mocked component must be placed after jest.mock

jest.mock('@secrets/utils/SecretField', () => ({
  setSecretField: async () => ({
    identifier: 'secretIdentifier',
    name: 'secretName',
    referenceString: 'testReferenceString'
  })
}))

import { CustomHealthConnector } from '../CreateCustomHealthConnector'

function WrapperComponent() {
  const els = CustomHealthConnector({
    accountId: 'dummyAccountId',
    orgIdentifier: 'dummyOrgId',
    projectIdentifier: 'dummyProjectId',
    isEditMode: false,
    prevStepData: {},
    nextStep: jest.fn()
  })

  return <div>{els}</div>
}

describe('Create CustomHealth connector Wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Ensure component renders 3 substeps and matches snapshot', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'accountId' }}>
        <WrapperComponent />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
