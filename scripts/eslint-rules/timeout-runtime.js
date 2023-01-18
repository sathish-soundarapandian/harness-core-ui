/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const { get } = require('lodash')

function isConfigureOptionsJSX(node) {
  return node && node.type === 'JSXElement' && node.openingElement.name.name === 'ConfigureOptions'
}

module.exports = {
  meta: {},

  create: function (context) {
    return {
      JSXElement(node) {
        if (get(node, 'openingElement.name.name') === 'FormMultiTypeDurationField') {
          if (get(node, 'parent.type') === 'JSXElement') {
            const selfIndex = node.parent.children.findIndex(c => c === node)
            const expressionSibling = node.parent.children.find(
              (c, i) => c.type === 'JSXExpressionContainer' && i > selfIndex
            )
            if (
              expressionSibling &&
              (isConfigureOptionsJSX(expressionSibling.expression.left) ||
                isConfigureOptionsJSX(expressionSibling.expression.right))
            ) {
              return context.report({
                node,
                message: 'Please use internal configure options'
              })
            }
          }
        }

        return null
      }
    }
  }
}
