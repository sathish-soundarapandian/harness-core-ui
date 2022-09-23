/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/**
 * A commit with test.skip() is by choice and test.only() is by mistake
 */

const defaultOptions = {
  block: ['describe', 'it', 'context', 'test', 'fixture'],
  fix: false
}

module.exports = {
  meta: {
    docs: {
      description: `disallow .only blocks in tests`
    },
    schema: [
      {
        type: 'object',
        properties: {
          block: {
            type: 'array',
            items: {
              type: 'string'
            },
            uniqueItems: true,
            default: defaultOptions.block
          },
          fix: {
            type: 'boolean',
            default: defaultOptions.fix
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const options = Object.assign({}, defaultOptions, context.options[0])
    const blocks = options.block || []
    const fix = !!options.fix

    return {
      Identifier(node) {
        const parentObject = node.parent && node.parent.object
        if (parentObject == null) return
        if (node.name !== 'only') return

        const callPath = getCallPath(node.parent).join('.')

        // comparison guarantees that matching is done with the beginning of call path
        if (
          blocks.find(block => {
            // Allow wildcard tail matching of blocks when ending in a `*`
            if (block.endsWith('*')) return callPath.startsWith(block.replace(/\*$/, ''))
            return callPath.startsWith(`${block}.`)
          })
        ) {
          context.report({
            node,
            message: callPath + ' not permitted',
            fix: fix ? fixer => fixer.removeRange([node.range[0] - 1, node.range[1]]) : undefined
          })
        }
      }
    }
  }
}

function getCallPath(node, path = []) {
  if (node) {
    const nodeName = node.name || (node.property && node.property.name)
    if (node.object) return getCallPath(node.object, [nodeName, ...path])
    if (node.callee) return getCallPath(node.callee, path)
    return [nodeName, ...path]
  }
  return path
}
