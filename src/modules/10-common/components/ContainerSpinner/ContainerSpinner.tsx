/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Container } from '@harness/uicore'
import { PageSpinner } from '@common/components'
import css from './ContainerSpinner.module.scss'

export const ContainerSpinner: React.FC<React.ComponentProps<typeof Container>> = ({ className, ...props }) => {
  return (
    <Container className={cx(css.spinner, className)} {...props}>
      <PageSpinner />
    </Container>
  )
}
