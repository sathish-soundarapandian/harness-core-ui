/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes, SelectOption } from '@wings-software/uicore'

import { useClusters } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ECSRollingDeployStepInitialValues } from '@pipeline/utils/types'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ECSBlueGreenCreateServiceStepInputSetProps {
  allowableTypes: AllowedTypes
  inputSetData: {
    template?: ECSRollingDeployStepInitialValues
    path?: string
    readonly?: boolean
  }
}

export const ECSBlueGreenCreateServiceStepInputSet: React.FC<ECSBlueGreenCreateServiceStepInputSetProps> = ({
  inputSetData,
  allowableTypes
}) => {
  const { template, path, readonly } = inputSetData
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

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

  const prefix = isEmpty(path) ? '' : `${path}`

  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            name={`${prefix}.timeout`}
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
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <SelectInputSetView
            name={`${prefix}.spec.loadBalancer`}
            selectItems={clusters}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: clusters
              },
              allowableTypes,
              expressions
            }}
            label={getString('pipeline.loadBalancer')}
            placeholder={loadingClusters ? getString('loading') : getString('select')}
            disabled={defaultTo(loadingClusters, readonly)}
            fieldPath={`spec.loadBalancer`}
            template={template}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData.template?.spec?.prodListener) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <SelectInputSetView
            name={`${prefix}.spec.prodListener`}
            selectItems={clusters}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: clusters
              },
              allowableTypes,
              expressions
            }}
            label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListener')}
            placeholder={loadingClusters ? getString('loading') : getString('select')}
            disabled={defaultTo(loadingClusters, readonly)}
            fieldPath={`spec.prodListener`}
            template={template}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData.template?.spec?.prodListenerRuleArn) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <SelectInputSetView
            name={`${prefix}.spec.prodListenerRuleArn`}
            selectItems={clusters}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: clusters
              },
              allowableTypes,
              expressions
            }}
            label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListenerRuleARN')}
            placeholder={loadingClusters ? getString('loading') : getString('select')}
            disabled={defaultTo(loadingClusters, readonly)}
            fieldPath={`spec.prodListenerRuleArn`}
            template={template}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData.template?.spec?.stageListener) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <SelectInputSetView
            name={`${prefix}.spec.stageListener`}
            selectItems={clusters}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: clusters
              },
              allowableTypes,
              expressions
            }}
            label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListener')}
            placeholder={loadingClusters ? getString('loading') : getString('select')}
            disabled={defaultTo(loadingClusters, readonly)}
            fieldPath={`spec.stageListener`}
            template={template}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData.template?.spec?.stageListenerRuleArn) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <SelectInputSetView
            name={`${prefix}.spec.stageListenerRuleArn`}
            selectItems={clusters}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: clusters
              },
              allowableTypes,
              expressions
            }}
            label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListenerRuleARN')}
            placeholder={loadingClusters ? getString('loading') : getString('select')}
            disabled={defaultTo(loadingClusters, readonly)}
            fieldPath={`spec.stageListenerRuleArn`}
            template={template}
          />
        </div>
      )}
    </>
  )
}
