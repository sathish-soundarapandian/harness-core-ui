/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from '../TimelineRow.module.scss'

export default function TimelineRowNoData({ noDataMessage }: { noDataMessage: string }): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container data-testid={'timelineNoData'} className={css.noDataContainer}>
      <Text font={{ size: 'xsmall' }}>{noDataMessage || getString('noData')}</Text>
    </Container>
  )
}
