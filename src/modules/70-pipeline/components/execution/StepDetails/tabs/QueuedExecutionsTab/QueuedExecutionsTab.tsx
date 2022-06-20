/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classnames from 'classnames'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { useStrings, StringKeys } from 'framework/strings'
import {
  ExecutionNode,
  ResourceConstraintDetail,
  ResponseResourceConstraintExecutionInfo,
  useGetResourceConstraintsExecutionInfo
} from 'services/pipeline-ng'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import stepDetailsTabCss from '../StepDetailsTab/StepDetailsTab.module.scss'
import css from './QueuedExecutionsTab.module.scss'

export interface ExecutionStepDetailsTabProps {
  step: ExecutionNode
}

type getStringType = (key: StringKeys, vars?: Record<string, any>) => string

const renderState = (getString: getStringType, state?: string, isCurrent?: boolean) => {
  if (isCurrent) {
    return getString('common.current')
  }
  if (state === 'BLOCKED') {
    return ''
  }
  if (state === 'ACTIVE') {
    return getString('pipeline.executionStatus.Running')
  }
  return state
}

const renderData = (
  resourceConstraintsData: ResponseResourceConstraintExecutionInfo | null,
  getString: getStringType,
  executionIdentifier?: string
) => {
  const resourceConstraints = resourceConstraintsData?.data?.resourceConstraints || []
  if (!resourceConstraints.length) {
    return 'Empty Data'
  }

  const startTs = +new Date()
  return (
    <>
      <div className={css.totalCount}>{getString('pipeline.totalCount', { count: resourceConstraints.length })}</div>
      <div className={css.queuedExecutionsList}>
        {resourceConstraints.map((resourceConstraint: ResourceConstraintDetail) => {
          const isCurrent = executionIdentifier === resourceConstraint.planExecutionId
          return (
            <div
              key={`${resourceConstraint.pipelineIdentifier}_${resourceConstraint.state}`}
              className={classnames(css.queuedExecutionsListItem, { [css.queuedExecutionsCurrentListItem]: isCurrent })}
            >
              <div className={css.listItemName}>{resourceConstraint.pipelineIdentifier}</div>
              <div className={css.listItemTime}>{moment(startTs).format('DD/MM/YYYY, h:mm:ss a')}</div>
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
  const { executionIdentifier } = useParams<Record<string, string>>()

  const { step } = props
  const resourceUnit = step?.stepParameters?.spec?.resourceUnit
  const { accountId } = useParams<ExecutionPathProps>()

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
    <div>loading</div>
  ) : (
    <div className={stepDetailsTabCss.detailsTab}>
      <div className={css.header}>
        <span className={css.headerLabel}>{getString('pipeline.queueStep.queuedByResourceKey')}</span> {resourceUnit}
      </div>
      {
        <section className={css.contentSection}>
          {renderData(resourceConstraintsData, getString, executionIdentifier)}
        </section>
      }
    </div>
  )
}
