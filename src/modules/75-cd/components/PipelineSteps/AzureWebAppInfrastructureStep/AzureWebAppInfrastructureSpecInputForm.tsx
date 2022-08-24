/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
  Text,
  Layout,
  FormInput,
  SelectOption,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'

import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { get, defaultTo, isEqual, set, isUndefined } from 'lodash-es'
import {
  AzureSubscriptionDTO,
  useGetAzureResourceGroupsBySubscription,
  useGetAzureSubscriptions,
  useGetAzureResourceGroupsV2
} from 'services/cd-ng'

import { Connectors } from '@connectors/constants'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { Scope } from '@common/interfaces/SecretsInterface'
import {
  AzureWebAppInfrastructureSpecEditableProps,
  getValue,
  subscriptionLabel,
  resourceGroupLabel
} from './AzureWebAppInfrastructureInterface'
import css from './AzureWebAppInfrastructureSpec.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const errorMessage = 'data.message'

export const AzureWebAppInfrastructureSpecInputForm: React.FC<
  AzureWebAppInfrastructureSpecEditableProps & { path: string }
> = ({ template, initialValues, readonly = false, path, onUpdate, allowableTypes, allValues }) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [subscriptions, setSubscriptions] = useState<SelectOption[]>([])
  const [resourceGroups, setResourceGroups] = useState<SelectOption[]>([])
  const [connector, setConnector] = useState<string | undefined>(
    defaultTo(initialValues.connectorRef, allValues?.connectorRef)
  )
  const [subscriptionId, setSubscriptionId] = useState<string | undefined>(
    defaultTo(initialValues.subscriptionId, allValues?.subscriptionId)
  )
  const [resourceGroupValue, setResourceGroupValue] = useState<string | undefined>(
    defaultTo(initialValues.resourceGroup, allValues?.resourceGroup)
  )
  const environmentRef = useMemo(
    () => defaultTo(initialValues.environmentRef, allValues?.environmentRef),
    [initialValues.environmentRef, allValues?.environmentRef]
  )

  const infrastructureRef = useMemo(
    () => defaultTo(initialValues.infrastructureRef, allValues?.infrastructureRef),
    [initialValues.infrastructureRef, allValues?.infrastructureRef]
  )

  const { expressions } = useVariablesExpression()

  const { getString } = useStrings()

  const shouldResetDependingFields = (field: string | undefined): boolean => {
    return !isUndefined(field) && getMultiTypeFromValue(field) !== MultiTypeInputType.RUNTIME
  }

  const resetForm = (parent: string): void => {
    switch (parent) {
      case 'connectorRef':
        shouldResetDependingFields(initialValues.connectorRef) && set(initialValues, 'subscriptionId', '')
        shouldResetDependingFields(initialValues.subscriptionId) && set(initialValues, 'resourceGroup', '')
        onUpdate?.(initialValues)
        break
      case 'subscriptionId':
        shouldResetDependingFields(initialValues.subscriptionId) && set(initialValues, 'resourceGroup', '')
        onUpdate?.(initialValues)
        break
    }
  }

  const queryParams = {
    connectorRef: connector as string,
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    envId: environmentRef,
    infraDefinitionId: infrastructureRef
  }

  const {
    data: subscriptionsData,
    loading: loadingSubscriptions,
    refetch: refetchSubscriptions,
    error: subscriptionsError
  } = useGetAzureSubscriptions({
    queryParams,
    lazy: true
  })

  useEffect(() => {
    setSubscriptions(
      defaultTo(subscriptionsData?.data?.subscriptions, []).reduce(
        (subscriptionValues: SelectOption[], subscription: AzureSubscriptionDTO) => {
          subscriptionValues.push({
            label: `${subscription.subscriptionName}: ${subscription.subscriptionId}`,
            value: subscription.subscriptionId
          })
          return subscriptionValues
        },
        []
      )
    )
  }, [subscriptionsData])

  const {
    data: resourceGroupData,
    refetch: refetchResourceGroups,
    loading: loadingResourceGroups,
    error: resourceGroupsError
  } = useGetAzureResourceGroupsBySubscription({
    queryParams,
    subscriptionId: subscriptionId as string,
    lazy: true
  })
  const {
    data: resourceGroupDataV2,
    refetch: refetchResourceGroupsV2,
    loading: loadingResourceGroupsV2,
    error: resourceGroupsErrorV2
  } = useGetAzureResourceGroupsV2({
    queryParams,
    lazy: true
  })

  const fetchResourceUsingEnvId = (): boolean => {
    return (
      getMultiTypeFromValue(connector) !== MultiTypeInputType.RUNTIME &&
      getMultiTypeFromValue(subscriptionId) !== MultiTypeInputType.RUNTIME &&
      environmentRef &&
      getMultiTypeFromValue(environmentRef) === MultiTypeInputType.FIXED &&
      infrastructureRef &&
      getMultiTypeFromValue(infrastructureRef) === MultiTypeInputType.FIXED
    )
  }

  useEffect(() => {
    const options =
      resourceGroupData?.data?.resourceGroups?.map(rg => ({ label: rg.resourceGroup, value: rg.resourceGroup })) ||
      /* istanbul ignore next */ []
    setResourceGroups(options)
  }, [resourceGroupData])
  useEffect(() => {
    const options =
      resourceGroupDataV2?.data?.resourceGroups?.map(rg => ({ label: rg.resourceGroup, value: rg.resourceGroup })) ||
      /* istanbul ignore next */ []
    setResourceGroups(options)
  }, [resourceGroupDataV2])

  useEffect(() => {
    resetForm('connectorRef')
  }, [connector])
  useEffect(() => {
    resetForm('subscriptionId')
  }, [subscriptionId])

  useEffect(() => {
    if (connector && !initialValues.connectorRef) {
      set(initialValues, 'connectorRef', connector)
    }
    if (subscriptionId && !initialValues.subscriptionId) {
      set(initialValues, 'subscriptionId', subscriptionId)
    }
    if (resourceGroupValue && !initialValues.resourceGroup) {
      set(initialValues, 'resourceGroup', resourceGroupValue)
    }
    onUpdate?.(initialValues)
  }, [])

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            name={`${path}.connectorRef`}
            tooltipProps={{
              dataTooltipId: 'azureInfraConnector'
            }}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('connectors.selectConnector')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={Connectors.AZURE}
            setRefValue
            onChange={
              /* istanbul ignore next */ (selected, _typeValue, type) => {
                const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
                if (type === MultiTypeInputType.FIXED) {
                  const connectorRef =
                    item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                      ? `${item.scope}.${item?.record?.identifier}`
                      : item.record?.identifier
                  if (!isEqual(connectorRef, connector)) {
                    setConnector(connectorRef)
                  }
                } else if (type === MultiTypeInputType.EXPRESSION) {
                  setConnector(selected?.toString())
                }
                setSubscriptions([])
                setResourceGroups([])
              }
            }
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.subscriptionId) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
          <FormInput.MultiTypeInput
            name={`${path}.subscriptionId`}
            tooltipProps={{
              dataTooltipId: 'azureInfraSubscription'
            }}
            disabled={readonly}
            placeholder={
              loadingSubscriptions
                ? /* istanbul ignore next */ getString('loading')
                : getString('cd.steps.azureInfraStep.subscriptionPlaceholder')
            }
            useValue
            selectItems={subscriptions}
            label={getString(subscriptionLabel)}
            multiTypeInputProps={{
              onChange: /* istanbul ignore next */ (value, _typeValue, type) => {
                if (value && type === MultiTypeInputType.FIXED) {
                  if (!isEqual(getValue(value), subscriptionId)) {
                    setSubscriptionId(getValue(value))
                  }
                } else if (type === MultiTypeInputType.EXPRESSION) {
                  setSubscriptionId(value?.toString())
                }
                setResourceGroups([])
              },
              onFocus: () => {
                if (getMultiTypeFromValue(connector) !== MultiTypeInputType.RUNTIME) {
                  refetchSubscriptions({
                    queryParams
                  })
                }
              },
              selectProps: {
                items: subscriptions,
                allowCreatingNewItems: true,
                addClearBtn: !(loadingSubscriptions || readonly),
                noResults: (
                  <Text padding={'small'}>
                    {loadingSubscriptions
                      ? getString('loading')
                      : defaultTo(
                          get(subscriptionsError, errorMessage, subscriptionsError?.message),
                          getString('pipeline.ACR.subscriptionError')
                        )}
                  </Text>
                )
              },
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.resourceGroup) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
          <FormInput.MultiTypeInput
            name={`${path}.resourceGroup`}
            tooltipProps={{
              dataTooltipId: 'azureInfraResourceGroup'
            }}
            disabled={readonly}
            placeholder={
              loadingResourceGroups || loadingResourceGroupsV2
                ? /* istanbul ignore next */ getString('loading')
                : getString('cd.steps.azureInfraStep.resourceGroupPlaceholder')
            }
            useValue
            selectItems={resourceGroups}
            label={getString(resourceGroupLabel)}
            multiTypeInputProps={{
              onChange: /* istanbul ignore next */ (value, _typeValue, type) => {
                if (value && type === MultiTypeInputType.FIXED) {
                  setResourceGroupValue(getValue(value))
                } else if (type === MultiTypeInputType.EXPRESSION) {
                  setResourceGroupValue(value?.toString())
                }
              },
              onFocus: () => {
                if (connector && subscriptionId) {
                  refetchResourceGroups({
                    queryParams: {
                      accountIdentifier: accountId,
                      projectIdentifier,
                      orgIdentifier,
                      connectorRef: connector as string
                    },
                    pathParams: {
                      subscriptionId: subscriptionId
                    }
                  })
                } else if (fetchResourceUsingEnvId()) {
                  refetchResourceGroupsV2({
                    queryParams: {
                      connectorRef: connector as string,
                      accountIdentifier: accountId,
                      orgIdentifier,
                      projectIdentifier,
                      envId: environmentRef,
                      infraDefinitionId: infrastructureRef,
                      subscriptionId: subscriptionId
                    }
                  })
                }
              },

              selectProps: {
                items: resourceGroups,
                allowCreatingNewItems: true,
                addClearBtn: !(loadingResourceGroups || readonly),
                noResults: (
                  <Text padding={'small'}>
                    {loadingResourceGroups || loadingResourceGroupsV2
                      ? getString('loading')
                      : defaultTo(
                          defaultTo(
                            get(resourceGroupsError, errorMessage, resourceGroupsError?.message),
                            get(resourceGroupsErrorV2, errorMessage, resourceGroupsErrorV2?.message)
                          ),
                          getString('cd.steps.azureInfraStep.resourceGroupError')
                        )}
                  </Text>
                )
              },
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}
