/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import StageHeader from '@pipeline/pages/execution/ExecutionPipelineView/ExecutionGraphView/ExecutionGraph/components/StageHeader'
import css from './HoverCard.module.scss'

export interface HoverCardProps {
  data?: any
  children?: any
}

export default function HoverCard(props: HoverCardProps): React.ReactElement {
  const { data } = props
  return (
    <Container className={css.hovercard}>
      {!!data && <StageHeader data={data} />}
      {props?.children}
    </Container>
  )
}
