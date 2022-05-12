/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, Text } from '@wings-software/uicore'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { StagesMap } from '../../PipelineContext/PipelineContext'

interface StageListProps {
  stages: any
  templateTypes: { [key: string]: string }
  selectedStageId?: string
  stagesMap: StagesMap
  onClick?: (stageId: string, type: StageType) => void
}

export function StageList({ stages, onClick }: StageListProps): JSX.Element {
  return (
    <>
      {stages.map((node: any) => (
        <Layout.Horizontal
          style={{ cursor: 'pointer' }}
          spacing="small"
          padding="small"
          key={node.identifier}
          onClick={e => {
            e.stopPropagation()
            onClick?.(node.identifier, node.type as StageType)
          }}
        >
          <Icon name={node.icon} />
          <Text lineClamp={1} width={200}>
            {node.name}
          </Text>
        </Layout.Horizontal>
      ))}
    </>
  )
}
