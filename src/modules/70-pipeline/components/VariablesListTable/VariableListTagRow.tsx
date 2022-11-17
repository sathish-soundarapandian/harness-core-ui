/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { escape, isEmpty } from 'lodash-es'
import { useNestedAccordion } from '@harness/uicore'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import { TagsPopover } from '@common/components'
import { TextInputWithCopyBtn } from '@common/components/TextInputWithCopyBtn/TextInputWithCopyBtn'
import { getTextWithSearchMarkers, usePipelineVariables } from '../PipelineVariablesContext/PipelineVariablesContext'
import css from './VariablesListTable.module.scss'

export interface VariableRowProps {
  name: string
  fqn: string
  tags?: { [key: string]: string }
  metadataMap?: Record<string, VariableResponseMapValue>
  className?: string
  nameSectionClassName?: string
  valueSectionClassName?: string
}
export default function VariableListTagRow(props: VariableRowProps): React.ReactElement {
  const { searchText, searchIndex, searchResults = [] } = usePipelineVariables()
  const searchedEntity = searchResults[searchIndex || 0] || {}
  const tableRef = React.useRef()
  const { openNestedPath } = useNestedAccordion()
  const [hovered, setHovered] = useState(false)

  React.useLayoutEffect(() => {
    if (tableRef.current) {
      const { testid: accordianId = '', open } =
        (tableRef?.current as any)?.closest?.('.Accordion--panel')?.dataset || {}
      if (open === 'false') {
        openNestedPath(accordianId?.replace('-panel', ''))
        setTimeout(() => {
          document?.querySelector('span.selected-search-text')?.scrollIntoView({ behavior: 'smooth' })
        }, 500)
      } else {
        ;(tableRef?.current as any)?.querySelector('span.selected-search-text')?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [searchIndex, openNestedPath, searchText])
  const searchedEntityType = searchedEntity.type || null

  return (
    <div ref={tableRef as any} className={cx(css.variablesListTable, props.className)}>
      <div
        onMouseLeave={() => setHovered(false)}
        className={cx(css.variableListRow, 'variable-list-row', hovered ? css.hoveredRow : '')}
      >
        {hovered ? (
          <div className={cx(css.nameSection, props.nameSectionClassName, css.nameSectionWithCopy)}>
            <TextInputWithCopyBtn
              name=""
              disabled
              label=""
              localName={props.name}
              fullName={props.fqn}
              popoverWrapperClassName={css.copyOptionPopoverWrapper}
              textInputClassName={css.copyOptionTextInput}
              staticDisplayValue={props.name}
            />
          </div>
        ) : (
          <span
            className={cx(css.nameSection, {
              'selected-search-text': searchedEntityType === 'key' && searchedEntity.path?.includes('.tags.')
            })}
            onMouseOver={() => setHovered(true)}
            dangerouslySetInnerHTML={{
              __html: getTextWithSearchMarkers({
                searchText: escape(searchText),
                txt: escape(props.name),
                className: cx(css.selectedSearchText, {
                  [css.currentSelection]: false
                })
              })
            }}
          />
        )}

        <div className={cx(css.tagsValueSection, props.valueSectionClassName)}>
          {!isEmpty(props?.tags) && (
            <TagsPopover
              tags={Object.keys(props?.tags || {})
                .filter(tag => tag !== '__uuid')
                .reduce((acc: { [key: string]: string }, tag: string) => {
                  acc[tag] = ''
                  return acc
                }, {})}
            />
          )}
        </div>
      </div>
    </div>
  )
}
