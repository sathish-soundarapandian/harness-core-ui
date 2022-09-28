/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const _ = require('lodash')

module.exports = inputSchema => {
  return {
    ...inputSchema,
    components: {
      ...inputSchema.components,
      schemas: _.mapValues(inputSchema.components.schemas, (value, key) => {
        if (key === 'ParallelStageElementConfig' || key === 'ParallelStepElementConfig') {
          return value.properties.sections
        }

        return value
      })
    }
  }
}
