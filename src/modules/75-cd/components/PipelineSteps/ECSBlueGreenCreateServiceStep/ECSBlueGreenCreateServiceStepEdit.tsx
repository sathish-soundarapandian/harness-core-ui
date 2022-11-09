/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo } from 'lodash-es'
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
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import type {
  ECSBlueGreenCreateServiceStepInitialValues,
  ECSBlueGreenCreateServiceCustomStepProps
} from './ECSBlueGreenCreateServiceStep'
import { shouldFetchFieldData } from '../PipelineStepsUtil'
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
  const [listenerList, setListenerList] = useState<SelectOption[]>([])
  const [prodListenerRules, setProdListenerRules] = useState<SelectOption[]>([])
  const [prodListenerRulesLoading, setProdListenerRulesLoading] = useState<boolean>(false)
  const [stageListenerRules, setStageListenerRules] = useState<SelectOption[]>([])
  const [stageListenerRulesLoading, setStageListenerRulesLoading] = useState<boolean>(false)

  const environmentRef = defaultTo(
    selectedStage?.stage?.spec?.environment?.environmentRef,
    selectedStage?.stage?.spec?.infrastructure?.environmentRef
  )
  const infrastructureRef = selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0].identifier

  const awsConnectorRef = selectedStage?.stage?.spec?.infrastructure?.infrastructureDefinition?.spec.connectorRef
  const region = selectedStage?.stage?.spec?.infrastructure?.infrastructureDefinition?.spec.region

  const shouldFetchLoadBalancers =
    shouldFetchFieldData([awsConnectorRef, region]) ||
    shouldFetchFieldData([defaultTo(environmentRef, ''), defaultTo(infrastructureRef, '')])
  const shouldFetchListeners =
    shouldFetchFieldData([awsConnectorRef, region, initialValues.spec.loadBalancer]) ||
    shouldFetchFieldData([
      defaultTo(environmentRef, ''),
      defaultTo(infrastructureRef, ''),
      initialValues.spec.loadBalancer
    ])

  const {
    data: loadBalancers,
    loading: loadingLoadBalancers,
    refetch: refetchLoadBalancers
  } = useElasticLoadBalancers({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      awsConnectorRef,
      region,
      envId: environmentRef,
      infraDefinitionId: infrastructureRef
    },
    lazy: !shouldFetchLoadBalancers
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
    },
    lazy: !shouldFetchListeners
  })
  React.useEffect(() => {
    const listenerData = defaultTo(listeners?.data, {})
    const listenerOptions = Object.keys(listenerData).map(listenerKey => ({
      value: listenerData[listenerKey],
      label: listenerKey
    }))
    setListenerList(listenerOptions)
  }, [listeners?.data])

  React.useEffect(() => {
    if (shouldFetchFieldData([initialValues.spec.loadBalancer, initialValues.spec.prodListener])) {
      fetchProdListenerRules(initialValues.spec.loadBalancer, initialValues.spec.prodListener, undefined, true)
    }
    if (shouldFetchFieldData([initialValues.spec.loadBalancer, initialValues.spec.stageListener])) {
      fetchStageListenerRules(initialValues.spec.loadBalancer, initialValues.spec.stageListener, undefined, true)
    }
  }, [initialValues.spec.loadBalancer, initialValues.spec.prodListener, initialValues.spec.stageListener])

  const fetchLoadBalancers = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
      return
    }
    if (!loadingLoadBalancers) {
      if ((awsConnectorRef && region) || (environmentRef && infrastructureRef)) {
        refetchLoadBalancers()
      }
    }
  }

  const fetchListeners = (e: React.FocusEvent<HTMLInputElement>, selectedLoadBalancer: string) => {
    if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
      return
    }

    if (!loadingListeners) {
      if (
        shouldFetchFieldData([awsConnectorRef, region, selectedLoadBalancer]) ||
        shouldFetchFieldData([defaultTo(environmentRef, ''), defaultTo(infrastructureRef, ''), selectedLoadBalancer])
      ) {
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
      }
    }
  }

  const fetchProdListenerRules = (
    selectedLoadBalancer: string,
    selectedProdListener: string,
    e?: React.FocusEvent<HTMLInputElement>,
    fromEffect = false
  ) => {
    if (
      (!fromEffect && e?.target?.type !== 'text') ||
      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
    ) {
      return
    }

    if (
      shouldFetchFieldData([awsConnectorRef, region, selectedLoadBalancer, selectedProdListener]) ||
      shouldFetchFieldData([
        defaultTo(environmentRef, ''),
        defaultTo(infrastructureRef, ''),
        selectedLoadBalancer,
        selectedProdListener
      ])
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
          listenerArn: selectedProdListener
        }
      })
        .then((response: ResponseListString) => {
          setProdListenerRulesLoading(false)
          const listenerRulesData = defaultTo(response?.data, [])
          const listenerRulesOptions = listenerRulesData.map(listenerRule => ({
            value: listenerRule,
            label: listenerRule
          }))
          setProdListenerRules(listenerRulesOptions)
        })
        .catch(() => {
          setProdListenerRulesLoading(false)
          setProdListenerRules([])
        })
    }
  }

  const fetchStageListenerRules = (
    selectedLoadBalancer: string,
    selectedStageListener: string,
    e?: React.FocusEvent<HTMLInputElement>,
    fromEffect = false
  ) => {
    if (
      (!fromEffect && e?.target?.type !== 'text') ||
      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
    ) {
      return
    }

    if (
      shouldFetchFieldData([awsConnectorRef, region, selectedLoadBalancer, selectedStageListener]) ||
      shouldFetchFieldData([
        defaultTo(environmentRef, ''),
        defaultTo(infrastructureRef, ''),
        selectedLoadBalancer,
        selectedStageListener
      ])
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
          listenerArn: selectedStageListener
        }
      })
        .then((response: ResponseListString) => {
          setStageListenerRulesLoading(false)
          const listenerRulesData = defaultTo(response?.data, [])
          const listenerRulesOptions = listenerRulesData.map(listenerRule => ({
            value: listenerRule,
            label: listenerRule
          }))
          setStageListenerRules(listenerRulesOptions)
        })
        .catch(() => {
          setStageListenerRulesLoading(false)
          setStageListenerRules([])
        })
    }
  }

  const onLoadBalancerChange = (
    selectedLoadBalancer: string,
    formik: FormikProps<ECSBlueGreenCreateServiceStepInitialValues>
  ) => {
    const updatedValues = produce(formik.values, draft => {
      draft.spec.loadBalancer = selectedLoadBalancer
      if (getMultiTypeFromValue(formik.values.spec.prodListener) === MultiTypeInputType.FIXED) {
        draft.spec.prodListener = ''
      }
      if (getMultiTypeFromValue(formik.values.spec.prodListenerRuleArn) === MultiTypeInputType.FIXED) {
        draft.spec.prodListenerRuleArn = ''
      }
      if (getMultiTypeFromValue(formik.values.spec.stageListener) === MultiTypeInputType.FIXED) {
        draft.spec.stageListener = ''
      }
      if (getMultiTypeFromValue(formik.values.spec.stageListenerRuleArn) === MultiTypeInputType.FIXED) {
        draft.spec.stageListenerRuleArn = ''
      }
    })
    formik.setValues(updatedValues)
    if (getMultiTypeFromValue(selectedLoadBalancer) === MultiTypeInputType.RUNTIME) {
      setListenerList([])
      setProdListenerRules([])
      setStageListenerRules([])
    }
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
                      popoverClassName: css.dropdownMenu,
                      allowCreatingNewItems: true,
                      loadingItems: loadingLoadBalancers
                    },
                    onChange: selectedValue => {
                      const selectedValueString =
                        typeof selectedValue === 'string'
                          ? selectedValue
                          : ((selectedValue as SelectOption)?.value as string)
                      onLoadBalancerChange(selectedValueString, formik)
                    },
                    onFocus: fetchLoadBalancers
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.elasticLoadBalancer')}
                  placeholder={loadingLoadBalancers ? getString('loading') : getString('select')}
                  disabled={readonly}
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
                  selectItems={listenerList}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: listenerList,
                      popoverClassName: css.dropdownMenu,
                      allowCreatingNewItems: true,
                      loadingItems: loadingListeners
                    },
                    onChange: selectedValue => {
                      const selectedValueString =
                        typeof selectedValue === 'string'
                          ? selectedValue
                          : ((selectedValue as SelectOption).value as string)
                      const updatedValues = produce(formik.values, draft => {
                        draft.spec.prodListener = selectedValueString
                        if (getMultiTypeFromValue(draft.spec.prodListenerRuleArn) === MultiTypeInputType.FIXED) {
                          draft.spec.prodListenerRuleArn = ''
                        }
                      })
                      formik.setValues(updatedValues)
                    },
                    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                      fetchListeners(e, formik.values.spec.loadBalancer)
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListener')}
                  placeholder={loadingListeners ? getString('loading') : getString('select')}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.spec.prodListener) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={listenerList}
                    value={formik.values.spec.prodListener as string}
                    type="String"
                    variableName="spec.prodListener"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
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
                      popoverClassName: css.dropdownMenu,
                      allowCreatingNewItems: true,
                      loadingItems: prodListenerRulesLoading
                    },
                    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                      fetchProdListenerRules(formik.values.spec.loadBalancer, formik.values.spec.prodListener, e)
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListenerRuleARN')}
                  placeholder={prodListenerRulesLoading ? getString('loading') : getString('select')}
                  disabled={readonly}
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
                  selectItems={listenerList}
                  useValue
                  multiTypeInputProps={{
                    selectProps: {
                      items: listenerList,
                      popoverClassName: css.dropdownMenu,
                      allowCreatingNewItems: true,
                      loadingItems: loadingListeners
                    },
                    onChange: selectedValue => {
                      const selectedValueString =
                        typeof selectedValue === 'string'
                          ? selectedValue
                          : ((selectedValue as SelectOption).value as string)
                      const updatedValues = produce(formik.values, draft => {
                        draft.spec.stageListener = selectedValueString
                        if (getMultiTypeFromValue(draft.spec.stageListenerRuleArn) === MultiTypeInputType.FIXED) {
                          draft.spec.stageListenerRuleArn = ''
                        }
                      })
                      formik.setValues(updatedValues)
                    },
                    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                      fetchListeners(e, formik.values.spec.loadBalancer)
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListener')}
                  placeholder={loadingListeners ? getString('loading') : getString('select')}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.spec.stageListener) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={listenerList}
                    value={formik.values.spec.stageListener as string}
                    type="String"
                    variableName="spec.stageListener"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
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
                      popoverClassName: css.dropdownMenu,
                      allowCreatingNewItems: true,
                      loadingItems: stageListenerRulesLoading
                    },
                    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                      fetchStageListenerRules(formik.values.spec.loadBalancer, formik.values.spec.stageListener, e)
                    }
                  }}
                  label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListenerRuleARN')}
                  placeholder={stageListenerRulesLoading ? getString('loading') : getString('select')}
                  disabled={readonly}
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
