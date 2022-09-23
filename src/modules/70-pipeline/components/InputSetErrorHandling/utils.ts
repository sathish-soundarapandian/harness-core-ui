/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { MutateMethod } from 'restful-react'
import { defaultTo, get } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { useToaster } from '@harness/uicore'
import type { InputSetDTO, SaveInputSetDTO, StatusType } from '@pipeline/utils/types'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import type {
  EntityGitDetails,
  ResponseInputSetResponse,
  ResponseOverlayInputSetResponse,
  UpdateInputSetForPipelinePathParams,
  UpdateInputSetForPipelineQueryParams,
  UpdateOverlayInputSetForPipelinePathParams,
  UpdateOverlayInputSetForPipelineQueryParams
} from 'services/pipeline-ng'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { InputSetGitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { SaveToGitFormV2Interface } from '@common/components/SaveToGitFormV2/SaveToGitFormV2'
import { useStrings } from 'framework/strings'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { clearNullUndefined } from '@pipeline/utils/inputSetUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type {
  OverlayInputSetDTO,
  SaveOverlayInputSetDTO
} from '@pipeline/components/OverlayInputSetForm/OverlayInputSetForm'

type UpdateInpSetOrOverlayInpSetReturnType = Promise<{
  status?: StatusType
  nextCallback: () => void
}>

interface UseSaveInputSetOrOverlayInpSetReturnType {
  handleSubmit: (inputSetObj: InputSetDTO | OverlayInputSetDTO, storeMetadata?: StoreMetadata) => Promise<void>
}

interface InputSetInfo {
  updateInputSet: MutateMethod<
    ResponseInputSetResponse,
    string,
    UpdateInputSetForPipelineQueryParams,
    UpdateInputSetForPipelinePathParams
  >
  updateOverlayInputSet: MutateMethod<
    ResponseOverlayInputSetResponse,
    void,
    UpdateOverlayInputSetForPipelineQueryParams,
    UpdateOverlayInputSetForPipelinePathParams
  >
  inputSet: InputSetDTO | OverlayInputSetDTO
  _isOverlayInputSet: boolean
  refetch?: () => Promise<void>
  fromInputSetForm?: boolean
  hideForm?: () => void
  inpSetGitDetails?: EntityGitDetails
  onReconcile?: (identifier: string) => void
  refetchInputSets?: () => void
}

export function useSaveInputSetOrOverlayInpSet(inputSetInfo: InputSetInfo): UseSaveInputSetOrOverlayInpSetReturnType {
  const {
    updateInputSet,
    updateOverlayInputSet,
    inputSet,
    _isOverlayInputSet,
    refetch,
    fromInputSetForm,
    hideForm,
    inpSetGitDetails,
    onReconcile,
    refetchInputSets
  } = inputSetInfo
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const history = useHistory()
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)

  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch, repoName, connectorRef, storeType } = useQueryParams<InputSetGitQueryParams>()

  const [savedInputSetObj, setSavedInputSetObj] = React.useState<InputSetDTO | OverlayInputSetDTO>({})
  const [initialGitDetails, setInitialGitDetails] = React.useState<EntityGitDetails>({ repoIdentifier, branch })
  const [initialStoreMetadata, setInitialStoreMetadata] = React.useState<StoreMetadata>({
    repoName,
    branch,
    connectorRef,
    storeType
  })

  const isInline = !isGitSyncEnabled && initialStoreMetadata.storeType !== StoreType.REMOTE

  /* istanbul ignore next */ const handleReconcile = (): void => {
    if (initialStoreMetadata.storeType === StoreType.REMOTE) {
      onReconcile?.(get(inputSet, 'identifier', ''))
    }
    refetch?.()
    hideForm?.()
    refetchInputSets?.()
  }

  const updateInpSetOrOverlayInpSet = React.useCallback(
    async (
      inputSetObj: InputSetDTO | OverlayInputSetDTO,
      gitDetails?: SaveToGitFormInterface,
      objectId = ''
    ): UpdateInpSetOrOverlayInpSetReturnType => {
      let response: ResponseInputSetResponse | ResponseOverlayInputSetResponse | null = null
      try {
        /* istanbul ignore else */ if (inputSetObj.identifier) {
          if (_isOverlayInputSet) {
            response = await updateOverlayInputSet(
              yamlStringify({ overlayInputSet: clearNullUndefined(inputSetObj) }) as unknown as void,
              {
                pathParams: {
                  inputSetIdentifier: defaultTo(inputSetObj.identifier, '')
                },
                queryParams: {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  pipelineIdentifier: pipelineIdentifier ?? get(inputSet, 'pipelineIdentifier'),
                  projectIdentifier,
                  ...(isGitSyncEnabled
                    ? {
                        pipelineRepoID: repoIdentifier,
                        pipelineBranch: branch
                      }
                    : {}),
                  ...(initialStoreMetadata.storeType === StoreType.REMOTE ? initialStoreMetadata : {}),
                  ...(gitDetails
                    ? { ...gitDetails, lastObjectId: objectId, lastCommitId: initialGitDetails.commitId }
                    : {}),
                  ...(gitDetails && gitDetails.isNewBranch ? { baseBranch: initialGitDetails.branch } : {})
                }
              }
            )
          } else {
            response = await updateInputSet(yamlStringify({ inputSet: clearNullUndefined(inputSetObj) }), {
              pathParams: {
                inputSetIdentifier: defaultTo(inputSetObj.identifier, '')
              },
              queryParams: {
                accountIdentifier: accountId,
                orgIdentifier,
                pipelineIdentifier: pipelineIdentifier ?? get(inputSet, 'pipelineIdentifier'),
                projectIdentifier,
                ...(isGitSyncEnabled
                  ? {
                      pipelineRepoID: repoIdentifier,
                      pipelineBranch: branch
                    }
                  : {}),
                ...(initialStoreMetadata.storeType === StoreType.REMOTE ? initialStoreMetadata : {}),
                ...(gitDetails
                  ? { ...gitDetails, lastObjectId: objectId, lastCommitId: initialGitDetails.commitId }
                  : {}),
                ...(gitDetails && gitDetails.isNewBranch ? { baseBranch: initialGitDetails.branch } : {})
              }
            })
          }
          /* istanbul ignore else */ if (get(response, 'data') && isInline) refetch?.()
        } else {
          throw new Error(getString('common.validation.identifierIsRequired'))
        }
        showSuccess(
          _isOverlayInputSet
            ? getString('pipeline.inputSets.overlayISUpdated', { name: get(inputSet, 'name', '') })
            : getString('pipeline.inputSets.inputSetUpdated', { name: get(inputSet, 'name', '') })
        )
        /* istanbul ignore else */ if (isInline) {
          !!fromInputSetForm && history.goBack()
          hideForm?.()
          refetchInputSets?.()
        }
      } catch (e) {
        if (isInline) {
          showError(getRBACErrorMessage(e), undefined, 'pipeline.common.error')
        } else {
          throw e
        }
      }
      return {
        status: response?.status,
        nextCallback: /* istanbul ignore next */ () => (fromInputSetForm ? history.goBack() : handleReconcile())
      }
    },
    [
      _isOverlayInputSet,
      inputSet,
      isGitSyncEnabled,
      initialStoreMetadata,
      refetch,
      updateOverlayInputSet,
      accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch,
      initialGitDetails.commitId,
      initialGitDetails.branch,
      updateInputSet,
      fromInputSetForm,
      history,
      hideForm,
      refetchInputSets
    ]
  )

  const { openSaveToGitDialog } = useSaveToGitDialog<SaveInputSetDTO | SaveOverlayInputSetDTO>({
    onSuccess: (
      gitData: SaveToGitFormInterface & SaveToGitFormV2Interface,
      payload?: SaveInputSetDTO | SaveOverlayInputSetDTO,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> =>
      updateInpSetOrOverlayInpSet(
        defaultTo(
          _isOverlayInputSet
            ? (payload as SaveOverlayInputSetDTO)?.overlayInputSet
            : (payload as SaveInputSetDTO)?.inputSet,
          savedInputSetObj
        ),
        gitData,
        objectId
      )
  })

  const handleSubmit = React.useCallback(
    async (inputSetObj: InputSetDTO | OverlayInputSetDTO, storeMetadata?: StoreMetadata) => {
      const _gitDetails = fromInputSetForm ? get(inputSet, 'gitDetails') : inpSetGitDetails
      setSavedInputSetObj(inputSetObj)
      setInitialGitDetails(defaultTo(_gitDetails, {}))
      setInitialStoreMetadata(defaultTo(storeMetadata, {}))

      /* istanbul ignore else */ if (inputSetObj) {
        _isOverlayInputSet && delete inputSetObj.pipeline
        if (isGitSyncEnabled || get(storeMetadata, 'storeType') === StoreType.REMOTE) {
          openSaveToGitDialog({
            isEditing: true,
            resource: {
              type: 'InputSets',
              name: inputSetObj.name as string,
              identifier: inputSetObj.identifier as string,
              gitDetails: _gitDetails,
              storeMetadata: get(storeMetadata, 'storeType') === StoreType.REMOTE ? storeMetadata : undefined
            },
            payload: _isOverlayInputSet ? { overlayInputSet: inputSetObj } : { inputSet: inputSetObj }
          })
        } else {
          updateInpSetOrOverlayInpSet(inputSetObj)
        }
      }
    },
    [
      _isOverlayInputSet,
      isGitSyncEnabled,
      inputSet,
      updateInpSetOrOverlayInpSet,
      openSaveToGitDialog,
      inpSetGitDetails,
      fromInputSetForm
    ]
  )

  return {
    handleSubmit
  }
}
