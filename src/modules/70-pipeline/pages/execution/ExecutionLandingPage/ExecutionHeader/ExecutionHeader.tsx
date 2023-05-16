/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import { Icon } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import { Duration } from '@common/components/Duration/Duration'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import ExecutionActions from '@pipeline/components/ExecutionActions/ExecutionActions'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import { String, useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { ExecutionPathProps, GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { StoreType } from '@common/constants/GitSyncTypes'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { TagsPopover } from '@common/components'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useDocumentFavicon } from '@common/hooks/useDocumentFavicon'
import { hasCIStage } from '@pipeline/utils/stageHelpers'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import RetryHistory from '@pipeline/components/RetryPipeline/RetryHistory/RetryHistory'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import GitRemoteDetails from '@common/components/GitRemoteDetails/GitRemoteDetails'
import { ExecutionCompiledYaml } from '@pipeline/components/ExecutionCompiledYaml/ExecutionCompiledYaml'
import { getFavIconDetailsFromPipelineExecutionStatus } from '@pipeline/utils/executionUtils'
import type { PipelineExecutionSummary, ResponsePMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import { isSimplifiedYAMLEnabled } from '@common/utils/utils'
import { useRunPipelineModalV1 } from '@pipeline/v1/components/RunPipelineModalV1/useRunPipelineModalV1'
import { ModuleName } from 'framework/types/ModuleName'
import css from './ExecutionHeader.module.scss'

export interface ExecutionHeaderProps {
  pipelineMetadata?: ResponsePMSPipelineSummaryResponse | null
}

export function ExecutionHeader({ pipelineMetadata }: ExecutionHeaderProps): React.ReactElement {
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId, pipelineIdentifier, module, source } =
    useParams<PipelineType<ExecutionPathProps>>()
  const {
    branch: branchQueryParam,
    repoIdentifier: repoIdentifierQueryParam,
    repoName: repoNameQueryParam,
    connectorRef: connectorRefQueryParam
  } = useQueryParams<GitQueryParams>()
  const { refetch, pipelineExecutionDetail, isPipelineInvalid } = useExecutionContext()
  const {
    supportingGitSimplification,
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF
  } = useAppStore()
  const { getString } = useStrings()
  const { pipelineExecutionSummary = {} } = pipelineExecutionDetail || {}
  const { CI_REMOTE_DEBUG } = useFeatureFlags()
  const [canView, canEdit, canExecute] = usePermission(
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
      permissions: [
        PermissionIdentifier.VIEW_PIPELINE,
        PermissionIdentifier.EDIT_PIPELINE,
        PermissionIdentifier.EXECUTE_PIPELINE
      ]
    },
    [orgIdentifier, projectIdentifier, accountId, pipelineIdentifier]
  )
  const hasCI = hasCIStage(pipelineExecutionSummary)
  const [viewCompiledYaml, setViewCompiledYaml] = React.useState<PipelineExecutionSummary | undefined>(undefined)

  useDocumentTitle([
    `${pipelineExecutionSummary?.status ? pipelineExecutionSummary?.status + ' | ' : ''} ${
      pipelineExecutionSummary.name || getString('pipelines')
    } ${getString(
      module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI',
      pipelineExecutionSummary
    )}`
  ])

  const favIconDetails = React.useMemo(
    () => getFavIconDetailsFromPipelineExecutionStatus(pipelineExecutionSummary?.status),
    [pipelineExecutionSummary?.status]
  )

  useDocumentFavicon(favIconDetails)

  const repoName = pipelineExecutionSummary?.gitDetails?.repoName ?? repoNameQueryParam
  const repoIdentifier = defaultTo(
    pipelineExecutionSummary?.gitDetails?.repoIdentifier ?? repoIdentifierQueryParam,
    repoName
  )
  const connectorRef = pipelineExecutionSummary?.connectorRef ?? connectorRefQueryParam
  const branch = pipelineExecutionSummary?.gitDetails?.branch ?? branchQueryParam
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { openRunPipelineModal } = useRunPipelineModal({
    pipelineIdentifier,
    executionId: executionIdentifier,
    repoIdentifier: isGitSyncEnabled ? repoIdentifier : repoName,
    branch,
    connectorRef,
    storeType: pipelineMetadata?.data?.storeType,
    stagesExecuted: pipelineExecutionSummary?.stagesExecuted,
    isDebugMode: hasCI
  })
  const { CI_YAML_VERSIONING } = useFeatureFlags()

  const pipelineStudioRoutingProps = {
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier,
    accountId,
    module,
    repoIdentifier,
    connectorRef,
    repoName,
    branch,
    storeType: pipelineMetadata?.data?.storeType
  }

  const { openRunPipelineModalV1 } = useRunPipelineModalV1({
    pipelineIdentifier,
    executionId: executionIdentifier,
    repoIdentifier: isGitSyncEnabled ? repoIdentifier : repoName,
    branch,
    connectorRef,
    storeType: pipelineMetadata?.data?.storeType,
    isDebugMode: hasCI
  })

  let moduleLabel = getString('common.pipelineExecution')
  if (module) {
    switch (module.toUpperCase() as ModuleName) {
      case ModuleName.CD:
        moduleLabel = getString('deploymentsText')
        break
      case ModuleName.CI:
        moduleLabel = getString('buildsText')
        break
      case ModuleName.STO:
        moduleLabel = getString('common.purpose.sto.continuous')
        break
    }
  }

  return (
    <header className={css.header}>
      <div className={css.headerTopRow}>
        <NGBreadcrumbs
          links={
            source === 'deployments'
              ? [
                  {
                    url: routes.toDeployments({ orgIdentifier, projectIdentifier, accountId, module }),
                    label: moduleLabel
                  }
                ]
              : [
                  {
                    url: routes.toPipelines({ orgIdentifier, projectIdentifier, accountId, module }),
                    label: getString('pipelines')
                  },
                  {
                    url: routes.toPipelineDeploymentList({
                      orgIdentifier,
                      projectIdentifier,
                      pipelineIdentifier,
                      accountId,
                      module,
                      repoIdentifier,
                      connectorRef,
                      repoName,
                      branch,
                      storeType: pipelineMetadata?.data?.storeType
                    }),
                    label: pipelineExecutionSummary.name || getString('common.pipeline')
                  }
                ]
          }
        />
        <div className={css.actionsBar}>
          {pipelineExecutionSummary.status ? (
            <ExecutionStatusLabel status={pipelineExecutionSummary.status as ExecutionStatus} />
          ) : null}
          {pipelineExecutionSummary.startTs && (
            <div className={css.startTime}>
              <String tagName="div" className={css.startTimeText} stringID="pipeline.startTime" />
              <span>{formatDatetoLocale(pipelineExecutionSummary.startTs)}</span>
            </div>
          )}
          <Duration
            className={css.duration}
            startTime={pipelineExecutionSummary.startTs}
            endTime={pipelineExecutionSummary.endTs}
            icon="time"
            iconProps={{ size: 12 }}
            durationText={' '}
          />
          {pipelineExecutionSummary.showRetryHistory && (
            <RetryHistory
              canView={canView}
              showRetryHistory={pipelineExecutionSummary.showRetryHistory}
              canRetry={pipelineExecutionSummary.canRetry || false}
            />
          )}
          <Link
            className={css.view}
            to={
              isSimplifiedYAMLEnabled(module, CI_YAML_VERSIONING)
                ? routes.toPipelineStudioV1(pipelineStudioRoutingProps)
                : routes.toPipelineStudio(pipelineStudioRoutingProps)
            }
          >
            <Icon name="Edit" size={12} />
            <String stringID="editPipeline" />
          </Link>

          <ExecutionActions
            executionStatus={pipelineExecutionSummary.status as ExecutionStatus}
            refetch={refetch}
            source={source}
            params={{
              orgIdentifier,
              pipelineIdentifier,
              projectIdentifier,
              accountId,
              executionIdentifier,
              module,
              repoIdentifier,
              connectorRef,
              repoName,
              branch,
              storeType: pipelineMetadata?.data?.storeType,
              stagesExecuted: pipelineExecutionSummary?.stagesExecuted
            }}
            isPipelineInvalid={isPipelineInvalid}
            canEdit={canEdit}
            showEditButton={true}
            canExecute={canExecute}
            canRetry={pipelineExecutionSummary.canRetry}
            modules={pipelineExecutionSummary.modules}
            onReRunInDebugMode={
              hasCI && CI_REMOTE_DEBUG
                ? isSimplifiedYAMLEnabled(module, CI_YAML_VERSIONING)
                  ? openRunPipelineModalV1
                  : openRunPipelineModal
                : undefined
            }
            onViewCompiledYaml={/* istanbul ignore next */ () => setViewCompiledYaml(pipelineExecutionSummary)}
          />
        </div>
      </div>
      <div className={css.titleContainer}>
        <div className={css.title}>{pipelineExecutionSummary.name}</div>
        <String
          tagName="div"
          className={css.pipelineId}
          stringID={module === 'cd' ? 'execution.pipelineIdentifierTextCD' : 'execution.pipelineIdentifierTextCI'}
          vars={pipelineExecutionSummary}
        />
        {!isEmpty(pipelineExecutionSummary?.tags) ? (
          <TagsPopover
            iconProps={{ size: 14 }}
            className={css.tags}
            popoverProps={{ wrapperTagName: 'div', targetTagName: 'div' }}
            tags={(pipelineExecutionSummary?.tags || []).reduce((val, tag) => {
              return Object.assign(val, { [tag.key]: tag.value })
            }, {} as { [key: string]: string })}
          />
        ) : null}
        {pipelineExecutionSummary.gitDetails ? (
          supportingGitSimplification && pipelineExecutionSummary?.storeType === StoreType.REMOTE ? (
            <div className={css.gitRemoteDetailsWrapper}>
              <GitRemoteDetails
                repoName={pipelineExecutionSummary.gitDetails.repoName}
                branch={pipelineExecutionSummary.gitDetails.branch}
                filePath={pipelineExecutionSummary.gitDetails.filePath}
                fileUrl={pipelineExecutionSummary.gitDetails.fileUrl}
                flags={{ readOnly: true }}
              />
            </div>
          ) : (
            <GitSyncStoreProvider>
              <GitPopover
                data={pipelineExecutionSummary.gitDetails}
                popoverProps={{ targetTagName: 'div', wrapperTagName: 'div', className: css.git }}
              />
            </GitSyncStoreProvider>
          )
        ) : null}
        <ExecutionCompiledYaml
          onClose={/* istanbul ignore next */ () => setViewCompiledYaml(undefined)}
          executionSummary={viewCompiledYaml}
        />
      </div>
    </header>
  )
}
