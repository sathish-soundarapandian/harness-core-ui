/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Checkbox, Container, Icon, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Popover, Position, TagInput } from '@blueprintjs/core'
import { Virtuoso } from 'react-virtuoso'
import { xor } from 'lodash-es'

import { useStrings } from 'framework/strings'
import {
  QlceViewFilterOperator,
  QlceViewFilterWrapperInput,
  useFetchPerspectiveFiltersValueQuery,
  ViewFieldIdentifier
} from 'services/ce/services'
import type { QLCEViewFilterWrapper } from 'services/ce'

import css from '../RecommendationFilters.module.scss'

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
      limit: 100,
      offset: (page - 1) * 100
    },
    pause: !selectedLabelKey
  })

  const labelsKeys = labelKeysData.data?.perspectiveFilters?.values
  const labelKeyValues = labelKeyValuesData.data?.perspectiveFilters?.values

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
    if (labelKeyValues?.length === page * 100) {
      setPage(prevVal => prevVal + 1)
    }
  }

  const handleCheckboxClick = /* istanbul ignore next */ (key: string, value: string): void => {
    setSearchText('')

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
                    {labelKeyValuesData.fetching ? (
                      <LoadingSpinner />
                    ) : !labelKeyValues?.length ? (
                      <Text>{getString('common.filters.noResultsFound')}</Text>
                    ) : (
                      <Virtuoso
                        style={{ height: 300 }}
                        data={labelKeyValues}
                        overscan={{ main: 20, reverse: 20 }}
                        endReached={onEndReaded}
                        itemContent={
                          /* istanbul ignore next */ (_, value) => {
                            const isChecked = labelFilters?.some(label =>
                              label.idFilter?.values?.includes(String(value))
                            )

                            return (
                              <Container className={css.listValCtn}>
                                <Checkbox
                                  checked={isChecked}
                                  onClick={() => handleCheckboxClick(String(key), String(value))}
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
                      />
                    )}
                  </div>
                }
              >
                <Container className={css.listItemCtn} onClick={() => setSelectedLabelKey(String(key))}>
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

const LoadingSpinner: React.FC = () => (
  <Icon name="spinner" size={24} padding={'small'} color={Color.BLUE_500} className={css.spinner} />
)
