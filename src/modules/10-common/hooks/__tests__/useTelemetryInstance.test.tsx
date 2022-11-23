/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { useTelemetryInstance } from '../useTelemetryInstance'

const identifyMock = jest.fn()

jest.mock('@harness/telemetry', () => {
  return jest.fn().mockImplementation(() => {
    return {
      initialized: true,
      identify: jest.fn().mockImplementation(userId => {
        identifyMock(userId)
      })
    }
  })
})

// this is to overwrite the global mock for useTelemetryInstance in setup-file
jest.mock('../useTelemetryInstance', () => ({
  ...(jest.requireActual('../useTelemetryInstance') as any)
}))

describe('useTelemetryInstance', () => {
  test('useTelemetryInstance with stub', () => {
    const userId = 'random'
    window.deploymentType = 'ON_PREM'
    const { result } = renderHook(() => useTelemetryInstance())
    result.current.identify(userId)
    expect(identifyMock).not.toHaveBeenCalledWith(userId)
  })

  test('useTelemetryInstance no stub', () => {
    const userId = 'random'
    window.deploymentType = 'SAAS'
    const { result } = renderHook(() => useTelemetryInstance())
    result.current.identify(userId)
    expect(identifyMock).toHaveBeenCalledWith(userId)
  })
})
