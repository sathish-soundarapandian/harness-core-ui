/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import emptyServiceDetail from '@pipeline/icons/emptyServiceDetail.svg'
import css from './ServiceDetailsSummaryV2.module.scss'

export function EnvCardViewEmptyState({ message }: { message: string }): JSX.Element {
  return (
    <Container className={css.envCardViewEmptyState}>
      <img src={emptyServiceDetail} alt={message} />
      <Text>{message}</Text>
    </Container>
  )
}
