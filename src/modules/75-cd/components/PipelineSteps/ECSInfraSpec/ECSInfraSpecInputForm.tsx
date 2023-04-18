/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { connect, FormikProps } from 'formik'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { IItemRendererProps } from '@blueprintjs/select'
import { Layout, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes, SelectOption, Text } from '@harness/uicore'

import { EcsInfrastructure, useClusters } from 'services/cd-ng'

import { useListAwsRegions } from 'services/portal'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { EntityReferenceResponse } from '@common/components/EntityReference/EntityReference.types'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import type { ConnectorReferenceDTO } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { connectorTypes, EXPRESSION_STRING } from '@pipeline/utils/constants'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { resetFieldValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import ProvisionerSelectField from '@pipeline/components/Provisioner/ProvisionerSelect'
import type { ConnectorRefFormValueType } from '@cd/utils/connectorUtils'
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
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()

  const [lastQueryData, setLastQueryData] = React.useState({ connectorRef: '', region: '', envId: '', infraId: '' })

  const environmentRef = defaultTo(initialValues.environmentRef, allValues.environmentRef)
  const infrastructureRef = defaultTo(initialValues.infrastructureRef, allValues.infrastructureRef)
  const initialConnectorValue = defaultTo(initialValues.connectorRef, allValues.connectorRef)
  const initialRegionValue = defaultTo(initialValues.region, allValues.region)

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
    loading: loadingClusters,
    error: fetchClustersError
  } = useClusters({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      awsConnectorRef: initialConnectorValue,
      region: initialRegionValue,
      envId: environmentRef,
      infraDefinitionId: infrastructureRef
    },
    lazy: true
  })

  const clusters: SelectOption[] = React.useMemo(() => {
    if (loadingClusters) {
      return [{ label: 'Loading Clusters...', value: 'Loading Clusters...' }]
    } else if (fetchClustersError) {
      return []
    }
    return defaultTo(awsClusters?.data, []).map(cluster => ({
      value: cluster,
      label: cluster
    }))
  }, [awsClusters?.data, loadingClusters, fetchClustersError])

  const canFetchClusters = React.useCallback(
    (connectorRef: string, region: string, envId: string, infraId: string): boolean => {
      return (
        !!(lastQueryData.region !== region || lastQueryData.connectorRef !== connectorRef) ||
        !!(lastQueryData.envId !== envId || lastQueryData.infraId !== infraId)
      )
    },
    [lastQueryData]
  )

  const fetchClusters = React.useCallback(
    (connectorRef = '', region = '', envId = '', infraId = ''): void => {
      if (canFetchClusters(connectorRef, region, envId, infraId)) {
        setLastQueryData({ connectorRef, region, envId, infraId })
        refetchClusters({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            awsConnectorRef: connectorRef,
            region: region,
            envId: environmentRef,
            infraDefinitionId: infrastructureRef
          }
        })
      }
    },
    [canFetchClusters, lastQueryData]
  )

  const itemRenderer = React.useCallback(
    (item: SelectOption, itemProps: IItemRendererProps) => (
      <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loadingClusters} />
    ),
    [loadingClusters]
  )

  const connectorFieldName = isEmpty(path) ? 'connectorRef' : `${path}.connectorRef`
  const regionFieldName = isEmpty(path) ? 'region' : `${path}.region`
  const clusterFieldName = isEmpty(path) ? 'cluster' : `${path}.cluster`
  const provisionerName = isEmpty(path) ? 'provisioner' : `${path}.provisioner`

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(template?.provisioner) === MultiTypeInputType.RUNTIME && customStepProps?.provisioner && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <ProvisionerSelectField name={provisionerName} path={path} provisioners={customStepProps?.provisioner} />
        </div>
      )}
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
            placeholder={getString('common.entityPlaceholderText')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={connectorTypes.Aws}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            onChange={selectedConnector => {
              if (
                formik &&
                (get(formik?.values, connectorFieldName) as ConnectorRefFormValueType).value !==
                  (selectedConnector as unknown as EntityReferenceResponse<ConnectorReferenceDTO>)?.record?.identifier
              ) {
                resetFieldValue(formik, clusterFieldName)
              }
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.md)}
          fieldPath={'region'}
          template={template}
          name={regionFieldName}
          selectItems={regions}
          useValue
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              items: regions,
              popoverClassName: cx(stepCss.formGroup, stepCss.md)
            },
            onChange: selectedRegion => {
              if (
                formik &&
                get(formik?.values, regionFieldName) !== ((selectedRegion as SelectOption).value as string)
              ) {
                resetFieldValue(formik, clusterFieldName)
              }
            }
          }}
          label={getString('regionLabel')}
          placeholder={getString('pipeline.regionPlaceholder')}
          disabled={readonly}
        />
      )}
      {getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.md)}
          fieldPath={'cluster'}
          template={template}
          name={clusterFieldName}
          selectItems={clusters}
          useValue
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              items: clusters,
              popoverClassName: cx(stepCss.formGroup, stepCss.md),
              allowCreatingNewItems: true,
              itemRenderer,
              noResults: (
                <Text lineClamp={1} width={500} height={100} padding="small">
                  {getRBACErrorMessage(fetchClustersError as RBACError) || getString('pipeline.noClustersFound')}
                </Text>
              )
            },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
              ) {
                return
              }
              if (!loadingClusters) {
                fetchClusters(initialConnectorValue, initialRegionValue, environmentRef, infrastructureRef)
              }
            }
          }}
          label={getString('common.cluster')}
          placeholder={getString('cd.steps.common.selectOrEnterClusterPlaceholder')}
          disabled={readonly}
        />
      )}
    </Layout.Vertical>
  )
}

export const ECSInfraSpecInputSetMode = connect(ECSInfraSpecInputForm)
