/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Layout, Text, Icon, TextInput } from '@wings-software/uicore'
import { Color } from '@wings-software/design-system'
import { RadioGroup, Radio } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import MultiValueSelectorComponent from '@ce/components/MultiValueSelectorComponent/MultiValueSelectorComponent'
import {
  QlceViewFilterOperator,
  useFetchPerspectiveFiltersValueQuery,
  QlceViewFilterWrapperInput
} from 'services/ce/services'
import { getTimeFilters, getViewFilterForId } from '@ce/utils/perspectiveUtils'
import { getGMTStartDateTime, getGMTEndDateTime } from '@ce/utils/momentUtils'
import type { ProviderType } from '../FilterPill'
import css from './views.module.scss'

const LIMIT = 100

interface OperatorSelectorProps {
  operator: QlceViewFilterOperator
  setOperator: React.Dispatch<React.SetStateAction<QlceViewFilterOperator>>
  setValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

const OperatorSelector: React.FC<OperatorSelectorProps> = ({ setOperator, operator, setValues }) => {
  const [selectedOperator, setSelectedOperator] = useState(operator)
  const { getString } = useStrings()

  const operators = [
    {
      value: QlceViewFilterOperator.In,
      label: getString('ce.perspectives.createPerspective.operatorLabels.in')
    },
    {
      value: QlceViewFilterOperator.NotIn,
      label: getString('ce.perspectives.createPerspective.operatorLabels.notIn')
    },
    {
      value: QlceViewFilterOperator.Null,
      label: getString('ce.perspectives.createPerspective.operatorLabels.opNull')
    },
    {
      value: QlceViewFilterOperator.NotNull,
      label: getString('ce.perspectives.createPerspective.operatorLabels.opNotNull')
    },
    {
      value: QlceViewFilterOperator.Like,
      label: getString('ce.perspectives.createPerspective.operatorLabels.opLike')
    }
  ]

  return (
    <Container
      padding={{
        top: 'xlarge',
        bottom: 'medium',
        left: 'medium',
        right: 'medium'
      }}
    >
      <Text>{getString('ce.perspectives.createPerspective.filters.selectOperator')}</Text>
      <Container
        margin={{
          top: 'xlarge'
        }}
      >
        <RadioGroup
          onChange={e => {
            const target = e.target as any
            const value = target.value as QlceViewFilterOperator
            setSelectedOperator(value)
            setOperator(value)
            if (
              [QlceViewFilterOperator.NotNull, QlceViewFilterOperator.Null].includes(value) &&
              [QlceViewFilterOperator.In, QlceViewFilterOperator.NotIn, QlceViewFilterOperator.Like].includes(operator)
            ) {
              setValues({ ' ': true })
            }

            if (
              [QlceViewFilterOperator.NotNull, QlceViewFilterOperator.Null].includes(operator) &&
              [QlceViewFilterOperator.In, QlceViewFilterOperator.NotIn, QlceViewFilterOperator.Like].includes(value)
            ) {
              setValues({})
            }
          }}
          selectedValue={selectedOperator}
        >
          {operators.map(op => (
            <Radio className={css.radioValue} key={op.value} label={op.label} value={op.value} />
          ))}
        </RadioGroup>
      </Container>
    </Container>
  )
}

interface NameSelectorProps {
  fetching: boolean
  nameList: string[]
  setService: React.Dispatch<React.SetStateAction<ProviderType | null>>
}

const NameSelector: React.FC<NameSelectorProps> = ({ fetching, nameList, setService }) => {
  if (fetching) {
    return (
      <Container className={cx(css.namesContainer, css.spinner)}>
        <Icon name="spinner" color="blue500" />
      </Container>
    )
  }
  return (
    <Container className={css.namesContainer}>
      {nameList.map(name => (
        <Text
          className={css.labelNames}
          onClick={() => {
            setService({
              id: 'labels.value',
              name: name
            })
          }}
          padding="small"
          key={name}
        >
          {name}
        </Text>
      ))}
    </Container>
  )
}

interface ValueSelectorProps {
  setValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  setOperator: React.Dispatch<React.SetStateAction<QlceViewFilterOperator>>
  operator: QlceViewFilterOperator
  values: Record<string, boolean>
  service: ProviderType
  provider: ProviderType
  isLabelOrTag: boolean
  setService: React.Dispatch<React.SetStateAction<ProviderType | null>>
  timeRange: {
    to: string
    from: string
  }
}

const ValueSelector: React.FC<ValueSelectorProps> = ({
  setOperator,
  values,
  setValues,
  operator,
  provider,
  service,
  isLabelOrTag,
  setService,
  timeRange
}) => {
  const { getString } = useStrings()

  const [pageInfo, setPageInfo] = useState<{
    filtersValuesData: string[]
    loadMore: boolean
    page: number
    searchValue: string
  }>({
    filtersValuesData: [],
    loadMore: true,
    page: 1,
    searchValue: ''
  })

  const { perspectiveId } = useParams<{ perspectiveId: string }>()

  const [result] = useFetchPerspectiveFiltersValueQuery({
    variables: {
      filters: [
        getViewFilterForId(perspectiveId),
        ...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTEndDateTime(timeRange.to)),
        {
          idFilter: {
            field: {
              fieldId: service?.id,
              fieldName: service?.name,
              identifier: provider?.id,
              identifierName: provider?.name
            },
            operator: QlceViewFilterOperator.In,
            values: [pageInfo.searchValue]
          }
        } as QlceViewFilterWrapperInput
      ],
      offset: (pageInfo.page - 1) * LIMIT,
      limit: LIMIT
    }
  })

  const { data, fetching } = result

  const valuesList = (data?.perspectiveFilters?.values || []).filter(x => x) as string[]

  useEffect(() => {
    if (data?.perspectiveFilters?.values && !fetching && service?.name) {
      const moreItemsPresent = data.perspectiveFilters.values.length === LIMIT
      const filteredVal = data.perspectiveFilters.values.filter(e => e) as string[]
      setPageInfo(prevInfo => ({
        ...prevInfo,
        loadMore: moreItemsPresent,
        filtersValuesData: [...prevInfo.filtersValuesData, ...filteredVal]
      }))
    }
  }, [data?.perspectiveFilters?.values, service?.name, fetching])

  const onInputChange: (val: string) => void = val => {
    setPageInfo({
      filtersValuesData: [],
      loadMore: true,
      page: 1,
      searchValue: val
    })
  }

  return (
    <Container>
      {isLabelOrTag ? (
        <Container>
          <NameSelector setService={setService} fetching={fetching} nameList={valuesList} />
        </Container>
      ) : (
        <Layout.Horizontal spacing="small">
          <OperatorSelector setOperator={setOperator} operator={operator} setValues={setValues} />
          {[QlceViewFilterOperator.In, QlceViewFilterOperator.NotIn].includes(operator) && (
            <Container
              background="blue50"
              className={cx(css.valueSelectorContainer, { [css.loadingContainer]: fetching })}
            >
              <MultiValueSelectorComponent
                fetching={!pageInfo.filtersValuesData.length && fetching}
                valueList={pageInfo.filtersValuesData}
                shouldFetchMore={pageInfo.loadMore}
                setSelectedValues={setValues}
                selectedValues={values}
                fetchMore={e => {
                  if (e === pageInfo.page * LIMIT - 1) {
                    setPageInfo(prevInfo => ({ ...prevInfo, page: prevInfo.page + 1 }))
                  }
                }}
                onInputChange={onInputChange}
              />
            </Container>
          )}
          {[QlceViewFilterOperator.Like].includes(operator) && (
            <Container background={Color.BLUE_50} padding="medium">
              <TextInput
                placeholder={getString('ce.perspectives.createPerspective.filters.enterCondition')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValues(prevValues => ({
                    [e.target.value]: !prevValues[e.target.value]
                  }))
                }
              />
            </Container>
          )}
        </Layout.Horizontal>
      )}
    </Container>
  )
}

export default ValueSelector
