/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import dataErrorImage from '@cv/assets/dataError.svg'

import type { ChangeSourceFetchingErrorProps } from './ChangesSourceFetchingErrorProps.types'
import css from './ChangesSourceFetchingError.module.scss'

export default function ChangeSourceFetchingError(props: ChangeSourceFetchingErrorProps): JSX.Element {
  const { errorMessage } = props
  return (
    <Container className={css.errorContainer}>
      <img src={dataErrorImage} />
      <Text font={{ size: 'small' }} color={Color.GREY_500} className={css.errorText}>
        {errorMessage}
      </Text>
    </Container>
  )
}
