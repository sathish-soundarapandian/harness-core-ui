/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getGatewayUrlPrefix } from '../CreateConnectorUtils'

describe('Test CreateConnectorUtils', () => {
  test('Test getGatewayUrlPrefix method for non PR-env url', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete global.window.location
    global.window = Object.create(window)
    global.window.location = {
      ...window.location,
      protocol: 'https',
      host: 'app.harness.io'
    }
    expect(getGatewayUrlPrefix()).toBe('https//app.harness.io/gateway')
  })

  test('Test getGatewayUrlPrefix method for PR-env url', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete global.window.location
    global.window = Object.create(window)
    global.window.location = {
      ...window.location,
      protocol: 'https',
      host: 'pr.harness.io/ci-1234'
    }
    expect(getGatewayUrlPrefix()).toBe('https//pr.harness.io/ci-1234/gateway')
  })
})
