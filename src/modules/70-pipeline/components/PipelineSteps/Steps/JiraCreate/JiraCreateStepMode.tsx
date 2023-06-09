/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { isEmpty, get, defaultTo, isEqual } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Dialog, Intent } from '@blueprintjs/core'
import cx from 'classnames'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import {
  Accordion,
  FormError,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  PageSpinner,
  Text
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  JiraFieldNG,
  JiraProjectBasicNG,
  JiraProjectNG,
  useGetJiraIssueCreateMetadata,
  useGetJiraProjects
} from 'services/cd-ng'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { JiraKVFieldsRenderer } from '@pipeline/components/PipelineSteps/Steps/JiraCreate/JiraKVFieldsRenderer'
import { useQueryParams, useDeepCompareEffect } from '@common/hooks'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { JiraProjectSelectOption } from '../JiraApproval/types'
import { getGenuineValue, setIssueTypeOptions } from '../JiraApproval/helper'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { JiraDynamicFieldsSelector } from './JiraDynamicFieldsSelector'
import type {
  JiraCreateData,
  JiraCreateFieldType,
  JiraCreateFormContentInterface,
  JiraCreateStepModeProps,
  JiraFieldNGWithValue
} from './types'
import {
  addSelectedOptionalFields,
  getInitialValueForSelectedField,
  getIsCurrentFieldASelectedOptionalField,
  getKVFieldsToBeAddedInForm,
  getProcessedValueForNonKVField,
  isRuntimeOrExpressionType,
  processFormData,
  resetForm
} from './helper'
import {
  JiraFieldsRenderer,
  shouldShowTextField,
  shouldShowMultiSelectField,
  shouldShowMultiTypeField
} from './JiraFieldsRenderer'
import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './JiraCreate.module.scss'

const getUnsupportedRequiredFields = (requiredFields: JiraFieldNGWithValue[]): JiraFieldNGWithValue[] => {
  return requiredFields.filter(
    (field: JiraFieldNGWithValue) =>
      !(
        shouldShowTextField(field) ||
        shouldShowMultiSelectField(field) ||
        shouldShowMultiTypeField(field) ||
        field.name === 'Description'
      )
  )
}

function FormContent({
  formik,
  refetchProjects,
  refetchProjectMetadata,
  refetchIssueMetadata,
  issueMetaResponse,
  projectsResponse,
  projectMetadataFetchError,
  projectsFetchError,
  projectMetaResponse,
  fetchingProjects,
  fetchingProjectMetadata,
  isNewStep,
  allowableTypes,
  stepViewType,
  readonly
}: JiraCreateFormContentInterface): JSX.Element {
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [projectOptions, setProjectOptions] = useState<JiraProjectSelectOption[]>([])
  const [projectMetadata, setProjectMetadata] = useState<JiraProjectNG>()
  const [issueMetadata, setIssueMetadata] = useState<JiraProjectNG>()
  const [unsupportedRequiredFields, setUnsupportedRequiredFields] = useState<JiraFieldNGWithValue[]>([])
  const [count, setCount] = React.useState(0)
  const [connectorValueType, setConnectorValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)
  const [projectValueType, setProjectValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)
  const [issueValueType, setIssueValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)
  const jiraType = 'createMode'
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)
  const projectKeyFixedValue =
    typeof formik.values.spec.projectKey === 'object'
      ? (formik.values.spec.projectKey as JiraProjectSelectOption).key
      : undefined
  const issueTypeFixedValue =
    typeof formik.values.spec.issueType === 'object'
      ? (formik.values.spec.issueType as JiraProjectSelectOption).key
      : undefined

  const requiredFields = get(formik.values, 'spec.selectedRequiredFields', []) as JiraFieldNGWithValue[]

  const { ALLOW_USER_TYPE_FIELDS_JIRA } = useFeatureFlags()

  useDeepCompareEffect(() => {
    if (isEmpty(requiredFields)) {
      setUnsupportedRequiredFields([])
    } else {
      setUnsupportedRequiredFields(getUnsupportedRequiredFields(requiredFields))
    }
  }, [requiredFields])

  useEffect(() => {
    // If connector value changes in form, fetch projects
    // second block is needed so that we don't fetch projects if type is expression
    // CDC-15633
    if (connectorRefFixedValue && connectorValueType === MultiTypeInputType.FIXED) {
      refetchProjects({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    } else if (connectorRefFixedValue !== undefined || isRuntimeOrExpressionType(connectorValueType)) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked runtime/expression
      // Flush the selected optional fields, and move everything to key value fields
      // formik.setFieldValue('spec.fields', getKVFields(formik.values))
      formik.setFieldValue('spec.selectedRequiredFields', [])
      formik.setFieldValue('spec.selectedOptionalFields', [])
    }
  }, [connectorRefFixedValue])

  // Resolves the value of project key when the component mounts or updates if required
  useEffect(() => {
    if (projectKeyFixedValue && projectOptions?.length > 0) {
      const unresolvedProjectKeyOption = formik.values.spec.projectKey as JiraProjectSelectOption
      const resolvedLabel = projectOptions.find(project => project.key === unresolvedProjectKeyOption.key)?.label
      formik.setFieldValue('spec.projectKey', { ...unresolvedProjectKeyOption, label: resolvedLabel })
    }
  }, [projectKeyFixedValue, projectOptions])

  useEffect(() => {
    // If project value changes in form, fetch metadata
    if (connectorRefFixedValue && projectKeyFixedValue) {
      refetchProjectMetadata({
        queryParams: {
          ...commonParams,
          expand: 'projects.issuetypes',
          connectorRef: connectorRefFixedValue.toString(),
          projectKey: projectKeyFixedValue.toString()
        }
      })
    } else if (
      (connectorRefFixedValue !== undefined && projectKeyFixedValue !== undefined) ||
      isRuntimeOrExpressionType(projectValueType)
    ) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked runtime/expression
      // Flush the selected optional and required fields, and move everything to key value fields
      // formik.setFieldValue('spec.fields', getKVFields(formik.values))
      formik.setFieldValue('spec.selectedRequiredFields', [])
      formik.setFieldValue('spec.selectedOptionalFields', [])
    }
  }, [projectKeyFixedValue])

  useEffect(() => {
    if (connectorRefFixedValue && projectKeyFixedValue && issueTypeFixedValue) {
      refetchIssueMetadata({
        queryParams: {
          ...commonParams,
          expand: 'projects.issuetypes.fields',
          connectorRef: connectorRefFixedValue.toString(),
          projectKey: projectKeyFixedValue.toString(),
          issueType: issueTypeFixedValue.toString()
        }
      })
    } else if (
      (connectorRefFixedValue !== undefined &&
        projectKeyFixedValue !== undefined &&
        issueTypeFixedValue !== undefined) ||
      isRuntimeOrExpressionType(projectValueType)
    ) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      formik.setFieldValue('spec.selectedRequiredFields', [])
      formik.setFieldValue('spec.selectedOptionalFields', [])
    }
  }, [issueTypeFixedValue])

  useEffect(() => {
    // If issuetype changes in form, set status and field list
    if (issueTypeFixedValue && issueMetadata?.issuetypes[issueTypeFixedValue]?.fields) {
      const issueTypeData = issueMetadata?.issuetypes[issueTypeFixedValue]
      const fieldKeys = Object.keys(issueTypeData?.fields || {}).sort()
      const formikOptionalFields: JiraFieldNGWithValue[] = []
      const formikRequiredFields: JiraFieldNGWithValue[] = []
      fieldKeys.forEach(fieldKey => {
        const field = issueTypeData?.fields[fieldKey]
        if (field) {
          const savedValueForThisField = getInitialValueForSelectedField(formik.values.spec.fields, field)
          const isCurrentFieldASelectedOptionalField = getIsCurrentFieldASelectedOptionalField(
            formik.values.spec.fields,
            field
          )
          if (isCurrentFieldASelectedOptionalField) {
            formikOptionalFields.push({ ...field, value: savedValueForThisField })
          } else if (field.required) {
            formikRequiredFields.push({
              ...field,
              //this check is needed for multiselect or single select fields
              //as these fields accepts value in the form of array and if savedValueForThisField which is
              //of string is empty, we need to ensure the value is set to empty array
              value: !isEmpty(field.allowedValues) && !savedValueForThisField ? [] : savedValueForThisField
            })
          }
        }
      })
      formik.setFieldValue('spec.selectedRequiredFields', formikRequiredFields)
      formik.setFieldValue('spec.selectedOptionalFields', formikOptionalFields)
      const toBeUpdatedNonKVFields: JiraCreateFieldType[] = []
      const nonKVFields = [...formikOptionalFields, ...formikRequiredFields]

      nonKVFields.forEach(field =>
        toBeUpdatedNonKVFields.push({
          name: field.name,
          value: getProcessedValueForNonKVField(field)
        })
      )

      const toBeUpdatedKVFields = getKVFieldsToBeAddedInForm(
        formik.values.spec.fields,
        [],
        formikOptionalFields,
        formikRequiredFields
      )
      const allfields = [...toBeUpdatedNonKVFields, ...toBeUpdatedKVFields]

      formik.setFieldValue('spec.fields', allfields)
    } else if (issueTypeFixedValue !== undefined || isRuntimeOrExpressionType(issueValueType)) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked runtime/expression
      // Flush the selected additional fields, and move everything to key value fields
      // formik.setFieldValue('spec.fields', getKVFields(formik.values))
      formik.setFieldValue('spec.selectedRequiredFields', [])
      formik.setFieldValue('spec.selectedOptionalFields', [])
    }
  }, [issueTypeFixedValue, issueMetadata])

  useEffect(() => {
    let options: JiraProjectSelectOption[] = []
    const projectResponseList: JiraProjectBasicNG[] = projectsResponse?.data || []
    options =
      projectResponseList.map((project: JiraProjectBasicNG) => ({
        label: defaultTo(project.name, ''),
        value: defaultTo(project.id, ''),
        key: defaultTo(project.key, '')
      })) || []

    setProjectOptions(options)
  }, [projectsResponse?.data])

  useEffect(() => {
    if (projectKeyFixedValue && projectMetaResponse?.data?.projects) {
      const projectMD: JiraProjectNG = projectMetaResponse?.data?.projects[projectKeyFixedValue]
      setProjectMetadata(projectMD)
    }
  }, [projectMetaResponse?.data])

  useEffect(() => {
    if (projectKeyFixedValue && issueTypeFixedValue && issueMetaResponse?.data?.projects) {
      const issuesMD: JiraProjectNG = issueMetaResponse?.data?.projects[projectKeyFixedValue]
      setIssueMetadata(issuesMD)
    }
  }, [issueMetaResponse?.data])

  const [showDynamicFieldsModal, hideDynamicFieldsModal] = useModalHook(() => {
    return (
      <Dialog
        className={css.addFieldsModal}
        enforceFocus={false}
        isOpen
        onClose={hideDynamicFieldsModal}
        title={getString('pipeline.jiraCreateStep.addFields')}
      >
        <JiraDynamicFieldsSelector
          connectorRef={connectorRefFixedValue || ''}
          selectedProjectKey={projectKeyFixedValue || ''}
          selectedIssueTypeKey={issueTypeFixedValue || ''}
          jiraType={jiraType}
          projectOptions={projectOptions}
          selectedFields={formik.values.spec.selectedOptionalFields}
          addSelectedFields={(fieldsToBeAdded: JiraFieldNG[]) => {
            addSelectedOptionalFields(fieldsToBeAdded, formik)
            hideDynamicFieldsModal()
          }}
          provideFieldList={(fields: JiraCreateFieldType[]) => {
            formik.setFieldValue(
              'spec.fields',
              getKVFieldsToBeAddedInForm(fields, formik.values.spec.fields, formik.values.spec.selectedOptionalFields)
            )
            hideDynamicFieldsModal()
          }}
          onCancel={hideDynamicFieldsModal}
        />
      </Dialog>
    )
  }, [projectOptions, connectorRefFixedValue, formik.values.spec.selectedOptionalFields, formik.values.spec.fields])

  function AddFieldsButton(): React.ReactElement {
    return (
      <Text
        onClick={() => {
          if (!isApprovalStepFieldDisabled(readonly)) {
            showDynamicFieldsModal()
          }
        }}
        style={{
          cursor: isApprovalStepFieldDisabled(readonly) ? 'not-allowed' : 'pointer'
        }}
        tooltipProps={{ dataTooltipId: 'jiraCreateAddFields' }}
        intent="primary"
      >
        {getString('pipeline.jiraCreateStep.fieldSelectorAdd')}
      </Text>
    )
  }

  function showWarningMessage(): React.ReactElement {
    return (
      <div className={css.marginTop}>
        <Text
          lineClamp={1}
          width={350}
          margin={{ bottom: 'medium' }}
          intent={Intent.WARNING}
          icon={'warning-sign'}
          tooltipProps={{ isDark: true, popoverClassName: css.tooltip }}
        >
          {getString('pipeline.jiraCreateStep.projectIssueTypeDisclaimer')}
        </Text>
      </div>
    )
  }

  return (
    <React.Fragment>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('name')}
            isIdentifierEditable={isNewStep}
            inputGroupProps={{
              placeholder: getString('pipeline.stepNamePlaceholder'),
              disabled: isApprovalStepFieldDisabled(readonly)
            }}
          />
        </div>
      )}

      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeDurationProps={{
            expressions,
            allowableTypes,
            enableConfigureOptions: true
          }}
        />
      </div>
      <div className={stepCss.divider} />

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeConnectorField
          name="spec.connectorRef"
          label={getString('pipeline.jiraApprovalStep.connectorRef')}
          className={css.connector}
          connectorLabelClass={css.connectorLabel}
          width={372}
          placeholder={getString('common.entityPlaceholderText')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          type="Jira"
          enableConfigureOptions={false}
          selected={formik?.values?.spec.connectorRef as string}
          onChange={(value: any, _unused, multiType) => {
            // Clear dependent fields
            setConnectorValueType(multiType)
            if (value?.record?.identifier !== connectorRefFixedValue) {
              resetForm(formik, 'connectorRef')
              setCount(count + 1)
              if (multiType !== MultiTypeInputType.FIXED) {
                setProjectOptions([])
                setProjectMetadata(undefined)
              }
            }
          }}
          setRefValue
          disabled={isApprovalStepFieldDisabled(readonly)}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            style={{ marginTop: 14 }}
            value={formik.values.spec.connectorRef as string}
            type="String"
            variableName="spec.connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => formik.setFieldValue('spec.connectorRef', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <React.Fragment key={count}>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTypeInput
            selectItems={
              fetchingProjects
                ? [{ label: getString('pipeline.jiraApprovalStep.fetchingProjectsPlaceholder'), value: '' }]
                : projectOptions
            }
            label={getString('pipeline.jiraApprovalStep.project')}
            name="spec.projectKey"
            placeholder={
              fetchingProjects
                ? getString('pipeline.jiraApprovalStep.fetchingProjectsPlaceholder')
                : projectsFetchError?.message
                ? projectsFetchError?.message
                : getString('common.selectProject')
            }
            disabled={isApprovalStepFieldDisabled(readonly, fetchingProjects)}
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              onChange: (value: unknown, _unused, multiType) => {
                // Clear dependent fields
                setProjectValueType(multiType)
                if ((value as JiraProjectSelectOption)?.key !== projectKeyFixedValue) {
                  resetForm(formik, 'projectKey')
                  setCount(count + 1)
                  setProjectMetadata(undefined)
                }
              }
            }}
          />
          {getMultiTypeFromValue(formik.values.spec.projectKey) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={formik.values.spec.projectKey as string}
              type="String"
              variableName="spec.projectKey"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => formik.setFieldValue('spec.projectKey', value)}
              isReadonly={readonly}
            />
          )}
        </div>
        {connectorRefFixedValue && !fetchingProjects && !projectsFetchError && isEmpty(projectsResponse?.data) ? (
          showWarningMessage()
        ) : projectsFetchError ? (
          <FormError
            className={css.marginTop}
            errorMessage={
              <Text
                lineClamp={1}
                width={350}
                margin={{ bottom: 'medium' }}
                intent={Intent.DANGER}
                tooltipProps={{ isDark: true, popoverClassName: css.tooltip }}
              >
                {getRBACErrorMessage(projectsFetchError)}
              </Text>
            }
            name="spec.projectKey"
          ></FormError>
        ) : null}

        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTypeInput
            selectItems={
              fetchingProjectMetadata
                ? [{ label: getString('pipeline.jiraApprovalStep.fetchingIssueTypePlaceholder'), value: '' }]
                : setIssueTypeOptions(projectMetadata?.issuetypes)
            }
            label={getString('common.resourceCenter.ticketmenu.issueType')}
            name="spec.issueType"
            placeholder={
              fetchingProjectMetadata
                ? getString('pipeline.jiraApprovalStep.fetchingIssueTypePlaceholder')
                : projectMetadataFetchError?.message
                ? projectMetadataFetchError?.message
                : getString('pipeline.jiraApprovalStep.issueTypePlaceholder')
            }
            disabled={isApprovalStepFieldDisabled(readonly, fetchingProjectMetadata)}
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              onChange: (value: unknown, _unused, multiType) => {
                setIssueValueType(multiType)
                // Clear dependent fields
                if ((value as JiraProjectSelectOption)?.key !== issueTypeFixedValue) {
                  resetForm(formik, 'issueType')
                  setCount(count + 1)
                }
              }
            }}
          />
          {getMultiTypeFromValue(formik.values.spec.issueType) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={formik.values.spec.issueType as string}
              type="String"
              variableName="spec.issueType"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => formik.setFieldValue('spec.issueType', value)}
              isReadonly={readonly}
            />
          )}
        </div>

        {projectKeyFixedValue &&
          !fetchingProjectMetadata &&
          !projectMetadataFetchError &&
          isEmpty(projectMetaResponse?.data) &&
          showWarningMessage()}

        <div>
          <JiraFieldsRenderer
            selectedFields={formik.values.spec.selectedRequiredFields}
            renderRequiredFields={true}
            readonly={readonly}
            connectorRef={defaultTo(connectorRefFixedValue, '')}
          />
        </div>
        {!ALLOW_USER_TYPE_FIELDS_JIRA && unsupportedRequiredFields?.length > 0 && (
          <Text
            inline
            icon="circle-cross"
            width={350}
            lineClamp={1}
            iconProps={{ size: 16, color: 'red700', padding: { right: 'small' } }}
            intent={Intent.DANGER}
            tooltipProps={{ isDark: true, popoverClassName: css.tooltip }}
          >
            {getString('pipeline.jiraCreateStep.unsupportedRequiredFieldsError', {
              fields: unsupportedRequiredFields.map(field => field.name).join(', ')
            })}
          </Text>
        )}

        <div className={stepCss.noLookDivider} />
      </React.Fragment>

      <Accordion activeId="" className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={
            <div>
              {fetchingProjectMetadata ? (
                <PageSpinner message={getString('pipeline.jiraCreateStep.fetchingFields')} className={css.fetching} />
              ) : (
                <>
                  <JiraFieldsRenderer
                    selectedFields={formik.values.spec.selectedOptionalFields}
                    readonly={readonly}
                    onDelete={(index, selectedField) => {
                      const selectedOptionalFieldsAfterRemoval = formik.values.spec.selectedOptionalFields?.filter(
                        (_unused, i) => i !== index
                      )
                      formik.setFieldValue('spec.selectedOptionalFields', selectedOptionalFieldsAfterRemoval)
                      const customFields = formik.values.spec.fields?.filter(field => field.name !== selectedField.name)
                      formik.setFieldValue('spec.fields', customFields)
                    }}
                    connectorRef={defaultTo(connectorRefFixedValue, '')}
                  />

                  {!isEmpty(formik.values.spec.fields) ? (
                    <JiraKVFieldsRenderer<JiraCreateData>
                      formik={formik}
                      allowableTypes={allowableTypes}
                      selectedAllFields={formik.values.spec.fields}
                      selectedOptionalFields={formik.values.spec.selectedOptionalFields}
                      selectedRequiredFields={formik.values.spec.selectedRequiredFields}
                      readonly={readonly}
                    />
                  ) : null}
                </>
              )}

              <AddFieldsButton />
            </div>
          }
        />
      </Accordion>
    </React.Fragment>
  )
}

function JiraCreateStepMode(props: JiraCreateStepModeProps, formikRef: StepFormikFowardRef<JiraCreateData>) {
  const { onUpdate, isNewStep, readonly, onChange, stepViewType, allowableTypes, unprocessedInitialValues } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const {
    refetch: refetchProjects,
    data: projectsResponse,
    error: projectsFetchError,
    loading: fetchingProjects
  } = useGetJiraProjects({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const {
    refetch: refetchProjectMetadata,
    data: projectMetaResponse,
    error: projectMetadataFetchError,
    loading: fetchingProjectMetadata
  } = useGetJiraIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      expand: '',
      connectorRef: '',
      projectKey: ''
    }
  })

  const {
    refetch: refetchIssueMetadata,
    data: issueMetaResponse,
    error: issueMetadataFetchError
  } = useGetJiraIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      expand: '',
      connectorRef: '',
      projectKey: '',
      issueType: ''
    }
  })

  // formik's dirty prop is computed by comparing initialValues and values,
  // but this step needs a custom dirty prop as the type of submitted/initial values is different from values
  const updateDirty = (ref: StepFormikFowardRef<JiraCreateData>): void => {
    if (!ref || typeof ref === 'function') return

    const formikProps = ref.current as Mutable<FormikProps<JiraCreateData>>
    formikProps.dirty = !isEqual(unprocessedInitialValues, processFormData(formikProps.values))
  }

  return (
    <Formik<JiraCreateData>
      onSubmit={values => {
        onUpdate?.(processFormData(values))
      }}
      formName="jiraCreate"
      initialValues={props.initialValues}
      validate={data => {
        onChange?.(processFormData(data))
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.connectorRef')),
          projectKey: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.project')),
          issueType: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.issueType')),
          selectedRequiredFields: Yup.array().of(
            Yup.object().shape({
              value: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.requiredField'))
            })
          )
        })
      })}
    >
      {(formik: FormikProps<JiraCreateData>) => {
        setFormikRef(formikRef, formik)
        updateDirty(formikRef)

        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              refetchProjects={refetchProjects}
              refetchProjectMetadata={refetchProjectMetadata}
              refetchIssueMetadata={refetchIssueMetadata}
              fetchingProjects={fetchingProjects}
              fetchingProjectMetadata={fetchingProjectMetadata}
              projectMetaResponse={projectMetaResponse}
              issueMetaResponse={issueMetaResponse}
              issueMetadataFetchError={issueMetadataFetchError}
              projectsResponse={projectsResponse}
              projectsFetchError={projectsFetchError}
              projectMetadataFetchError={projectMetadataFetchError}
              isNewStep={isNewStep}
              readonly={readonly}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const JiraCreateStepModeWithRef = React.forwardRef(JiraCreateStepMode)
export default JiraCreateStepModeWithRef
