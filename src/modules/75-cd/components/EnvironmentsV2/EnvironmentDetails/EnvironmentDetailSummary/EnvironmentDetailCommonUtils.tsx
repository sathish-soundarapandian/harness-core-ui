/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import emptyInstanceDetail from './EmptyStateSvgs/emptyInstanceDetail.svg'

import css from './EnvironmentDetailSummary.module.scss'

export function DialogEmptyState(): JSX.Element {
  return (
    <Container className={css.instanceEmptyState}>
      <img src={emptyInstanceDetail} />
      <Text>{'Select an Infrastructure to view instance details'}</Text>
    </Container>
  )
}
