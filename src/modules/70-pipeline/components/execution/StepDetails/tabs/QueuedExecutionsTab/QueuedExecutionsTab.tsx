/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { capitalize, defaultTo } from 'lodash-es'
import classnames from 'classnames'
import { useParams, NavLink } from 'react-router-dom'
import moment from 'moment'
import { Spinner } from '@blueprintjs/core'
import { Icon, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import routes from '@common/RouteDefinitions'
import { useStrings, StringKeys } from 'framework/strings'
import type { Module } from 'framework/types/ModuleName'
import {
  ExecutionGraph,
  ExecutionNode,
  ResourceConstraintDetail,
  ResponseResourceConstraintExecutionInfo,
  useGetResourceConstraintsExecutionInfo
} from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { windowLocationUrlPartBeforeHash } from 'framework/utils/WindowLocation'
import stepDetailsTabCss from '../StepDetailsTab/StepDetailsTab.module.scss'
import css from './QueuedExecutionsTab.module.scss'

export interface ExecutionStepDetailsTabProps {
  step: ExecutionNode
  executionMetadata: ExecutionGraph['executionMetadata']
}

type getStringType = (key: StringKeys, vars?: Record<string, any>) => string

const renderState = (getString: getStringType, state?: string, isCurrent?: boolean) => {
  if (state === 'ACTIVE') {
    return capitalize(getString('pipeline.executionStatus.Running'))
  }
  if (isCurrent) {
    return getString('common.current')
  }
  if (state === 'BLOCKED') {
    return ''
  }
  return capitalize(state)
}

const renderData = (
  resourceConstraintsData: ResponseResourceConstraintExecutionInfo | null,
  getString: getStringType,
  executionMetadata: ExecutionGraph['executionMetadata'],
  module: string,
  queryParams: GitQueryParams
): React.ReactNode => {
  const resourceConstraints = resourceConstraintsData?.data?.resourceConstraints || []
  if (!resourceConstraints.length) {
    return (
      <div className={css.noDataContainer}>
        <Icon color={Color.GREY_300} size={64} name="queue-step" style={{ marginBottom: '20px' }} />
        <span>{getString('pipeline.queueStep.noQueuedExecutions')}</span>
      </div>
    )
  }
  const {
    planExecutionId: executionIdentifier,
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier,
    accountId
  } = defaultTo(executionMetadata, {})
  const { connectorRef, repoName, branch, storeType } = queryParams

  return (
    <>
      <div className={css.totalCount}>{getString('pipeline.totalCount', { count: resourceConstraints.length })}</div>
      <div className={css.queuedExecutionsList}>
        {resourceConstraints.map((resourceConstraint: ResourceConstraintDetail) => {
          const isCurrent = executionIdentifier === resourceConstraint.planExecutionId
          const route = routes.toExecutionPipelineView({
            orgIdentifier: resourceConstraint.orgIdentifier || orgIdentifier,
            pipelineIdentifier: pipelineIdentifier,
            executionIdentifier: resourceConstraint.planExecutionId || executionIdentifier,
            projectIdentifier: resourceConstraint.projectIdentifier || projectIdentifier,
            accountId,
            module: module as Module,
            source: 'executions',
            connectorRef,
            repoName,
            branch,
            storeType
          })
          return (
            <div
              key={`${resourceConstraint.pipelineIdentifier}_${resourceConstraint.state}`}
              className={classnames(css.queuedExecutionsListItem, { [css.queuedExecutionsCurrentListItem]: isCurrent })}
            >
              <div className={css.listItemName}>
                {isCurrent ? (
                  resourceConstraint.pipelineName
                ) : (
                  <NavLink
                    to={route}
                    onClick={e => {
                      e.preventDefault()
                      const baseUrl = windowLocationUrlPartBeforeHash()
                      window.open(`${baseUrl}#${route}`)
                    }}
                  >
                    {resourceConstraint.pipelineName}
                  </NavLink>
                )}
              </div>
              <div className={css.listItemTime}>
                {moment(resourceConstraint.startTs).format('DD/MM/YYYY, h:mm:ss a')}
              </div>
              <div className={css.listItemState}>{renderState(getString, resourceConstraint.state, isCurrent)}</div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export function QueuedExecutionsTab(props: ExecutionStepDetailsTabProps): React.ReactElement {
  const { getString } = useStrings()
  const { module } = useParams<Record<string, string>>()
  const queryParams = useQueryParams<GitQueryParams>()

  const { step, executionMetadata } = props
  const resourceUnit = step?.stepParameters?.spec?.key
  const { accountId } = defaultTo(executionMetadata, {})

  const {
    data: resourceConstraintsData,
    loading: resourceConstraintsLoading,
    refetch: fetchResourceConstraints
  } = useGetResourceConstraintsExecutionInfo({
    lazy: true
  })

  React.useEffect(() => {
    if (resourceUnit) {
      fetchResourceConstraints({
        queryParams: {
          resourceUnit,
          accountId
        }
      })
    }
  }, [resourceUnit])

  return resourceConstraintsLoading ? (
    <Layout.Vertical height="100px" flex={{ justifyContent: 'center' }}>
      <Spinner size={Spinner.SIZE_SMALL} />
    </Layout.Vertical>
  ) : (
    <div className={stepDetailsTabCss.detailsTab}>
      <div className={css.header}>
        <span className={css.headerLabel}>{getString('pipeline.queueStep.queuedByResourceKey')}</span> {resourceUnit}
      </div>
      {
        <section className={css.contentSection}>
          {renderData(resourceConstraintsData, getString, executionMetadata, module, queryParams)}
        </section>
      }
    </div>
  )
}
