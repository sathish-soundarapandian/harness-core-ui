/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption
} from '@harness/uicore'
import { FieldArray, FormikProps } from 'formik'
import * as Yup from 'yup'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { isArray, memoize } from 'lodash-es'
import type { IItemRendererProps } from '@blueprintjs/select'

import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'

import { useStrings } from 'framework/strings'

// import { BambooPlanNames, useGetPlansKey } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
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
import { BambooPlanNames, useGetPlansKey } from 'services/cd-ng'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'

import type { BambooFormContentInterface, BambooStepData } from './types'
import { scriptInputType, variableSchema } from './helper'
import { getNameAndIdentifierSchema } from '../StepsValidateUtils'
import type { BambooStepProps } from './BambooStep'
import { getGenuineValue } from '../JiraApproval/helper'
import type { jobParameterInterface } from '../JenkinsStep/types'

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
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [planDetails, setPlanDetails] = useState<SelectOption[]>([])

  const connectorRefFixedValue = getGenuineValue(formik.values.spec.connectorRef)

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const {
    data: plansResponse,
    loading: loadingPlans,
    refetch: refetchPlans,
    error: plansError
  } = useMutateAsGet(useGetPlansKey, {
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefFixedValue?.toString() as string
    },

    lazy: true,
    body: {}
  })

  useEffect(() => {
    if (plansResponse?.data?.planKeys) {
      const planOptions: SelectOption[] = (plansResponse?.data?.planKeys || [])?.map((plan: BambooPlanNames) => {
        return {
          label: plan.name,
          value: plan.name
        } as SelectOption
      }) || [
        {
          label: getString('common.loadingFieldOptions', {
            fieldName: getString('common.subscriptions.tabs.plans')
          }),
          value: getString('common.loadingFieldOptions', {
            fieldName: getString('common.subscriptions.tabs.plans')
          })
        }
      ]
      setPlanDetails(planOptions)
    }
  }, [plansResponse?.data?.planKeys])

  const planPathItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loadingPlans} />
  ))

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
            onChange={value => formik.setFieldValue('spec.connectorRef', value)}
            isReadonly={readonly}
            connectorReferenceFieldProps={{
              accountIdentifier: accountId,
              projectIdentifier,
              orgIdentifier,
              type: Connectors.Bamboo,
              label: getString('connectors.bamboo.bamboo'),
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
          selectItems={planDetails}
          placeholder={
            connectorRefFixedValue && getMultiTypeFromValue(connectorRefFixedValue) === MultiTypeInputType.FIXED
              ? loadingPlans
                ? getString('common.loadingFieldOptions', {
                    fieldName: getString('common.subscriptions.tabs.plans')
                  })
                : plansError?.message
                ? plansError?.message
                : getString('pipeline.planNamePlaceholder')
              : getString('select')
          }
          multiTypeInputProps={{
            onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.planName', type),
            expressions,
            selectProps: {
              allowCreatingNewItems: true,
              addClearBtn: true,
              items: planDetails,
              loadingItems: loadingPlans,
              itemRenderer: planPathItemRenderer,
              noResults: (
                <NoTagResults
                  tagError={plansError}
                  isServerlessDeploymentTypeSelected={false}
                  defaultErrorText={getString('pipeline.bambooStep.noPlans')}
                />
              )
            },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
              ) {
                return
              }
              refetchPlans()
            },
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec.planName) === MultiTypeInputType.RUNTIME && (
          <SelectConfigureOptions
            style={{ marginTop: -4 }}
            value={formik.values.spec.planName as string}
            type="String"
            variableName="spec.planName"
            options={planDetails}
            loading={loadingPlans}
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => formik.setFieldValue('spec.planName', value)}
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name="spec.planParameter"
          key={getMultiTypeFromValue(formik.values.spec.planParameter as string)}
          label={getString('pipeline.bambooStep.planParameter')}
          isOptional
          optionalLabel={getString('titleOptional')}
          defaultValueToReset={[]}
          allowedTypes={allowableTypes}
          disableTypeSelection={false}
        >
          <FieldArray
            name="spec.planParameter"
            render={({ push, remove }) => {
              return (
                <div className={css.panel}>
                  <div className={css.jobParameter}>
                    <span className={css.label}>Name</span>
                    <span className={css.label}>Type</span>
                    <span className={css.label}>Value</span>
                  </div>

                  {isArray(formik.values.spec.planParameter) &&
                    formik.values.spec.planParameter?.map((type: jobParameterInterface, i: number) => {
                      return (
                        <div className={css.jobParameter} key={type.id}>
                          <FormInput.Text
                            name={`spec.planParameter.[${i}].name`}
                            placeholder={getString('name')}
                            disabled={readonly}
                          />
                          <FormInput.Select
                            items={scriptInputType}
                            name={`spec.planParameter.[${i}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={readonly}
                          />
                          <FormInput.MultiTextInput
                            name={`spec.planParameter.[${i}].value`}
                            placeholder={getString('valueLabel')}
                            multiTextInputProps={{
                              allowableTypes,
                              expressions,
                              disabled: readonly
                            }}
                            label=""
                            disabled={readonly}
                          />
                          <Button
                            variation={ButtonVariation.ICON}
                            icon="main-trash"
                            data-testid={`remove-planParameter-${i}`}
                            onClick={() => remove(i)}
                            disabled={readonly}
                          />
                        </div>
                      )
                    })}
                  <Button
                    icon="plus"
                    variation={ButtonVariation.LINK}
                    data-testid="add-planParameter"
                    disabled={readonly}
                    onClick={() => push({ name: '', type: 'String', value: '' })}
                    className={css.addButton}
                  >
                    {getString('pipeline.bambooStep.addPlanParameters')}
                  </Button>
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
        {getMultiTypeFromValue(formik.values?.spec?.planParameter as string) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values?.spec?.planParameter as string}
            type="String"
            variableName="spec.planParameter"
            className={css.minConfigBtn}
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setValues({
                ...formik.values,
                spec: {
                  ...formik.values.spec,
                  planParameter: value
                }
              })
            }}
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
