/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { MutateMethod } from 'restful-react'
import { defaultTo } from 'lodash-es'
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
}

export function useSaveInputSetOrOverlayInpSet(inputSetInfo: InputSetInfo): UseSaveInputSetOrOverlayInpSetReturnType {
  const { updateInputSet, updateOverlayInputSet, inputSet, _isOverlayInputSet, refetch, fromInputSetForm } =
    inputSetInfo
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

  const updateInpSetOrOverlayInpSet = React.useCallback(
    async (
      inputSetObj: InputSetDTO | OverlayInputSetDTO,
      gitDetails?: SaveToGitFormInterface,
      objectId = ''
    ): UpdateInpSetOrOverlayInpSetReturnType => {
      let response: ResponseInputSetResponse | ResponseOverlayInputSetResponse | null = null
      try {
        if (inputSetObj.identifier) {
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
                  pipelineIdentifier,
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
                pipelineIdentifier,
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
          response?.data && refetch?.()
        } else {
          throw new Error(getString('common.validation.identifierIsRequired'))
        }
        if (!isGitSyncEnabled && initialStoreMetadata.storeType !== StoreType.REMOTE) {
          showSuccess('Input Set Updated')
          !!fromInputSetForm && history.goBack()
        }
      } catch (e) {
        if (!isGitSyncEnabled && initialStoreMetadata.storeType !== StoreType.REMOTE) {
          showError(getRBACErrorMessage(e), undefined, 'pipeline.update.create.inputset')
        } else {
          throw e
        }
      }
      return {
        status: response?.status,
        nextCallback: () => history.goBack()
      }
    },
    [
      accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      repoIdentifier,
      branch,
      updateOverlayInputSet,
      updateInputSet,
      initialGitDetails,
      getString,
      history,
      _isOverlayInputSet,
      isGitSyncEnabled,
      showSuccess,
      showError,
      initialStoreMetadata,
      getRBACErrorMessage,
      refetch,
      fromInputSetForm
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
      setSavedInputSetObj(inputSetObj)
      setInitialGitDetails(defaultTo(inputSet?.gitDetails, {}))
      setInitialStoreMetadata(defaultTo(storeMetadata, {}))

      if (inputSetObj) {
        _isOverlayInputSet && delete inputSetObj.pipeline
        if (isGitSyncEnabled || storeMetadata?.storeType === StoreType.REMOTE) {
          openSaveToGitDialog({
            isEditing: true,
            resource: {
              type: 'InputSets',
              name: inputSetObj.name as string,
              identifier: inputSetObj.identifier as string,
              gitDetails: inputSet?.gitDetails,
              storeMetadata: storeMetadata?.storeType === StoreType.REMOTE ? storeMetadata : undefined
            },
            payload: _isOverlayInputSet ? { overlayInputSet: inputSetObj } : { inputSet: inputSetObj }
          })
        } else {
          updateInpSetOrOverlayInpSet(inputSetObj)
        }
      }
    },
    [_isOverlayInputSet, isGitSyncEnabled, inputSet, updateInpSetOrOverlayInpSet, openSaveToGitDialog]
  )

  return {
    handleSubmit
  }
}
