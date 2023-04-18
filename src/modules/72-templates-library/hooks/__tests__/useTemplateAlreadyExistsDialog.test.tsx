/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { useTemplateAlreadyExistsDialog } from '@templates-library/hooks/useTemplateAlreadyExistsDialog'

jest.mock('framework/strings', () => ({
  ...(jest.requireActual('framework/strings') as any),
  useStrings: jest.fn().mockReturnValue({
    getString: jest.fn().mockImplementation(val => val)
  })
}))

const confirmationCallbackMock = jest.fn().mockImplementation(() => Promise.resolve())
const closeCallbackMock = jest.fn()

const props = {
  onConfirmationCallback: confirmationCallbackMock,
  onCloseCallback: closeCallbackMock
}

describe('useTemplateAlreadyExistsDialog', () => {
  test('it should return correct function', () => {
    const { result } = renderHook(() => useTemplateAlreadyExistsDialog(props))

    expect(Object.keys(result.current)).toHaveLength(1)
    expect(result.current).toHaveProperty('openTemplateAlreadyExistsDialog')
  })
})
