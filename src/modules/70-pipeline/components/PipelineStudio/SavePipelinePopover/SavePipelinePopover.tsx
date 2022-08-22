/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Container,
  PopoverProps,
  SplitButton,
  SplitButtonOption,
  useToaster,
  VisualYamlSelectedView as SelectedView
} from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, noop, omit } from 'lodash-es'
import { useModalHook } from '@harness/use-modal'
import { Spinner } from '@blueprintjs/core'
import { parse, yamlStringify } from '@common/utils/YamlHelperMethods'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useFeature } from '@common/hooks/useFeatures'
import { savePipeline, usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { PipelineActions } from '@common/constants/TrackingConstants'
import { validateCICodebaseConfiguration } from '@pipeline/components/PipelineStudio/StepUtil'
import { useQueryParams } from '@common/hooks'
import type {
  GitQueryParams,
  PathFn,
  PipelinePathProps,
  PipelineStudioQueryParams,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useSaveAsTemplate } from '@pipeline/components/PipelineStudio/SaveTemplateButton/useSaveAsTemplate'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { GovernanceMetadata, PipelineInfoConfig } from 'services/pipeline-ng'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import type { AccessControlCheckError } from 'services/rbac'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { EvaluationModal } from '@governance/EvaluationModal'
import type { SaveToGitFormV2Interface } from '@common/components/SaveToGitFormV2/SaveToGitFormV2'
import { SCHEMA_VALIDATION_FAILED } from '@common/interfaces/GitSyncInterface'
import type { Pipeline } from '@pipeline/utils/types'
import useTemplateErrors from '@pipeline/components/TemplateErrors/useTemplateErrors'
import { sanitize } from '@common/utils/JSONUtils'
import { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import usePipelineErrors from '../PipelineCanvas/PipelineErrors/usePipelineErrors'

export default interface SavePipelinePopoverProps extends PopoverProps {
  toPipelineStudio: PathFn<PipelineType<PipelinePathProps> & PipelineStudioQueryParams>
}

export type SavePipelineHandle = {
  updatePipeline: (pipelineYaml: string) => Promise<void>
}

interface SavePipelineObj {
  pipeline: PipelineInfoConfig
}

function SavePipelinePopover(
  props: SavePipelinePopoverProps,
  ref: React.ForwardedRef<SavePipelineHandle>
): React.ReactElement {
  const { toPipelineStudio } = props
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingGitSimplification
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const {
    state: { pipeline, yamlHandler, storeMetadata, gitDetails, isUpdated },
    deletePipelineCache,
    fetchPipeline,
    view,
    setSchemaErrorView,
    isReadonly
  } = usePipelineContext()
  const [loading, setLoading] = React.useState<boolean>()
  const { branch, repoName, connectorRef, storeType, repoIdentifier } = useQueryParams<GitQueryParams>()
  const { trackEvent } = useTelemetry()
  const { showSuccess, showError, clear } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { OPA_PIPELINE_GOVERNANCE } = useFeatureFlags()
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } =
    useParams<PipelineType<PipelinePathProps>>()
  const isYaml = view === SelectedView.YAML
  const { openTemplateErrorsModal } = useTemplateErrors({ entity: TemplateErrorEntity.PIPELINE })
  const [governanceMetadata, setGovernanceMetadata] = React.useState<GovernanceMetadata>()
  const isPipelineRemote = supportingGitSimplification && storeType === StoreType.REMOTE

  const [showOPAErrorModal, closeOPAErrorModal] = useModalHook(
    () => (
      <EvaluationModal
        accountId={accountId}
        metadata={governanceMetadata}
        headingErrorMessage={getString('pipeline.policyEvaluations.failedToSavePipeline')}
        closeModal={() => {
          closeOPAErrorModal()
          const { status, newPipelineId, updatedGitDetails } = governanceMetadata as GovernanceMetadata
          if (status === 'warning') {
            publishPipeline(newPipelineId, updatedGitDetails)
          }
        }}
      />
    ),
    [governanceMetadata]
  )
  const { enabled: templatesFeatureEnabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.TEMPLATE_SERVICE
    }
  })

  const [canEdit] = usePermission({
    resource: {
      resourceType: ResourceType.TEMPLATE
    },
    permissions: [PermissionIdentifier.EDIT_TEMPLATE]
  })

  const isTemplatesEnabled = templatesFeatureEnabled && canEdit && !pipeline?.template

  const isSaveEnabled = !isReadonly && isUpdated

  const { save } = useSaveAsTemplate({ data: pipeline, type: 'Pipeline', gitDetails })
  const { openPipelineErrorsModal } = usePipelineErrors()
  const navigateToLocation = (newPipelineId: string, updatedGitDetails?: SaveToGitFormInterface): void => {
    history.replace(
      toPipelineStudio({
        projectIdentifier,
        orgIdentifier,
        pipelineIdentifier: newPipelineId,
        accountId,
        module,
        repoIdentifier: defaultTo(updatedGitDetails?.repoIdentifier, repoIdentifier),
        branch: updatedGitDetails?.branch,
        ...(isPipelineRemote
          ? {
              repoName: updatedGitDetails?.repoName || repoName,
              connectorRef,
              storeType
            }
          : {})
      })
    )
  }

  const publishPipeline = async (newPipelineId: string, updatedGitDetails?: SaveToGitFormInterface) => {
    if (pipelineIdentifier === DefaultNewPipelineId) {
      await deletePipelineCache(gitDetails)

      showSuccess(getString('pipelines-studio.publishPipeline'))

      navigateToLocation(newPipelineId, updatedGitDetails)
      // note: without setTimeout does not redirect properly after save
      await fetchPipeline({ forceFetch: true, forceUpdate: true, newPipelineId })
    } else if (!updatedGitDetails || updatedGitDetails?.isNewBranch === false) {
      await fetchPipeline({ forceFetch: true, forceUpdate: true })
    }
    if (updatedGitDetails?.isNewBranch) {
      navigateToLocation(newPipelineId, updatedGitDetails)
      location.reload()
    }
  }

  const saveAndPublishPipeline = async (
    latestPipeline: PipelineInfoConfig,
    currStoreMetadata?: StoreMetadata,
    updatedGitDetails?: SaveToGitFormInterface,
    lastObject?: { lastObjectId?: string; lastCommitId?: string }
  ): Promise<UseSaveSuccessResponse> => {
    setLoading(true)
    setSchemaErrorView(false)
    const isEdit = pipelineIdentifier !== DefaultNewPipelineId
    const response = await savePipeline(
      {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        ...(currStoreMetadata?.storeType ? { storeType: currStoreMetadata?.storeType } : {}),
        ...(currStoreMetadata?.storeType === StoreType.REMOTE ? { connectorRef: currStoreMetadata?.connectorRef } : {}),
        ...(updatedGitDetails ?? {}),
        ...(lastObject ?? {}),
        ...(updatedGitDetails && currStoreMetadata?.storeType !== StoreType.REMOTE && updatedGitDetails?.isNewBranch
          ? { baseBranch: branch }
          : {})
      },
      omit(latestPipeline, 'repo', 'branch'),
      isEdit,
      !!OPA_PIPELINE_GOVERNANCE
    )
    setLoading(false)
    const newPipelineId = latestPipeline?.identifier

    if (response && response.status === 'SUCCESS') {
      const governanceData: GovernanceMetadata | undefined = get(response, 'data.governanceMetadata')
      setGovernanceMetadata({ ...governanceData, newPipelineId, updatedGitDetails })
      if (OPA_PIPELINE_GOVERNANCE && (governanceData?.status === 'error' || governanceData?.status === 'warning')) {
        showOPAErrorModal()
      }
      // Handling cache and page navigation only when Governance is disabled, or Governance Evaluation is successful
      // Otherwise, keep current pipeline editing states, and show Governance evaluation error
      if (
        governanceData?.status !== 'error' &&
        governanceData?.status !== 'warning' &&
        !isGitSyncEnabled &&
        storeMetadata?.storeType !== StoreType.REMOTE
      ) {
        // do not do this for git path, it will hide progress overlay
        // While saving pipeline in git, publishPipeline is done as next callback
        await publishPipeline(newPipelineId, updatedGitDetails)
      }
      if (isEdit) {
        trackEvent(isYaml ? PipelineActions.PipelineUpdatedViaYAML : PipelineActions.PipelineUpdatedViaVisual, {})
      } else {
        trackEvent(isYaml ? PipelineActions.PipelineCreatedViaYAML : PipelineActions.PipelineCreatedViaVisual, {})
      }
    } else {
      clear()
      setSchemaErrorView(true)
      if ((response as any)?.metadata?.schemaErrors?.length) {
        openPipelineErrorsModal((response as any)?.metadata?.schemaErrors)
        if (isGitSyncEnabled || currStoreMetadata?.storeType === StoreType.REMOTE) {
          // isGitSyncEnabled true
          throw { code: SCHEMA_VALIDATION_FAILED }
        }
      } else {
        if (isGitSyncEnabled || currStoreMetadata?.storeType === StoreType.REMOTE) {
          throw response
        } else if (!isEmpty((response as any)?.metadata?.errorNodeSummary)) {
          openTemplateErrorsModal({
            error: (response as any)?.metadata?.errorNodeSummary,
            originalYaml: yamlStringify(
              sanitize(
                { pipeline: latestPipeline },
                { removeEmptyArray: false, removeEmptyObject: false, removeEmptyString: false }
              )
            ),
            onSave: async (refreshedYaml: string) => {
              await saveAndPublishPipeline(
                (parse(refreshedYaml) as { pipeline: PipelineInfoConfig }).pipeline,
                storeMetadata
              )
            },
            isEdit
          })
        } else {
          showError(
            getRBACErrorMessage({ data: response as AccessControlCheckError }) || getString('errorWhileSaving'),
            undefined,
            'pipeline.save.pipeline.error'
          )
        }
      }
    }
    return { status: response?.status, nextCallback: () => publishPipeline(newPipelineId, updatedGitDetails) }
  }

  const saveAngPublishWithGitInfo = async (
    updatedGitDetails: SaveToGitFormInterface | SaveToGitFormV2Interface,
    payload?: SavePipelineObj,
    objectId?: string,
    commitId?: string
  ): Promise<UseSaveSuccessResponse> => {
    let latestPipeline: PipelineInfoConfig = payload?.pipeline || pipeline

    if (isYaml && yamlHandler) {
      try {
        latestPipeline =
          payload?.pipeline || (parse<Pipeline>(yamlHandler.getLatestYaml()).pipeline as PipelineInfoConfig)
      } /* istanbul ignore next */ catch (err) {
        showError(err.message || err, undefined, 'pipeline.save.gitinfo.error')
      }
    }

    const response = await saveAndPublishPipeline(
      latestPipeline,
      storeMetadata,
      {
        ...updatedGitDetails,
        repoName: gitDetails.repoName,
        filePath: isGitSyncEnabled ? updatedGitDetails.filePath : defaultTo(gitDetails.filePath, '')
      },
      pipelineIdentifier !== DefaultNewPipelineId ? { lastObjectId: objectId, lastCommitId: commitId } : {}
    )

    return {
      status: response?.status,
      nextCallback: response?.nextCallback || noop
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog<SavePipelineObj>({
    onSuccess: (
      gitData: SaveToGitFormV2Interface,
      payload?: SavePipelineObj,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> =>
      saveAngPublishWithGitInfo(gitData, payload, objectId || gitDetails?.objectId || '', gitDetails.commitId)
  })

  const saveAndPublish = React.useCallback(async () => {
    window.dispatchEvent(new CustomEvent('SAVE_PIPELINE_CLICKED'))

    let latestPipeline: PipelineInfoConfig = pipeline

    if (isYaml && yamlHandler) {
      if (!parse(yamlHandler.getLatestYaml())) {
        clear()
        showError(getString('invalidYamlText'))
        return
      }
      try {
        latestPipeline = parse<Pipeline>(yamlHandler.getLatestYaml()).pipeline as PipelineInfoConfig
      } /* istanbul ignore next */ catch (err) {
        showError(err.message || err, undefined, 'pipeline.save.pipeline.error')
      }
    }

    const ciCodeBaseConfigurationError = validateCICodebaseConfiguration({ pipeline: latestPipeline, getString })
    if (ciCodeBaseConfigurationError) {
      clear()
      showError(ciCodeBaseConfigurationError)
      return
    }

    // if Git sync enabled then display modal
    if (isGitSyncEnabled || storeMetadata?.storeType === 'REMOTE') {
      if ((storeMetadata?.storeType !== 'REMOTE' && isEmpty(gitDetails.repoIdentifier)) || isEmpty(gitDetails.branch)) {
        clear()
        showError(getString('pipeline.gitExperience.selectRepoBranch'))
        return
      }
      openSaveToGitDialog({
        isEditing: pipelineIdentifier !== DefaultNewPipelineId,
        resource: {
          type: 'Pipelines',
          name: latestPipeline.name,
          identifier: latestPipeline.identifier,
          gitDetails: gitDetails ?? {},
          storeMetadata: storeMetadata?.storeType ? storeMetadata : undefined
        },
        payload: { pipeline: omit(latestPipeline, 'repo', 'branch') }
      })
    } else {
      await saveAndPublishPipeline(latestPipeline, storeMetadata)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    deletePipelineCache,
    accountId,
    history,
    toPipelineStudio,
    projectIdentifier,
    orgIdentifier,
    pipeline,
    fetchPipeline,
    showError,
    pipelineIdentifier,
    isYaml,
    yamlHandler
  ])

  React.useImperativeHandle(
    ref,
    () => ({
      updatePipeline: async (pipelineYaml: string) => {
        await saveAndPublishPipeline((parse(pipelineYaml) as { pipeline: PipelineInfoConfig }).pipeline, storeMetadata)
      }
    }),
    [saveAndPublishPipeline, storeMetadata]
  )

  if (loading) {
    return (
      <Container padding={'medium'}>
        <Spinner size={Spinner.SIZE_SMALL} />
      </Container>
    )
  }

  if (!isTemplatesEnabled) {
    if (!isReadonly) {
      return (
        <Button
          variation={ButtonVariation.PRIMARY}
          text={getString('save')}
          onClick={saveAndPublish}
          icon="send-data"
          disabled={!isUpdated}
        />
      )
    } else {
      return <></>
    }
  }

  return (
    <SplitButton
      disabled={!isSaveEnabled}
      variation={ButtonVariation.PRIMARY}
      text={getString('save')}
      loading={loading}
      onClick={saveAndPublish}
    >
      <SplitButtonOption onClick={save} text={getString('common.saveAsTemplate')} />
    </SplitButton>
  )
}

export const SavePipelinePopoverWithRef = React.forwardRef(SavePipelinePopover)
