/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import produce from 'immer'
import { defaultTo, get, isEmpty, set } from 'lodash-es'
import { connect, FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes, SelectOption } from '@wings-software/uicore'

import {
  DeploymentStageConfig,
  listenerRulesPromise,
  ResponseListString,
  useElasticLoadBalancers,
  useListeners
} from 'services/cd-ng'
import type { PipelineInfoConfig, StageElementWrapperConfig } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import type {
  ECSBlueGreenCreateServiceStepInitialValues,
  ECSBlueGreenCreateServiceCustomStepProps
} from './ECSBlueGreenCreateServiceStep'
import { shouldFetchFieldData } from '../PipelineStepsUtil'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ECSBlueGreenCreateServiceStep.module.scss'

export interface ECSBlueGreenCreateServiceStepInputSetProps {
  initialValues: ECSBlueGreenCreateServiceStepInitialValues
  allowableTypes: AllowedTypes
  inputSetData: {
    template?: ECSBlueGreenCreateServiceStepInitialValues
    path?: string
    readonly?: boolean
    allValues?: ECSBlueGreenCreateServiceStepInitialValues
  }
  formik?: FormikProps<PipelineInfoConfig>
  customStepProps: ECSBlueGreenCreateServiceCustomStepProps
}

const ECSBlueGreenCreateServiceStepInputSet = (
  props: ECSBlueGreenCreateServiceStepInputSetProps
): React.ReactElement => {
  const { initialValues, inputSetData, allowableTypes, customStepProps, formik } = props
  const { template, path, readonly, allValues } = inputSetData
  const { selectedStage, stageIdentifier } = customStepProps

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const [prodListenerRules, setProdListenerRules] = useState<SelectOption[]>([])
  const [prodListenerRulesLoading, setProdListenerRulesLoading] = useState<boolean>(false)
  const [stageListenerRules, setStageListenerRules] = useState<SelectOption[]>([])
  const [stageListenerRulesLoading, setStageListenerRulesLoading] = useState<boolean>(false)

  const prefix = isEmpty(path) ? '' : `${path}.`

  // These are to be passed in API calls after Service/Env V2 redesign
  const environmentRef = defaultTo(
    defaultTo(
      selectedStage.stage?.spec?.environment?.environmentRef,
      selectedStage.stage?.spec?.infrastructure?.environmentRef
    ),
    ''
  )
  const infrastructureRef = defaultTo(
    selectedStage.stage?.spec?.environment?.infrastructureDefinitions?.[0].identifier,
    ''
  )

  // Find out initial values of the fields which are fixed and required to fetch options of other fields
  const pathPrefix = path?.split('stages')[0]
  // Used get from lodash and finding stages conditionally because formik.values has different strcuture
  // when coming from Input Set view and Run Pipeline Form. Ideally, it should be consistent.
  const currentStageFormik = get(formik?.values, pathPrefix ? `${pathPrefix}stages` : 'stages')?.find(
    (currStage: StageElementWrapperConfig) => currStage.stage?.identifier === stageIdentifier
  )
  const awsConnRef = defaultTo(
    (currentStageFormik?.stage?.spec as DeploymentStageConfig)?.infrastructure?.infrastructureDefinition?.spec
      .connectorRef,
    (currentStageFormik?.stage?.spec as DeploymentStageConfig)?.environment?.infrastructureDefinitions?.[0]?.inputs
      ?.spec.connectorRef
  )
  const initialAwsConnectorRef = !isEmpty(awsConnRef)
    ? awsConnRef
    : selectedStage.stage?.spec?.infrastructure?.infrastructureDefinition?.spec.connectorRef
  const region = defaultTo(
    (currentStageFormik?.stage?.spec as DeploymentStageConfig)?.infrastructure?.infrastructureDefinition?.spec.region,
    (currentStageFormik?.stage?.spec as DeploymentStageConfig)?.environment?.infrastructureDefinitions?.[0]?.inputs
      ?.spec.region
  )
  const initialRegion = !isEmpty(region)
    ? region
    : selectedStage.stage?.spec?.infrastructure?.infrastructureDefinition?.spec.region
  const initialElasticLoadBalancer = !isEmpty(initialValues.spec?.loadBalancer)
    ? initialValues.spec?.loadBalancer
    : allValues?.spec?.loadBalancer
  const initialProdListener = !isEmpty(initialValues.spec?.prodListener)
    ? initialValues.spec?.prodListener
    : allValues?.spec?.prodListener
  const initialStageListener = !isEmpty(initialValues.spec?.stageListener)
    ? initialValues.spec?.stageListener
    : allValues?.spec?.stageListener

  const shouldFetchLoadBalancers =
    shouldFetchFieldData([initialAwsConnectorRef, initialRegion]) ||
    shouldFetchFieldData([environmentRef, infrastructureRef])
  const shouldFetchListeners =
    shouldFetchFieldData([initialAwsConnectorRef, initialRegion, initialElasticLoadBalancer]) ||
    shouldFetchFieldData([
      defaultTo(environmentRef, ''),
      defaultTo(infrastructureRef, ''),
      defaultTo(initialElasticLoadBalancer, '')
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
      awsConnectorRef: initialAwsConnectorRef,
      region: initialRegion,
      envId: environmentRef,
      infraDefinitionId: infrastructureRef
    },
    lazy: !shouldFetchLoadBalancers,
    debounce: 300
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
      awsConnectorRef: initialAwsConnectorRef,
      region: initialRegion,
      elasticLoadBalancer: defaultTo(initialElasticLoadBalancer, ''),
      envId: environmentRef,
      infraDefinitionId: infrastructureRef
    },
    lazy: !shouldFetchListeners,
    debounce: 300
  })
  const listenerOptions: SelectOption[] = React.useMemo(() => {
    const listenerData = defaultTo(listeners?.data, {})
    return Object.keys(listenerData).map(listenerKey => ({
      value: listenerData[listenerKey],
      label: listenerKey
    }))
  }, [listeners?.data])

  React.useEffect(() => {
    if (
      initialElasticLoadBalancer &&
      initialProdListener &&
      shouldFetchFieldData([initialElasticLoadBalancer, initialProdListener])
    ) {
      fetchProdListenerRules(initialElasticLoadBalancer, initialProdListener)
    }
  }, [initialElasticLoadBalancer, initialProdListener])
  React.useEffect(() => {
    if (
      initialElasticLoadBalancer &&
      initialStageListener &&
      shouldFetchFieldData([initialElasticLoadBalancer, initialStageListener])
    ) {
      fetchStageListenerRules(initialElasticLoadBalancer, initialStageListener)
    }
  }, [initialElasticLoadBalancer, initialStageListener])

  const fetchLoadBalancers = () => {
    if (!loadingLoadBalancers) {
      if ((initialAwsConnectorRef && initialRegion) || (environmentRef && infrastructureRef)) {
        refetchLoadBalancers()
      }
    }
  }

  const fetchListeners = (selectedLoadBalancer: string) => {
    if (!loadingListeners) {
      if (
        (initialAwsConnectorRef && initialRegion && selectedLoadBalancer) ||
        (environmentRef && infrastructureRef && selectedLoadBalancer)
      ) {
        refetchListeners({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            envId: environmentRef,
            infraDefinitionId: infrastructureRef,
            awsConnectorRef: initialAwsConnectorRef,
            region: initialRegion,
            elasticLoadBalancer: selectedLoadBalancer
          }
        })
      }
    }
  }

  const fetchProdListenerRules = (selectedLoadBalancer: string, selectedProdListener: string) => {
    if (
      (initialAwsConnectorRef && initialRegion && selectedLoadBalancer && selectedProdListener) ||
      (environmentRef && infrastructureRef && selectedLoadBalancer && selectedProdListener)
    ) {
      setProdListenerRulesLoading(true)
      listenerRulesPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          awsConnectorRef: initialAwsConnectorRef,
          region: initialRegion,
          elasticLoadBalancer: selectedLoadBalancer,
          listenerArn: selectedProdListener,
          envId: environmentRef,
          infraDefinitionId: infrastructureRef
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

  const fetchStageListenerRules = (selectedLoadBalancer: string, selectedStageListener: string) => {
    if (
      (initialAwsConnectorRef && initialRegion && selectedLoadBalancer && selectedStageListener) ||
      (environmentRef && infrastructureRef && selectedLoadBalancer && selectedStageListener)
    ) {
      setStageListenerRulesLoading(true)
      listenerRulesPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          awsConnectorRef: initialAwsConnectorRef,
          region: initialRegion,
          elasticLoadBalancer: selectedLoadBalancer,
          listenerArn: selectedStageListener,
          envId: environmentRef,
          infraDefinitionId: infrastructureRef
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

  const onLoadBalancerChange = (selectedLoadBalancer: string) => {
    const updatedValues = produce(formik?.values, draft => {
      if (draft) {
        set(draft, `${prefix}spec.loadBalancer`, selectedLoadBalancer)
        set(draft, `${prefix}spec.prodListener`, '')
        set(draft, `${prefix}spec.prodListenerRuleArn`, '')
        set(draft, `${prefix}spec.stageListener`, '')
        set(draft, `${prefix}spec.stageListenerRuleArn`, '')
      }
    })
    if (updatedValues) {
      formik?.setValues(updatedValues)
    }
  }

  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeDurationField
            name={`${prefix}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            disabled={readonly}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData.template?.spec?.loadBalancer) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <SelectInputSetView
            name={`${prefix}spec.loadBalancer`}
            selectItems={loadBalancerOptions}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: loadBalancerOptions,
                popoverClassName: css.dropdownMenu,
                loadingItems: loadingLoadBalancers
              },
              allowableTypes,
              expressions,
              onChange: selectedValue => {
                const selectedValueString =
                  typeof selectedValue === 'string' ? selectedValue : ((selectedValue as SelectOption)?.value as string)
                onLoadBalancerChange(selectedValueString)
              },
              onFocus: fetchLoadBalancers
            }}
            label={getString('cd.steps.ecsBGCreateServiceStep.labels.elasticLoadBalancer')}
            placeholder={loadingLoadBalancers ? getString('loading') : getString('select')}
            disabled={defaultTo(loadingLoadBalancers, readonly)}
            fieldPath={`spec.loadBalancer`}
            template={template}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData.template?.spec?.prodListener) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <SelectInputSetView
            name={`${prefix}spec.prodListener`}
            selectItems={listenerOptions}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: listenerOptions,
                popoverClassName: css.dropdownMenu,
                loadingItems: loadingListeners
              },
              allowableTypes,
              expressions,
              onChange: selectedValue => {
                const selectedValueString =
                  typeof selectedValue === 'string' ? selectedValue : ((selectedValue as SelectOption).value as string)
                const updatedValues = produce(formik?.values, draft => {
                  if (draft) {
                    set(draft, `${prefix}spec.prodListener`, selectedValueString)
                    if (
                      getMultiTypeFromValue(get(draft, `${prefix}spec.prodListenerRuleArn}`)) ===
                      MultiTypeInputType.FIXED
                    ) {
                      set(draft, `${prefix}spec.prodListenerRuleArn`, '')
                    }
                  }
                })
                if (updatedValues) {
                  formik?.setValues(updatedValues)
                }
              },
              onFocus: () => {
                fetchListeners(get(formik?.values, `${prefix}spec.loadBalancer`))
              }
            }}
            label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListener')}
            placeholder={loadingListeners ? getString('loading') : getString('select')}
            disabled={defaultTo(loadingListeners, readonly)}
            fieldPath={`spec.prodListener`}
            template={template}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData.template?.spec?.prodListenerRuleArn) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <SelectInputSetView
            name={`${prefix}spec.prodListenerRuleArn`}
            selectItems={prodListenerRules}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: prodListenerRules,
                popoverClassName: css.dropdownMenu,
                loadingItems: prodListenerRulesLoading
              },
              allowableTypes,
              expressions
            }}
            label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListenerRuleARN')}
            placeholder={prodListenerRulesLoading ? getString('loading') : getString('select')}
            disabled={defaultTo(prodListenerRulesLoading, readonly)}
            fieldPath={`spec.prodListenerRuleArn`}
            template={template}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData.template?.spec?.stageListener) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <SelectInputSetView
            name={`${prefix}spec.stageListener`}
            selectItems={listenerOptions}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: listenerOptions,
                popoverClassName: css.dropdownMenu,
                loadingItems: loadingListeners
              },
              allowableTypes,
              expressions,
              onChange: selectedValue => {
                const selectedValueString =
                  typeof selectedValue === 'string' ? selectedValue : ((selectedValue as SelectOption).value as string)
                const updatedValues = produce(formik?.values, draft => {
                  if (draft) {
                    set(draft, `${prefix}spec.stageListener`, selectedValueString)
                    if (
                      getMultiTypeFromValue(get(draft, `${prefix}spec.stageListenerRuleArn}`)) ===
                      MultiTypeInputType.FIXED
                    ) {
                      set(draft, `${prefix}spec.stageListenerRuleArn`, '')
                    }
                  }
                })
                if (updatedValues) {
                  formik?.setValues(updatedValues)
                }
              },
              onFocus: () => {
                fetchListeners(get(formik?.values, `${prefix}spec.loadBalancer`))
              }
            }}
            label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListener')}
            placeholder={loadingListeners ? getString('loading') : getString('select')}
            disabled={defaultTo(loadingListeners, readonly)}
            fieldPath={`spec.stageListener`}
            template={template}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData.template?.spec?.stageListenerRuleArn) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <SelectInputSetView
            name={`${prefix}spec.stageListenerRuleArn`}
            selectItems={stageListenerRules}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: stageListenerRules,
                popoverClassName: css.dropdownMenu,
                loadingItems: stageListenerRulesLoading
              },
              allowableTypes,
              expressions
            }}
            label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListenerRuleARN')}
            placeholder={stageListenerRulesLoading ? getString('loading') : getString('select')}
            disabled={defaultTo(stageListenerRulesLoading, readonly)}
            fieldPath={`spec.stageListenerRuleArn`}
            template={template}
          />
        </div>
      )}
    </>
  )
}

export const ECSBlueGreenCreateServiceStepInputSetMode = connect(ECSBlueGreenCreateServiceStepInputSet)
