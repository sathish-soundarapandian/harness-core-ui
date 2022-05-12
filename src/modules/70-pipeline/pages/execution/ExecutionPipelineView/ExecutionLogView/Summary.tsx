/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import css from './LogsHeader.module.scss'

export interface SummaryProps {
  summaryElement?: ReactElement
}

function Summary(props: SummaryProps) {
  const { summaryElement } = props

  if (summaryElement) {
    return <div className={css.summaryElement}>summaryElement</div>
  }

  return <div className={css.summaryElement}>Summary</div>
}

export default Summary
