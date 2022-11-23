/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Layout, Text } from '@harness/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { StatsInfo } from 'services/ce/services'
import CostTrend from '@ce/common/CostTrend'
import { Card, Loader } from './OverviewPageLayout'
import css from './OverviewPage.module.scss'

interface SummaryProps {
  cost: StatsInfo
  fetching: boolean
  name: string
}

const OverviewSummary = (props: SummaryProps) => {
  const { cost, name, fetching } = props
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      <Card>
        {fetching ? (
          <Loader className={css.cardLoader} />
        ) : (
          <Layout.Vertical spacing="medium">
            <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
              <Container>
                <Text inline color="grey500" font="small" tooltipProps={{ dataTooltipId: `overviewSummary${name}` }}>
                  {cost.statsLabel}
                </Text>
              </Container>
              <CostTrend value={cost.statsTrend} />
            </Layout.Horizontal>
            <Text color="black" font="medium">
              {cost.statsValue || getString('na')}
            </Text>
          </Layout.Vertical>
        )}
      </Card>
    </Layout.Horizontal>
  )
}

export default OverviewSummary
