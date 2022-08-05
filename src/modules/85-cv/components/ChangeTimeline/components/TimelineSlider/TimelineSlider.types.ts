/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'

export type SliderEndpoints = {
  startX: number
  endX: number
  startXPercentage: number
  endXPercentage: number
}
export interface TimelineSliderProps {
  initialSliderWidth: number
  minSliderWidth: number
  maxSliderWidth?: number
  containerWidth?: number | string
  onSliderDragEnd?: (sliderEndPoints: SliderEndpoints) => void
  leftContainerOffset?: number
  className?: string
  infoCard?: JSX.Element
  resetFocus?: () => void
  hideSlider?: boolean
  onZoom?: () => void
  selectedTimePeriod?: string
}

export type SliderAspects = {
  width: number
  leftOffset: number
  rightHandlePosition: number
  leftHandlePosition: number
  onClickTransition?: React.CSSProperties['transition']
}
