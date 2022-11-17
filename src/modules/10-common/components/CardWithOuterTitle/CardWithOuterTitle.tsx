/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Layout, Text, Card } from '@harness/uicore'
import { Color } from '@harness/design-system'
import css from './CardWithOuterTitle.module.scss'

interface CardWithOuterTitleProp {
  title?: string
  children: React.ReactNode
  className?: string
  dataTooltipId?: string
  headerClassName?: string
}

export default function CardWithOuterTitle({
  title,
  children,
  className,
  dataTooltipId,
  headerClassName
}: CardWithOuterTitleProp): JSX.Element {
  return (
    <Layout.Vertical margin={'medium'} className={cx(css.tooltipStyle, className)}>
      {title && (
        <Text color={Color.BLACK} className={cx(css.header, headerClassName)} tooltipProps={{ dataTooltipId }}>
          {title}
        </Text>
      )}
      <Card className={cx(css.sectionCard, css.shadow)}>{children}</Card>
    </Layout.Vertical>
  )
}
