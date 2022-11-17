/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'

import SignupIllustration from './images/SignupIllustration.png'
import css from './AuthLayout.module.scss'

const AuthLayout: React.FC<React.PropsWithChildren<unknown>> = props => {
  return (
    <div className={css.layout}>
      <div className={css.cardColumn}>
        <div className={css.card}>
          <Container>{props.children}</Container>
        </div>
      </div>
      <div className={css.imageColumn}>
        <img className={css.image} src={SignupIllustration} alt="" aria-hidden />
      </div>
    </div>
  )
}

export default AuthLayout
