/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getStringifyText, isValidJson } from '../ExternalAPICallContent.utils'

describe('ExternalAPICallContent', () => {
  test('should check isValidJson returns false if no input is passed', () => {
    const result = isValidJson()

    expect(result).toBe(false)
  })
  test('should check isValidJson returns false if invalid JSON string is passed', () => {
    const result = isValidJson('aa')

    expect(result).toBe(false)
  })

  test('should check isValidJson returns true if valid JSON string is passed', () => {
    const result = isValidJson('{"a": 123}')

    expect(result).toBe(true)
  })

  test('should check getStringifyText no data text if no data is present', () => {
    const result = getStringifyText('no data')

    expect(result).toBe('no data')
  })

  test('should check getStringifyText return stringified text if valid data is present', () => {
    const result = getStringifyText('no data', '{"a": 12}')

    expect(result).toBe(`{
    "a": 12
}`)
  })

  test('should check getStringifyText returns the data as it is if invalid JSON string is passed', () => {
    const result = getStringifyText('no data', 'a:12')

    expect(result).toBe('a:12')
  })
})
