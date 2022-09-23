/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import {
  AllowedTypes,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption
} from '@wings-software/uicore'

import { useClusters } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import type { ECSBlueGreenCreateServiceStepInitialValues } from './ECSBlueGreenCreateServiceStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ECSBlueGreenCreateServiceStep.module.scss'

export interface ECSBlueGreenCreateServiceStepProps {
  initialValues: ECSBlueGreenCreateServiceStepInitialValues
  onUpdate?: (data: ECSBlueGreenCreateServiceStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: ECSBlueGreenCreateServiceStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const ECSBlueGreenCreateServiceStepEdit = (
  props: ECSBlueGreenCreateServiceStepProps,
  formikRef: StepFormikFowardRef<ECSBlueGreenCreateServiceStepInitialValues>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  // @TODO - this call is fake API call and we have mocked data as of now to test dropdowns
  // The reason is real APIs for this step are not ready from BE side.
  // Once APIs are ready this call will be replaced with the correct ones.
  const { data: awsClusters, loading: loadingClusters } = useClusters({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      awsConnectorRef: '',
      region: ''
    },
    mock: {
      loading: false,
      data: {
        data: ['abc', 'def']
      }
    }
  })

  const clusters: SelectOption[] = React.useMemo(() => {
    return defaultTo(awsClusters?.data, []).map(cluster => ({
      value: cluster,
      label: cluster
    }))
  }, [awsClusters?.data])

  return (
    <>
      <Formik<ECSBlueGreenCreateServiceStepInitialValues>
        onSubmit={(values: ECSBlueGreenCreateServiceStepInitialValues) => {
          onUpdate?.(values)
        }}
        formName="ecsBlueGreenCreateServiceStepEdit"
        initialValues={initialValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            loadBalancer: Yup.string().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('pipeline.loadBalancer')
              })
            ),
            prodListener: Yup.string().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('cd.steps.ecsBGCreateServiceStep.labels.prodListener')
              })
            ),
            prodListenerRuleArn: Yup.string().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('cd.steps.ecsBGCreateServiceStep.labels.prodListenerRuleARN')
              })
            ),
            stageListener: Yup.string().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('cd.steps.ecsBGCreateServiceStep.labels.stageListener')
              })
            ),
            stageListenerRuleArn: Yup.string().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('cd.steps.ecsBGCreateServiceStep.labels.stageListenerRuleARN')
              })
            )
          })
        })}
      >
        {(formik: FormikProps<ECSBlueGreenCreateServiceStepInitialValues>) => {
          setFormikRef(formikRef, formik)
          const { values, setFieldValue } = formik
          return (
            <>
              <NameTimeoutField
                values={{ name: values.name, timeout: values.timeout }}
                setFieldValue={setFieldValue}
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />

              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTypeInput
                  name="spec.loadBalancer"
                  selectItems={clusters}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: clusters
                    }
                  }}
                  label={getString('pipeline.loadBalancer')}
                  placeholder={loadingClusters ? getString('loading') : getString('select')}
                  disabled={defaultTo(loadingClusters, readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.loadBalancer) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={clusters}
                    value={formik.values.spec.loadBalancer as string}
                    type="String"
                    variableName="spec.loadBalancer"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('spec.loadBalancer', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </div>

              <div className={css.configureServiceTitle}>
                {getString('cd.steps.ecsBGCreateServiceStep.sectionHeaders.configureProductionService')}
              </div>

              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTypeInput
                  name="spec.prodListener"
                  selectItems={clusters}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: clusters
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListener')}
                  placeholder={loadingClusters ? getString('loading') : getString('select')}
                  disabled={defaultTo(loadingClusters, readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.prodListener) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={clusters}
                    value={formik.values.spec.prodListener as string}
                    type="String"
                    variableName="spec.prodListener"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('spec.prodListener', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </div>
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTypeInput
                  name="spec.prodListenerRuleArn"
                  selectItems={clusters}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: clusters
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListenerRuleARN')}
                  placeholder={loadingClusters ? getString('loading') : getString('select')}
                  disabled={defaultTo(loadingClusters, readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.prodListenerRuleArn) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={clusters}
                    value={formik.values.spec.prodListenerRuleArn as string}
                    type="String"
                    variableName="spec.prodListenerRuleArn"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('spec.prodListenerRuleArn', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </div>

              <div className={css.configureServiceTitle}>
                {getString('cd.steps.ecsBGCreateServiceStep.sectionHeaders.configureStageService')}
              </div>

              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTypeInput
                  name="spec.stageListener"
                  selectItems={clusters}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: clusters
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListener')}
                  placeholder={loadingClusters ? getString('loading') : getString('select')}
                  disabled={defaultTo(loadingClusters, readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.stageListener) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={clusters}
                    value={formik.values.spec.stageListener as string}
                    type="String"
                    variableName="spec.stageListener"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('spec.stageListener', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </div>
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTypeInput
                  name="spec.stageListenerRuleArn"
                  selectItems={clusters}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: clusters
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListenerRuleARN')}
                  placeholder={loadingClusters ? getString('loading') : getString('select')}
                  disabled={defaultTo(loadingClusters, readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.stageListenerRuleArn) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={clusters}
                    value={formik.values.spec.stageListenerRuleArn as string}
                    type="String"
                    variableName="spec.stageListenerRuleArn"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('spec.stageListenerRuleArn', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </div>
            </>
          )
        }}
      </Formik>
    </>
  )
}

export const ECSBlueGreenCreateServiceStepEditRef = React.forwardRef(ECSBlueGreenCreateServiceStepEdit)
