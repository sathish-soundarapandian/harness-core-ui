/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { NodeRiskCountDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import NodeRiskCountsDisplay from './NodeRiskCountsDisplay'
import DeploymentMetricsStyle from '../../../DeploymentMetrics.module.scss'

interface NodeCountProps {
  nodeRiskCount?: NodeRiskCountDTO
}

const NodeCount: React.FC<NodeCountProps> = props => {
  const { getString } = useStrings()
  const { nodeRiskCount } = props

  return (
    <Layout.Horizontal className={DeploymentMetricsStyle.nodeCount}>
      <NodeRiskCountsDisplay nodeDetails={nodeRiskCount?.nodeRiskCounts} />
      <Layout.Horizontal style={{ flex: '1' }}>
        <Text font={{ variation: FontVariation.SMALL }} className={DeploymentMetricsStyle.nodeCountMessage}>
          <strong>
            {nodeRiskCount?.anomalousNodeCount}/{nodeRiskCount?.totalNodeCount} &nbsp;
          </strong>
          {getString('pipeline.verification.nodeCountDisplay')}
        </Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

export default NodeCount
