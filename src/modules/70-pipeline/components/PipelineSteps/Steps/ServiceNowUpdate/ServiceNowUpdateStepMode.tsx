/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import * as Yup from 'yup'
import { FieldArray, FormikProps } from 'formik'
import { Intent } from '@harness/design-system'
import {
  Button,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  PageSpinner,
  AllowedTypes,
  FormError
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { String, StringKeys, useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  ServiceNowFieldNG,
  ServiceNowTicketTypeDTO,
  useGetServiceNowIssueMetadata,
  useGetServiceNowTemplateMetadata,
  useGetServiceNowTicketTypes,
  useGetServiceNowTicketTypesV2
} from 'services/cd-ng'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import { ConnectorRefSchema } from '@common/utils/Validation'
import { ServiceNowDynamicFieldsSelector } from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/ServiceNowDynamicFieldsSelector'
import { ServiceNowFieldsRenderer } from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/ServiceNowFieldsRenderer'
import {
  FieldType,
  ServiceNowCreateFieldType,
  ServiceNowFieldNGWithValue,
  ServiceNowStaticFields
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/types'
import {
  convertTemplateFieldsForDisplay,
  getInitialValueForSelectedField,
  getKVFieldsToBeAddedInForm,
  getSelectedFieldsToBeAddedInForm,
  resetForm
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/helper'
import { FormMultiTypeTextAreaField } from '@common/components'
import { processFormData } from '@pipeline/components/PipelineSteps/Steps/ServiceNowUpdate/helper'
import { ServiceNowTemplateFieldsRenderer } from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/ServiceNowTemplateFieldRenderer'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { Connectors } from '@connectors/constants'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import type { ServiceNowUpdateStepModeProps, ServiceNowUpdateData, ServiceNowUpdateFormContentInterface } from './types'
import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import { getGenuineValue } from '../ServiceNowApproval/helper'
import type { ServiceNowTicketTypeSelectOption } from '../ServiceNowApproval/types'
import css from './ServiceNowUpdate.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const fetchingTicketTypesPlaceholder: StringKeys = 'pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'
function FormContent({
  formik,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType,
  serviceNowTicketTypesQuery,
  serviceNowTemplateMetaDataQuery,
  serviceNowIssueCreateMetadataQuery
}: ServiceNowUpdateFormContentInterface): JSX.Element {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { CDS_SERVICENOW_TICKET_TYPE_V2 } = useFeatureFlags()

  const [ticketFieldList, setTicketFieldList] = useState<ServiceNowFieldNG[]>([])
  const [count, setCount] = React.useState(0)
  const [serviceNowTicketTypesOptions, setServiceNowTicketTypesOptions] = useState<ServiceNowTicketTypeSelectOption[]>(
    []
  )
  const [connectorValueType, setConnectorValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)
  const [ticketValueType, setTicketValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)
  const ticketTypeKeyFixedValue =
    getMultiTypeFromValue(formik.values.spec.ticketType) === MultiTypeInputType.FIXED &&
    !isEmpty(formik.values.spec.ticketType)
      ? formik.values.spec.ticketType
      : undefined
  const serviceNowType = 'updateMode'
  const [isTemplateSectionAvailable, setIsTemplateSectionAvailable] = useState<boolean>(false)
  const [templateName, setTemplateName] = useState<string>(formik.values.spec.templateName || '')

  useEffect(() => {
    if (connectorRefFixedValue && connectorValueType === MultiTypeInputType.FIXED) {
      serviceNowTicketTypesQuery.refetch({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    } else if (connectorRefFixedValue !== undefined) {
      formik.setFieldValue('spec.selectedFields', [])
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    // Set ticket types
    let options: ServiceNowTicketTypeSelectOption[] = []
    const ticketTypesResponseList: ServiceNowTicketTypeDTO[] = serviceNowTicketTypesQuery.data?.data || []
    options = ticketTypesResponseList.map((ticketType: ServiceNowTicketTypeDTO) => ({
      label: defaultTo(ticketType.name, ''),
      value: defaultTo(ticketType.key, ''),
      key: defaultTo(ticketType.key, '')
    }))
    setServiceNowTicketTypesOptions(options)
  }, [serviceNowTicketTypesQuery.data?.data])

  useEffect(() => {
    if (
      connectorRefFixedValue &&
      connectorValueType === MultiTypeInputType.FIXED &&
      ticketTypeKeyFixedValue &&
      ticketValueType === MultiTypeInputType.FIXED &&
      getMultiTypeFromValue(templateName) === MultiTypeInputType.FIXED
    ) {
      serviceNowTemplateMetaDataQuery.refetch({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString(),
          ticketType: ticketTypeKeyFixedValue.toString(),
          templateName: templateName || '',
          limit: 1,
          offset: 0
        }
      })
    }
  }, [connectorRefFixedValue, ticketTypeKeyFixedValue, templateName])

  useDeepCompareEffect(() => {
    if (connectorRefFixedValue && ticketTypeKeyFixedValue && ticketValueType === MultiTypeInputType.FIXED) {
      serviceNowIssueCreateMetadataQuery.refetch({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString(),
          ticketType: ticketTypeKeyFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue, ticketTypeKeyFixedValue])

  useEffect(() => {
    const formikSelectedFields: ServiceNowFieldNGWithValue[] = []
    if (ticketTypeKeyFixedValue) {
      setTicketFieldList(serviceNowIssueCreateMetadataQuery.data?.data || [])
      if (formik.values.spec.fields && serviceNowIssueCreateMetadataQuery.data?.data) {
        serviceNowIssueCreateMetadataQuery.data?.data.forEach(field => {
          if (
            field &&
            field.key !== ServiceNowStaticFields.short_description &&
            field.key !== ServiceNowStaticFields.description
          ) {
            const savedValueForThisField = getInitialValueForSelectedField(formik.values.spec.fields, field)
            if (savedValueForThisField) {
              formikSelectedFields.push({ ...field, value: savedValueForThisField })
            } else if (field.required) {
              formikSelectedFields.push({ ...field, value: '' })
            }
          }
        })

        formik.setFieldValue('spec.selectedFields', formikSelectedFields)
        const toBeUpdatedKVFields = getKVFieldsToBeAddedInForm(formik.values.spec.fields, [], formikSelectedFields)
        formik.setFieldValue('spec.fields', toBeUpdatedKVFields)
      } else if (ticketTypeKeyFixedValue !== undefined) {
        // Undefined check is needed so that form is not set to dirty as soon as we open
        // This means we've cleared the value or marked runtime/expression
        // Flush the selected additional fields, and move everything to key value fields
        // formik.setFieldValue('spec.fields', getKVFields(formik.values))
        formik.setFieldValue('spec.selectedFields', [])
        setTicketFieldList([])
      }
    }
  }, [serviceNowIssueCreateMetadataQuery.data?.data])

  useEffect(() => {
    if (serviceNowTemplateMetaDataQuery.data && serviceNowTemplateMetaDataQuery.data.data) {
      setIsTemplateSectionAvailable(true)
      if (serviceNowTemplateMetaDataQuery.data?.data?.length > 0 && templateName) {
        formik.setFieldValue(
          'spec.templateFields',
          convertTemplateFieldsForDisplay(serviceNowTemplateMetaDataQuery.data?.data[0].fields)
        )
      } else {
        formik.setFieldValue('spec.templateFields', [])
      }
    }
  }, [serviceNowTemplateMetaDataQuery.data?.data])

  useEffect(() => {
    // Clear field list to be displayed under dynamic field selector or template section, if fixed ticket type is not chosen
    if (ticketValueType !== MultiTypeInputType.FIXED) {
      formik.setFieldValue('spec.selectedFields', [])
      formik.setFieldValue('spec.templateFields', [])
      formik.setFieldValue('spec.templateName', '')
      setTicketFieldList([])
      setTemplateName('')
    }
  }, [ticketValueType])

  const ticketTypesLoading = serviceNowTicketTypesQuery.loading
  const ticketTypesFetchError = defaultTo(
    (serviceNowTicketTypesQuery?.error?.data as Error)?.message,
    serviceNowTicketTypesQuery?.error?.message
  )
  const shouldShowTicketTypesError = !ticketTypesLoading && !isEmpty(ticketTypesFetchError)

  const [showDynamicFieldsModal, hideDynamicFieldsModal] = useModalHook(() => {
    return (
      <Dialog
        className={css.addFieldsModal}
        enforceFocus={false}
        isOpen
        onClose={hideDynamicFieldsModal}
        title={getString('pipeline.serviceNowCreateStep.addFields')}
      >
        <ServiceNowDynamicFieldsSelector
          connectorRef={connectorRefFixedValue || ''}
          selectedTicketTypeKey={ticketTypeKeyFixedValue?.toString() || ''}
          serviceNowType={serviceNowType}
          selectedFields={formik.values.spec.selectedFields}
          ticketTypeBasedFieldList={ticketFieldList}
          addSelectedFields={(fieldsToBeAdded: ServiceNowFieldNG[]) => {
            formik.setFieldValue(
              'spec.selectedFields',
              getSelectedFieldsToBeAddedInForm(
                fieldsToBeAdded,
                formik.values.spec.selectedFields,
                formik.values.spec.fields
              )
            )
            hideDynamicFieldsModal()
          }}
          provideFieldList={(fields: ServiceNowCreateFieldType[]) => {
            formik.setFieldValue(
              'spec.fields',
              getKVFieldsToBeAddedInForm(fields, formik.values.spec.fields, formik.values.spec.selectedFields)
            )
            hideDynamicFieldsModal()
          }}
          onCancel={hideDynamicFieldsModal}
        />
      </Dialog>
    )
  }, [connectorRefFixedValue, formik.values.spec.selectedFields, formik.values.spec.fields])

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
        tooltipProps={{ dataTooltipId: 'serviceNowCreateAddFields' }}
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
            enableConfigureOptions: true,
            allowableTypes
          }}
        />
      </div>

      <div className={stepCss.divider} />

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeConnectorField
          name="spec.connectorRef"
          label={getString('pipeline.serviceNowApprovalStep.connectorRef')}
          width={390}
          className={css.connector}
          connectorLabelClass={css.connectorLabel}
          placeholder={getString('select')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          setRefValue
          type="ServiceNow"
          enableConfigureOptions={false}
          selected={formik?.values?.spec.connectorRef as string}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(value: any, _unused, multiType) => {
            // Clear dependent fields
            setConnectorValueType(multiType)
            if (value?.record?.identifier !== connectorRefFixedValue) {
              resetForm(formik, 'connectorRef')
              setCount(count + 1)
              if (multiType !== MultiTypeInputType.FIXED) {
                setServiceNowTicketTypesOptions([])
              }
            }
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConnectorConfigureOptions
            style={{ marginTop: 14 }}
            value={formik.values.spec.connectorRef as string}
            type="String"
            variableName="spec.connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => formik.setFieldValue('spec.connectorRef', value)}
            isReadonly={readonly}
            connectorReferenceFieldProps={{
              accountIdentifier: accountId,
              projectIdentifier,
              orgIdentifier,
              type: Connectors.SERVICE_NOW,
              label: getString('pipeline.serviceNowApprovalStep.connectorRef'),
              disabled: isApprovalStepFieldDisabled(readonly),
              gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }
            }}
          />
        )}
      </div>
      <React.Fragment key={count}>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTypeInput
            tooltipProps={{
              dataTooltipId: 'serviceNowApprovalTicketType'
            }}
            selectItems={
              ticketTypesLoading
                ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
                : serviceNowTicketTypesOptions
            }
            label={getString('pipeline.serviceNowApprovalStep.ticketType')}
            name="spec.ticketType"
            placeholder={
              ticketTypesLoading
                ? getString(fetchingTicketTypesPlaceholder)
                : serviceNowTicketTypesQuery.error?.message || getString('select')
            }
            helperText={
              shouldShowTicketTypesError ? (
                <FormError name={'serviceNowTicketType'} errorMessage={ticketTypesFetchError} />
              ) : undefined
            }
            intent={shouldShowTicketTypesError ? Intent.DANGER : Intent.NONE}
            useValue
            disabled={isApprovalStepFieldDisabled(readonly, ticketTypesLoading)}
            multiTypeInputProps={{
              selectProps: {
                addClearBtn: true,
                allowCreatingNewItems: !!CDS_SERVICENOW_TICKET_TYPE_V2,
                items: ticketTypesLoading
                  ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
                  : serviceNowTicketTypesOptions
              },
              allowableTypes,
              expressions,
              onChange: (value: unknown, _valueType, type) => {
                setTicketValueType(type)
                // Clear dependent fields
                if (
                  type === MultiTypeInputType.FIXED &&
                  !isEmpty(value) &&
                  (value as ServiceNowTicketTypeSelectOption) !== ticketTypeKeyFixedValue
                ) {
                  resetForm(formik, 'ticketType')
                  setCount(count + 1)
                }
              }
            }}
          />
        </div>

        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTextInput
            tooltipProps={{
              dataTooltipId: 'serviceNowApprovalTicketNumber'
            }}
            label={getString('pipeline.serviceNowApprovalStep.issueNumber')}
            name="spec.ticketNumber"
            placeholder={getString('pipeline.serviceNowApprovalStep.issueNumberPlaceholder')}
            disabled={isApprovalStepFieldDisabled(readonly)}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values.spec.ticketNumber) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={formik.values.spec.ticketNumber}
              type="String"
              variableName="spec.ticketNumber"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => formik.setFieldValue('spec.ticketNumber', value)}
              isReadonly={readonly}
            />
          )}
        </div>
        <div className={stepCss.noLookDivider} />
      </React.Fragment>
      <div className={stepCss.divider} />
      <React.Fragment>
        <FormInput.RadioGroup
          disabled={isApprovalStepFieldDisabled(readonly)}
          radioGroup={{ inline: true }}
          name="spec.fieldType"
          items={[
            {
              label: getString('pipeline.serviceNowUpdateStep.fieldType.updateFields'),
              value: FieldType.ConfigureFields
            },
            {
              label: getString('pipeline.serviceNowUpdateStep.fieldType.applyFromTemplate'),
              value: FieldType.CreateFromTemplate,
              disabled: !isTemplateSectionAvailable
            }
          ]}
          onChange={event => {
            formik.setFieldValue(
              'spec.useServiceNowTemplate',
              event.currentTarget.value === FieldType.CreateFromTemplate
            )
          }}
        />
        {formik.values.spec.fieldType === FieldType.ConfigureFields && (
          <div>
            {serviceNowIssueCreateMetadataQuery.loading ? (
              <PageSpinner
                message={getString('pipeline.serviceNowCreateStep.fetchingFields')}
                className={css.fetching}
              />
            ) : (
              <>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormMultiTypeTextAreaField
                    label={getString('description')}
                    name="spec.description"
                    placeholder={getString('pipeline.serviceNowCreateStep.descriptionPlaceholder')}
                    multiTypeTextArea={{ enableConfigureOptions: false, expressions, allowableTypes }}
                    disabled={isApprovalStepFieldDisabled(readonly)}
                  />
                  {getMultiTypeFromValue(formik.values.spec.description) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formik.values.spec.description || ''}
                      type="String"
                      variableName="spec.description"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.description', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormMultiTypeTextAreaField
                    label={getString('pipeline.serviceNowCreateStep.shortDescription')}
                    name="spec.shortDescription"
                    placeholder={getString('pipeline.serviceNowCreateStep.shortDescriptionPlaceholder')}
                    multiTypeTextArea={{ enableConfigureOptions: false, expressions, allowableTypes }}
                    disabled={isApprovalStepFieldDisabled(readonly)}
                  />
                  {getMultiTypeFromValue(formik.values.spec.shortDescription) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formik.values.spec.shortDescription || ''}
                      type="String"
                      variableName="spec.shortDescription"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.shortDescription', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <ServiceNowFieldsRenderer
                  selectedFields={formik.values.spec.selectedFields}
                  readonly={readonly}
                  onDelete={(index, selectedField) => {
                    const selectedFieldsAfterRemoval = formik.values.spec.selectedFields?.filter(
                      (_unused, i) => i !== index
                    )
                    formik.setFieldValue('spec.selectedFields', selectedFieldsAfterRemoval)
                    const customFields = formik.values.spec.fields?.filter(field => field.name !== selectedField.name)
                    formik.setFieldValue('spec.fields', customFields)
                  }}
                  allowableTypes={allowableTypes}
                />

                {!isEmpty(formik.values.spec.fields) ? (
                  <FieldArray
                    name="spec.fields"
                    render={({ remove }) => {
                      return (
                        <div>
                          <div className={css.headerRow}>
                            <String className={css.label} stringID="keyLabel" />
                            <String className={css.label} stringID="valueLabel" />
                          </div>
                          {formik.values.spec.fields?.map((_unused: ServiceNowCreateFieldType, i: number) => (
                            <div className={css.headerRow} key={i}>
                              <FormInput.Text
                                name={`spec.fields[${i}].name`}
                                disabled={isApprovalStepFieldDisabled(readonly)}
                                placeholder={getString('pipeline.keyPlaceholder')}
                              />
                              <FormInput.MultiTextInput
                                name={`spec.fields[${i}].value`}
                                label=""
                                placeholder={getString('common.valuePlaceholder')}
                                disabled={isApprovalStepFieldDisabled(readonly)}
                                multiTextInputProps={{
                                  allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                                    item => !isMultiTypeRuntime(item)
                                  ) as AllowedTypes,
                                  expressions
                                }}
                              />
                              <Button
                                minimal
                                icon="main-trash"
                                disabled={isApprovalStepFieldDisabled(readonly)}
                                data-testid={`remove-fieldList-${i}`}
                                onClick={() => remove(i)}
                              />
                            </div>
                          ))}
                        </div>
                      )
                    }}
                  />
                ) : null}
              </>
            )}

            <AddFieldsButton />
          </div>
        )}
        {formik.values.spec.fieldType === FieldType.CreateFromTemplate && (
          <div>
            {serviceNowTemplateMetaDataQuery.loading ? (
              <PageSpinner
                message={getString('pipeline.serviceNowCreateStep.fetchingTemplateDetails')}
                className={css.fetching}
              />
            ) : (
              <>
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.MultiTextInput
                    label={getString('pipeline.serviceNowCreateStep.templateName')}
                    name={`spec.templateName`}
                    disabled={isApprovalStepFieldDisabled(readonly)}
                    multiTextInputProps={{
                      placeholder: getString('pipeline.serviceNowCreateStep.templateNamePlaceholder'),
                      textProps: {
                        onBlurCapture: values => {
                          setTemplateName(values.target.value)
                          if (values.target.value !== templateName) {
                            resetForm(formik, 'templateName')
                          }
                        }
                      },
                      allowableTypes: allowableTypes
                    }}
                  />
                  {getMultiTypeFromValue(formik.values.spec.templateName) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formik.values.spec.templateName || ''}
                      type="String"
                      variableName="spec.templateName"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => formik.setFieldValue('spec.templateName', value)}
                      isReadonly={readonly}
                    />
                  )}
                </div>
                <ServiceNowTemplateFieldsRenderer
                  templateFields={formik.values.spec.templateFields}
                  templateName={formik.values.spec.templateName}
                />
              </>
            )}
          </div>
        )}
      </React.Fragment>
    </React.Fragment>
  )
}

function ServiceNowUpdateStepMode(
  props: ServiceNowUpdateStepModeProps,
  formikRef: StepFormikFowardRef<ServiceNowUpdateData>
) {
  const { onUpdate, isNewStep, readonly, onChange, stepViewType, allowableTypes } = props
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
  const { CDS_SERVICENOW_TICKET_TYPE_V2 } = useFeatureFlags()

  const serviceNowTicketTypesQuery = useGetServiceNowTicketTypes({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const serviceNowTicketTypesV2Query = useGetServiceNowTicketTypesV2({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const serviceNowIssueCreateMetadataQuery = useGetServiceNowIssueMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })
  const serviceNowTemplateMetaDataQuery = useGetServiceNowTemplateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: '',
      ticketType: '',
      templateName: '',
      limit: 1,
      offset: 0
    }
  })

  return (
    <Formik<ServiceNowUpdateData>
      onSubmit={values => {
        onUpdate?.(processFormData(values))
      }}
      formName="serviceNowCreate"
      initialValues={props.initialValues}
      validate={data => {
        onChange?.(processFormData(data))
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: ConnectorRefSchema(getString, {
            requiredErrorMsg: getString('pipeline.serviceNowApprovalStep.validations.connectorRef')
          }),
          ticketType: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.ticketType')),
          description: Yup.string().when('useServiceNowTemplate', {
            is: false,
            then: Yup.string().required(getString('pipeline.serviceNowCreateStep.validations.description'))
          }),
          shortDescription: Yup.string().when('useServiceNowTemplate', {
            is: false,
            then: Yup.string().required(getString('pipeline.serviceNowCreateStep.validations.shortDescription'))
          }),
          ticketNumber: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.issueNumber')),
          templateName: Yup.string().when('useServiceNowTemplate', {
            is: true,
            then: Yup.string()
              .required(getString('pipeline.serviceNowCreateStep.validations.templateName'))
              .test(
                'templateNameTest',
                getString('pipeline.serviceNowCreateStep.validations.validTemplateName'),
                function () {
                  return (
                    // if not fixed then allow saving or
                    // if fixed then template name should be available from the APi call
                    // (templateFields indicates the fields fetched

                    getMultiTypeFromValue(this.parent.templateName) !== MultiTypeInputType.FIXED ||
                    (this.parent.templateFields?.length > 0 &&
                      getMultiTypeFromValue(this.parent.templateName) === MultiTypeInputType.FIXED &&
                      !isEmpty(this.parent.templateName))
                  )
                }
              )
          })
        })
      })}
    >
      {(formik: FormikProps<ServiceNowUpdateData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              readonly={readonly}
              isNewStep={isNewStep}
              serviceNowTicketTypesQuery={
                CDS_SERVICENOW_TICKET_TYPE_V2 ? serviceNowTicketTypesV2Query : serviceNowTicketTypesQuery
              }
              serviceNowIssueCreateMetadataQuery={serviceNowIssueCreateMetadataQuery}
              serviceNowTemplateMetaDataQuery={serviceNowTemplateMetaDataQuery}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

const ServiceNowUpdateStepModeWithRef = React.forwardRef(ServiceNowUpdateStepMode)
export default ServiceNowUpdateStepModeWithRef
