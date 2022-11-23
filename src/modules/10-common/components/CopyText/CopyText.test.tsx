/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { Utils } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { CopyText } from './CopyText'

describe('<CopyText /> tests', () => {
  // Utility method
  const setSecureContext = (value = false): void => {
    if (global.isSecureContext === undefined) {
      Object.defineProperty(global, 'isSecureContext', {
        value,
        writable: true
      })
    } else {
      global.isSecureContext = value
    }
  }

  test('snapshot test with explicit secure context true', () => {
    const originalIsSecureContext = window.isSecureContext
    setSecureContext(true)
    const { container } = render(<CopyText textToCopy="Hello World">Hello World</CopyText>)
    expect(container).toMatchSnapshot()
    setSecureContext(originalIsSecureContext)
  })

  test('snapshot test with secure context falsy (undefined)', () => {
    // By Default, window.isSecureContext will be undefined when running through jest
    const { container } = render(<CopyText textToCopy="Hello World">Hello World</CopyText>)
    expect(container).toMatchSnapshot()
  })

  test('Ensure copy text button works', async () => {
    const originalIsSecureContext = window.isSecureContext
    setSecureContext(true)
    const mockCopy = jest.fn()
    jest.spyOn(Utils, 'copy').mockImplementation(() => mockCopy())
    const { getByTestId } = render(
      <TestWrapper path="/account/:accountId/test" pathParams={{ accountId: 'dummy' }}>
        <CopyText textToCopy="Hello World">Hello World</CopyText>
      </TestWrapper>
    )
    const copyButton = getByTestId('copy-btn')
    expect(copyButton).toHaveClass('copyIcon')
    expect(copyButton).not.toHaveClass('successIcon')
    await act(async () => {
      fireEvent.click(copyButton!)
    })
    expect(mockCopy).toHaveBeenCalledTimes(1)
    expect(copyButton).toHaveClass('copyIcon')
    expect(copyButton).toHaveClass('successIcon')
    setSecureContext(originalIsSecureContext)
  })
})
