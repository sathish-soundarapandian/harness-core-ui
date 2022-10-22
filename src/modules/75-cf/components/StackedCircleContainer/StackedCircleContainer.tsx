/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { slice } from 'lodash-es'
import cx from 'classnames'
import type { ContainerProps } from '@wings-software/uicore/dist/components/Container/Container'
import { Button, Container } from '@wings-software/uicore'
import { SEGMENT_PRIMARY_COLOR } from '@cf/utils/CFUtils'
import css from './StackedCircleContainer.module.scss'

const DEFAULT_DIAMETER = 30
const DEFAULT_CONTAINER_SIZE = 26
const DEFAULT_MAX_SHOWN_ITEMS = 3

export interface StackedCircleContainerProps<T> extends Omit<ContainerProps, 'color'> {
  items: T[]
  diameter?: number
  maxShownItem?: number
  keyOfItem: (item: T) => string
  renderItem: (item: T) => React.ReactNode
  renderOtherItem?: (otherItems: T[]) => React.ReactNode
  color?: (itemOrOther: T | boolean) => string
  backgroundColor?: (itemOrOther: T | boolean) => string
}

export function StackedCircleContainer<T>({
  items,
  diameter = DEFAULT_DIAMETER,
  maxShownItem = DEFAULT_MAX_SHOWN_ITEMS,
  keyOfItem,
  renderItem,
  renderOtherItem = otherItems => <Button noStyling>+{otherItems.length}</Button>,
  color = () => 'var(--white)',
  backgroundColor = () => SEGMENT_PRIMARY_COLOR,
  ...containerProps
}: StackedCircleContainerProps<T>): JSX.Element | null {
  const len = items?.length

  if (!len) {
    return null
  }

  const itemContainerSize = len === 1 ? diameter : (diameter * DEFAULT_CONTAINER_SIZE) / DEFAULT_DIAMETER

  const otherItemCount = len - maxShownItem
  const hasOtherItems = otherItemCount > 1
  const renderedItems = slice(items, 0, hasOtherItems ? maxShownItem : len)
  const otherItems = hasOtherItems ? slice(items, maxShownItem, maxShownItem + otherItemCount) : []

  return (
    <Container {...containerProps}>
      <ul
        className={css.stack}
        style={{ '--size': `${diameter}px`, '--itemContainerSize': `${itemContainerSize}px` } as React.CSSProperties}
      >
        {hasOtherItems && (
          <li
            className={css.itemContainer}
            style={
              {
                '--color': color(true),
                '--background': backgroundColor(true)
              } as React.CSSProperties
            }
          >
            {renderOtherItem(otherItems)}
          </li>
        )}

        {renderedItems.reverse()?.map(item => {
          return (
            <li
              key={keyOfItem(item)}
              className={cx(css.itemContainer)}
              style={
                {
                  '--color': color(item),
                  '--background': backgroundColor(item)
                } as React.CSSProperties
              }
            >
              {renderItem(item)}
            </li>
          )
        })}
      </ul>
    </Container>
  )
}

export const makeStackedCircleShortName = (name: string): string => {
  const shortName = name
    .split(/\s/)
    .map((token, index) => (index <= 1 ? token[0] : ''))
    .reduce((obj, item) => obj + item, '')

  return (shortName.length === 1 ? name.substring(0, 2) : shortName).toLocaleUpperCase()
}
