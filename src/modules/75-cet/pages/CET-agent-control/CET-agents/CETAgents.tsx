/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { AgentListProps, ErrorTracking } from '@cet/ErrorTrackingApp'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import type { ETCustomMicroFrontendProps } from '@cet/ErrorTracking.types'
import NotificationMethods from '@pipeline/components/Notifications/Steps/NotificationMethods'
import Overview from '@pipeline/components/Notifications/Steps/Overview'

interface Props {
  pathComponentLocation: string
}

export const CETAgents = (props: Props): JSX.Element => {
  const componentLocation = {
    pathname: props.pathComponentLocation
  }

  useDocumentTitle(['ET', 'Agents'])

  return (
    <ChildAppMounter<AgentListProps & ETCustomMicroFrontendProps>
      ChildApp={ErrorTracking}
      componentLocation={componentLocation}
      customComponents={{ NotificationWizardOverviewStep: Overview, NotificationWizardMethodStep: NotificationMethods }}
    />
  )
}
