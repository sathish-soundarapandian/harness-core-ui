/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@harness/uicore'
import type { StyledProps } from '@harness/design-system'
import css from './NumberedList.module.scss'

interface NumberedListProps extends StyledProps {
  index: number
  showLine?: boolean
  content: React.ReactNode
}

const NumberedList: React.FC<NumberedListProps> = props => {
  const { index, content, showLine, ...rest } = props

  return (
    <Layout.Horizontal className={css.body} spacing={'medium'} {...rest}>
      <div>
        <div className={css.bulletIndex}>{index}</div>
        {showLine && <div className={css.line} />}
      </div>
      <div className={css.content}>{content}</div>
    </Layout.Horizontal>
  )
}

export default NumberedList
