/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ConnectedArgoGitOpsInfoDTO } from 'services/cd-ng'
import TestConnection from '../TestConnection/TestConnection'

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({ text: '' })
  })
)

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

const props = {
  identifier: 'demoID',
  name: 'demoName',
  spec: {
    adapterUrl: 'https://34.136.244.5/'
  } as ConnectedArgoGitOpsInfoDTO
}

describe('TestConnection snapshot test', () => {
  test('should render TestConnection', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <TestConnection />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render on click finish', async () => {
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <TestConnection prevStepData={props} />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.click(getByText('finish'))
    })
    expect(getByText('cd.launchArgo')).toBeTruthy()
    await act(async () => {
      fireEvent.click(getByText('cd.launchArgo'))
    })

    expect(container).toMatchSnapshot()
  })

  test('test for error on fetch', async () => {
    global.fetch = jest.fn().mockImplementation(() => Promise.reject('URL is down'))
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <TestConnection
          prevStepData={{
            ...props,
            spec: {
              adapterUrl: ''
            } as ConnectedArgoGitOpsInfoDTO
          }}
        />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.click(getByText('finish'))
    })
    expect(getByText('back')).toBeTruthy()
    await act(async () => {
      fireEvent.click(getByText('back'))
    })
    expect(container).toMatchSnapshot()
  })
})
