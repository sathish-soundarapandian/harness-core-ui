/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { connect, FormikProps } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import {
  Layout,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes,
  SelectOption,
  RUNTIME_INPUT_VALUE
} from '@wings-software/uicore'

import { EcsInfrastructure, useClusters } from 'services/cd-ng'
import { useListAwsRegions } from 'services/portal'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { connectorTypes } from '@pipeline/utils/constants'
import {
  ConnectorRefFormValueType,
  getConnectorRefValue,
  getSelectedConnectorValue,
  SelectedConnectorType
} from '@cd/utils/connectorUtils'
import type { ECSInfraSpecCustomStepProps } from './ECSInfraSpec'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ECSInfraSpecInputFormProps {
  initialValues: EcsInfrastructure
  allValues: EcsInfrastructure
  onUpdate?: (data: EcsInfrastructure) => void
  readonly?: boolean
  template?: EcsInfrastructure
  allowableTypes: AllowedTypes
  path: string
  formik?: FormikProps<EcsInfrastructure>
  customStepProps: ECSInfraSpecCustomStepProps
}

const ECSInfraSpecInputForm = ({
  initialValues,
  allValues,
  template,
  readonly = false,
  path,
  allowableTypes,
  formik,
  customStepProps
}: ECSInfraSpecInputFormProps) => {
  const { environmentRef, infrastructureRef } = customStepProps
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { NG_SVC_ENV_REDESIGN } = useFeatureFlags()

  const { data: awsRegionsData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions: SelectOption[] = React.useMemo(() => {
    return defaultTo(awsRegionsData?.resource, []).map(region => ({
      value: region.value,
      label: region.name as string
    }))
  }, [awsRegionsData?.resource])

  const {
    data: awsClusters,
    refetch: refetchClusters,
    loading: loadingClusters
  } = useClusters({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      awsConnectorRef: defaultTo(initialValues.connectorRef, allValues.connectorRef),
      region: defaultTo(initialValues.region, allValues.region),
      envId: environmentRef,
      infraDefinitionId: infrastructureRef
    },
    lazy: NG_SVC_ENV_REDESIGN
      ? !(!!environmentRef || !!infrastructureRef)
      : defaultTo(
          !(!!initialValues.connectorRef || !!initialValues.region),
          allValues.connectorRef === RUNTIME_INPUT_VALUE || allValues.region === RUNTIME_INPUT_VALUE
        )
  })

  const clusters: SelectOption[] = React.useMemo(() => {
    return defaultTo(awsClusters?.data, []).map(cluster => ({
      value: cluster,
      label: cluster
    }))
  }, [awsClusters?.data])

  const connectorFieldName = isEmpty(path) ? 'connectorRef' : `${path}.connectorRef`
  const regionFieldName = isEmpty(path) ? 'region' : `${path}.region`
  const clusterFieldName = isEmpty(path) ? 'cluster' : `${path}.cluster`

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            tooltipProps={{
              dataTooltipId: 'awsInfraConnector'
            }}
            name={connectorFieldName}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('connectors.selectConnector')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={connectorTypes.Aws}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            onChange={selectedConnector => {
              formik?.setFieldValue(clusterFieldName, '')
              if (!isEmpty(initialValues.region)) {
                refetchClusters({
                  queryParams: {
                    accountIdentifier: accountId,
                    orgIdentifier,
                    projectIdentifier,
                    awsConnectorRef: getSelectedConnectorValue(selectedConnector as unknown as SelectedConnectorType),
                    region: initialValues.region
                  }
                })
              }
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTypeInput
            name={regionFieldName}
            selectItems={regions}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: regions,
                popoverClassName: cx(stepCss.formGroup, stepCss.md)
              },
              onChange: selectedRegion => {
                if (!isEmpty(initialValues.connectorRef)) {
                  formik?.setFieldValue(clusterFieldName, '')
                  refetchClusters({
                    queryParams: {
                      accountIdentifier: accountId,
                      orgIdentifier,
                      projectIdentifier,
                      awsConnectorRef: getConnectorRefValue(initialValues.connectorRef as ConnectorRefFormValueType),
                      region: (selectedRegion as SelectOption).value as string
                    }
                  })
                }
              }
            }}
            label={getString('regionLabel')}
            placeholder={getString('pipeline.regionPlaceholder')}
            disabled={readonly}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTypeInput
            name={clusterFieldName}
            selectItems={clusters}
            useValue
            multiTypeInputProps={{
              selectProps: {
                items: clusters,
                popoverClassName: cx(stepCss.formGroup, stepCss.md)
              }
            }}
            label={getString('common.cluster')}
            placeholder={
              loadingClusters ? getString('loading') : getString('cd.steps.common.selectOrEnterClusterPlaceholder')
            }
            disabled={loadingClusters || readonly}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

export const ECSInfraSpecInputSetMode = connect(ECSInfraSpecInputForm)
