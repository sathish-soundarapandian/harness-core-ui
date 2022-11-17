/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Heading, Text } from '@harness/uicore'
import cx from 'classnames'
import { StepLabel, StepLabelProps } from '../StepLabel/StepLabel'
import css from './SetupSourceCardHeader.module.scss'

export interface SetupSourceCardHeaderProps {
  stepLabelProps?: StepLabelProps
  mainHeading: string
  subHeading: string
}

export interface EmptyCardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SetupSourceEmptyCardHeader(props: EmptyCardHeaderProps): JSX.Element {
  const { children, className } = props
  return (
    <Container className={cx(css.emptyCardHeader, className)}>
      <Container className={css.content}>{children}</Container>
      <hr className={css.headingDivider} />
    </Container>
  )
}

export function SetupSourceCardHeader(props: SetupSourceCardHeaderProps): JSX.Element {
  const { mainHeading, subHeading, stepLabelProps } = props
  return (
    <SetupSourceEmptyCardHeader>
      {stepLabelProps && <StepLabel {...stepLabelProps} />}
      <Heading level={2} className={css.mainHeading}>
        {mainHeading}
      </Heading>
      <Text className={css.subHeading}>{subHeading}</Text>
    </SetupSourceEmptyCardHeader>
  )
}
