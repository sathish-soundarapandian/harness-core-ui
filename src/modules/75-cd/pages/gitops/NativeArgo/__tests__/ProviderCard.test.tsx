/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, getByText } from '@testing-library/react'
import { findDialogContainer, TestWrapper, findPopoverContainer } from '@common/utils/testUtils'
import ProviderCard from '../ProviderCard/ProviderCard'

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

const provider = {
  name: 'Darwin Argo Dev Env',
  identifier: 'DarwinArgoDevEnv',
  baseURL: 'https://34.136.244.5',
  status: 'Active',
  type: 'nativeArgo',
  spec: {},
  tags: {
    demo: 'demo'
  },
  onDelete: jest.fn(),
  onEdit: jest.fn()
}

describe('ProviderCard snapshot test', () => {
  test('should render ProviderCard', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <ProviderCard provider={provider} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('open dailog', async () => {
    const { container, getByTestId } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <ProviderCard provider={provider} />
      </TestWrapper>
    )
    fireEvent.click(
      container.querySelector(
        '.bp3-card.bp3-interactive.bp3-elevation-0.Card--card.card.Card--interactive'
      ) as HTMLElement
    )
    const dailog = findDialogContainer()
    await expect(dailog).toBeTruthy()
    expect(dailog).toMatchSnapshot()
    expect(getByTestId('close-certi-upload-modal')).toBeDefined()
  })

  test('should open menu, edit and confirmation after delete', async () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <ProviderCard provider={provider} />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector("[data-icon='more']") as HTMLElement)
    const popover = findPopoverContainer()
    const fetching = (popover as HTMLElement, '[data-icon="more"]')
    expect(fetching).toBeDefined()
    expect(popover).toMatchSnapshot()
    fireEvent.click(document.querySelector('[data-icon="edit"]') as HTMLElement)

    fireEvent.click(document.querySelector('[data-icon="trash"]') as HTMLElement)
    let form = findDialogContainer()
    expect(form).toBeTruthy()
    expect(form).toMatchSnapshot()
    expect(getByText(document.body, 'delete')).toBeDefined()
    fireEvent.click(getByText(document.body, 'delete') as HTMLButtonElement)

    fireEvent.click(document.querySelector('[data-icon="trash"]') as HTMLElement)
    form = findDialogContainer()
    expect(form).toBeTruthy()
    expect(getByText(document.body, 'cancel')).toBeDefined()
    fireEvent.click(getByText(document.body, 'cancel') as HTMLButtonElement)
    expect(findDialogContainer()).toBeFalsy()
    expect(container).toMatchSnapshot()
  })
})
