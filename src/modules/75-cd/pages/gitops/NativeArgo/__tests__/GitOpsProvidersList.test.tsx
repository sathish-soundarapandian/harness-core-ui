/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdngServices from 'services/cd-ng'
import GitOpsModalContainer from '../GitOpsProvidersList'
import { adapatersMockData } from './adaptersMockData'

const refetchConnectorList = () => Promise.resolve(adapatersMockData)
jest
  .spyOn(cdngServices, 'useListGitOpsProviders')
  .mockImplementation(() => ({ data: adapatersMockData, refetch: refetchConnectorList } as any))

const currentUser = {
  defaultAccountId: '123',
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ],
  uuid: '123'
}

const setup = () =>
  render(
    <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
      <GitOpsModalContainer />
    </TestWrapper>
  )

describe('GitOps Adapters List snapshot test', () => {
  test('should render GitOps Adapters List', () => {
    const { container } = setup()
    expect(container).toMatchSnapshot()
  })

  test('Render and check adapters', async () => {
    const { findByText: findByAdapterText } = setup()
    adapatersMockData?.data?.content?.forEach(adapter => {
      expect(findByAdapterText(adapter?.name)).toBeTruthy()
    })
  })

  test('Render search box', async () => {
    const { container } = setup()
    const searchBox = container?.querySelector('input[type="search"]')

    expect(searchBox).toBeTruthy()
  })

  test('Render and check create adapter panel', async () => {
    const { container } = setup()
    const newProviderBtn = container?.querySelector('#newProviderBtn')

    expect(newProviderBtn).toBeTruthy()

    act(() => {
      fireEvent.click(newProviderBtn!)
    })

    await waitFor(() => expect(document.getElementsByClassName('bp3-portal')[0]).toBeTruthy())
  })

  test('Render adapters list and open an adapter', async () => {
    const { container } = setup()
    const firstCard = container.querySelector('.uicore-masonry-layout--item-0')

    act(() => {
      fireEvent.click(firstCard!)
    })

    expect(container).toMatchSnapshot()
  })

  test('open adapter in edit mode', async () => {
    const { container } = setup()
    const firstCard = container.querySelector('.uicore-masonry-layout--item-0')
    const optionsMenu = firstCard && firstCard.querySelector('.bp3-icon-more')

    act(() => {
      fireEvent.click(optionsMenu!)
    })

    expect(container).toMatchSnapshot()
  })
})
