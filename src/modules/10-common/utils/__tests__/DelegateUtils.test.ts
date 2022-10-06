/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { delegateTypeToIcon } from '../delegateUtils'

describe('Test DelegateUtils', () => {
  test('should return helm delegate icon', () => {
    expect(delegateTypeToIcon('HELM_DELEGATE')).toBe('service-helm')
  })
  test('should return cube for unknow delegate type', () => {
    expect(delegateTypeToIcon('docker_cluster')).toBe('cube')
  })
  test('should return valid icons', () => {
    expect(delegateTypeToIcon('SHELL_SCRIPT')).toBe('run-step')
    expect(delegateTypeToIcon('linux')).toBe('cube')
    expect(delegateTypeToIcon('DOCKER')).toBe('service-dockerhub')
  })
})
