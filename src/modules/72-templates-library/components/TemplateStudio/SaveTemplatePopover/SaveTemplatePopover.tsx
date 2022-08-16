/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Dialog } from '@blueprintjs/core'
import { parse } from 'yaml'
import { Button, ButtonVariation, useToaster } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { defaultTo, get, isEmpty, noop, unset } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikErrors } from 'formik'
import produce from 'immer'
import { String, useStrings } from 'framework/strings'
import type { ModulePathParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import {
  Fields,
  ModalProps,
  TemplateConfigModal,
  Intent
} from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import {
  TemplateMenuItem,
  TemplatesActionPopover
} from '@templates-library/components/TemplatesActionPopover/TemplatesActionPopover'
import { useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import type { EntityGitDetails, Failure } from 'services/template-ng'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from 'framework/Templates/templates'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import useCommentModal from '@common/hooks/CommentModal/useCommentModal'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import css from './SaveTemplatePopover.module.scss'

export interface GetErrorResponse extends Omit<Failure, 'errors'> {
  errors?: FormikErrors<unknown>
}
export interface SaveTemplatePopoverProps {
  getErrors: () => Promise<GetErrorResponse>
}

export function SaveTemplatePopover({ getErrors }: SaveTemplatePopoverProps): React.ReactElement {
  const {
    state: { template, originalTemplate, yamlHandler, gitDetails, isUpdated, stableVersion, lastPublishedVersion },
    setLoading,
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

  const [showConfigModal, hideConfigModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.configDialog}>
        {modalProps && <TemplateConfigModal {...modalProps} onClose={hideConfigModal} />}
      </Dialog>
    ),
    [modalProps]
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
    view,
    stableVersion
  })

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
        } catch (_err) {
          // do nothing as user has cancelled the save operation
        }
      })
    },
    [checkErrors, isGitSyncEnabled, template, stableVersion, saveAndPublish, gitDetails]
  )

  const onSave = React.useCallback(() => {
    onSubmit(false)
  }, [onSubmit])

  const onUpdate = React.useCallback(() => {
    onSubmit(true)
  }, [onSubmit])

  const onSaveAsNewLabel = React.useCallback(() => {
    checkErrors(() => {
      setModalProps({
        initialValues: produce(template, draft => {
          draft.versionLabel = DefaultNewVersionLabel
        }),
        promise: saveAndPublish,
        gitDetails,
        title: getString('templatesLibrary.saveAsNewLabelModal.heading'),
        intent: Intent.SAVE,
        disabledFields: [Fields.Name, Fields.Identifier, Fields.Description, Fields.Tags],
        lastPublishedVersion
      })
      showConfigModal()
    })
  }, [checkErrors, setModalProps, saveAndPublish, template, gitDetails])

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
        allowScopeChange: true
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
