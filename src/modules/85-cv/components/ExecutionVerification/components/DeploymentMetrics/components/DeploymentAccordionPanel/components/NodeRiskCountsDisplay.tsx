/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Container, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { RiskValues } from '@cv/utils/CommonUtils'
import type { NodeRiskCount } from 'services/cv'
import type { NodeCountDisplayProps, NodeDetail } from './NodesCount.types'
import css from './NodesCount.module.scss'

const NodeRiskCountsDisplay: React.FC<NodeCountDisplayProps> = props => {
  const { nodeDetails } = props

  const { HEALTHY, NEED_ATTENTION, OBSERVE, UNHEALTHY, WARNING } = RiskValues
  const { nodeCountDisplayHealthy, nodeCountDisplayNeedAttention, nodeCountDisplayObserve, nodeCountDisplayUnhealthy } =
    css

  return (
    <Layout.Horizontal style={{ flexWrap: 'wrap' }}>
      {nodeDetails?.map((node: NodeDetail | NodeRiskCount) => {
        const { risk, count } = node

        return (
          <Container
            key={risk}
            data-testid="nodecount_display"
            margin={{ right: 'xsmall' }}
            color={Color.WHITE}
            className={cx(css.nodeCountDisplay, {
              [nodeCountDisplayHealthy]: risk === HEALTHY,
              [nodeCountDisplayNeedAttention]: risk === NEED_ATTENTION,
              [nodeCountDisplayObserve]: risk === OBSERVE || risk === WARNING,
              [nodeCountDisplayUnhealthy]: risk === UNHEALTHY
            })}
          >
            {count}
          </Container>
        )
      })}
    </Layout.Horizontal>
  )
}

export default NodeRiskCountsDisplay
