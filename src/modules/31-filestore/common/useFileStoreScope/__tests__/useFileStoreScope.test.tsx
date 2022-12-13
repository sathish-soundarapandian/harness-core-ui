/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { Scope } from '@common/interfaces/SecretsInterface'

import { TestWrapper } from '@common/utils/testUtils'

import { useFileStoreScope } from '../useFileStoreScope'

function wrapper(props: any): JSX.Element {
  const { children } = props || {}
  return <TestWrapper>{children}</TestWrapper>
}

describe('Define useFileStoreScope hook', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should get account identifier', async () => {
    const { result } = renderHook(() => useFileStoreScope({ scope: Scope.ACCOUNT, isModalView: true }), { wrapper })

    expect(Object.keys(result.current).indexOf('accountIdentifier')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('orgIdentifier')).toBe(-1)
    expect(Object.keys(result.current).indexOf('projectIdentifier')).toBe(-1)
  })

  test('should get org identifier', async () => {
    const { result } = renderHook(() => useFileStoreScope({ scope: Scope.ORG, isModalView: true }), { wrapper })

    expect(Object.keys(result.current).indexOf('accountIdentifier')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('orgIdentifier')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('projectIdentifier')).toBe(-1)
  })

  test('should get project identifier', async () => {
    const { result } = renderHook(() => useFileStoreScope({ scope: Scope.PROJECT, isModalView: true }), { wrapper })

    expect(Object.keys(result.current).indexOf('accountIdentifier')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('orgIdentifier')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('projectIdentifier')).not.toBe(-1)
  })
})
