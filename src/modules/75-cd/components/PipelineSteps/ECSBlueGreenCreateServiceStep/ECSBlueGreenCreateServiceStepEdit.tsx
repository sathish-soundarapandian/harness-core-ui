/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import produce from 'immer'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import {
  AllowedTypes,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption
} from '@wings-software/uicore'

import { listenerRulesPromise, ResponseListString, useElasticLoadBalancers, useListeners } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import type {
  ECSBlueGreenCreateServiceStepInitialValues,
  ECSBlueGreenCreateServiceCustomStepProps
} from './ECSBlueGreenCreateServiceStep'
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
  customStepProps: ECSBlueGreenCreateServiceCustomStepProps
}

const ECSBlueGreenCreateServiceStepEdit = (
  props: ECSBlueGreenCreateServiceStepProps,
  formikRef: StepFormikFowardRef<ECSBlueGreenCreateServiceStepInitialValues>
): React.ReactElement => {
  const {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    onChange,
    allowableTypes,
    stepViewType,
    customStepProps
  } = props
  const { selectedStage } = customStepProps

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [prodListenerRules, setProdListenerRules] = useState<SelectOption[]>([])
  const [prodListenerRulesLoading, setProdListenerRulesLoading] = useState<boolean>(false)
  const [stageListenerRules, setStageListenerRules] = useState<SelectOption[]>([])
  const [stageListenerRulesLoading, setStageListenerRulesLoading] = useState<boolean>(false)

  const environmentRef = defaultTo(
    selectedStage.stage?.spec?.environment?.environmentRef,
    selectedStage.stage?.spec?.infrastructure?.environmentRef
  )
  const infrastructureRef = selectedStage.stage?.spec?.environment?.infrastructureDefinitions?.[0].identifier

  const awsConnectorRef = selectedStage?.stage?.spec?.infrastructure?.infrastructureDefinition?.spec.connectorRef
  const region = selectedStage?.stage?.spec?.infrastructure?.infrastructureDefinition?.spec.region

  const { data: loadBalancers, loading: loadingLoadBalancers } = useElasticLoadBalancers({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      awsConnectorRef,
      region,
      envId: environmentRef,
      infraDefinitionId: infrastructureRef
    }
  })
  const loadBalancerOptions: SelectOption[] = React.useMemo(() => {
    return defaultTo(loadBalancers?.data, []).map(loadBalancer => ({
      value: loadBalancer,
      label: loadBalancer
    }))
  }, [loadBalancers?.data])

  const {
    data: listeners,
    loading: loadingListeners,
    refetch: refetchListeners
  } = useListeners({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      envId: environmentRef,
      infraDefinitionId: infrastructureRef,
      awsConnectorRef,
      region,
      elasticLoadBalancer: initialValues.spec.loadBalancer
    }
  })
  const listenerOptions: SelectOption[] = React.useMemo(() => {
    const listenerData = defaultTo(listeners?.data, {})
    return Object.keys(listenerData).map(listenerKey => ({
      value: listenerData[listenerKey],
      label: listenerKey
    }))
  }, [listeners?.data])

  React.useEffect(() => {
    if (!isEmpty(initialValues.spec.loadBalancer) && !isEmpty(initialValues.spec.prodListener)) {
      fetchProdListenerRules(initialValues.spec.loadBalancer, initialValues.spec.prodListener)
    }
    if (!isEmpty(initialValues.spec.loadBalancer) && !isEmpty(initialValues.spec.stageListener)) {
      fetchStageListenerRules(initialValues.spec.loadBalancer, initialValues.spec.stageListener)
    }
  }, [initialValues.spec.loadBalancer, initialValues.spec.prodListener, initialValues.spec.stageListener])

  const fetchProdListenerRules = (selectedLoadBalancer: string, selectedListener: string) => {
    if (
      (awsConnectorRef && region && selectedLoadBalancer && selectedListener) ||
      (environmentRef && infrastructureRef)
    ) {
      setProdListenerRulesLoading(true)
      listenerRulesPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          envId: environmentRef,
          infraDefinitionId: infrastructureRef,
          awsConnectorRef,
          region,
          elasticLoadBalancer: selectedLoadBalancer,
          listenerArn: selectedListener
        }
      })
        .then((response: ResponseListString) => {
          const listenerRulesData = defaultTo(response?.data, [])
          const listenerRulesOptions = listenerRulesData.map(listenerRule => ({
            value: listenerRule,
            label: listenerRule
          }))
          setProdListenerRules(listenerRulesOptions)
        })
        .catch(() => {
          setProdListenerRules([])
        })
      setProdListenerRulesLoading(false)
    }
  }

  const fetchStageListenerRules = (selectedLoadBalancer: string, selectedListener: string) => {
    if (
      (awsConnectorRef && region && selectedLoadBalancer && selectedListener) ||
      (environmentRef && infrastructureRef)
    ) {
      setStageListenerRulesLoading(true)
      listenerRulesPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          envId: environmentRef,
          infraDefinitionId: infrastructureRef,
          awsConnectorRef,
          region,
          elasticLoadBalancer: selectedLoadBalancer,
          listenerArn: selectedListener
        }
      })
        .then((response: ResponseListString) => {
          const listenerRulesData = defaultTo(response?.data, [])
          const listenerRulesOptions = listenerRulesData.map(listenerRule => ({
            value: listenerRule,
            label: listenerRule
          }))
          setStageListenerRules(listenerRulesOptions)
        })
        .catch(() => {
          setStageListenerRules([])
        })
      setStageListenerRulesLoading(false)
    }
  }

  const onLoadBalancerChange = (
    selectedLoadBalancer: string,
    formik: FormikProps<ECSBlueGreenCreateServiceStepInitialValues>
  ) => {
    refetchListeners({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        envId: environmentRef,
        infraDefinitionId: infrastructureRef,
        awsConnectorRef,
        region,
        elasticLoadBalancer: selectedLoadBalancer
      }
    })
    formik.setFieldValue('spec.loadBalancer', selectedLoadBalancer)
    if (getMultiTypeFromValue(formik.values.spec.prodListener) === MultiTypeInputType.FIXED) {
      formik.setFieldValue('spec.prodListener', '')
    }
    if (getMultiTypeFromValue(formik.values.spec.prodListenerRuleArn) === MultiTypeInputType.FIXED) {
      formik.setFieldValue('spec.prodListenerRuleArn', '')
    }
    if (getMultiTypeFromValue(formik.values.spec.stageListener) === MultiTypeInputType.FIXED) {
      formik.setFieldValue('spec.stageListener', '')
    }
    if (getMultiTypeFromValue(formik.values.spec.stageListenerRuleArn) === MultiTypeInputType.FIXED) {
      formik.setFieldValue('spec.stageListenerRuleArn', '')
    }
    setProdListenerRules([])
    setStageListenerRules([])
  }

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
                name: getString('common.loadBalancer')
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
            <FormikForm>
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
                  selectItems={loadBalancerOptions}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: loadBalancerOptions,
                      popoverClassName: css.dropdownMenu
                    },
                    onChange: selectedValue => {
                      const selectedValueString =
                        typeof selectedValue === 'string'
                          ? selectedValue
                          : ((selectedValue as SelectOption)?.value as string)
                      onLoadBalancerChange(selectedValueString, formik)
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.elasticLoadBalancer')}
                  placeholder={loadingLoadBalancers ? getString('loading') : getString('select')}
                />
                {getMultiTypeFromValue(formik.values.spec.loadBalancer) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={loadBalancerOptions}
                    value={formik.values.spec.loadBalancer as string}
                    type="String"
                    variableName="spec.loadBalancer"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      onLoadBalancerChange(value, formik)
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
                  selectItems={listenerOptions}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: listenerOptions,
                      popoverClassName: css.dropdownMenu
                    },
                    onChange: selectedValue => {
                      const selectedValueString =
                        typeof selectedValue === 'string'
                          ? selectedValue
                          : ((selectedValue as SelectOption).value as string)
                      fetchProdListenerRules(formik.values.spec.loadBalancer, selectedValueString)
                      const updatedValues = produce(formik.values, draft => {
                        draft.spec.prodListener = selectedValueString
                        if (getMultiTypeFromValue(draft.spec.prodListenerRuleArn) === MultiTypeInputType.FIXED) {
                          draft.spec.prodListenerRuleArn = ''
                        }
                      })
                      formik.setValues(updatedValues)
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListener')}
                  placeholder={loadingListeners ? getString('loading') : getString('select')}
                  disabled={defaultTo(loadingListeners, readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.prodListener) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={listenerOptions}
                    value={formik.values.spec.prodListener as string}
                    type="String"
                    variableName="spec.prodListener"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      fetchProdListenerRules(formik.values.spec.loadBalancer, value)
                      const updatedValues = produce(formik.values, draft => {
                        draft.spec.prodListener = value
                        if (getMultiTypeFromValue(draft.spec.prodListenerRuleArn) === MultiTypeInputType.FIXED) {
                          draft.spec.prodListenerRuleArn = ''
                        }
                      })
                      formik.setValues(updatedValues)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </div>
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTypeInput
                  name="spec.prodListenerRuleArn"
                  selectItems={prodListenerRules}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: prodListenerRules,
                      popoverClassName: css.dropdownMenu
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListenerRuleARN')}
                  placeholder={prodListenerRulesLoading ? getString('loading') : getString('select')}
                  disabled={defaultTo(prodListenerRulesLoading, readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.prodListenerRuleArn) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={prodListenerRules}
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
                  selectItems={listenerOptions}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: listenerOptions,
                      popoverClassName: css.dropdownMenu
                    },
                    onChange: selectedValue => {
                      const selectedValueString =
                        typeof selectedValue === 'string'
                          ? selectedValue
                          : ((selectedValue as SelectOption).value as string)
                      fetchStageListenerRules(formik.values.spec.loadBalancer, selectedValueString)
                      const updatedValues = produce(formik.values, draft => {
                        draft.spec.stageListener = selectedValueString
                        if (getMultiTypeFromValue(draft.spec.stageListenerRuleArn) === MultiTypeInputType.FIXED) {
                          draft.spec.stageListenerRuleArn = ''
                        }
                      })
                      formik.setValues(updatedValues)
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListener')}
                  placeholder={loadingListeners ? getString('loading') : getString('select')}
                  disabled={defaultTo(loadingListeners, readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.stageListener) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={listenerOptions}
                    value={formik.values.spec.stageListener as string}
                    type="String"
                    variableName="spec.stageListener"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      fetchProdListenerRules(formik.values.spec.loadBalancer, value)
                      const updatedValues = produce(formik.values, draft => {
                        draft.spec.stageListener = value
                        if (getMultiTypeFromValue(draft.spec.stageListenerRuleArn) === MultiTypeInputType.FIXED) {
                          draft.spec.stageListenerRuleArn = ''
                        }
                      })
                      formik.setValues(updatedValues)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </div>
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTypeInput
                  name="spec.stageListenerRuleArn"
                  selectItems={stageListenerRules}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: stageListenerRules,
                      popoverClassName: css.dropdownMenu
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListenerRuleARN')}
                  placeholder={stageListenerRulesLoading ? getString('loading') : getString('select')}
                  disabled={defaultTo(stageListenerRulesLoading, readonly)}
                />
                {getMultiTypeFromValue(formik.values.spec.stageListenerRuleArn) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={stageListenerRules}
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
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const ECSBlueGreenCreateServiceStepEditRef = React.forwardRef(ECSBlueGreenCreateServiceStepEdit)
