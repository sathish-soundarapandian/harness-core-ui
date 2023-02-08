/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

process.env.TZ = 'GMT'
const config = require('./jest.config')
const { omit } = require('lodash-es')

module.exports = {
  ...omit(config, ['coverageThreshold', 'coverageReporters']),
  coverageReporters: ['text-summary', 'json-summary']
}
