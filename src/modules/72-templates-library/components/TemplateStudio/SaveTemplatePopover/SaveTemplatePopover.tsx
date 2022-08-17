/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Dialog, Spinner } from '@blueprintjs/core'
import { parse } from 'yaml'
import { Button, ButtonVariation, useToaster } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { defaultTo, get, isEmpty, noop, unset } from 'lodash-es'
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
import {
  TemplateMenuItem,
  TemplatesActionPopover
} from '@templates-library/components/TemplatesActionPopover/TemplatesActionPopover'
import { useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import type { EntityGitDetails, Failure, NGTemplateInfoConfig } from 'services/template-ng'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from 'framework/Templates/templates'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import useCommentModal from '@common/hooks/CommentModal/useCommentModal'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { sanitize } from '@common/utils/JSONUtils'
import useTemplateErrors from '@pipeline/components/TemplateErrors/useTemplateErrors'
import { TemplateErrorEntity } from '@pipeline/components/TemplateLibraryErrorHandling/ReconcileDialog/ReconcileDialog'
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
    state: { template, originalTemplate, yamlHandler, gitDetails, isUpdated, stableVersion, lastPublishedVersion },
    fetchTemplate,
    deleteTemplateCache,
    view,
    isReadonly,
    updateTemplate
  } = React.useContext(TemplateContext)
  const { getString } = useStrings()
  const { templateIdentifier } = useParams<TemplateStudioPathProps & ModulePathParams>()
  const [modalProps, setModalProps] = React.useState<ModalProps>()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const { getComments } = useCommentModal()
  const { showError, clear } = useToaster()
  const { openTemplateErrorsModal } = useTemplateErrors({ entity: TemplateErrorEntity.TEMPLATE })
  const [loading, setLoading] = React.useState<boolean>()
  const templateConfigModalHandler = React.useRef<TemplateConfigModalHandle>(null)

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
    setLoading,
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

  React.useImperativeHandle(
    ref,
    () => ({
      updateTemplate: async (templateYaml: string) => {
        await saveAndPublish(parse(templateYaml).template, {
          isEdit: templateIdentifier !== DefaultNewTemplateId,
          comment: 'Reconciling template'
        })
      }
    }),
    [saveAndPublish, templateIdentifier]
  )

  const checkErrors = React.useCallback(
    (callback: () => void) => {
      const yamlValidationErrorMap = yamlHandler?.getYAMLValidationErrorMap()
      const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), '')
      if (yamlHandler && (!parse(latestYaml) || (yamlValidationErrorMap && yamlValidationErrorMap.size > 0))) {
        clear()
        showError(getString('invalidYamlText'))
        return
      }
      getErrors().then(response => {
        if (response.status === 'SUCCESS' && isEmpty(response.errors)) {
          callback()
        }
      })
    },
    [getErrors, yamlHandler]
  )

  const onSubmit = React.useCallback(
    (isEdit: boolean) => {
      checkErrors(async () => {
        try {
          const comment = !isGitSyncEnabled
            ? await getComments(
                getString('templatesLibrary.commentModal.heading', {
                  name: getTemplateNameWithLabel(template)
                }),
                isEdit ? (
                  <String
                    stringID="templatesLibrary.commentModal.info"
                    vars={{
                      name: getTemplateNameWithLabel(template)
                    }}
                    useRichText={true}
                  />
                ) : undefined
              )
            : ''
          await saveAndPublish(template, { isEdit, comment, updatedGitDetails: gitDetails })
        } catch (error) {
          if (!isEmpty((error as any)?.metadata?.errorNodeSummary)) {
            openTemplateErrorsModal({
              error: (error as any)?.metadata?.errorNodeSummary,
              originalYaml: yamlStringify(
                sanitize({ template }, { removeEmptyArray: false, removeEmptyObject: false, removeEmptyString: false })
              ),
              onSave: async (refreshedYaml: string) => {
                const refreshedTemplate = (parse(refreshedYaml) as { template: NGTemplateInfoConfig }).template
                await saveAndPublish(refreshedTemplate, {
                  isEdit,
                  comment: 'Reconciling template',
                  updatedGitDetails: gitDetails
                })
              }
            })
          }
        }
      })
    },
    [checkErrors, isGitSyncEnabled, template, stableVersion, saveAndPublish, gitDetails, openTemplateErrorsModal]
  )

  const onSave = React.useCallback(() => {
    onSubmit(false)
  }, [onSubmit])

  const onUpdate = React.useCallback(() => {
    onSubmit(true)
  }, [onSubmit])

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
          templateConfigModalHandler.current?.updateTemplate(refreshedYaml)
        }
      })
    }
  }

  const onSaveAsNewLabel = () => {
    checkErrors(() => {
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
        onFailure
      })
      showConfigModal()
    })
  }

  const onSaveAsNewTemplate = () => {
    checkErrors(() => {
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
        onFailure
      })
      showConfigModal()
    })
  }

  const saveOptions = React.useMemo(
    (): TemplateMenuItem[] =>
      templateIdentifier === DefaultNewTemplateId
        ? [
            {
              label: getString('save'),
              disabled:
                isEmpty(get(template.spec, 'type')) &&
                template.type !== TemplateType.Pipeline &&
                template.type !== TemplateType.SecretManager,

              onClick: onSave
            }
          ]
        : [
            {
              label: getString('save'),
              disabled: !isUpdated || isReadonly,
              onClick: onUpdate
            },
            {
              label: getString('templatesLibrary.saveAsNewLabelModal.heading'),
              onClick: onSaveAsNewLabel,
              disabled: isReadonly
            },
            {
              label: getString('common.template.saveAsNewTemplateHeading'),
              onClick: onSaveAsNewTemplate,
              disabled: isReadonly
            }
          ],
    [templateIdentifier, template, onSave, isUpdated, isReadonly, onUpdate, onSaveAsNewLabel, onSaveAsNewTemplate]
  )

  const disabled = React.useMemo(() => (saveOptions || []).filter(item => !item.disabled).length === 0, [saveOptions])

  React.useEffect(() => {
    setMenuOpen(false)
  }, [isUpdated])

  if (loading) {
    return (
      <Container padding={{ right: 'large', left: 'large' }}>
        <Spinner size={24} />
      </Container>
    )
  }

  return (
    <TemplatesActionPopover
      open={menuOpen && saveOptions.length > 1}
      disabled={disabled}
      items={saveOptions}
      setMenuOpen={setMenuOpen}
      minimal={true}
    >
      <Button
        disabled={disabled}
        variation={ButtonVariation.PRIMARY}
        rightIcon={saveOptions.length > 1 ? 'chevron-down' : undefined}
        text={getString('save')}
        onClick={saveOptions.length === 1 ? () => saveOptions[0].onClick() : noop}
        icon="send-data"
      />
    </TemplatesActionPopover>
  )
}

export const SaveTemplatePopoverWithRef = React.forwardRef(SaveTemplatePopover)
