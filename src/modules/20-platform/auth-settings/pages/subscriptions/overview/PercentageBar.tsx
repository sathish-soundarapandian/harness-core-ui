/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import css from './PercentageBar.module.scss'

interface PercentageBar {
  width: number
}
const PercentageBar: React.FC<PercentageBar> = ({ width }) => {
  return (
    <Container
      background={Color.GREY_100}
      width="100%"
      height={10}
      border={{ radius: 4 }}
      margin={{ bottom: 'small' }}
      className={css.bar}
    >
      <Container height="100%" width={`${width}%`} background={Color.PRIMARY_6} border={{ radius: 4 }} />
    </Container>
  )
}

export default PercentageBar
