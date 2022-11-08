/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Container, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { Classes, Popover, PopoverInteractionKind } from '@blueprintjs/core'
import cx from 'classnames'
import { isUndefined } from 'lodash-es'
import { getColorStyle } from './ColorUtils'
import styles from './HeatMap.module.scss'

export interface SerieConfig {
  name?: string
  data: Array<any>
}

export type OnCellClick = { cell: any; series: SerieConfig; isSelected: boolean; onDismiss: () => void }
export interface HeatMapProps {
  series: Array<SerieConfig> | SerieConfig
  minValue: number
  maxValue: number
  mapValue(cell: any): number | CellStatusValues
  cellShapeBreakpoint?: number
  /**
   * This property can be used if series are not prepared yet, to render placehoders,
   * or to limit the row sizes.
   */
  rowSize?: number
  onCellClick?(cell?: any, serie?: any): void
  renderTooltip?(info: OnCellClick): JSX.Element | null
  labelsWidth?: number
  className?: string
  cellClassName?: string
}

export interface HeatMapCellProps {
  color?: string
  colorClassName?: string
  className?: string
  popoverDisabled: boolean
  popoverContent?: JSX.Element | null
  isSelected?: boolean
  onClick?: () => void
}

export enum CellStatusValues {
  Missing = 'Missing',
  Empty = 'Empty',
  Error = 'Error'
}

const specialColorValue = {
  MISSING: Color.GREY_200,
  EMPTY: Color.GREY_250,
  ERROR: Color.RED_800
}

const PopoverModifies = {
  arrow: { enabled: true },
  flip: { enabled: true },
  keepTogether: { enabled: true }
}

export default function HeatMap({
  series: seriesProp,
  minValue,
  maxValue,
  mapValue,
  rowSize,
  onCellClick,
  renderTooltip,
  labelsWidth = 125,
  className,
  cellClassName
}: HeatMapProps): JSX.Element {
  const series = Array.isArray(seriesProp) ? seriesProp : [seriesProp]
  const [selectedCell, setSelectedCell] = useState<any>()
  let rowLimit: number
  if (!isUndefined(rowSize)) {
    rowLimit = rowSize
  } else {
    rowLimit = series.reduce((a, c) => Math.max(a, c.data.length), 0)
  }

  const mapColor = (cell: any) => {
    const value: number | CellStatusValues = mapValue(cell)
    if (value === CellStatusValues.Missing) {
      return { color: specialColorValue.MISSING }
    } else if (value === CellStatusValues.Empty) {
      return { color: specialColorValue.EMPTY }
    } else if (value === CellStatusValues.Error) {
      return { color: specialColorValue.ERROR }
    }
    return {
      colorClassName: getColorStyle(value, minValue, maxValue)
    }
  }

  const showLabels = series.some(serie => !isUndefined(serie.name))

  useEffect(() => {
    setSelectedCell(null)
  }, [seriesProp])

  return (
    <Container className={cx(styles.heatMap, className)}>
      {series.map((serie, serieIndex) => (
        <div key={serieIndex} className={styles.heatMapRow}>
          {showLabels && (
            <span className={styles.nameWrapper}>
              <Text font={{ weight: 'bold', size: 'small' }} width={labelsWidth}>
                {serie.name}
              </Text>
            </span>
          )}
          <div className={styles.rowValues}>
            {serie.data.map((cell, index) => {
              if (index >= rowLimit) {
                return null
              }
              const isSelected =
                selectedCell?.startTime === cell.startTime &&
                selectedCell?.endTime === cell.endTime &&
                serie.name === selectedCell.category
              return (
                <HeatMapCell
                  key={index}
                  isSelected={isSelected}
                  popoverDisabled={!renderTooltip}
                  popoverContent={renderTooltip?.({
                    cell,
                    series: serie,
                    isSelected,
                    onDismiss: () => {
                      onCellClick?.()
                      setSelectedCell(undefined)
                    }
                  })}
                  onClick={() => {
                    onCellClick?.(cell, serie)
                    setSelectedCell({ ...cell, category: serie.name })
                  }}
                  {...mapColor(cell)}
                  className={cx(selectedCell && !isSelected ? styles.opaqueSquare : undefined, cellClassName)}
                />
              )
            })}
            {serie.data.length < rowLimit &&
              new Array(rowLimit - serie.data.length)
                .fill(null)
                .map((_, index) => (
                  <HeatMapCell
                    key={serie.data.length + index}
                    color={specialColorValue.MISSING}
                    className={cellClassName}
                    popoverDisabled
                  />
                ))}
          </div>
        </div>
      ))}
    </Container>
  )
}

export function HeatMapCell({
  color,
  colorClassName,
  className,
  popoverDisabled = false,
  popoverContent,
  onClick,
  isSelected
}: HeatMapCellProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean | undefined>(isSelected ? true : undefined)
  useEffect(() => {
    if (isSelected && !isOpen) {
      setIsOpen(true)
    } else if (!isSelected && isOpen) {
      setIsOpen(false)
    }
  }, [isSelected])
  return (
    <Container onClick={onClick} className={cx(styles.cell, className)}>
      <Popover
        className={cx(styles.cellContentWrapper, Classes.DARK)}
        disabled={popoverDisabled}
        content={popoverContent || <Container />}
        interactionKind={isOpen !== undefined ? undefined : PopoverInteractionKind.HOVER}
        modifiers={PopoverModifies}
        isOpen={isOpen}
        onInteraction={() => {
          if (isSelected === false) {
            setIsOpen(undefined)
          }
        }}
        lazy
        boundary="window"
      >
        <Container>
          <Container className={cx(styles.cellInner, colorClassName)} background={color} />
          {isSelected && <Container height={17} width={17} className={styles.selectedSquare} />}
        </Container>
      </Popover>
    </Container>
  )
}
