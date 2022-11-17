/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Container, Button, Icon } from '@harness/uicore'
import { useParams } from 'react-router-dom'
// import cx from 'classnames'
import { useFetchViewFieldsQuery, QlceViewFilterWrapperInput, QlceViewFilterInput } from 'services/ce/services'
import type { setFiltersFn } from '@ce/types'
import FilterPill from '../PerspectiveFilters/FilterPill'
import css from './ExplorerFilters.module.scss'

interface ExplorerFiltersProps {
  setFilters: setFiltersFn
  filters: QlceViewFilterInput[]
  timeRange: {
    to: string
    from: string
  }
}

const ExplorerFilters: React.FC<ExplorerFiltersProps> = ({ setFilters, filters, timeRange }) => {
  const { perspectiveId } = useParams<{ perspectiveId: string }>()

  const [filtersState, setFilterState] = useState(filters)

  const queryFilters = useMemo(
    () => [{ viewMetadataFilter: { viewId: perspectiveId, isPreview: false } } as QlceViewFilterWrapperInput],
    [perspectiveId]
  )

  useEffect(() => {
    setFilterState(filters)
  }, [filters])

  const [result] = useFetchViewFieldsQuery({
    variables: {
      filters: queryFilters
    }
  })
  const { data: fieldResData, fetching } = result

  const fieldIdentifierData = fieldResData?.perspectiveFields?.fieldIdentifierData

  const setFiltersAndUpdateState: (filterData: QlceViewFilterInput[]) => void = filterData => {
    setFilterState(filterData)
    const filteredData = filterData.filter(f => f.field.identifier)
    setFilters(filteredData)
  }

  const onPillDataChange: (id: number, data: QlceViewFilterInput) => void = (id, data) => {
    if (data.field.identifier === 'CUSTOM') {
      data.values = []
    }
    const newFilters = filtersState.map((filter, idx) => {
      if (idx === id) {
        return {
          type: 'VIEW_ID_CONDITION',
          ...data
        }
      }
      return filter
    }) as QlceViewFilterInput[]
    setFiltersAndUpdateState(newFilters)
  }

  if (fetching) {
    return (
      <Container>
        <Icon name="spinner" />
      </Container>
    )
  }

  if (!fieldIdentifierData) {
    return (
      <Container>
        <Icon name="deployment-incomplete-legacy" />
      </Container>
    )
  }

  return (
    <Container>
      <section className={css.filtersContainer}>
        {filtersState.map((filterData, index) => {
          return (
            <>
              <FilterPill
                key={`${filterData.field.fieldName}-${filterData.field.identifier}-${index}`}
                id={index}
                timeRange={timeRange}
                removePill={() => {
                  // arrayHelpers.remove(index)
                  // removePill && removePill(innerIndex)
                  const updatedFilters = filtersState.filter((_, idx) => (idx === index ? false : true))
                  setFiltersAndUpdateState(updatedFilters)
                }}
                fieldValuesList={fieldIdentifierData}
                onChange={onPillDataChange}
                pillData={filterData}
              />
              {/* {showAndOperator ? <Text className={css.andOperator}>AND</Text> : ''} */}
            </>
          )
        })}

        <Button
          intent="primary"
          minimal
          text="+ add filter"
          onClick={() => {
            const addedFilter = [
              ...filtersState,
              {
                field: {
                  fieldId: '',
                  fieldName: '',
                  identifier: '',
                  identifierName: ''
                },
                type: 'VIEW_ID_CONDITION',
                operator: 'IN',
                values: []
              }
            ] as QlceViewFilterInput[]

            setFiltersAndUpdateState(addedFilter)
          }}
        />
      </section>
    </Container>
  )
}

export default React.memo(ExplorerFilters)
