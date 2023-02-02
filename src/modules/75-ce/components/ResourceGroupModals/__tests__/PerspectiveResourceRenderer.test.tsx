/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import * as ceService from 'services/ce'
import PerspectiveResourceRenderer from '../PerspectiveResourceRenderer'
import FoldersData from './foldersMockData.json'

const resourceScope = {
  accountIdentifier: 'accountId',
  projectIdentifier: '',
  orgIdentifier: ''
}
const props = {
  identifiers: ['yVi1Q8cgQnaq-y1YqmELFQ', 'IKmp7fA9TtK61gWgipNc7g'],
  resourceScope: resourceScope,
  resourceType: ResourceType.CCM_PERSPECTIVE_FOLDERS,
  onResourceSelectionChange: jest.fn()
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

describe('Create Perspective folders Resource table', () => {
  test(' renders perspective resources identifiers', () => {
    const { container } = render(
      <TestWrapper>
        <PerspectiveResourceRenderer {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Show loader in case data is not ready', () => {
    jest.spyOn(ceService, 'useGetFolders').mockImplementation((): any => {
      return { data: null, loading: true }
    })
    const { container } = render(
      <TestWrapper>
        <PerspectiveResourceRenderer {...props} />
      </TestWrapper>
    )

    expect(container.querySelector('.PageSpinner--spinner')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('Call selector change fn on click of delete icon', async () => {
    jest.spyOn(ceService, 'useGetFolders').mockImplementation((): any => {
      return { data: FoldersData, loading: false }
    })
    const { container } = render(
      <TestWrapper>
        <PerspectiveResourceRenderer {...props} />
      </TestWrapper>
    )

    const tableElm = container.querySelector('.TableV2--table')
    expect(tableElm).toBeInTheDocument()

    const deleteIcon = container.querySelector('[data-test-id="deleteIcon_yVi1Q8cgQnaq-y1YqmELFQ"]')
    expect(deleteIcon).toBeDefined()

    act(() => {
      fireEvent.click(deleteIcon!)
    })

    expect(props.onResourceSelectionChange).toBeCalled()
  })
})
