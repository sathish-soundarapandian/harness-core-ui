/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Layout, Text, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React from 'react'
import { isUndefined } from 'lodash-es'
import cx from 'classnames'
import css from './DetailPageCard.module.scss'

export enum ContentType {
  TEXT = 'TEXT', //default
  CUSTOM = 'CUSTOM'
}

export interface Content {
  type?: ContentType
  label: string
  value?: string | JSX.Element
  hideOnUndefinedValue?: boolean
}

interface DetailPageCardProps {
  title: string
  content: Content[]
  classname?: string
}

const renderItem = ({
  type = ContentType.TEXT,
  label,
  value,
  hideOnUndefinedValue,
  ...rest
}: Content): JSX.Element | undefined => {
  if (isUndefined(value) && hideOnUndefinedValue) {
    return
  }

  let jsxContent
  if (type === ContentType.TEXT) {
    jsxContent = (
      <Layout.Vertical spacing="small" {...rest}>
        <Text style={{ fontSize: '12px' }}>{label}</Text>
        <Text color={Color.BLACK} width="424px" lineClamp={1}>
          {value}
        </Text>
      </Layout.Vertical>
    )
  } else if (type === ContentType.CUSTOM) {
    jsxContent = (
      <>
        {label ? <Text style={{ fontSize: '12px' }}>{label}</Text> : null}
        {value}
      </>
    )
  }
  return <Container className={css.detailsSectionRowWrapper}>{jsxContent}</Container>
}

const DetailPageCard: React.FC<DetailPageCardProps> = props => {
  const { title, content = [], classname } = props
  return (
    <Card className={cx(css.main, classname)} interactive={false} elevation={0} selected={false}>
      <Text color={Color.BLACK} style={{ fontSize: '16px', fontWeight: 600 }}>
        {title}
      </Text>
      <Layout.Vertical style={{ marginTop: 'var(--spacing-4)' }}>
        {content.map(item => renderItem(item))}
      </Layout.Vertical>
    </Card>
  )
}

export default DetailPageCard
