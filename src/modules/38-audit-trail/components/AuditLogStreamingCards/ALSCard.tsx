/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Card, Text } from '@harness/uicore'
import css from './AuditLogStreamingCards.module.scss'

export interface AuditLogStreamingCardProps {
  title: string
  subtitle: JSX.Element | string | number
  className?: string
  titleClassName?: string
  subtitleClassName?: string
}

const AuditLogStreamingCard: React.FC<AuditLogStreamingCardProps> = ({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName
}) => {
  return (
    <Card className={cx(className, css.cardStyles)}>
      <Text font={{ size: 'small' }} margin={{ top: 'small' }} className={cx(css.title, titleClassName)}>
        {title}
      </Text>
      <Text margin={{ top: 'small' }} font={{ weight: 'semi-bold' }} className={cx(subtitleClassName)}>
        {subtitle}
      </Text>
    </Card>
  )
}

export default AuditLogStreamingCard
