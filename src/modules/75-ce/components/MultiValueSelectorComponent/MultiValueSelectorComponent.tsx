/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Container, Icon, Checkbox, TextInput } from '@harness/uicore'
import cx from 'classnames'
import { debounce } from 'lodash-es'
import { Virtuoso } from 'react-virtuoso'
import type { Maybe } from 'services/ce/services'
import { useStrings } from 'framework/strings'
import css from './MultiValueSelectorComponent.module.scss'

interface MultiValueSelectorComponentProps {
  fetching: boolean
  valueList: Maybe<string>[]
  shouldFetchMore?: boolean
  setSelectedValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  selectedValues: Record<string, boolean>
  fetchMore?: (e: number) => void
  onInputChange: (val: string) => void
  searchText?: string
}

const MultiValueSelectorComponent: (props: MultiValueSelectorComponentProps) => JSX.Element = ({
  fetching,
  valueList,
  shouldFetchMore,
  setSelectedValues,
  selectedValues,
  fetchMore,
  onInputChange,
  searchText: intialSearchVal
}) => {
  const { getString } = useStrings()

  const filteredValues = valueList.filter(val => val) as string[]
  const [searchText, setSearchText] = useState(intialSearchVal || '')

  const renderValues = () => {
    const allowToFetchMore = shouldFetchMore

    return (
      <Container>
        <Virtuoso
          style={{ height: 344 }}
          data={filteredValues}
          overscan={{ main: 20, reverse: 20 }}
          endReached={e => {
            allowToFetchMore && fetchMore && fetchMore(e)
          }}
          itemContent={(_, value) => {
            if (!value) return null
            return (
              <Checkbox
                onClick={() => {
                  setSelectedValues(prevVal => ({
                    ...prevVal,
                    [value]: !prevVal[value]
                  }))
                }}
                checked={selectedValues[value]}
                className={cx(css.checkbox, css.labelItem)}
                key={value}
                value={value}
                label={value}
              />
            )
          }}
          components={{
            Footer: function renderFooter() {
              return allowToFetchMore ? (
                <Container padding="small" className={css.fetchingMoreLoader}>
                  <Icon name="spinner" size={20} color="blue500" />
                </Container>
              ) : null
            }
          }}
        />
      </Container>
    )
  }

  const debouncedOnChange = useCallback(debounce(onInputChange, 500), [])

  const handleInputChange: (e: any) => void = e => {
    const target = e.target
    setSearchText(target.value)
    debouncedOnChange(target.value)
  }

  const isSelectAllChecked = filteredValues.filter(val => selectedValues[val]).length === filteredValues.length

  return (
    <Container className={css.valueContainer}>
      <Container className={css.searchBoxContainer}>
        <div className={css.searchCheckBox}>
          <Checkbox
            className={css.checkbox}
            disabled={fetching || !filteredValues.length}
            checked={isSelectAllChecked}
            onChange={() => {
              const selectAllValues: Record<string, boolean> = {}
              filteredValues.forEach(val => {
                if (val) {
                  selectAllValues[val] = !isSelectAllChecked
                }
              })
              setSelectedValues(prevVal => ({
                ...prevVal,
                ...selectAllValues
              }))
            }}
          />
        </div>
        <TextInput
          value={searchText}
          onChange={handleInputChange}
          placeholder={getString('ce.perspectives.createPerspective.filters.searchText')}
        />
      </Container>
      {fetching ? (
        <Container className={css.valueFetching}>
          <Icon name="spinner" size={28} color="blue500" />
        </Container>
      ) : (
        renderValues()
      )}
    </Container>
  )
}

export default MultiValueSelectorComponent
