/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ErrorTracking } from '@et/ErrorTrackingApp'
import ChildAppMounter from 'microfrontends/ChildAppMounter'

export const ETEventsSummary = (): JSX.Element => {
  const componentLocation = {
    pathname: '/eventsummary'
  }

  return <ChildAppMounter ChildApp={ErrorTracking} componentLocation={componentLocation} />
}
