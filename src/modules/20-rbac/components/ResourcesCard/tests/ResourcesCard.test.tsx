/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByAttribute, render, RenderResult } from '@testing-library/react'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { getResourceTypeHandlerMock } from '@rbac/utils/RbacFactoryMockData'
import ResourcesCard from '../ResourcesCard'

jest.mock('@rbac/factories/RbacFactory', () => ({
  getResourceTypeHandler: jest.fn().mockImplementation(resource => getResourceTypeHandlerMock(resource))
}))
describe('Resource Card', () => {
  let renderObj: RenderResult
  test('it should render attribute selection option if feature flag is enabled and required methods are provided', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      ATTRIBUTE_TYPE_ACL_ENABLED: true
    })
    renderObj = render(
      <TestWrapper pathParams={{ accountId: 'dummy' }}>
        <ResourcesCard
          resourceType={ResourceType.ENVIRONMENT}
          resourceValues={{ attributeName: 'test', attributeValues: ['testVal'] }}
          onResourceSelectionChange={jest.fn()}
          disableSelection={false}
        />
      </TestWrapper>
    )

    const { container } = renderObj
    expect(queryByAttribute('data-testid', container, 'attr-ENVIRONMENT')).not.toBeNull()
  })
  test('it should not render attribute selection option if feature flag is disabled', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      ATTRIBUTE_TYPE_ACL_ENABLED: false
    })
    renderObj = render(
      <TestWrapper pathParams={{ accountId: 'dummy' }}>
        <ResourcesCard
          resourceType={ResourceType.ENVIRONMENT}
          resourceValues={{ attributeName: 'test', attributeValues: ['testVal'] }}
          onResourceSelectionChange={jest.fn()}
          disableSelection={false}
        />
      </TestWrapper>
    )

    const { container } = renderObj
    expect(queryByAttribute('data-testid', container, 'attr-ENVIRONMENT')).toBeNull()
  })
})
