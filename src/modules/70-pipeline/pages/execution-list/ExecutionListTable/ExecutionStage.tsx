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
import cx from 'classnames'
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
  isSelectiveStage: boolean
  isMatrixStage?: boolean
}

const stageIconMap: Partial<Record<StageType, IconName>> = {
  [StageType.BUILD]: 'cd-main',
  [StageType.DEPLOY]: 'ci-main',
  [StageType.SECURITY]: 'sto-color-filled'
}

export const ExecutionStage: FC<ExecutionStageProps> = ({ stage, isSelectiveStage, isMatrixStage }) => {
  const { getString } = useStrings()
  const iconName = stageIconMap[stage.type as StageType]
  const data: PipelineExecutionSummary = stage.data || {}
  const stageFailureMessage = data?.failureInfo?.message

  const stageInfo = stage.data?.moduleInfo?.cd || ({} as CDStageModuleInfo)
  const serviceDisplayName = stageInfo.serviceInfo?.displayName
  const environment = stageInfo.infraExecutionSummary?.name || stageInfo.infraExecutionSummary?.identifier

  return (
    <div className={cx(css.stage, isMatrixStage && css.matrixStage)}>
      <Layout.Horizontal
        spacing="small"
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
        margin={{ left: 'small' }}
      >
        {iconName && <Icon name={iconName} size={18} />}
        <Text font={{ size: 'small' }} color={Color.GREY_900} lineClamp={1}>
          {stage.name}
        </Text>
      </Layout.Horizontal>

      <ExecutionStatusIcon status={data?.status as ExecutionStatus} />

      <div className={css.stageInfo}>
        {serviceDisplayName && environment && (
          <div color={Color.GREY_900}>
            <ExecutionStageSummary serviceDisplayName={serviceDisplayName} environment={environment} />
          </div>
        )}

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

export const ExecutionStageSummary: FC<{ environment?: string; serviceDisplayName?: string }> = ({
  environment,
  serviceDisplayName
}) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal className={css.executionStageSummary}>
      {serviceDisplayName && (
        <div>
          <Text font={{ size: 'small' }}>
            {getString('pipeline.executionList.servicesDeployedText', { size: 1 })}:{' '}
          </Text>
          <Text font={{ size: 'small', weight: 'semi-bold' }}>{serviceDisplayName} </Text>
        </div>
      )}

      {environment && (
        <div>
          <Text font={{ size: 'small' }}>{getString('pipeline.executionList.EnvironmentsText', { size: 1 })}: </Text>
          <Text font={{ size: 'small', weight: 'semi-bold' }}>{environment} </Text>
        </div>
      )}
    </Layout.Horizontal>
  )
}
