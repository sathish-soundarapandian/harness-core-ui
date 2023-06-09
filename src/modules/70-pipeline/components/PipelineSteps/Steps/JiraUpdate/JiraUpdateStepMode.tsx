/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
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
  SelectOption,
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
import { JiraFieldNG, JiraStatusNG, useGetJiraIssueUpdateMetadata, useGetJiraStatuses } from 'services/cd-ng'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { JiraKVFieldsRenderer } from '@pipeline/components/PipelineSteps/Steps/JiraCreate/JiraKVFieldsRenderer'
import { useQueryParams } from '@common/hooks'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { isMultiTypeFixed } from '@common/utils/utils'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { getGenuineValue } from '../JiraApproval/helper'
import type { JiraCreateFieldType, JiraFieldNGWithValue } from '../JiraCreate/types'
import {
  getInitialValueForSelectedField,
  getIsCurrentFieldASelectedOptionalField,
  getKVFieldsToBeAddedInForm,
  getProcessedValueForNonKVField,
  getSelectedFieldsToBeAddedInForm,
  isRuntimeOrExpressionType
} from '../JiraCreate/helper'
import { JiraDynamicFieldsSelector } from '../JiraCreate/JiraDynamicFieldsSelector'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { JiraFieldsRenderer } from '../JiraCreate/JiraFieldsRenderer'
import type {
  JiraUpdateData,
  JiraUpdateFieldType,
  JiraUpdateFormContentInterface,
  JiraUpdateStepModeProps
} from './types'
import { processFormData } from './helper'

import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../JiraCreate/JiraCreate.module.scss'

function FormContent({
  formik,
  refetchStatuses,
  fetchingStatuses,
  statusFetchError,
  statusResponse,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType,
  refetchIssueUpdateMetadata,
  issueUpdateMetadataResponse,
  issueUpdateMetadataFetchError,
  issueUpdateMetadataLoading
}: JiraUpdateFormContentInterface): JSX.Element {
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [statusOptions, setStatusOptions] = useState<SelectOption[]>([])
  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)
  const issueKeyValue = isMultiTypeFixed(getMultiTypeFromValue(formik.values.spec.issueKey))
    ? formik.values.spec.issueKey
    : ''
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const jiraType = 'updateMode'
  useEffect(() => {
    if (connectorRefFixedValue) {
      refetchStatuses({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    } else if (connectorRefFixedValue !== undefined) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked runtime/expression
      // Flush the selected optional fields, and move everything to key value fields
      formik.setFieldValue('spec.selectedOptionalFields', [])
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    // get status by connector ref response
    let options: SelectOption[] = []
    const statusResponseList: JiraStatusNG[] = statusResponse?.data || []
    options =
      statusResponseList.map((status: JiraStatusNG) => ({
        label: status.name || '',
        value: status.name || ''
      })) || []

    setStatusOptions(options)
  }, [statusResponse?.data])

  useEffect(() => {
    if (connectorRefFixedValue && issueKeyValue) {
      refetchIssueUpdateMetadata({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString(),
          issueKey: issueKeyValue
        }
      })
    }
  }, [connectorRefFixedValue, issueKeyValue])

  useEffect(() => {
    // The below code utilises issue update metadata to figure out optional fields from Key value fields
    // to ensure they are rendered properly i.e. not as a key value pair field
    if (issueKeyValue && !isEmpty(issueUpdateMetadataResponse?.data?.fields)) {
      const issueUpdateMetadataFieldsObj = issueUpdateMetadataResponse!.data!.fields
      const fieldKeys = Object.keys(issueUpdateMetadataFieldsObj).sort()
      const formikOptionalFields: JiraFieldNGWithValue[] = []
      fieldKeys.forEach(fieldKey => {
        const field = issueUpdateMetadataFieldsObj[fieldKey]
        if (field) {
          const savedValueForThisField = getInitialValueForSelectedField(formik.values.spec.fields, field)
          const isCurrentFieldASelectedOptionalField = getIsCurrentFieldASelectedOptionalField(
            formik.values.spec.fields,
            field
          )
          if (isCurrentFieldASelectedOptionalField) {
            formikOptionalFields.push({ ...field, value: savedValueForThisField })
          }
        }
      })
      formik.setFieldValue('spec.selectedOptionalFields', formikOptionalFields)

      const toBeUpdatedNonKVFields: JiraUpdateFieldType[] = []
      const nonKVFields = [...formikOptionalFields]

      nonKVFields.forEach(field =>
        toBeUpdatedNonKVFields.push({
          name: field.name,
          value: getProcessedValueForNonKVField(field)
        })
      )

      const toBeUpdatedKVFields = getKVFieldsToBeAddedInForm(formik.values.spec.fields, [], formikOptionalFields, [])
      const allfields = [...toBeUpdatedNonKVFields, ...toBeUpdatedKVFields]

      formik.setFieldValue('spec.fields', allfields)
    } else if (issueKeyValue !== undefined || isRuntimeOrExpressionType(issueKeyValue)) {
      // Undefined check is needed so that form is not set to dirty as soon as we open
      // This means we've cleared the value or marked it runtime/expression on which the optional fields depend
      formik.setFieldValue('spec.selectedOptionalFields', [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueKeyValue, issueUpdateMetadataResponse])

  const [showDynamicFieldsModal, hideDynamicFieldsModal] = useModalHook(() => {
    return (
      <Dialog
        className={css.addFieldsModal}
        isOpen
        onClose={hideDynamicFieldsModal}
        enforceFocus={false}
        title={getString('pipeline.jiraCreateStep.addFields')}
      >
        <JiraDynamicFieldsSelector
          connectorRef={connectorRefFixedValue || ''}
          selectedFields={formik.values.spec.selectedOptionalFields}
          jiraType={jiraType}
          issueKey={issueKeyValue}
          addSelectedFields={(fieldsToBeAdded: JiraFieldNG[]) => {
            formik.setFieldValue(
              'spec.selectedOptionalFields',
              getSelectedFieldsToBeAddedInForm(
                fieldsToBeAdded,
                formik.values.spec.selectedOptionalFields,
                formik.values.spec.fields
              )
            )
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
  }, [
    connectorRefFixedValue,
    formik.values.spec.selectedOptionalFields,
    formik.values.spec.fields,
    formik.values.spec.issueKey
  ])

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
        tooltipProps={{ dataTooltipId: 'jiraUpdateAddFields' }}
        intent="primary"
      >
        {getString('pipeline.jiraCreateStep.fieldSelectorAdd')}
      </Text>
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
          width={390}
          placeholder={getString('common.entityPlaceholderText')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          type="Jira"
          setRefValue
          enableConfigureOptions={false}
          selected={formik?.values?.spec.connectorRef as string}
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
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          label={getString('pipeline.jiraApprovalStep.issueKey')}
          name="spec.issueKey"
          multiTextInputProps={{ expressions, allowableTypes }}
          placeholder={getString('pipeline.jiraApprovalStep.issueKeyPlaceholder')}
          disabled={isApprovalStepFieldDisabled(readonly)}
        />
        {getMultiTypeFromValue(formik.values.spec.issueKey) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.spec.issueKey as string}
            type="String"
            variableName="spec.issueKey"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => formik.setFieldValue('spec.issueKey', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      <div className={stepCss.noLookDivider} />
      <Accordion activeId="" className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={
            <div>
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTypeInput
                  selectItems={statusOptions}
                  label={getString('status')}
                  name="spec.transitionTo.status"
                  placeholder={
                    fetchingStatuses
                      ? getString('pipeline.jiraUpdateStep.fetchingStatus')
                      : getString('pipeline.jiraUpdateStep.selectStatus')
                  }
                  useValue
                  multiTypeInputProps={{
                    expressions,
                    allowableTypes,
                    selectProps: {
                      addClearBtn: !readonly,
                      items: fetchingStatuses
                        ? [{ label: getString('pipeline.jiraUpdateStep.fetchingStatus'), value: '' }]
                        : statusOptions
                    }
                  }}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.transitionTo?.status) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={statusOptions}
                    loading={fetchingStatuses}
                    value={formik.values.spec.transitionTo?.status as string}
                    type="String"
                    variableName="spec.transitionTo.status"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => formik.setFieldValue('spec.transitionTo.status', value)}
                    isReadonly={readonly}
                  />
                )}
              </div>

              {!fetchingStatuses && !statusFetchError && isEmpty(statusResponse?.data) ? (
                <div className={css.marginTop}>
                  <Text
                    lineClamp={1}
                    width={350}
                    margin={{ bottom: 'medium' }}
                    intent={Intent.WARNING}
                    icon={'warning-sign'}
                    tooltipProps={{ isDark: true, popoverClassName: css.tooltip }}
                  >
                    {getString('pipeline.jiraUpdateStep.statusDisclaimer')}
                  </Text>
                </div>
              ) : statusFetchError ? (
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
                      {getRBACErrorMessage(statusFetchError)}
                    </Text>
                  }
                  name="spec.projectKey"
                ></FormError>
              ) : null}

              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTextInput
                  label={getString('pipeline.jiraUpdateStep.transitionLabel')}
                  name="spec.transitionTo.transitionName"
                  placeholder={getString('pipeline.jiraUpdateStep.transitionPlaceholder')}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes
                  }}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.transitionTo?.transitionName) ===
                  MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.spec.transitionTo?.transitionName as string}
                    type="String"
                    variableName="spec.transitionTo.transitionName"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => formik.setFieldValue('spec.transitionTo.transitionName', value)}
                    isReadonly={readonly}
                  />
                )}
              </div>

              <JiraFieldsRenderer
                selectedFields={formik.values.spec.selectedOptionalFields}
                readonly={readonly}
                onDelete={(index, selectedField) => {
                  const selectedFieldsAfterRemoval = formik.values.spec.selectedOptionalFields?.filter(
                    (_unused, i) => i !== index
                  )
                  formik.setFieldValue('spec.selectedOptionalFields', selectedFieldsAfterRemoval)
                  const customFields = formik.values.spec.fields?.filter(field => field.name !== selectedField.name)
                  formik.setFieldValue('spec.fields', customFields)
                }}
                connectorRef={defaultTo(connectorRefFixedValue, '')}
              />

              {issueUpdateMetadataLoading ? (
                <PageSpinner message={getString('pipeline.jiraCreateStep.fetchingFields')} className={css.fetching} />
              ) : !isEmpty(formik.values.spec.fields) ? (
                <JiraKVFieldsRenderer
                  formik={formik}
                  allowableTypes={allowableTypes}
                  selectedAllFields={formik.values.spec.fields}
                  selectedOptionalFields={formik.values.spec.selectedOptionalFields}
                  readonly={readonly}
                />
              ) : null}

              <AddFieldsButton />
              {issueUpdateMetadataFetchError && (
                <FormError
                  errorMessage={
                    <Text
                      lineClamp={1}
                      width={350}
                      margin={{ bottom: 'medium' }}
                      intent={Intent.DANGER}
                      tooltipProps={{ isDark: true, popoverClassName: css.tooltip }}
                    >
                      {getRBACErrorMessage(issueUpdateMetadataFetchError)}
                    </Text>
                  }
                  name="issueUpdateMetadataError"
                />
              )}
            </div>
          }
        />
      </Accordion>
    </React.Fragment>
  )
}

function JiraUpdateStepMode(
  props: JiraUpdateStepModeProps,
  formikRef: StepFormikFowardRef<JiraUpdateData>
): JSX.Element {
  const { onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
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
    refetch: refetchStatuses,
    data: statusResponse,
    error: statusFetchError,
    loading: fetchingStatuses
  } = useGetJiraStatuses({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const {
    refetch: refetchIssueUpdateMetadata,
    data: issueUpdateMetadataResponse,
    error: issueUpdateMetadataFetchError,
    loading: issueUpdateMetadataLoading
  } = useGetJiraIssueUpdateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: '',
      issueKey: ''
    }
  })

  return (
    <Formik<JiraUpdateData>
      onSubmit={values => onUpdate?.(processFormData(values))}
      formName="jiraUpdate"
      initialValues={props.initialValues}
      validate={data => {
        onChange?.(processFormData(data))
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: Yup.string().required(getString('pipeline.jiraApprovalStep.validations.connectorRef')),
          issueKey: Yup.string().trim().required(getString('pipeline.jiraApprovalStep.validations.issueKey')),
          transitionTo: Yup.object().shape({
            status: Yup.string().when('transitionName', {
              is: val => val?.trim()?.length,
              then: Yup.string().required(getString('pipeline.jiraUpdateStep.validations.status'))
            })
          })
        })
      })}
    >
      {(formik: FormikProps<JiraUpdateData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              refetchStatuses={refetchStatuses}
              fetchingStatuses={fetchingStatuses}
              refetchIssueUpdateMetadata={refetchIssueUpdateMetadata}
              issueUpdateMetadataResponse={issueUpdateMetadataResponse}
              issueUpdateMetadataFetchError={issueUpdateMetadataFetchError}
              issueUpdateMetadataLoading={issueUpdateMetadataLoading}
              statusResponse={statusResponse}
              statusFetchError={statusFetchError}
              isNewStep={isNewStep}
              readonly={readonly}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const JiraUpdateStepModeWithRef = React.forwardRef(JiraUpdateStepMode)
export default JiraUpdateStepModeWithRef
