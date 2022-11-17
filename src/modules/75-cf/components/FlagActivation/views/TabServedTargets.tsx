/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import type { Feature } from 'services/cf'
import css from './MetricsView.module.scss'

export const TabServedTargets: React.FC<{ flagData: Feature; startDate: Date; endDate: Date }> = () => {
  return <Container className={css.contentBody}></Container>
}
