/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep, defaultTo, isEmpty, omit } from 'lodash-es'
import { useParams } from 'react-router-dom'
import {
  createTemplatePromise,
  EntityGitDetails,
  NGTemplateInfoConfig,
  TemplateSummaryResponse,
  updateExistingTemplateVersionPromise
} from 'services/template-ng'
import type { GitData } from '@common/modals/GitDiffEditor/useGitDiffEditorDialog'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { sanitize } from '@common/utils/JSONUtils'
import type { GitQueryParams, ModulePathParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { PromiseExtraArgs } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import { SaveTemplateAsType, StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

export interface FetchTemplateUnboundProps {
  forceFetch?: boolean
  forceUpdate?: boolean
  signal?: AbortSignal
  repoIdentifier?: string
  branch?: string
}

declare global {
  interface WindowEventMap {
    TEMPLATE_SAVED: CustomEvent<TemplateSummaryResponse>
  }
}

interface SaveTemplateObj {
  template: NGTemplateInfoConfig
}

interface LastRemoteObjectId {
  lastObjectId?: string
  lastCommitId?: string
}

interface UseSaveTemplateReturnType {
  saveAndPublish: (
    updatedTemplate: NGTemplateInfoConfig,
    extraInfo: PromiseExtraArgs
  ) => Promise<UseSaveSuccessResponse>
}

export interface TemplateContextMetadata {
  onSuccessCallback: (
    latestTemplate: TemplateSummaryResponse,
    updatedGitDetails?: SaveToGitFormInterface,
    updatedStoreMetadata?: StoreMetadata,
    saveAsType?: SaveTemplateAsType.NEW_LABEL_VERSION | SaveTemplateAsType.NEW_TEMPALTE
  ) => Promise<void>
}

export function useSaveTemplate({ onSuccessCallback }: TemplateContextMetadata): UseSaveTemplateReturnType {
  const { templateIdentifier, projectIdentifier, orgIdentifier, accountId } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { branch } = useQueryParams<GitQueryParams>()

  const stringifyTemplate = React.useCallback(
    // Important to sanitize the final template to avoid sending null values as it fails schema validation
    (temp: NGTemplateInfoConfig) =>
      yamlStringify({
        template: sanitize(temp, {
          removeEmptyString: false,
          removeEmptyObject: false,
          removeEmptyArray: false
        })
      }),
    []
  )

  const updateExistingLabel = async (
    latestTemplate: NGTemplateInfoConfig,
    comments?: string,
    updatedGitDetails?: SaveToGitFormInterface,
    lastObject?: LastRemoteObjectId,
    storeMetadata?: StoreMetadata,
    saveAsType?: SaveTemplateAsType.NEW_LABEL_VERSION | SaveTemplateAsType.NEW_TEMPALTE
  ): Promise<UseSaveSuccessResponse> => {
    const response = await updateExistingTemplateVersionPromise({
      templateIdentifier: latestTemplate.identifier,
      versionLabel: latestTemplate.versionLabel,
      body: stringifyTemplate(latestTemplate),
      queryParams: {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        comments,
        ...(updatedGitDetails ?? {}),
        ...(lastObject ?? {}),
        ...(storeMetadata?.storeType === StoreType.REMOTE ? storeMetadata : {}),
        ...(updatedGitDetails && updatedGitDetails.isNewBranch
          ? { baseBranch: defaultTo(branch, storeMetadata?.branch), branch: updatedGitDetails.branch }
          : {})
      },
      requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
    })
    if (response && response.status === 'SUCCESS') {
      const isInlineTemplate = isEmpty(updatedGitDetails) && storeMetadata?.storeType !== StoreType.REMOTE
      if (isInlineTemplate) {
        onSuccessCallback(latestTemplate, updatedGitDetails, storeMetadata, saveAsType)
      }
      return {
        status: response.status,
        nextCallback: () => {
          onSuccessCallback(latestTemplate, updatedGitDetails, storeMetadata, saveAsType)
        }
      }
    } else {
      throw response
    }
  }

  const saveAndPublishTemplate = async (
    latestTemplate: NGTemplateInfoConfig,
    comments?: string,
    isEdit = false,
    updatedGitDetails?: SaveToGitFormInterface,
    lastObject?: LastRemoteObjectId,
    storeMetadata?: StoreMetadata,
    saveAsType?: SaveTemplateAsType.NEW_LABEL_VERSION | SaveTemplateAsType.NEW_TEMPALTE,
    saveAsNewVersionOfExistingTemplate?: boolean,
    isGitSyncOrRemoteTemplate?: boolean
  ): Promise<UseSaveSuccessResponse> => {
    if (isEdit) {
      return updateExistingLabel(latestTemplate, comments, updatedGitDetails, lastObject, storeMetadata, saveAsType)
    } else {
      const isNewTemplateIdentifierCreation =
        saveAsType !== SaveTemplateAsType.NEW_LABEL_VERSION &&
        !saveAsNewVersionOfExistingTemplate &&
        !isGitSyncOrRemoteTemplate
      const response = await createTemplatePromise({
        body: stringifyTemplate(omit(cloneDeep(latestTemplate), 'repo', 'branch')),
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier: latestTemplate.projectIdentifier,
          orgIdentifier: latestTemplate.orgIdentifier,
          comments,
          ...(isNewTemplateIdentifierCreation ? { isNewTemplate: true } : {}),
          ...(updatedGitDetails ?? {}),
          ...(storeMetadata?.storeType === StoreType.REMOTE ? storeMetadata : {}),
          ...(updatedGitDetails && updatedGitDetails.isNewBranch
            ? { baseBranch: defaultTo(branch, storeMetadata?.branch), branch: updatedGitDetails.branch }
            : {})
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      })
      if (response && response.status === 'SUCCESS') {
        const createdTemplate = response.data?.templateResponseDTO as TemplateSummaryResponse
        const isInlineTemplate = isEmpty(updatedGitDetails) && storeMetadata?.storeType !== StoreType.REMOTE
        if (isInlineTemplate) {
          onSuccessCallback(createdTemplate, updatedGitDetails, storeMetadata, saveAsType)
        }

        return {
          status: response.status,
          nextCallback: () => {
            onSuccessCallback(createdTemplate, updatedGitDetails, storeMetadata, saveAsType)
          }
        }
      } else {
        throw response
      }
    }
  }

  const saveAndPublishWithGitInfo = async (
    updatedGitDetails: SaveToGitFormInterface,
    payload?: SaveTemplateObj,
    objectId?: string,
    isEdit = false,
    lastCommitId = '',
    storeMetadata?: StoreMetadata
  ): Promise<UseSaveSuccessResponse> => {
    const response = await saveAndPublishTemplate(
      payload?.template as NGTemplateInfoConfig,
      '',
      isEdit,
      omit(updatedGitDetails, 'name', 'identifier'),
      templateIdentifier !== DefaultNewTemplateId ? { lastObjectId: objectId, lastCommitId } : {},
      storeMetadata,
      undefined,
      undefined,
      true
    )
    return response
  }

  const { openSaveToGitDialog } = useSaveToGitDialog<SaveTemplateObj>({
    onSuccess: (
      gitData: GitData,
      payload?: SaveTemplateObj,
      objectId?: string,
      isEdit = false,
      storeMetadata?: StoreMetadata
    ): Promise<UseSaveSuccessResponse> =>
      saveAndPublishWithGitInfo(
        gitData,
        payload,
        defaultTo(objectId, ''),
        isEdit,
        gitData?.resolvedConflictCommitId || gitData?.lastCommitId,
        storeMetadata
      )
  })

  const getUpdatedGitDetails = (
    currGitDetails: EntityGitDetails,
    latestTemplate: NGTemplateInfoConfig,
    isEdit: boolean | undefined = false
  ): EntityGitDetails => ({
    ...currGitDetails,
    ...(!isEdit && {
      filePath: `${defaultTo(latestTemplate.identifier, '')}_${defaultTo(latestTemplate.versionLabel, '').replace(
        /[^a-zA-Z0-9-_]/g,
        ''
      )}.yaml`
    })
  })

  const saveAndPublish = async (
    updatedTemplate: NGTemplateInfoConfig,
    extraInfo: PromiseExtraArgs
  ): Promise<UseSaveSuccessResponse> => {
    const {
      isEdit,
      comment,
      updatedGitDetails,
      storeMetadata,
      disableCreatingNewBranch,
      saveAsType,
      saveAsNewVersionOfExistingTemplate
    } = extraInfo

    const isGitSyncOrRemoteTemplate =
      (isGitSyncEnabled && !isEmpty(updatedGitDetails)) || storeMetadata?.storeType === StoreType.REMOTE

    // if Git sync enabled then display modal
    if (isGitSyncOrRemoteTemplate) {
      openSaveToGitDialog({
        isEditing: defaultTo(isEdit, false),
        disableCreatingNewBranch,
        resource: {
          type: 'Template',
          name: updatedTemplate.name,
          identifier: updatedTemplate.identifier,
          gitDetails: getUpdatedGitDetails(updatedGitDetails!, updatedTemplate, isEdit),
          storeMetadata
        },
        payload: { template: omit(updatedTemplate, 'repo', 'branch') }
      })
      return Promise.resolve({ status: 'SUCCESS' })
    }

    return saveAndPublishTemplate(
      updatedTemplate,
      comment,
      isEdit,
      undefined,
      undefined,
      undefined,
      saveAsType,
      saveAsNewVersionOfExistingTemplate,
      isGitSyncOrRemoteTemplate
    )
  }

  return {
    saveAndPublish
  }
}
