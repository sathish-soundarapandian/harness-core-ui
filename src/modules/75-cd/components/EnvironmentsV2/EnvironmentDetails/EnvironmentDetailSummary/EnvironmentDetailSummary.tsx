/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Page } from '@harness/uicore'
import { EnvironmentDetailExecutionList } from './EnvironmentDetailExecutionList'
import { EnvironmentDetailInstances } from './EnvironmentDetailInstances'

interface EnvironmentDetailSummaryProps {
  environmentIdentifiers: string
}

export default function EnvironmentDetailSummary(props: EnvironmentDetailSummaryProps): JSX.Element {
  const { environmentIdentifiers } = props
  const [serviceIdFilter, setServiceIdFilter] = useState<string>()

  return (
    <Page.Body>
      <EnvironmentDetailInstances setServiceId={setServiceIdFilter} />
      <EnvironmentDetailExecutionList
        environmentIdentifiers={environmentIdentifiers}
        serviceIdentifiers={serviceIdFilter}
      />
    </Page.Body>
  )
}
