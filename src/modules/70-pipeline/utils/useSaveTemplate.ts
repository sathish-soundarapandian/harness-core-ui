/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { cloneDeep, defaultTo, isEmpty, omit } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { VisualYamlSelectedView as SelectedView } from '@wings-software/uicore'
import {
  createTemplatePromise,
  EntityGitDetails,
  NGTemplateInfoConfig,
  TemplateSummaryResponse,
  updateExistingTemplateVersionPromise
} from 'services/template-ng'
import { useStrings } from 'framework/strings'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { useToaster } from '@common/exports'
import type { GitData } from '@common/modals/GitDiffEditor/useGitDiffEditorDialog'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import { parse, yamlStringify } from '@common/utils/YamlHelperMethods'
import { sanitize } from '@common/utils/JSONUtils'
import routes from '@common/RouteDefinitions'
import type { GitQueryParams, ModulePathParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { PromiseExtraArgs } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { Pipeline } from './types'

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
  yamlHandler?: YamlBuilderHandlerBinding
  fetchTemplate?: (args: FetchTemplateUnboundProps) => Promise<void>
  deleteTemplateCache?: (gitDetails?: EntityGitDetails) => Promise<void>
  view?: string
  isTemplateStudio?: boolean
}

export function useSaveTemplate(TemplateContextMetadata: TemplateContextMetadata): UseSaveTemplateReturnType {
  const { yamlHandler, fetchTemplate, deleteTemplateCache, view, isTemplateStudio = true } = TemplateContextMetadata
  const { templateIdentifier, templateType, projectIdentifier, orgIdentifier, accountId, module } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const history = useHistory()
  const isYaml = view === SelectedView.YAML

  const navigateToLocation = useCallback(
    (newTemplate: NGTemplateInfoConfig, updatedGitDetails?: SaveToGitFormInterface): void => {
      history.replace(
        routes.toTemplateStudio({
          projectIdentifier: newTemplate.projectIdentifier,
          orgIdentifier: newTemplate.orgIdentifier,
          accountId,
          ...(!isEmpty(newTemplate.projectIdentifier) && { module }),
          templateType: templateType,
          templateIdentifier: newTemplate.identifier,
          versionLabel: newTemplate.versionLabel,
          repoIdentifier: updatedGitDetails?.repoIdentifier,
          branch: updatedGitDetails?.branch
        })
      )
    },
    [accountId, history, module, templateType]
  )

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

  const publishTemplate = async (
    latestTemplate: NGTemplateInfoConfig,
    updatedGitDetails?: SaveToGitFormInterface
  ): Promise<void> => {
    // If new template creation
    if (templateIdentifier === DefaultNewTemplateId) {
      await deleteTemplateCache?.(updatedGitDetails)

      navigateToLocation(latestTemplate, updatedGitDetails)
    } else {
      // Update template in existing branch
      if (updatedGitDetails?.isNewBranch === false) {
        await fetchTemplate?.({ forceFetch: true, forceUpdate: true })
      } else {
        // Update template in new branch
        navigateToLocation(latestTemplate, updatedGitDetails)
      }
    }
  }

  const updateExistingLabel = async (
    latestTemplate: NGTemplateInfoConfig,
    comments?: string,
    updatedGitDetails?: SaveToGitFormInterface,
    lastObject?: LastRemoteObjectId,
    storeMetadata?: StoreMetadata
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
        clear()
        showSuccess(getString('common.template.updateTemplate.templateUpdated'))
        await fetchTemplate?.({ forceFetch: true, forceUpdate: true })
      }

      return {
        status: response.status,
        nextCallback: () => {
          publishTemplate(latestTemplate, updatedGitDetails)
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
    storeMetadata?: StoreMetadata
  ): Promise<UseSaveSuccessResponse> => {
    if (isEdit) {
      return updateExistingLabel(latestTemplate, comments, updatedGitDetails, lastObject, storeMetadata)
    } else {
      const response = await createTemplatePromise({
        body: stringifyTemplate(omit(cloneDeep(latestTemplate), 'repo', 'branch')),
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier: latestTemplate.projectIdentifier,
          orgIdentifier: latestTemplate.orgIdentifier,
          comments,
          ...(updatedGitDetails ?? {}),
          ...(storeMetadata?.storeType === StoreType.REMOTE ? storeMetadata : {}),
          ...(updatedGitDetails && updatedGitDetails.isNewBranch
            ? { baseBranch: defaultTo(branch, storeMetadata?.branch), branch: updatedGitDetails.branch }
            : {})
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      })
      if (response && response.status === 'SUCCESS') {
        if (!isTemplateStudio && response.data?.templateResponseDTO) {
          window.dispatchEvent(new CustomEvent('TEMPLATE_SAVED', { detail: response.data.templateResponseDTO }))
        }

        const isInlineTemplate = isEmpty(updatedGitDetails) && storeMetadata?.storeType !== StoreType.REMOTE
        if (isInlineTemplate) {
          clear()
          showSuccess(getString('common.template.saveTemplate.publishTemplate'))
          await deleteTemplateCache?.()
          if (isTemplateStudio) {
            navigateToLocation(latestTemplate, updatedGitDetails)
          }
        }

        return {
          status: response.status,
          nextCallback: () => {
            publishTemplate(latestTemplate, updatedGitDetails)
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
    let latestTemplate = payload?.template as NGTemplateInfoConfig

    if (isYaml && yamlHandler) {
      try {
        latestTemplate =
          payload?.template || (parse<Pipeline>(yamlHandler.getLatestYaml()).pipeline as NGTemplateInfoConfig)
      } /* istanbul ignore next */ catch (err) {
        showError(getRBACErrorMessage(err as RBACError), undefined, 'template.save.gitinfo.error')
      }
    }

    const response = await saveAndPublishTemplate(
      latestTemplate,
      '',
      isEdit,
      omit(updatedGitDetails, 'name', 'identifier'),
      templateIdentifier !== DefaultNewTemplateId ? { lastObjectId: objectId, lastCommitId } : {},
      storeMetadata
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
    const { isEdit, comment, updatedGitDetails, storeMetadata, disableCreatingNewBranch } = extraInfo

    // if Git sync enabled then display modal
    if ((isGitSyncEnabled && !isEmpty(updatedGitDetails)) || storeMetadata?.storeType === StoreType.REMOTE) {
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

    return saveAndPublishTemplate(updatedTemplate, comment, isEdit)
  }

  return {
    saveAndPublish
  }
}
