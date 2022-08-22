/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Dialog, Spinner } from '@blueprintjs/core'
import { parse } from 'yaml'
import { Button, ButtonVariation, SplitButton, SplitButtonOption, useToaster } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { isEmpty, unset } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikErrors } from 'formik'
import produce from 'immer'
import { Container } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import type { ModulePathParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import {
  Fields,
  ModalProps,
  Intent,
  TemplateConfigModalWithRef,
  TemplateConfigModalHandle
} from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import type { EntityGitDetails, Failure, NGTemplateInfoConfig } from 'services/template-ng'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from 'framework/Templates/templates'
import useCommentModal from '@common/hooks/CommentModal/useCommentModal'
import { getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { sanitize } from '@common/utils/JSONUtils'
import useTemplateErrors from '@pipeline/components/TemplateErrors/useTemplateErrors'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/utils'
import { getErrorsList } from '@pipeline/utils/errorUtils'
import css from './SaveTemplatePopover.module.scss'

export interface GetErrorResponse extends Omit<Failure, 'errors'> {
  errors?: FormikErrors<unknown>
}

export interface SaveTemplatePopoverProps {
  getErrors: () => Promise<GetErrorResponse>
}

export type SaveTemplateHandle = {
  updateTemplate: (templateYaml: string) => Promise<void>
}

function SaveTemplatePopover(
  { getErrors }: SaveTemplatePopoverProps,
  ref: React.ForwardedRef<SaveTemplateHandle>
): React.ReactElement {
  const {
    state: { template, originalTemplate, yamlHandler, gitDetails, isUpdated, lastPublishedVersion },
    fetchTemplate,
    deleteTemplateCache,
    view,
    isReadonly,
    updateTemplate
  } = React.useContext(TemplateContext)
  const { getString } = useStrings()
  const { templateIdentifier } = useParams<TemplateStudioPathProps & ModulePathParams>()
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const { getComments } = useCommentModal()
  const { showError, clear } = useToaster()
  const { openTemplateErrorsModal } = useTemplateErrors({ entity: TemplateErrorEntity.TEMPLATE })
  const [loading, setLoading] = React.useState<boolean>()
  const templateConfigModalHandler = React.useRef<TemplateConfigModalHandle>(null)
  const { getRBACErrorMessage } = useRBACError()

  const [showConfigModal, hideConfigModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.configDialog}>
        {modalProps && (
          <TemplateConfigModalWithRef {...modalProps} onClose={hideConfigModal} ref={templateConfigModalHandler} />
        )}
      </Dialog>
    ),
    [modalProps, templateConfigModalHandler.current]
  )

  const { saveAndPublish } = useSaveTemplate({
    yamlHandler,
    fetchTemplate,
    deleteTemplateCache: async (details?: EntityGitDetails) => {
      if (templateIdentifier === DefaultNewTemplateId) {
        await updateTemplate(
          produce(originalTemplate, draft => {
            unset(draft, 'type')
          })
        )
      } else {
        await updateTemplate(originalTemplate)
      }
      await deleteTemplateCache(details)
    },
    view
  })

  const triggerSave = async (latestTemplate: NGTemplateInfoConfig, comment?: string) => {
    try {
      if (isEmpty(gitDetails)) {
        setLoading(true)
      }
      await saveAndPublish(latestTemplate, {
        isEdit: templateIdentifier !== DefaultNewTemplateId,
        comment,
        updatedGitDetails: gitDetails
      })
    } catch (error) {
      onError(error, comment)
    } finally {
      if (isEmpty(gitDetails)) {
        setLoading(false)
      }
    }
  }

  const onError = (error: any, comment?: string) => {
    if (!isEmpty((error as any)?.metadata?.errorNodeSummary)) {
      const isEdit = templateIdentifier !== DefaultNewTemplateId
      openTemplateErrorsModal({
        error: (error as any)?.metadata?.errorNodeSummary,
        originalYaml: yamlStringify(
          sanitize({ template }, { removeEmptyArray: false, removeEmptyObject: false, removeEmptyString: false })
        ),
        onSave: async (refreshedYaml: string) => {
          const refreshedTemplate = (parse(refreshedYaml) as { template: NGTemplateInfoConfig }).template
          await saveAndPublish(refreshedTemplate, {
            isEdit,
            comment,
            updatedGitDetails: gitDetails
          })
        },
        isEdit
      })
    } else {
      clear()
      showError(getRBACErrorMessage(error), undefined, 'template.save.template.error')
    }
  }

  React.useImperativeHandle(
    ref,
    () => ({
      updateTemplate: async (templateYaml: string) => {
        await triggerSave(parse(templateYaml).template, 'Reconciling template')
      }
    }),
    [triggerSave]
  )

  const checkErrors = async (): Promise<void> => {
    if (isEmpty(yamlHandler?.getYAMLValidationErrorMap())) {
      const response = await getErrors()
      if (response.status === 'SUCCESS' && !isEmpty(response.errors)) {
        throw `${getErrorsList(response.errors).errorStrings.length} error(s) found`
      }
    } else {
      throw getString('invalidYamlText')
    }
  }

  const getComment = (): Promise<string | undefined> => {
    if (!isEmpty(gitDetails)) {
      return Promise.resolve(undefined)
    }
    const templateName = getTemplateNameWithLabel(template)
    return getComments(
      getString('templatesLibrary.commentModal.heading', {
        name: templateName
      }),
      templateIdentifier !== DefaultNewTemplateId ? (
        <String
          stringID="templatesLibrary.commentModal.info"
          vars={{
            name: templateName
          }}
          useRichText={true}
        />
      ) : undefined
    )
  }

  const onSave = async () => {
    try {
      await checkErrors()
      try {
        const comment = await getComment()
        await triggerSave(template, comment)
      } catch (_error) {
        // User cancelled save operation
        return
      }
    } catch (error) {
      clear()
      showError(error)
    }
  }

  const onSaveAsNewFailure = (error: any, latestTemplate: NGTemplateInfoConfig) => {
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
          templateConfigModalHandler.current?.updateTemplate(refreshedYaml)
        },
        isEdit: false
      })
    } else {
      clear()
      showError(getRBACErrorMessage(error), undefined, 'template.save.template.error')
    }
  }

  const onSaveAsNewLabel = async () => {
    try {
      await checkErrors()
      setModalProps({
        initialValues: produce(template, draft => {
          draft.versionLabel = DefaultNewVersionLabel
        }),
        promise: saveAndPublish,
        gitDetails,
        title: getString('templatesLibrary.saveAsNewLabelModal.heading'),
        intent: Intent.SAVE,
        disabledFields: [Fields.Name, Fields.Identifier],
        lastPublishedVersion,
        onFailure: onSaveAsNewFailure
      })
      showConfigModal()
    } catch (error) {
      clear()
      showError(error)
    }
  }

  const onSaveAsNewTemplate = async () => {
    try {
      await checkErrors()
      setModalProps({
        initialValues: produce(template, draft => {
          draft.name = ''
          draft.identifier = DefaultNewTemplateId
          draft.versionLabel = DefaultNewVersionLabel
        }),
        promise: saveAndPublish,
        title: getString('common.template.saveAsNewTemplateHeading'),
        intent: Intent.SAVE,
        allowScopeChange: true,
        onFailure: onSaveAsNewFailure
      })
      showConfigModal()
    } catch (error) {
      clear()
      showError(error)
    }
  }

  if (loading) {
    return (
      <Container padding={{ right: 'large', left: 'large' }}>
        <Spinner size={24} />
      </Container>
    )
  }

  if (templateIdentifier === DefaultNewTemplateId) {
    return <Button variation={ButtonVariation.PRIMARY} text={getString('save')} onClick={onSave} icon="send-data" />
  }

  return (
    <SplitButton
      disabled={!isUpdated || isReadonly}
      variation={ButtonVariation.PRIMARY}
      text={getString('save')}
      onClick={onSave}
      icon="send-data"
    >
      <SplitButtonOption
        onClick={onSaveAsNewLabel}
        text={getString('templatesLibrary.saveAsNewLabelModal.heading')}
        disabled={isReadonly}
      />
      <SplitButtonOption
        onClick={onSaveAsNewTemplate}
        text={getString('common.template.saveAsNewTemplateHeading')}
        disabled={isReadonly}
      />
    </SplitButton>
  )
}

export const SaveTemplatePopoverWithRef = React.forwardRef(SaveTemplatePopover)
