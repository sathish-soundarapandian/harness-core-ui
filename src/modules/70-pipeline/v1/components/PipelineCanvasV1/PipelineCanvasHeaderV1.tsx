/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import {
  Button,
  ButtonVariation,
  Container,
  Icon,
  Layout,
  Popover,
  Text,
  VisualYamlSelectedView as SelectedView
} from '@harness/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Classes, Menu, Position } from '@blueprintjs/core'

import { stringify } from '@common/utils/YamlHelperMethods'
import useDiffDialog from '@common/hooks/useDiffDialog'
import RbacButton from '@rbac/components/Button/Button'
import { TagsPopover } from '@common/components'
import GitRemoteDetails from '@common/components/GitRemoteDetails/GitRemoteDetails'
import { getFeaturePropsForRunPipelineButton } from '@pipeline/utils/runPipelineUtils'
import DescriptionPopover from '@common/components/DescriptionPopover.tsx/DescriptionPopover'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import type {
  GitQueryParams,
  PathFn,
  PipelinePathProps,
  PipelineStudioQueryParams,
  PipelineType,
  RunPipelineQueryParams
} from '@common/interfaces/RouteInterfaces'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import type { CacheResponseMetadata, Error } from 'services/pipeline-ng'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { useQueryParams } from '@common/hooks'
import StudioGitPopover from '@pipeline/components/PipelineStudio/StudioGitPopover'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import {
  PipelineCachedCopy,
  PipelineCachedCopyHandle
} from '@pipeline/components/PipelineStudio/PipelineCanvas/PipelineCachedCopy/PipelineCachedCopy'
import {
  SavePipelineHandleV1,
  SavePipelinePopoverWithRefV1
} from '../PipelineStudioV1/SavePipelinePopoverV1/SavePipelinePopoverV1'
import { usePipelineContextV1 } from '../PipelineStudioV1/PipelineContextV1/PipelineContextV1'

import css from '@pipeline/components/PipelineStudio/PipelineCanvas/PipelineCanvas.module.scss'
import cssV1 from './PipelineCanvasV1.module.scss'

export interface PipelineCanvasHeaderProps {
  isPipelineRemote: boolean
  isGitSyncEnabled: boolean
  disableVisualView: boolean
  onGitBranchChange(selectedFilter: GitFilterScope, defaultSelected?: boolean): void
  setModalMode(mode: 'edit' | 'create'): void
  setYamlError(mode: boolean): void
  showModal(): void
  openRunPipelineModal(): void
  toPipelineStudio: PathFn<PipelineType<PipelinePathProps> & PipelineStudioQueryParams>
}

export function PipelineCanvasHeaderV1(props: PipelineCanvasHeaderProps): React.ReactElement {
  const {
    isPipelineRemote,
    isGitSyncEnabled,
    onGitBranchChange,
    setModalMode,
    showModal,
    toPipelineStudio,
    openRunPipelineModal
  } = props
  const { getString } = useStrings()
  const { state, updatePipelineView, isReadonly, view, fetchPipeline } = usePipelineContextV1()
  const {
    pipeline,
    originalPipeline,
    gitDetails,
    cacheResponse: pipelineCacheResponse,
    pipelineView,
    remoteFetchError,
    isUpdated,
    entityValidityDetails,
    modules
  } = state
  const params = useParams<PipelineType<PipelinePathProps> & GitQueryParams>()
  const { branch, repoName, connectorRef } = useQueryParams<GitQueryParams & RunPipelineQueryParams>()
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier } = params
  const savePipelineHandleRef = React.useRef<SavePipelineHandleV1 | null>(null)
  const pipelineCachedCopyRef = React.useRef<PipelineCachedCopyHandle | null>(null)

  const { open: openDiffModal } = useDiffDialog({
    originalYaml: stringify(originalPipeline),
    updatedYaml: stringify(pipeline),
    title: getString('pipeline.piplineDiffTitle')
  })

  const isYaml = view === SelectedView.YAML

  function handleEditClick(): void {
    setModalMode('edit')
    showModal()
  }

  function handleDiscardClick(): void {
    updatePipelineView({ ...pipelineView, isYamlEditable: false })
    fetchPipeline({ forceFetch: true, forceUpdate: true })
  }

  function handleRunClick(e: React.SyntheticEvent): void {
    e.stopPropagation()
    openRunPipelineModal()
  }

  let runTooltip = ''

  if (entityValidityDetails?.valid === false) {
    runTooltip = getString('pipeline.cannotRunInvalidPipeline')
  } else if (isUpdated) {
    runTooltip = getString('pipeline.cannotRunUnsavedPipeline')
  }

  // Need to show reload option only when we are showing a cached response
  function showReloadFromGitoption(): boolean {
    return Boolean(isPipelineRemote && pipelineCacheResponse)
  }

  function handleReloadFromGitClick(): void {
    pipelineCachedCopyRef.current?.showConfirmationModal()
  }

  function handleReloadFromCache(): void {
    updatePipelineView({ ...pipelineView, isYamlEditable: false })
    fetchPipeline({ forceFetch: true, forceUpdate: true, loadFromCache: false })
  }

  const isNewPipeline = pipelineIdentifier === DefaultNewPipelineId

  function renderDiscardUnsavedChangeButton(): JSX.Element | null {
    return !isNewPipeline && !isReadonly ? (
      <Button
        disabled={!isUpdated}
        onClick={handleDiscardClick}
        className={css.discardBtn}
        variation={ButtonVariation.SECONDARY}
        text={getString('pipeline.discard')}
      />
    ) : null
  }

  function renderPipelineMenuActions(): JSX.Element | null {
    return isNewPipeline ? null : (
      <Popover className={Classes.DARK} position={Position.LEFT}>
        <Button variation={ButtonVariation.ICON} icon="Options" aria-label="pipeline menu actions" />
        <Menu style={{ backgroundColor: 'unset' }}>
          {showReloadFromGitoption() ? (
            <RbacMenuItem
              icon="repeat"
              text={getString('common.reloadFromGit')}
              onClick={handleReloadFromGitClick}
              permission={{
                resourceScope: {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  projectIdentifier
                },
                resource: {
                  resourceType: ResourceType.PIPELINE,
                  resourceIdentifier: pipeline?.identifier
                },
                permission: PermissionIdentifier.VIEW_PIPELINE
              }}
            />
          ) : null}
        </Menu>
      </Popover>
    )
  }

  return (
    <React.Fragment>
      {(remoteFetchError as Error)?.code === 'ENTITY_NOT_FOUND' ? null : (
        <div className={cx(css.titleBar, cssV1.titleBarWithoutToggle)}>
          <div className={css.titleSubheader}>
            <div
              className={cx(css.breadcrumbsMenu, {
                [css.remotePipelineName]: isPipelineRemote
              })}
            >
              <div className={css.pipelineMetadataContainer}>
                <Layout.Horizontal className={css.pipelineNameContainer}>
                  <Icon className={css.pipelineIcon} padding={{ right: 'small' }} name="pipeline" size={32} />
                  <Text className={css.pipelineName} lineClamp={1}>
                    {pipeline?.name}
                  </Text>
                  {!isEmpty(pipeline?.tags) && pipeline.tags && (
                    <Container className={css.tagsContainer}>
                      <TagsPopover tags={pipeline.tags} />
                    </Container>
                  )}
                  {pipeline?.description && (
                    <Container className={cx({ [css.tagsContainer]: isGitSyncEnabled })}>
                      <DescriptionPopover text={pipeline.description} />
                    </Container>
                  )}
                  {isGitSyncEnabled && (
                    <StudioGitPopover
                      gitDetails={gitDetails}
                      identifier={pipelineIdentifier}
                      isReadonly={isReadonly}
                      entityData={{ ...pipeline, versionLabel: '', type: 'Step' }} // Just to avoid type issues
                      onGitBranchChange={onGitBranchChange}
                      entityType={'Pipeline'}
                    />
                  )}
                  {isYaml ? null : (
                    <Button
                      variation={ButtonVariation.ICON}
                      icon="Edit"
                      onClick={handleEditClick}
                      aria-label={getString('editPipeline')}
                    />
                  )}
                </Layout.Horizontal>
              </div>
            </div>
            {isPipelineRemote && (
              <div className={css.gitRemoteDetailsWrapper}>
                <GitRemoteDetails
                  connectorRef={connectorRef}
                  repoName={defaultTo(
                    defaultTo(defaultTo(repoName, gitDetails.repoName), gitDetails.repoIdentifier),
                    ''
                  )}
                  filePath={defaultTo(gitDetails.filePath, '')}
                  fileUrl={defaultTo(gitDetails.fileUrl, '')}
                  branch={defaultTo(defaultTo(branch, gitDetails.branch), '')}
                  onBranchChange={onGitBranchChange}
                  flags={{
                    readOnly: pipelineIdentifier === DefaultNewPipelineId
                  }}
                />
                {!isEmpty(pipelineCacheResponse) && !remoteFetchError && (
                  <PipelineCachedCopy
                    ref={pipelineCachedCopyRef}
                    reloadContent={getString('common.pipeline')}
                    cacheResponse={pipelineCacheResponse as CacheResponseMetadata}
                    reloadFromCache={handleReloadFromCache}
                  />
                )}
              </div>
            )}
          </div>
          {remoteFetchError ? null : (
            <>
              <div className={css.savePublishContainer}>
                {isUpdated && !isReadonly && (
                  <Button
                    variation={ButtonVariation.LINK}
                    intent="warning"
                    className={css.unsavedChanges}
                    onClick={openDiffModal}
                  >
                    {getString('unsavedChanges')}
                  </Button>
                )}
                <SavePipelinePopoverWithRefV1 toPipelineStudio={toPipelineStudio} ref={savePipelineHandleRef} />
                {renderDiscardUnsavedChangeButton()}
                <RbacButton
                  data-testid="card-run-pipeline"
                  variation={ButtonVariation.PRIMARY}
                  icon="run-pipeline"
                  intent="success"
                  disabled={isUpdated || entityValidityDetails?.valid === false}
                  className={css.runPipelineBtn}
                  text={getString('runPipelineText')}
                  tooltip={runTooltip}
                  onClick={handleRunClick}
                  featuresProps={getFeaturePropsForRunPipelineButton({
                    modules,
                    getString
                  })}
                  permission={{
                    resourceScope: {
                      accountIdentifier: accountId,
                      orgIdentifier,
                      projectIdentifier
                    },
                    resource: {
                      resourceType: ResourceType.PIPELINE,
                      resourceIdentifier: pipeline?.identifier
                    },
                    permission: PermissionIdentifier.EXECUTE_PIPELINE
                  }}
                />
                {renderPipelineMenuActions()}
              </div>
            </>
          )}
        </div>
      )}
    </React.Fragment>
  )
}
