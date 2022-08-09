/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { LookerEvent } from '@dashboards/types/LookerTypes.types'

const DASHBOARDS_ORIGIN = 'https://dashboards.harness.io'

export interface LookerEmbeddedDashboardProps {
  embedUrl: string
  onLookerAction: (dashboard: LookerEvent) => void
}

const LookerEmbeddedDashboard: React.FC<LookerEmbeddedDashboardProps> = ({ embedUrl, onLookerAction }) => {
  React.useEffect(() => {
    const lookerEventHandler = (event: MessageEvent<string>): void => {
      if (event.origin === DASHBOARDS_ORIGIN) onLookerAction(JSON.parse(event.data) as LookerEvent)
    }
    window.addEventListener('message', lookerEventHandler)
    return () => window.removeEventListener('message', lookerEventHandler)
  }, [onLookerAction])

  return (
    <iframe
      src={embedUrl}
      height="100%"
      width="100%"
      frameBorder="0"
      id="looker-dashboard"
      data-testid="dashboard-iframe"
    />
  )
}

export default LookerEmbeddedDashboard
