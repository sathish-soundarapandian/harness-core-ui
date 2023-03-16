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
import SecretResourceModalBody from '../SecretResourceModalBody'
import mockData from './secretMockData.json'

const props = {
  searchTerm: '',
  sortMethod: SortMethod.Newest,
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

jest.mock('services/cd-ng', () => ({
  useListSecretsV2: jest.fn().mockImplementation(() => {
    return { data: mockData, loading: false }
  })
}))
describe('Secret Resource Modal Body test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper>
        <SecretResourceModalBody {...props}></SecretResourceModalBody>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
