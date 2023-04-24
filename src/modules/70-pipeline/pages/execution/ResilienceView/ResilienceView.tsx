/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, SelectOption } from '@harness/uicore'
import qs from 'qs'
import { defaultTo, isEqual } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import type { ExecutionGraph } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import type { ExecutionPathProps, GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { useStartFreeLicense } from 'services/cd-ng'
import { getGaClientID, getSavedRefererURL, isSimplifiedYAMLEnabled } from '@common/utils/utils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

// eslint-disable-next-line import/no-unresolved
const ResilienceViewContent = React.lazy(() => import('chaos/ResilienceViewContent'))
// eslint-disable-next-line import/no-unresolved
const ResilienceViewCTA = React.lazy(() => import('chaos/ResilienceViewCTA'))

export interface ResilienceViewContentProps {
  notifyIDs: string[]
  stageSelectOptions: SelectOption[]
  selectedStageId: string
  selectedStageName: string
  onStageSelectionChange: (stage: string) => void
  onViewInChaosModuleClick: (experimentID: string, experimentRunID: string, faultName: string) => void
}

export interface ResilienceViewCTAProps {
  isSubscriptionAvailable: boolean
  startFreePlan: () => void
  addResilienceStep: () => void
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

export const MemoizedResilienceViewCTA = React.memo(function ResilienceViewTabCTA(props: ResilienceViewCTAProps) {
  return <ChildAppMounter<ResilienceViewCTAProps> ChildApp={ResilienceViewCTA} {...props} />
})

export default function ResilienceView(): React.ReactElement | null {
  const { licenseInformation } = useLicenseStore()
  const history = useHistory()
  const params = useParams<PipelineType<ExecutionPathProps>>()
  const query = useQueryParams<PipelineType<ExecutionPathProps>>()
  const context = useExecutionContext()
  const pipelineExecutionDetail = context.pipelineExecutionDetail
  const pipelineExecutionSummary = pipelineExecutionDetail?.pipelineExecutionSummary
  const executionGraph = pipelineExecutionDetail?.executionGraph
  const selectedStageId = context.selectedStageId
  const pipelineStagesMap = context.pipelineStagesMap
  const selectedStageName = pipelineStagesMap.get(selectedStageId)?.name ?? ''
  const stageSelectOptions: SelectOption[] = [...(pipelineStagesMap ?? [])].map(([key, val]) => {
    return {
      label: val.name ?? '',
      value: key
    }
  })
  const chaosStepNotifyIDs = getChaosStepNotifyIDs(executionGraph)

  const moduleType = 'CHAOS'
  const refererURL = getSavedRefererURL()
  const gaClientID = getGaClientID()

  const { mutate: startFreePlan } = useStartFreeLicense({
    queryParams: {
      accountIdentifier: params.accountId,
      moduleType,
      ...(refererURL ? { referer: refererURL } : {}),
      ...(gaClientID ? { gaClientId: gaClientID } : {})
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })
  const { CI_YAML_VERSIONING } = useFeatureFlags()
  const {
    branch: branchQueryParam,
    repoIdentifier: repoIdentifierQueryParam,
    repoName: repoNameQueryParam,
    connectorRef: connectorRefQueryParam
  } = useQueryParams<GitQueryParams>()

  const repoName = pipelineExecutionSummary?.gitDetails?.repoName ?? repoNameQueryParam
  const repoIdentifier = defaultTo(
    pipelineExecutionSummary?.gitDetails?.repoIdentifier ?? repoIdentifierQueryParam,
    repoName
  )
  const connectorRef = pipelineExecutionSummary?.connectorRef ?? connectorRefQueryParam
  const branch = pipelineExecutionSummary?.gitDetails?.branch ?? branchQueryParam
  const storeType = pipelineExecutionSummary?.storeType ?? 'INLINE'

  const commonRouteProps = {
    ...params,
    connectorRef,
    repoName,
    repoIdentifier,
    branch,
    storeType,
    stageId: selectedStageName,
    sectionId: 'EXECUTION'
  }
  const pipelineDetailsView = isSimplifiedYAMLEnabled(params.module, CI_YAML_VERSIONING)
    ? routes.toPipelineStudioV1(commonRouteProps)
    : routes.toPipelineStudio(commonRouteProps)

  const isSubscriptionAvailable = licenseInformation[ModuleName.CHAOS]
    ? licenseInformation[ModuleName.CHAOS]?.status === 'ACTIVE'
    : false

  const isChaosStepPresent = pipelineExecutionDetail && chaosStepNotifyIDs.length > 0
  if (!isSubscriptionAvailable || !isChaosStepPresent) {
    return (
      <MemoizedResilienceViewCTA
        isSubscriptionAvailable={isSubscriptionAvailable}
        startFreePlan={() => {
          startFreePlan().then(() => {
            history.push(
              routes.toProjectOverview({
                projectIdentifier: params.projectIdentifier,
                orgIdentifier: params.orgIdentifier || /* istanbul ignore next */ '',
                accountId: params.accountId,
                module: 'chaos'
              })
            )
          })
        }}
        addResilienceStep={() => history.push(pipelineDetailsView)}
      />
    )
  }

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
