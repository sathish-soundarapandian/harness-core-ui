/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, useState, SetStateAction, useContext } from 'react'
import * as Yup from 'yup'
import { isEmpty, omit, defaultTo } from 'lodash-es'
import type { FormikProps } from 'formik'
import {
  Formik,
  Layout,
  FormikForm,
  FormInput,
  Text,
  Button,
  ButtonVariation,
  Container,
  Icon
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { EntityGitDetails, NGTemplateInfoConfig } from 'services/template-ng'
import { TemplatePreview } from '@templates-library/components/TemplatePreview/TemplatePreview'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { PageSpinner } from '@common/components'
import type { UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import GitContextForm, { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { regexVersionLabel } from '@common/utils/StringUtils'
import type { Error } from 'services/cd-ng'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from '../templates'
import css from './TemplateConfigModal.module.scss'

export enum Fields {
  Name = 'name',
  Identifier = 'identifier',
  Description = 'description',
  Tags = 'tags',
  VersionLabel = 'versionLabel',
  Repo = 'repo',
  Branch = 'branch'
}

export interface PromiseExtraArgs {
  isEdit?: boolean
  updatedGitDetails?: EntityGitDetails
  comment?: string
}

export interface ModalProps {
  title: string
  disabledFields?: Fields[]
  emptyFields?: Fields[]
  shouldGetComment?: boolean
  promise: (values: NGTemplateInfoConfig, extraInfo: PromiseExtraArgs) => Promise<UseSaveSuccessResponse>
  onSuccess?: (values: NGTemplateInfoConfig) => void
  onFailure?: (error: Error) => void
  lastPublishedVersion?: string
}

export interface TemplateConfigValues extends NGTemplateInfoConfigWithGitDetails {
  comment: string
}

export interface NGTemplateInfoConfigWithGitDetails extends NGTemplateInfoConfig {
  repo: string
  branch: string
}

export interface ConfigModalProps {
  initialValues: NGTemplateInfoConfigWithGitDetails
  onClose: () => void
  modalProps: ModalProps
  showGitFields?: boolean
  gitDetails?: IGitContextFormProps
}

interface BasicDetailsInterface extends ConfigModalProps {
  setPreviewValues: Dispatch<SetStateAction<NGTemplateInfoConfigWithGitDetails>>
}

const MAX_VERSION_LABEL_LENGTH = 63

const BasicTemplateDetails = (props: BasicDetailsInterface): JSX.Element => {
  const { initialValues, setPreviewValues, onClose, modalProps, showGitFields, gitDetails } = props
  const {
    title,
    disabledFields = [],
    shouldGetComment = false,
    promise,
    onSuccess,
    onFailure,
    lastPublishedVersion
  } = modalProps
  const { getString } = useStrings()
  const [isEdit, setIsEdit] = React.useState<boolean>()
  const { isGitSyncEnabled } = useAppStore()
  const currentTemplateType = initialValues.type
  const formName = `create${currentTemplateType}Template`
  const [loading, setLoading] = React.useState<boolean>()
  const { isReadonly } = useContext(TemplateContext)

  React.useEffect(() => {
    const edit = initialValues.identifier !== DefaultNewTemplateId
    setIsEdit(edit)
  }, [initialValues])

  const onSubmit = React.useCallback((values: TemplateConfigValues) => {
    setLoading(true)
    const formGitDetails =
      values.repo && values.repo.trim().length > 0 ? { repoIdentifier: values.repo, branch: values.branch } : undefined
    const comment = values.comment.trim()
    promise(omit(values, 'repo', 'branch', 'comment'), {
      isEdit: false,
      updatedGitDetails: formGitDetails,
      ...(comment.length > 0 && { comment: values.comment })
    })
      .then(response => {
        setLoading(false)
        if (response && response.status === 'SUCCESS') {
          onSuccess?.(values)
          onClose()
        } else {
          throw response
        }
      })
      .catch(error => {
        setLoading(false)
        onFailure?.(error)
      })
  }, [])

  const getSaveButtonText = React.useCallback((): string => {
    if (isEdit) {
      if (isGitSyncEnabled) {
        return getString('continue')
      }
      return getString('save')
    }
    return getString('start')
  }, [isEdit, isGitSyncEnabled, getString])

  const versionLabelText = getString('templatesLibrary.createNewModal.versionLabel')

  return (
    <Container width={'55%'} className={css.basicDetails} background={Color.FORM_BG} padding={'huge'}>
      {loading && <PageSpinner />}
      <Text
        color={Color.GREY_800}
        font={{ weight: 'bold', size: 'medium' }}
        margin={{ bottom: 'xlarge', left: 0, right: 0 }}
      >
        {defaultTo(title, '')}
      </Text>
      <Formik<TemplateConfigValues>
        initialValues={{ ...initialValues, comment: '' }}
        onSubmit={onSubmit}
        validate={values => setPreviewValues(values)}
        formName={formName}
        enableReinitialize={true}
        validationSchema={Yup.object().shape({
          name: NameSchema({
            requiredErrorMsg: getString('common.validation.fieldIsRequired', {
              name: getString('templatesLibrary.createNewModal.nameError')
            })
          }),
          identifier: IdentifierSchema(),
          versionLabel: Yup.string()
            .trim()
            .required(
              getString('common.validation.fieldIsRequired', {
                name: versionLabelText
              })
            )
            .matches(
              regexVersionLabel,
              getString('common.validation.fieldMustStartWithAlphanumericAndCanNotHaveSpace', {
                name: versionLabelText
              })
            )
            .max(
              MAX_VERSION_LABEL_LENGTH,
              getString('common.validation.fieldCannotbeLongerThanN', {
                name: versionLabelText,
                n: MAX_VERSION_LABEL_LENGTH
              })
            ),
          ...(isGitSyncEnabled && showGitFields
            ? {
                repo: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
                branch: Yup.string().trim().required(getString('common.git.validation.branchRequired'))
              }
            : {})
        })}
      >
        {(formik: FormikProps<TemplateConfigValues>) => {
          return (
            <FormikForm>
              <Layout.Vertical spacing={'huge'}>
                <Container>
                  <Layout.Vertical spacing={'small'}>
                    <Container>
                      <Layout.Vertical>
                        <NameIdDescriptionTags
                          tooltipProps={{ dataTooltipId: formName }}
                          formikProps={formik}
                          identifierProps={{
                            isIdentifierEditable: !disabledFields.includes(Fields.Identifier) && !isReadonly,
                            inputGroupProps: { disabled: disabledFields.includes(Fields.Name) || isReadonly }
                          }}
                          className={css.nameIdDescriptionTags}
                          descriptionProps={{
                            disabled: disabledFields.includes(Fields.Description) || isReadonly
                          }}
                          tagsProps={{
                            disabled: disabledFields.includes(Fields.Tags) || isReadonly
                          }}
                        />
                        <FormInput.Text
                          name="versionLabel"
                          placeholder={getString('templatesLibrary.createNewModal.versionPlaceholder')}
                          label={versionLabelText}
                          disabled={disabledFields.includes(Fields.VersionLabel) || isReadonly}
                        />
                        {lastPublishedVersion && (
                          <Container
                            border={{ radius: 4, color: Color.BLUE_100 }}
                            background={Color.BLUE_100}
                            flex={{ alignItems: 'center' }}
                            padding={'small'}
                            margin={{ bottom: 'medium' }}
                          >
                            <Layout.Horizontal spacing="small" flex={{ justifyContent: 'start' }}>
                              <Icon name="info-messaging" size={18} />
                              <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'small' }}>
                                {getString('templatesLibrary.createNewModal.lastPublishedVersion')}
                              </Text>
                              <Text
                                lineClamp={1}
                                color={Color.BLACK}
                                font={{ size: 'small' }}
                                margin={{ left: 'none' }}
                              >
                                {lastPublishedVersion}
                              </Text>
                            </Layout.Horizontal>
                          </Container>
                        )}
                        {shouldGetComment && (
                          <FormInput.TextArea
                            name="comment"
                            label={getString('optionalField', {
                              name: getString('common.commentModal.commentLabel')
                            })}
                            textArea={{
                              className: css.comment
                            }}
                          />
                        )}
                      </Layout.Vertical>
                    </Container>
                    {isGitSyncEnabled && showGitFields && (
                      <GitSyncStoreProvider>
                        <GitContextForm formikProps={formik as any} gitDetails={gitDetails} />
                      </GitSyncStoreProvider>
                    )}
                  </Layout.Vertical>
                </Container>
                <Container>
                  <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                    <RbacButton
                      text={getSaveButtonText()}
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      permission={{
                        permission: PermissionIdentifier.EDIT_TEMPLATE,
                        resource: {
                          resourceType: ResourceType.TEMPLATE
                        }
                      }}
                    />
                    <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onClose} />
                  </Layout.Horizontal>
                </Container>
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export const TemplateConfigModal = (props: ConfigModalProps): JSX.Element => {
  const { initialValues, modalProps, ...rest } = props
  const { emptyFields = [] } = modalProps
  const [previewValues, setPreviewValues] = useState(props.initialValues)
  const [formInitialValues, setFormInitialValues] = React.useState(initialValues)
  const { isGitSyncEnabled } = useAppStore()
  const { getString } = useStrings()

  React.useEffect(() => {
    const newInitialValues = {
      ...initialValues,
      ...((emptyFields.includes(Fields.Name) || isEmpty(initialValues.name)) && {
        name: getString('templatesLibrary.createNewModal.namePlaceholder', { entity: initialValues.type })
      }),
      ...((emptyFields.includes(Fields.Identifier) || initialValues.identifier === DefaultNewTemplateId) && {
        identifier: getString('templatesLibrary.createNewModal.identifierPlaceholder', {
          entity: initialValues.type.toLowerCase()
        })
      }),
      ...((emptyFields.includes(Fields.VersionLabel) || initialValues.versionLabel === DefaultNewVersionLabel) && {
        versionLabel: undefined
      }),
      ...(emptyFields.includes(Fields.Description) && { description: undefined }),
      ...(emptyFields.includes(Fields.Tags) && { tags: undefined }),
      ...(emptyFields.includes(Fields.Repo) && { repo: undefined }),
      ...(emptyFields.includes(Fields.Branch) && { branch: undefined })
    }
    setFormInitialValues(newInitialValues)
  }, [initialValues, JSON.stringify(emptyFields)])

  React.useEffect(() => {
    setPreviewValues(formInitialValues)
  }, [formInitialValues])

  const content = (
    <Layout.Horizontal>
      <BasicTemplateDetails
        initialValues={formInitialValues}
        modalProps={modalProps}
        setPreviewValues={setPreviewValues}
        {...rest}
      />
      <TemplatePreview previewValues={previewValues} />
      <Button
        className={css.closeIcon}
        iconProps={{ size: 24, color: Color.GREY_500 }}
        icon="cross"
        variation={ButtonVariation.ICON}
        onClick={props.onClose}
      />
    </Layout.Horizontal>
  )
  return isGitSyncEnabled ? <GitSyncStoreProvider>{content}</GitSyncStoreProvider> : content
}
