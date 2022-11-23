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
import { debounce, defaultTo, isEmpty, noop } from 'lodash-es'
import type { FormikProps } from 'formik'

import { EcsInfrastructure, useClusters } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { connectorTypes } from '@pipeline/utils/constants'
import {
  ConnectorRefFormValueType,
  getConnectorRefValue,
  getSelectedConnectorValue,
  SelectedConnectorType
} from '@cd/utils/connectorUtils'
import { getECSInfraValidationSchema } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import css from './ECSInfraSpec.module.scss'

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
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

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
    loading: loadingClusters
  } = useClusters({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      awsConnectorRef: initialValues.connectorRef,
      region: initialValues.region
    },
    lazy: !(initialValues.connectorRef && initialValues.region)
  })

  const clusters: SelectOption[] = React.useMemo(() => {
    return defaultTo(awsClusters?.data, []).map(cluster => ({
      value: cluster,
      label: cluster
    }))
  }, [awsClusters?.data])

  const validationSchema = getECSInfraValidationSchema(getString)

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
                    if (!isEmpty(formik.values.region)) {
                      refetchClusters({
                        queryParams: {
                          accountIdentifier: accountId,
                          orgIdentifier,
                          projectIdentifier,
                          awsConnectorRef: getSelectedConnectorValue(
                            selectedConnector as unknown as SelectedConnectorType
                          ),
                          region: formik.values.region
                        }
                      })
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
                    selectProps: {
                      items: regions,
                      popoverClassName: css.regionPopover,
                      allowCreatingNewItems: true
                    },
                    onChange: selectedRegion => {
                      if (!isEmpty(formik.values.connectorRef)) {
                        refetchClusters({
                          queryParams: {
                            accountIdentifier: accountId,
                            orgIdentifier,
                            projectIdentifier,
                            awsConnectorRef: getConnectorRefValue(
                              formik.values.connectorRef as ConnectorRefFormValueType
                            ),
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
                {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
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
                    selectProps: {
                      items: clusters,
                      popoverClassName: css.regionPopover,
                      allowCreatingNewItems: true
                    }
                  }}
                  label={getString('common.cluster')}
                  placeholder={
                    loadingClusters
                      ? getString('loading')
                      : getString('cd.steps.common.selectOrEnterClusterPlaceholder')
                  }
                  disabled={loadingClusters || readonly}
                />
                {getMultiTypeFromValue(formik.values.cluster) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
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
