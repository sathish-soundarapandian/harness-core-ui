/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Link } from '@harness/uicore'
import css from './TitledInfo.module.scss'

export interface TitledInfoProps {
  title: string
  value: string | number | undefined
  href?: string
  className?: string
  maxWidth?: string
}

export const TitledInfo: React.FC<TitledInfoProps> = (props: TitledInfoProps) => {
  const { title, value, href, maxWidth, className, ...restProps } = props

  const style = { maxWidth: maxWidth ? maxWidth : '165px' }

  return (
    <div className={css.container} {...restProps}>
      <Text>{title || ''}</Text>
      {!href && <Text style={style}>{value && value.toString()}</Text>}
      {href && (
        <Link style={style} href={href}>
          {value && value.toString()}
        </Link>
      )}
    </div>
  )
}
