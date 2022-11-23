/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import { Container, Layout, Text } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type {
  GitQueryParams,
  PipelineType,
  TemplateStudioPathProps,
  TemplateStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import GitRemoteDetails, { GitRemoteDetailsProps } from '@common/components/GitRemoteDetails/GitRemoteDetails'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { StoreType } from '@common/constants/GitSyncTypes'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import type { Error, ResponseMessage } from 'services/pipeline-ng'
import type { Error as TemplateError } from 'services/template-ng'
import GenericErrorHandler from '@common/pages/GenericErrorHandler/GenericErrorHandler'
import noEntityFoundImage from './images/no-entity-found.svg'
import css from './NoEntityFound.module.scss'

export enum ErrorPlacement {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM'
}
interface NoEntityFoundProps {
  identifier: string
  entityType: 'pipeline' | 'inputSet' | 'template'
  errorObj?: Error | TemplateError
  gitDetails?: GitRemoteDetailsProps
  errorPlacement?: ErrorPlacement
}

const entityTypeLabelMapping = {
  pipeline: 'pipeline',
  inputSet: 'input set',
  template: 'template'
}

function NoEntityFound(props: NoEntityFoundProps): JSX.Element {
  const { identifier, entityType, errorObj, gitDetails, errorPlacement = ErrorPlacement.TOP } = props
  const { repoIdentifier, branch, versionLabel, connectorRef, storeType, repoName } =
    useQueryParams<TemplateStudioQueryParams>()

  const { getString } = useStrings()
  const history = useHistory()
  const { supportingGitSimplification } = useAppStore()
  const { replaceQueryParams } = useUpdateQueryParams<GitQueryParams>()

  const isPipelineRemote = supportingGitSimplification && storeType === StoreType.REMOTE

  const { accountId, projectIdentifier, orgIdentifier, module, templateType } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }> &
      TemplateStudioPathProps
  >()

  const onGitBranchChange = React.useMemo(
    () =>
      (selectedFilter: GitFilterScope, defaultSelected = false) => {
        // Reason for adding branch check :
        // For GitX, if branch is not given BranchSelectV2 will internally select default and
        // notify parent with this callback. For that we do not want to reload the page.
        // For old GitSync branch is always availble so this check for internally selecting default branch will not matter.
        if (!defaultSelected && branch !== selectedFilter.branch) {
          if (entityType === 'pipeline') {
            history.push(
              routes.toPipelineStudio({
                projectIdentifier,
                orgIdentifier,
                pipelineIdentifier: identifier || '-1',
                accountId,
                module,
                branch: selectedFilter.branch,
                repoIdentifier: selectedFilter.repo,
                ...(isPipelineRemote
                  ? {
                      repoName,
                      connectorRef,
                      storeType
                    }
                  : {})
              })
            )
            location.reload()
          } else if (entityType === 'inputSet') {
            replaceQueryParams(
              {
                branch: selectedFilter.branch,
                repoIdentifier: selectedFilter.repo,
                ...(isPipelineRemote
                  ? {
                      repoName,
                      connectorRef,
                      storeType
                    }
                  : {})
              },
              { skipNulls: true },
              true
            )
            location.reload()
          } else {
            history.push(
              routes.toTemplateStudio({
                projectIdentifier,
                orgIdentifier,
                accountId,
                module,
                templateType: templateType,
                templateIdentifier: identifier,
                versionLabel: versionLabel,
                repoIdentifier: selectedFilter.repo,
                branch: selectedFilter.branch
              })
            )
          }
        }
      },
    [repoIdentifier, branch, identifier, orgIdentifier, projectIdentifier, accountId, module]
  )

  const Error = !isEmpty(errorObj?.responseMessages) && (
    <ErrorHandler responseMessages={errorObj?.responseMessages as ResponseMessage[]} className={css.errorHandler} />
  )

  return (
    <div className={css.noPipelineFoundContainer}>
      <Layout.Vertical spacing="small" flex={{ justifyContent: 'center', alignItems: 'center' }}>
        {errorPlacement === ErrorPlacement.TOP && Error}
        <img src={noEntityFoundImage} className={css.noPipelineFoundImage} />
        <Text className={css.noPipelineFound} margin={{ top: 'medium', bottom: 'small' }}>
          <String
            stringID={'pipeline.gitExperience.noEntityFound'}
            vars={{ entityType: defaultTo(entityTypeLabelMapping[entityType], entityType) }}
          />
        </Text>
        <Text className={css.selectDiffBranch} margin={{ top: 'xsmall', bottom: 'xlarge' }}>
          {getString('pipeline.gitExperience.selectDiffBranch')}
        </Text>
        {supportingGitSimplification ? (
          <GitRemoteDetails
            connectorRef={gitDetails?.connectorRef || connectorRef}
            repoName={gitDetails?.repoName || repoName}
            branch={gitDetails?.branch || branch}
            flags={{ borderless: false, showRepo: false, normalInputStyle: true }}
            onBranchChange={gitDetails?.onBranchChange ?? onGitBranchChange}
          />
        ) : (
          <GitFilters
            onChange={onGitBranchChange}
            showRepoSelector={false}
            defaultValue={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
            branchSelectClassName={css.branchSelector}
          />
        )}
        {errorPlacement === ErrorPlacement.BOTTOM && Error}
      </Layout.Vertical>
    </div>
  )
}

export const handleEntityNotFound = (fetchError?: Error): JSX.Element => {
  return (
    <Container margin={{ top: 'huge' }}>
      <GenericErrorHandler errStatusCode={fetchError?.code || fetchError?.status} errorMessage={fetchError?.message} />
    </Container>
  )
}

export const handleFetchFailure = (
  entityType: NoEntityFoundProps['entityType'],
  identifier: string,
  isInline: boolean,
  fetchError?: Error
): JSX.Element => {
  if (isInline || fetchError?.code === 'ENTITY_NOT_FOUND') {
    return handleEntityNotFound(fetchError)
  } else {
    // This is for remote entities with support to change branch
    return <NoEntityFound identifier={identifier} entityType={entityType} errorObj={fetchError} />
  }
}

export default NoEntityFound
