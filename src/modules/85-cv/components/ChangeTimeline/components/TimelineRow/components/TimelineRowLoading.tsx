/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Classes } from '@blueprintjs/core'
import { Container } from '@harness/uicore'
import css from './TimelineRowLoading.module.scss'

interface TimelineRowLoadingProps {
  loadingBlockWidth?: string
}

export default function TimelineRowLoading({ loadingBlockWidth }: TimelineRowLoadingProps): JSX.Element {
  const LoadingBlock = (): JSX.Element => (
    <Container width={loadingBlockWidth ?? '75px'} height={'5px'} className={Classes.SKELETON}>
      {' '}
      &nbsp;{' '}
    </Container>
  )

  const LoadingCircle = (): JSX.Element => (
    <Container width={'7px'} height={'7px'} style={{ borderRadius: '4px' }} className={Classes.SKELETON}>
      {' '}
      &nbsp;{' '}
    </Container>
  )

  const loadingBlocks = useMemo(() => {
    const loadingFields: JSX.Element[] = []
    for (let i = 1; i <= 14; i++) {
      loadingFields.push(
        <>
          <LoadingBlock key={`${i}block`} />
          {i < 14 && <LoadingCircle key={`${i}circle`} />}
        </>
      )
    }
    return loadingFields
  }, [])
  return (
    <Container data-testid={'timelineLoading'} flex className={css.loadingContainer}>
      {loadingBlocks}
    </Container>
  )
}
