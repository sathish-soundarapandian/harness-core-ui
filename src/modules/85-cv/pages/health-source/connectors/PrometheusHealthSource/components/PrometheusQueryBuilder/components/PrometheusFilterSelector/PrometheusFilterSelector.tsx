/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Container, FormInput, MultiSelectOption, Popover, Text, Utils, PageError } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { ITagInputProps, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { GetLabeValuesQueryParams, useGetLabeValues } from 'services/cv'
import { TableFilter } from '@cv/components/TableFilter/TableFilter'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { updateLabelOfSelectedFilter } from './utils'
import css from './PrometheusFilterSelector.module.scss'

export interface PrometheusFilterSelectorProps {
  items: MultiSelectOption[]
  name: string
  label: string
  onUpdateFilter: (updatedFilter: MultiSelectOption) => void
  onRemoveFilter: (index: number) => void
  connectorIdentifier: string
  isOptional?: boolean
  dataSourceType?: string
  region?: string
  workspaceId?: string
}

interface ValuePopoverProps {
  closePopover: (clickedValue?: string) => void
  connectorIdentifier: string
  prometheusLabel: string
  dataSourceType?: string
  region?: string
  workspaceId?: string
}
interface TagRendererProps {
  selectedKey?: string
  setSelectedKey: (_?: string) => void
  connectorIdentifier: string
  onUpdateFilter: (_: MultiSelectOption) => void
  item: MultiSelectOption
  items: MultiSelectOption[]
  dataSourceType?: string
  region?: string
  workspaceId?: string
}

const PopoverProps = {
  minimal: true,
  canEscapeKeyClose: true,
  position: PopoverPosition.BOTTOM,
  popoverClassName: css.valueMenu
}

function ValuePopover(props: ValuePopoverProps): JSX.Element {
  const { closePopover, connectorIdentifier, prometheusLabel, dataSourceType, region, workspaceId } = props
  const [itemsToRender, setItemsToRender] = useState<string[]>([])
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const queryParams = useMemo(
    () => ({
      projectIdentifier,
      orgIdentifier,
      accountId,
      connectorIdentifier,
      dataSourceType: dataSourceType as GetLabeValuesQueryParams['dataSourceType'],
      region,
      workspaceId,
      labelName: prometheusLabel,
      tracingId: Utils.randomId()
    }),
    [prometheusLabel, dataSourceType, region, workspaceId]
  )
  const { error, data, loading, refetch } = useGetLabeValues({
    queryParams
  })

  useEffect(() => {
    setItemsToRender(data?.data || [])
  }, [data])

  const renderContent = (): React.ReactNode => {
    if (error) {
      return (
        <PageError
          message={getErrorMessage(error)}
          onClick={e => {
            e.stopPropagation()
            refetch({ queryParams: { ...queryParams, tracingId: Utils.randomId() } })
          }}
          className={css.popoverError}
        />
      )
    } else if (loading) {
      return (
        <Text className={css.valueItem} style={{ textAlign: 'center' }}>
          {getString('loading')}
        </Text>
      )
    }
    return itemsToRender.map(item => (
      <Text
        key={item}
        onClick={() => {
          closePopover(item)
        }}
        className={css.valueItem}
        width={345}
        lineClamp={1}
      >
        {item}
      </Text>
    ))
  }

  return (
    <Container className={css.valuePopover}>
      <TableFilter
        onFilter={filterValue =>
          setItemsToRender(data?.data?.filter(val => val?.toLocaleLowerCase().includes(filterValue)) || [])
        }
        className={css.valueFilter}
        throttle={500}
      />
      {renderContent()}
    </Container>
  )
}

function TagRenderer(props: TagRendererProps): JSX.Element {
  const {
    onUpdateFilter,
    selectedKey,
    setSelectedKey,
    connectorIdentifier,
    item,
    items,
    dataSourceType,
    region,
    workspaceId
  } = props
  const ref = useRef<HTMLDivElement>(null)

  const onClickValue = (val?: string): void => {
    ref.current?.click()
    if (val) {
      const updatedItem = updateLabelOfSelectedFilter(val, item, items)
      onUpdateFilter(updatedItem)
    }
  }

  return (
    <Container
      className="multiSelectTagWrapper"
      intent={selectedKey === item.value ? 'primary' : 'none'}
      onClick={e => {
        e.stopPropagation()
        setSelectedKey(item.value as string)
      }}
    >
      <Popover
        content={
          <ValuePopover
            closePopover={onClickValue}
            connectorIdentifier={connectorIdentifier}
            prometheusLabel={item.value as string}
            dataSourceType={dataSourceType}
            region={region}
            workspaceId={workspaceId}
          />
        }
        defaultIsOpen={selectedKey === item.value}
        interactionKind={PopoverInteractionKind.CLICK}
        onClosed={() => setSelectedKey(undefined)}
        {...PopoverProps}
      >
        <>
          <Text>{item.label}</Text>
          <div ref={ref} className="elementUsedForClosingPopover" />
        </>
      </Popover>
    </Container>
  )
}

export function PrometheusFilterSelector(props: PrometheusFilterSelectorProps): JSX.Element {
  const {
    items,
    name,
    onUpdateFilter,
    label,
    onRemoveFilter,
    connectorIdentifier,
    isOptional,
    dataSourceType,
    region,
    workspaceId
  } = props
  const [currentSelectedKey, setCurrentSelectedKey] = useState<string | undefined>()
  return (
    <FormInput.MultiSelect
      items={items}
      name={name}
      className={css.multiSelectCustomization}
      label={label}
      isOptional={isOptional}
      onChange={options => {
        setCurrentSelectedKey(options[options.length - 1].value as string)
      }}
      tagInputProps={
        {
          onRemove: (_: any, index: number) => onRemoveFilter(index)
        } as unknown as ITagInputProps
      }
      multiSelectProps={{
        allowCreatingNewItems: false,
        tagRenderer: function Wrapper(item) {
          return (
            <TagRenderer
              selectedKey={currentSelectedKey}
              setSelectedKey={setCurrentSelectedKey}
              connectorIdentifier={connectorIdentifier}
              onUpdateFilter={onUpdateFilter}
              items={items}
              item={item}
              dataSourceType={dataSourceType}
              region={region}
              workspaceId={workspaceId}
            />
          )
        }
      }}
    />
  )
}
