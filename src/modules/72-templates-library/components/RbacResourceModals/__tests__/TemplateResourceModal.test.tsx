/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { SortMethod } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import TemplateResourceModal from '../TemplateResourceModal'
import mockData from './templateResourceMockData.json'

const props = {
  searchTerm: '',
  sortMethod: SortMethod.Newest,
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

const params = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  module: 'cd'
}
const mockGetCallFunction = jest.fn()
jest.useFakeTimers()
jest.mock('services/template-ng', () => ({
  useGetTemplateList: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { mutate: jest.fn(() => Promise.resolve(mockData)), cancel: jest.fn(), loading: false }
  })
}))

describe('<TemplateResourceModal /> Tests', () => {
  test('snapshot test', async () => {
    const { getByText, container } = render(
      <TestWrapper pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
        <TemplateResourceModal {...props} />
      </TestWrapper>
    )
    await waitFor(() => getByText('common.templates'))
    jest.runOnlyPendingTimers()

    expect(container).toMatchSnapshot()
  })
})
