/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SortMethod } from '@common/utils/sortUtils'
import DelegateConfigurationResourceModalBody from '../DelegateConfigurationResourceModalBody'

const onChangeFn = jest.fn()

jest.mock('services/cd-ng', () => ({
  useListDelegateProfilesNg: jest
    .fn()
    .mockImplementation(() => ({ data: { content: [] }, refetch: jest.fn(), error: null, loading: false }))
}))

const params = {
  searchTerm: '',
  sortMethod: SortMethod.LastModifiedDesc,
  onSelectChange: onChangeFn,
  selectedData: [],
  resourceScope: {
    accountIdentifier: 'accountId'
  }
}

describe('Create DelegateConfigurationResourceModalBody', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateConfigurationResourceModalBody {...params} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
