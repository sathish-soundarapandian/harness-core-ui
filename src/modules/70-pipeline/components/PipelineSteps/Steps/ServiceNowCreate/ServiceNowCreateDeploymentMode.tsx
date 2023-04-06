/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty, isNull, isUndefined } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType, PageSpinner } from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type {
  ServiceNowCreateDeploymentModeFormContentInterface,
  ServiceNowCreateDeploymentModeProps
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/types'
import type { ServiceNowTicketTypeSelectOption } from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/types'
import {
  ServiceNowTicketTypeDTO,
  useGetServiceNowIssueMetadata,
  useGetServiceNowTicketTypes,
  useGetServiceNowTicketTypesV2
} from 'services/cd-ng'
import { FormMultiTypeTextAreaField } from '@common/components'
import {
  ServiceNowCreateFieldType,
  ServiceNowFieldNGWithValue,
  ServiceNowStaticFields
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/types'
import {
  getInitialValueForSelectedField,
  setServiceNowFieldAllowedValuesOptions
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/helper'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getGenuineValue } from '../ServiceNowApproval/helper'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'

import css from './ServiceNowCreate.module.scss'

const fetchingTicketTypesPlaceholder: StringKeys = 'pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'
function FormContent(formContentProps: ServiceNowCreateDeploymentModeFormContentInterface) {
  const {
    inputSetData,
    allowableTypes,
    initialValues,
    stepViewType,
    getServiceNowTicketTypesQuery,
    getServiceNowTicketTypesV2Query,
    getServiceNowIssueCreateMetadataQuery
  } = formContentProps
  const template = inputSetData?.template
  const path = inputSetData?.path
  const prefix = isEmpty(path) ? '' : `${path}.`
  const readonly = inputSetData?.readonly
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { expressions } = useVariablesExpression()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const [serviceNowTicketTypesOptions, setServiceNowTicketTypesOptions] = React.useState<
    ServiceNowTicketTypeSelectOption[]
  >([])
  const [customFields, setCustomFields] = useState<ServiceNowFieldNGWithValue[]>([])
  const ticketTypeKeyFixedValue = getGenuineValue(
    initialValues.spec?.ticketType || (inputSetData?.allValues?.spec?.ticketType as string)
  )
  const connectorRefFixedValue = getGenuineValue(
    initialValues.spec?.connectorRef || (inputSetData?.allValues?.spec?.connectorRef as string)
  )
  const descriptionFieldIndex = template?.spec?.fields?.findIndex(
    field => field.name === ServiceNowStaticFields.description
  )
  const shortDescriptionFieldIndex = template?.spec?.fields?.findIndex(
    field => field.name === ServiceNowStaticFields.short_description
  )
  // If there are fields apart from desc & short description, then fetch metadata
  const areFieldsRuntime = template?.spec?.fields?.findIndex(
    field =>
      field?.name !== ServiceNowStaticFields.short_description && field?.name !== ServiceNowStaticFields.description
  )
  // If index is zero/ or greater than return true, if null (no field available) then return false
  const fetchMetadataRequired = areFieldsRuntime === 0 ? true : areFieldsRuntime ? areFieldsRuntime > 0 : false

  const { CDS_SERVICENOW_TICKET_TYPE_V2 } = useFeatureFlags()

  useEffect(() => {
    if (connectorRefFixedValue) {
      if (CDS_SERVICENOW_TICKET_TYPE_V2) {
        getServiceNowTicketTypesV2Query.refetch({
          queryParams: {
            ...commonParams,
            connectorRef: connectorRefFixedValue.toString()
          }
        })
      } else {
        getServiceNowTicketTypesQuery.refetch({
          queryParams: {
            ...commonParams,
            connectorRef: connectorRefFixedValue.toString()
          }
        })
      }
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    // Set ticket types
    let options: ServiceNowTicketTypeSelectOption[] = []
    const ticketTypesResponseList: ServiceNowTicketTypeDTO[] =
      getServiceNowTicketTypesQuery.data?.data || getServiceNowTicketTypesV2Query.data?.data || []
    options = ticketTypesResponseList.map((ticketType: ServiceNowTicketTypeDTO) => ({
      label: defaultTo(ticketType.name, ''),
      value: defaultTo(ticketType.key, ''),
      key: defaultTo(ticketType.key, '')
    }))
    setServiceNowTicketTypesOptions(options)
  }, [getServiceNowTicketTypesV2Query.data?.data, getServiceNowTicketTypesQuery.data?.data])
  useDeepCompareEffect(() => {
    if (connectorRefFixedValue && ticketTypeKeyFixedValue && fetchMetadataRequired) {
      getServiceNowIssueCreateMetadataQuery.refetch({
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
      if (template?.spec?.fields && getServiceNowIssueCreateMetadataQuery.data?.data) {
        getServiceNowIssueCreateMetadataQuery.data?.data.forEach(field => {
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
  }, [getServiceNowIssueCreateMetadataQuery.data?.data])

  const ticketTypesLoading = getServiceNowTicketTypesQuery.loading || getServiceNowTicketTypesV2Query.loading
  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <TimeoutFieldInputSetView
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
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
            ticketTypesLoading
              ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
              : serviceNowTicketTypesOptions
          }
          name={`${prefix}spec.ticketType`}
          label={getString('pipeline.serviceNowApprovalStep.ticketType')}
          className={css.deploymentViewMedium}
          placeholder={
            ticketTypesLoading
              ? getString(fetchingTicketTypesPlaceholder)
              : getServiceNowTicketTypesQuery?.error?.message ||
                getServiceNowTicketTypesV2Query?.error?.message ||
                getString('select')
          }
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
            allowableTypes
          }}
        />
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
      {getServiceNowIssueCreateMetadataQuery.loading ? (
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

export default function ServiceNowCreateDeploymentMode(props: ServiceNowCreateDeploymentModeProps): JSX.Element {
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

  const getServiceNowTicketTypesQuery = useGetServiceNowTicketTypes({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const getServiceNowTicketTypesV2Query = useGetServiceNowTicketTypesV2({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const getServiceNowIssueCreateMetadataQuery = useGetServiceNowIssueMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })
  return (
    <FormContent
      {...props}
      getServiceNowIssueCreateMetadataQuery={getServiceNowIssueCreateMetadataQuery}
      getServiceNowTicketTypesQuery={getServiceNowTicketTypesQuery}
      getServiceNowTicketTypesV2Query={getServiceNowTicketTypesV2Query}
    />
  )
}
