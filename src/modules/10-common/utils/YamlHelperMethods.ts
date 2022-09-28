/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* disable lint in this file as we are exporting wrappers */

// eslint-disable-next-line no-restricted-imports
import type { DumpOptions } from 'js-yaml'
// eslint-disable-next-line no-restricted-imports
import { load, dump } from 'js-yaml'
import { memoize } from 'lodash-es'

export const yamlStringify = (obj: unknown, options: Omit<DumpOptions, 'noRefs'> = {}): string => {
  return dump(obj, { noRefs: true, lineWidth: -1, quotingType: '"', ...options })
}

export function yamlParse<T = unknown>(input: string): T {
  return load(input) as T
}

export const memoizedParse = memoize(yamlParse)

/* re-export to maintain API with yaml package */
export const parse = yamlParse
export const stringify = yamlStringify
