/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const { get } = require('lodash')

const restrictedVariables = ['formName', 'data-tooltip-id']

module.exports = {
  meta: {
    docs: {
      description: 'Disallow specific variable identifiers'
    }
  },

  create: function (context) {
    return {
      VariableDeclaration(node) {
        const variableName = get(node, 'declarations[0].id.name')
        if (restrictedVariables.includes(variableName)) {
          return context.report({ node, message: `restricted variable name ${variableName} not allowed` })
        }
        return null
      }
    }
  }
}
