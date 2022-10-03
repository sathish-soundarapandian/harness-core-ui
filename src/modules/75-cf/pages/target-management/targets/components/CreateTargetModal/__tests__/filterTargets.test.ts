/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TargetData } from '../types'
import filterTargets from '../filterTargets'

describe('filterTargets', () => {
  test('it should leave targets with name and identifier alone', async () => {
    const targets: TargetData[] = [
      { name: 'test 1', identifier: 't1' },
      { name: 'test 2', identifier: 't2' },
      { name: 'test 3', identifier: 't3' }
    ]

    expect(filterTargets(targets)).toEqual(targets)
  })

  test('it should filter out targets with empty name', async () => {
    const targets: TargetData[] = [
      { name: 'test 1', identifier: 't1' },
      { name: '', identifier: 't2' },
      { name: 'test 3', identifier: 't3' }
    ]

    const result = filterTargets(targets)
    expect(result).toContain(targets[0])
    expect(result).not.toContain(targets[1])
    expect(result).toContain(targets[2])
  })

  test('it should filter out targets with empty identifier', async () => {
    const targets: TargetData[] = [
      { name: 'test 1', identifier: 't1' },
      { name: 'test 2', identifier: '' },
      { name: 'test 3', identifier: 't3' }
    ]

    const result = filterTargets(targets)
    expect(result).toContain(targets[0])
    expect(result).not.toContain(targets[1])
    expect(result).toContain(targets[2])
  })
})
