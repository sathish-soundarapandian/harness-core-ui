/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { RiskValues, getRiskColorValue } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import type { ColumnChartPopoverContentProps } from './ColumnChartPopoverContent.types'
import css from './ColumnChartPopoverContent.module.scss'

export default function ColumnChartPopoverContent(props: ColumnChartPopoverContentProps): JSX.Element {
  const { cell } = props
  const { getString } = useStrings()

  let content = <Text color={Color.WHITE}>{getString('noData')}</Text>
  if (cell.riskStatus !== RiskValues.NO_DATA) {
    content = (
      <>
        <Text color={Color.WHITE} inline>
          {`${getString('cv.healthScore')}:`}
        </Text>
        <Text className={css.healthScore} color={getRiskColorValue(cell.riskStatus, false)}>
          {cell?.healthScore}
        </Text>
      </>
    )
  }

  return (
    <Container>
      <Text lineClamp={1} className={css.timeRange}>{`${new Date(
        cell.timeRange?.startTime
      ).toLocaleString()} - ${new Date(cell.timeRange?.endTime).toLocaleString()}`}</Text>
      {content}
    </Container>
  )
}
