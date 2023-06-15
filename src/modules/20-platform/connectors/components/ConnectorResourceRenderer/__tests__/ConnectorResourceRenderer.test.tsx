/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import ConnectorResourceRenderer from '../ConnectorResourceRenderer'

const resourceScope = {
  accountIdentifier: 'accountId',
  projectIdentifier: '',
  orgIdentifier: ''
}
const props = {
  identifiers: ['repository_1', 'artifactory_1'],
  resourceScope: resourceScope,
  resourceType: ResourceType.CONNECTOR,
  onResourceSelectionChange: jest.fn()
}

describe('Create Connector Resource table', () => {
  test(' renders connector identifiers', () => {
    const { container } = render(
      <TestWrapper>
        <ConnectorResourceRenderer {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
