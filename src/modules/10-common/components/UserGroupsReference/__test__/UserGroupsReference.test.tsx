/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import UserGroupsReference from '@common/components/UserGroupsReference/UserGroupsReference'
import { TestWrapper } from '@common/utils/testUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getUserGroupAggregateListPromise, getBatchUserGroupListPromise } from 'services/cd-ng'
import { userGroupAggregateListMock, batchUserGroupListMock } from './usergroupMockData'

jest.mock('services/cd-ng', () => ({
  getUserGroupAggregateListPromise: jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      resolve({ data: userGroupAggregateListMock.data, refetch: jest.fn(), error: null, loading: false })
    })
  }),
  getBatchUserGroupListPromise: jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      resolve({ data: batchUserGroupListMock.data, refetch: jest.fn(), error: null, loading: false })
    })
  })
}))

describe('Test full flow', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render rows with checkbox and return selected data back', async () => {
    let onSelectDataBool = false
    const { container, findByText } = render(
      <TestWrapper>
        <UserGroupsReference
          onSelect={data => {
            if (data[0].identifier === 'ug1') {
              onSelectDataBool = true
            }
          }}
          scope={Scope.ACCOUNT}
        />
      </TestWrapper>
    )
    const acctTab = await findByText('account')
    expect(acctTab).toBeTruthy()
    const row = await findByText('User Group 1')
    expect(row).toBeTruthy()
    expect(container).toMatchSnapshot()
    const checkbox = container.querySelector("[class*='bp3-checkbox']") as Element
    expect(checkbox).toBeTruthy()
    fireEvent.click(row)
    expect(container).toMatchSnapshot()
    const applyBtn = await findByText('entityReference.apply')
    expect(onSelectDataBool).toBeFalsy()
    fireEvent.click(applyBtn)
    expect(onSelectDataBool).toBeTruthy()
  })
})

describe(`testing <UserGroupsReference /> when identifierFilter prop is/isn't passed`, () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should call getUserGroupAggregateListPromise when identifierFilter is not passed', async () => {
    render(
      <TestWrapper>
        <UserGroupsReference onSelect={jest.fn()} scope={Scope.ACCOUNT} />
      </TestWrapper>
    )

    const acctTab = await screen.findByText('account')
    expect(acctTab).toBeTruthy()
    const row = screen.getByText('User Group 1')
    expect(row).toBeTruthy()

    expect(getUserGroupAggregateListPromise).toHaveBeenCalledTimes(1)
    expect(getBatchUserGroupListPromise).not.toHaveBeenCalled()
  })

  test('should call getBatchUserGroupListPromise when identifierFilter is passed', async () => {
    render(
      <TestWrapper>
        <UserGroupsReference onSelect={jest.fn()} scope={Scope.ACCOUNT} identifierFilter={['foo_group']} />
      </TestWrapper>
    )

    const acctTab = await screen.findByText('account')
    expect(acctTab).toBeTruthy()
    const row = screen.getByText('foo group')
    expect(row).toBeTruthy()

    expect(getBatchUserGroupListPromise).toHaveBeenCalledTimes(1)
    expect(getUserGroupAggregateListPromise).not.toHaveBeenCalled()
  })
})
