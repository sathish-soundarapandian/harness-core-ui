/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AnserJsonEntry, ansiToJson } from 'anser'
import cx from 'classnames'
import { tokenize } from 'linkifyjs'

import css from './LogLine.module.scss'

function linkifyText(txt: string): string {
  return tokenize(txt)
    .map(token => {
      const content = token.toString()

      if (token.isLink) {
        return `<a href="${content}" class="ansi-decoration-link" target="_blank" rel="noreferrer">${content}</a>`
      }

      return content
    })
    .join('')
}

export function getAnserClasses(data: AnserJsonEntry): string {
  return cx(
    {
      [`${data.bg}-bg`]: data.bg,
      [`${data.fg}-fg`]: data.fg
    },
    ...(data.decorations || []).map(p => `ansi-decoration-${p}`)
  )
}

export interface LogLineProps {
  data: string
  skipLinkify?: boolean
  className?: string
}

export function LogLine(props: LogLineProps): React.ReactElement {
  const { data, skipLinkify, className } = props
  const anserJson = React.useMemo(() => {
    return ansiToJson(skipLinkify ? data : linkifyText(data), { use_classes: true })
  }, [data, skipLinkify])

  return (
    <span className={cx(css.logLine, className)}>
      {anserJson?.map((row, i) => {
        return (
          <span
            className={getAnserClasses(row)}
            key={`${row.content}_${i}`}
            dangerouslySetInnerHTML={{ __html: row.content }}
          />
        )
      })}
    </span>
  )
}

export const MemoizedLogLine = React.memo(LogLine)
