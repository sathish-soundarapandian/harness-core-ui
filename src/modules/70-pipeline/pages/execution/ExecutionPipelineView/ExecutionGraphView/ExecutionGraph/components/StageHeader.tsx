/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, timeToDisplayText, Text, Layout, Container } from '@harness/uicore'
import moment from 'moment'
import { defaultTo, isNil } from 'lodash-es'
import { Color, FontVariation } from '@harness/design-system'
import { Popover, Position } from '@blueprintjs/core'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { StringUtils } from '@common/exports'
import { useStrings } from 'framework/strings'
import defaultNodeCss from '@pipeline/components/PipelineDiagram/Nodes/DefaultNode/DefaultNode.module.scss'
import css from './StageHeader.module.scss'

export interface StageHeaderProps {
  data?: any
}

export default function StageHeader(props: StageHeaderProps): React.ReactElement {
  const { data } = props
  const { getString } = useStrings()
  const stageDetails = data?.data ? data?.data : data
  const { retriedHistoryInfo, pipelineExecutionDetail } = useExecutionContext()

  const stageNodeUuid = stageDetails?.nodeUuid
  const stageNodeIdentifier =
    pipelineExecutionDetail?.pipelineExecutionSummary?.layoutNodeMap?.[stageNodeUuid]?.nodeIdentifier ||
    stageDetails?.nodeIdentifier

  const isStageRetried =
    retriedHistoryInfo?.retriedStages?.includes(defaultTo(stageNodeIdentifier, '')) && isNil(stageDetails?.stepType)

  let delta = stageDetails?.startTs ? Math.abs(stageDetails?.startTs - (stageDetails?.endTs || Date.now())) : 0
  delta = Math.round(delta / 1000) * 1000
  const timeText = timeToDisplayText(delta)
  return (
    <Container>
      <Layout.Vertical style={{ flex: 1 }} flex={{ alignItems: 'flex-start' }} padding="medium">
        <div className={css.nameAndLabelWrapper}>
          <Text inline lineClamp={2} font={{ weight: 'semi-bold', size: 'normal' }} color={Color.BLACK}>
            {stageDetails.name}
          </Text>
          <Layout.Horizontal spacing="small">
            {isStageRetried ? (
              <Popover
                interactionKind="hover"
                popoverClassName={defaultNodeCss.retriedPopoverStyle}
                modifiers={{ preventOverflow: { escapeWithReference: true } }}
                position={Position.TOP_LEFT}
                content={
                  <Text
                    font={{ variation: FontVariation.BODY }}
                    className={defaultNodeCss.retriedTextStyle}
                    color={Color.GREY_200}
                  >
                    {getString('pipeline.stageExecutedBefore')}
                  </Text>
                }
              >
                <Icon name="re-executed" />
              </Popover>
            ) : null}
            <ExecutionStatusLabel className={css.label} status={stageDetails?.status} />
          </Layout.Horizontal>
        </div>
        {stageDetails.status !== ExecutionStatusEnum.Skipped && (
          <Layout.Horizontal spacing={'xsmall'}>
            {!!stageDetails?.startTs && (
              <Container margin={{ right: 'small' }}>
                <Text inline={true} font={{ size: 'small' }} color={Color.GREY_500}>
                  {getString('pipeline.startTime')}:{' '}
                </Text>
                <Text inline={true} font={{ size: 'small' }} color={Color.BLACK}>
                  {moment(stageDetails.startTs).format(StringUtils.DEFAULT_DATE_FORMAT)}
                </Text>
              </Container>
            )}
            {!!timeText && (
              <Container>
                <Text inline={true} font={{ size: 'small' }} color={Color.GREY_500}>
                  {getString('pipeline.duration')}:
                </Text>
                <Text inline={true} font={{ size: 'small' }} color={Color.BLACK}>
                  {timeText}
                </Text>
              </Container>
            )}
          </Layout.Horizontal>
        )}
      </Layout.Vertical>

      {stageDetails.status === ExecutionStatusEnum.Failed && (
        <Layout.Horizontal
          background={Color.RED_100}
          padding={{ right: 'medium', top: 'small', bottom: 'small', left: 'small' }}
        >
          <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
            <Icon name="warning-sign" color={Color.RED_500} size={16} />
          </Container>
          <Layout.Vertical spacing={'xsmall'} style={{ flex: 1 }}>
            <Text style={{ fontSize: '12px', wordBreak: 'break-word' }} lineClamp={4} color={Color.RED_500}>
              {stageDetails?.failureInfo?.message || stageDetails?.failureInfo?.errorMessage}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
      )}
    </Container>
  )
}
