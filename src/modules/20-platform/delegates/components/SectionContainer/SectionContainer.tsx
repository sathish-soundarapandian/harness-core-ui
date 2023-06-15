/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode } from 'react'
import cx from 'classnames'
import { Container, Text, TextProps, HarnessDocTooltip } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { ContainerProps } from '@harness/uicore/dist/components/Container/Container'
import css from './SectionContainer.module.scss'

export const SectionContainer: React.FC<ContainerProps> = ({ children, style, ...props }) => {
  return (
    <Container
      padding="xlarge"
      style={{
        background: 'var(--white)',
        boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.08), 0px 0.5px 2px rgba(96, 97, 112, 0.16)',
        borderRadius: '4px',
        ...style
      }}
      {...props}
    >
      {children}
    </Container>
  )
}

export const SectionContainerTitle: React.FC<TextProps> = ({ children, style, ...props }) => {
  return (
    <Text
      font={{ size: 'medium', weight: 'bold' }}
      style={{ color: '#22272D', paddingBottom: 'var(--spacing-medium)', ...style }}
      {...props}
    >
      {children}
    </Text>
  )
}

interface SectionLabelValuePairProps {
  label: string
  value?: ReactNode
  ignoreLastElementStyling?: boolean
  dataTooltipId?: string
}

export const SectionLabelValuePair: React.FC<SectionLabelValuePairProps & ContainerProps> = ({
  label,
  value,
  className,
  ignoreLastElementStyling,
  children,
  dataTooltipId,
  ...props
}) => {
  return (
    <Container className={cx(css.entry, className, ignoreLastElementStyling && css.ignoreLast)} {...props}>
      <Text
        font={{ variation: FontVariation.BODY }}
        style={{
          color: 'var(--grey-450)'
        }}
        data-tooltip-id={dataTooltipId}
      >
        {label}
        {dataTooltipId ? <HarnessDocTooltip useStandAlone={true} tooltipId={dataTooltipId} /> : null}
      </Text>
      {value ? <Text font={{ variation: FontVariation.BODY }}>{value}</Text> : children}
    </Container>
  )
}
