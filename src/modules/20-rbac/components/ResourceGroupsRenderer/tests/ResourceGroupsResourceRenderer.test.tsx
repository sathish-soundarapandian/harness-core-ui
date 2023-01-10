/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import ResourceGroupsResourceRenderer from '../ResourceGroupsResourceRenderer'
import data from './mock.json'

const onChangeFn = jest.fn()

jest.mock('services/resourcegroups', () => ({
  useGetFilterResourceGroupListV2: jest.fn(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => data)
  }))
}))

const resourceScope = {
  accountIdentifier: 'accountId',
  orgIdentifier: '',
  projectIdentifier: ''
}
const params = {
  identifiers: ['asd', 'esd'],
  resourceScope: resourceScope,
  resourceType: ResourceType.RESOURCEGROUP,
  onResourceSelectionChange: onChangeFn
}

describe('Resource Group Resource Renderer', () => {
  test('render data', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ResourceGroupsResourceRenderer {...params} />
      </TestWrapper>
    )
    await waitFor(() => getByText('ABAC TEST'))
    expect(getByText('ABAC TEST')).toBeTruthy()
  })
})
