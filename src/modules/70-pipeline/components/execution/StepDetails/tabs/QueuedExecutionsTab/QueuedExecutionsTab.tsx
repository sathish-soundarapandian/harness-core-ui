/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { capitalize } from 'lodash-es'
import classnames from 'classnames'
import { useParams, NavLink } from 'react-router-dom'
import moment from 'moment'
import { Spinner } from '@blueprintjs/core'
import { Color, Icon, Layout } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import { useStrings, StringKeys } from 'framework/strings'
import type { Module } from 'framework/types/ModuleName'
import {
  ExecutionNode,
  ResourceConstraintDetail,
  ResponseResourceConstraintExecutionInfo,
  useGetResourceConstraintsExecutionInfo
} from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import stepDetailsTabCss from '../StepDetailsTab/StepDetailsTab.module.scss'
import css from './QueuedExecutionsTab.module.scss'

export interface ExecutionStepDetailsTabProps {
  step: ExecutionNode
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
  params: Record<string, string>,
  queryParams: GitQueryParams
) => {
  const resourceConstraints = resourceConstraintsData?.data?.resourceConstraints || []
  if (!resourceConstraints.length) {
    return (
      <div className={css.noDataContainer}>
        <Icon color={Color.GREY_300} size={64} name="queue-step" style={{ marginBottom: '20px' }} />
        <span>{getString('pipeline.queueStep.noQueuedExecutions')}</span>
      </div>
    )
  }
  const { executionIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } = params
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
                      const baseUrl = window.location.href.split('#')[0]
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
  const params = useParams<Record<string, string>>()
  const queryParams = useQueryParams<GitQueryParams>()

  const { step } = props
  const resourceUnit = step?.stepParameters?.spec?.key

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
          accountId: params.accountId
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
          {renderData(resourceConstraintsData, getString, params, queryParams)}
        </section>
      }
    </div>
  )
}
