/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useContext, useRef, useState } from 'react'
import * as Yup from 'yup'
import { defaultTo, isEmpty, isEqual, omit, pick, unset } from 'lodash-es'
import type { FormikProps } from 'formik'
import {
  Button,
  ButtonVariation,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Icon,
  Layout,
  Select,
  SelectOption,
  Text
} from '@wings-software/uicore'
import produce from 'immer'
import { Classes, Divider } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import classNames from 'classnames'
import { useParams } from 'react-router-dom'
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
import GitContextForm from '@common/components/GitContextForm/GitContextForm'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { IdentifierSchema, NameSchema, TemplateVersionLabelSchema } from '@common/utils/Validation'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getScopeFromDTO, getScopeLabelfromScope } from '@common/components/EntityReference/EntityReference'
import { GitSyncForm, gitSyncFormSchema } from '@gitsync/components/GitSyncForm/GitSyncForm'
import { CardInterface, InlineRemoteSelect } from '@common/components/InlineRemoteSelect/InlineRemoteSelect'
import { StoreMetadata, StoreType as GitStoreType } from '@common/constants/GitSyncTypes'
import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import { parse } from '@common/utils/YamlHelperMethods'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from '../templates'
import css from './TemplateConfigModal.module.scss'

export enum Fields {
  Name = 'name',
  Identifier = 'identifier',
  Description = 'description',
  Tags = 'tags',
  VersionLabel = 'versionLabel',
  Repo = 'repo',
  RepoName = 'repoName',
  Branch = 'branch',
  ConnectorRef = 'connectorRef',
  StoreType = 'storeType',
  FilePath = 'filePath'
}

export interface PromiseExtraArgs {
  isEdit?: boolean
  updatedGitDetails?: EntityGitDetails
  comment?: string
  storeMetadata?: StoreMetadata
  disableCreatingNewBranch?: boolean
}

export enum Intent {
  START = 'Start',
  EDIT = 'Edit',
  SAVE = 'SAVE'
}

export interface ModalProps {
  initialValues: NGTemplateInfoConfig
  promise: (values: NGTemplateInfoConfig, extraInfo: PromiseExtraArgs) => Promise<UseSaveSuccessResponse>
  gitDetails?: EntityGitDetails
  storeMetadata?: StoreMetadata
  title: string
  intent: Intent
  disabledFields?: Fields[]
  allowScopeChange?: boolean
  lastPublishedVersion?: string
  disableCreatingNewBranch?: boolean
  onFailure?: (error: any, latestTemplate: NGTemplateInfoConfig) => void
}

export interface TemplateConfigValues extends NGTemplateInfoConfigWithGitDetails {
  comment?: string
}

export interface NGTemplateInfoConfigWithGitDetails extends NGTemplateInfoConfig {
  connectorRef?: string
  repo?: string
  branch?: string
  storeType?: 'INLINE' | 'REMOTE'
  filePath?: string
}

export interface ConfigModalProps extends ModalProps {
  onClose: () => void
}

interface BasicDetailsInterface extends ConfigModalProps {
  setPreviewValues: Dispatch<SetStateAction<NGTemplateInfoConfigWithGitDetails>>
}

export type TemplateConfigModalHandle = {
  updateTemplate: (templateYaml: string) => Promise<void>
}

export type BasicTemplateDetailsHandle = {
  updateTemplate: (templateYaml: string) => Promise<void>
}

const BasicTemplateDetails = (
  props: BasicDetailsInterface,
  ref: React.ForwardedRef<BasicTemplateDetailsHandle>
): JSX.Element => {
  const { getString } = useStrings()

  const {
    initialValues,
    setPreviewValues,
    onClose,
    gitDetails,
    storeMetadata,
    allowScopeChange = false,
    title,
    intent,
    disabledFields = [],
    promise,
    lastPublishedVersion,
    onFailure,
    disableCreatingNewBranch
  } = props
  const pathParams = useParams<TemplateStudioPathProps>()
  const { orgIdentifier, projectIdentifier } = pathParams
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingTemplatesGitx
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const formName = `create${initialValues.type}Template`
  const [loading, setLoading] = React.useState<boolean>()
  const { isReadonly } = useContext(TemplateContext)
  const scope = getScopeFromDTO(pathParams)
  const [selectedScope, setSelectedScope] = React.useState<Scope>(scope)
  const allowedScopes = templateFactory.getTemplateAllowedScopes(initialValues.type)
  const formikRef = useRef<FormikProps<TemplateConfigValues>>()
  const scopeOptions = React.useMemo(
    () =>
      (allowedScopes || []).map(item => ({
        value: item,
        label: getScopeLabelfromScope(item, getString)
      })),
    [allowedScopes]
  )

  const cardDisabledStatus = React.useMemo(
    () =>
      intent === Intent.EDIT ||
      !!disabledFields?.includes(Fields.StoreType) ||
      !templateFactory.getTemplateIsRemoteEnabled(initialValues.type),
    [initialValues.type, intent, disabledFields]
  )

  const gitDisabledFields = pick(
    disabledFields?.reduce((fields: Record<string, boolean>, field: string) => {
      fields[field] = true
      return fields
    }, {}),
    Fields.ConnectorRef,
    Fields.RepoName,
    Fields.Branch,
    Fields.FilePath
  )

  React.useImperativeHandle(
    ref,
    () => ({
      updateTemplate: async (templateYaml: string) => {
        const template = (parse(templateYaml) as { template: NGTemplateInfoConfig })?.template
        formikRef.current?.setFieldValue('spec', template.spec)
        await formikRef.current?.submitForm()
      }
    }),
    [formikRef.current]
  )

  const formInitialValues = React.useMemo(
    () =>
      produce(initialValues as TemplateConfigValues, draft => {
        if (isEqual(initialValues.identifier, DefaultNewTemplateId)) {
          unset(draft, 'identifier')
        }
        if (isEqual(initialValues.versionLabel, DefaultNewVersionLabel)) {
          unset(draft, 'versionLabel')
        }

        if (isGitSyncEnabled) {
          draft.repo = gitDetails?.repoIdentifier
          draft.branch = gitDetails?.branch
        } else if (supportingTemplatesGitx) {
          draft.connectorRef = defaultTo(storeMetadata?.connectorRef, '')
          draft.repo = defaultTo(storeMetadata?.repoName, '')
          draft.branch = defaultTo(storeMetadata?.branch, '')
          draft.storeType = defaultTo(storeMetadata?.storeType, GitStoreType.INLINE)
          draft.filePath = intent === Intent.SAVE ? '' : defaultTo(storeMetadata?.filePath, '')
        }
      }),
    [initialValues, storeMetadata, gitDetails]
  )

  const submitButtonLabel = React.useMemo(() => {
    if (intent === Intent.EDIT) {
      return getString('continue')
    } else {
      if (intent === Intent.START) {
        return getString('start')
      } else {
        if (isGitSyncEnabled && getScopeFromDTO(formikRef.current?.values || {}) === Scope.PROJECT) {
          return getString('continue')
        } else {
          return getString('save')
        }
      }
    }
  }, [intent, isGitSyncEnabled, formikRef.current])

  const onSubmit = React.useCallback(
    (values: TemplateConfigValues) => {
      setLoading(true)
      const storeMetadataValues = {
        storeType: values.storeType,
        connectorRef:
          typeof values.connectorRef === 'string'
            ? values.connectorRef
            : (values.connectorRef as unknown as ConnectorSelectedValue)?.value,
        repoName: values.repo,
        branch: values.branch,
        filePath: values.filePath
      }

      const updateTemplate = omit(values, 'repo', 'branch', 'comment', 'connectorRef', 'storeType', 'filePath')
      promise(updateTemplate, {
        isEdit: intent === Intent.EDIT,
        disableCreatingNewBranch,
        ...(!isEmpty(values.repo) && {
          updatedGitDetails: { ...gitDetails, repoIdentifier: values.repo, branch: values.branch }
        }),
        ...(supportingTemplatesGitx ? { storeMetadata: storeMetadataValues } : {}),
        ...(!isEmpty(values.comment?.trim()) && { comment: values.comment?.trim() })
      })
        .then(response => {
          setLoading(false)
          if (response && response.status === 'SUCCESS') {
            onClose()
          } else {
            throw response
          }
        })
        .catch(error => {
          setLoading(false)
          onFailure?.(error, updateTemplate)
        })
    },
    [setLoading, promise, gitDetails, onClose]
  )

  const onScopeChange = ({ value }: SelectOption) => {
    setSelectedScope(value as Scope)
    formikRef.current?.setValues(
      produce(formikRef.current?.values, draft => {
        draft.projectIdentifier = value === Scope.PROJECT ? projectIdentifier : undefined
        draft.orgIdentifier = value === Scope.ACCOUNT ? undefined : orgIdentifier
        if (isGitSyncEnabled) {
          if (value === Scope.PROJECT) {
            draft.repo = gitDetails?.repoIdentifier
            draft.branch = gitDetails?.branch
          } else {
            unset(draft, 'repo')
            unset(draft, 'branch')
          }
        }
      })
    )
  }

  const onInlineRemoteChange = (item: CardInterface): void => {
    formikRef.current?.setValues(
      produce(formikRef.current?.values, draft => {
        draft.storeType = item.type as GitStoreType
        if (item.type === GitStoreType.INLINE) {
          unset(draft, 'connectorRef')
          unset(draft, 'repo')
          unset(draft, 'branch')
          unset(draft, 'filePath')
        } else {
          Object.assign(draft, pick(formInitialValues, 'connectorRef', 'repo', 'branch', 'filePath'))
        }
      })
    )
    if (item.type === GitStoreType.REMOTE) {
      setTimeout(() => {
        const elem = document.getElementsByClassName(css.gitFormWrapper)[0]
        elem?.scrollTo(0, elem.scrollHeight)
      }, 0)
    }
  }

  React.useEffect(() => {
    setPreviewValues(formInitialValues)
  }, [formInitialValues])

  const gitxValidationSchema = supportingTemplatesGitx ? gitSyncFormSchema(getString) : {}
  const gitsyncValidationSchema =
    isGitSyncEnabled && selectedScope === Scope.PROJECT
      ? {
          repo: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
          branch: Yup.string().trim().required(getString('common.git.validation.branchRequired'))
        }
      : {}

  return (
    <Container
      width={'55%'}
      className={classNames(css.basicDetails, {
        [css.gitBasicDetails]: supportingTemplatesGitx
      })}
      background={Color.FORM_BG}
      padding={'huge'}
    >
      {loading && <PageSpinner />}
      <Text
        color={Color.GREY_800}
        font={{ weight: 'bold', size: 'medium' }}
        margin={{ bottom: 'xlarge', left: 0, right: 0 }}
      >
        {defaultTo(title, '')}
      </Text>
      <Formik<TemplateConfigValues>
        initialValues={formInitialValues}
        onSubmit={onSubmit}
        validate={setPreviewValues}
        formName={formName}
        validationSchema={Yup.object().shape({
          name: NameSchema({
            requiredErrorMsg: getString('common.validation.fieldIsRequired', {
              name: getString('templatesLibrary.createNewModal.nameError')
            })
          }),
          identifier: IdentifierSchema(),
          versionLabel: TemplateVersionLabelSchema(),
          ...gitxValidationSchema,
          ...gitsyncValidationSchema
        })}
      >
        {(formik: FormikProps<TemplateConfigValues>) => {
          formikRef.current = formik
          return (
            <FormikForm>
              <Layout.Vertical spacing={'huge'}>
                <Container className={css.gitFormWrapper}>
                  <Layout.Vertical spacing={'small'}>
                    <Container>
                      <Layout.Vertical>
                        <NameIdDescriptionTags
                          tooltipProps={{ dataTooltipId: formName }}
                          formikProps={formik}
                          identifierProps={{
                            isIdentifierEditable: !disabledFields.includes(Fields.Identifier) && !isReadonly,
                            inputGroupProps: {
                              disabled: disabledFields.includes(Fields.Name) || isReadonly,
                              placeholder: getString('templatesLibrary.createNewModal.namePlaceholder', {
                                entity: templateFactory.getTemplateLabel(formik.values.type)
                              })
                            }
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
                          label={getString('common.versionLabel')}
                          disabled={disabledFields.includes(Fields.VersionLabel) || isReadonly}
                          className={css.gitFormFieldWidth}
                        />
                        {lastPublishedVersion && (
                          <Container
                            border={{ radius: 4, color: Color.BLUE_100 }}
                            background={Color.BLUE_100}
                            flex={{ alignItems: 'center' }}
                            padding={'small'}
                            margin={{ bottom: 'medium' }}
                            className={css.gitFormFieldWidth}
                          >
                            <Layout.Horizontal spacing="small" flex={{ justifyContent: 'start' }} width={'100%'}>
                              <Icon name="info-messaging" size={18} />
                              <Text
                                color={Color.BLACK}
                                font={{ weight: 'semi-bold', size: 'small' }}
                                className={css.lastPublishedVersionLabel}
                              >
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
                        {allowScopeChange && scope === Scope.PROJECT && (
                          <Container className={Classes.FORM_GROUP} width={160} margin={{ bottom: 'medium' }}>
                            <label className={Classes.LABEL}>
                              {getString('templatesLibrary.templateSettingsModal.scopeLabel')}
                            </label>
                            <Select
                              value={scopeOptions.find(item => item.value === getScopeFromDTO(formik.values))}
                              items={scopeOptions}
                              onChange={onScopeChange}
                            />
                          </Container>
                        )}
                        {intent === Intent.SAVE &&
                          (!isGitSyncEnabled || isEmpty(formik.values.repo)) &&
                          (!supportingTemplatesGitx || formik.values?.storeType === GitStoreType.INLINE) && (
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
                    {supportingTemplatesGitx && (
                      <>
                        <Divider />
                        <Text font={{ variation: FontVariation.H6 }} className={css.choosePipelineSetupHeader}>
                          {getString('templatesLibrary.chooseTemplateSetupHeader')}
                        </Text>
                        <InlineRemoteSelect
                          entityType={'Template'}
                          className={css.inlineRemoteWrapper}
                          selected={defaultTo(formik.values?.storeType, GitStoreType.INLINE)}
                          onChange={onInlineRemoteChange}
                          getCardDisabledStatus={() => cardDisabledStatus}
                        />
                        {formik.values?.storeType === GitStoreType.REMOTE && (
                          <GitSyncForm
                            formikProps={formik}
                            isEdit={intent === Intent.EDIT}
                            initialValues={formInitialValues}
                            entityScope={getScopeFromDTO(formik.values)}
                            disableFields={gitDisabledFields}
                          />
                        )}
                      </>
                    )}
                    {isGitSyncEnabled && isEmpty(gitDetails) && getScopeFromDTO(formik.values) === Scope.PROJECT && (
                      <GitSyncStoreProvider>
                        <GitContextForm formikProps={formik as any} />
                      </GitSyncStoreProvider>
                    )}
                  </Layout.Vertical>
                </Container>
                <Container>
                  <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                    <RbacButton
                      text={submitButtonLabel}
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

export const BasicTemplateDetailsWithRef = React.forwardRef(BasicTemplateDetails)

const TemplateConfigModal = (
  props: ConfigModalProps,
  ref: React.ForwardedRef<TemplateConfigModalHandle>
): JSX.Element => {
  const { initialValues, ...rest } = props
  const [previewValues, setPreviewValues] = useState<NGTemplateInfoConfigWithGitDetails>({
    ...initialValues,
    repo: defaultTo(rest.gitDetails?.repoName, rest.gitDetails?.repoIdentifier),
    branch: rest.gitDetails?.branch
  })
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const basicTemplateDetailsHandle = React.useRef<BasicTemplateDetailsHandle>(null)

  React.useImperativeHandle(
    ref,
    () => ({
      updateTemplate: async (templateYaml: string) => {
        await basicTemplateDetailsHandle.current?.updateTemplate(templateYaml)
      }
    }),
    [basicTemplateDetailsHandle.current]
  )

  const content = (
    <Layout.Horizontal>
      <BasicTemplateDetailsWithRef
        initialValues={initialValues}
        setPreviewValues={setPreviewValues}
        ref={basicTemplateDetailsHandle}
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

export const TemplateConfigModalWithRef = React.forwardRef(TemplateConfigModal)
