/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Text,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Icon,
  AllowedTypes,
  SelectOption
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { debounce, defaultTo, get, noop } from 'lodash-es'
import type { FormikProps, FormikValues } from 'formik'
import type { IItemRendererProps } from '@blueprintjs/select'

import { EcsInfrastructure, useClusters } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { EntityReferenceResponse } from '@common/components/EntityReference/EntityReference.types'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectorReferenceDTO } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { connectorTypes, EXPRESSION_STRING } from '@pipeline/utils/constants'
import { checkIfQueryParamsisNotEmpty } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { ConnectorRefFormValueType, getConnectorRefValue } from '@cd/utils/connectorUtils'
import { getECSInfraValidationSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import css from './ECSInfraSpec.module.scss'

export const resetFieldValue = (formik: FormikValues, fieldPath: string): void => {
  const fieldValue = get(formik.values, fieldPath, '')
  if (fieldValue?.length && getMultiTypeFromValue(fieldValue) === MultiTypeInputType.FIXED) {
    formik.setFieldValue(fieldPath, '')
  }
}

export interface ECSInfraSpecEditableProps {
  initialValues: EcsInfrastructure
  onUpdate?: (data: EcsInfrastructure) => void
  readonly?: boolean
  allowableTypes: AllowedTypes
}

export const ECSInfraSpecEditable: React.FC<ECSInfraSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  const [lastQueryData, setLastQueryData] = React.useState({ connectorRef: '', region: '' })

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [subscribeForm, unSubscribeForm])

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
      awsConnectorRef: lastQueryData.connectorRef,
      region: lastQueryData.region
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

  React.useEffect(() => {
    if (checkIfQueryParamsisNotEmpty(Object.values(lastQueryData))) {
      refetchClusters()
    }
  }, [lastQueryData, refetchClusters])

  const canFetchClusters = React.useCallback(
    (connectorRef: string, region: string): boolean => {
      return !!(lastQueryData.region !== region || lastQueryData.connectorRef !== connectorRef)
    },
    [lastQueryData]
  )

  const fetchClusters = React.useCallback(
    (connectorRef = '', region = ''): void => {
      if (canFetchClusters(connectorRef, region)) {
        setLastQueryData({ connectorRef, region })
      }
    },
    [canFetchClusters, lastQueryData]
  )

  const validationSchema = getECSInfraValidationSchema(getString)

  const itemRenderer = React.useCallback(
    (item: SelectOption, itemProps: IItemRendererProps) => (
      <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loadingClusters} />
    ),
    [loadingClusters]
  )

  return (
    <Layout.Vertical spacing="medium">
      <Formik<EcsInfrastructure>
        formName={'ECSInfraSpecEditable'}
        initialValues={initialValues}
        validate={value => {
          const data: Partial<EcsInfrastructure> = {
            connectorRef: undefined,
            region: value.region === '' ? undefined : value.region,
            cluster: value.cluster === '' ? undefined : value.cluster,
            allowSimultaneousDeployments: value.allowSimultaneousDeployments
          }
          if (value.connectorRef) {
            data.connectorRef = getConnectorRefValue(value.connectorRef as ConnectorRefFormValueType)
          }
          delayedOnUpdate(data)
        }}
        validationSchema={validationSchema}
        onSubmit={noop}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik as FormikProps<unknown> | null
          return (
            <FormikForm>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={getString('connector')}
                  placeholder={getString('connectors.selectConnector')}
                  disabled={readonly}
                  accountIdentifier={accountId}
                  tooltipProps={{
                    dataTooltipId: 'awsConnector'
                  }}
                  multiTypeProps={{ expressions, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  connectorLabelClass={css.connectorRef}
                  enableConfigureOptions={false}
                  style={{ marginBottom: 'var(--spacing-large)' }}
                  type={connectorTypes.Aws}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  onChange={selectedConnector => {
                    if (
                      (formik.values.connectorRef as ConnectorRefFormValueType).value !==
                      (selectedConnector as unknown as EntityReferenceResponse<ConnectorReferenceDTO>)?.record
                        ?.identifier
                    ) {
                      resetFieldValue(formik, 'cluster')
                    }
                  }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType(connectorTypes.Aws)}></Icon>
                        <Text>{getString('pipelineSteps.awsConnectorLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('connectorRef', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  className={css.inputWidth}
                  name="region"
                  selectItems={regions}
                  useValue
                  multiTypeInputProps={{
                    expressions,
                    allowableTypes,
                    selectProps: {
                      items: regions,
                      popoverClassName: css.regionPopover,
                      allowCreatingNewItems: true
                    },
                    onChange: selectedRegion => {
                      if (formik.values.region !== (selectedRegion as SelectOption).value) {
                        resetFieldValue(formik, 'cluster')
                      }
                    }
                  }}
                  label={getString('regionLabel')}
                  placeholder={getString('pipeline.regionPlaceholder')}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
                  <SelectConfigureOptions
                    options={regions}
                    value={formik.values?.region as string}
                    type="String"
                    variableName="region"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('region', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  className={css.inputWidth}
                  name="cluster"
                  selectItems={clusters}
                  useValue
                  multiTypeInputProps={{
                    expressions,
                    allowableTypes,
                    selectProps: {
                      items: clusters,
                      popoverClassName: css.regionPopover,
                      allowCreatingNewItems: true,
                      itemRenderer,
                      noResults: (
                        <Text lineClamp={1} width={500} height={100} padding="small">
                          {getRBACErrorMessage(fetchClustersError as RBACError) ||
                            getString('pipeline.noClustersFound')}
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
                        const connectorStringValue = getConnectorRefValue(
                          formik.values.connectorRef as ConnectorRefFormValueType
                        )
                        fetchClusters(connectorStringValue, formik.values.region)
                      }
                    }
                  }}
                  label={getString('common.cluster')}
                  placeholder={getString('cd.steps.common.selectOrEnterClusterPlaceholder')}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.cluster) === MultiTypeInputType.RUNTIME && !readonly && (
                  <SelectConfigureOptions
                    options={clusters}
                    fetchOptions={fetchClusters.bind(
                      null,
                      getConnectorRefValue(formik.values.connectorRef as ConnectorRefFormValueType),
                      formik.values.region
                    )}
                    value={formik.values.cluster as string}
                    type="String"
                    variableName="cluster"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('cluster', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal
                spacing="medium"
                style={{ alignItems: 'center' }}
                margin={{ top: 'medium' }}
                className={css.lastRow}
              >
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  name={'allowSimultaneousDeployments'}
                  label={getString('cd.allowSimultaneousDeployments')}
                  tooltipProps={{
                    dataTooltipId: 'k8InfraAllowSimultaneousDeployments'
                  }}
                  disabled={readonly}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
