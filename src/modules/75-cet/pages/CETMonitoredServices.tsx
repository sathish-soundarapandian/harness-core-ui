/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { ErrorTracking } from '@cet/ErrorTrackingApp'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useStrings } from 'framework/strings'
import type { ETCustomMicroFrontendProps } from '@cet/ErrorTracking.types'
import NotificationMethods from '@pipeline/components/Notifications/Steps/NotificationMethods'
import Overview from '@pipeline/components/Notifications/Steps/Overview'

export const CETMonitoredServices = (): JSX.Element => {
  const { getString } = useStrings()
  const CET_ENABLED = useFeatureFlag(FeatureFlag.CET_ENABLED)

  const componentLocation = {
    pathname: '/etmonitoredservices'
  }

  useDocumentTitle([getString('common.monitoredServices')])

  if (CET_ENABLED) {
    return (
      <ChildAppMounter<ETCustomMicroFrontendProps>
        ChildApp={ErrorTracking}
        componentLocation={componentLocation}
        customComponents={{
          NotificationWizardOverviewStep: Overview,
          NotificationWizardMethodStep: NotificationMethods
        }}
      />
    )
  } else {
    return <></>
  }
}
