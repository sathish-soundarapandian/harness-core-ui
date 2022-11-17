/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import Draggable from 'react-draggable'
import { Container, Layout, Text } from '@harness/uicore'
import { colors } from '@common/components/HeatMap/ColorUtils'
import css from './CVRiskScoreSlider.module.scss'

interface CVRiskScoreSliderProps {
  height?: number
  width?: number
  selectedValue?: number
  onSelected: (value: number) => void
}

const CVRiskScoreSlider: React.FC<CVRiskScoreSliderProps> = props => {
  const sliderWidth = props.width || 340
  const divi = (sliderWidth - 30) / 100
  const [risk, setRisk] = useState(0)
  useEffect(() => {
    if (props.selectedValue) {
      setRisk(props.selectedValue)
    }
  }, [props.selectedValue])
  return (
    <Layout.Vertical width={sliderWidth}>
      <Draggable
        axis="x"
        bounds={{ right: sliderWidth - 30, left: 0 }}
        defaultClassNameDragging={css.draggingHandle}
        position={{ x: (props.selectedValue || 0) * divi, y: 0 }}
        onDrag={(e, data) => {
          e.stopPropagation()
          setRisk((data.x / divi) | 0)
        }}
        onStop={() => {
          props.onSelected(risk)
        }}
      >
        <Container className={css.handleWrapper}>
          <Text font={{ size: 'small' }} width={30} className={css.score}>
            {risk}
          </Text>
          <Container className={css.handle} />
        </Container>
      </Draggable>
      <Layout.Horizontal width={sliderWidth} spacing="xsmall">
        {colors.map((item, index) => {
          return (
            <div
              key={`${item}${index}`}
              className={item}
              style={{ width: (sliderWidth / 10) | 0, height: props.height || 10 }}
            ></div>
          )
        })}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default CVRiskScoreSlider
