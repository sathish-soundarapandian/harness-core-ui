/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { waitFor, render, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useStateWithQueryParams } from '../useStateWithQueryParams'

const INITIAL_VAL = 'initialVal'

jest.mock('@common/hooks/useQueryParams', () => ({
  useQueryParams: () => ({ search: INITIAL_VAL })
}))

const Component: React.FC<{ initialVal: string }> = ({ initialVal }) => {
  const [val, setVal] = useStateWithQueryParams({ key: 'search', defaultVal: initialVal })

  return (
    <>
      <span data-testid="val">{val}</span>
      <button data-testid="button" onClick={() => setVal('newVal')}>
        Click me
      </button>
    </>
  )
}

describe('useStateWithQueryParams tests', () => {
  test('test setVal', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <Component initialVal={INITIAL_VAL} />
      </TestWrapper>
    )
    expect(getByTestId('val').innerHTML).toEqual(INITIAL_VAL)
    act(() => {
      fireEvent.click(getByTestId('button'))
    })
    await waitFor(() => expect(getByTestId('val').innerHTML).toBe('newVal'))
  })
})
