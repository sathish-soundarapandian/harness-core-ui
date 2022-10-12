/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { defaultTo, get, isEmpty } from 'lodash-es'
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
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

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
    selectedStage.stage?.spec?.environment?.environmentRef,
    selectedStage.stage?.spec?.infrastructure?.environmentRef
  )
  const infrastructureRef = selectedStage.stage?.spec?.environment?.infrastructureDefinitions?.[0].identifier

  // Find out initial values of the fields which are fixed and required to fetch options of other fields
  const pathPrefix = path?.split('stages')[0]
  // Used get from lodash and finding stages conditionally because formik.values has different strcuture
  // when coming from Input Set view and Run Pipeline Form. Ideally, it should be consistent.
  const currentStageFormik = get(formik?.values, pathPrefix ? `${pathPrefix}stages` : 'stages')?.find(
    (currStage: StageElementWrapperConfig) => currStage.stage?.identifier === stageIdentifier
  )
  const awsConnRef = (currentStageFormik?.stage?.spec as DeploymentStageConfig)?.infrastructure
    ?.infrastructureDefinition?.spec.connectorRef
  const initialAwsConnectorRef = !isEmpty(awsConnRef)
    ? awsConnRef
    : selectedStage.stage?.spec?.infrastructure?.infrastructureDefinition?.spec.connectorRef
  const region = (currentStageFormik?.stage?.spec as DeploymentStageConfig)?.infrastructure?.infrastructureDefinition
    ?.spec.region
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

  const { data: loadBalancers, loading: loadingLoadBalancers } = useElasticLoadBalancers({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      awsConnectorRef: initialAwsConnectorRef,
      region: initialRegion,
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
      awsConnectorRef: initialAwsConnectorRef,
      region: initialRegion,
      elasticLoadBalancer: defaultTo(initialElasticLoadBalancer, ''),
      envId: environmentRef,
      infraDefinitionId: infrastructureRef
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
    if (initialElasticLoadBalancer && initialProdListener) {
      fetchProdListenerRules(initialElasticLoadBalancer, initialProdListener)
    }
  }, [initialElasticLoadBalancer, initialProdListener])
  React.useEffect(() => {
    if (initialElasticLoadBalancer && initialStageListener) {
      fetchStageListenerRules(initialElasticLoadBalancer, initialStageListener)
    }
  }, [initialElasticLoadBalancer, initialStageListener])

  const fetchProdListenerRules = (selectedLoadBalancer: string, selectedListener: string) => {
    if (
      (initialAwsConnectorRef && initialRegion && selectedLoadBalancer && selectedListener) ||
      (environmentRef && infrastructureRef)
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
          listenerArn: selectedListener,
          envId: environmentRef,
          infraDefinitionId: infrastructureRef
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
      (initialAwsConnectorRef && initialRegion && selectedLoadBalancer && selectedListener) ||
      (environmentRef && infrastructureRef)
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
          listenerArn: selectedListener,
          envId: environmentRef,
          infraDefinitionId: infrastructureRef
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

  const onLoadBalancerChange = (selectedLoadBalancer: string) => {
    refetchListeners({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        awsConnectorRef: initialAwsConnectorRef,
        region: initialRegion,
        elasticLoadBalancer: selectedLoadBalancer
      }
    })
    formik?.setFieldValue(`${prefix}spec.loadBalancer`, selectedLoadBalancer)
    formik?.setFieldValue(`${prefix}spec.prodListener`, '')
    formik?.setFieldValue(`${prefix}spec.prodListenerRuleArn`, '')
    formik?.setFieldValue(`${prefix}spec.stageListener`, '')
    formik?.setFieldValue(`${prefix}spec.stageListenerRuleArn`, '')
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
                items: loadBalancerOptions
              },
              allowableTypes,
              expressions,
              onChange: selectedValue => {
                const selectedValueString = (selectedValue as SelectOption).value as string
                onLoadBalancerChange(selectedValueString)
              }
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
                items: listenerOptions
              },
              allowableTypes,
              expressions,
              onChange: selectedValue => {
                const selectedValueString = (selectedValue as SelectOption).value as string
                fetchProdListenerRules(get(formik?.values, `${prefix}spec.loadBalancer`), selectedValueString)
                formik?.setFieldValue(`${prefix}spec.prodListener`, selectedValueString)
                formik?.setFieldValue(`${prefix}spec.prodListenerRuleArn`, '')
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
                items: prodListenerRules
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
                items: listenerOptions
              },
              allowableTypes,
              expressions,
              onChange: selectedValue => {
                const selectedValueString = (selectedValue as SelectOption).value as string
                fetchStageListenerRules(get(formik?.values, `${prefix}spec.loadBalancer`), selectedValueString)
                formik?.setFieldValue(`${prefix}spec.stageListener`, selectedValueString)
                formik?.setFieldValue(`${prefix}spec.stageListenerRuleArn`, '')
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
                items: stageListenerRules
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
