/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef, Fragment, useEffect, useRef, useState } from 'react'
import { Formik, FormikForm, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, sortBy } from 'lodash-es'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
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
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/helper'
import { useStrings } from 'framework/strings'
import { ConnectorRefSchema } from '@common/utils/Validation'
import { useGetServiceNowStagingTables } from 'services/cd-ng'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { Connectors } from '@connectors/constants'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { isMultiTypeRuntime } from '@common/utils/utils'
import type {
  ServiceNowImportSetData,
  ServiceNowImportSetFormContentInterface,
  ServiceNowImportSetStepModeProps,
  ServiceNowStagingTableSelectOption
} from './types'
import css from '@pipeline/components/PipelineSteps/Steps/ServiceNowImportSet/ServiceNowImportSet.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function FormContent({
  formik,
  allowableTypes,
  stepViewType,
  getServiceNowStagingTablesQuery,
  readonly,
  isNewStep,
  handleErrorMessage
}: ServiceNowImportSetFormContentInterface): JSX.Element {
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
  const fetchingStagingTableNamePlaceholder = getString(
    'pipeline.serviceNowImportSetStep.fetchingStagingTableNamePlaceholder'
  )
  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)
  const errorMessage = get(getServiceNowStagingTablesQuery.error, 'data.message')

  useEffect(() => {
    if (errorMessage) {
      let tempErrorMessage
      try {
        tempErrorMessage = JSON.parse(errorMessage)
        // eslint-disable-next-line no-empty
      } catch (_) {}
      tempErrorMessage =
        isMultiTypeRuntime(connectorValueType) || isEmpty(formik.values.spec.connectorRef)
          ? ''
          : get(tempErrorMessage, 'error.message', errorMessage)
      handleErrorMessage(tempErrorMessage)
      formik.setFieldTouched('spec.stagingTableName', true)
    }
  }, [getServiceNowStagingTablesQuery.error, connectorValueType, formik.values.spec.connectorRef])

  const stagingTableFixedValue =
    getMultiTypeFromValue(formik.values.spec.stagingTableName) === MultiTypeInputType.FIXED &&
    !isEmpty(formik.values.spec.stagingTableName)
      ? formik.values.spec.stagingTableName
      : undefined

  let serviceNowStagingTablesOptions: ServiceNowStagingTableSelectOption[] =
    connectorRefFixedValue &&
    connectorValueType === MultiTypeInputType.FIXED &&
    !getServiceNowStagingTablesQuery.loading
      ? getServiceNowStagingTablesQuery.data?.data?.map(stagingTable => ({
          label: defaultTo(stagingTable.label, ''),
          value: defaultTo(stagingTable.name, ''),
          key: defaultTo(stagingTable.name, '')
        })) || []
      : []

  /* istanbul ignore else */
  if (!isEmpty(serviceNowStagingTablesOptions))
    serviceNowStagingTablesOptions = sortBy(serviceNowStagingTablesOptions, stagingTable =>
      stagingTable.label.toLowerCase()
    )

  useEffect(() => {
    if (connectorRefFixedValue && connectorValueType === MultiTypeInputType.FIXED) {
      getServiceNowStagingTablesQuery.refetch({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue])

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
          selected={get(formik?.values, 'spec.connectorRef') as string}
          onChange={
            /* istanbul ignore next */ (value: unknown, _unused, multiType) => {
              setConnectorValueType(multiType)
              if (get(value, 'record.identifier') !== connectorRefFixedValue) {
                formik.setFieldValue('spec.stagingTableName', '')
                setCount(count + 1)
              }
            }
          }
          disabled={isApprovalStepFieldDisabled(readonly)}
          gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConnectorConfigureOptions
            style={{ marginTop: 14 }}
            value={get(formik?.values, 'spec.connectorRef') as string}
            type="String"
            variableName="spec.connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            onChange={/* istanbul ignore next */ value => formik.setFieldValue('spec.connectorRef', value)}
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
      <Fragment key={count}>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTypeInput
            selectItems={
              getServiceNowStagingTablesQuery.loading
                ? [{ label: fetchingStagingTableNamePlaceholder, value: fetchingStagingTableNamePlaceholder }]
                : serviceNowStagingTablesOptions
            }
            label={getString('pipeline.serviceNowImportSetStep.stagingTable')}
            name="spec.stagingTableName"
            placeholder={
              getServiceNowStagingTablesQuery.loading
                ? fetchingStagingTableNamePlaceholder
                : isMultiTypeRuntime(connectorValueType) || isEmpty(formik.values.spec.connectorRef)
                ? getString('select')
                : get(getServiceNowStagingTablesQuery, 'error.message', getString('select'))
            }
            useValue
            disabled={isApprovalStepFieldDisabled(readonly, getServiceNowStagingTablesQuery.loading)}
            multiTypeInputProps={{
              selectProps: {
                addClearBtn: true,
                allowCreatingNewItems: true,
                items: getServiceNowStagingTablesQuery.loading
                  ? [{ label: fetchingStagingTableNamePlaceholder, value: fetchingStagingTableNamePlaceholder }]
                  : serviceNowStagingTablesOptions
              },
              allowableTypes,
              expressions,
              onChange: /* istanbul ignore next */ (value: unknown, _valueType, type) => {
                if (
                  type === MultiTypeInputType.FIXED &&
                  !isEmpty(value) &&
                  (value as ServiceNowStagingTableSelectOption) !== stagingTableFixedValue
                ) {
                  setCount(count + 1)
                }
              }
            }}
          />
        </div>
        <div className={cx(stepCss.formGroup, stepCss.alignStart)}>
          <MultiTypeFieldSelector
            name="spec.importData.spec.jsonBody"
            label={getString('pipeline.serviceNowImportSetStep.jsonBody')}
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={readonly}
            disableTypeSelection={readonly}
            expressionRender={
              /* istanbul ignore next */ () => {
                return (
                  <MonacoTextField
                    name="spec.importData.spec.jsonBody"
                    expressions={expressions}
                    height={300}
                    disabled={readonly}
                    fullScreenAllowed
                    fullScreenTitle={getString('pipeline.serviceNowImportSetStep.jsonBody')}
                  />
                )
              }
            }
          >
            <MonacoTextField
              name="spec.importData.spec.jsonBody"
              expressions={expressions}
              height={320}
              disabled={readonly}
              fullScreenAllowed
              fullScreenTitle={getString('pipeline.serviceNowImportSetStep.jsonBody')}
            />
          </MultiTypeFieldSelector>
        </div>
      </Fragment>
    </Fragment>
  )
}

function ServiceNowImportSetStepMode(
  props: ServiceNowImportSetStepModeProps,
  formikRef: StepFormikFowardRef<ServiceNowImportSetData>
): JSX.Element {
  const { onUpdate, readonly, isNewStep, allowableTypes, stepViewType, onChange } = props
  const { getString } = useStrings()
  const errorMessage = useRef<string>('')
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

  const getServiceNowStagingTablesQuery = useGetServiceNowStagingTables({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })
  return (
    <Formik<ServiceNowImportSetData>
      formName="serviceNowImportSet"
      initialValues={props.initialValues}
      onSubmit={
        /* istanbul ignore next */ values => {
          onUpdate?.(values)
        }
      }
      validate={
        /* istanbul ignore next */ formData => {
          onChange?.(formData)
        }
      }
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          connectorRef: ConnectorRefSchema(getString, {
            requiredErrorMsg: getString('pipeline.serviceNowApprovalStep.validations.connectorRef')
          }),
          stagingTableName: Yup.lazy((value?: string): Yup.Schema<string | undefined> => {
            if (
              !isEmpty(errorMessage.current) &&
              getMultiTypeFromValue(value) === MultiTypeInputType.FIXED &&
              isEmpty(value)
            )
              return Yup.string().required(errorMessage.current)
            return Yup.string().required(getString('pipeline.serviceNowImportSetStep.validations.stagingTableRequired'))
          }),
          importData: Yup.object().shape({
            spec: Yup.object().shape({
              jsonBody: Yup.lazy((value): Yup.Schema<string | undefined> => {
                /* istanbul ignore else */
                if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
                  return Yup.string()
                    .trim()
                    .test({
                      test(val: string): boolean | Yup.ValidationError {
                        /* istanbul ignore else */
                        if (isEmpty(val)) {
                          return this.createError({
                            message: getString('pipeline.serviceNowImportSetStep.validations.jsonRequired')
                          })
                        }
                        let isValid = true
                        try {
                          JSON.parse(val)
                        } catch (_e) {
                          isValid = false
                        }
                        if (!isValid) {
                          return this.createError({
                            message: getString('pipeline.serviceNowImportSetStep.validations.invalidJson')
                          })
                        }
                        return true
                      }
                    })
                }
                return Yup.string().required(getString('pipeline.serviceNowImportSetStep.validations.jsonRequired'))
              })
            })
          })
        })
      })}
    >
      {(formik: FormikProps<ServiceNowImportSetData>) => {
        setFormikRef(formikRef, formik)
        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              getServiceNowStagingTablesQuery={getServiceNowStagingTablesQuery}
              readonly={readonly}
              isNewStep={isNewStep}
              handleErrorMessage={(message: string) => (errorMessage.current = message)}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
const ServiceNowImportSetStepModeWithRef = forwardRef(ServiceNowImportSetStepMode)
export default ServiceNowImportSetStepModeWithRef
