/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Icon, IconName, Layout, Text } from '@harness/uicore'
import React, { FC } from 'react'
import type { CellProps } from 'react-table'
import { Duration } from '@common/components'
import { ExecutionStatusIcon } from '@pipeline/components/ExecutionStatusIcon/ExecutionStatusIcon'
import type { PipelineGraphState } from '@pipeline/components/PipelineDiagram/types'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { useStrings } from 'framework/strings'
import type { CDStageModuleInfo } from 'services/cd-ng'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import css from './ExecutionListTable.module.scss'

export interface ExecutionStageProps {
  row?: CellProps<PipelineExecutionSummary>['row']
  stage: PipelineGraphState
}

const stageIconMap: Partial<Record<StageType, IconName>> = {
  [StageType.BUILD]: 'cd-main',
  [StageType.DEPLOY]: 'ci-main',
  [StageType.SECURITY]: 'sto-color-filled'
}

export const ExecutionStage: FC<ExecutionStageProps> = ({ stage }) => {
  const iconName = stageIconMap[stage.type as StageType]
  const data: PipelineExecutionSummary = stage.data || {}
  const stageFailureMessage = data?.failureInfo?.message
  return (
    <div className={css.stage}>
      <div />
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        {iconName && <Icon name={iconName} size={18} />}
        <Text font={{ size: 'small' }} color={Color.GREY_900} lineClamp={1}>
          {stage.name}
        </Text>
      </Layout.Horizontal>

      <ExecutionStatusIcon status={data?.status as ExecutionStatus} />

      <Text font={{ size: 'small' }} color={Color.GREY_900}>
        <ExecutionStageSummary stage={data} />
      </Text>

      <Text font={{ size: 'small' }} color={Color.RED_800} lineClamp={1} className={css.failureMessage}>
        {stageFailureMessage}
      </Text>

      <Duration
        startTime={data?.startTs}
        endTime={data?.endTs}
        font={{ variation: FontVariation.SMALL }}
        color={Color.GREY_500}
        durationText=""
      />
    </div>
  )
}

export const ExecutionStageSummary: FC<{ stage: PipelineExecutionSummary }> = ({ stage }) => {
  const { getString } = useStrings()
  const stageInfo = stage?.moduleInfo?.cd || ({} as CDStageModuleInfo)
  const serviceInfo = stageInfo?.serviceInfo || {}
  const environment = stageInfo.infraExecutionSummary?.name || stageInfo.infraExecutionSummary?.identifier

  return serviceInfo?.identifier && environment ? (
    <Layout.Horizontal className={css.executionStageSummary}>
      <div>
        <Text font={{ size: 'small' }}>{getString('pipeline.executionList.servicesDeployedText', { size: 1 })}: </Text>
        <Text font={{ size: 'small', weight: 'semi-bold' }}>{serviceInfo?.displayName} </Text>
      </div>

      <div>
        <Text font={{ size: 'small' }}>{getString('pipeline.executionList.EnvironmentsText', { size: 1 })}: </Text>
        <Text font={{ size: 'small', weight: 'semi-bold' }}>{environment} </Text>
      </div>
    </Layout.Horizontal>
  ) : null
}
