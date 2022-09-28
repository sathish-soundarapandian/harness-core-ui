/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/**
 * CORRECT USAGE:
 *  getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME
 *
 * WRONG USAGE:
 *  someType === MultiTypeInputType.RUNTIME
 *  getMultiTypeFromValue(value, allowedTypes) === MultiTypeInputType.RUNTIME // must not be used with allowedTypes
 */
const { get } = require('lodash')

function isMultiTypeInputTypeRuntime(node) {
  return get(node, 'object.name') === 'MultiTypeInputType' && get(node, 'property.name') === 'RUNTIME'
}

function checkValidity(nodeA, nodeB) {
  return (
    get(nodeA, 'callee.name') === 'getMultiTypeFromValue' &&
    get(nodeA, 'arguments.length', 0) === 1 &&
    get(nodeB, 'object.name') === 'MultiTypeInputType' &&
    get(nodeB, 'property.name') === 'RUNTIME'
  )
}

module.exports = {
  meta: {
    docs: {
      description: `Give warning for statements 'someType === MultiTypeInputType.RUNTIME'`
    }
  },

  create: function (context) {
    return {
      BinaryExpression(node) {
        // check if one of the sides is `MultiTypeInputType.RUNTIME`
        if (!isMultiTypeInputTypeRuntime(node.left) && !isMultiTypeInputTypeRuntime(node.right)) {
          return null
        }

        if (!checkValidity(node.left, node.right) && !checkValidity(node.right, node.left)) {
          return context.report({
            node,
            message:
              'Direct comparision with "MultiTypeInputType.RUNTIME" is not allowed. Please use "isMultiTypeRuntime" from "@common/utils/utils"'
          })
        }
        return null
      }
    }
  }
}

/**
 T F => F  !(T || F)
 F T => F
 F F => T
 */
