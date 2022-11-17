/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, Icon, Layout, Text, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { getStageType } from '@pipeline/utils/templateUtils'
import type { StagesMap } from '../../../PipelineContext/PipelineContext'
import css from './StageList.module.scss'

interface StageListProps {
  stages: StageElementWrapper[]
  templateTypes?: { [key: string]: string }
  selectedStageId?: string
  stagesMap: StagesMap
  onClick?: (stageId: string, type: StageType) => void
}

export function StageList({
  stages,
  templateTypes,
  selectedStageId,
  onClick,
  stagesMap
}: StageListProps): React.ReactElement {
  const list: Array<{ name: string; icon: IconName; identifier: string; type: string; isTemplate: boolean }> = []
  stages.forEach((node: StageElementWrapper) => {
    const stageType = getStageType(node.stage, templateTypes)
    const stageData = stagesMap[stageType]

    if (node.stage?.identifier === selectedStageId) {
      list.unshift({
        name: node.stage?.name || '',
        identifier: node.stage?.identifier || '',
        icon: stageData.icon,
        type: stageType,
        isTemplate: !!node.stage?.template
      })
    } else {
      list.push({
        name: node.stage?.name || '',
        identifier: node.stage?.identifier || '',
        icon: stageData.icon,
        type: stageType,
        isTemplate: !!node.stage?.template
      })
    }
  })
  return (
    <Layout.Vertical padding={'small'} spacing={'xsmall'} className={css.container}>
      {list.map(node => (
        <Container
          key={node.identifier}
          className={css.stageRow}
          background={node.isTemplate ? Color.PRIMARY_1 : undefined}
          padding="small"
          onClick={e => {
            e.stopPropagation()
            onClick?.(node.identifier, node.type as StageType)
          }}
        >
          {node.isTemplate && (
            <Icon name={'template-library'} size={6} className={css.secondaryIcon} color={Color.PRIMARY_7} />
          )}
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
            <Icon name={node.icon} size={20} />
            <Text lineClamp={1} font={{ weight: 'semi-bold', size: 'small' }} color={Color.GREY_800}>
              {node.name}
            </Text>
          </Layout.Horizontal>
        </Container>
      ))}
    </Layout.Vertical>
  )
}
