/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import PdcDetails from '@connectors/components/CreateConnector/PdcConnector/StepDetails/PdcDetails'

jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showError: jest.fn()
  })
}))

const prevStepData = { spec: { hosts: 'localhost, 1.2.3.4' } }

describe('Test PdcDetails component', () => {
  test('Render component', async () => {
    const { container } = render(
      <TestWrapper path="/account/pass" pathParams={{ accountId: 'account1' }}>
        <PdcDetails prevStepData={prevStepData} isEditMode={false} name="pdc-details" />
      </TestWrapper>
    )

    waitFor(() => {
      expect(container.querySelector('localhost')).toBeDefined()
    })
  })
})
