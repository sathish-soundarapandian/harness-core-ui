/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { Icon, Layout, Text } from '@wings-software/uicore'
import { Popover, Position, PopoverInteractionKind } from '@blueprintjs/core'
import type {
  QlceViewFieldIdentifierData,
  QlceViewFilterOperator,
  QlceViewFilterInput,
  Maybe
} from 'services/ce/services'
import ProviderSelector from './views/ProviderSelector'
import ServiceSelector from './views/ServiceSelector'
import ValueSelector from './views/ValueSelector'

import css from './FilterPill.module.scss'

const ValueRendererPopUp: React.FC<{ valueList: string[] }> = ({ valueList }) => {
  return (
    <ul className="perspective-list-item">
      {valueList.map(value => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  )
}

const ValueRenderer: React.FC<{ valueList: string[] }> = ({ valueList }) => {
  return (
    <Popover
      interactionKind={PopoverInteractionKind.HOVER}
      position={Position.RIGHT_TOP}
      modifiers={{
        arrow: { enabled: true },
        flip: { enabled: true },
        keepTogether: { enabled: true },
        preventOverflow: { enabled: true }
      }}
      usePortal={true}
      content={<ValueRendererPopUp valueList={valueList} />}
    >
      <div className={cx(css.valueListContainer, { [css.hideCount]: valueList.length <= 1 })}>
        <div className={css.firstValue}>{valueList[0]}</div>
        {valueList.length > 1 && <div className={css.count}>{`(+${valueList.length - 1})`}</div>}
      </div>
    </Popover>
  )
}

export const isFilterLabelOrTag: (filterType: string, fieldId: string) => boolean = (
  filterType: string,
  fieldId: string
) => {
  return filterType === 'LABEL' && fieldId === 'labels.key'
}

export type ProviderType = {
  id: string
  name: string
}

interface FilterPillProps {
  id: number
  removePill: () => void
  onChange: (id: number, data: QlceViewFilterInput) => void
  pillData: QlceViewFilterInput
  fieldValuesList: Maybe<QlceViewFieldIdentifierData>[]
  timeRange: {
    to: string
    from: string
  }
}

const FilterPill: React.FC<FilterPillProps> = ({ fieldValuesList, removePill, id, onChange, pillData, timeRange }) => {
  const { fieldName, identifierName, identifier, fieldId } = pillData.field

  const valuesObject: Record<string, boolean> = {}
  pillData?.values &&
    pillData?.values.forEach(val => {
      if (val) {
        valuesObject[val] = true
      }
    })

  const [provider, setProvider] = useState<ProviderType | null>({ id: identifier, name: identifierName || '' })
  const [service, setService] = useState<ProviderType | null>({ id: fieldId, name: fieldName })
  const [values, setValues] = useState<Record<string, boolean>>(valuesObject)
  const [operator, setOperator] = useState<QlceViewFilterOperator>(pillData.operator)
  const [showError, setShowError] = useState(false)

  const valueList = Object.keys(values).filter(val => values[val])

  const filteredFieldValuesList = fieldValuesList.filter(fieldValue => fieldValue) as QlceViewFieldIdentifierData[]

  const renderOperator = React.useMemo(() => {
    if (service?.id && operator) {
      return (
        <Text color="primary7" font="small" inline padding={{ right: 'xsmall' }}>
          {operator}
        </Text>
      )
    }
    return null
  }, [operator, service?.id])

  return (
    <section className={css.filterPillContainer}>
      <Layout.Horizontal
        background="primary2"
        spacing="xsmall"
        padding="xsmall"
        className={cx(css.filterPillInnerContainer, { [css.errorPill]: showError })}
        style={{
          alignItems: 'center'
        }}
      >
        {provider?.id ? <Text font="small">{`${provider.name}:`}</Text> : null}
        {service?.id ? <Text font="small">{service.name}</Text> : null}
        <Popover
          interactionKind={PopoverInteractionKind.CLICK}
          position={Position.BOTTOM_LEFT}
          defaultIsOpen={valueList.length === 0}
          modifiers={{
            arrow: { enabled: false },
            flip: { enabled: true },
            keepTogether: { enabled: true },
            preventOverflow: { enabled: true }
          }}
          usePortal={true}
          onClose={
            /* istanbul ignore next */ () =>
              onChange(id, {
                values: Object.keys(values).filter(val => values[val]),
                operator: operator,
                field: {
                  fieldId: service?.id || '',
                  fieldName: service?.name || '',
                  identifier: provider?.id || ('' as any),
                  identifierName: provider?.name || ''
                }
              })
          }
          onClosing={
            /* istanbul ignore next */ () => {
              setShowError(!valueList.length)
            }
          }
          onOpening={
            /* istanbul ignore next */ () => {
              setShowError(false)
            }
          }
          content={
            provider?.id ? (
              service?.id ? (
                <ValueSelector
                  timeRange={timeRange}
                  service={service}
                  provider={provider}
                  setService={setService}
                  values={values}
                  setOperator={setOperator}
                  setValues={setValues}
                  operator={operator}
                  isLabelOrTag={isFilterLabelOrTag(provider.id, service.id)}
                />
              ) : (
                <ServiceSelector setService={setService} provider={provider} fieldValueList={filteredFieldValuesList} />
              )
            ) : (
              <ProviderSelector
                setProvider={setProvider}
                setService={setService}
                fieldValueList={filteredFieldValuesList}
              />
            )
          }
        >
          {valueList.length ? (
            <>
              {renderOperator}
              <ValueRenderer valueList={valueList} />
            </>
          ) : (
            <>
              {renderOperator}
              <div className={css.placeholderContainer}></div>
            </>
          )}
        </Popover>
        <Icon name="cross" color={'blue500'} size={12} onClick={removePill} data-testid="removeFilterPill" />
      </Layout.Horizontal>
    </section>
  )
}

export default FilterPill
