/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import {
  ExecutionNode,
  ResourceConstraintDetail,
  ResponseResourceConstraintExecutionInfo,
  useGetResourceConstraintsExecutionInfo
} from 'services/pipeline-ng'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import css from '../StepDetailsTab/StepDetailsTab.module.scss'

export interface ExecutionStepDetailsTabProps {
  step: ExecutionNode
}

const renderData = (resourceConstraintsData: ResponseResourceConstraintExecutionInfo | null) => {
  const resourceConstraints = resourceConstraintsData?.data?.resourceConstraints || []
  if (!resourceConstraints.length) {
    return 'Empty Data'
  }
  return resourceConstraints.map((resourceConstraint: ResourceConstraintDetail) => (
    <div key={`${resourceConstraint.pipelineIdentifier}_${resourceConstraint.state}`}>
      <div>{resourceConstraint.pipelineIdentifier}</div>
      {/*<div>{resourceConstraint.startTs}</div>*/}
      <div>{resourceConstraint.state}</div>
    </div>
  ))
}

export function QueuedExecutionsTab(props: ExecutionStepDetailsTabProps): React.ReactElement {
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

  return (
    <div className={css.detailsTab} data-step={step}>
      <div>Header</div>
      {resourceConstraintsLoading ? 'loading' : renderData(resourceConstraintsData)}
    </div>
  )
}
