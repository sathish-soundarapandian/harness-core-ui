/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Icon, IconName, Layout, Popover, Text } from '@harness/uicore'
import React, { FC } from 'react'
import type { CellProps } from 'react-table'
import cx from 'classnames'
import { Classes, Divider, PopoverInteractionKind } from '@blueprintjs/core'
import { Duration } from '@common/components'
import { ExecutionStatusIcon } from '@pipeline/components/ExecutionStatusIcon/ExecutionStatusIcon'
import type { PipelineGraphState } from '@pipeline/components/PipelineDiagram/types'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { useStrings } from 'framework/strings'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import { LabeValue } from '@pipeline/pages/pipeline-list/PipelineListTable/PipelineListCells'
import css from './ExecutionListTable.module.scss'

export interface ExecutionStageProps {
  row?: CellProps<PipelineExecutionSummary>['row']
  stage: PipelineGraphState
  isSelectiveStage: boolean
  isMatrixStage?: boolean
}

const stageIconMap: Partial<Record<StageType, IconName>> = {
  [StageType.BUILD]: 'ci-solid',
  [StageType.DEPLOY]: 'cd-solid',
  [StageType.SECURITY]: 'sto-color-filled',
  [StageType.FEATURE]: 'ff-solid',
  [StageType.APPROVAL]: 'approval-stage-icon',
  [StageType.CUSTOM]: 'pipeline-custom'
}

export const ExecutionStage: FC<ExecutionStageProps> = ({ stage, isSelectiveStage, isMatrixStage }) => {
  const { getString } = useStrings()
  const iconName = stageIconMap[stage.type as StageType]
  const data: PipelineExecutionSummary = stage.data || {}
  const stageFailureMessage = data?.failureInfo?.message
  // TODO: others stages UX not available yet
  const cdStageInfo = (stage.data as PipelineExecutionSummary)?.moduleInfo?.cd || {}

  return (
    <div className={cx(css.stage, isMatrixStage && css.matrixStage)}>
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        {iconName && <Icon name={iconName} size={16} />}
        <Text font={{ size: 'small' }} color={Color.GREY_900} lineClamp={1}>
          {stage.name}
        </Text>
      </Layout.Horizontal>

      <ExecutionStatusIcon status={data?.status as ExecutionStatus} />

      <div className={css.stageInfo}>
        <CDExecutionStageSummary stageInfo={cdStageInfo} />

        {isSelectiveStage && (
          <div className={css.selectiveStageExecution}>
            <Icon name="info" size={10} color={Color.GREY_600} />
            <Text margin={{ left: 'xsmall' }} font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_600}>
              {getString('pipeline.selectiveStageExecution')}
            </Text>
          </div>
        )}

        {stageFailureMessage && (
          <Text font={{ size: 'small' }} color={Color.RED_800} lineClamp={1}>
            {stageFailureMessage}
          </Text>
        )}
      </div>

      <Duration
        startTime={data?.startTs}
        endTime={data?.endTs}
        font={{ variation: FontVariation.TINY }}
        color={Color.GREY_600}
        durationText=""
      />
    </div>
  )
}

export const CDExecutionStageSummary: FC<{ stageInfo: Record<string, any> }> = ({ stageInfo }) => {
  const { getString } = useStrings()
  const serviceDisplayName = stageInfo.serviceInfo?.displayName
  const environment = stageInfo.infraExecutionSummary?.name || stageInfo.infraExecutionSummary?.identifier
  const { imagePath, tag } = stageInfo.serviceInfo?.artifacts?.primary || {}

  return serviceDisplayName && environment ? (
    <Layout.Horizontal>
      <Popover
        interactionKind={PopoverInteractionKind.HOVER}
        className={Classes.DARK}
        content={
          <Layout.Vertical spacing="small" padding="medium" style={{ maxWidth: 400 }}>
            <div>
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.WHITE}>
                {serviceDisplayName}
              </Text>
              <Divider className={css.divider} />
            </div>
            {imagePath && <LabeValue label="Image" value={imagePath} />}
            {tag && <LabeValue label="Tag" value={tag} />}
          </Layout.Vertical>
        }
      >
        <Layout.Horizontal spacing="xsmall" className={css.service} style={{ alignItems: 'center' }}>
          <Icon name="services" size={14} />
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
            {getString('service')}:
          </Text>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_800}>
            {serviceDisplayName}
          </Text>
        </Layout.Horizontal>
      </Popover>

      <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }}>
        <Icon name="environments" size={12} />
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
          {getString('environment')}:
        </Text>
        <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_800}>
          {environment}
        </Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  ) : null
}
