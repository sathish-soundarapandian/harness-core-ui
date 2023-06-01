/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import {
  Text,
  Button,
  Card,
  Layout,
  PageSpinner,
  ButtonVariation,
  useToaster,
  ButtonSize,
  Container
} from '@harness/uicore'
import { Classes, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, get, isNumber } from 'lodash-es'
import moment from 'moment'
import { String, useStrings } from 'framework/strings'
import { ExecutionInfo, useLatestExecutionId, useRetryHistory } from 'services/pipeline-ng'
import type { ExecutionPathProps, GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { TimeAgoPopover } from '@common/components'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import routes from '@common/RouteDefinitions'
import RbacButton from '@rbac/components/Button/Button'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import css from './RetryHistory.module.scss'

interface RetryHistoryProps {
  canView: boolean
  showRetryHistory: boolean
  canRetry: boolean
}

function RetryHistory({ canView, showRetryHistory, canRetry }: RetryHistoryProps): React.ReactElement {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, pipelineIdentifier, accountId, executionIdentifier, module, source } =
    useParams<PipelineType<ExecutionPathProps>>()
  const { connectorRef, repoName, branch, storeType } = useQueryParams<GitQueryParams>()
  const history = useHistory()
  const { pipelineExecutionDetail, retriedHistoryInfo } = useExecutionContext()
  const { pipelineExecutionSummary = {} } = pipelineExecutionDetail || {}
  const { clear, showPrimary } = useToaster()

  //multiple conditional text based on module
  const [retryHistoryText, moduleTypeText, moduleText] =
    module === 'cd'
      ? [getString('executionHeaderText'), getString('executionText'), getString('executionsText')]
      : [getString('pipeline.buildHeaderText'), getString('buildText'), getString('buildsText')]

  const { data: latestExecutionId, refetch: refetchLatestExecutionId } = useLatestExecutionId({
    planExecutionId: executionIdentifier,
    queryParams: {
      orgIdentifier,
      pipelineIdentifier: pipelineIdentifier,
      projectIdentifier,
      accountIdentifier: accountId
    },
    lazy: true
  })
  useEffect(() => {
    /* istanbul ignore else */
    if (get(latestExecutionId, 'data.latestExecutionId')) {
      clear()
      history.push(
        routes.toExecutionPipelineView({
          orgIdentifier,
          pipelineIdentifier: pipelineIdentifier,
          projectIdentifier,
          executionIdentifier: get(latestExecutionId, 'data.latestExecutionId', ''),
          accountId,
          module,
          source,
          connectorRef,
          repoName,
          branch,
          storeType
        })
      )
    }
  }, [latestExecutionId])

  useEffect(() => {
    // cleanup function to clear the toaster when navigating out of the current screen
    return () => {
      clear()
    }
  }, [])

  const {
    data: retryHistoryResponse,
    loading: loadingRetryHistory,
    refetch: refetchRetryHistory
  } = useRetryHistory({
    planExecutionId: executionIdentifier,
    queryParams: {
      pipelineIdentifier: pipelineIdentifier,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })
  const executionInfo = retryHistoryResponse?.data?.executionInfos

  const latestExecutionIdV2 = retryHistoryResponse?.data?.latestExecutionId
  const executionInfoUuids = defaultTo(
    (executionInfo?.map(val => val.uuid).filter(uuid => uuid !== undefined) as string[]) ||
      retriedHistoryInfo?.retriedExecutionUuids,
    []
  )

  const calculateCurrentExecutionRank = (): string => {
    if (!executionInfoUuids.length) {
      return ''
    }
    const currentIndex = executionInfoUuids?.findIndex(val => val === executionIdentifier)
    return `(${executionInfoUuids?.length - currentIndex}/${executionInfoUuids?.length})`
  }

  useEffect(() => {
    /* istanbul ignore else */
    if (showRetryHistory && !canRetry) {
      clear()
      if (latestExecutionIdV2 !== executionIdentifier) {
        showPrimary(
          <Layout.Horizontal spacing="medium">
            <Text color={Color.WHITE} margin={{ left: 'small' }}>
              {getString('pipeline.viewLatestExecution', { type: moduleTypeText.toLocaleLowerCase() })}{' '}
              {calculateCurrentExecutionRank()}
            </Text>
            <Text
              color={Color.WHITE}
              font={{ weight: 'bold' }}
              className={css.viewLatest}
              onClick={() => refetchLatestExecutionId()}
            >
              {getString('common.viewLatest')}
            </Text>
          </Layout.Horizontal>,
          0
        )
      }
    }
  }, [showRetryHistory, canRetry, latestExecutionIdV2, executionIdentifier])

  const gotoExecutionDetails = (planExecutionId: string): void => {
    /* istanbul ignore else */
    if (planExecutionId !== executionIdentifier) {
      history.push(
        routes.toExecutionPipelineView({
          orgIdentifier,
          pipelineIdentifier: pipelineIdentifier,
          projectIdentifier,
          executionIdentifier: planExecutionId || '',
          accountId,
          module,
          source,
          connectorRef,
          repoName,
          branch,
          storeType
        })
      )
    }
  }

  const getExecutionDetail = (index: number): JSX.Element => {
    const parentId = calculateParentRunSequence()
    const currentExecId = isNumber(parentId) ? parentId + (defaultTo(executionInfo?.length, 0) - index - 1) : '-'
    return (
      <Layout.Horizontal spacing="xsmall">
        <Text color={Color.PRIMARY_7} font={{ size: 'normal', weight: 'semi-bold' }}>
          {index === 0
            ? `${executionInfo?.length}/${executionInfo?.length} - ${getString('common.latest')}`
            : `${(executionInfo as ExecutionInfo[])?.length - index}/${executionInfo?.length}`}
        </Text>
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_500}>
          {getString(module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI', {
            runSequence: currentExecId
          })}
        </Text>
      </Layout.Horizontal>
    )
  }

  const calculateParentRunSequence = (): number | string => {
    const currentIndex = defaultTo(
      executionInfo?.findIndex(val => val.uuid === executionIdentifier),
      0
    )
    const currentRunSequence = defaultTo(pipelineExecutionSummary.runSequence, 0)
    const runSequence = currentRunSequence - (defaultTo(executionInfo?.length, 0) - (currentIndex + 1))

    if (runSequence <= 0) {
      return '-'
    }
    return runSequence
  }

  function RetryExecutionList(): JSX.Element {
    return (
      <div className={css.modalContent} data-testid="retryHistoryExecutionList">
        <Layout.Vertical>
          <div className={css.retryHeaderSection}>
            <div className={css.retryModalHeader}>
              <Text style={{ fontSize: 20 }} font={{ weight: 'bold' }} color={Color.GREY_700}>
                {retryHistoryText}
              </Text>
            </div>
            <String
              tagName="div"
              className={css.pipelineRunSeq}
              stringID={module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI'}
              vars={{ runSequence: calculateParentRunSequence() }}
            />
          </div>
          <div>
            {loadingRetryHistory ? (
              <PageSpinner />
            ) : (
              <>
                <Text color={Color.GREY_800} font={{ size: 'normal' }} margin="small">
                  {getString('pipeline.retryHistoryTotalCount', {
                    moduleText,
                    totalCount: defaultTo(executionInfo?.length, '-')
                  })}
                </Text>
                <Container className={css.cardStyle}>
                  {executionInfo?.map((retryHistory, index) => {
                    return (
                      <Card
                        elevation={0}
                        className={cx(css.card, css.hoverCard, Classes.POPOVER_DISMISS)}
                        key={retryHistory.uuid}
                        onClick={() => gotoExecutionDetails(retryHistory?.uuid as string)}
                        selected={executionIdentifier === retryHistory.uuid}
                      >
                        <div className={css.content}>
                          <div className={cx(css.cardSection, css.executionDetail)}>
                            {getExecutionDetail(index)}
                            <ExecutionStatusLabel status={retryHistory.status as ExecutionStatus} />
                          </div>
                          <div className={cx(css.cardSection)}>
                            <Text
                              color={Color.GREY_400}
                              font={{ size: 'small', weight: 'light' }}
                              icon="calendar"
                              iconProps={{ size: 12 }}
                            >
                              {moment(retryHistory.startTs as number).format('MMM D, YYYY h:mma')}
                            </Text>
                            <div>
                              <TimeAgoPopover
                                iconProps={{ size: 12, className: css.timerIcon }}
                                icon="time"
                                time={defaultTo(retryHistory.startTs, 0)}
                                inline={false}
                                className={css.timeAgo}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </Container>
              </>
            )}
          </div>
        </Layout.Vertical>
        <Button minimal icon="cross" className={cx(css.crossIcon, Classes.POPOVER_DISMISS)} />
      </div>
    )
  }

  return (
    <Popover
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.BOTTOM_RIGHT}
      content={<RetryExecutionList />}
      popoverClassName={css.retryPopover}
      autoFocus
    >
      <RbacButton
        text={retryHistoryText}
        variation={ButtonVariation.SECONDARY}
        size={ButtonSize.SMALL}
        onClick={() => refetchRetryHistory()}
        disabled={!canView}
        className={cx(css.cardBtns, css.retryHistoryBtn)}
      />
    </Popover>
  )
}

export default RetryHistory
