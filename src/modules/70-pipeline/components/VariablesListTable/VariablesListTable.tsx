/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { isPlainObject, get, isNil, escape, defaultTo, find } from 'lodash-es'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { Text, useNestedAccordion } from '@wings-software/uicore'
import type { VariableResponseMapValue } from 'services/pipeline-ng'
import { TextInputWithCopyBtn } from '@common/components/TextInputWithCopyBtn/TextInputWithCopyBtn'

import {
  getTextWithSearchMarkers,
  SearchResult,
  usePipelineVariables
} from '../PipelineVariablesContext/PipelineVariablesContext'
import css from './VariablesListTable.module.scss'

export interface VariableListTableProps<T = Record<string, any>> {
  data: T
  originalData: T
  metadataMap: Record<string, VariableResponseMapValue>
  className?: string
}

export function VariablesListTable<T>(props: VariableListTableProps<T>): React.ReactElement | null {
  const { data, metadataMap, originalData, className } = props
  const { searchText, searchIndex, searchResults = [] } = usePipelineVariables()
  const searchedEntity = defaultTo(searchResults[searchIndex || 0], {} as SearchResult)
  const tableRef = React.useRef()
  const [hoveredVariable, setHoveredVariable] = useState<Record<string, boolean>>({})
  const { openNestedPath } = useNestedAccordion()
  React.useLayoutEffect(() => {
    if (tableRef.current) {
      const { testid: accordianId = '', open } = defaultTo(
        (tableRef?.current as any)?.closest?.('.Accordion--panel')?.dataset,
        {}
      )
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

  const getIdentifierYamlProps = useMemo(() => {
    const uuid = get(data, '__uuid', '')
    const metadata = metadataMap?.[uuid]
    const yamlProps = metadata?.yamlExtraProperties?.properties
    const yamlPropsIdentifier = find(yamlProps, { variableName: 'identifier' })
    return yamlPropsIdentifier
  }, [data, metadataMap])

  if (!data || !originalData || !metadataMap) return null

  return (
    <div className={cx(css.variablesListTable, className)} ref={tableRef as any}>
      {Object.entries(data || {}).map(([key, value]) => {
        if (typeof value !== 'string' || key === '__uuid' || isNil(value)) return null
        const metadata = metadataMap[value]

        const finalvalue = get(originalData, key)
        let formattedValue
        if (Array.isArray(finalvalue)) {
          formattedValue = finalvalue
            .map(item => (isPlainObject(item) ? JSON.stringify(item, null, 2) : item))
            .join(', ')
        } else if (isPlainObject(finalvalue)) {
          formattedValue = JSON.stringify(finalvalue, null, 2)
        } else {
          formattedValue = finalvalue
        }

        const yamlProps =
          key !== 'identifier'
            ? defaultTo(metadata?.yamlProperties, metadata?.yamlOutputProperties)
            : getIdentifierYamlProps

        if (
          (key !== 'identifier' && isNil(metadata)) ||
          isNil(formattedValue) ||
          (key === 'identifier' && isNil(yamlProps))
        )
          return null
        const variableNameParts = defaultTo(yamlProps?.localName?.split('.'), [])
        const variableName = variableNameParts[variableNameParts?.length - 1]
        const searchedEntityType = defaultTo(searchedEntity?.type, null)
        formattedValue = formattedValue.toString()
        const hasSameMetaKeyId = searchedEntity?.metaKeyId === value
        const isValidValueMatch = `${formattedValue}`?.toLowerCase()?.includes(searchText?.toLowerCase() || '')
        return (
          <div
            key={key}
            className={cx(
              css.variableListRow,
              'variable-list-row',
              hoveredVariable[variableName] ? css.hoveredRow : ''
            )}
            onMouseLeave={() => setHoveredVariable({ [variableName]: false })}
          >
            {hoveredVariable[variableName] ? (
              <div className={cx(css.nameSection, css.nameSectionWithCopy)}>
                <TextInputWithCopyBtn
                  name=""
                  disabled
                  label=""
                  localName={yamlProps?.localName}
                  fullName={yamlProps?.fqn}
                  popoverWrapperClassName={css.copyOptionPopoverWrapper}
                  textInputClassName={css.copyOptionTextInput}
                  staticDisplayValue={variableName}
                />
              </div>
            ) : (
              <span
                className={cx(css.nameSection, {
                  'selected-search-text': searchedEntityType === 'key' && hasSameMetaKeyId
                })}
                onMouseOver={() => {
                  setHoveredVariable({ [variableName]: true })
                }}
                dangerouslySetInnerHTML={{
                  __html: getTextWithSearchMarkers({
                    searchText: escape(searchText),
                    txt: escape(variableName),
                    className: cx(css.selectedSearchText, {
                      [css.currentSelection]: searchedEntityType === 'key' && hasSameMetaKeyId
                    })
                  })
                }}
              />
            )}

            <Text
              className={css.valueSection}
              font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}
              padding={{ left: 'medium' }}
              color={Color.BLACK_100}
              lineClamp={1}
            >
              <span
                className={cx({
                  'selected-search-text': searchedEntityType === 'value' && hasSameMetaKeyId
                })}
                dangerouslySetInnerHTML={{
                  __html: getTextWithSearchMarkers({
                    searchText: escape(searchText),
                    txt: escape(formattedValue),
                    className: cx(css.selectedSearchText, {
                      [css.currentSelection]: searchedEntityType === 'value' && hasSameMetaKeyId && isValidValueMatch
                    })
                  })
                }}
              />
            </Text>
          </div>
        )
      })}
    </div>
  )
}
