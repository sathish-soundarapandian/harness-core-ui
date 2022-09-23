/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Color, Container, Utils } from '@harness/uicore'
import css from './RangeSlider.module.scss'

interface RangeProps {
  min?: number
  max?: number
  step?: number
  value?: number
}

interface RangeSliderProps {
  rangeProps?: RangeProps
  lowFillColor?: Color // color to fill in the portion left of the thumb of the slider
  trackColor?: Color //  color to fill the whole track
  onChange: (val: number) => void
  onMouseUp?: (val: number) => void
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  rangeProps,
  lowFillColor = 'transparent',
  onChange,
  trackColor,
  onMouseUp
}) => {
  const [value, setValue] = useState<number>(rangeProps?.value || 0)
  const marginLeft = -16 + (value / 100) * 32

  return (
    <Container className={css.rangeSlider} style={{ ['--thumb-margin-left' as any]: `${marginLeft}px` }}>
      <span className={css.minPointer}>0%</span>
      <input
        type="range"
        min={0}
        max={100}
        {...rangeProps}
        onChange={
          /* istanbul ignore next */ e => {
            const numericValue = Number(e.target.value)
            setValue(numericValue)
            onChange(numericValue)
          }
        }
        onMouseUp={
          /* istanbul ignore next */ e => {
            onMouseUp?.(Number((e.target as HTMLInputElement).value))
          }
        }
        style={{ background: trackColor ? Utils.getRealCSSColor(trackColor) : undefined }}
      />
      <span className={css.midPointer}>50%</span>
      <span className={css.maxPointer}>100%</span>
      <div
        className={css.lowFill}
        style={{ width: `${value}%`, background: lowFillColor ? Utils.getRealCSSColor(lowFillColor) : undefined }}
      />
    </Container>
  )
}

export default RangeSlider
