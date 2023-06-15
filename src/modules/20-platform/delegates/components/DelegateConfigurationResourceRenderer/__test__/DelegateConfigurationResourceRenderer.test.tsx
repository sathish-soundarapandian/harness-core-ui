/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import DelegateConfigurationResourceRenderer from '../DelegateConfigurationResourceRenderer'

const onChangeFn = jest.fn()

jest.mock('services/cd-ng', () => ({
  useListDelegateProfilesNg: jest
    .fn()
    .mockImplementation(() => ({ data: { content: [] }, refetch: jest.fn(), error: null, loading: false }))
}))

const resourceScope = {
  accountIdentifier: 'accountId',
  projectIdentifier: '',
  orgIdentifier: ''
}
const params = {
  identifiers: ['asd', 'esd'],
  resourceScope: resourceScope,
  resourceType: ResourceType.DELEGATECONFIGURATION,
  onResourceSelectionChange: onChangeFn
}

describe('Create DelegateConfigurationResourceRenderer', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateConfigurationResourceRenderer {...params} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
