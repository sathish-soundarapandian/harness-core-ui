/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import { clone } from 'lodash-es'
import cx from 'classnames'

import { Button, ButtonVariation, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { getIconByType, InputSetValue, onDragEnd, onDragLeave, onDragOver, onDragStart } from './utils'
import css from './InputSetSelector.module.scss'

export function RenderValue({
  value,
  onChange,
  setSelectedInputSets,
  setOpenInputSetsList,
  selectedValueClass,
  showNewInputSet,
  onNewInputSetClick
}: {
  value: InputSetValue[]
  onChange?: (value?: InputSetValue[]) => void
  setSelectedInputSets: Dispatch<SetStateAction<InputSetValue[]>>
  setOpenInputSetsList: Dispatch<SetStateAction<boolean>>
  selectedValueClass?: string
  showNewInputSet?: boolean
  onNewInputSetClick?: () => void
}): JSX.Element {
  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLLIElement>, droppedLocation: InputSetValue) => {
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      if (data) {
        try {
          const dropInputSet: InputSetValue = JSON.parse(data)
          const selected = clone(value)
          const droppedItem = selected.filter(item => item.value === dropInputSet.value)[0]
          if (droppedItem) {
            const droppedItemIndex = selected.indexOf(droppedItem)
            const droppedLocationIndex = selected.indexOf(droppedLocation)
            selected.splice(droppedItemIndex, 1)
            selected.splice(droppedLocationIndex, 0, droppedItem)
            onChange?.(selected)
          }
          // eslint-disable-next-line no-empty
        } catch {}
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    [value]
  )

  const { getString } = useStrings()
  return (
    <>
      {showNewInputSet && (
        <Layout.Horizontal spacing="medium">
          <Button
            icon="small-plus"
            className={css.addInputSetButton}
            onClick={onNewInputSetClick}
            color={Color.PRIMARY_7}
            minimal
            variation={ButtonVariation.LINK}
          >
            {getString('pipeline.inputSets.createNewInputSet')}
          </Button>
          <Text font={{ variation: FontVariation.FORM_LABEL }} color={Color.GREY_200} style={{ alignSelf: 'center' }}>
            |
          </Text>
          <Button
            icon="small-plus"
            className={css.addInputSetButton}
            onClick={() => setOpenInputSetsList(true)}
            color={Color.PRIMARY_7}
            minimal
            variation={ButtonVariation.LINK}
          >
            {getString('pipeline.inputSets.selectPlaceholder')}
          </Button>
        </Layout.Horizontal>
      )}

      <div className={cx(css.renderSelectedValue, selectedValueClass)}>
        {value?.map((item, index) => (
          <li
            key={index + item.label}
            data-testid={item.value}
            className={css.selectedInputSetLi}
            draggable={true}
            onDragStart={event => {
              onDragStart(event, item)
            }}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={event => onDrop(event, item)}
          >
            <Button
              data-testid={`button-${item.label}`}
              round={true}
              rightIcon="cross"
              iconProps={{
                onClick: event => {
                  event.stopPropagation()
                  const valuesAfterRemoval = value.filter(inputset => inputset.value !== item.value)
                  setSelectedInputSets(valuesAfterRemoval)
                  onChange?.(valuesAfterRemoval)
                },
                style: {
                  cursor: 'pointer'
                }
              }}
              text={
                <Layout.Horizontal flex={{ alignItems: 'center' }} spacing="small">
                  <Button
                    round={true}
                    withoutBoxShadow={true}
                    font={{ weight: 'semi-bold' }}
                    width={20}
                    height={20}
                    className={css.selectedInputSetOrder}
                  >
                    {index + 1}
                  </Button>
                  <Text
                    color={Color.PRIMARY_8}
                    icon={getIconByType(item.type)}
                    className={css.selectedInputSetLabel}
                    iconProps={{ className: css.selectedInputSetTypeIcon }}
                  >
                    {item.label}
                  </Text>
                </Layout.Horizontal>
              }
              margin={{ top: 'small', bottom: 'small', left: 0, right: 'small' }}
              className={css.selectedInputSetCard}
              color={Color.PRIMARY_7}
            />
          </li>
        ))}
        {!showNewInputSet && (
          <Button
            icon="small-plus"
            className={css.addInputSetButton}
            onClick={() => setOpenInputSetsList(true)}
            color={Color.PRIMARY_7}
            minimal
            variation={ButtonVariation.LINK}
          >
            {getString('pipeline.inputSets.selectPlaceholder')}
          </Button>
        )}
      </div>
    </>
  )
}
