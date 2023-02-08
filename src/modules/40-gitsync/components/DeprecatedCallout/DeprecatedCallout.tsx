/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Callout } from '@blueprintjs/core'
import css from './DeprecatedCallout.module.scss'

const DeprecatedCallout: React.FC = () => {
  return (
    <Callout intent="warning" className={css.deprecatedCallout}>
      We noticed that you’re still using older version of Git Experience in this project which has now reached
      <b>&nbsp;End-of-Support</b>. Harness has now introduced a
      <a
        href="https://developer.harness.io/docs/platform/Git-Experience/git-experience-overview"
        target="_blank"
        rel="noreferrer"
      >
        <b>&nbsp;new and simplified version of Git Experience,&nbsp;</b>
      </a>
      and we encourage you to migrate to new Git Experience at the earliest to continue getting uninterrupted support.
      Please contact
      <a href="https://support.harness.io/hc/en-us" target="_blank" rel="noreferrer">
        <b>&nbsp;Harness Support&nbsp;</b>
      </a>
      to schedule your migration.
    </Callout>
  )
}

export default DeprecatedCallout
