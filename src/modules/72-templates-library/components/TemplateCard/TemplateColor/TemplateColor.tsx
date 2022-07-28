/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { LegacyRef, useRef } from 'react'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import styled from '@emotion/styled'
import { Text } from '@wings-software/uicore'
import css from './TemplateColor.module.scss'

interface StyledTrapazoidTitleContainerInterface {
  stroke: string
  fill: string
  width: number
}

export const StyledTrapazoidTitleContainer = styled.div`
  position: relative;
  padding: 0px 18px;
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    bottom: -5px;
    left: 0;
    right: 0;
    border: 1px solid ${(props: StyledTrapazoidTitleContainerInterface) => props.stroke};
    background: ${(props: StyledTrapazoidTitleContainerInterface) => props.fill};
    border-radius: 5px 5px 0 0;
    transform: perspective(${(props: StyledTrapazoidTitleContainerInterface) => props.width}) rotateX(45deg);
  }
  p {
    position: relative;
  }
`

export interface TemplateColorProps {
  fill: string
  stroke: string
  title: string
  textColor?: string
}
export const TemplateColor: React.FC<TemplateColorProps> = (props): JSX.Element => {
  const { fill, title, stroke, textColor } = props

  const titleContainerRef: LegacyRef<HTMLDivElement> = useRef(null)
  // increase perspective by 100 to give more height to trapezoid
  const titleWidth = parseInt(defaultTo(titleContainerRef.current?.getClientRects()?.[0]?.width, 0).toFixed(0)) + 100

  return (
    <StyledTrapazoidTitleContainer fill={fill} stroke={stroke} width={titleWidth}>
      <div ref={titleContainerRef}>
        <Text className={cx(css.text, css.absolutePos)} style={{ color: textColor }}>
          {title}
        </Text>
      </div>
    </StyledTrapazoidTitleContainer>
  )
}
