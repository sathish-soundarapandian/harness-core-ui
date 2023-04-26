/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { SortMethod } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import ResourceGroupsResourceModalBody from '../ResourceGroupsResourceModalBody'
import data from './mock.json'

const props = {
  searchTerm: '',
  sortMethod: SortMethod.LastModifiedDesc,
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

jest.mock('services/resourcegroups', () => ({
  useGetFilterResourceGroupListV2: jest.fn(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => data)
  }))
}))

describe('Resource Groups Modal Body test', () => {
  test('initializes ok ', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ResourceGroupsResourceModalBody {...props} />
      </TestWrapper>
    )
    await waitFor(() => getByText('ABAC TEST'))
    expect(getByText('ABAC TEST')).toBeTruthy()
  })
})
