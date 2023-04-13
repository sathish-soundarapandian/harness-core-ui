/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import {
  Button,
  ButtonVariation,
  Container,
  Icon,
  Layout,
  Popover,
  Text,
  useToaster,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  shouldShowError,
  getErrorInfoFromErrorObject,
  FontVariation,
  Dialog,
  ModalDialog,
  TableV2,
  PageSpinner
} from '@harness/uicore'

import MonacoDiffEditor from '@common/components/MonacoDiffEditor/MonacoDiffEditor'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Classes, Menu, Position } from '@blueprintjs/core'

import { useGetCommunity } from '@common/utils/utils'
import { parse, stringify } from '@common/utils/YamlHelperMethods'
import useDiffDialog from '@common/hooks/useDiffDialog'
import RbacButton from '@rbac/components/Button/Button'
import { TagsPopover } from '@common/components'
import {
  SavePipelineHandle,
  SavePipelinePopoverWithRef
} from '@pipeline/components/PipelineStudio/SavePipelinePopover/SavePipelinePopover'
import GitRemoteDetails from '@common/components/GitRemoteDetails/GitRemoteDetails'
import { getFeaturePropsForRunPipelineButton } from '@pipeline/utils/runPipelineUtils'
import DescriptionPopover from '@common/components/DescriptionPopover.tsx/DescriptionPopover'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PipelineOutOfSyncErrorStrip } from '@pipeline/components/TemplateLibraryErrorHandling/PipelineOutOfSyncErrorStrip/PipelineOutOfSyncErrorStrip'
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
import type { Pipeline } from '@pipeline/utils/types'
import { CacheResponseMetadata, Error, useDryRunExpressions } from 'services/pipeline-ng'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { useValidateTemplateInputsQuery } from 'services/pipeline-rq'
import { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import StudioGitPopover from '../StudioGitPopover'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import { DefaultNewPipelineId, DrawerTypes } from '../PipelineContext/PipelineActions'
import { EntityCachedCopy, EntityCachedCopyHandle } from './EntityCachedCopy/EntityCachedCopy'
import { getDuplicateStepIdentifierList } from './PipelineCanvasUtils'
import { ValidationBadge } from '../AsyncValidation/ValidationBadge'
import css from './PipelineCanvas.module.scss'
import type { AnyNaptrRecord } from 'dns'

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

function getStudioSelectedView(isYaml: boolean, disableVisualView: boolean): SelectedView {
  return isYaml || disableVisualView ? SelectedView.YAML : SelectedView.VISUAL
}

export function PipelineCanvasHeader(props: PipelineCanvasHeaderProps): React.ReactElement {
  const {
    isPipelineRemote,
    isGitSyncEnabled,
    onGitBranchChange,
    setModalMode,
    setYamlError,
    showModal,
    disableVisualView,
    toPipelineStudio,
    openRunPipelineModal
  } = props
  const { getString } = useStrings()
  const {
    state,
    updatePipelineView,
    isReadonly,
    view,
    setView,
    updatePipeline,
    fetchPipeline,
    setSelectedStageId,
    setSelectedSectionId
  } = usePipelineContext()
  const isAsyncValidationEnabled = useFeatureFlag(FeatureFlag.PIE_ASYNC_VALIDATION)
  const { showError, showSuccess, clear } = useToaster()
  const {
    pipeline,
    originalPipeline,
    gitDetails,
    cacheResponse: pipelineCacheResponse,
    pipelineView,
    yamlHandler,
    remoteFetchError,
    isUpdated,
    entityValidityDetails,
    modules,
    storeMetadata
  } = state
  const params = useParams<PipelineType<PipelinePathProps> & GitQueryParams>()
  const { branch, repoName, connectorRef } = useQueryParams<GitQueryParams & RunPipelineQueryParams>()
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier } = params
  const { isYamlEditable } = pipelineView
  const [shouldShowOutOfSyncError, setShouldShowOutOfSyncError] = React.useState(false)

  const savePipelineHandleRef = React.useRef<SavePipelineHandle | null>(null)
  const pipelineCachedCopyRef = React.useRef<EntityCachedCopyHandle | null>(null)
  const isCommunity = useGetCommunity()
  const {
    data: reconcileErrorData,
    refetch: reconcilePipeline,
    error: reconcileError
  } = useValidateTemplateInputsQuery(
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        identifier: pipelineIdentifier,
        ...getGitQueryParamsWithParentScope({ storeMetadata, params })
      }
    },
    {
      enabled: false,
      staleTime: 5_000,
      onSuccess(data) {
        if (data?.data?.validYaml === false && data?.data.errorNodeSummary) {
          // This is handled by <PipelineOutOfSyncErrorStrip/>
          clear()
        } else {
          clear()
          showSuccess(getString('pipeline.outOfSyncErrorStrip.noErrorText', { entity: TemplateErrorEntity.PIPELINE }))
          setShouldShowOutOfSyncError(false)
        }
      }
    }
  )

  React.useEffect(() => {
    if (reconcileError && shouldShowError(reconcileError)) {
      showError(getErrorInfoFromErrorObject(reconcileError))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconcileError])

  const updateEntity = React.useCallback(async (entityYaml: string) => {
    await savePipelineHandleRef.current?.updatePipeline(entityYaml)
    setShouldShowOutOfSyncError(false)
  }, [])

  const onRefreshEntity = React.useCallback(() => {
    fetchPipeline({ forceFetch: true, forceUpdate: true })
    setShouldShowOutOfSyncError(false)
  }, [fetchPipeline])

  const isValidYaml = function (): boolean {
    if (yamlHandler) {
      try {
        const parsedYaml = parse<Pipeline>(yamlHandler.getLatestYaml())
        if (!parsedYaml) {
          clear()
          showError(getString('invalidYamlText'))
          return false
        }
        if (yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
          clear()
          setYamlError(true)
          showError(getString('invalidYamlText'))
          return false
        }
        updatePipeline(parsedYaml.pipeline)
      } catch (e) {
        clear()
        setYamlError(true)
        showError(defaultTo(e.message, getString('invalidYamlText')))
        return false
      }
    }
    return true
  }

  function handleViewChange(newView: SelectedView): boolean {
    if (newView === view) return false
    if (newView === SelectedView.VISUAL) {
      const duplicateStepIdentifiersList = pipeline?.stages ? getDuplicateStepIdentifierList(pipeline?.stages) : []
      if (duplicateStepIdentifiersList.length) {
        clear()
        showError(
          getString('pipeline.duplicateStepIdentifiers', {
            duplicateIdString: duplicateStepIdentifiersList.join(', ')
          }),
          5000
        )
        return false
      }
      if (yamlHandler && isYamlEditable) {
        if (!isValidYaml()) return false
      }
    }
    setView(newView)
    updatePipelineView({
      splitViewData: {},
      isDrawerOpened: false,
      isYamlEditable: false,
      isSplitViewOpen: false,
      drawerData: { type: DrawerTypes.AddStep }
    })
    setSelectedStageId(undefined)
    setSelectedSectionId(undefined)
    return true
  }

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

  function handleReconcileClick(): void {
    reconcilePipeline()
    showSuccess(getString('pipeline.outOfSyncErrorStrip.reconcileStarted'))
    setShouldShowOutOfSyncError(true)
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
          <RbacMenuItem
            icon="refresh"
            text={getString('pipeline.outOfSyncErrorStrip.reconcile')}
            disabled={isCommunity}
            onClick={handleReconcileClick}
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
              permission: PermissionIdentifier.EDIT_PIPELINE
            }}
          />
        </Menu>
      </Popover>
    )
  }
  const [dryRunDialog, setDryRunDialog] = useState(false)
  const [dryRunResult, setDryRunResult] = useState<AnyNaptrRecord>()
  const { mutate: dryRun } = useDryRunExpressions({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })
  const RenderStatusColumn: any = ({ row }) => {
    return (
      <Text
        padding="medium"
        width={100}
        lineClamp={1}
        font={{
          variation: row.original.resolved ? FontVariation.FORM_MESSAGE_SUCCESS : FontVariation.FORM_MESSAGE_DANGER
        }}
      >
        {row.original.resolved ? 'success' : 'failure'}
      </Text>
    )
  }
  const RenderExpressionColumn: any = ({ row }) => {
    return (
      <>
        <Text padding="medium" lineClamp={1} width={300}>
          {row.original.expression}
        </Text>
      </>
    )
  }
  const RenderResolvedColumn: any = ({ row }) => {
    return (
      <Text padding="medium" lineClamp={1} width={200}>
        {row.original.resolvedValue}
      </Text>
    )
  }
  const RenderSuggestedExpressionColumn: any = ({ row }) => {
    return (
      <>
        {row.original.suggestedExpression ? (
          <MonacoDiffEditor
            width="100%"
            height="40px"
            language="yaml"
            original={row.original.expression}
            value={row.original.suggestedExpression}
            options={{ renderSideBySide: false }}
          />
        ) : null}
      </>
    )
  }
  const DryRunResults = (result: any | string, success: boolean) => {
    if (result.length) {
      return (
        <>
          <Layout.Vertical spacing="large" height={600}>
            <Layout.Horizontal spacing="medium" flex={{ justifyContent: 'flex-start' }}>
              <Text font={{ variation: FontVariation.H5 }}>Overall Status:</Text>
              <Text
                font={{
                  variation: success ? FontVariation.FORM_MESSAGE_SUCCESS : FontVariation.FORM_MESSAGE_DANGER
                }}
              >
                {success ? 'success' : 'failure'}
              </Text>
            </Layout.Horizontal>

            <TableV2
              columns={[
                {
                  Header: 'Expression & Suggested Expression',
                  accessor: function noRefCheck() {},
                  id: 'expression',
                  Cell: RenderExpressionColumn,
                  width: '30%'
                },
                {
                  Header: ' Suggested Expression',
                  accessor: function noRefCheck() {},
                  id: 'suggestedExpression',
                  Cell: RenderSuggestedExpressionColumn,
                  width: '40%'
                },

                {
                  Header: 'Resolved Value',
                  accessor: function noRefCheck() {},
                  id: 'resolvedValue',
                  Cell: RenderResolvedColumn,
                  width: '15%'
                },
                {
                  Header: 'Status',
                  accessor: function noRefCheck() {},
                  id: 'resolved',

                  Cell: RenderStatusColumn,
                  width: '15%'
                }
              ]}
              data={result}
            />
          </Layout.Vertical>
        </>
      )
    }
  }
  const [dryRunLoading, SetDryRunLoading] = useState(false)
  return (
    <React.Fragment>
      {(remoteFetchError as Error)?.code === 'ENTITY_NOT_FOUND' ? null : (
        <div className={css.titleBar}>
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
                  {pipeline.description && (
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
                  <EntityCachedCopy
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
              <VisualYamlToggle
                className={css.visualYamlToggle}
                selectedView={getStudioSelectedView(isYaml, disableVisualView)}
                disableToggle={disableVisualView}
                onChange={handleViewChange}
                showDisableToggleReason={true}
              />
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
                {isAsyncValidationEnabled && !isNewPipeline && <ValidationBadge className={css.validationContainer} />}
                <SavePipelinePopoverWithRef toPipelineStudio={toPipelineStudio} ref={savePipelineHandleRef} />
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
                <Button
                  margin="medium"
                  text="Dry Run"
                  intent="primary"
                  onClick={() => {
                    SetDryRunLoading(true)
                    dryRun(`${yamlHandler?.getLatestYaml()}`, {
                      pathParams: { pipelineIdentifier },
                      headers: { 'content-type': 'application/yaml' }
                    })
                      .then(data => {
                        setDryRunResult(DryRunResults(data.data?.expressionDryRunDetails, data.data?.success))
                      })
                      .catch(err => {
                        setDryRunResult(getErrorInfoFromErrorObject(err))
                      })
                      .finally(() => {
                        SetDryRunLoading(false)
                        setDryRunDialog(true)
                      })
                  }}
                ></Button>
                {dryRunLoading && <PageSpinner message={'Fetching Dry run results'} />}
                <ModalDialog
                  isOpen={dryRunDialog}
                  title={'Dry Run Results'}
                  enforceFocus={false}
                  width={1200}
                  height={800}
                  onClose={() => setDryRunDialog(false)}
                  lazy
                >
                  <Text>{dryRunResult}</Text>
                </ModalDialog>
                {renderPipelineMenuActions()}
              </div>
            </>
          )}
        </div>
      )}
      {shouldShowOutOfSyncError ? (
        <PipelineOutOfSyncErrorStrip
          updateRootEntity={updateEntity}
          errorData={reconcileErrorData}
          onRefreshEntity={onRefreshEntity}
        />
      ) : null}
    </React.Fragment>
  )
}
