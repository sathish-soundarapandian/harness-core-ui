import { render } from '@testing-library/react'
import React from 'react'
import { useCommonHealthSource } from '../useCommonHealthSource'

describe('useCommonHealthSource', () => {
  function TestComponent(): JSX.Element {
    useCommonHealthSource()
    return <div>test</div>
  }
  test('useCommonHealthSource should throw error, if it is used outside of CommonHealthSourceContext', () => {
    expect(() => render(<TestComponent />)).toThrow('Place useCustomHealthSource within CommonHealthSourceContex')
  })
})
