/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ConnectorInfoDTO } from 'services/ce'
import CLITabContainer from '../CLITabContainer'

const mockConnector = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'Sample',
      identifier: 'Sample',
      description: '',
      tags: { connector: 'dx' },
      type: 'CEAws',
      spec: {}
    },
    status: null,
    harnessManaged: false
  },
  metaData: null,
  correlationId: 'Sample'
}

describe('CLI tab', () => {
  test('render successfully', () => {
    const { getByText } = render(
      <TestWrapper>
        <CLITabContainer ruleName={'dummy'} connectorData={mockConnector.data.connector as ConnectorInfoDTO} />
      </TestWrapper>
    )
    expect(getByText('ce.co.ruleDetails.sshTab.header')).toBeDefined()
  })
})
