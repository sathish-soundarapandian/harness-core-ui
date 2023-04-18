/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { lazy, FC } from 'react'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import type { SugaryMFEProps } from './SugaryTypes'

// eslint-disable-next-line import/no-unresolved
const RemoteSugaryApp = lazy(() => import('sugary/App'))
/*
 * Would like to change these baseRoutePath and accountId props to use the default
 * renderUrl.
 */
const PolicyManagementMFE: FC = props => {
  return (
    <ChildAppMounter<SugaryMFEProps>
      ChildApp={RemoteSugaryApp}
      baseRoutePath={'/sugary'}
      customComponents={{}}
      customHooks={{}}
      {...props}
    />
  )
}

export default PolicyManagementMFE
