/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import type { SLOError } from 'services/cv'
import css from './DataCollectionFailureTooltip.module.scss'

export default function DataCollectionFailureTooltip({ sloError }: { sloError: SLOError }) {
  const { errorMessage } = sloError
  return (
    <Layout.Vertical padding={'medium'} spacing={'xsmall'} className={css.tooltip}>
      <Text>{errorMessage}</Text>
    </Layout.Vertical>
  )
}
