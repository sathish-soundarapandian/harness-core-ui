/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import type { ColumnChartEventMarkerProps } from './ColumnChartEventMarker.types'
import css from './ColumnChartEventMarker.module.scss'

export default function ColumnChartEventMarker(props: ColumnChartEventMarkerProps): JSX.Element {
  const { columnHeight, leftOffset, markerColor } = props
  return (
    <Container
      className={css.eventMarker}
      style={{ height: columnHeight + 60, left: leftOffset, borderColor: markerColor }}
    >
      <Container className={css.eventMarkerSquare} style={{ backgroundColor: markerColor }} />
    </Container>
  )
}
