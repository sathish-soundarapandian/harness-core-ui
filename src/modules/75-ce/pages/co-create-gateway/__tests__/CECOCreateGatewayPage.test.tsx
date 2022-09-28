/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CECOCreateGatewayPage from '../CECOCreateGatewayPage'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({ loading: false, refetch: jest.fn(), data: undefined }))
}))

describe('Create Auto Stopping rule', () => {
  test('Render cloud provider & connector selection screen', async () => {
    const { getByText } = render(
      <TestWrapper>
        <CECOCreateGatewayPage />
      </TestWrapper>
    )

    expect(getByText('common.letsGetYouStarted')).toBeInTheDocument()
  })
})
