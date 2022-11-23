/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import css from './RefreshForNewData.module.scss'

export interface RefreshViewForNewButtonProps {
  onClick: () => void
  className?: string
}

export function RefreshViewForNewData(props: RefreshViewForNewButtonProps): JSX.Element {
  const { onClick, className } = props
  const { getString } = useStrings()
  return (
    <Container onClick={() => onClick()} className={cx(css.main, className)}>
      <Text>{getString('pipeline.verification.refreshViewForNewData')}</Text>
      <Text intent="primary" icon="refresh" iconProps={{ size: 12 }}>
        {getString('common.refresh')}
      </Text>
      <Text>{getString('pipeline.verification.toGetLatest')}</Text>
    </Container>
  )
}
