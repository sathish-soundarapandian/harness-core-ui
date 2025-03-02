/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, find, get, identity, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { ButtonVariation, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { String as StrTemplate, useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import type { StageDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import factory from '@pipeline/factories/ExecutionFactory'
import { StageType } from '@pipeline/utils/stageHelpers'
import { Duration } from '@common/components/Duration/Duration'
import { ExecutionStatus, isExecutionFailed, isExecutionComplete } from '@pipeline/utils/statusHelpers'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import ExecutionActions from '@pipeline/components/ExecutionActions/ExecutionActions'
import { usePermission } from '@rbac/hooks/usePermission'
import { useRunPipelineModalV1 } from '@pipeline/v1/components/RunPipelineModalV1/useRunPipelineModalV1'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import { extractInfo } from '@common/components/ErrorHandler/ErrorHandler'
import type { StoreType } from '@common/constants/GitSyncTypes'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isSimplifiedYAMLEnabled } from '@common/utils/utils'
import IACMWorkspaceHeader from './IACMWorkspaceHeader'
import css from './ExecutionStageDetailsHeader.module.scss'

export function ExecutionStageDetailsHeader(): React.ReactElement {
  const {
    allStagesMap,
    selectedStageId,
    selectedChildStageId,
    pipelineStagesMap,
    refetch,
    pipelineExecutionDetail,
    allNodeMap,
    selectedStageExecutionId,
    retriedHistoryInfo
  } = useExecutionContext()
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId, pipelineIdentifier, module, source } =
    useParams<PipelineType<ExecutionPathProps>>()

  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const getNodeId =
    selectedStageExecutionId !== selectedStageId && !isEmpty(selectedStageExecutionId)
      ? selectedStageExecutionId
      : selectedChildStageId && !isEmpty(selectedChildStageId)
      ? selectedChildStageId
      : selectedStageId

  const stage = pipelineStagesMap.get(getNodeId)
  const stageDetail = factory.getStageDetails(stage?.nodeType as StageType)
  const shouldShowError = isExecutionFailed(stage?.status)
  const responseMessages = defaultTo(
    pipelineExecutionDetail?.pipelineExecutionSummary?.failureInfo?.responseMessages,
    []
  )

  // check if the stage is retried or not
  const isStageRetried = React.useMemo(() => {
    const nodeUuid = defaultTo(stage?.nodeUuid, '')
    const stageNodeIdentifier =
      pipelineExecutionDetail?.pipelineExecutionSummary?.layoutNodeMap?.[nodeUuid]?.nodeIdentifier ||
      stage?.nodeIdentifier

    return retriedHistoryInfo?.retriedStages?.includes(defaultTo(stageNodeIdentifier, ''))
  }, [
    pipelineExecutionDetail?.pipelineExecutionSummary?.layoutNodeMap,
    retriedHistoryInfo?.retriedStages,
    stage?.nodeIdentifier,
    stage?.nodeUuid
  ])

  const errorMessage =
    responseMessages.length > 0
      ? extractInfo(responseMessages)
          .map(err => err.error?.message)
          .filter(identity)
          .join(', ')
      : defaultTo(stage?.failureInfo?.message, '')
  const { getString } = useStrings()
  const [canEdit, canExecute] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier as string
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE, PermissionIdentifier.EXECUTE_PIPELINE]
    },
    [orgIdentifier, projectIdentifier, accountId, pipelineIdentifier]
  )
  const stageNode = find(allNodeMap, node => node.setupId === getNodeId || node?.uuid === getNodeId)
  const selectedIACMStage = allStagesMap.get(selectedStageId)?.module === StageType.IACM.toLowerCase()
  let waitingStepsCount = 0

  Object.keys(allNodeMap).forEach(key => {
    if (allNodeMap[key].status === 'InputWaiting') {
      waitingStepsCount++
    }
  })

  const times = (
    <div className={css.times}>
      {stage?.startTs ? (
        <>
          <div className={css.timeDisplay}>
            <StrTemplate stringID="startedAt" className={css.timeLabel} />
            <span>:&nbsp;</span>
            <time>{stage?.startTs ? new Date(stage?.startTs).toLocaleString() : '-'}</time>
          </div>
          <Duration
            className={css.timeDisplay}
            durationText={<StrTemplate stringID="common.durationPrefix" className={css.timeLabel} />}
            startTime={stage?.startTs}
            endTime={stage?.endTs}
          />
        </>
      ) : (
        <Text
          font={{
            variation: FontVariation.H6
          }}
          color={Color.GREY_500}
        >
          {getString('pipeline.stageExpired')}
        </Text>
      )}
    </div>
  )
  const { CI_YAML_VERSIONING } = useFeatureFlags()
  const runPipeline = (): void => {
    isSimplifiedYAMLEnabled(module, CI_YAML_VERSIONING) ? openRunPipelineModalV1() : openRunPipelineModal()
  }

  const { openRunPipelineModal } = useRunPipelineModal({
    pipelineIdentifier,
    repoIdentifier: isGitSyncEnabled
      ? pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoIdentifier
      : pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoName,
    branch: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.branch,
    connectorRef: pipelineExecutionDetail?.pipelineExecutionSummary?.connectorRef,
    storeType: pipelineExecutionDetail?.pipelineExecutionSummary?.storeType as StoreType,
    stagesExecuted: [stage?.nodeIdentifier || '']
  })

  const { openRunPipelineModalV1 } = useRunPipelineModalV1({
    pipelineIdentifier,
    repoIdentifier: isGitSyncEnabled
      ? pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoIdentifier
      : pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoName,
    branch: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.branch,
    connectorRef: pipelineExecutionDetail?.pipelineExecutionSummary?.connectorRef,
    storeType: pipelineExecutionDetail?.pipelineExecutionSummary?.storeType as StoreType
  })

  const hideExecutionActionButtons = React.useMemo(() => {
    const parentRollbackStageId = get(pipelineExecutionDetail?.rollbackGraph?.pipelineExecutionSummary, [
      'parentStageInfo',
      'stagenodeid'
    ])
    return !isEmpty(parentRollbackStageId) && parentRollbackStageId === selectedStageId
  }, [pipelineExecutionDetail?.rollbackGraph?.pipelineExecutionSummary, selectedStageId])

  return (
    <div className={css.main}>
      <div className={css.stageDetails}>
        <div className={css.lhs} data-has-sibling={Boolean(stage && stageDetail?.component)}>
          <div className={css.stageTop}>
            <Text margin={{ bottom: 'small' }} font={{ variation: FontVariation.H6 }} lineClamp={1}>
              {stage?.name}
            </Text>

            {!hideExecutionActionButtons &&
              (!!pipelineExecutionDetail?.pipelineExecutionSummary?.allowStageExecutions &&
              isExecutionComplete(stage?.status as ExecutionStatus) ? (
                <RbacButton
                  icon="repeat"
                  tooltip={getString('pipeline.execution.actions.rerunStage')}
                  onClick={runPipeline}
                  variation={ButtonVariation.ICON}
                  disabled={!canExecute}
                  minimal
                  withoutBoxShadow
                  small
                  tooltipProps={{
                    isDark: true
                  }}
                />
              ) : (
                <ExecutionActions
                  executionStatus={stageNode?.status as ExecutionStatus}
                  refetch={refetch}
                  source={source}
                  params={{
                    orgIdentifier: get(
                      pipelineExecutionDetail?.childGraph?.pipelineExecutionSummary,
                      'orgIdentifier',
                      orgIdentifier
                    ),
                    pipelineIdentifier,
                    projectIdentifier: get(
                      pipelineExecutionDetail?.childGraph?.pipelineExecutionSummary,
                      'projectIdentifier',
                      projectIdentifier
                    ),
                    accountId,
                    executionIdentifier: get(
                      pipelineExecutionDetail?.childGraph?.pipelineExecutionSummary,
                      'planExecutionId',
                      executionIdentifier
                    ),
                    module,
                    repoIdentifier: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoIdentifier,
                    connectorRef: pipelineExecutionDetail?.pipelineExecutionSummary?.connectorRef,
                    repoName: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoName,
                    branch: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.branch,
                    storeType: pipelineExecutionDetail?.pipelineExecutionSummary?.storeType as StoreType
                  }}
                  noMenu
                  stageName={stageNode?.name}
                  stageId={stageNode?.uuid}
                  canEdit={canEdit}
                  canExecute={canExecute}
                  modules={pipelineExecutionDetail?.pipelineExecutionSummary?.modules}
                />
              ))}
          </div>
          {times}
          {/* TODO: Need to uncomment and finish */}
          {/* <Text
            className={css.moreInfo}
            tooltip={
              <Container width={380} padding="large">
                {times}
                <Container flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                  <Icon name="conditional-when" size={20} margin={{ right: 'medium' }} />
                  <div>
                    <Text font={{ size: 'small', weight: 'semi-bold' }} color="black" margin={{ bottom: 'xsmall' }}>
                      {getString('whenCondition')}
                    </Text>
                    <Text font={{ size: 'small' }} color="grey900" margin={{ bottom: 'medium' }}>
                      {`<+environment.name> != ”QA”
<+environment.name> = “Dev”`}
                    </Text>
                    <Text font={{ size: 'small', weight: 'semi-bold' }} color="black" margin={{ bottom: 'xsmall' }}>
                      {getString('pipeline.expressionsEvaluation')}
                    </Text>
                    <Text font={{ size: 'small' }} color="grey900">
                      {`<+environment.name> != ”QA”
<+environment.name> = “blah”`}
                    </Text>
                  </div>
                </Container>
              </Container>
            }
          >
            {getString('common.moreInfo')}
          </Text> */}
        </div>
        {selectedIACMStage && <IACMWorkspaceHeader allNodeMap={allNodeMap} />}
        <div>
          {stage && stageDetail?.component
            ? React.createElement<StageDetailProps>(stageDetail.component, {
                stage
              })
            : null}
        </div>
        {isStageRetried ? (
          <Text
            font={{ variation: FontVariation.BODY }}
            icon="re-executed"
            margin={{ top: 0, bottom: 0, left: 'large', right: 'large' }}
            color={Color.GREY_600}
          >
            {getString('pipeline.stageExecutedBefore')}
          </Text>
        ) : null}
      </div>

      {shouldShowError ? (
        <div className={css.errorMsgWrapper}>
          <ExecutionStatusLabel status={stage?.status as ExecutionStatus} />
          <div className={css.errorMsg}>
            <StrTemplate className={css.errorTitle} stringID="errorSummaryText" tagName="div" />
            <Text lineClamp={1}>{errorMessage}</Text>
          </div>
        </div>
      ) : null}

      {waitingStepsCount ? (
        <div className={css.waitingMsgWrapper}>
          <ExecutionStatusLabel status={'InputWaiting' as ExecutionStatus} />
          <div className={css.errorMsg}>
            <StrTemplate className={css.inputMessage} stringID="pipeline.requireInput" />
            <div className={css.waitingCount}>{waitingStepsCount}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
