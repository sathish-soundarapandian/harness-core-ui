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
import { useToaster } from '@wings-software/uicore'
import { DefaultTemplate } from 'framework/Templates/templates'
import {
  ModalProps,
  Intent,
  TemplateConfigModalWithRef,
  TemplateConfigModalHandle
} from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import type { JsonNode } from 'services/cd-ng'
import type { SaveTemplateButtonProps } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { useStrings } from 'framework/strings'
import useTemplateErrors from '@pipeline/components/TemplateErrors/useTemplateErrors'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { sanitize } from '@common/utils/JSONUtils'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import css from './SaveAsTemplate.module.scss'

interface TemplateActionsReturnType {
  save: () => void
}

type SaveAsTemplateProps = Omit<SaveTemplateButtonProps, 'buttonProps'>

export function useSaveAsTemplate({ data, type, gitDetails }: SaveAsTemplateProps): TemplateActionsReturnType {
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const { getString } = useStrings()
  const templateConfigDialogHandler = useRef<TemplateConfigModalHandle>(null)
  const { saveAndPublish } = useSaveTemplate({ isTemplateStudio: false })
  const { openTemplateErrorsModal } = useTemplateErrors({ entity: TemplateErrorEntity.TEMPLATE })
  const { getRBACErrorMessage } = useRBACError()
  const { showError, clear } = useToaster()

  const [showConfigModal, hideConfigModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.configDialog}>
        {modalProps && (
          <TemplateConfigModalWithRef {...modalProps} onClose={hideConfigModal} ref={templateConfigDialogHandler} />
        )}
      </Dialog>
    ),
    [modalProps, templateConfigDialogHandler.current]
  )

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
        gitDetails,
        title: getString('common.template.saveAsNewTemplateHeading'),
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
