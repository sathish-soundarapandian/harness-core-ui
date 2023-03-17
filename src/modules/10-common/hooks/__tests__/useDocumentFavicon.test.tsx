/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { useDocumentFavicon } from '../useDocumentFavicon'

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)

const linkElementMockIco = { href: 'default' }
const linkElementMockPng = { href: 'default' }

const favIconDetailsForSuccessMock = {
  STATIC: {
    ICO: 'favicon-success-test.ico',
    PNG: 'favicon-success-test.png'
  },
  CDN: {
    ICO: 'https://static.harness.io/ng-static/images/favicon-success-test.ico',
    PNG: 'https://static.harness.io/ng-static/images/favicon-success-test.png'
  }
}

const favIconDetailsForFailedMock = {
  STATIC: {
    ICO: 'favicon-failed-test.ico',
    PNG: 'favicon-failed-test.png'
  },
  CDN: {
    ICO: 'https://static.harness.io/ng-static/images/favicon-failed-test.ico',
    PNG: 'https://static.harness.io/ng-static/images/favicon-failed-test.png'
  }
}

describe('useDocumentFavicon tests', () => {
  const getElementByIdMock = jest.fn().mockImplementation((id: string) => {
    if (id === 'favicon-x-icon') {
      return linkElementMockIco
    } else if (id === 'favicon-png') {
      return linkElementMockPng
    }
  })
  document.getElementById = getElementByIdMock

  afterEach(() => {
    window.HARNESS_ENABLE_CDN = false
    window.deploymentType = 'SAAS'
  })

  test('when pipeline execution status is success and CDN is enabled', async () => {
    window.HARNESS_ENABLE_CDN = true

    renderHook(() => useDocumentFavicon(favIconDetailsForSuccessMock), { wrapper })

    expect(getElementByIdMock).toHaveBeenCalledWith('favicon-x-icon')
    expect(getElementByIdMock).toHaveBeenCalledWith('favicon-png')

    expect(linkElementMockIco.href).toEqual('https://static.harness.io/ng-static/images/favicon-success-test.ico')
    expect(linkElementMockPng.href).toEqual('https://static.harness.io/ng-static/images/favicon-success-test.png')
  })

  test('when pipeline execution status is failed and CDN is enabled', async () => {
    window.HARNESS_ENABLE_CDN = true

    renderHook(() => useDocumentFavicon(favIconDetailsForFailedMock), { wrapper })

    expect(getElementByIdMock).toHaveBeenCalledWith('favicon-x-icon')
    expect(getElementByIdMock).toHaveBeenCalledWith('favicon-png')

    expect(linkElementMockIco.href).toEqual('https://static.harness.io/ng-static/images/favicon-failed-test.ico')
    expect(linkElementMockPng.href).toEqual('https://static.harness.io/ng-static/images/favicon-failed-test.png')
  })

  test('when pipeline execution status is success and deployment type is ON_PREM', async () => {
    window.deploymentType = 'ON_PREM'

    renderHook(() => useDocumentFavicon(favIconDetailsForSuccessMock), { wrapper })

    expect(getElementByIdMock).toHaveBeenCalledWith('favicon-x-icon')
    expect(getElementByIdMock).toHaveBeenCalledWith('favicon-png')

    expect(linkElementMockIco.href).toEqual('/ng/static/favicon-success-test.ico')
    expect(linkElementMockPng.href).toEqual('/ng/static/favicon-success-test.png')
  })

  test('when pipeline execution status is failed and deployment type is ON_PREM', async () => {
    window.deploymentType = 'ON_PREM'

    renderHook(() => useDocumentFavicon(favIconDetailsForFailedMock), { wrapper })

    expect(getElementByIdMock).toHaveBeenCalledWith('favicon-x-icon')
    expect(getElementByIdMock).toHaveBeenCalledWith('favicon-png')

    expect(linkElementMockIco.href).toEqual('/ng/static/favicon-failed-test.ico')
    expect(linkElementMockPng.href).toEqual('/ng/static/favicon-failed-test.png')
  })
})
