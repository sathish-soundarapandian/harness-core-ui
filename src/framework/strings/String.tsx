/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { render } from 'mustache'
import { get } from 'lodash-es'

import { useStringsContext, StringKeys } from './StringsContext'

export interface UseStringsReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getString(key: StringKeys, vars?: Record<string, any>): string
}

export function useStrings(): UseStringsReturn {
  const { data: strings, getString: getStringFromContext } = useStringsContext()

  const getString: UseStringsReturn['getString'] = useCallback(
    (key: StringKeys, vars: Record<string, unknown> = {}) => {
      if (getStringFromContext) {
        return getStringFromContext(key, vars)
      }

      const template = get(strings, key)

      if (typeof template !== 'string') {
        throw new Error(`No valid template with id "${key}" found in any namespace`)
      }

      return render(template, { ...vars, $: strings })
    },
    [getStringFromContext, strings]
  )

  return {
    getString
  }
}

export interface StringProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  stringID: StringKeys
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vars?: Record<string, any>
  useRichText?: boolean
  tagName: keyof JSX.IntrinsicElements
}

export function String(props: StringProps): React.ReactElement | null {
  const { stringID, vars, useRichText, tagName: Tag, ...rest } = props
  const { getString } = useStrings()

  try {
    const text = getString(stringID, vars)

    return useRichText ? (
      <Tag {...(rest as unknown)} dangerouslySetInnerHTML={{ __html: text }} />
    ) : (
      <Tag {...(rest as unknown)}>{text}</Tag>
    )
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      return <Tag style={{ color: 'var(--red-500)' }}>{e.message}</Tag>
    }

    return null
  }
}

String.defaultProps = {
  tagName: 'span'
}
