/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Popover, Position } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { Card, Checkbox, Icon, Tag, TagsPopover, Text } from '@harness/uicore'
import cx from 'classnames'
import { defaultTo, get, isEmpty } from 'lodash-es'
import React, { useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { StoreType } from '@common/constants/GitSyncTypes'
import { Duration, TimeAgoPopover, UserLabel } from '@common/exports'
import type { ExecutionPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import executionFactory from '@pipeline/factories/ExecutionFactory'
import { CardVariant } from '@pipeline/utils/constants'
import {
  hasCDStage,
  hasCIStage,
  hasOverviewDetail,
  hasServiceDetail,
  hasSTOStage,
  StageType
} from '@pipeline/utils/stageHelpers'
import { ExecutionStatus, isExecutionIgnoreFailed, isExecutionNotStarted } from '@pipeline/utils/statusHelpers'
import { mapTriggerTypeToStringID } from '@pipeline/utils/triggerUtils'
import { String, useStrings } from 'framework/strings'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import type { ExecutionCardInfoProps } from '@pipeline/factories/ExecutionFactory/types'
import GitRemoteDetails from '@common/components/GitRemoteDetails/GitRemoteDetails'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { windowLocationUrlPartBeforeHash } from 'framework/utils/WindowLocation'
import type { EnvironmentDeploymentsInfo, ServiceDeploymentInfo } from 'services/cd-ng'
import { useExecutionCompareContext } from '../ExecutionCompareYaml/ExecutionCompareContext'
import { DashboardSelected, ServiceExecutionsCard } from '../ServiceExecutionsCard/ServiceExecutionsCard'
import { TimePopoverWithLocal } from './TimePopoverWithLocal'
import css from './ExecutionCard.module.scss'

export interface ExecutionCardProps {
  pipelineExecution: PipelineExecutionSummary
  staticCard?: boolean
  isPipelineInvalid?: boolean
  showGitDetails?: boolean
  isCD?: boolean
}

function ExecutionCardFooter({
  pipelineExecution,
  isCD = false
}: Pick<ExecutionCardProps, 'pipelineExecution' | 'isCD'>): React.ReactElement {
  const fontVariation = FontVariation.TINY
  const variantSize = 10
  return (
    <div className={css.footer}>
      <div className={css.triggerInfo}>
        <UserLabel
          className={css.user}
          name={
            get(pipelineExecution, 'moduleInfo.ci.ciExecutionInfoDTO.author.name') ||
            get(pipelineExecution, 'moduleInfo.ci.ciExecutionInfoDTO.author.id') ||
            get(pipelineExecution, 'executionTriggerInfo.triggeredBy.identifier') ||
            'Anonymous'
          }
          email={
            get(pipelineExecution, 'moduleInfo.ci.ciExecutionInfoDTO.author.email') ||
            get(pipelineExecution, 'executionTriggerInfo.triggeredBy.extraInfo.email')
          }
          profilePictureUrl={
            get(pipelineExecution, 'moduleInfo.ci.ciExecutionInfoDTO.author.avatar') ||
            get(pipelineExecution, 'executionTriggerInfo.triggeredBy.avatar')
          }
          textProps={{
            font: { variation: fontVariation }
          }}
          iconProps={{ color: Color.GREY_900 }}
        />
        <Text font={{ variation: fontVariation }}>
          <String
            className={css.triggerType}
            stringID={mapTriggerTypeToStringID(get(pipelineExecution, 'executionTriggerInfo.triggerType'))}
          />
        </Text>
      </div>
      <div className={css.timers}>
        {isCD ? (
          <TimePopoverWithLocal
            iconProps={{
              size: variantSize,
              color: Color.GREY_900
            }}
            icon="calendar"
            time={defaultTo(pipelineExecution?.startTs, 0)}
            inline={false}
            className={css.timeAgo}
            font={{ variation: fontVariation }}
          />
        ) : (
          <TimeAgoPopover
            iconProps={{
              size: variantSize,
              color: Color.GREY_900
            }}
            icon="calendar"
            time={defaultTo(pipelineExecution?.startTs, 0)}
            inline={false}
            className={css.timeAgo}
            font={{ variation: fontVariation }}
          />
        )}
        <Duration
          icon="time"
          className={css.duration}
          iconProps={{
            size: variantSize,
            color: Color.GREY_900
          }}
          startTime={pipelineExecution?.startTs}
          durationText=" "
          endTime={pipelineExecution?.endTs}
          font={{ variation: fontVariation }}
        />
      </div>
    </div>
  )
}

export default function ExecutionCard(props: ExecutionCardProps): React.ReactElement {
  const { pipelineExecution, staticCard = false, showGitDetails = false } = props
  const { orgIdentifier, projectIdentifier, accountId, module, pipelineIdentifier } =
    useParams<PipelineType<PipelinePathProps>>()
  const history = useHistory()
  const { getString } = useStrings()
  const { licenseInformation } = useLicenseStore()
  const HAS_CD = hasCDStage(pipelineExecution)
  const IS_SERVICEDETAIL = hasServiceDetail(pipelineExecution)
  const IS_OVERVIEWPAGE = hasOverviewDetail(pipelineExecution)
  const HAS_CI = hasCIStage(pipelineExecution)
  const HAS_STO = hasSTOStage(pipelineExecution)
  const cdInfo = executionFactory.getCardInfo(StageType.DEPLOY)
  const ciInfo = executionFactory.getCardInfo(StageType.BUILD)
  const stoInfo = executionFactory.getCardInfo(StageType.SECURITY)
  const { supportingGitSimplification } = useAppStore()
  const { isCompareMode, compareItems, addToCompare, removeFromCompare } = useExecutionCompareContext()

  const checkboxRef = useRef<HTMLDivElement>(null)
  const disabled = isExecutionNotStarted(pipelineExecution.status)
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'

  const handleClick = (e: any) => {
    if (checkboxRef.current?.contains(e.target)) return
    const { pipelineIdentifier: cardPipelineId, planExecutionId } = pipelineExecution
    if (!disabled && cardPipelineId && planExecutionId) {
      const route = routes.toExecutionPipelineView({
        orgIdentifier,
        pipelineIdentifier: cardPipelineId,
        executionIdentifier: planExecutionId,
        projectIdentifier,
        accountId,
        module,
        source,
        connectorRef: pipelineExecution.connectorRef,
        repoName: defaultTo(pipelineExecution.gitDetails?.repoName, pipelineExecution.gitDetails?.repoIdentifier),
        branch: pipelineExecution.gitDetails?.branch,
        storeType: pipelineExecution.storeType
      })

      //opening in new tab is required for cards present in dashboards
      if (IS_SERVICEDETAIL || IS_OVERVIEWPAGE) {
        window.open(`${windowLocationUrlPartBeforeHash()}#${route}`)
      } else {
        history.push(route)
      }
    }
  }

  const isCompareItem =
    compareItems?.findIndex(compareItem => compareItem.planExecutionId === pipelineExecution.planExecutionId) >= 0

  const onCompareToggle = () => {
    if (!isCompareItem) {
      addToCompare(pipelineExecution)
    } else {
      removeFromCompare(pipelineExecution)
    }
  }

  return (
    <Card elevation={0} className={cx(css.card, !staticCard && css.hoverCard)} data-disabled={disabled}>
      <div className={cx(!staticCard && css.cardLink)} onClick={handleClick}>
        <div className={css.content}>
          <div className={css.header}>
            <div className={css.info}>
              <div className={css.nameGroup}>
                {isCompareMode && (
                  <div className={css.compareSelection} ref={checkboxRef}>
                    <Checkbox
                      size={12}
                      checked={isCompareItem}
                      onChange={onCompareToggle}
                      disabled={compareItems.length === 2 && !isCompareItem}
                    />
                  </div>
                )}
                <div className={css.pipelineName}>{pipelineExecution?.name}</div>
              </div>
              {!isEmpty(pipelineExecution?.tags) ? (
                <TagsPopover
                  iconProps={{ size: 14 }}
                  className={css.tags}
                  popoverProps={{ wrapperTagName: 'div', targetTagName: 'div' }}
                  tags={defaultTo(pipelineExecution?.tags, []).reduce((val, tag) => {
                    return Object.assign(val, { [tag.key]: tag.value })
                  }, {} as { [key: string]: string })}
                />
              ) : null}
              {supportingGitSimplification && pipelineExecution?.storeType === StoreType.REMOTE
                ? showGitDetails && (
                    <div className={css.gitRemoteDetailsWrapper}>
                      <GitRemoteDetails
                        repoName={pipelineExecution?.gitDetails?.repoName}
                        branch={pipelineExecution?.gitDetails?.branch}
                        filePath={pipelineExecution?.gitDetails?.filePath}
                        flags={{ readOnly: true }}
                      />
                    </div>
                  )
                : pipelineExecution.gitDetails && (
                    <GitPopover
                      data={pipelineExecution.gitDetails}
                      iconProps={{ size: 14 }}
                      popoverProps={{ wrapperTagName: 'div', targetTagName: 'div' }}
                    />
                  )}
            </div>
            <div className={css.actions}>
              <div className={css.statusContainer}>
                <ExecutionStatusLabel status={pipelineExecution.status as ExecutionStatus} />
                {isExecutionIgnoreFailed(pipelineExecution.status) ? (
                  <Popover
                    wrapperTagName="div"
                    targetTagName="div"
                    interactionKind="hover"
                    popoverClassName={css.ignoreFailedPopover}
                    position={Position.RIGHT}
                    modifiers={{ preventOverflow: { escapeWithReference: true } }}
                    content={
                      <String
                        tagName="div"
                        className={css.ignoreFailedTooltip}
                        stringID="pipeline.execution.ignoreFailedWarningText"
                      />
                    }
                  >
                    <Icon name="warning-sign" size={16} className={css.ignoreWarning} />
                  </Popover>
                ) : null}
              </div>
            </div>
          </div>
          <div className={css.main}>
            <div className={css.modulesContainer}>
              {pipelineExecution?.stagesExecuted?.length ? (
                <Tag className={css.singleExecutionTag}>{`${getString('pipeline.singleStageExecution')}
                ${
                  !!pipelineExecution.stagesExecutedNames &&
                  Object.values(pipelineExecution.stagesExecutedNames).join(', ')
                }
                 `}</Tag>
              ) : null}
              {HAS_CI && ciInfo ? (
                <div className={css.moduleData}>
                  <Icon name={ciInfo.icon} size={20} className={css.moduleIcon} />
                  {React.createElement<ExecutionCardInfoProps>(ciInfo.component, {
                    data: defaultTo(pipelineExecution?.moduleInfo?.ci, {}),
                    nodeMap: defaultTo(pipelineExecution?.layoutNodeMap, {}),
                    startingNodeId: defaultTo(pipelineExecution?.startingNodeId, ''),
                    variant: CardVariant.Minimal
                  })}
                </div>
              ) : null}
              {HAS_CD && cdInfo && !(IS_SERVICEDETAIL || IS_OVERVIEWPAGE) ? (
                <div className={css.moduleData}>
                  <Icon name={cdInfo.icon} size={20} className={css.moduleIcon} />
                  {React.createElement<ExecutionCardInfoProps>(cdInfo.component, {
                    data: defaultTo(pipelineExecution?.moduleInfo?.cd, {}),
                    nodeMap: defaultTo(pipelineExecution?.layoutNodeMap, {}),
                    startingNodeId: defaultTo(pipelineExecution?.startingNodeId, ''),
                    variant: CardVariant.Minimal
                  })}
                </div>
              ) : null}
              {(IS_SERVICEDETAIL || IS_OVERVIEWPAGE) && cdInfo ? (
                <div style={{ position: 'relative' }}>
                  <ServiceExecutionsCard
                    envIdentifiers={pipelineExecution?.moduleInfo?.cd?.envIdentifiers as EnvironmentDeploymentsInfo[]}
                    serviceIdentifiers={
                      pipelineExecution?.moduleInfo?.cd?.serviceIdentifiers as ServiceDeploymentInfo[]
                    }
                    caller={IS_SERVICEDETAIL ? DashboardSelected.SERVICEDETAIL : DashboardSelected.OVERVIEW}
                  />
                </div>
              ) : null}
              {licenseInformation['STO']?.status === 'ACTIVE' && HAS_STO && stoInfo ? (
                <div className={css.moduleData}>
                  <Icon name={stoInfo.icon} size={20} className={css.moduleIcon} />
                  {React.createElement<ExecutionCardInfoProps<PipelineExecutionSummary>>(stoInfo.component, {
                    data: defaultTo(pipelineExecution, {}),
                    nodeMap: defaultTo(pipelineExecution?.layoutNodeMap, {}),
                    startingNodeId: defaultTo(pipelineExecution?.startingNodeId, ''),
                    variant: CardVariant.Minimal
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <ExecutionCardFooter pipelineExecution={pipelineExecution} isCD={HAS_CD} />
      </div>
    </Card>
  )
}
