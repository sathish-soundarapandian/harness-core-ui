/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook, act } from '@testing-library/react-hooks'
import { CollapsedNodeActionType, CollapsedNodeProvider, useCollapsedNodeStore } from '../CollapsedNodeStore'

describe('CollapsedNodeStore', () => {
  test('useCollapsedNodeStore should throw an error if not used within provider', () => {
    const { result } = renderHook(() => useCollapsedNodeStore())

    expect(result.error).toEqual(Error('useCollapsedNodeStore should be used within CollapsedNodeProvider'))
  })

  test('useCollapsedNodeStore should not throw when used within provider', () => {
    const { result } = renderHook(() => useCollapsedNodeStore(), { wrapper: CollapsedNodeProvider })

    expect(result.current).not.toBe(undefined)
    expect(result.error).toBe(undefined)
  })

  test('dispatching CollapsedNodeActionType.custom action works as expected', () => {
    const { result } = renderHook(() => useCollapsedNodeStore(), { wrapper: CollapsedNodeProvider })

    const [state, dispatch] = result.current

    expect(state).toEqual({ visibilityMap: new Map() })

    act(() => {
      dispatch({
        type: CollapsedNodeActionType.custom,
        payload: {
          visibilityMap: new Map([['a', true]])
        }
      })
    })

    expect(result.current.at(0)).toEqual({ visibilityMap: new Map([['a', true]]) })

    act(() => {
      dispatch({
        type: CollapsedNodeActionType.custom,
        callback: prev => {
          const updatedMap = new Map(prev.visibilityMap)
          updatedMap.set('b', false)
          return { ...prev, visibilityMap: updatedMap }
        }
      })
    })

    expect(result.current.at(0)).toEqual({
      visibilityMap: new Map([
        ['a', true],
        ['b', false]
      ])
    })
  })
})
