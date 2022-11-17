/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { useModalHook } from '@harness/use-modal'
import produce from 'immer'
import { isEmpty, omit } from 'lodash-es'
import { Dialog } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import classNames from 'classnames'
import { useToaster } from '@harness/uicore'
import { DefaultTemplate } from 'framework/Templates/templates'
import {
  ModalProps,
  Intent,
  TemplateConfigModalWithRef,
  TemplateConfigModalHandle,
  Fields
} from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import type { JsonNode } from 'services/cd-ng'
import type { SaveTemplateButtonProps } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { useStrings } from 'framework/strings'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import useTemplateErrors from '@pipeline/components/TemplateErrors/useTemplateErrors'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { sanitize } from '@common/utils/JSONUtils'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import { StoreMetadata, StoreType } from '@common/constants/GitSyncTypes'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import css from './SaveAsTemplate.module.scss'

interface TemplateActionsReturnType {
  save: () => void
}

type SaveAsTemplateProps = Omit<SaveTemplateButtonProps, 'buttonProps'>

export function useSaveAsTemplate({
  data,
  type,
  gitDetails,
  storeMetadata
}: SaveAsTemplateProps): TemplateActionsReturnType {
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const { supportingTemplatesGitx } = React.useContext(AppStoreContext)
  const { showSuccess, showError, clear } = useToaster()
  const { getString } = useStrings()
  const templateConfigDialogHandler = useRef<TemplateConfigModalHandle>(null)
  const { openTemplateErrorsModal } = useTemplateErrors({ entity: TemplateErrorEntity.TEMPLATE })
  const { getRBACErrorMessage } = useRBACError()

  const [showConfigModal, hideConfigModal] = useModalHook(
    () => (
      <Dialog
        enforceFocus={false}
        isOpen={true}
        className={classNames(css.configDialog, {
          [css.gitConfigDialog]: supportingTemplatesGitx
        })}
      >
        {modalProps && (
          <TemplateConfigModalWithRef {...modalProps} onClose={hideConfigModal} ref={templateConfigDialogHandler} />
        )}
      </Dialog>
    ),
    [modalProps, templateConfigDialogHandler.current]
  )

  const { saveAndPublish } = useSaveTemplate({
    onSuccessCallback: async (
      latestTemplate: NGTemplateInfoConfig,
      updatedGitDetails?: SaveToGitFormInterface,
      updatedStoreMetadata?: StoreMetadata
    ) => {
      window.dispatchEvent(new CustomEvent('TEMPLATE_SAVED', { detail: latestTemplate }))
      const isInlineTemplate = isEmpty(updatedGitDetails) && updatedStoreMetadata?.storeType !== StoreType.REMOTE
      if (isInlineTemplate) {
        clear()
        showSuccess(getString('common.template.saveTemplate.publishTemplate'))
      }
    }
  })

  const onFailure = (error: any, latestTemplate: NGTemplateInfoConfig) => {
    if (!isEmpty((error as any)?.metadata?.errorNodeSummary)) {
      openTemplateErrorsModal({
        error: (error as any)?.metadata?.errorNodeSummary,
        originalYaml: yamlStringify(
          sanitize(
            { template: latestTemplate },
            { removeEmptyArray: false, removeEmptyObject: false, removeEmptyString: false }
          )
        ),
        onSave: async (refreshedYaml: string) => {
          await templateConfigDialogHandler.current?.updateTemplate(refreshedYaml)
        },
        isEdit: false
      })
    } else {
      clear()
      showError(getRBACErrorMessage(error), undefined, 'template.save.template.error')
    }
  }

  const onSaveAsTemplate = async () => {
    try {
      const finalData = typeof data === 'function' ? await data() : data
      setModalProps({
        initialValues: produce(DefaultTemplate, draft => {
          draft.projectIdentifier = projectIdentifier
          draft.orgIdentifier = orgIdentifier
          draft.type = type
          draft.spec = omit(
            finalData,
            'name',
            'identifier',
            'description',
            'tags',
            'orgIdentifier',
            'projectIdentifier'
          ) as JsonNode
        }),
        promise: saveAndPublish,
        storeMetadata,
        gitDetails,
        title: getString('common.template.saveAsNewTemplateHeading'),
        disabledFields:
          storeMetadata?.storeType === StoreType.REMOTE ? [Fields.Branch, Fields.ConnectorRef, Fields.RepoName] : [],
        disableCreatingNewBranch: storeMetadata?.storeType === StoreType.REMOTE,
        allowScopeChange: true,
        intent: Intent.SAVE,
        onFailure
      })
      showConfigModal()
    } catch (_error) {
      //Do not do anything as there are error in the form
    }
  }

  return { save: onSaveAsTemplate }
}
