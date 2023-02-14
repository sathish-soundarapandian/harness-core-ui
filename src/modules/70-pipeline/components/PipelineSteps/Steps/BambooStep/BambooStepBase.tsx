/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { useGetPlansKey } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { Connectors } from '@connectors/constants'
// import { NoTagResults } from '@common/components/MultiTypeTagSelector/MultiTypeTagSelector'
// import { EXPRESSION_STRING } from '@pipeline/utils/constants'

// import { getGenuineValue } from '../JiraApproval/helper'
import type { BambooFormContentInterface, BambooStepData } from './types'
import { variableSchema } from './helper'
import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import type { BambooStepProps } from './BambooStep'
import { getGenuineValue } from '../JiraApproval/helper'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './BambooStep.module.scss'

function FormContent({
  formik,
  isNewStep,
  readonly,
  allowableTypes,
  stepViewType
}: BambooFormContentInterface): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  // const { values: formValues } = formik
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  // const [planDetails, setPlanDetails] = useState<SelectOption[]>([])

  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const {
    refetch: refetchPlans,
    data: plansResponse,
    loading: loadingPlans,
    error: plansError
  } = useGetPlansKey({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  // eslint-disable-next-line no-console
  console.log(plansResponse, 'plans response api', refetchPlans)

  return (
    <React.Fragment>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('name')}
            isIdentifierEditable={isNewStep}
            inputGroupProps={{
              placeholder: getString('pipeline.stepNamePlaceholder'),
              disabled: readonly
            }}
          />
        </div>
      )}

      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          disabled={readonly}
          multiTypeDurationProps={{
            expressions,
            enableConfigureOptions: true,
            allowableTypes
          }}
        />
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeConnectorField
          name="spec.connectorRef"
          label={getString('connectors.bamboo.bambooConnectorLabel')}
          width={390}
          className={css.connector}
          connectorLabelClass={css.connectorLabel}
          placeholder={getString('select')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          type="Bamboo"
          enableConfigureOptions={false}
          selected={formik?.values?.spec.connectorRef as string}
          // onChange={(value: any, _unused) => {
          //   if (value?.record?.identifier !== connectorRefFixedValue) {
          //     resetForm(
          //       formik,
          //       'connectorRef',
          //       '',
          //       !(getMultiTypeFromValue(formik.values.spec.planName) === MultiTypeInputType.RUNTIME)
          //     )
          //     setJobDetails([])
          //   }
          //   lastOpenedJob.current = null
          // }}
          disabled={readonly}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
          <ConnectorConfigureOptions
            style={{ marginTop: 6 }}
            value={formik.values.spec.connectorRef as string}
            type="String"
            variableName="spec.connectorRef"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.connectorRef', value)}
            isReadonly={readonly}
            connectorReferenceFieldProps={{
              accountIdentifier: accountId,
              projectIdentifier,
              orgIdentifier,
              type: Connectors.Bamboo,
              label: getString('connectors.bamboo.bambooConnectorLabel'),
              disabled: readonly,
              gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }
            }}
          />
        )}
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg, css.jobDetails)}>
        <FormInput.MultiTypeInput
          label={getString('pipeline.bamboo.planName')}
          name="spec.planName"
          useValue
          selectItems={[]}
          placeholder={
            connectorRefFixedValue && getMultiTypeFromValue(connectorRefFixedValue) === MultiTypeInputType.FIXED
              ? loadingPlans
                ? getString('pipeline.bamboo.fetchingPlans')
                : plansError?.message
                ? plansError?.message
                : getString('pipeline.planNamePlaceholder')
              : getString('select')
          }
          // multiTypeInputProps={{
          //   onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.planName', type),
          //   expressions,
          //   selectProps: {
          //     allowCreatingNewItems: true,
          //     addClearBtn: true,
          //     items: [],
          //     loadingItems: loadingPlans,
          //     itemRenderer: planPathItemRenderer
          //   },
          //   onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
          //     if (
          //       e?.target?.type !== 'text' ||
          //       (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
          //     ) {
          //       return
          //     }
          //     refetchPlans()
          //   },
          //   allowableTypes
          // }}
        />
        {getMultiTypeFromValue(formik.values.spec.planName) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            style={{ marginTop: -4 }}
            value={formik.values.spec.planName as string}
            type="String"
            variableName="spec.planName"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => formik.setFieldValue('spec.planName', value)}
            isReadonly={readonly}
          />
        )}
      </div>
    </React.Fragment>
  )
}

export function BambooStepBase(
  { initialValues, onUpdate, isNewStep = true, readonly, allowableTypes, stepViewType, onChange }: BambooStepProps,
  formikRef: StepFormikFowardRef<BambooStepData>
): React.ReactElement {
  const { getString } = useStrings()
  const validationSchema = Yup.object().shape({
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      connectorRef: Yup.lazy(value =>
        typeof value === 'object'
          ? Yup.object().required(getString('common.validation.connectorRef')) // typeError is necessary here, otherwise we get a bad-looking yup error
          : Yup.string().required(getString('common.validation.connectorRef'))
      ),
      planName: Yup.lazy(value =>
        typeof value === 'object'
          ? Yup.object().required(getString('pipeline.bambooStep.validations.planName')) // typeError is necessary here, otherwise we get a bad-looking yup error
          : Yup.string().required(getString('pipeline.bambooStep.validations.planName'))
      ),
      planParameter: Yup.lazy(value =>
        typeof value === 'object'
          ? variableSchema(getString) // typeError is necessary here, otherwise we get a bad-looking yup error
          : Yup.string()
      )
    }),
    ...getNameAndIdentifierSchema(getString, stepViewType)
  })

  return (
    <Formik
      initialValues={initialValues}
      formName="BambooStep"
      validate={valuesToValidate => {
        onChange?.(valuesToValidate)
      }}
      onSubmit={(_values: BambooStepData) => {
        onUpdate?.(_values)
      }}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<BambooStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <FormContent
              formik={formik}
              allowableTypes={allowableTypes}
              stepViewType={stepViewType}
              readonly={readonly}
              isNewStep={isNewStep}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const BambooStepBaseWithRef = React.forwardRef(BambooStepBase)
