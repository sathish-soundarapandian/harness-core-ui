/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import routes from '@common/RouteDefinitions'
import GitSyncConfigTab from '../GitSyncConfigTab'
import mockFullSyncFiles from './mockFullSyncFiles.json'

const fetchFullSyncEntities = jest.fn().mockReturnValue(Promise.resolve(mockFullSyncFiles))
const mockReSync = jest.fn().mockResolvedValue({
  status: 'SUCCESS',
  data: { isFullSyncTriggered: true },
  metaData: null,
  correlationId: 'correlationId'
})

jest.mock('services/cd-ng', () => ({
  useListFullSyncFiles: jest
    .fn()
    .mockImplementation(() => ({ mutate: fetchFullSyncEntities, loading: false, data: mockFullSyncFiles.data })),
  triggerFullSyncPromise: jest.fn().mockImplementation(() => ({
    data: { isFullSyncTriggered: true },
    loading: false,
    refetch: mockReSync
  }))
}))

describe('Git Sync - Config tab', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

  test('rendering full sync entities', async () => {
    const { container, queryByText } = render(
      <GitSyncTestWrapper path={routes.toGitSyncConfig({ ...pathParams, module: 'cd' })} pathParams={pathParams}>
        <GitSyncConfigTab />
      </GitSyncTestWrapper>
    )
    act(() => {
      jest.runAllTimers()
    })

    await waitFor(() => expect(queryByText('entity one')).toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })
})
