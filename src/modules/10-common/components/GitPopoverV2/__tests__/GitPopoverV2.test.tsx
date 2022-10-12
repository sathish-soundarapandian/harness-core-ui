/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { act, findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { noop } from 'lodash-es'
import React from 'react'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { templatePathProps } from '@common/utils/routeUtils'
import { GitPopoverV2 } from '../GitPopoverV2'

const storeMetadata: StoreMetadata = {
  connectorRef: 'testConnector',
  storeType: 'REMOTE',
  repoName: 'testRepo',
  branch: 'testBranch',
  filePath: 'testFP'
}

const gitDetails = {
  repoName: 'testRepo',
  branch: 'testBranch',
  filePath: 'testFP',
  fileUrl: 'https://harness.io'
}

const mockBranches = {
  status: 'SUCCESS',
  data: {
    branches: [{ name: 'main' }, { name: 'main-demo' }, { name: 'main-patch' }, { name: 'dev' }],
    defaultBranch: { name: 'main' }
  },
  metaData: null,
  correlationId: 'correlationId'
}

const TEST_PATH = routes.toTemplateStudio(templatePathProps)
const TEST_PATH_PARAMS = {
  templateIdentifier: '-1',
  accountId: 'accountId',
  orgIdentifier: 'default',
  projectIdentifier: 'projectId',
  module: 'cd',
  templateType: 'Step'
}

const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))
jest.mock('services/cd-ng', () => ({
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  })
}))

describe('<GitPopoverV2 />', () => {
  test('snapshot', () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <GitPopoverV2 storeMetadata={storeMetadata} gitDetails={gitDetails} onGitBranchChange={noop} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('If storeType is INLINE', () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <GitPopoverV2 storeMetadata={{ storeType: 'INLINE' }} gitDetails={gitDetails} onGitBranchChange={noop} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
    expect(container.querySelector('.customButton')).not.toBeInTheDocument()
  })

  test('getActualTemplateValue', async () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <GitPopoverV2
          storeMetadata={storeMetadata}
          gitDetails={{
            repoName: 'testRepo2'
          }}
          onGitBranchChange={noop}
        />
      </TestWrapper>
    )

    fireEvent.mouseOver(container.querySelector('.customButton')!)
    await waitFor(() => expect(getByText('COMMON.GITDETAILSTITLE')).toBeInTheDocument())
    expect(getByText('testRepo2')).toBeInTheDocument()
  })

  test('readonly popover UI on hover', async () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <GitPopoverV2 storeMetadata={storeMetadata} gitDetails={gitDetails} isReadonly onGitBranchChange={noop} />
      </TestWrapper>
    )

    fireEvent.mouseOver(container.querySelector('.customButton')!)
    await waitFor(() => expect(getByText('COMMON.GITDETAILSTITLE')).toBeInTheDocument())
    expect(getByText('testRepo')).toBeInTheDocument()
    expect(getByText('https://harness.io')).toBeInTheDocument()
    expect(getByText('testBranch')).toBeInTheDocument()
  })

  test('change git branch', async () => {
    const onGitBranchChange = jest.fn()
    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <GitPopoverV2 storeMetadata={storeMetadata} gitDetails={gitDetails} onGitBranchChange={onGitBranchChange} />
      </TestWrapper>
    )

    fireEvent.mouseOver(container.querySelector('.customButton')!)
    await waitFor(() => expect(getByText('COMMON.GITDETAILSTITLE')).toBeInTheDocument())

    const dropdown = getByText('chevron-down')?.parentElement?.parentElement as HTMLInputElement

    act(() => {
      fireEvent.click(dropdown)
    })

    await waitFor(() => {
      expect(getByText('main')).toBeInTheDocument()
      expect(getByText('main-demo')).toBeInTheDocument()
      expect(getByText('main-patch')).toBeInTheDocument()
      expect(getByText('dev')).toBeInTheDocument()
    })

    const item = await findByText(document.body, 'main-patch')

    act(() => {
      fireEvent.click(item)
    })

    // test defaultSelected = false
    await waitFor(() => {
      expect(onGitBranchChange).toHaveBeenLastCalledWith({ branch: 'main-patch' })
    })
  })

  test('change git branch', async () => {
    const onGitBranchChange = jest.fn()
    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={TEST_PATH_PARAMS}>
        <GitPopoverV2 storeMetadata={storeMetadata} gitDetails={gitDetails} onGitBranchChange={onGitBranchChange} />
      </TestWrapper>
    )

    fireEvent.mouseOver(container.querySelector('.customButton')!)
    await waitFor(() => expect(getByText('COMMON.GITDETAILSTITLE')).toBeInTheDocument())

    const dropdown = getByText('chevron-down')?.parentElement?.parentElement as HTMLInputElement

    act(() => {
      fireEvent.click(dropdown)
    })

    await waitFor(() => {
      expect(getByText('main')).toBeInTheDocument()
      expect(getByText('main-demo')).toBeInTheDocument()
      expect(getByText('main-patch')).toBeInTheDocument()
      expect(getByText('dev')).toBeInTheDocument()
    })

    const item = await findByText(document.body, 'main-patch')

    act(() => {
      fireEvent.click(item)
    })

    // test defaultSelected = false
    await waitFor(() => {
      expect(onGitBranchChange).toHaveBeenLastCalledWith({ branch: 'main-patch' })
    })
  })
})
