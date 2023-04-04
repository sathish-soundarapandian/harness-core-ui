/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isPlainObject, toPairs, startCase, isEmpty, isNil, toString, truncate } from 'lodash-es'
import { Collapse as BPCollapse, Icon } from '@blueprintjs/core'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import { CopyText } from '@common/components/CopyText/CopyText'
import { toVariableStr } from '@common/utils/StringUtils'

import { LinkifyText } from '@common/components/LinkifyText/LinkifyText'
import css from './InputOutputTab.module.scss'

const blackListKeys = ['step', 'parallel']
const MAX_VALUE_LENGTH = 3_000

function Collapse(props: React.PropsWithChildren<{ title: string }>): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(true)

  function toggle(): void {
    setIsOpen(status => !status)
  }

  return (
    <div className={css.panel} data-status={isOpen ? 'open' : 'close'}>
      <div className={css.panelTitle} onClick={toggle}>
        <Icon icon="chevron-up" />
        <span>{props.title}</span>
      </div>
      <BPCollapse isOpen={isOpen}>{props.children}</BPCollapse>
    </div>
  )
}

export interface InputOutputTabRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
  level: number
  prefix: string
  isMultiline: boolean
  /** The maximum length of the rendered value of each entry in `data` */
  maxValueLength: number
}

export function InputOutputTabRow(props: InputOutputTabRowProps): React.ReactElement {
  return (
    <React.Fragment>
      {toPairs(props.data).map(([key, value]) => {
        const isDescriptionField = key.toLowerCase().endsWith('description')

        if (key.startsWith('_') || isNil(value)) return null

        let newKey = `${props.prefix}.${key}`

        // if key includes '.' or '-', we need to split
        if (key.includes('.') || key.includes('-')) {
          newKey = `${props.prefix}.get("${key}")`
        }

        if (blackListKeys.includes(key.toLowerCase()) || key.toLowerCase().endsWith('definition')) {
          newKey = props.prefix
        }

        if (isPlainObject(value)) {
          if (isEmpty(value)) return null

          return (
            <Collapse key={key} title={startCase(key)}>
              <InputOutputTabRow
                prefix={newKey}
                data={value}
                level={props.level + 1}
                isMultiline={props.isMultiline}
                maxValueLength={props.maxValueLength}
              />
            </Collapse>
          )
        }

        if (Array.isArray(value)) {
          if (isEmpty(value)) return null

          if (value.every(e => typeof e === 'string')) {
            const joinedValue = value.join(', ')
            const valueToRender = truncate(joinedValue, {
              length: props.maxValueLength
            })

            return (
              <div className={css.ioRow} key={key}>
                <div className={css.key}>
                  <CopyText textToCopy={toVariableStr(newKey)}>{key}</CopyText>
                </div>
                <div className={css.value}>
                  <CopyText textToCopy={joinedValue}>{valueToRender}</CopyText>
                </div>
              </div>
            )
          }

          return (
            <Collapse key={key} title={startCase(key)}>
              {value.map((item, index) => {
                return (
                  <Collapse key={`${key}[${index}]`} title={`${startCase(key)}[${index}]`}>
                    <InputOutputTabRow
                      key={`${newKey}[${index}]`}
                      prefix={`${newKey}[${index}]`}
                      data={item}
                      level={props.level + 1}
                      isMultiline={props.isMultiline}
                      maxValueLength={props.maxValueLength}
                    />
                  </Collapse>
                )
              })}
            </Collapse>
          )
        }

        const valueToRender = truncate(toString(value), {
          length: props.maxValueLength
        })

        return (
          <div className={css.ioRow} key={key}>
            <div data-fqn={newKey} className={css.key}>
              <CopyText textToCopy={toVariableStr(newKey)}>{key}</CopyText>
            </div>
            <div className={css.value}>
              <CopyText textToCopy={value.toString()} className={css.valueText}>
                <LinkifyText
                  content={valueToRender}
                  textProps={
                    isDescriptionField && props.isMultiline
                      ? { style: { wordBreak: 'break-word', whiteSpace: 'pre-wrap' } }
                      : {}
                  }
                />
              </CopyText>
            </div>
          </div>
        )
      })}
    </React.Fragment>
  )
}

export interface InputOutputTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>
  mode: 'input' | 'output'
  baseFqn?: string
  isMultiline?: boolean
  /** The maximum length of the rendered value of each entry in `data` */
  maxValueLength?: number
}

export function InputOutputTab(props: InputOutputTabProps): React.ReactElement {
  const { mode, baseFqn = '', data, isMultiline, maxValueLength = MAX_VALUE_LENGTH } = props
  const { getString } = useStrings()

  if (!data || isEmpty(data)) {
    return (
      <div className={css.ioTab} data-empty="true">
        {getString(
          mode === 'output' ? 'pipeline.execution.iotab.noOutputText' : 'pipeline.execution.iotab.noInputText'
        )}
      </div>
    )
  }

  return (
    <div className={css.ioTab}>
      <div className={cx(css.ioRow, css.header)}>
        <div>{getString(mode === 'input' ? 'inputName' : 'outputName')}</div>
        <div>{getString(mode === 'input' ? 'inputValue' : 'outputValue')}</div>
      </div>
      <InputOutputTabRow
        prefix={baseFqn}
        data={data}
        level={0}
        isMultiline={!!isMultiline}
        maxValueLength={maxValueLength}
      />
    </div>
  )
}
