/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { ansiToJson, AnserJsonEntry } from 'anser'
import { tokenize } from 'linkifyjs'

import { getAnserClasses } from '@common/components/LogViewer/LogLine'
import { getRegexForSearch } from '../../LogsState/utils'
import type { LogLineData } from '../../LogsState/types'
import css from './MultiLogLine.module.scss'

export interface AnserJsonWithLink extends AnserJsonEntry {
  isLink: boolean
}

export interface TextWithSearchMarkersProps {
  txt?: string
  searchText?: string
  searchIndices?: number[]
  currentSearchIndex: number
  className?: string
}

export function TextWithSearchMarkers(props: TextWithSearchMarkersProps): React.ReactElement {
  const { searchText, txt, searchIndices, currentSearchIndex, className } = props
  if (!searchText) {
    return <span className={className}>{defaultTo(txt, '')}</span>
  }

  if (!txt) {
    return <span className={className} />
  }

  const searchRegex = getRegexForSearch(searchText)

  let match: RegExpExecArray | null
  const chunks: Array<{ start: number; end: number }> = []

  while ((match = searchRegex.exec(txt)) !== null) {
    /* istanbul ignore else */
    if (searchRegex.lastIndex > match.index) {
      chunks.push({
        start: match.index,
        end: searchRegex.lastIndex
      })

      if (match.index === searchRegex.lastIndex) {
        searchRegex.lastIndex++
      }
    }
  }

  let highlightedString = txt

  chunks.forEach((chunk, i) => {
    const startShift = highlightedString.length - txt.length
    const searchIndex = defaultTo(searchIndices?.[i], -1)
    const openMarkTags = `${highlightedString.slice(
      0,
      chunk.start + startShift
    )}<mark data-search-result-index="${searchIndex}" ${
      searchIndex === currentSearchIndex ? 'data-current-search-result="true"' : ''
    }>${highlightedString.slice(chunk.start + startShift)}`

    const endShift = openMarkTags.length - txt.length
    const closeMarkTags = `${openMarkTags.slice(0, chunk.end + endShift)}</mark>${openMarkTags.slice(
      chunk.end + endShift
    )}`

    highlightedString = closeMarkTags
  })

  return <span className={className} dangerouslySetInnerHTML={{ __html: highlightedString }} />
}

export function TextWithSearchMarkersAndLinks(props: TextWithSearchMarkersProps): React.ReactElement {
  const { searchText, txt, searchIndices, currentSearchIndex, className } = props

  if (!txt) {
    return <span className={className} />
  }

  const searchRegex = getRegexForSearch(defaultTo(searchText, ''))

  let offset = 0
  const tokens: AnserJsonWithLink[] = ansiToJson(txt, { use_classes: true }).flatMap(row => {
    const linkTokens = tokenize(row.content)

    return linkTokens.map(token => ({
      ...row,
      content: token.toString(),
      isLink: token.isLink
    }))
  })

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        let content: React.ReactChild = token.content
        const matches = searchText ? defaultTo(content.match(searchRegex), []) : []

        content = (
          <TextWithSearchMarkers
            searchText={searchText}
            currentSearchIndex={currentSearchIndex}
            txt={content}
            searchIndices={searchIndices?.slice(offset)}
          />
        )

        offset += matches.length

        if (token.isLink) {
          content = (
            <a href={token.content} className="ansi-decoration-link" target="_blank" rel="noreferrer">
              {content}
            </a>
          )
        }

        return (
          <span key={i} className={getAnserClasses(token)}>
            {content}
          </span>
        )
      })}
    </span>
  )
}

export interface MultiLogLineProps extends LogLineData {
  /**
   * Zero index based line number
   */
  lineNumber: number
  limit: number
  searchText?: string
  currentSearchIndex?: number
}

export function MultiLogLine(props: MultiLogLineProps): React.ReactElement {
  const { text = {}, lineNumber, limit, searchText = '', currentSearchIndex = 0, searchIndices } = props

  return (
    <div className={css.logLine} style={{ '--char-size': `${limit.toString().length}ch` } as any}>
      <span className={css.lineNumber}>{lineNumber + 1}</span>
      <TextWithSearchMarkers
        className={css.level}
        txt={text.level}
        searchText={searchText}
        searchIndices={searchIndices?.level}
        currentSearchIndex={currentSearchIndex}
      />
      <TextWithSearchMarkers
        className={css.time}
        txt={text.time}
        searchText={searchText}
        searchIndices={searchIndices?.time}
        currentSearchIndex={currentSearchIndex}
      />
      <TextWithSearchMarkersAndLinks
        className={css.out}
        txt={text.out}
        searchText={searchText}
        searchIndices={searchIndices?.out}
        currentSearchIndex={currentSearchIndex}
      />
    </div>
  )
}

export const MultiLogLineMemo = React.memo(MultiLogLine)
