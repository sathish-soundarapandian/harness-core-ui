/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, fireEvent, getByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import * as portalSvc from 'services/portal'
import { DelegateSelectorsV2Container } from '../DelegateSelectorsV2Container'
import { mockDelegateSelectorsResponse, mockSelectedData } from './DelegateSelectorsMockData'

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchyV2: jest.fn().mockImplementation(() => {
    return mockDelegateSelectorsResponse
  })
}))

const props = {
  urlParams: {
    accountId: 'accountId'
  },
  selectedItems: mockSelectedData,
  onTagInputChange: jest.fn(),
  pollingInterval: 200
}

const params = {
  accountId: 'testAcc'
}
const TEST_PATH = routes.toDelegates({
  ...accountPathProps
})
describe('test DelegateSelectorsContainerV2', () => {
  let renderObj: RenderResult
  beforeEach(() => {
    renderObj = render(
      <TestWrapper path={TEST_PATH} pathParams={params}>
        <DelegateSelectorsV2Container {...props} />
      </TestWrapper>
    )
  })
  afterEach(() => {
    renderObj.unmount()
  })
  test('snapshot test', async () => {
    expect(renderObj.container).toMatchSnapshot()
  })
  test('test cleanup function', async () => {
    const container = renderObj.container
    expect(container).toMatchSnapshot()
    renderObj.unmount()
    expect(container).toBeEmptyDOMElement()
  })
  test('select option tag', () => {
    const container = renderObj.container
    const inputBox = container.getElementsByClassName('bp3-multi-select-tag-input-input')[0]
    fireEvent.change(inputBox, { target: { value: 'delegate' } })
    const option = getByText(container, 'delegate1')
    fireEvent.click(option)
    expect(option).not.toBeNull()
  })
  test('should show the loader', () => {
    jest.spyOn(portalSvc, 'useGetDelegateSelectorsUpTheHierarchyV2').mockImplementation(
      () =>
        ({
          data: undefined,
          loading: true,
          refetch: jest.fn()
        } as any)
    )

    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={params}>
        <DelegateSelectorsV2Container {...props} />
      </TestWrapper>
    )
    expect(getByText(container, 'loading')).toBeInTheDocument()
  })
})
