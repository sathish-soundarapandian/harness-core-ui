/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import css from './ChangeTimelineError.module.scss'

export default function ChangeTimelineError({ error }: { error: string }): JSX.Element {
  return (
    <Container data-testid={'timelineError'} className={css.errorContainer}>
      <Text icon={'warning-sign'} iconProps={{ color: Color.RED_500, size: 16 }} font={{ size: 'medium' }}>
        {error}
      </Text>
    </Container>
  )
}
