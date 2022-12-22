/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classnames from 'classnames'
import { Button, ButtonSize, ButtonVariation, Container } from '@harness/uicore'
import { isUndefined } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { JsonRawSelectedPathType } from './JsonSelectorType'
import css from './JsonSelector.module.scss'

export interface JsonSelectorProps {
  json: Record<string, any>
  className?: string
  onPathSelect?: (path: JsonRawSelectedPathType) => void
  showSelectButton?: boolean
}

const MAX_NESTING_LEVEL = 100

function visit(json: Record<string, any>, rows: Array<any>, path: Array<string> = []) {
  if (path.length === MAX_NESTING_LEVEL) {
    // This is the simple guard since the algorithm currently doesn't check
    // for backward references - it expects "config" json.
    throw new Error('max nesting level was reached.')
  }
  if (json) {
    for (const entry of Object.entries(json)) {
      if (typeof entry[1] === 'object' && entry[1] !== null) {
        rows.push({
          key: entry[0],
          path
        })
        visit(entry[1], rows, [...path, entry[0]])
        // TODO - When exactly we need to have empty rows?
        // rows.push(null);
      } else {
        rows.push({
          key: entry[0],
          value: entry[1],
          path
        })
      }
    }
  }
}

const calculateRows = (json: any) => {
  const rows: Array<any> = []
  // TODO - memoize ??
  visit(json, rows)
  return rows
}

const ident = (nestingLevel: number): string => {
  let ret = ''
  while (nestingLevel-- > 0) {
    ret += '\u00A0\u00A0\u00A0\u00A0'
  }
  return ret
}

const JsonSelector: React.FC<JsonSelectorProps> = ({ json, className, onPathSelect, showSelectButton }) => {
  const rows: Array<any> = calculateRows(json)

  const { getString } = useStrings()

  const onSelect = (row: JsonRawSelectedPathType): void => {
    if (onPathSelect) {
      onPathSelect(row)
    }
  }

  return (
    <Container className={classnames(css.jsonSelector, className)}>
      <div className={css.lineNumbersCol}>
        {rows.map((_, index) => (
          <div key={index} className={css.lineNumber}>
            {index + 1}
          </div>
        ))}
      </div>
      <div
        className={classnames(css.panel, {
          [css.panelV2]: showSelectButton
        })}
      >
        <div className={css.contentWrap}>
          {rows.map((row, index) => (
            <div
              key={index}
              className={classnames(css.editorRow, {
                [css.editorRowV2]: showSelectButton
              })}
            >
              {!!row && (
                <>
                  <span>{ident(row.path.length)}</span>
                  {isUndefined(row.value) && <span>{row.key}</span>}
                  {!isUndefined(row.value) && (
                    <span>
                      <span onClick={() => onSelect(row)} className={css.selectableKey}>
                        {row.key}
                      </span>
                      :&nbsp;{row.value}
                      {showSelectButton && (
                        <Button
                          onClick={() => onSelect(row)}
                          variation={ButtonVariation.SECONDARY}
                          size={ButtonSize.SMALL}
                        >
                          {getString('select')}
                        </Button>
                      )}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}

export default JsonSelector
