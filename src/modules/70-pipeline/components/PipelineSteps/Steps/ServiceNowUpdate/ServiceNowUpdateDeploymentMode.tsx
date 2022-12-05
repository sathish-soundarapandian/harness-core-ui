/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty, isNull, isUndefined } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType, PageSpinner } from '@harness/uicore'
import { useStrings, StringKeys } from 'framework/strings'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeTextAreaField } from '@common/components'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { ServiceNowTicketTypeDTO } from 'services/cd-ng'
import { useGetServiceNowIssueMetadata, useGetServiceNowTicketTypes } from 'services/cd-ng'
import {
  ServiceNowCreateFieldType,
  ServiceNowFieldNGWithValue,
  ServiceNowStaticFields
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/types'

import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/helper'
import type { ServiceNowTicketTypeSelectOption } from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/types'
import type {
  ServiceNowUpdateDeploymentModeFormContentInterface,
  ServiceNowUpdateDeploymentModeProps
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowUpdate/types'
import {
  getInitialValueForSelectedField,
  setServiceNowFieldAllowedValuesOptions
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/helper'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components//InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import css from './ServiceNowUpdate.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const fetchingTicketTypesPlaceholder: StringKeys = 'pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'

function FormContent(formContentProps: ServiceNowUpdateDeploymentModeFormContentInterface): JSX.Element {
  const {
    inputSetData,
    allowableTypes,
    initialValues,
    refetchServiceNowTicketTypes,
    fetchingServiceNowTicketTypes,
    serviceNowTicketTypesFetchError,
    serviceNowTicketTypesResponse,
    refetchServiceNowMetadata,
    fetchingServiceNowMetadata,
    serviceNowMetadataResponse,
    stepViewType
  } = formContentProps
  const template = inputSetData?.template
  const path = inputSetData?.path
  const prefix = isEmpty(path) ? '' : `${path}.`
  const readonly = inputSetData?.readonly
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const { expressions } = useVariablesExpression()

  const connectorRefFixedValue = getGenuineValue(
    initialValues.spec?.connectorRef || (inputSetData?.allValues?.spec?.connectorRef as string)
  )
  const descriptionFieldIndex = template?.spec?.fields?.findIndex(
    field => field.name === ServiceNowStaticFields.description
  )
  const shortDescriptionFieldIndex = template?.spec?.fields?.findIndex(
    field => field.name === ServiceNowStaticFields.short_description
  )
  const [serviceNowTicketTypesOptions, setServiceNowTicketTypesOptions] = React.useState<
    ServiceNowTicketTypeSelectOption[]
  >([])
  const [customFields, setCustomFields] = useState<ServiceNowFieldNGWithValue[]>([])
  const ticketTypeKeyFixedValue = getGenuineValue(
    initialValues.spec?.ticketType || (inputSetData?.allValues?.spec?.ticketType as string)
  )
  // If there are fields apart from desc & short description, then fetch metadata
  const areFieldsRuntime = template?.spec?.fields?.findIndex(
    field =>
      field?.name !== ServiceNowStaticFields.short_description && field?.name !== ServiceNowStaticFields.description
  )
  // If index is zero/ or greater than return true, if null (no field available) then return false
  const fetchMetadataRequired = areFieldsRuntime === 0 ? true : areFieldsRuntime ? areFieldsRuntime > 0 : false

  useEffect(() => {
    if (connectorRefFixedValue) {
      refetchServiceNowTicketTypes({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    // Set ticket types
    let options: ServiceNowTicketTypeSelectOption[] = []
    const ticketTypesResponseList: ServiceNowTicketTypeDTO[] = serviceNowTicketTypesResponse?.data || []
    options = ticketTypesResponseList.map((ticketType: ServiceNowTicketTypeDTO) => ({
      label: defaultTo(ticketType.name, ''),
      value: defaultTo(ticketType.key, ''),
      key: defaultTo(ticketType.key, '')
    }))
    setServiceNowTicketTypesOptions(options)
  }, [serviceNowTicketTypesResponse?.data])
  useDeepCompareEffect(() => {
    if (connectorRefFixedValue && ticketTypeKeyFixedValue && fetchMetadataRequired) {
      refetchServiceNowMetadata({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString(),
          ticketType: ticketTypeKeyFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue, ticketTypeKeyFixedValue])
  useEffect(() => {
    const selectedFields: ServiceNowFieldNGWithValue[] = []
    if (ticketTypeKeyFixedValue) {
      if (template?.spec?.fields && serviceNowMetadataResponse?.data) {
        serviceNowMetadataResponse?.data.forEach(field => {
          if (
            field &&
            field.key !== ServiceNowStaticFields.short_description &&
            field.key !== ServiceNowStaticFields.description
          ) {
            const savedValueForThisField = getInitialValueForSelectedField(template?.spec?.fields || [], field)
            if (savedValueForThisField) {
              selectedFields.push({ ...field, value: savedValueForThisField })
            }
          }
        })
        setCustomFields(selectedFields)
      } else if (ticketTypeKeyFixedValue !== undefined) {
        setCustomFields([])
      }
    }
  }, [serviceNowMetadataResponse?.data])
  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <TimeoutFieldInputSetView
          name={`${prefix}timeout`}
          label={getString('pipelineSteps.timeoutLabel')}
          className={css.deploymentViewMedium}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: isApprovalStepFieldDisabled(readonly)
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          template={template}
          fieldPath={'timeout'}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME ? (
        <FormMultiTypeConnectorField
          name={`${prefix}spec.connectorRef`}
          label={getString('pipeline.serviceNowApprovalStep.connectorRef')}
          selected={(initialValues?.spec?.connectorRef as string) || ''}
          placeholder={getString('pipeline.serviceNowApprovalStep.serviceNowConnectorPlaceholder')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={385}
          setRefValue
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeProps={{
            allowableTypes,
            expressions
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          type={'ServiceNow'}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          templateProps={{
            isTemplatizedView: true,
            templateValue: template?.spec?.connectorRef
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.ticketType) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiTypeInput
          tooltipProps={{
            dataTooltipId: 'serviceNowApprovalTicketType'
          }}
          selectItems={
            fetchingServiceNowTicketTypes
              ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
              : serviceNowTicketTypesOptions
          }
          name={`${prefix}spec.ticketType`}
          label={getString('pipeline.serviceNowApprovalStep.ticketType')}
          className={css.deploymentViewMedium}
          placeholder={
            fetchingServiceNowTicketTypes
              ? getString(fetchingTicketTypesPlaceholder)
              : serviceNowTicketTypesFetchError?.message
              ? serviceNowTicketTypesFetchError?.message
              : getString('select')
          }
          useValue
          disabled={isApprovalStepFieldDisabled(readonly, fetchingServiceNowTicketTypes)}
          multiTypeInputProps={{
            selectProps: {
              addClearBtn: true,
              items: fetchingServiceNowTicketTypes
                ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
                : serviceNowTicketTypesOptions
            },
            allowableTypes
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.ticketNumber) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            label={getString('pipeline.serviceNowApprovalStep.issueNumber')}
            name={`${prefix}spec.ticketNumber`}
            multiTextInputProps={{
              disabled: isApprovalStepFieldDisabled(readonly),
              expressions,
              allowableTypes
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            template={template}
            fieldPath="spec.ticketNumber"
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(
        template?.spec?.fields?.find(field => field.name === ServiceNowStaticFields.description)?.value as string
      ) === MultiTypeInputType.RUNTIME ? (
        <FormMultiTypeTextAreaField
          multiTypeTextArea={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            expressions,
            allowableTypes
          }}
          label={getString('description')}
          className={css.deploymentViewMedium}
          name={`${prefix}spec.fields[${descriptionFieldIndex}].value`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          placeholder={getString('common.descriptionPlaceholder')}
        />
      ) : null}
      {getMultiTypeFromValue(
        template?.spec?.fields?.find(field => field.name === ServiceNowStaticFields.short_description)?.value as string
      ) === MultiTypeInputType.RUNTIME ? (
        <FormMultiTypeTextAreaField
          multiTypeTextArea={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            expressions,
            allowableTypes
          }}
          label={getString('pipeline.serviceNowCreateStep.shortDescription')}
          className={css.deploymentViewMedium}
          name={`${prefix}spec.fields[${shortDescriptionFieldIndex}].value`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          placeholder={getString('pipeline.serviceNowCreateStep.shortDescriptionPlaceholder')}
        />
      ) : null}
      {getMultiTypeFromValue(template?.spec?.templateName) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          label={getString('pipeline.serviceNowCreateStep.templateName')}
          name={`${prefix}spec.templateName`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTextInputProps={{
            placeholder: getString('pipeline.serviceNowCreateStep.templateNamePlaceholder'),
            allowableTypes: allowableTypes
          }}
          configureOptionsProps={{ isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType) }}
          className={css.deploymentViewMedium}
          fieldPath={'spec.templateName'}
          template={template}
        />
      )}
      {fetchingServiceNowMetadata ? (
        <PageSpinner message={getString('pipeline.serviceNowCreateStep.fetchingFields')} className={css.fetching} />
      ) : fetchMetadataRequired && customFields?.length === 0 ? (
        // Metadata fetch failed, so display as key value pair

        <div>
          {template?.spec?.fields?.map((_unused: ServiceNowCreateFieldType, i: number) => {
            if (
              _unused.name !== ServiceNowStaticFields.description &&
              _unused.name !== ServiceNowStaticFields.short_description
            ) {
              return (
                <FormInput.MultiTextInput
                  className={css.deploymentViewMedium}
                  name={`${prefix}spec.fields[${i}].value`}
                  label={_unused.name}
                  placeholder={getString('common.valuePlaceholder')}
                  disabled={isApprovalStepFieldDisabled(readonly)}
                  multiTextInputProps={{
                    allowableTypes: allowableTypes,
                    expressions
                  }}
                />
              )
            }
          })}
        </div>
      ) : (
        template?.spec?.fields?.map((field, index) => {
          if (
            field.name !== ServiceNowStaticFields.short_description &&
            field.name !== ServiceNowStaticFields.description
          ) {
            const fieldIndex = customFields?.findIndex(customField => customField.key === field.name)
            if (fieldIndex >= 0) {
              if (customFields[fieldIndex].allowedValues && customFields[fieldIndex].schema?.type === 'option') {
                return (
                  <FormInput.MultiTypeInput
                    selectItems={setServiceNowFieldAllowedValuesOptions(customFields[fieldIndex].allowedValues)}
                    label={customFields[fieldIndex].name}
                    name={`${prefix}spec.fields[${index}].value`}
                    placeholder={customFields[fieldIndex].name}
                    disabled={isApprovalStepFieldDisabled(readonly)}
                    className={css.deploymentViewMedium}
                    multiTypeInputProps={{ allowableTypes: allowableTypes, expressions }}
                    useValue
                  />
                )
              } else if (
                isNull(customFields[fieldIndex].schema) ||
                isUndefined(customFields[fieldIndex].schema) ||
                customFields[fieldIndex].schema.type === 'string' ||
                customFields[fieldIndex].schema.type === 'glide_date_time' ||
                customFields[fieldIndex].schema.type === 'integer' ||
                (isEmpty(customFields[fieldIndex].allowedValues) &&
                  customFields[fieldIndex].schema.type === 'option' &&
                  customFields[fieldIndex].schema.array)
              ) {
                return (
                  <FormInput.MultiTextInput
                    label={customFields[fieldIndex].name}
                    disabled={isApprovalStepFieldDisabled(readonly)}
                    name={`${prefix}spec.fields[${index}].value`}
                    placeholder={customFields[fieldIndex].name}
                    className={css.deploymentViewMedium}
                    multiTextInputProps={{
                      allowableTypes: allowableTypes,
                      expressions
                    }}
                  />
                )
              }
            }
          }
        })
      )}
    </React.Fragment>
  )
}

export default function ServiceNowUpdateDeploymentMode(props: ServiceNowUpdateDeploymentModeProps): JSX.Element {
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
    refetch: refetchServiceNowTicketTypes,
    data: serviceNowTicketTypesResponse,
    error: serviceNowTicketTypesFetchError,
    loading: fetchingServiceNowTicketTypes
  } = useGetServiceNowTicketTypes({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })
  const {
    refetch: refetchServiceNowMetadata,
    data: serviceNowMetadataResponse,
    error: serviceNowMetadataFetchError,
    loading: fetchingServiceNowMetadata
  } = useGetServiceNowIssueMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  return (
    <FormContent
      {...props}
      refetchServiceNowTicketTypes={refetchServiceNowTicketTypes}
      fetchingServiceNowTicketTypes={fetchingServiceNowTicketTypes}
      serviceNowTicketTypesResponse={serviceNowTicketTypesResponse}
      serviceNowTicketTypesFetchError={serviceNowTicketTypesFetchError}
      refetchServiceNowMetadata={refetchServiceNowMetadata}
      fetchingServiceNowMetadata={fetchingServiceNowMetadata}
      serviceNowMetadataResponse={serviceNowMetadataResponse}
      serviceNowMetadataFetchError={serviceNowMetadataFetchError}
    />
  )
}
