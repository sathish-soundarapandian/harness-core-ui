/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getYamlFileName } from '../yamlUtils'

describe('utils', () => {
  test('getYamlFileName', () => {
    // Case 1: pipeline is remote
    expect(
      getYamlFileName({
        isPipelineRemote: true,
        filePath: '.harness/test.yaml',
        defaultName: 'defaultName'
      })
    ).toBe('test.yaml')

    expect(
      getYamlFileName({
        isPipelineRemote: true,
        filePath: '.harness/abc/xyz/test.yaml',
        defaultName: 'defaultName'
      })
    ).toBe('test.yaml')

    // Case 2: pipeline is remote but this is create time so filePath is undefined
    expect(
      getYamlFileName({
        isPipelineRemote: true,
        defaultName: 'defaultName'
      })
    ).toBe('defaultName')

    // Case 3: pipeline is inline
    expect(
      getYamlFileName({
        defaultName: 'defaultName'
      })
    ).toBe('defaultName')
  })
})
