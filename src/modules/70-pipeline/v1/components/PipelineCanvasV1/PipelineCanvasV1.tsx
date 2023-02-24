/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Classes, Dialog, IDialogProps, Intent } from '@blueprintjs/core'
import cx from 'classnames'
import {
  Button,
  ButtonVariation,
  Container,
  Layout,
  PageSpinner,
  useConfirmationDialog,
  useToaster,
  VisualYamlSelectedView as SelectedView
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { matchPath, useHistory, useParams } from 'react-router-dom'
import { defaultTo, isEmpty, isEqual } from 'lodash-es'
import { parse } from '@common/utils/YamlHelperMethods'
import type { Error, PipelineInfoConfig } from 'services/pipeline-ng'
import { EntityGitDetails, useGetInputsetYaml } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { NavigationCheck } from '@common/components/NavigationCheck/NavigationCheck'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import type {
  GitQueryParams,
  PathFn,
  PipelinePathProps,
  PipelineStudioQueryParams,
  PipelineType,
  ProjectPathProps,
  RunPipelineQueryParams
} from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import GenericErrorHandler from '@common/pages/GenericErrorHandler/GenericErrorHandler'
import NoEntityFound, { handleFetchFailure } from '@pipeline/pages/utils/NoEntityFound/NoEntityFound'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import type { Pipeline } from '@pipeline/utils/types'
import { RunPipelineFormV1 } from '../RunPipelineModalV1/RunPipelineFormV1'
import { DefaultNewPipelineId } from '../../../components/PipelineStudio/PipelineContext/PipelineActions'
import usePipelineErrors from '../../../components/PipelineStudio/PipelineCanvas/PipelineErrors/usePipelineErrors'
import CreatePipelinesV1 from '../CreatePipelinesV1/CreatePipelinesV1'
import PipelineYAMLViewV1 from '../PipelineStudioV1/PipelineYAMLViewV1/PipelineYAMLViewV1'
import { PipelineCanvasHeaderV1 } from './PipelineCanvasHeaderV1'
import { usePipelineContextV1 } from '../PipelineStudioV1/PipelineContextV1/PipelineContextV1'

import css from '../../../components/PipelineStudio/PipelineCanvas/PipelineCanvas.module.scss'

interface OtherModalProps {
  onSubmit?: (values: PipelineInfoConfig) => void
  initialValues?: PipelineInfoConfig
  onClose?: () => void
}

interface PipelineWithGitContextFormProps extends PipelineInfoConfig {
  repo?: string
  branch?: string
  connectorRef?: string
  filePath?: string
  storeType?: string
}

const runModalProps: IDialogProps = {
  isOpen: true,
  // usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: false,
  enforceFocus: false,
  className: css.runPipelineDialog,
  style: { width: 872, height: 'fit-content', overflow: 'auto' },
  isCloseButtonShown: false
}

export interface PipelineCanvasProps {
  // diagram?: DiagramFactory
  toPipelineStudio: PathFn<PipelineType<PipelinePathProps> & PipelineStudioQueryParams>
  toPipelineDetail: PathFn<PipelineType<PipelinePathProps>>
  toPipelineList: PathFn<PipelineType<ProjectPathProps>>
  toPipelineProject: PathFn<PipelineType<ProjectPathProps>>
  getOtherModal?: (
    onSubmit: (values: PipelineInfoConfig, storeMetadata?: StoreMetadata, gitDetails?: EntityGitDetails) => void,
    onClose: () => void
  ) => React.ReactElement<OtherModalProps>
}

export function PipelineCanvasV1({
  // diagram,
  toPipelineList,
  toPipelineStudio,
  getOtherModal
}: PipelineCanvasProps): React.ReactElement {
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingGitSimplification
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const {
    state,
    updatePipeline,
    updatePipelineStoreMetadata,
    updateGitDetails,
    deletePipelineCache,
    fetchPipeline,
    setView,
    isReadonly
  } = usePipelineContextV1()
  const {
    repoIdentifier,
    branch,
    runPipeline,
    executionId,
    inputSetType,
    inputSetLabel,
    inputSetRepoIdentifier,
    inputSetBranch,
    repoName,
    connectorRef,
    storeType
  } = useQueryParams<GitQueryParams & RunPipelineQueryParams>()
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<PipelineStudioQueryParams>()
  const {
    pipeline,
    isUpdated,
    pipelineView: { isYamlEditable },
    isLoading,
    isInitialized,
    originalPipeline,
    yamlHandler,
    isBEPipelineUpdated,
    gitDetails,
    remoteFetchError,
    storeMetadata,
    entityValidityDetails,
    templateError,
    yamlSchemaErrorWrapper
  } = state

  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<PipelinePathProps> & GitQueryParams
  >()
  const history = useHistory()

  // For remote pipeline queryParam will always as branch as selected branch except coming from list view
  // While opeining studio from list view, selected branch can be any branch as in pipeline response
  // We also have to discard Transition url which was without branch

  React.useEffect(() => {
    if (
      originalPipeline?.identifier !== DefaultNewPipelineId &&
      storeType === StoreType.REMOTE &&
      !branch &&
      gitDetails?.branch
    ) {
      history.replace(toPipelineList({ orgIdentifier, projectIdentifier, accountId, module }))
      updateQueryParams({ branch: gitDetails?.branch })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch, gitDetails?.branch, module, originalPipeline?.identifier, projectIdentifier])

  const { showError, clear } = useToaster()

  useDocumentTitle([parse(pipeline?.name || getString('pipelines'))])
  const [discardBEUpdateDialog, setDiscardBEUpdate] = React.useState(false)

  const { openDialog: openConfirmBEUpdateError } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('pipelines-studio.pipelineUpdatedError'),
    titleText: getString('pipelines-studio.pipelineUpdated'),
    confirmButtonText: getString('update'),
    intent: Intent.WARNING,
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        fetchPipeline({ forceFetch: true, forceUpdate: true })
      } else {
        setDiscardBEUpdate(true)
      }
    }
  })

  const { openPipelineErrorsModal } = usePipelineErrors()
  const [isYamlError, setYamlError] = React.useState(false)
  const [blockNavigation, setBlockNavigation] = React.useState(false)
  const [selectedBranch, setSelectedBranch] = React.useState(defaultTo(branch, ''))
  const [useTemplate, setUseTemplate] = React.useState<boolean>(false)
  const [modalMode, setModalMode] = React.useState<'edit' | 'create'>('create')

  const isPipelineRemote = supportingGitSimplification && storeType === StoreType.REMOTE

  React.useEffect(() => {
    if (isGitSyncEnabled || isPipelineRemote) {
      openPipelineErrorsModal(yamlSchemaErrorWrapper?.schemaErrors)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yamlSchemaErrorWrapper, isGitSyncEnabled, isPipelineRemote])

  const { openDialog: openUnsavedChangesDialog } = useConfirmationDialog({
    cancelButtonText: getString('common.stayOnThisPage'),
    className: css.dialogStyle,
    contentText: isYamlError ? getString('navigationYamlError') : getString('navigationCheckText'),
    titleText: isYamlError ? getString('navigationYamlErrorTitle') : getString('navigationCheckTitle'),
    confirmButtonText: getString('common.leaveThisPage'),
    intent: Intent.WARNING,
    showCloseButton: false,
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        deletePipelineCache(gitDetails).then(() => {
          history.push(
            routes.toPipelineStudioV1({
              projectIdentifier,
              orgIdentifier,
              pipelineIdentifier: defaultTo(pipeline?.identifier, '-1'),
              accountId,
              module,
              branch: selectedBranch,
              repoIdentifier,
              repoName,
              connectorRef,
              storeType
            })
          )
          location.reload()
        })
      } else {
        setSelectedBranch(branch || '')
      }
      setBlockNavigation(false)
    }
  })

  const getDialogWidth = (): string => {
    if (supportingGitSimplification) {
      return '800px'
    } else {
      return isGitSyncEnabled ? '614px' : 'auto'
    }
  }

  const [showModal, hideModal] = useModalHook(() => {
    if (getOtherModal) {
      pipeline.identifier = ''
      updatePipeline(pipeline)
      return getOtherModal(onSubmit, onCloseCreate)
    } else {
      return (
        <Dialog
          style={{
            width: getDialogWidth(),
            background: 'var(--form-bg)',
            paddingTop: '36px'
          }}
          enforceFocus={false}
          isOpen={true}
          className={'padded-dialog'}
          onClose={onCloseCreate}
          title={modalMode === 'create' ? getString('moduleRenderer.newPipeLine') : getString('editPipeline')}
        >
          <CreatePipelinesV1
            afterSave={onSubmit}
            closeModal={onCloseCreate}
            gitDetails={{ ...gitDetails, remoteFetchFailed: Boolean(remoteFetchError) } as IGitContextFormProps}
            primaryButtonText={modalMode === 'create' ? getString('start') : getString('continue')}
            isReadonly={isReadonly}
          />
        </Dialog>
      )
    }
  }, [
    supportingGitSimplification,
    isGitSyncEnabled,
    pipeline,
    pipelineIdentifier,
    repoName,
    gitDetails,
    branch,
    connectorRef,
    modalMode,
    isReadonly
  ])

  React.useEffect(() => {
    // for simplified pipeline V1 always use YAML as default view
    setView(SelectedView.YAML)
  }, [pipelineIdentifier, entityValidityDetails?.valid])

  React.useEffect(() => {
    if (isInitialized) {
      if (pipeline?.name === '') {
        setModalMode('create')
        showModal()
      }
      if (isBEPipelineUpdated && !discardBEUpdateDialog) {
        openConfirmBEUpdateError()
      }
      if (blockNavigation && isUpdated) {
        openUnsavedChangesDialog()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pipeline?.identifier,
    showModal,
    isInitialized,
    isBEPipelineUpdated,
    discardBEUpdateDialog,
    blockNavigation
  ])

  React.useEffect(() => {
    if (pipeline?.name) {
      window.dispatchEvent(new CustomEvent('RENAME_PIPELINE', { detail: pipeline?.name }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline?.name])

  const onCloseCreate = React.useCallback(() => {
    delete (pipeline as PipelineWithGitContextFormProps).repo
    delete (pipeline as PipelineWithGitContextFormProps).branch
    delete (pipeline as PipelineWithGitContextFormProps).connectorRef
    delete (pipeline as PipelineWithGitContextFormProps).filePath
    delete (pipeline as PipelineWithGitContextFormProps).storeType
    if (pipelineIdentifier === DefaultNewPipelineId || getOtherModal) {
      deletePipelineCache(gitDetails)
      history.push(toPipelineList({ orgIdentifier, projectIdentifier, accountId, module }))
    }
    hideModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accountId,
    hideModal,
    history,
    module,
    orgIdentifier,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pipeline?.identifier,
    projectIdentifier,
    toPipelineList,
    getOtherModal,
    gitDetails,
    deletePipelineCache
  ])

  const onSubmit = React.useCallback(
    (
      values: PipelineInfoConfig,
      currStoreMetadata?: StoreMetadata,
      updatedGitDetails?: EntityGitDetails,
      shouldUseTemplate = false
    ) => {
      pipeline.name = values.name
      pipeline.description = values.description
      delete (pipeline as Partial<PipelineInfoConfig>).identifier
      delete (pipeline as PipelineInfoConfig).orgIdentifier
      delete (pipeline as PipelineInfoConfig).projectIdentifier
      delete (pipeline as PipelineWithGitContextFormProps).repo
      delete (pipeline as PipelineWithGitContextFormProps).branch
      delete (pipeline as PipelineWithGitContextFormProps).connectorRef
      delete (pipeline as PipelineWithGitContextFormProps).filePath
      delete (pipeline as PipelineWithGitContextFormProps).storeType
      updatePipeline(pipeline)
      if (currStoreMetadata?.storeType) {
        updatePipelineStoreMetadata(currStoreMetadata, gitDetails)
      }

      if (updatedGitDetails) {
        if (gitDetails?.objectId || gitDetails?.commitId) {
          updatedGitDetails = { ...gitDetails, ...updatedGitDetails }
        }
        updateGitDetails(updatedGitDetails).then(() => {
          if (updatedGitDetails) {
            if (isGitSyncEnabled) {
              updateQueryParams(
                { repoIdentifier: updatedGitDetails.repoIdentifier, branch: updatedGitDetails.branch },
                { skipNulls: true }
              )
            } else if (supportingGitSimplification && currStoreMetadata?.storeType === StoreType.REMOTE) {
              updateQueryParams(
                {
                  connectorRef: currStoreMetadata.connectorRef,
                  repoName: updatedGitDetails?.repoName,
                  branch: updatedGitDetails.branch,
                  storeType: currStoreMetadata.storeType as StoreType
                },
                { skipNulls: true }
              )
            }
          }
        })
      }
      setUseTemplate(shouldUseTemplate)
      hideModal()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hideModal, pipeline, updatePipeline]
  )

  const [inputSetYaml, setInputSetYaml] = React.useState('')

  const { data, refetch, loading } = useGetInputsetYaml({
    planExecutionId: executionId ?? '',
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountIdentifier: accountId
    },
    lazy: true,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  React.useEffect(() => {
    if (data) {
      ;(data as unknown as Response).text().then(str => {
        setInputSetYaml(str)
      })
    }
  }, [data])

  React.useEffect(() => {
    if (executionId && executionId !== null) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionId])

  function onCloseRunPipelineModal(): void {
    closeRunPipelineModal()
    setInputSetYaml('')
    replaceQueryParams({ repoIdentifier, branch, connectorRef, storeType, repoName }, { skipNulls: true }, true)
  }

  const allowOpeningRunPipelineModal: boolean = React.useMemo(() => {
    /**
     * This is done because Run Pipeline modal was opening twice for Remote Pipelines.
     * For remote pipeline when we land on Pipeline Studio from Deployments page, there is no branch initially,
     * because pipeline in list view does not have branch, so there is no branch in url initially and then we update branch in the url.
     * Because of all this, useModalHook for opening Run Pipeline modal runs twice and modal visibly opens twice.
     * To Prevent the issue, added a check which waits for branch name to appear in url when pipeline is of Remote type,
     */
    let shouldOpenRunPipelineModal = false
    if (!isPipelineRemote) {
      shouldOpenRunPipelineModal = true
    } else if (isPipelineRemote && !isEmpty(branch)) {
      shouldOpenRunPipelineModal = true
    }
    return shouldOpenRunPipelineModal
  }, [branch, isPipelineRemote])

  React.useEffect(() => {
    if (runPipeline && allowOpeningRunPipelineModal) {
      openRunPipelineModal()
    }
  }, [runPipeline, allowOpeningRunPipelineModal])

  React.useEffect(() => {
    isPipelineRemote &&
      gitDetails.repoName &&
      gitDetails.branch &&
      updatePipelineStoreMetadata({ connectorRef, storeType }, gitDetails)
  }, [isPipelineRemote, gitDetails, connectorRef, storeType])

  const [openRunPipelineModal, closeRunPipelineModal] = useModalHook(
    () =>
      loading ? (
        <PageSpinner />
      ) : (
        <Dialog {...runModalProps}>
          <Layout.Vertical className={css.modalCard}>
            <RunPipelineFormV1
              pipelineIdentifier={pipelineIdentifier}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
              accountId={accountId}
              module={module}
              connectorRef={connectorRef}
              repoIdentifier={isPipelineRemote ? repoName : repoIdentifier}
              branch={branch}
              source="executions"
              onClose={onCloseRunPipelineModal}
              storeType={storeType}
              storeMetadata={storeMetadata}
            />
            <Button
              aria-label="close modal"
              icon="cross"
              variation={ButtonVariation.ICON}
              onClick={onCloseRunPipelineModal}
              className={css.crossIcon}
            />
          </Layout.Vertical>
        </Dialog>
      ),
    [
      loading,
      inputSetYaml,
      inputSetRepoIdentifier,
      inputSetBranch,
      branch,
      repoIdentifier,
      inputSetType,
      inputSetLabel,
      pipelineIdentifier
    ]
  )

  const onGitBranchChange = React.useMemo(
    () => (selectedFilter: GitFilterScope, defaultSelected?: boolean) => {
      setSelectedBranch(selectedFilter.branch as string)
      if (isUpdated && branch !== selectedFilter.branch) {
        setBlockNavigation(true)
      } else if (branch !== selectedFilter.branch) {
        deletePipelineCache({
          repoIdentifier: defaultTo(selectedFilter.repo, ''),
          branch: defaultTo(selectedFilter.branch, '')
        }).then(() => {
          history.push(
            routes.toPipelineStudioV1({
              projectIdentifier,
              orgIdentifier,
              pipelineIdentifier: defaultTo(pipelineIdentifier, '-1'),
              accountId,
              module,
              branch: selectedFilter.branch,
              repoIdentifier: selectedFilter.repo,
              ...(isPipelineRemote
                ? {
                    repoIdentifier: repoName,
                    repoName,
                    connectorRef,
                    storeType
                  }
                : {})
            })
          )
          if (!defaultSelected) {
            fetchPipeline({
              forceFetch: true,
              forceUpdate: true,
              repoIdentifier: selectedFilter.repo,
              branch: selectedFilter.branch
            })
          }
        })
      }
    },
    [
      isUpdated,
      branch,
      deletePipelineCache,
      history,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier,
      accountId,
      module,
      isPipelineRemote,
      repoName,
      connectorRef,
      storeType
    ]
  )

  if (isLoading) {
    return (
      <React.Fragment>
        <PageSpinner />
        <div /> {/* this empty div is required for rendering layout correctly */}
      </React.Fragment>
    )
  }

  if (templateError?.data && !isGitSyncEnabled && !isPipelineRemote) {
    return (
      <GenericErrorHandler
        errStatusCode={templateError?.status}
        errorMessage={(templateError?.data as Error)?.message}
      />
    )
  }

  if (templateError?.data && isEmpty(pipeline) && (isGitSyncEnabled || isPipelineRemote)) {
    return <NoEntityFound identifier={pipelineIdentifier} entityType={'pipeline'} />
  }

  return (
    <div
      className={cx(Classes.POPOVER_DISMISS, css.content)}
      onClick={e => {
        e.stopPropagation()
      }}
    >
      <NavigationCheck
        when={getOtherModal && pipeline.identifier !== ''}
        shouldBlockNavigation={nextLocation => {
          let localUpdated = isUpdated
          const matchDefault = matchPath(nextLocation.pathname, {
            path: toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams }),
            exact: true
          })

          // This is special handler when user update yaml and immediately click on run
          if (yamlHandler && isYamlEditable && !localUpdated) {
            try {
              const parsedYaml = parse<Pipeline>(yamlHandler.getLatestYaml())
              if (!parsedYaml) {
                clear()
                showError(getString('invalidYamlText'), undefined, 'pipeline.parse.yaml.error')
                return true
              }
              if (yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
                setYamlError(true)
                return true
              }
              localUpdated = !isEqual(originalPipeline, parsedYaml)
              updatePipeline(parsedYaml.pipeline)
            } catch (e) {
              setYamlError(true)
              return true
            }
          }
          setYamlError(false)
          const shouldBlockNavigation =
            !matchDefault?.isExact &&
            localUpdated &&
            !isReadonly &&
            !(pipelineIdentifier === DefaultNewPipelineId && isEmpty(pipeline?.name)) &&
            !(useTemplate && isEmpty(pipeline?.template))
          if (!shouldBlockNavigation) {
            !matchDefault?.isExact && deletePipelineCache(gitDetails)
          }
          return shouldBlockNavigation
        }}
        textProps={{
          contentText: isYamlError ? getString('navigationYamlError') : getString('navigationCheckText'),
          titleText: isYamlError ? getString('navigationYamlErrorTitle') : getString('navigationCheckTitle')
        }}
        navigate={newPath => {
          const isPipeline = matchPath(newPath, {
            path: toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams }),
            exact: true
          })
          !isPipeline?.isExact && deletePipelineCache(gitDetails)
          history.push(newPath)
        }}
      />
      <Layout.Vertical height={'100%'}>
        <PipelineCanvasHeaderV1
          isPipelineRemote={!!isPipelineRemote}
          isGitSyncEnabled={!!isGitSyncEnabled}
          onGitBranchChange={onGitBranchChange}
          setModalMode={setModalMode}
          setYamlError={setYamlError}
          showModal={showModal}
          disableVisualView={true}
          toPipelineStudio={toPipelineStudio}
          openRunPipelineModal={openRunPipelineModal}
        />
        {remoteFetchError ? (
          handleFetchFailure(
            'pipeline',
            pipelineIdentifier,
            !isGitSyncEnabled && storeType !== StoreType.REMOTE,
            remoteFetchError as unknown as Error
          )
        ) : (
          <Container className={css.builderContainer}>
            <PipelineYAMLViewV1 />
          </Container>
        )}
      </Layout.Vertical>
    </div>
  )
}
