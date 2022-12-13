/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Checkbox, Container, Icon, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Popover, Position, TagInput } from '@blueprintjs/core'
import { Virtuoso } from 'react-virtuoso'
import { xor } from 'lodash-es'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import {
  QlceViewFilterOperator,
  QlceViewFilterWrapperInput,
  useFetchPerspectiveFiltersValueQuery,
  ViewFieldIdentifier
} from 'services/ce/services'
import type { QLCEViewFilterWrapper } from 'services/ce'

import css from '../RecommendationFilters.module.scss'

const LIMIT = 100

interface LabelFilterDropdownProps {
  labelFilters: QLCEViewFilterWrapper[]
  setLabelFilters: (newVal: QLCEViewFilterWrapper[]) => void
}

const LabelFilterDropdown: React.FC<LabelFilterDropdownProps> = ({ setLabelFilters, labelFilters }) => {
  const { getString } = useStrings()

  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)

  const [keysPopoverOpen, setKeysPopoverOpen] = useState(false)
  const [selectedLabelKey, setSelectedLabelKey] = useState<string>()
  const [valuesList, setValuesList] = useState<string[]>([])
  const [fetchMoreValues, setFetchMoreValues] = useState(true)

  const [labelKeysData] = useFetchPerspectiveFiltersValueQuery({
    variables: {
      filters: [
        {
          idFilter: {
            field: {
              fieldId: 'labels.key',
              fieldName: '',
              identifier: ViewFieldIdentifier.Label,
              identifierName: 'Label'
            },
            operator: QlceViewFilterOperator.In,
            values: []
          }
        } as unknown as QlceViewFilterWrapperInput
      ],
      limit: 1000,
      offset: 0
    },
    pause: !keysPopoverOpen
  })

  const [labelKeyValuesData] = useFetchPerspectiveFiltersValueQuery({
    variables: {
      filters: [
        {
          idFilter: {
            field: {
              fieldId: 'labels.value',
              fieldName: selectedLabelKey,
              identifier: ViewFieldIdentifier.Label,
              identifierName: 'Label'
            },
            operator: QlceViewFilterOperator.In,
            values: []
          }
        } as unknown as QlceViewFilterWrapperInput
      ],
      limit: LIMIT,
      offset: (page - 1) * LIMIT
    },
    pause: !selectedLabelKey
  })

  const labelsKeys = labelKeysData.data?.perspectiveFilters?.values
  const labelKeyValues = labelKeyValuesData.data?.perspectiveFilters?.values as string[]

  useEffect(() => {
    setFetchMoreValues(labelKeyValues?.length === LIMIT)

    if (labelKeyValues?.length) {
      if (page === 0) {
        setValuesList(labelKeyValues)
      } else {
        setValuesList(prevVal => [...prevVal, ...labelKeyValues])
      }
    }
  }, [JSON.stringify(labelKeyValues)])

  const filteredLabelKeys = labelsKeys?.filter(keys => keys?.toLowerCase()?.includes(searchText.toLowerCase()))

  const inputTags = useMemo(() => {
    const tags: string[] = []

    labelFilters.forEach(item => {
      item.idFilter?.values?.forEach(val => {
        tags.push(`${item.idFilter?.field?.fieldName}:${val}`)
      })
    })

    return tags
  }, [JSON.stringify(labelFilters)])

  const onEndReaded = /* istanbul ignore next */ (): void => {
    if (valuesList?.length === page * 100) {
      setPage(prevVal => prevVal + 1)
    }
  }

  const handleCheckboxClick = /* istanbul ignore next */ (key: string, value: string): void => {
    const isKeyInFilters = labelFilters.some(item => item.idFilter?.field?.fieldName === key)

    let newFilters: QLCEViewFilterWrapper[] = []

    if (isKeyInFilters) {
      newFilters = labelFilters.map(item =>
        item.idFilter?.field?.fieldName === key
          ? {
              idFilter: {
                ...item.idFilter,
                values: xor(item.idFilter?.values, [value])
              }
            }
          : item
      )
    } else {
      newFilters = [
        ...labelFilters,
        {
          idFilter: {
            field: {
              fieldId: 'labels.value',
              fieldName: key,
              identifier: ViewFieldIdentifier.Label
            },
            operator: QlceViewFilterOperator.In,
            values: [value]
          }
        }
      ]
    }

    newFilters = newFilters.filter(item => item.idFilter?.values?.length)

    setLabelFilters(newFilters)
  }

  const handleOnRemove = (tag: string): void => {
    const valArr = tag.split(':')

    const key = valArr[0]
    const value = valArr[1]

    const newFilters = labelFilters
      .map(item =>
        item.idFilter?.field?.fieldName === key
          ? {
              idFilter: {
                ...item.idFilter,
                values: item.idFilter.values?.filter(val => val !== value)
              }
            }
          : item
      )
      .filter(item => item.idFilter?.values?.length)

    setLabelFilters(newFilters)
  }

  return (
    <Popover
      usePortal
      minimal
      onOpening={() => setKeysPopoverOpen(true)}
      position={Position.BOTTOM}
      popoverClassName={css.popoverCtn}
      targetClassName={css.popoverTarget}
      onClose={() => setSelectedLabelKey('')}
      content={
        <div className={css.keysListCtn}>
          {labelKeysData.fetching ? (
            <LoadingSpinner />
          ) : !labelsKeys?.length ? (
            <Text>{getString('common.filters.noResultsFound')}</Text>
          ) : (
            filteredLabelKeys?.map(key => (
              <Popover
                usePortal
                minimal
                key={key}
                position={Position.RIGHT_TOP}
                popoverClassName={css.popoverCtn}
                modifiers={{
                  flip: { boundariesElement: 'viewport', padding: 20 },
                  preventOverflow: { boundariesElement: 'viewport', padding: 20 }
                }}
                content={
                  <div className={css.valuesListCtn}>
                    {page === 1 && labelKeyValuesData.fetching ? (
                      <LoadingSpinner />
                    ) : !valuesList?.length ? (
                      <Text>{getString('common.filters.noResultsFound')}</Text>
                    ) : (
                      <Virtuoso
                        style={{ height: 300 }}
                        data={valuesList}
                        overscan={{ main: 20, reverse: 20 }}
                        endReached={onEndReaded}
                        itemContent={
                          /* istanbul ignore next */ (_, value) => {
                            const isChecked = labelFilters?.some(label => label.idFilter?.values?.includes(value))

                            return (
                              <Container className={css.listValCtn}>
                                <Checkbox
                                  checked={isChecked}
                                  onClick={() => handleCheckboxClick(String(key), value)}
                                  labelElement={
                                    <Text lineClamp={1} color={Color.BLACK} tooltipProps={{ openOnTargetFocus: false }}>
                                      {value}
                                    </Text>
                                  }
                                />
                              </Container>
                            )
                          }
                        }
                        components={{
                          Footer: () =>
                            labelKeyValuesData.fetching && fetchMoreValues ? <LoadingSpinner size={18} /> : null
                        }}
                      />
                    )}
                  </div>
                }
              >
                <Container
                  className={cx(css.listItemCtn, { [css.listItemSelected]: key === selectedLabelKey })}
                  onClick={() => setSelectedLabelKey(String(key))}
                >
                  <Text lineClamp={1} color={Color.BLACK} tooltipProps={{ openOnTargetFocus: false }}>
                    {key}
                  </Text>
                </Container>
              </Popover>
            ))
          )}
        </div>
      }
    >
      <TagInput
        values={inputTags}
        placeholder={`- ${getString('select')} -`}
        className={css.labelInput}
        inputProps={{ onChange: e => setSearchText(e.target.value) }}
        onRemove={handleOnRemove}
      />
    </Popover>
  )
}

export default LabelFilterDropdown

const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <Icon name="spinner" size={size} padding={'small'} color={Color.BLUE_500} className={css.spinner} />
)
