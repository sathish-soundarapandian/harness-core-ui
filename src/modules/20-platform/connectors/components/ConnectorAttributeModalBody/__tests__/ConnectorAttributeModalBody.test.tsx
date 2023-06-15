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
import ConnectorAttributeModalBody from '../ConnectorAttributeModalBody'

const props = {
  selectedData: ['CLOUD_PROVIDER'],
  resourceScope: { accountIdentifier: 'account123' },
  resourceType: ResourceType.CONNECTOR,
  onSelectChange: jest.fn()
}

describe('Create Connector Atrribute Modal Body', () => {
  test(' renders all connector attributes', () => {
    const { container } = render(
      <TestWrapper>
        <ConnectorAttributeModalBody {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const selectedAttributes = container.querySelectorAll('input[type="checkbox"]:checked')
    expect(selectedAttributes.length).toBe(1)
  })
})
