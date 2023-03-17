/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef, Fragment, useEffect, useState } from 'react'
import {
  Accordion,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType
} from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty } from 'lodash-es'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  ServiceNowApprovalData,
  ServiceNowApprovalStepModeProps,
  ServiceNowFormContentInterface,
  ServiceNowTicketTypeSelectOption,
  resetForm
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'

import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { isApprovalStepFieldDisabled } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalCommons'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ApprovalRejectionCriteriaType } from '@pipeline/components/PipelineSteps/Steps/Common/types'
import { useGetServiceNowIssueCreateMetadata, useGetServiceNowTicketTypes } from 'services/cd-ng'
import {
  getApprovalRejectionCriteriaForInitialValues,
  getGenuineValue
} from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/helper'
import { StringKeys, useStrings } from 'framework/strings'
import { ConnectorRefSchema } from '@common/utils/Validation'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { Connectors } from '@connectors/constants'
import { ServiceNowApprovalRejectionCriteria } from './ServiceNowApprovalRejectionCriteria'
import { ServiceNowApprovalChangeWindow } from './ServiceNowApprovalChangeWindow'
import css from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/ServiceNowApproval.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const fetchingTicketTypesPlaceholder: StringKeys = 'pipeline.serviceNowApprovalStep.fetchingTicketTypesPlaceholder'

function FormContent({
  formik,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType,
  getServiceNowTicketTypesQuery,
  getServiceNowIssueCreateMetadataQuery
}: ServiceNowFormContentInterface): JSX.Element {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [count, setCount] = useState(0)
  const [connectorValueType, setConnectorValueType] = useState<MultiTypeInputType>(MultiTypeInputType.FIXED)
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

  const serviceNowTicketTypesOptions: ServiceNowTicketTypeSelectOption[] =
    connectorRefFixedValue && connectorValueType === MultiTypeInputType.FIXED && !getServiceNowTicketTypesQuery.loading
      ? getServiceNowTicketTypesQuery.data?.data?.map(ticketType => ({
          label: defaultTo(ticketType.name, ''),
          value: defaultTo(ticketType.key, ''),
          key: defaultTo(ticketType.key, '')
        })) || []
      : []

  const fieldList =
    connectorRefFixedValue && ticketTypeKeyFixedValue && !getServiceNowIssueCreateMetadataQuery.loading
      ? getServiceNowIssueCreateMetadataQuery?.data?.data || []
      : []

  useEffect(() => {
    if (connectorRefFixedValue && connectorValueType === MultiTypeInputType.FIXED) {
      getServiceNowTicketTypesQuery.refetch({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue])

  useDeepCompareEffect(() => {
    if (ticketTypeKeyFixedValue && connectorRefFixedValue) {
      getServiceNowIssueCreateMetadataQuery.refetch({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString(),
          ticketType: ticketTypeKeyFixedValue.toString()
        }
      })
      const approvalCriteria = getApprovalRejectionCriteriaForInitialValues(formik.values.spec.approvalCriteria)
      formik.setFieldValue('spec.approvalCriteria', approvalCriteria)
      const rejectionCriteria = getApprovalRejectionCriteriaForInitialValues(formik.values.spec.rejectionCriteria)
      formik.setFieldValue('spec.rejectionCriteria', rejectionCriteria)
    }
  }, [ticketTypeKeyFixedValue, connectorRefFixedValue])

  return (
    <Fragment>
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
            }
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConnectorConfigureOptions
            style={{ marginTop: 8 }}
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
              disabled: readonly,
              gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }
            }}
          />
        )}
      </div>
      <Fragment key={count}>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTypeInput
            tooltipProps={{
              dataTooltipId: 'serviceNowApprovalTicketType'
            }}
            selectItems={
              getServiceNowTicketTypesQuery.loading
                ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
                : serviceNowTicketTypesOptions
            }
            label={getString('pipeline.serviceNowApprovalStep.ticketType')}
            name="spec.ticketType"
            placeholder={
              getServiceNowTicketTypesQuery.loading
                ? getString(fetchingTicketTypesPlaceholder)
                : getServiceNowTicketTypesQuery.error?.message || getString('select')
            }
            useValue
            disabled={isApprovalStepFieldDisabled(readonly, getServiceNowTicketTypesQuery.loading)}
            multiTypeInputProps={{
              selectProps: {
                addClearBtn: true,
                items: getServiceNowTicketTypesQuery.loading
                  ? [{ label: getString(fetchingTicketTypesPlaceholder), value: '' }]
                  : serviceNowTicketTypesOptions
              },
              allowableTypes,
              expressions,
              onChange: (value: unknown, _valueType, type) => {
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
              allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
            />
          )}
        </div>
        <ServiceNowApprovalRejectionCriteria
          fieldList={fieldList}
          title={getString('pipeline.approvalCriteria.approvalCriteria')}
          isFetchingFields={false}
          mode="approvalCriteria"
          values={formik.values.spec.approvalCriteria}
          onChange={values => formik.setFieldValue('spec.approvalCriteria', values)}
          formik={formik}
          readonly={readonly}
        />
      </Fragment>
      <div className={stepCss.noLookDivider} />
      <Accordion className={stepCss.accordion}>
        <Accordion.Panel
          id="optional-config"
          summary={getString('common.optionalConfig')}
          details={
            <Layout.Vertical spacing="medium">
              <ServiceNowApprovalRejectionCriteria
                fieldList={fieldList}
                title={getString('pipeline.approvalCriteria.rejectionCriteria')}
                isFetchingFields={false}
                mode="rejectionCriteria"
                values={formik.values.spec.rejectionCriteria}
                onChange={values => formik.setFieldValue('spec.rejectionCriteria', values)}
                formik={formik}
                readonly={readonly}
              />
              <ServiceNowApprovalChangeWindow
                formik={formik}
                readonly={!!readonly}
                fieldList={fieldList}
                getServiceNowIssueCreateMetadataQuery={getServiceNowIssueCreateMetadataQuery}
              />
            </Layout.Vertical>
          }
        />
      </Accordion>
    </Fragment>
  )
}

function ServiceNowApprovalStepMode(
  props: ServiceNowApprovalStepModeProps,
  formikRef: StepFormikFowardRef<ServiceNowApprovalData>
): JSX.Element {
  const { onUpdate, readonly, isNewStep, allowableTypes, stepViewType, onChange } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    branch,
    repoIdentifier
  }
  const getServiceNowTicketTypesQuery = useGetServiceNowTicketTypes({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const getServiceNowIssueCreateMetadataQuery = useGetServiceNowIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })
  return (
    <Formik<ServiceNowApprovalData>
      onSubmit={values => onUpdate?.(values)}
      formName="serviceNowApproval"
      initialValues={props.initialValues}
      validate={data => {
        onChange?.(data)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: ConnectorRefSchema(getString, {
            requiredErrorMsg: getString('pipeline.serviceNowApprovalStep.validations.connectorRef')
          }),
          ticketType: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.ticketType')),
          ticketNumber: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.issueNumber')),
          approvalCriteria: Yup.object().shape({
            spec: Yup.object().when('type', {
              is: ApprovalRejectionCriteriaType.KeyValues,
              then: Yup.object().shape({
                conditions: Yup.array()
                  .min(1, getString('pipeline.approvalCriteria.validations.approvalCriteriaCondition'))
                  .of(
                    Yup.object().shape({
                      key: Yup.string().required(getString('common.validation.fieldIsRequired', { name: 'Field' })),
                      value: Yup.string().trim().required(getString('common.validation.valueIsRequired'))
                    })
                  )
              }),
              otherwise: Yup.object().shape({
                expression: Yup.string().trim().required(getString('pipeline.approvalCriteria.validations.expression'))
              })
            })
          }),
          changeWindow: Yup.object().shape(
            {
              startField: Yup.string().when('endField', {
                is: endField => !!endField,
                then: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.windowStart'))
              }),
              endField: Yup.string().when('startField', {
                is: startField => !!startField,
                then: Yup.string().required(getString('pipeline.serviceNowApprovalStep.validations.windowEnd'))
              })
            },
            [['startField', 'endField']]
          )
        })
      })}
    >
      {(formik: FormikProps<ServiceNowApprovalData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              readonly={readonly}
              isNewStep={isNewStep}
              getServiceNowTicketTypesQuery={getServiceNowTicketTypesQuery}
              getServiceNowIssueCreateMetadataQuery={getServiceNowIssueCreateMetadataQuery}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
const ServiceNowApprovalStepModeWithRef = forwardRef(ServiceNowApprovalStepMode)
export default ServiceNowApprovalStepModeWithRef
