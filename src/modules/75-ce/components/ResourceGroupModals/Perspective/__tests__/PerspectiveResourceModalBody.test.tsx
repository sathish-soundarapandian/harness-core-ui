/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { SortMethod } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as ceService from 'services/ce'
import PerspectiveResourceModalBody from '../PerspectiveResourceModalBody'
import FoldersData from './foldersMockData.json'

const props = {
  searchTerm: '',
  sortMethod: SortMethod.Newest,
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

jest.mock('services/ce', () => ({
  useGetFolders: jest.fn().mockImplementation(() => {
    return {
      data: FoldersData,
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

describe('Connector Resource Modal Body test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper>
        <PerspectiveResourceModalBody {...props}></PerspectiveResourceModalBody>
      </TestWrapper>
    )

    expect(await screen.findByText('Out of the box Folder')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('Show no data in case there is no perspective folders', async () => {
    jest.spyOn(ceService, 'useGetFolders').mockImplementation((): any => {
      return { data: [], loading: false }
    })
    const { container, getByText } = render(
      <TestWrapper>
        <PerspectiveResourceModalBody {...props}></PerspectiveResourceModalBody>
      </TestWrapper>
    )

    expect(getByText('noData')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
