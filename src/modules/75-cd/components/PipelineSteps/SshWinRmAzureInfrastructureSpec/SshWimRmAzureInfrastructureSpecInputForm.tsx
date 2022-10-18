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
  MultiTypeInputType,
  ExpressionInput,
  Select,
  Button,
  ButtonSize,
  ButtonVariation
} from '@wings-software/uicore'

import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { get, defaultTo, set } from 'lodash-es'
import {
  AzureSubscriptionDTO,
  AzureTagDTO,
  useGetAzureResourceGroupsBySubscription,
  useGetAzureSubscriptions,
  useGetSubscriptionTags,
  useGetAzureResourceGroupsV2,
  useGetSubscriptionTagsV2
} from 'services/cd-ng'

import { Connectors } from '@connectors/constants'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import MultiTypeSecretInput, {
  getMultiTypeSecretInputType
} from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import {
  AzureInfrastructureSpecEditableProps,
  subscriptionLabel,
  resourceGroupLabel
} from './SshWinRmAzureInfrastructureInterface'
import css from './SshWinRmAzureInfrastructureSpec.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const errorMessage = 'data.message'
interface SelectedTagsType {
  key: string
  value: string
}

const SshWinRmAzureInfrastructureSpecInputFormNew: React.FC<AzureInfrastructureSpecEditableProps & { path: string }> =
  ({ template, initialValues, readonly = false, path, onUpdate, allowableTypes, allValues }) => {
    const { accountId, projectIdentifier, orgIdentifier } = useParams<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>()
    const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
    const [subscriptions, setSubscriptions] = useState<SelectOption[]>([])
    const [resourceGroups, setResourceGroups] = useState<SelectOption[]>([])
    const [azureTags, setAzureTags] = useState([])
    const [selectedTags, setSelectedTags] = useState([] as SelectedTagsType[])
    const { expressions } = useVariablesExpression()

    const [renderCount, setRenderCount] = useState<number>(0)

    const environmentRef = useMemo(
      () => defaultTo(initialValues.environmentRef, allValues?.environmentRef),
      [initialValues.environmentRef, allValues?.environmentRef]
    )

    const infrastructureRef = useMemo(
      () => defaultTo(initialValues.infrastructureRef, allValues?.infrastructureRef),
      [initialValues.infrastructureRef, allValues?.infrastructureRef]
    )
    const { getString } = useStrings()

    const connectorRef = useMemo(
      () => defaultTo(initialValues?.connectorRef, allValues?.connectorRef),
      [initialValues.connectorRef, allValues?.connectorRef]
    )

    const subscriptionIdRef = useMemo(
      () => defaultTo(initialValues?.subscriptionId, allValues?.subscriptionId),
      [initialValues.subscriptionId, allValues?.subscriptionId]
    )

    React.useEffect(() => {
      /* istanbul ignore next */ if (renderCount) {
        set(initialValues, 'subscriptionId', '')
        set(initialValues, 'resourceGroup', '')
        set(initialValues, 'tags', {})
        onUpdate?.(initialValues)
      }
    }, [connectorRef])

    React.useEffect(() => {
      /* istanbul ignore next */ if (renderCount) {
        set(initialValues, 'resourceGroup', '')
        set(initialValues, 'tags', {})
        onUpdate?.(initialValues)
      }
    }, [subscriptionIdRef])

    React.useEffect(() => {
      /* istanbul ignore else */ if (typeof initialValues?.tags !== 'string') {
        const selTags = [] as SelectedTagsType[]
        const tagKeys = initialValues?.tags ? Object.keys(initialValues?.tags as any) : []
        tagKeys.map(tagKey => {
          initialValues?.tags && selTags.push({ key: tagKey, value: initialValues?.tags[tagKey] })
        })
        setSelectedTags(selTags)
      }
    }, [initialValues?.tags])
    const queryParams = {
      connectorRef: get(initialValues, 'connectorRef', '') as string,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      envId: environmentRef,
      infraDefinitionId: infrastructureRef,
      subscriptionId: get(initialValues, 'subscriptionId', '')
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
              label: `${subscription.subscriptionName}:${subscription.subscriptionId}`,
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
      subscriptionId: get(initialValues, 'subscriptionId', '') as string,
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
    const {
      data: subscriptionTagsData,
      refetch: refetchSubscriptionTags,
      loading: loadingSubscriptionTags,
      error: subscriptionTagsError
    } = useGetSubscriptionTags({
      queryParams,
      subscriptionId: get(initialValues, 'subscriptionId', '') as string,
      lazy: true
    })

    const {
      data: subscriptionTagsV2Data,
      loading: loadingSubscriptionTagsV2,
      refetch: refetchSubscriptionTagsV2,
      error: subscriptionTagsV2Error
    } = useGetSubscriptionTagsV2({
      queryParams,
      lazy: true
    })

    React.useEffect(() => {
      setAzureTags(
        get(subscriptionTagsData, 'data.tags', []).map((azureTag: AzureTagDTO) => ({
          label: azureTag.tag,
          value: azureTag.tag
        }))
      )
    }, [subscriptionTagsData])
    React.useEffect(() => {
      setAzureTags(
        get(subscriptionTagsV2Data, 'data.tags', []).map((azureTag: AzureTagDTO) => ({
          label: azureTag.tag,
          value: azureTag.tag
        }))
      )
    }, [subscriptionTagsV2Data])

    useEffect(() => {
      setResourceGroups(
        get(resourceGroupData, 'data.resourceGroups', []).map((rg: { resourceGroup: string }) => ({
          label: rg.resourceGroup,
          value: rg.resourceGroup
        }))
      )
    }, [resourceGroupData])
    useEffect(() => {
      setResourceGroups(
        get(resourceGroupDataV2, 'data.resourceGroups', []).map((rg: { resourceGroup: string }) => ({
          label: rg.resourceGroup,
          value: rg.resourceGroup
        }))
      )
    }, [resourceGroupDataV2])

    // this function is used to validate if the connector and subscription are set at studio level and to verify if not then they shouldn't be runtime wrt to deployment form
    const fetchResourceUsingEnvId = (): boolean => {
      return (
        getMultiTypeFromValue(connectorRef) !== MultiTypeInputType.RUNTIME &&
        getMultiTypeFromValue(subscriptionIdRef) !== MultiTypeInputType.RUNTIME &&
        environmentRef &&
        getMultiTypeFromValue(environmentRef) === MultiTypeInputType.FIXED &&
        infrastructureRef &&
        getMultiTypeFromValue(infrastructureRef) === MultiTypeInputType.FIXED
      )
    }

    useEffect(() => {
      setRenderCount(renderCount + 1)
      /* istanbul ignore else */ if (
        initialValues?.subscriptionId &&
        getMultiTypeFromValue(initialValues?.subscriptionId) !== MultiTypeInputType.RUNTIME
      ) {
        refetchSubscriptions({
          queryParams
        })
      }
      /* istanbul ignore else */ if (
        initialValues?.connectorRef &&
        getMultiTypeFromValue(initialValues?.connectorRef) === MultiTypeInputType.FIXED &&
        initialValues.subscriptionId &&
        getMultiTypeFromValue(initialValues?.subscriptionId) === MultiTypeInputType.FIXED
      ) {
        refetchResourceGroups({
          queryParams,
          pathParams: {
            subscriptionId: initialValues?.subscriptionId
          }
        })
        refetchSubscriptionTags({
          queryParams,
          pathParams: {
            subscriptionId: initialValues?.subscriptionId
          }
        })
      }

      /* istanbul ignore else */ if (fetchResourceUsingEnvId()) {
        refetchResourceGroupsV2({
          queryParams
        })
        refetchSubscriptionTagsV2({
          queryParams
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const usedTagKeys = useMemo(
      () =>
        selectedTags.reduce((map, tag) => {
          tag.key && set(map, tag.key, true)
          return map
        }, {}),
      [selectedTags]
    )
    const availableTags = useMemo(
      () => azureTags.filter(tag => !get(usedTagKeys, get(tag, 'value', ''), false)),
      [azureTags, usedTagKeys]
    )
    return (
      <Layout.Vertical spacing="small">
        {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}></div>
        )}
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
                /* istanbul ignore next */ () => {
                  setSubscriptions([])
                  setResourceGroups([])
                  setSelectedTags([])
                }
              }
              gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            />
          </div>
        )}
        {getMultiTypeFromValue(template?.subscriptionId) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
            <SelectInputSetView
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
                onChange: /* istanbul ignore next */ () => {
                  setResourceGroups([])
                  setSelectedTags([])
                },
                onFocus: () => {
                  /* istanbul ignore else */ if (
                    getMultiTypeFromValue(initialValues?.connectorRef) !== MultiTypeInputType.RUNTIME
                  ) {
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
              fieldPath="subscriptionId"
              template={template}
            />
          </div>
        )}
        {getMultiTypeFromValue(template?.resourceGroup) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
            <SelectInputSetView
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
                onFocus: () => {
                  /* istanbul ignore else */ if (connectorRef && subscriptionIdRef) {
                    refetchResourceGroups({
                      queryParams: {
                        accountIdentifier: accountId,
                        projectIdentifier,
                        orgIdentifier,
                        connectorRef: initialValues?.connectorRef as string
                      },
                      pathParams: {
                        subscriptionId: initialValues?.subscriptionId
                      }
                    })
                    refetchSubscriptionTags({
                      queryParams: {
                        accountIdentifier: accountId,
                        projectIdentifier,
                        orgIdentifier,
                        connectorRef: initialValues?.connectorRef as string
                      },
                      pathParams: {
                        subscriptionId: initialValues?.subscriptionId
                      }
                    })
                  } else if (fetchResourceUsingEnvId()) {
                    refetchResourceGroupsV2({
                      queryParams
                    })
                    refetchSubscriptionTagsV2({
                      queryParams
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
                              get(resourceGroupsErrorV2, errorMessage, resourceGroupsError?.message)
                            ),
                            getString('cd.steps.azureInfraStep.resourceGroupError')
                          )}
                    </Text>
                  )
                },
                expressions,
                allowableTypes
              }}
              fieldPath="resourceGroup"
              template={template}
            />
          </div>
        )}
        {getMultiTypeFromValue(template?.tags) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
            <MultiTypeFieldSelector
              name={`${path}.tags`}
              label={'Tags'}
              skipRenderValueInExpressionLabel
              allowedTypes={allowableTypes}
              supportListOfExpressions={true}
              disableMultiSelectBtn={false}
              style={{ flexGrow: 1, marginBottom: 0 }}
              expressionRender={() => (
                <ExpressionInput
                  name={`${path}.tags`}
                  value={initialValues.tags as any}
                  onChange={value => {
                    set(initialValues, `tags`, value)
                    onUpdate?.(initialValues)
                  }}
                  inputProps={{
                    placeholder: '<+expression>'
                  }}
                />
              )}
            >
              {selectedTags.map((tag, index) => (
                <Layout.Horizontal spacing="small" key={index}>
                  <Layout.Vertical spacing="small">
                    <Text className={css.textStyles}>{index === 0 ? getString('keyLabel') : null}</Text>
                    <Select
                      name={`${path}.tagslabel${index + 1}`}
                      value={{ label: tag.key, value: tag.key }}
                      items={availableTags}
                      className={css.tagsSelect}
                      allowCreatingNewItems={true}
                      noResults={
                        <Text padding={'small'}>
                          {loadingSubscriptionTags || loadingSubscriptionTagsV2
                            ? getString('loading')
                            : defaultTo(
                                get(subscriptionTagsError, errorMessage, null),
                                get(subscriptionTagsV2Error, errorMessage, null)
                              ) || getString('cd.infrastructure.sshWinRmAzure.noTagsAzure')}
                        </Text>
                      }
                      onChange={option => {
                        const newSelTags = [...selectedTags]
                        newSelTags[index].key = option.value as string
                        setSelectedTags(newSelTags)
                      }}
                    />
                  </Layout.Vertical>
                  <Layout.Vertical spacing="small">
                    <Text className={css.textStyles}>{index === 0 ? 'Value' : null}</Text>
                    <FormInput.Text
                      name={`${path}.tags.${tag.key}`}
                      onChange={event => {
                        const newSelTags = [...selectedTags]
                        newSelTags[index].value = get(event.target, 'value', '')
                        setSelectedTags(newSelTags)
                      }}
                    />
                  </Layout.Vertical>
                  <Layout.Horizontal className={css.removeTagBtn}>
                    <Button
                      icon="trash"
                      iconProps={{ size: 12, margin: { right: 8 } }}
                      onClick={() => {
                        const newSelTags = [...selectedTags]
                        newSelTags.splice(index, 1)
                        setSelectedTags(newSelTags)
                        set(initialValues, `tags.${tag.key}`, undefined)
                        onUpdate?.(initialValues)
                      }}
                      size={ButtonSize.SMALL}
                      variation={ButtonVariation.LINK}
                    />
                  </Layout.Horizontal>
                </Layout.Horizontal>
              ))}
              <Button
                intent="primary"
                icon="add"
                className={css.addBtn}
                iconProps={{ size: 12, margin: { right: 8 } }}
                onClick={() => {
                  const newTagPair: SelectedTagsType = { key: '', value: '' }
                  setSelectedTags(selTags => [...selTags, newTagPair])
                }}
                size={ButtonSize.SMALL}
                variation={ButtonVariation.LINK}
              >
                {getString('tagLabel')}
              </Button>
            </MultiTypeFieldSelector>
          </div>
        )}
        {getMultiTypeFromValue(template?.credentialsRef) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
            <MultiTypeSecretInput
              name={`${path}.credentialsRef`}
              type={getMultiTypeSecretInputType(initialValues.serviceType)}
              label={getString('cd.steps.common.specifyCredentials')}
              expressions={expressions}
            />
          </div>
        )}
      </Layout.Vertical>
    )
  }

export const SshWinRmAzureInfrastructureSpecInputForm = React.memo(SshWinRmAzureInfrastructureSpecInputFormNew)
