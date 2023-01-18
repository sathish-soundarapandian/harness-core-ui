/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, SelectOption } from '@harness/uicore'
import qs from 'qs'
import { get, isEqual } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import type { ExecutionGraph, GraphLayoutNode } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'

// eslint-disable-next-line import/no-unresolved
const ResilienceViewContent = React.lazy(() => import('chaos/ResilienceViewContent'))

export interface ResilienceViewContentProps {
  notifyIDs: string[]
  stageSelectOptions: SelectOption[]
  selectedStageId: string
  selectedStageName: string
  onStageSelectionChange: (stage: string) => void
  onViewInChaosModuleClick: (experimentID: string, experimentRunID: string, faultName: string) => void
}

export const getChaosStepNotifyIDs: (data: ExecutionGraph | undefined) => string[] = data => {
  return Object.values(data?.nodeMap ?? {}).reduce<string[]>((notifyIDs, entry) => {
    if (entry.stepType === 'Chaos') {
      notifyIDs.push(entry.executableResponses?.[0]?.async?.callbackIds?.[0] ?? '')
    }
    return notifyIDs
  }, [])
}

export const MemoizedResilienceViewContent = React.memo(
  function ResilienceViewTabContent(props: ResilienceViewContentProps) {
    return <ChildAppMounter<ResilienceViewContentProps> ChildApp={ResilienceViewContent} {...props} />
  },
  (oldProps, newProps) => isEqual(oldProps.notifyIDs, newProps.notifyIDs)
)

export default function ResilienceView(): React.ReactElement | null {
  const history = useHistory()
  const params = useParams<PipelineType<ExecutionPathProps>>()
  const query = useQueryParams<PipelineType<ExecutionPathProps>>()
  const context = useExecutionContext()
  const executionGraph: ExecutionGraph | undefined = get(context, 'pipelineExecutionDetail.executionGraph')
  const selectedStageId: string = get(context, 'selectedStageId')
  const pipelineStagesMap: Map<string, GraphLayoutNode> = get(context, 'pipelineStagesMap')
  const selectedStageName = pipelineStagesMap.get(selectedStageId)?.name ?? ''
  const stageSelectOptions: SelectOption[] = [...(pipelineStagesMap ?? [])].map(([key, val]) => {
    return {
      label: val.name ?? '',
      value: key
    }
  })
  const chaosStepNotifyIDs = getChaosStepNotifyIDs(executionGraph)

  return (
    <Container width="100%" height="100%">
      <MemoizedResilienceViewContent
        notifyIDs={chaosStepNotifyIDs}
        stageSelectOptions={stageSelectOptions}
        selectedStageId={selectedStageId}
        selectedStageName={selectedStageName}
        onStageSelectionChange={(stage: string) => {
          history.push(routes.toResilienceView(params) + '?' + qs.stringify({ ...query, stage: stage }))
        }}
        onViewInChaosModuleClick={(experimentID, experimentRunID, faultName) => {
          history.push(
            routes.toChaosExperimentRun({
              accountId: params.accountId,
              orgIdentifier: params.orgIdentifier,
              projectIdentifier: params.projectIdentifier,
              expIdentifier: experimentID,
              expRunIdentifier: experimentRunID
            }) +
              '?' +
              qs.stringify({ fault: faultName })
          )
        }}
      />
    </Container>
  )
}
