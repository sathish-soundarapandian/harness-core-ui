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
import EnvironmentResourceRenderer from '../EnvironmentAttributeRenderer/EnvironmentResourceRenderer'

const resourceScope = {
  accountIdentifier: 'accountId',
  projectIdentifier: '',
  orgIdentifier: ''
}
const props = {
  identifiers: ['Production', 'PreProduction'],
  resourceScope: resourceScope,
  resourceType: ResourceType.ENVIRONMENT,
  onResourceSelectionChange: jest.fn()
}

describe('Create environment Resource table', () => {
  test(' renders environment identifiers', () => {
    const { container } = render(
      <TestWrapper>
        <EnvironmentResourceRenderer {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
