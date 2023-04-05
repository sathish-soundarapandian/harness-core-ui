/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { ErrorTracking } from '@et/ErrorTrackingApp'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useStrings } from 'framework/strings'

export const ETMonitoredServices = (): JSX.Element => {
  const { getString } = useStrings()
  const CET_ENABLED = useFeatureFlag(FeatureFlag.CET_ENABLED)

  const componentLocation = {
    pathname: '/etmonitoredservices'
  }

  useDocumentTitle([getString('et.title'), getString('common.monitoredServices')])

  if (CET_ENABLED) {
    return <ChildAppMounter ChildApp={ErrorTracking} componentLocation={componentLocation} />
  } else {
    return <></>
  }
}
